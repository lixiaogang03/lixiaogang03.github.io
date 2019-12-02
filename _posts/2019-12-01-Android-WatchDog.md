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

[System Watchdog原理简洁梳理-简书](https://www.jianshu.com/p/3677a8a4d41a)

## WatchDog

![android_watchdog](/images/watchdog/android_watchdog.webp)

## 初始化

![watchdog_uml](/images/watchdog/watchdog_uml.png)

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

用于检查是Monitor对象可能发生的死锁, AMS, PKMS, WMS等核心的系统服务都是Monitor对象。

预警我们不能长时间持有核心系统服务的对象锁，否则会阻塞很多函数的运行;

### Looper Checker

```java

    final ArrayList<HandlerChecker> mHandlerCheckers = new ArrayList<>();

```

用于检查线程的消息队列是否长时间处于工作状态。Watchdog自身的消息队列，ui, Io, display这些全局的消息队列都是被检查的对象,
此外，一些重要的线程的消息队列，也会加入到Looper Checker中，譬如AMS, PKMS，这些是在对应的对象初始化时加入的

预警我们不能长时间的霸占消息队列，否则其他消息将得不到处理

### AMS

```java

public final class ActivityManagerService extends ActivityManagerNative
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    public ActivityManagerService(Context systemContext) {

        // 检查 AMS 对象锁
        Watchdog.getInstance().addMonitor(this);

        // 重要线程消息队列
        Watchdog.getInstance().addThread(mHandler);

    }

    public void monitor() {
        synchronized (this) { }
    }

}

```

![watchdog_add](/images/watchdog/watchdog_add.png)

## 核心原理

在添加Checker之后，该如何使用这些Checker呢？因为Watchdog继承Thread，直接看run方法

```java

    @Override
    public void run() {
        boolean waitedHalf = false;
        while (true) {
            final ArrayList<HandlerChecker> blockedCheckers;
            final String subject;
            final boolean allowRestart;
            int debuggerWasConnected = 0;
            synchronized (this) {
                long timeout = CHECK_INTERVAL;

                //１、处理所有的HandlerChecker
                // Make sure we (re)spin the checkers that have become idle within
                // this wait-and-check interval
                for (int i=0; i<mHandlerCheckers.size(); i++) {
                    HandlerChecker hc = mHandlerCheckers.get(i);
                    hc.scheduleCheckLocked();
                }

                if (debuggerWasConnected > 0) {
                    debuggerWasConnected--;
                }

                // 2. 开始定期检查
                // NOTE: We use uptimeMillis() here because we do not want to increment the time we
                // wait while asleep. If the device is asleep then the thing that we are waiting
                // to timeout on is asleep as well and won't have a chance to run, causing a false
                // positive on when to kill things.
                long start = SystemClock.uptimeMillis();
                while (timeout > 0) {
                    if (Debug.isDebuggerConnected()) {
                        debuggerWasConnected = 2;
                    }
                    try {
                        wait(timeout);
                    } catch (InterruptedException e) {
                        Log.wtf(TAG, e);
                    }
                    if (Debug.isDebuggerConnected()) {
                        debuggerWasConnected = 2;
                    }
                    timeout = CHECK_INTERVAL - (SystemClock.uptimeMillis() - start);
                }

                // ３. 获取状态，状态有如下三种，
                final int waitState = evaluateCheckerCompletionLocked();
                if (waitState == COMPLETED) {
                    // The monitors have returned; reset
                    waitedHalf = false;
                    continue;
                } else if (waitState == WAITING) {
                    // still waiting but within their configured intervals; back off and recheck
                    continue;
                } else if (waitState == WAITED_HALF) {
                    if (!waitedHalf) {
                        // We've waited half the deadlock-detection interval.  Pull a stack
                        // trace and wait another half.
                        ArrayList<Integer> pids = new ArrayList<Integer>();
                        pids.add(Process.myPid());
                        ActivityManagerService.dumpStackTraces(true, pids, null, null,
                                NATIVE_STACKS_OF_INTEREST);
                        waitedHalf = true;
                    }
                    continue;
                }

                // 走到这里，说明存在超时的HandlerChecker
                // something is overdue!
                blockedCheckers = getBlockedCheckersLocked();
                subject = describeCheckersLocked(blockedCheckers);
                allowRestart = mAllowRestart;
            }

            // Event log打印发生了watchdog
            // If we got here, that means that the system is most likely hung.
            // First collect stack traces from all threads of the system process.
            // Then kill this process so that the system will restart.
            EventLog.writeEvent(EventLogTags.WATCHDOG, subject);

            ArrayList<Integer> pids = new ArrayList<Integer>();
            pids.add(Process.myPid());

            //Add processes to <firstPids> which are communicating with <app.pid>.
            boolean enableTrackBinder = SystemProperties.getBoolean("persist.sys.enableTrackBinder",false);
            if(enableTrackBinder){
               int zygotePid = Process.myPpid();
               Log.i(BINDERTRACKER, "zygotePid: "+ zygotePid);

               BinderTracker binderTracker = new BinderTracker(Process.myPid());
               ArrayList<Integer> binderPids = null;
               binderPids = binderTracker.getBinderTransaction();
               if (binderPids != null && binderPids.size() != 0) {
                   int binderPidsSize = binderPids.size();
                   for (int mPerBinderPids = 0; mPerBinderPids < binderPidsSize; mPerBinderPids++) {
                        if (!pids.contains(binderPids.get(mPerBinderPids))) {
                           try {
                              int parentPid=Process.getParentPid(binderPids.get(mPerBinderPids));
                              if (zygotePid == parentPid){
                                 pids.add(binderPids.get(mPerBinderPids));
                              } else {
                                 Log.i(BINDERTRACKER, "binder communication with native process : "+ binderPids.get(mPerBinderPids));
                              }
                           } finally {

                           }
                        }
                   }
               }
            }

            //开始dumpStackTraces，包含pids中的进程和getInterestingNativePids中的进程
            if (mPhonePid > 0) pids.add(mPhonePid);
            // Pass !waitedHalf so that just in case we somehow wind up here without having
            // dumped the halfway stacks, we properly re-initialize the trace file.
            final File stack = ActivityManagerService.dumpStackTraces(
                    !waitedHalf, pids, null, null, NATIVE_STACKS_OF_INTEREST);

            // Give some extra time to make sure the stack traces get written.
            // The system's been hanging for a minute, another second or two won't hurt much.
            SystemClock.sleep(2000);

            // 开始dumpKernelStackTraces
            // Pull our own kernel thread stacks as well if we're configured for that
            if (RECORD_KERNEL_THREADS) {
                dumpKernelStackTraces();
            }

            String tracesPath = SystemProperties.get("dalvik.vm.stack-trace-file", null);
            String traceFileNameAmendment = "_SystemServer_WDT" + mTraceDateFormat.format(new Date());

            if (tracesPath != null && tracesPath.length() != 0) {
                File traceRenameFile = new File(tracesPath);
                String newTracesPath;
                int lpos = tracesPath.lastIndexOf (".");
                if (-1 != lpos)
                    newTracesPath = tracesPath.substring (0, lpos) + traceFileNameAmendment + tracesPath.substring (lpos);
                else
                    newTracesPath = tracesPath + traceFileNameAmendment;
                traceRenameFile.renameTo(new File(newTracesPath));
                tracesPath = newTracesPath;
            }

            final File newFd = new File(tracesPath);

            // Try to add the error to the dropbox, but assuming that the ActivityManager
            // itself may be deadlocked.  (which has happened, causing this statement to
            // deadlock and the watchdog as a whole to be ineffective)
            Thread dropboxThread = new Thread("watchdogWriteToDropbox") {
                    public void run() {
                        mActivity.addErrorToDropBox(
                                "watchdog", null, "system_server", null, null,
                                subject, null, newFd, null);
                    }
                };
            dropboxThread.start();
            try {
                dropboxThread.join(2000);  // wait up to 2 seconds for it to return.
            } catch (InterruptedException ignored) {}


            // At times, when user space watchdog traces don't give an indication on
            // which component held a lock, because of which other threads are blocked,
            // (thereby causing Watchdog), crash the device to analyze RAM dumps
            boolean crashOnWatchdog = SystemProperties
                                        .getBoolean("persist.sys.crashOnWatchdog", false);
            if (crashOnWatchdog) {
                // Trigger the kernel to dump all blocked threads, and backtraces
                // on all CPUs to the kernel log
                Slog.e(TAG, "Triggering SysRq for system_server watchdog");
                doSysRq('w');
                doSysRq('l');

                // wait until the above blocked threads be dumped into kernel log
                SystemClock.sleep(3000);

                // now try to crash the target
                doSysRq('c');
            }

            IActivityController controller;
            synchronized (this) {
                controller = mController;
            }
            if (controller != null) {
                Slog.i(TAG, "Reporting stuck state to activity controller");
                try {
                    Binder.setDumpDisabled("Service dumps disabled due to hung system process.");
                    // 1 = keep waiting, -1 = kill system
                    int res = controller.systemNotResponding(subject);
                    if (res >= 0) {
                        Slog.i(TAG, "Activity controller requested to coninue to wait");
                        waitedHalf = false;
                        continue;
                    }
                } catch (RemoteException e) {
                }
            }

            // Only kill the process if the debugger is not attached.
            if (Debug.isDebuggerConnected()) {
                debuggerWasConnected = 2;
            }
            if (debuggerWasConnected >= 2) {
                Slog.w(TAG, "Debugger connected: Watchdog is *not* killing the system process");
            } else if (debuggerWasConnected > 0) {
                Slog.w(TAG, "Debugger was connected: Watchdog is *not* killing the system process");
            } else if (!allowRestart) {
                Slog.w(TAG, "Restart not allowed: Watchdog is *not* killing the system process");
            } else {
                Slog.w(TAG, "*** WATCHDOG KILLING SYSTEM PROCESS: " + subject);
                for (int i=0; i<blockedCheckers.size(); i++) {
                    Slog.w(TAG, blockedCheckers.get(i).getName() + " stack trace:");
                    StackTraceElement[] stackTrace
                            = blockedCheckers.get(i).getThread().getStackTrace();
                    for (StackTraceElement element: stackTrace) {
                        Slog.w(TAG, "    at " + element);
                    }
                }
                Slog.w(TAG, "*** GOODBYE!");
                // 最终杀死System进程
                Process.killProcess(Process.myPid());
                System.exit(10);
            }

            waitedHalf = false;
        }
    }


```



