---
layout:     post
title:      Android WindowManagerService
subtitle:   WMS
date:       2019-10-23
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - wms
---

[WMS-刘望舒的博客](http://liuwangshu.cn/framework/wms/1-wms-produce.html)

## Window

Android系统中的窗口是屏幕上的一块用于绘制各种UI元素的一个矩形区域。窗口的概念是独占有一个Surfaces实例的显示区域：Dialog、Toast、StatusBar、NavigationBar、WallPaper、Activity

## Surface

Surface是一块画布，应用可以通过Canvas或者OpenGL在上面作画，然后通过SurfaceFlinger将多块Surface的内容按照特定顺序(Z-order)进行合成，然后输出到FrameBuffer

## WMS

WMS为所有窗口分配Surface, 掌管Surface的显示顺序(Z-order)以及位置尺寸，控制窗口动画，中转输入内容

![android_wms](/images/wms/android_wms.png)

## 启动

### SystemServer

运行在**system_server**线程

```java

public final class SystemServer {

    public static void main(String[] args) {
        new SystemServer().run();
    }


    private void run() {

            startOtherServices();

    }

    private void startOtherServices() {

        --------------------------------------------------------------------

            traceBeginAndSlog("InitWatchdog");
            final Watchdog watchdog = Watchdog.getInstance();
            watchdog.init(context, mActivityManagerService);
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);

            traceBeginAndSlog("StartInputManagerService");
            inputManager = new InputManagerService(context);
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);

            traceBeginAndSlog("StartWindowManagerService");
            wm = WindowManagerService.main(context, inputManager,
                    mFactoryTestMode != FactoryTest.FACTORY_TEST_LOW_LEVEL,
                    !mFirstBoot, mOnlyCore);
            ServiceManager.addService(Context.WINDOW_SERVICE, wm);
            ServiceManager.addService(Context.INPUT_SERVICE, inputManager);
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);

        -----------------------------------------------------------------------


        try {
            wm.displayReady();
        } catch (Throwable e) {
            reportWtf("making display ready", e);
        }

    }

}

```

### WindowManagerService

运行在**android.display**线程

```java

public class WindowManagerService extends IWindowManager.Stub
        implements Watchdog.Monitor, WindowManagerPolicy.WindowManagerFuncs {

    public static WindowManagerService main(final Context context,
            final InputManagerService im,
            final boolean haveInputMethods, final boolean showBootMsgs,
            final boolean onlyCore) {
        final WindowManagerService[] holder = new WindowManagerService[1];
        DisplayThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {

                // 运行在android.display线程，system_server线程进入等待状态

                holder[0] = new WindowManagerService(context, im,
                        haveInputMethods, showBootMsgs, onlyCore);
            }
        }, 0);
        return holder[0];
    }


    private WindowManagerService(Context context, InputManagerService inputManager,
            boolean haveInputMethods, boolean showBootMsgs, boolean onlyCore) {

        mInputManager = inputManager; // Must be before createDisplayContentLocked.

        mDisplayManagerInternal = LocalServices.getService(DisplayManagerInternal.class);
        mDisplaySettings = new DisplaySettings();
        mDisplaySettings.readSettingsLocked();

        mWallpaperControllerLocked = new WallpaperController(this);
        mWindowPlacerLocked = new WindowSurfacePlacer(this);
        mLayersController = new WindowLayersController(this);

        LocalServices.addService(WindowManagerPolicy.class, mPolicy);

        mDisplayManager = (DisplayManager)context.getSystemService(Context.DISPLAY_SERVICE);
        mDisplays = mDisplayManager.getDisplays(); // 每个显示设备都有一个Display实例
        for (Display display : mDisplays) {
            createDisplayContentLocked(display);   // 将Display封装成DisplayContent，DisplayContent用来描述一快屏幕
        }

        mSettingsObserver = new SettingsObserver();

        mAnimator = new WindowAnimator(this);      // 管理所有的窗口动画

        LocalServices.addService(WindowManagerInternal.class, new LocalService());
        initPolicy();                              // 定义一个窗口策略所要遵循的通用规范

        // Add ourself to the Watchdog monitors.
        // 添加到Watchdog中，Watchdog用来监控系统的一些关键服务的运行状况，
        // 这些被监控的服务都会实现Watchdog.Monitor接口。Watchdog每分钟都会对被监控的系统服务进行检查，
        // 如果被监控的系统服务出现了死锁，则会杀死Watchdog所在的进程，也就是SystemServer进程

        Watchdog.getInstance().addMonitor(this);

    }

    private void initPolicy() {
        UiThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {

                // 运行在android.ui线程，android.display线程等待

                WindowManagerPolicyThread.set(Thread.currentThread(), Looper.myLooper());

                mPolicy.init(mContext, WindowManagerService.this, WindowManagerService.this);
            }
        }, 0);
    }

}

```

### PhoneWindowManager

运行在**android.ui**线程

```java

public class PhoneWindowManager implements WindowManagerPolicy {

    @Override
    public void init(Context context, IWindowManager windowManager,
            WindowManagerFuncs windowManagerFuncs) {

    }

}

```

![wms_start](images/wms/wms_start.png)



