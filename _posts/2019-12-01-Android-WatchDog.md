---
layout:     post
title:      Android WatchDog
subtitle:   看门狗
date:       2019-12-01
author:     LXG
header-img: img/post-bg-kuaidi.jpg
catalog: true
tags:
    - watchdog
---

[Android WatchDog-Gityuan](http://gityuan.com/2016/06/21/watchdog/)

[Watchdog原理和问题分析-简书](https://www.jianshu.com/p/f2713f371589)

## WatchDog

[android_watchdog](/images/watchdog/android_watchdog.webp)

## 初始化

[watchdog_uml](/images/watchdog/watchdog_uml.png)

### startOtherServices

```java

    private void startOtherServices() {

        ---------------------------------------------------------

            traceBeginAndSlog("InitWatchdog");
            final Watchdog watchdog = Watchdog.getInstance();
            watchdog.init(context, mActivityManagerService);

        ---------------------------------------------------------

        mActivityManagerService.systemReady(new Runnable() {
            @Override
            public void run() {
                Slog.i(TAG, "Making services ready");

                ------------------------------------------------------------------

                Watchdog.getInstance().start();

                // It is now okay to let the various system services start their
                // third party code...
                Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);

            }

    }

```

### WatchDog

```java

public class Watchdog extends Thread {

    static final String TAG = "Watchdog";
    static final String BINDERTRACKER = "binderTracker";

    // Set this to true to use debug default values.
    static final boolean DB = false;

    // Set this to true to have the watchdog record kernel thread stacks when it fires
    static final boolean RECORD_KERNEL_THREADS = true;

    static final long DEFAULT_TIMEOUT = DB ? 10*1000 : 60*1000;
    static final long CHECK_INTERVAL = DEFAULT_TIMEOUT / 2;


    static Watchdog sWatchdog;

    // Looper Checker，用于检查线程的消息队列是否长时间处于工作状态。Watchdog自身的消息队列，ui, Io, display这些全局的消息队列都是被检查的对象
    /* This handler will be used to post message back onto the main thread */
    final ArrayList<HandlerChecker> mHandlerCheckers = new ArrayList<>();


    // Monitor Checker，用于检查是Monitor对象可能发生的死锁, AMS, PKMS, WMS等核心的系统服务都是Monitor对象。
    final HandlerChecker mMonitorChecker;


    public static Watchdog getInstance() {
        if (sWatchdog == null) {
            sWatchdog = new Watchdog();
        }

        return sWatchdog;
    }

    private Watchdog() {
        super("watchdog");
        // Initialize handler checkers for each common thread we want to check.  Note
        // that we are not currently checking the background thread, since it can
        // potentially hold longer running operations with no guarantees about the timeliness
        // of operations there.

        // 将前台线程加入队列
        // The shared foreground thread is the main checker.  It is where we
        // will also dispatch monitor checks and do other work.
        mMonitorChecker = new HandlerChecker(FgThread.getHandler(),
                "foreground thread", DEFAULT_TIMEOUT);
        mHandlerCheckers.add(mMonitorChecker);

        // 将主线程加入队列
        // Add checker for main thread.  We only do a quick check since there
        // can be UI running on the thread.
        mHandlerCheckers.add(new HandlerChecker(new Handler(Looper.getMainLooper()),
                "main thread", DEFAULT_TIMEOUT));

        // 将ui线程加入队列
        // Add checker for shared UI thread.
        mHandlerCheckers.add(new HandlerChecker(UiThread.getHandler(),
                "ui thread", DEFAULT_TIMEOUT));

        // 将i/o线程加入队列
        // And also check IO thread.
        mHandlerCheckers.add(new HandlerChecker(IoThread.getHandler(),
                "i/o thread", DEFAULT_TIMEOUT));

        // 将display线程加入队列
        // And the display thread.
        mHandlerCheckers.add(new HandlerChecker(DisplayThread.getHandler(),
                "display thread", DEFAULT_TIMEOUT));

        // 监听Binder线程
        // Initialize monitor for Binder threads.
        addMonitor(new BinderThreadMonitor());
    }

    public void addMonitor(Monitor monitor) {
        synchronized (this) {
            if (isAlive()) {
                throw new RuntimeException("Monitors can't be added once the Watchdog is running");
            }
            mMonitorChecker.addMonitor(monitor);
        }
    }


    public void addThread(Handler thread) {
        addThread(thread, DEFAULT_TIMEOUT);
    }

    public void addThread(Handler thread, long timeoutMillis) {
        synchronized (this) {
            if (isAlive()) {
                throw new RuntimeException("Threads can't be added once the Watchdog is running");
            }
            final String name = thread.getLooper().getThread().getName();
            mHandlerCheckers.add(new HandlerChecker(thread, name, timeoutMillis));
        }
    }


    public void init(Context context, ActivityManagerService activity) {
        mResolver = context.getContentResolver();
        mActivity = activity;

        // 监听重启广播
        context.registerReceiver(new RebootRequestReceiver(),
                new IntentFilter(Intent.ACTION_REBOOT),
                android.Manifest.permission.REBOOT, null);
    }


    public interface Monitor {
        void monitor();
    }


    /**
     * Used for checking status of handle threads and scheduling monitor callbacks.
     */
    public final class HandlerChecker implements Runnable {

        @Override
        public void run() {

        }

    }

    /**
     * Monitor for checking the availability of binder threads. The monitor will block until
     * there is a binder thread available to process in coming IPCs to make sure other processes
     * can still communicate with the service.
     */
    private static final class BinderThreadMonitor implements Watchdog.Monitor {
        @Override
        public void monitor() {
            Binder.blockUntilThreadAvailable();
        }
    }

}

```

### UI Thread

```java

public class ServiceThread extends HandlerThread {

}

public final class UiThread extends ServiceThread {
    private static UiThread sInstance;
    private static Handler sHandler;

    private UiThread() {
        super("android.ui", Process.THREAD_PRIORITY_FOREGROUND, false /*allowIo*/);
        // Make sure UiThread is in the fg stune boost group
        Process.setThreadGroup(Process.myTid(), Process.THREAD_GROUP_TOP_APP);
    }

    private static void ensureThreadLocked() {
        if (sInstance == null) {
            sInstance = new UiThread();
            sInstance.start();
            sInstance.getLooper().setTraceTag(Trace.TRACE_TAG_ACTIVITY_MANAGER);
            sHandler = new Handler(sInstance.getLooper());
        }
    }

    public static UiThread get() {
        synchronized (UiThread.class) {
            ensureThreadLocked();
            return sInstance;
        }
    }

    public static Handler getHandler() {
        synchronized (UiThread.class) {
            ensureThreadLocked();
            return sHandler;
        }
    }
}

```

## 添加监听

### Monitor Checker

```java

    final HandlerChecker mMonitorChecker;

```

用于检查是Monitor对象可能发生的死锁, AMS, PKMS, WMS等核心的系统服务都是Monitor对象,
预警我们不能长时间持有核心系统服务的对象锁，否则会阻塞很多函数的运行;

### Looper Checker

```java

    final ArrayList<HandlerChecker> mHandlerCheckers = new ArrayList<>();

```

用于检查线程的消息队列是否长时间处于工作状态。Watchdog自身的消息队列，ui, Io, display这些全局的消息队列都是被检查的对象,
此外，一些重要的线程的消息队列，也会加入到Looper Checker中，譬如AMS, PKMS，这些是在对应的对象初始化时加入的

### AMS

```java

    public ActivityManagerService(Context systemContext) {

        // 检查 AMS 对象锁
        Watchdog.getInstance().addMonitor(this);

        // 重要线程消息队列
        Watchdog.getInstance().addThread(mHandler);

    }

```

