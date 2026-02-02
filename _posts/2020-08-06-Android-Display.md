---
layout:     post
title:      Android Display
subtitle:   屏幕显示相关
date:       2020-08-06
author:     LXG
header-img: img/post-bg-ioses.jpg
catalog: true
tags:
    - Android
---

[Android Display的初始化-简书](https://www.jianshu.com/p/764c132a5026)

[单手模式的实现-简书](https://github.com/komamj/SingleHandMode)

## DMS

![display_manager](/images/android/wms/display_manager.png)

## WMS Display

![wms_display](/images/android/wms/wms_display.png)


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

### DisplayManagerGlobal

```java

public final class DisplayManagerGlobal {
    private static final String TAG = "DisplayManager";


    private final SparseArray<DisplayInfo> mDisplayInfoCache = new SparseArray<DisplayInfo>();

    /**
     * Gets an instance of the display manager global singleton.
     *
     * @return The display manager instance, may be null early in system startup
     * before the display manager has been fully initialized.
     */
    public static DisplayManagerGlobal getInstance() {
        synchronized (DisplayManagerGlobal.class) {
            if (sInstance == null) {
                IBinder b = ServiceManager.getService(Context.DISPLAY_SERVICE);
                if (b != null) {
                    sInstance = new DisplayManagerGlobal(IDisplayManager.Stub.asInterface(b));
                }
            }
            return sInstance;
        }
    }


    public void addView(View view, ViewGroup.LayoutParams params,
            Display display, Window parentWindow) {

            ------------------------------------------------------------------

            root = new ViewRootImpl(view.getContext(), display);

            -----------------------------------------------------------------

    }


    /**
     * Get information about a particular logical display.
     *
     * @param displayId The logical display id.
     * @return Information about the specified display, or null if it does not exist.
     * This object belongs to an internal cache and should be treated as if it were immutable.
     */
    public DisplayInfo getDisplayInfo(int displayId) {
        try {
            synchronized (mLock) {
                DisplayInfo info;
                if (USE_CACHE) {
                    info = mDisplayInfoCache.get(displayId);
                    if (info != null) {
                        return info;
                    }
                }

                info = mDm.getDisplayInfo(displayId);
                if (info == null) {
                    return null;
                }

                if (USE_CACHE) {
                    mDisplayInfoCache.put(displayId, info);
                }
                registerCallbackIfNeededLocked();

                if (DEBUG) {
                    Log.d(TAG, "getDisplayInfo: displayId=" + displayId + ", info=" + info);
                }
                return info;
            }
        } catch (RemoteException ex) {
            throw ex.rethrowFromSystemServer();
        }
    }

    /**
     * Gets information about a logical display.
     *
     * The display metrics may be adjusted to provide compatibility
     * for legacy applications or limited screen areas.
     *
     * @param displayId The logical display id.
     * @param resources Resources providing compatibility info.
     * @return The display object, or null if there is no display with the given id.
     */
    public Display getCompatibleDisplay(int displayId, Resources resources) {
        DisplayInfo displayInfo = getDisplayInfo(displayId);
        if (displayInfo == null) {
            return null;
        }
        return new Display(this, displayId, displayInfo, resources);
    }

}

```

## DMS Display

### DisplayManagerService

```java

public final class DisplayManagerService extends SystemService {
    private static final String TAG = "DisplayManagerService";

    // List of all logical displays indexed by logical display id.
    private final SparseArray<LogicalDisplay> mLogicalDisplays =
            new SparseArray<LogicalDisplay>();


    @VisibleForTesting
    final class BinderService extends IDisplayManager.Stub {
        /**
         * Returns information about the specified logical display.
         *
         * @param displayId The logical display id.
         * @return The logical display info, or null if the display does not exist.  The
         * returned object must be treated as immutable.
         */
        @Override // Binder call
        public DisplayInfo getDisplayInfo(int displayId) {
            final int callingUid = Binder.getCallingUid();
            final long token = Binder.clearCallingIdentity();
            try {
                return getDisplayInfoInternal(displayId, callingUid);
            } finally {
                Binder.restoreCallingIdentity(token);
            }
        }
    }

    private DisplayInfo getDisplayInfoInternal(int displayId, int callingUid) {
        synchronized (mSyncRoot) {
            LogicalDisplay display = mLogicalDisplays.get(displayId);
            if (display != null) {
                DisplayInfo info = display.getDisplayInfoLocked();
                if (info.hasAccess(callingUid)
                        || isUidPresentOnDisplayInternal(callingUid, displayId)) {
                    return info;
                }
            }
            return null;
        }
    }

}

```

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

### trace

```txt

D/MMM: getCompatibleDisplay-----2----: DisplayInfo{"内置屏幕", uniqueId "local:0", app 1200 x 1848, real 1200 x 1920, largest app 1920 x 1812, smallest app 1200 x 1092, mode 1, defaultMode 1, modes [{id=1, width=1200, height=1920, fps=60.000004}], colorMode 0, supportedColorModes [0], hdrCapabilities android.view.Display$HdrCapabilities@40f16308, rotation 0, density 240 (320.842 x 320.842) dpi, layerStack 0, appVsyncOff 1000000, presDeadline 16666666, type BUILT_IN, state ON, FLAG_SECURE, FLAG_SUPPORTS_PROTECTED_BUFFERS, removeMode 0}
    java.lang.Throwable
        at android.hardware.display.DisplayManagerGlobal.getCompatibleDisplay(DisplayManagerGlobal.java:187)
        at android.app.ResourcesManager.getAdjustedDisplay(ResourcesManager.java:274)
        at android.app.ResourcesManager.getDisplayMetrics(ResourcesManager.java:206)
        at android.app.ResourcesManager.createResourcesImpl(ResourcesManager.java:512)
        at android.app.ResourcesManager.getOrCreateResources(ResourcesManager.java:804)
        at android.app.ResourcesManager.createBaseActivityResources(ResourcesManager.java:733)
        at android.app.ContextImpl.createActivityContext(ContextImpl.java:2384)
        at android.app.ActivityThread.createBaseContextForActivity(ActivityThread.java:3037)
        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2866)
        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3087)
        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78)
        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6746)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)

```

## dumpsys display

```txt

DISPLAY MANAGER (dumpsys display)
  mOnlyCode=false
  mSafeMode=false
  mPendingTraversal=false
  mGlobalDisplayState=ON
  mNextNonDefaultDisplayId=1
  mDefaultViewport=DisplayViewport{valid=true, displayId=0, uniqueId='null', orientation=0, logicalFrame=Rect(0, 0 - 1200, 1920), physicalFrame=Rect(0, 0 - 1200, 1920), deviceWidth=1200, deviceHeight=1920}
  mExternalTouchViewport=DisplayViewport{valid=false, displayId=0, uniqueId='null', orientation=0, logicalFrame=Rect(0, 0 - 0, 0), physicalFrame=Rect(0, 0 - 0, 0), deviceWidth=0, deviceHeight=0}
  mVirtualTouchViewports=[]
  mDefaultDisplayDefaultColorMode=0
  mSingleDisplayDemoMode=false
  mWifiDisplayScanRequestCount=0
  mStableDisplaySize=Point(1200, 1920)

Display Adapters: size=4
  LocalDisplayAdapter
  VirtualDisplayAdapter
  OverlayDisplayAdapter
    mCurrentOverlaySetting=
    mOverlays: size=0
  WifiDisplayAdapter
    mCurrentStatus=WifiDisplayStatus{featureState=3, scanState=0, activeDisplayState=0, activeDisplay=null, displays=[], sessionInfo=WifiDisplaySessionInfo:
        Client/Owner: Client
        GroupId: 
        Passphrase: 
        SessionId: 0
        IP Address: }
    mFeatureState=3
    mScanState=0
    mActiveDisplayState=0
    mActiveDisplay=null
    mDisplays=[]
    mAvailableDisplays=[]
    mRememberedDisplays=[]
    mPendingStatusChangeBroadcast=false
    mSupportsProtectedBuffers=true
    mDisplayController:
      mWifiDisplayOnSetting=true
      mWifiP2pEnabled=true
      mWfdEnabled=true
      mWfdEnabling=false
      mNetworkInfo=[type: WIFI_P2P[], state: UNKNOWN/IDLE, reason: (unspecified), extra: (none), failover: false, available: true, roaming: false]
      mScanRequested=false
      mDiscoverPeersInProgress=false
      mDesiredDevice=null
      mConnectingDisplay=null
      mDisconnectingDisplay=null
      mCancelingDisplay=null
      mConnectedDevice=null
      mConnectionRetriesLeft=0
      mRemoteDisplay=null
      mRemoteDisplayInterface=null
      mRemoteDisplayConnected=false
      mAdvertisedDisplay=null
      mAdvertisedDisplaySurface=null
      mAdvertisedDisplayWidth=0
      mAdvertisedDisplayHeight=0
      mAdvertisedDisplayFlags=0
      mAvailableWifiDisplayPeers: size=0

Display Devices: size=1
  DisplayDeviceInfo{"内置屏幕": uniqueId="local:0", 1200 x 1920, modeId 1, defaultModeId 1, supportedModes [{id=1, width=1200, height=1920, fps=60.000004}], colorMode 0, supportedColorModes [0], HdrCapabilities android.view.Display$HdrCapabilities@40f16308, density 240, 320.842 x 320.842 dpi, appVsyncOff 1000000, presDeadline 16666666, touch INTERNAL, rotation 0, type BUILT_IN, state ON, FLAG_DEFAULT_DISPLAY, FLAG_ROTATES_WITH_CONTENT, FLAG_SECURE, FLAG_SUPPORTS_PROTECTED_BUFFERS}
    mAdapter=LocalDisplayAdapter
    mUniqueId=local:0
    mPhysicalId=0
    mDisplayToken=android.os.BinderProxy@9a08c40
    mCurrentLayerStack=0
    mCurrentOrientation=0
    mCurrentLayerStackRect=Rect(0, 0 - 1200, 1920)
    mCurrentDisplayRect=Rect(0, 0 - 1200, 1920)
    mCurrentSurface=null
    mBuiltInDisplayId=0
    mActivePhysIndex=0
    mActiveModeId=1
    mActiveColorMode=0
    mState=ON
    mBrightness=59
    mBacklight=com.android.server.lights.LightsService$LightImpl@d976779
    mDisplayInfos=
      PhysicalDisplayInfo{1200 x 1920, 60.000004 fps, density 1.5, 320.842 x 320.842 dpi, secure true, appVsyncOffset 1000000, bufferDeadline 16666666}
    mSupportedModes=
      DisplayModeRecord{mMode={id=1, width=1200, height=1920, fps=60.000004}}
    mSupportedColorModes=[0]

Logical Displays: size=1
  Display 0:
    mDisplayId=0
    mLayerStack=0
    mHasContent=true
    mRequestedMode=0
    mRequestedColorMode=0
    mDisplayOffset=(0, 0)
    mPrimaryDisplayDevice=内置屏幕
    mBaseDisplayInfo=DisplayInfo{"内置屏幕", uniqueId "local:0", app 1200 x 1920, real 1200 x 1920, largest app 1200 x 1920, smallest app 1200 x 1920, mode 1, defaultMode 1, modes [{id=1, width=1200, height=1920, fps=60.000004}], colorMode 0, supportedColorModes [0], hdrCapabilities android.view.Display$HdrCapabilities@40f16308, rotation 0, density 240 (320.842 x 320.842) dpi, layerStack 0, appVsyncOff 1000000, presDeadline 16666666, type BUILT_IN, state ON, FLAG_SECURE, FLAG_SUPPORTS_PROTECTED_BUFFERS, removeMode 0}
    mOverrideDisplayInfo=DisplayInfo{"内置屏幕", uniqueId "local:0", app 1200 x 1848, real 1200 x 1920, largest app 1920 x 1812, smallest app 1200 x 1092, mode 1, defaultMode 1, modes [{id=1, width=1200, height=1920, fps=60.000004}], colorMode 0, supportedColorModes [0], hdrCapabilities android.view.Display$HdrCapabilities@40f16308, rotation 0, density 240 (320.842 x 320.842) dpi, layerStack 0, appVsyncOff 1000000, presDeadline 16666666, type BUILT_IN, state ON, FLAG_SECURE, FLAG_SUPPORTS_PROTECTED_BUFFERS, removeMode 0}

Callbacks: size=34
  0: mPid=2118, mWifiDisplayScanRequested=false
  1: mPid=2386, mWifiDisplayScanRequested=false
  2: mPid=2397, mWifiDisplayScanRequested=false
  3: mPid=2567, mWifiDisplayScanRequested=false
  4: mPid=2593, mWifiDisplayScanRequested=false
  5: mPid=2610, mWifiDisplayScanRequested=false
  6: mPid=2732, mWifiDisplayScanRequested=false
  7: mPid=2807, mWifiDisplayScanRequested=false
  8: mPid=3144, mWifiDisplayScanRequested=false
  9: mPid=3156, mWifiDisplayScanRequested=false
  10: mPid=3171, mWifiDisplayScanRequested=false
  11: mPid=3185, mWifiDisplayScanRequested=false
  12: mPid=3206, mWifiDisplayScanRequested=false
  13: mPid=3244, mWifiDisplayScanRequested=false
  14: mPid=3277, mWifiDisplayScanRequested=false
  15: mPid=3480, mWifiDisplayScanRequested=false
  16: mPid=3648, mWifiDisplayScanRequested=false
  17: mPid=3679, mWifiDisplayScanRequested=false
  18: mPid=3771, mWifiDisplayScanRequested=false
  19: mPid=3943, mWifiDisplayScanRequested=false
  20: mPid=4083, mWifiDisplayScanRequested=false
  21: mPid=4150, mWifiDisplayScanRequested=false
  22: mPid=4269, mWifiDisplayScanRequested=false
  23: mPid=4330, mWifiDisplayScanRequested=false
  24: mPid=4377, mWifiDisplayScanRequested=false
  25: mPid=4403, mWifiDisplayScanRequested=false
  26: mPid=4459, mWifiDisplayScanRequested=false
  27: mPid=4496, mWifiDisplayScanRequested=false
  28: mPid=4576, mWifiDisplayScanRequested=false
  29: mPid=4620, mWifiDisplayScanRequested=false
  30: mPid=4662, mWifiDisplayScanRequested=false
  31: mPid=4776, mWifiDisplayScanRequested=false
  32: mPid=4912, mWifiDisplayScanRequested=false
  33: mPid=5043, mWifiDisplayScanRequested=false

Display Power Controller Locked State:
  mDisplayReadyLocked=true
  mPendingRequestLocked=policy=BRIGHT, useProximitySensor=false, screenBrightnessOverride=-1, useAutoBrightness=true, screenAutoBrightnessAdjustmentOverride=NaN, screenLowPowerBrightnessFactor=0.5, blockScreenOn=false, lowPowerMode=false, boostScreenBrightness=false, dozeScreenBrightness=-1, dozeScreenState=UNKNOWN
  mPendingRequestChangedLocked=false
  mPendingWaitForNegativeProximityLocked=false
  mPendingUpdatePowerStateLocked=false

Display Power Controller Configuration:
  mScreenBrightnessDozeConfig=17
  mScreenBrightnessDimConfig=10
  mScreenBrightnessRangeMinimum=5
  mScreenBrightnessRangeMaximum=255
  mScreenBrightnessDefault=102
  mScreenBrightnessForVrRangeMinimum=79
  mScreenBrightnessForVrRangeMaximum=255
  mScreenBrightnessForVrDefault=86
  mUseSoftwareAutoBrightnessConfig=true
  mAllowAutoBrightnessWhileDozingConfig=false
  mBrightnessRampRateFast=180
  mBrightnessRampRateSlow=60
  mSkipScreenOnBrightnessRamp=false
  mColorFadeFadesConfig=false
  mColorFadeEnabled=true
  mDisplayBlanksAfterDozeConfig=false
  mBrightnessBucketsInDozeConfig=false

Display Power Controller Thread State:
  mPowerRequest=policy=BRIGHT, useProximitySensor=false, screenBrightnessOverride=-1, useAutoBrightness=true, screenAutoBrightnessAdjustmentOverride=NaN, screenLowPowerBrightnessFactor=0.5, blockScreenOn=false, lowPowerMode=false, boostScreenBrightness=false, dozeScreenBrightness=-1, dozeScreenState=UNKNOWN
  mUnfinishedBusiness=false
  mWaitingForNegativeProximity=false
  mProximitySensor={Sensor name="", vendor="", version=2, type=8, maxRange=0.0, resolution=0.0, power=0.001, minDelay=0}
  mProximitySensorEnabled=false
  mProximityThreshold=0.0
  mProximity=Unknown
  mPendingProximity=Unknown
  mPendingProximityDebounceTime=-1 (951771 ms ago)
  mScreenOffBecauseOfProximity=false
  mLastUserSetScreenBrightness=0
  mCurrentScreenBrightnessSetting=59
  mPendingScreenBrightnessSetting=-1
  mTemporaryScreenBrightness=-1
  mAutoBrightnessAdjustment=0.0
  mTemporaryAutoBrightnessAdjustment=NaN
  mPendingAutoBrightnessAdjustment=NaN
  mScreenBrightnessForVr=86
  mAppliedAutoBrightness=true
  mAppliedDimming=false
  mAppliedLowPower=false
  mAppliedScreenBrightnessOverride=false
  mAppliedTemporaryBrightness=false
  mDozing=false
  mSkipRampState=RAMP_STATE_SKIP_NONE
  mInitialAutoBrightness=0
  mScreenOnBlockStartRealTime=943256
  mScreenOffBlockStartRealTime=326962
  mPendingScreenOnUnblocker=null
  mPendingScreenOffUnblocker=null
  mPendingScreenOff=false
  mReportedToPolicy=REPORTED_TO_POLICY_SCREEN_ON
  mScreenBrightnessRampAnimator.isAnimating()=false
  mColorFadeOnAnimator.isStarted()=false
  mColorFadeOffAnimator.isStarted()=false

Display Power State:
  mScreenState=ON
  mScreenBrightness=59
  mScreenReady=true
  mScreenUpdatePending=false
  mColorFadePrepared=false
  mColorFadeLevel=1.0
  mColorFadeReady=true
  mColorFadeDrawPending=false

Photonic Modulator State:
  mPendingState=ON
  mPendingBacklight=59
  mActualState=ON
  mActualBacklight=59
  mStateChangeInProgress=false
  mBacklightChangeInProgress=false

Color Fade State:
  mPrepared=false
  mMode=1
  mDisplayLayerStack=0
  mDisplayWidth=1200
  mDisplayHeight=1920
  mSurfaceVisible=false
  mSurfaceAlpha=0.0

Automatic Brightness Controller Configuration:
  mScreenBrightnessRangeMinimum=5
  mScreenBrightnessRangeMaximum=255
  mDozeScaleFactor=1.0
  mInitialLightSensorRate=250
  mNormalLightSensorRate=250
  mLightSensorWarmUpTimeConfig=0
  mBrighteningLightDebounceConfig=200
  mDarkeningLightDebounceConfig=200
  mResetAmbientLuxAfterWarmUpConfig=true
  mAmbientLightHorizon=10000
  mWeightingIntercept=10000

Automatic Brightness Controller State:
  mLightSensor={Sensor name="LTR308 als", vendor="LiteOn", version=1, type=5, maxRange=10000.0, resolution=0.01499939, power=0.11, minDelay=0}
  mLightSensorEnabled=true
  mLightSensorEnableTime=943294 (8476 ms ago)
  mCurrentLightSensorRate=250
  mAmbientLux=216.0
  mAmbientLuxValid=true
  mAmbientBrighteningThreshold=237.6
  mAmbientDarkeningThreshold=172.8
  mScreenBrighteningThreshold=64.9
  mScreenDarkeningThreshold=47.2
  mLastObservedLux=21.0
  mLastObservedLuxTime=951235 (535 ms ago)
  mRecentLightSamples=17
  mAmbientLightRingBuffer=[216.0 / 500ms, 213.0 / 250ms, 216.0 / 250ms, 215.0 / 250ms, 216.0 / 750ms, 214.0 / 250ms, 216.0 / 749ms, 215.0 / 251ms, 216.0 / 2001ms, 215.0 / 249ms, 216.0 / 750ms, 214.0 / 250ms, 216.0 / 254ms, 175.0 / 246ms, 42.0 / 251ms, 55.0 / 249ms, 21.0 / 535ms]
  mScreenAutoBrightness=59
  mDisplayPolicy=BRIGHT
  mShortTermModelAnchor=-1.0
  mShortTermModelValid=false
  mBrightnessAdjustmentSamplePending=false
  mBrightnessAdjustmentSampleOldLux=0.0
  mBrightnessAdjustmentSampleOldBrightness=0
  mShortTermModelValid=false

SimpleMappingStrategy
  mSpline=MonotoneCubicSpline{[(0.0, 0.039215688: 0.003921569), (10.0, 0.078431375: 0.0023965142), (100.0, 0.15686275: 7.298475E-4), (300.0, 0.27450982: 4.5098038E-4), (800.0, 0.43137255: 2.9691876E-4), (1500.0, 0.627451: 2.9691876E-4), (2000.0, 0.78431374: 1.9281045E-4), (5000.0, 1.0: 7.189542E-5)]}
  mMaxGamma=3.0
  mAutoBrightnessAdjustment=0.0
  mUserLux=-1.0
  mUserBrightness=-1.0

HysteresisLevels
  mBrighteningThresholds=[0.1]
  mDarkeningThresholds=[0.2]
  mThresholdLevels=[]
HysteresisLevels
  mBrighteningThresholds=[0.1]
  mDarkeningThresholds=[0.2]
  mThresholdLevels=[]

BrightnessTracker state:
  mStarted=false
  mLastBatteryLevel=NaN
  mLastBrightness=-1.0
  mLastSensorReadings.size=0
  mEventsDirty=false
  mEvents.size=0
  mWriteBrightnessTrackerStateScheduled=false
  mSensorRegistered=false

PersistentDataStore
  mLoaded=true
  mDirty=false
  RememberedWifiDisplays:
  DisplayStates:
  StableDeviceValues:
      StableDisplayWidth=1200
      StableDisplayHeight=1920
  BrightnessConfigurations:

```


