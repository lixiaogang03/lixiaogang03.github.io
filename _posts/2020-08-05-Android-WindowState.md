---
layout:     post
title:      Android WindowState
subtitle:   WindowState
date:       2020-08-05
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - wms
---

[Android窗口管理分析-简书](https://www.jianshu.com/p/e4b19fc36a0e)

## APP、WMS、SurfaceFlinger

![window_system](/images/android/wms/window_system.webp)

## 窗口组织形式

![window_type](/images/android/wms/window_type.webp)

## 窗口数据结构

![window_state](/images/android/wms/window_state.png)

## 窗口的分组

```java

public interface WindowManager extends ViewManager {

    public static class LayoutParams extends ViewGroup.LayoutParams implements Parcelable {

        // 窗口类型
        public int type;

        //-------------------------------应用窗口-------------------------------

        // 开始应用程序窗口
        public static final int FIRST_APPLICATION_WINDOW = 1;

        // 所有程序窗口的base窗口，其他应用程序窗口都显示在它上面
        public static final int TYPE_BASE_APPLICATION   = 1;

        // 普通应用程序窗口，token必须设置为Activity的token
        public static final int TYPE_APPLICATION        = 2;

        // 应用程序启动时所显示的窗口
        public static final int TYPE_APPLICATION_STARTING = 3;

        /**
         * Window type: a variation on TYPE_APPLICATION that ensures the window
         * manager will wait for this window to be drawn before the app is shown.
         * In multiuser systems shows only on the owning user's window.
         */
        public static final int TYPE_DRAWN_APPLICATION = 4;

        // 结束应用程序窗口
        public static final int LAST_APPLICATION_WINDOW = 99;

        //--------------------------------字窗口------------------------------

        // SubWindows子窗口，子窗口的Z序和坐标空间都依赖于他们的宿主窗口
        public static final int FIRST_SUB_WINDOW = 1000;

        // 面板窗口，显示于宿主窗口的上层
        public static final int TYPE_APPLICATION_PANEL = FIRST_SUB_WINDOW;

        // 媒体窗口(例如视频)，显示于宿主窗口下层
        public static final int TYPE_APPLICATION_MEDIA = FIRST_SUB_WINDOW + 1;

        // 应用程序窗口的子面板，显示于所有面板窗口的上层
        public static final int TYPE_APPLICATION_SUB_PANEL = FIRST_SUB_WINDOW + 2;

        // 对话框，类似于面板窗口，绘制类似于顶层窗口，而不是宿主的子窗口
        public static final int TYPE_APPLICATION_ATTACHED_DIALOG = FIRST_SUB_WINDOW + 3;

        // 媒体信息，显示在媒体层和程序窗口之间，需要实现半透明效果
        public static final int TYPE_APPLICATION_MEDIA_OVERLAY  = FIRST_SUB_WINDOW + 4;

        /**
         * Window type: a above sub-panel on top of an application window and it's
         * sub-panel windows. These windows are displayed on top of their attached window
         * and any {@link #TYPE_APPLICATION_SUB_PANEL} panels.
         * @hide
         */
        public static final int TYPE_APPLICATION_ABOVE_SUB_PANEL = FIRST_SUB_WINDOW + 5;

        // 结束字窗口
        public static final int LAST_SUB_WINDOW = 1999;

        //--------------------------------系统窗口------------------------------

        // 系统窗口
        public static final int FIRST_SYSTEM_WINDOW     = 2000;

        // 状态栏
        public static final int TYPE_STATUS_BAR         = FIRST_SYSTEM_WINDOW;

        // 搜索栏
        public static final int TYPE_SEARCH_BAR         = FIRST_SYSTEM_WINDOW+1;

        /**
         * Window type: phone.  These are non-application windows providing
         * user interaction with the phone (in particular incoming calls).
         * These windows are normally placed above all applications, but behind
         * the status bar.
         * In multiuser systems shows on all users' windows.
         * @deprecated for non-system apps. Use {@link #TYPE_APPLICATION_OVERLAY} instead.
         */
        @Deprecated
        public static final int TYPE_PHONE              = FIRST_SYSTEM_WINDOW+2;

        /**
         * Window type: system window, such as low power alert. These windows
         * are always on top of application windows.
         * In multiuser systems shows only on the owning user's window.
         * @deprecated for non-system apps. Use {@link #TYPE_APPLICATION_OVERLAY} instead.
         */
        @Deprecated
        public static final int TYPE_SYSTEM_ALERT       = FIRST_SYSTEM_WINDOW+3;

        // 锁屏
        public static final int TYPE_KEYGUARD           = FIRST_SYSTEM_WINDOW+4;

        /**
         * Window type: transient notifications.
         * In multiuser systems shows only on the owning user's window.
         * @deprecated for non-system apps. Use {@link #TYPE_APPLICATION_OVERLAY} instead.
         */
        @Deprecated
        public static final int TYPE_TOAST              = FIRST_SYSTEM_WINDOW+5;

        /**
         * Window type: system overlay windows, which need to be displayed
         * on top of everything else.  These windows must not take input
         * focus, or they will interfere with the keyguard.
         * In multiuser systems shows only on the owning user's window.
         * @deprecated for non-system apps. Use {@link #TYPE_APPLICATION_OVERLAY} instead.
         */
        @Deprecated
        public static final int TYPE_SYSTEM_OVERLAY     = FIRST_SYSTEM_WINDOW+6;


        /**
         * Window type: priority phone UI, which needs to be displayed even if
         * the keyguard is active.  These windows must not take input
         * focus, or they will interfere with the keyguard.
         * In multiuser systems shows on all users' windows.
         * @deprecated for non-system apps. Use {@link #TYPE_APPLICATION_OVERLAY} instead.
         */
        @Deprecated
        public static final int TYPE_PRIORITY_PHONE     = FIRST_SYSTEM_WINDOW+7;

        /**
         * Window type: panel that slides out from the status bar
         * In multiuser systems shows on all users' windows.
         */
        public static final int TYPE_SYSTEM_DIALOG      = FIRST_SYSTEM_WINDOW+8;

        /**
         * Window type: dialogs that the keyguard shows
         * In multiuser systems shows on all users' windows.
         */
        public static final int TYPE_KEYGUARD_DIALOG    = FIRST_SYSTEM_WINDOW+9;

        /**
         * Window type: internal system error windows, appear on top of
         * everything they can.
         * In multiuser systems shows only on the owning user's window.
         * @deprecated for non-system apps. Use {@link #TYPE_APPLICATION_OVERLAY} instead.
         */
        @Deprecated
        public static final int TYPE_SYSTEM_ERROR       = FIRST_SYSTEM_WINDOW+10;

        /**
         * Window type: internal input methods windows, which appear above
         * the normal UI.  Application windows may be resized or panned to keep
         * the input focus visible while this window is displayed.
         * In multiuser systems shows only on the owning user's window.
         */
        public static final int TYPE_INPUT_METHOD       = FIRST_SYSTEM_WINDOW+11;

        /**
         * Window type: internal input methods dialog windows, which appear above
         * the current input method window.
         * In multiuser systems shows only on the owning user's window.
         */
        public static final int TYPE_INPUT_METHOD_DIALOG= FIRST_SYSTEM_WINDOW+12;

        /**
         * Window type: wallpaper window, placed behind any window that wants
         * to sit on top of the wallpaper.
         * In multiuser systems shows only on the owning user's window.
         */
        public static final int TYPE_WALLPAPER          = FIRST_SYSTEM_WINDOW+13;

        --------------省略--------------------

        /**
         * End of types of system windows.
         */
        public static final int LAST_SYSTEM_WINDOW      = 2999;

        /**
         * @hide
         * Used internally when there is no suitable type available.
         */
        public static final int INVALID_WINDOW_TYPE = -1;


        /**
         * Identifier for this window.  This will usually be filled in for
         * you.
         */
        public IBinder token = null;

        public static boolean isSystemAlertWindowType(int type) {
            switch (type) {
                case TYPE_PHONE:
                case TYPE_PRIORITY_PHONE:
                case TYPE_SYSTEM_ALERT:
                case TYPE_SYSTEM_ERROR:
                case TYPE_SYSTEM_OVERLAY:
                case TYPE_APPLICATION_OVERLAY:
                    return true;
            }
            return false;
        }

    }

}

```

### WindowContainer

```java

class WindowContainer<E extends WindowContainer> implements Comparable<WindowContainer> {

    /**
     * The parent of this window container.
     * For removing or setting new parent {@link #setParent} should be used, because it also
     * performs configuration updates based on new parent's settings.
     */
    private WindowContainer mParent = null;

    // List of children for this window container. List is in z-order as the children appear on
    // screen with the top-most window container at the tail of the list.
    protected final WindowList<E> mChildren = new WindowList<E>();

}

```

## 窗口树

![window_tree](/images/android/wms/window_tree.webp)

### WindowState

```java

class WindowState extends WindowContainer<WindowState> implements WindowManagerPolicy.WindowState {
    static final String TAG = TAG_WITH_CLASS_NAME ? "WindowState" : TAG_WM;

    // 当前WindowState对应IWindow窗口代理
    final IWindow mClient;

    WindowToken mToken;
    // The same object as mToken if this is an app window and null for non-app windows.
    AppWindowToken mAppToken;

    // mAttrs.flags is tested in animation without being locked. If the bits tested are ever
    // modified they will need to be locked.
    final WindowManager.LayoutParams mAttrs = new WindowManager.LayoutParams();

    // 标志窗口的主次序，面向的是一个窗口组
    final int mBaseLayer;

    // 面向单独窗口，要来标志一个窗口在一组窗口中的位置
    final int mSubLayer;

    // 最终Z次序的赋值
    int mLayer;

}

```

### WindowToken

```java

class WindowToken extends WindowContainer<WindowState> {
    private static final String TAG = TAG_WITH_CLASS_NAME ? "WindowToken" : TAG_WM;

    // The actual token.
    final IBinder token;

    // The type of window this token is for, as per WindowManager.LayoutParams.
    final int windowType;

}

```

## 应用窗口

android屏幕边界划分，屏幕有overscan区域、状态栏、导航栏、输入法，PhoneWindowManager定义了这些区域代表了屏幕上不同的组合

![window_size](/images/android/wms/window_size.png)

### PhoneWindowManager

```java

public final class SystemServer {
    private static final String TAG = "SystemServer";

    private void startOtherServices() {

            wm = WindowManagerService.main(context, inputManager,
                    mFactoryTestMode != FactoryTest.FACTORY_TEST_LOW_LEVEL,
                    !mFirstBoot, mOnlyCore, new PhoneWindowManager());

    }

}

public class WindowManagerService extends IWindowManager.Stub
        implements Watchdog.Monitor, WindowManagerPolicy.WindowManagerFuncs {

    final WindowManagerPolicy mPolicy;

    private void initPolicy() {
        UiThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {
                WindowManagerPolicyThread.set(Thread.currentThread(), Looper.myLooper());

                mPolicy.init(mContext, WindowManagerService.this, WindowManagerService.this);
            }
        }, 0);
    }

    private WindowManagerService(Context context, InputManagerService inputManager,
            boolean haveInputMethods, boolean showBootMsgs, boolean onlyCore,
            WindowManagerPolicy policy) {

        mPolicy = policy;
        initPolicy();

    }

}

public class PhoneWindowManager implements WindowManagerPolicy {
    static final String TAG = "WindowManager";

    WindowState mStatusBar = null;

    int mStatusBarHeight;

    WindowState mNavigationBar = null;

    // The last window we were told about in focusChanged.
    WindowState mFocusedWindow;

    IApplicationToken mFocusedApp;

    // 屏幕大小
    int mOverscanScreenLeft, mOverscanScreenTop;
    int mOverscanScreenWidth, mOverscanScreenHeight;

    // Unrestricted区域，不包含overscan区域，包含导航条
    int mUnrestrictedScreenLeft, mUnrestrictedScreenTop;
    int mUnrestrictedScreenWidth, mUnrestrictedScreenHeight;

    // RestrictedOverscan区域， 包含overscan区域，不包含导航条
    int mRestrictedOverscanScreenLeft, mRestrictedOverscanScreenTop;
    int mRestrictedOverscanScreenWidth, mRestrictedOverscanScreenHeight;

    // Restricted区域，不包含overscan区域，不包含导航条
    int mRestrictedScreenLeft, mRestrictedScreenTop;
    int mRestrictedScreenWidth, mRestrictedScreenHeight;

    int mSystemLeft, mSystemTop, mSystemRight, mSystemBottom;

    int mStableLeft, mStableTop, mStableRight, mStableBottom;

    int mStableFullscreenLeft, mStableFullscreenTop;
    int mStableFullscreenRight, mStableFullscreenBottom;

    int mCurLeft, mCurTop, mCurRight, mCurBottom;

    int mContentLeft, mContentTop, mContentRight, mContentBottom;

    int mDockLeft, mDockTop, mDockRight, mDockBottom;

    @Override
    public void beginLayoutLw(boolean isDefaultDisplay, int displayWidth, int displayHeight,
                              int displayRotation, int uiMode) {

        // 初始化窗口参数

    }

    @Override
    public void layoutWindowLw(WindowState win, WindowState attached) {

        // 

    }

}

```

### Activity窗口大小的计算

![window_relayout](/images/android/wms/window_relayout.png)




