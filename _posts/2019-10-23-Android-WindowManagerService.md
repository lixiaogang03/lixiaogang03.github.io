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

## Android GUI history

![android_gui_history](/images/wms/android_gui_history.png)

## WMS in GUI system

![android_graphics](/images/wms/android_graphics.png)

## AMS/WMS/IMS

![wms_ams_ims](/images/wms/wms_ams_ims.png)

## Window

Android系统中的窗口是屏幕上的一块用于绘制各种UI元素的一个矩形区域。窗口的概念是独占有一个Surfaces实例的显示区域：Dialog、Toast、StatusBar、NavigationBar、WallPaper、Activity

## Surface

Surface是一块画布，应用可以通过Canvas或者OpenGL在上面作画，然后通过SurfaceFlinger将多块Surface的内容按照特定顺序(Z-order)进行合成，然后输出到FrameBuffer

![surface](/images/wms/surface.png)

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

![wms_start](/images/wms/wms_start.png)

## 数据结构

### WindowManagerPolicy

```java

    final WindowManagerPolicy mPolicy = new PhoneWindowManager();

```

WindowManagerPolicy是窗口管理策略的接口类，用来定义一个窗口策略所要遵循的通用规范，并提供了WindowManager所有的特定的UI行为。
它的具体实现类为PhoneWindowManager，这个实现类在WMS创建时被创建。WMP允许定制窗口层级和特殊窗口类型以及关键的调度和布局。

### Session

```java

    /**
     * All currently active sessions with clients.
     */
    final ArraySet<Session> mSessions = new ArraySet<>();

```

Session用于进程间通信，其他的应用程序进程想要和WMS进程进行通信就需要经过Session，并且每个应用程序进程都会对应一个Session，WMS保存这些Session用来记录所有向WMS提出窗口管理服务的客户端

### WindowState

```java

    /**
     * Mapping from an IWindow IBinder to the server's Window object.
     * This is also used as the lock for all of our state.
     * NOTE: Never call into methods that lock ActivityManagerService while holding this object.
     */
    final HashMap<IBinder, WindowState> mWindowMap = new HashMap<>();

    /**
     * Windows that are being resized.  Used so we can tell the client about
     * the resize after closing the transaction in which we resized the
     * underlying surface.
     */
    final ArrayList<WindowState> mResizingWindows = new ArrayList<>();


```

mWindowMap就是用来保存WMS中各种窗口的集合, WindowState用于保存窗口的信息，在WMS中它用来描述一个窗口

mResizingWindows是用来存储正在调整大小的窗口的列表

### WindowToken

```java

/**
 * Container of a set of related windows in the window manager.  Often this
 * is an AppWindowToken, which is the handle for an Activity that it uses
 * to display windows.  For nested windows, there is a WindowToken created for
 * the parent window to manage its children.
 */
class WindowToken {

    // The window manager!
    final WindowManagerService service;

    // The actual token.
    final IBinder token;

    // The type of window this token is for, as per WindowManager.LayoutParams.
    final int windowType;

    // If this is an AppWindowToken, this is non-null.
    AppWindowToken appWindowToken;

}


/**
 * Version of WindowToken that is specifically for a particular application (or
 * really activity) that is displaying windows.
 */
class AppWindowToken extends WindowToken {

    // Non-null only for application tokens.
    final IApplicationToken appToken;

}

```

WindowToken主要有两个作用：

* 可以理解为窗口令牌，当应用程序想要向WMS申请新创建一个窗口，则需要向WMS出示有效的WindowToken。AppWindowToken作为WindowToken的子类，主要用来描述应用程序的WindowToken结构，
应用程序中每个Activity都对应一个AppWindowToken

* WindowToken会将相同组件（比如Acitivity）的窗口（WindowState）集合在一起，方便管理

```java

    /**
     * Mapping from a token IBinder to a WindowToken object.
     */
    final HashMap<IBinder, WindowToken> mTokenMap = new HashMap<>();

    /**
     * List of window tokens that have finished starting their application,
     * and now need to have the policy remove their windows.
     */
    final ArrayList<AppWindowToken> mFinishedStarting = new ArrayList<>();

```

### WindowAnimator

```java

    final WindowAnimator mAnimator;

```

它是所有窗口动画的总管，在Choreographer驱动下，逐个渲染所有动画

### Handler

```java

    final H mH = new H();

```
用于将任务加入到主线程的消息队列中，这样代码逻辑就会在主线程(system_server)中执行

### InputManagerService

```java

    final InputManagerService mInputManager;

```

InputManagerService(IMS)会对触摸事件进行处理，它会寻找一个最合适的窗口来处理触摸反馈信息，WMS是窗口的管理者，是输入系统的中转站


### Choreographer

```java

    final Choreographer mChoreographer = Choreographer.getInstance();

```

Choreographer 的意思是编舞者。它拥有从显示系统中获取VSYNC同步事件的能力，从而可以在合适的时机通知渲染动作，避免在渲染过程中因为发生屏幕重绘而导致的画面撕裂。
WMS使用Choreographer负责驱动所有的窗口动画、屏幕旋转动画、墙纸动画的渲染

### mDisplayContents

```java

    /** All DisplayContents in the world, kept here */
    SparseArray<DisplayContent> mDisplayContents = new SparseArray<>(2);

```

Android支持多屏幕，一个DisplayContent描述了一块可以绘制窗口的屏幕。DisplayContent的管理是由DisplayManagerService完成的

## startActivity

![start_activity](/images/wms/start_activity.png)

![start_activity_2](/images/wms/start_activity_2.png)

## addWindow

![add_window](/images/wms/add_window.webp)
















