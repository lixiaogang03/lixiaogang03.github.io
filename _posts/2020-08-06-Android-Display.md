---
layout:     post
title:      Android Display
subtitle:   屏幕显示相关
date:       2020-08-06
author:     LXG
header-img: img/post-bg-ioses.jpg
catalog: true
tags:
    - wms
---

[Android Display的初始化-简书](https://www.jianshu.com/p/764c132a5026)

## DMS

![display_manager](/images/wms/display_manager.png)

## WMS Display

![wms_display](/images/wms/wms_display.png)


### WindowManagerService

```java

public class WindowManagerService extends IWindowManager.Stub
        implements Watchdog.Monitor, WindowManagerPolicy.WindowManagerFuncs {
    private static final String TAG = TAG_WITH_CLASS_NAME ? "WindowManagerService" : TAG_WM;

    final DisplaySettings mDisplaySettings;

    final DisplayManagerInternal mDisplayManagerInternal;
    final DisplayManager mDisplayManager;
    private final Display[] mDisplays;

    // The root of the device window hierarchy.
    RootWindowContainer mRoot;


    private WindowManagerService(Context context, InputManagerService inputManager,
            boolean haveInputMethods, boolean showBootMsgs, boolean onlyCore,
            WindowManagerPolicy policy) {

        mRoot = new RootWindowContainer(this);

        mDisplayManagerInternal = LocalServices.getService(DisplayManagerInternal.class);
        mDisplaySettings = new DisplaySettings();
        mDisplaySettings.readSettingsLocked();

        mDisplayManager = (DisplayManager)context.getSystemService(Context.DISPLAY_SERVICE);
        mDisplays = mDisplayManager.getDisplays();
        for (Display display : mDisplays) {
            createDisplayContentLocked(display);
        }

    }


    // TODO: All the display method below should probably be moved into the RootWindowContainer...
    private void createDisplayContentLocked(final Display display) {
        if (display == null) {
            throw new IllegalArgumentException("getDisplayContent: display must not be null");
        }
        mRoot.getDisplayContentOrCreate(display.getDisplayId());
    }

}

```

### RootWindowContainer

```java

/** Root {@link WindowContainer} for the device. */
class RootWindowContainer extends WindowContainer<DisplayContent> {
    private static final String TAG = TAG_WITH_CLASS_NAME ? "RootWindowContainer" : TAG_WM;

    WindowManagerService mService;


    RootWindowContainer(WindowManagerService service) {
        mService = service;
        mHandler = new MyHandler(service.mH.getLooper());

    }

    /**
     * Retrieve the DisplayContent for the specified displayId. Will create a new DisplayContent if
     * there is a Display for the displayId.
     *
     * @param displayId The display the caller is interested in.
     * @return The DisplayContent associated with displayId or null if there is no Display for it.
     */
    DisplayContent getDisplayContentOrCreate(int displayId) {
        DisplayContent dc = getDisplayContent(displayId);

        if (dc == null) {
            final Display display = mService.mDisplayManager.getDisplay(displayId);
            if (display != null) {
                final long callingIdentity = Binder.clearCallingIdentity();
                try {
                    dc = createDisplayContent(display);
                } finally {
                    Binder.restoreCallingIdentity(callingIdentity);
                }
            }
        }
        return dc;
    }

    DisplayContent getDisplayContent(int displayId) {
        for (int i = mChildren.size() - 1; i >= 0; --i) {
            final DisplayContent current = mChildren.get(i);
            if (current.getDisplayId() == displayId) {
                return current;
            }
        }
        return null;
    }

    private DisplayContent createDisplayContent(final Display display) {
        final DisplayContent dc = new DisplayContent(display, mService, mLayersController,
                mWallpaperController);
        final int displayId = display.getDisplayId();

        if (DEBUG_DISPLAY) Slog.v(TAG_WM, "Adding display=" + display);

        final DisplayInfo displayInfo = dc.getDisplayInfo();
        final Rect rect = new Rect();
        //获得Overscan的区域, 这个是配置的 /data/system/display_settings.xml
        mService.mDisplaySettings.getOverscanLocked(displayInfo.name, displayInfo.uniqueId, rect);
        displayInfo.overscanLeft = rect.left;
        displayInfo.overscanTop = rect.top;
        displayInfo.overscanRight = rect.right;
        displayInfo.overscanBottom = rect.bottom;
        if (mService.mDisplayManagerInternal != null) {
            mService.mDisplayManagerInternal.setDisplayInfoOverrideFromWindowManager(
                    displayId, displayInfo);
            mService.configureDisplayPolicyLocked(dc);

            // Tap Listeners are supported for:
            // 1. All physical displays (multi-display).
            // 2. VirtualDisplays that support virtual touch input. (Only VR for now)
            // TODO(multi-display): Support VirtualDisplays with no virtual touch input.
            if ((display.getType() != Display.TYPE_VIRTUAL
                    || (display.getType() == Display.TYPE_VIRTUAL
                        // Only VR VirtualDisplays
                        && displayId == mService.mVr2dDisplayId))
                    && mService.canDispatchPointerEvents()) {
                if (DEBUG_DISPLAY) {
                    Slog.d(TAG,
                            "Registering PointerEventListener for DisplayId: " + displayId);
                }

                // 注册鼠标按键事件监听
                dc.mTapDetector = new TaskTapPointerEventListener(mService, dc);
                mService.registerPointerEventListener(dc.mTapDetector);
                if (displayId == DEFAULT_DISPLAY) {
                    mService.registerPointerEventListener(mService.mMousePositionTracker);
                }
            }
        }

        return dc;
    }

}

```

### DisplayContent

```java

class DisplayContent extends WindowContainer<DisplayContent.DisplayChildWindowContainer> {
    private static final String TAG = TAG_WITH_CLASS_NAME ? "DisplayContent" : TAG_WM;

    /** Unique identifier of this stack. */
    private final int mDisplayId;
    private final DisplayInfo mDisplayInfo = new DisplayInfo();
    private final Display mDisplay;

    // 屏幕上显示的普通应用界面
    /** The containers below are the only child containers the display can have. */
    // Contains all window containers that are related to apps (Activities)
    private final TaskStackContainers mTaskStackContainers = new TaskStackContainers();

    // 在应用界面上显示的window
    // Contains all non-app window containers that should be displayed above the app containers
    // (e.g. Status bar)
    private final NonAppWindowContainers mAboveAppWindowsContainers =
            new NonAppWindowContainers("mAboveAppWindowsContainers");

    // 在界面下显示的window
    // Contains all non-app window containers that should be displayed below the app containers
    // (e.g. Wallpaper).
    private final NonAppWindowContainers mBelowAppWindowsContainers =
            new NonAppWindowContainers("mBelowAppWindowsContainers");

    // 输入法window
    // Contains all IME window containers. Note that the z-ordering of the IME windows will depend
    // on the IME target. We mainly have this container grouping so we can keep track of all the IME
    // window containers together and move them in-sync if/when needed.
    private final NonAppWindowContainers mImeWindowsContainers =
            new NonAppWindowContainers("mImeWindowsContainers");

    WindowManagerService mService;

    // Mapping from a token IBinder to a WindowToken object on this display.
    private final HashMap<IBinder, WindowToken> mTokenMap = new HashMap();

    /** Detect user tapping outside of current focused task bounds .*/
    TaskTapPointerEventListener mTapDetector;


    DisplayContent(Display display, WindowManagerService service,
            WindowLayersController layersController, WallpaperController wallpaperController) {

        mDisplay = display;
        mDisplayId = display.getDisplayId();

        // These are the only direct children we should ever have and they are permanent.
        super.addChild(mBelowAppWindowsContainers, null);
        super.addChild(mTaskStackContainers, null);
        super.addChild(mAboveAppWindowsContainers, null);
        super.addChild(mImeWindowsContainers, null);

        // Add itself as a child to the root container.
        mService.mRoot.addChild(this, null);

        // TODO(b/62541591): evaluate whether this is the best spot to declare the
        // {@link DisplayContent} ready for use.
        mDisplayReady = true;        // These are the only direct children we should ever have and they are permanent.
        super.addChild(mBelowAppWindowsContainers, null);
        super.addChild(mTaskStackContainers, null);
        super.addChild(mAboveAppWindowsContainers, null);
        super.addChild(mImeWindowsContainers, null);

        // Add itself as a child to the root container.
        mService.mRoot.addChild(this, null);

        // TODO(b/62541591): evaluate whether this is the best spot to declare the
        // {@link DisplayContent} ready for use.
        mDisplayReady = true;

    }


    /**
     * Base class for any direct child window container of {@link #DisplayContent} need to inherit
     * from. This is mainly a pass through class that allows {@link #DisplayContent} to have
     * homogeneous children type which is currently required by sub-classes of
     * {@link WindowContainer} class.
     */
    static class DisplayChildWindowContainer<E extends WindowContainer> extends WindowContainer<E> {

        int size() {
            return mChildren.size();
        }

        E get(int index) {
            return mChildren.get(index);
        }

        @Override
        boolean fillsParent() {
            return true;
        }

        @Override
        boolean isVisible() {
            return true;
        }
    }


    /**
     * Window container class that contains all containers on this display relating to Apps.
     * I.e Activities.
     */
    private final class TaskStackContainers extends DisplayChildWindowContainer<TaskStack> {

        /**
         * Adds the stack to this container.
         * @see WindowManagerService#addStackToDisplay(int, int, boolean)
         */
        void addStackToDisplay(TaskStack stack, boolean onTop) {
            if (stack.mStackId == HOME_STACK_ID) {
                if (mHomeStack != null) {
                    throw new IllegalArgumentException("attachStack: HOME_STACK_ID (0) not first.");
                }
                mHomeStack = stack;
            }
            addChild(stack, onTop);
            stack.onDisplayChanged(DisplayContent.this);
        }

        /** Removes the stack from its container and prepare for changing the parent. */
        void removeStackFromDisplay(TaskStack stack) {
            removeChild(stack);
            stack.onRemovedFromDisplay();
        }

    }

}

```

## AMS Display

### ActivityManagerService

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    public void setWindowManager(WindowManagerService wm) {
        mWindowManager = wm;
        mStackSupervisor.setWindowManager(wm);
        mActivityStarter.setWindowManager(wm);
    }

}

