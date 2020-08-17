---
layout:     post
title:      Android PhoneWindowManager
subtitle:   WindowManagerPolicy implementation for the Android phone UI
date:       2020-08-17
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - wms
---

## 代码

### SystemServer

```java

public final class SystemServer {

    private void startOtherServices() {
            ------------------------------------------------------------------
            wm = WindowManagerService.main(context, inputManager,
                    mFactoryTestMode != FactoryTest.FACTORY_TEST_LOW_LEVEL,
                    !mFirstBoot, mOnlyCore, new PhoneWindowManager());
            ServiceManager.addService(Context.WINDOW_SERVICE, wm, /* allowIsolated= */ false,
                    DUMP_FLAG_PRIORITY_CRITICAL | DUMP_FLAG_PROTO);
            ServiceManager.addService(Context.INPUT_SERVICE, inputManager,
                    /* allowIsolated= */ false, DUMP_FLAG_PRIORITY_CRITICAL);
            traceEnd();

            traceBeginAndSlog("SetWindowManagerService");
            mActivityManagerService.setWindowManager(wm);
            traceEnd();

            traceBeginAndSlog("WindowManagerServiceOnInitReady");
            wm.onInitReady();
            traceEnd();
            -------------------------------------------------------------------
    }

}

```

### WindowManagerService

```java

public class WindowManagerService extends IWindowManager.Stub
        implements Watchdog.Monitor, WindowManagerPolicy.WindowManagerFuncs {

    final WindowManagerPolicy mPolicy;

    public static WindowManagerService main(final Context context, final InputManagerService im,
            final boolean haveInputMethods, final boolean showBootMsgs, final boolean onlyCore,
            WindowManagerPolicy policy) {
        DisplayThread.getHandler().runWithScissors(() ->
                sInstance = new WindowManagerService(context, im, haveInputMethods, showBootMsgs,
                        onlyCore, policy), 0);
        return sInstance;
    }

    private WindowManagerService(Context context, InputManagerService inputManager,
            boolean haveInputMethods, boolean showBootMsgs, boolean onlyCore,
            WindowManagerPolicy policy) {

        mPolicy = policy;

        LocalServices.addService(WindowManagerPolicy.class, mPolicy);

    }

    private void initPolicy() {
        UiThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {
                WindowManagerPolicyThread.set(Thread.currentThread(), Looper.myLooper());
                mPolicy.init(mContext, WindowManagerService.this, WindowManagerService.this);
            }
        }, 0);
    }

    public void onInitReady() {
        initPolicy();
    }

}

```

### PhoneWindowManager

```java

public class PhoneWindowManager implements WindowManagerPolicy {

    @Override
    public void init(Context context, IWindowManager windowManager,
            WindowManagerFuncs windowManagerFuncs) {

    }

    @Override
    public void beginLayoutLw(DisplayFrames displayFrames, int uiMode) {
        displayFrames.onBeginLayout();
    }

    @Override
    public void layoutWindowLw(WindowState win, WindowState attached, DisplayFrames displayFrames) {

    }

}

```

### DisplayContent

```java

class DisplayContent extends WindowContainer<DisplayContent.DisplayChildWindowContainer> {

    DisplayFrames mDisplayFrames;

    DisplayContent(Display display, WindowManagerService service,
            WallpaperController wallpaperController, DisplayWindowController controller) {

        mDisplayFrames = new DisplayFrames(mDisplayId, mDisplayInfo,
                calculateDisplayCutoutForRotation(mDisplayInfo.rotation));

    }

    void performLayout(boolean initial, boolean updateInputWindows) {

        mService.mPolicy.beginLayoutLw(mDisplayFrames, getConfiguration().uiMode);

        ---------------------------------------------------------------------------

        // First perform layout of any root windows (not attached to another window).
        forAllWindows(mPerformLayout, true /* traverseTopToBottom */);

        -----------------------------------------------------------------------------

        // Now perform layout of attached windows, which usually depend on the position of the
        // window they are attached to. XXX does not deal with windows that are attached to windows
        // that are themselves attached.
        forAllWindows(mPerformLayoutAttached, true /* traverseTopToBottom */);

    }

    private final Consumer<WindowState> mPerformLayout = w -> {

                mService.mPolicy.layoutWindowLw(w, null, mDisplayFrames);

    }

    private final Consumer<WindowState> mPerformLayoutAttached = w -> {

                mService.mPolicy.layoutWindowLw(w, w.getParentWindow(), mDisplayFrames);

    }

}

```

### DisplayFrames

```java

/**
 * Container class for all the display frames that affect how we do window layout on a display.
 * @hide
 */
public class DisplayFrames {
    public final int mDisplayId;

    /**
     * The current size of the screen; really; extends into the overscan area of the screen and
     * doesn't account for any system elements like the status bar.
     */
    public final Rect mOverscan = new Rect();

    /**
     * The current visible size of the screen; really; (ir)regardless of whether the status bar can
     * be hidden but not extending into the overscan area.
     */
    public final Rect mUnrestricted = new Rect();

    /** Like mOverscan*, but allowed to move into the overscan region where appropriate. */
    public final Rect mRestrictedOverscan = new Rect();

    /**
     * The current size of the screen; these may be different than (0,0)-(dw,dh) if the status bar
     * can't be hidden; in that case it effectively carves out that area of the display from all
     * other windows.
     */
    public final Rect mRestricted = new Rect();

    /**
     * During layout, the current screen borders accounting for any currently visible system UI
     * elements.
     */
    public final Rect mSystem = new Rect();

    /** For applications requesting stable content insets, these are them. */
    public final Rect mStable = new Rect();

    /**
     * For applications requesting stable content insets but have also set the fullscreen window
     * flag, these are the stable dimensions without the status bar.
     */
    public final Rect mStableFullscreen = new Rect();

    /**
     * During layout, the current screen borders with all outer decoration (status bar, input method
     * dock) accounted for.
     */
    public final Rect mCurrent = new Rect();

    /**
     * During layout, the frame in which content should be displayed to the user, accounting for all
     * screen decoration except for any space they deem as available for other content. This is
     * usually the same as mCurrent*, but may be larger if the screen decor has supplied content
     * insets.
     */
    public final Rect mContent = new Rect();

    /**
     * During layout, the frame in which voice content should be displayed to the user, accounting
     * for all screen decoration except for any space they deem as available for other content.
     */
    public final Rect mVoiceContent = new Rect();

    /** During layout, the current screen borders along which input method windows are placed. */
    public final Rect mDock = new Rect();

    /** The display cutout used for layout (after rotation) */
    @NonNull public WmDisplayCutout mDisplayCutout = WmDisplayCutout.NO_CUTOUT;

    /** The cutout as supplied by display info */
    @NonNull public WmDisplayCutout mDisplayInfoCutout = WmDisplayCutout.NO_CUTOUT;

    /**
     * During layout, the frame that is display-cutout safe, i.e. that does not intersect with it.
     */
    public final Rect mDisplayCutoutSafe = new Rect();

    private final Rect mDisplayInfoOverscan = new Rect();
    private final Rect mRotatedDisplayInfoOverscan = new Rect();
    public int mDisplayWidth;
    public int mDisplayHeight;

    public int mRotation;

    public DisplayFrames(int displayId, DisplayInfo info, WmDisplayCutout displayCutout) {
        mDisplayId = displayId;
        onDisplayInfoUpdated(info, displayCutout);
    }

}

```