```

### ActivityStackSupervisor

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener {
    private static final String TAG = TAG_WITH_CLASS_NAME ? "ActivityStackSupervisor" : TAG_AM;

    void setWindowManager(WindowManagerService wm) {
        synchronized (mService) {
            mWindowManager = wm;

            mDisplayManager =
                    (DisplayManager)mService.mContext.getSystemService(Context.DISPLAY_SERVICE);
            mDisplayManager.registerDisplayListener(this, null);
            mDisplayManagerInternal = LocalServices.getService(DisplayManagerInternal.class);

        }
    }

    @Override
    public void onDisplayAdded(int displayId) {
        if (DEBUG_STACK) Slog.v(TAG, "Display added displayId=" + displayId);
        mHandler.sendMessage(mHandler.obtainMessage(HANDLE_DISPLAY_ADDED, displayId, 0));
    }

    @Override
    public void onDisplayRemoved(int displayId) {
        if (DEBUG_STACK) Slog.v(TAG, "Display removed displayId=" + displayId);
        mHandler.sendMessage(mHandler.obtainMessage(HANDLE_DISPLAY_REMOVED, displayId, 0));
    }

    @Override
    public void onDisplayChanged(int displayId) {
        if (DEBUG_STACK) Slog.v(TAG, "Display changed displayId=" + displayId);
        mHandler.sendMessage(mHandler.obtainMessage(HANDLE_DISPLAY_CHANGED, displayId, 0));
    }

}

```

## App Display

### ViewRootImpl

```java

public final class ViewRootImpl implements ViewParent,
        View.AttachInfo.Callbacks, ThreadedRenderer.DrawCallbacks {

    @NonNull Display mDisplay;
    final DisplayManager mDisplayManager;


    public ViewRootImpl(Context context, Display display) {

        mDisplay = display;

        mDisplayManager = (DisplayManager)context.getSystemService(Context.DISPLAY_SERVICE);

    }

    public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
        synchronized (this) {
            if (mView == null) {
                mView = view;
                mAttachInfo.mDisplayState = mDisplay.getState();
                mDisplayManager.registerDisplayListener(mDisplayListener, mHandler);
            }
        }
    }


    private final DisplayListener mDisplayListener = new DisplayListener() {
        @Override
        public void onDisplayChanged(int displayId) {
            if (mView != null && mDisplay.getDisplayId() == displayId) {
                final int oldDisplayState = mAttachInfo.mDisplayState;
                final int newDisplayState = mDisplay.getState();
                if (oldDisplayState != newDisplayState) {
                    mAttachInfo.mDisplayState = newDisplayState;
                    pokeDrawLockIfNeeded();
                    if (oldDisplayState != Display.STATE_UNKNOWN) {
                        final int oldScreenState = toViewScreenState(oldDisplayState);
                        final int newScreenState = toViewScreenState(newDisplayState);
                        if (oldScreenState != newScreenState) {
                            mView.dispatchScreenStateChanged(newScreenState);
                        }
                        if (oldDisplayState == Display.STATE_OFF) {
                            // Draw was suppressed so we need to for it to happen here.
                            mFullRedrawNeeded = true;
                            scheduleTraversals();
                        }
                    }
                }
            }
        }
     }

}

```



