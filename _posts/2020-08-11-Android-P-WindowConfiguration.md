---
layout:     post
title:      Android P WindowConfiguration
subtitle:   窗口配置
date:       2020-08-12
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - wms
---

## 类图

![window_configuration](/images/android/wms/window_configuration.png)

## 代码

### WindowConfiguration

```java

public class WindowConfiguration implements Parcelable, Comparable<WindowConfiguration> {

    /**
     * bounds that can differ from app bounds, which may include things such as insets.
     *
     * TODO: Investigate combining with {@link mAppBounds}. Can the latter be a product of the
     * former?
     */
    private Rect mBounds = new Rect();

    /**
     * {@link android.graphics.Rect} defining app bounds. The dimensions override usages of
     * {@link DisplayInfo#appHeight} and {@link DisplayInfo#appWidth} and mirrors these values at
     * the display level. Lower levels can override these values to provide custom bounds to enforce
     * features such as a max aspect ratio.
     */
    private Rect mAppBounds;

    //--------------------------------------------WindowingMode------------------------------------------

    /** The current windowing mode of the configuration. */
    private @WindowingMode int mWindowingMode;

    /** Windowing mode is currently not defined. */
    public static final int WINDOWING_MODE_UNDEFINED = 0;

    // 全屏模式
    /** Occupies the full area of the screen or the parent container. */
    public static final int WINDOWING_MODE_FULLSCREEN = 1;

    // 锁屏
    /** Always on-top (always visible). of other siblings in its parent container. */
    public static final int WINDOWING_MODE_PINNED = 2;

    // 分屏模式-1
    /** The primary container driving the screen to be in split-screen mode. */
    public static final int WINDOWING_MODE_SPLIT_SCREEN_PRIMARY = 3;

    // 分屏模式-2
    /**
     * The containers adjacent to the {@link #WINDOWING_MODE_SPLIT_SCREEN_PRIMARY} container in
     * split-screen mode.
     * NOTE: Containers launched with the windowing mode with APIs like
     * {@link ActivityOptions#setLaunchWindowingMode(int)} will be launched in
     * {@link #WINDOWING_MODE_FULLSCREEN} if the display isn't currently in split-screen windowing
     * mode
     * @see #WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY
     */
    public static final int WINDOWING_MODE_SPLIT_SCREEN_SECONDARY = 4;

    /**
     * Alias for {@link #WINDOWING_MODE_SPLIT_SCREEN_SECONDARY} that makes it clear that the usage
     * points for APIs like {@link ActivityOptions#setLaunchWindowingMode(int)} that the container
     * will launch into fullscreen or split-screen secondary depending on if the device is currently
     * in fullscreen mode or split-screen mode.
     */
    public static final int WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY =
            WINDOWING_MODE_SPLIT_SCREEN_SECONDARY;

    // 自由窗口模式
    /** Can be freely resized within its parent container. */
    public static final int WINDOWING_MODE_FREEFORM = 5;

    /** @hide */
    @IntDef(prefix = { "WINDOWING_MODE_" }, value = {
            WINDOWING_MODE_UNDEFINED,
            WINDOWING_MODE_FULLSCREEN,
            WINDOWING_MODE_PINNED,
            WINDOWING_MODE_SPLIT_SCREEN_PRIMARY,
            WINDOWING_MODE_SPLIT_SCREEN_SECONDARY,
            WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY,
            WINDOWING_MODE_FREEFORM,
    })
    public @interface WindowingMode {}

    //---------------------------------------------ActivityType-----------------------------------------

    /** The current activity type of the configuration. */
    private @ActivityType int mActivityType;

    // 未定义的类型
    /** Activity type is currently not defined. */
    public static final int ACTIVITY_TYPE_UNDEFINED = 0;

    // 标准类型
    /** Standard activity type. Nothing special about the activity... */
    public static final int ACTIVITY_TYPE_STANDARD = 1;

    // HOME 类型
    /** Home/Launcher activity type. */
    public static final int ACTIVITY_TYPE_HOME = 2;

    // Recent类型
    /** Recents/Overview activity type. There is only one activity with this type in the system. */
    public static final int ACTIVITY_TYPE_RECENTS = 3;

    //
    /** Assistant activity type. */
    public static final int ACTIVITY_TYPE_ASSISTANT = 4;

    /** @hide */
    @IntDef(prefix = { "ACTIVITY_TYPE_" }, value = {
            ACTIVITY_TYPE_UNDEFINED,
            ACTIVITY_TYPE_STANDARD,
            ACTIVITY_TYPE_HOME,
            ACTIVITY_TYPE_RECENTS,
            ACTIVITY_TYPE_ASSISTANT,
    })
    public @interface ActivityType {}

    //-----------------------------------WindowConfig--------------------------------------

    /** Bit that indicates that the {@link #mBounds} changed.
     * @hide */
    public static final int WINDOW_CONFIG_BOUNDS = 1 << 0;
    /** Bit that indicates that the {@link #mAppBounds} changed.
     * @hide */
    public static final int WINDOW_CONFIG_APP_BOUNDS = 1 << 1;
    /** Bit that indicates that the {@link #mWindowingMode} changed.
     * @hide */
    public static final int WINDOW_CONFIG_WINDOWING_MODE = 1 << 2;
    /** Bit that indicates that the {@link #mActivityType} changed.
     * @hide */
    public static final int WINDOW_CONFIG_ACTIVITY_TYPE = 1 << 3;

    /** @hide */
    @IntDef(flag = true, prefix = { "WINDOW_CONFIG_" }, value = {
            WINDOW_CONFIG_BOUNDS,
            WINDOW_CONFIG_APP_BOUNDS,
            WINDOW_CONFIG_WINDOWING_MODE,
            WINDOW_CONFIG_ACTIVITY_TYPE
    })
    public @interface WindowConfig {}


    /**
     * 窗口阴影
     * Returns true if the activities associated with this window configuration display a shadow
     * around their border.
     * @hide
     */
    public boolean hasWindowShadow() {
        return tasksAreFloating();
    }


    /**
     * 如果与此窗口配置关联的任务处于浮动状态，则返回true。
     * 浮动任务的布局有所不同，因为它们可以扩展到显示范围之外，而不会产生过扫描插图。
     * Returns true if the tasks associated with this window configuration are floating.
     * Floating tasks are laid out differently as they are allowed to extend past the display bounds
     * without overscan insets.
     * @hide
     */
    public boolean tasksAreFloating() {
        return isFloating(mWindowingMode);
    }

    /**
     * 悬浮窗口
     * Returns true if the windowingMode represents a floating window.
     * @hide
     */
    public static boolean isFloating(int windowingMode) {
        return windowingMode == WINDOWING_MODE_FREEFORM || windowingMode == WINDOWING_MODE_PINNED;
    }


    /**
     * 此窗口是否含有DecorView
     * Returns true if the activities associated with this window configuration display a decor
     * view.
     * @hide
     */
    public boolean hasWindowDecorCaption() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM;
    }

    /**
     * Returns true if the tasks associated with this window configuration can be resized
     * independently of their parent container.
     * @hide
     */
    public boolean canResizeTask() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM;
    }


    /** 
     * 是否要持久化窗口的边界
     * Returns true if the task bounds should persist across power cycles.
     *
     * @hide
     */
    public boolean persistTaskBounds() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM;
    }

    /**
     * 窗口是否可以接收按键事件
     * Returns true if the windows associated with this window configuration can receive input keys.
     * @hide
     */
    public boolean canReceiveKeys() {
        return mWindowingMode != WINDOWING_MODE_PINNED;
    }

    /**
     * 窗口是否总是在最高层级
     * Returns true if the container associated with this window configuration is always-on-top of
     * its siblings.
     * @hide
     */
    public boolean isAlwaysOnTop() {
        return mWindowingMode == WINDOWING_MODE_PINNED;
    }

    /**
     * 如果客户端的背景应该与窗口的框架匹配，则返回true。 如果背景应为全屏，则返回false。
     * Returns true if the backdrop on the client side should match the frame of the window.
     * Returns false, if the backdrop should be fullscreen.
     * @hide
     */
    public boolean useWindowFrameForBackdrop() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM || mWindowingMode == WINDOWING_MODE_PINNED;
    }

    /**
     * Returns true if this container can be put in either
     * {@link #WINDOWING_MODE_SPLIT_SCREEN_PRIMARY} or
     * {@link #WINDOWING_MODE_SPLIT_SCREEN_SECONDARY} windowing modes based on its current state.
     * @hide
     */
    public boolean supportSplitScreenWindowingMode() {
        return supportSplitScreenWindowingMode(mActivityType);
    }

    public static boolean supportSplitScreenWindowingMode(int activityType) {
        return activityType != ACTIVITY_TYPE_ASSISTANT;
    }

    /** @hide */
    public static String windowingModeToString(@WindowingMode int windowingMode) {
        switch (windowingMode) {
            case WINDOWING_MODE_UNDEFINED: return "undefined";
            case WINDOWING_MODE_FULLSCREEN: return "fullscreen";
            case WINDOWING_MODE_PINNED: return "pinned";
            case WINDOWING_MODE_SPLIT_SCREEN_PRIMARY: return "split-screen-primary";
            case WINDOWING_MODE_SPLIT_SCREEN_SECONDARY: return "split-screen-secondary";
            case WINDOWING_MODE_FREEFORM: return "freeform";
        }
        return String.valueOf(windowingMode);
    }

    /** @hide */
    public static String activityTypeToString(@ActivityType int applicationType) {
        switch (applicationType) {
            case ACTIVITY_TYPE_UNDEFINED: return "undefined";
            case ACTIVITY_TYPE_STANDARD: return "standard";
            case ACTIVITY_TYPE_HOME: return "home";
            case ACTIVITY_TYPE_RECENTS: return "recents";
            case ACTIVITY_TYPE_ASSISTANT: return "assistant";
        }
        return String.valueOf(applicationType);
    }

}

```

### Rect

```java

public final class Rect implements Parcelable {
    public int left;
    public int top;
    public int right;
    public int bottom;

    /**
     * @return the rectangle's width. This does not check for a valid rectangle
     * (i.e. left <= right) so the result may be negative.
     */
    public final int width() {
        return right - left;
    }

    /**
     * @return the rectangle's height. This does not check for a valid rectangle
     * (i.e. top <= bottom) so the result may be negative.
     */
    public final int height() {
        return bottom - top;
    }
}

```

### Configuration

```java

public final class Configuration implements Parcelable, Comparable<Configuration> {

    public final WindowConfiguration windowConfiguration = new WindowConfiguration();

}

```

### ConfigurationContainer

```java

public abstract class ConfigurationContainer<E extends ConfigurationContainer> {

    /**
     * {@link #Rect} returned from {@link #getOverrideBounds()} to prevent original value from being
     * set directly.
     */
    private Rect mReturnBounds = new Rect();

    /** Contains override configuration settings applied to this configuration container. */
    private Configuration mOverrideConfiguration = new Configuration();

    /** True if mOverrideConfiguration is not empty */
    private boolean mHasOverrideConfiguration;

    /**
     * 包含应用于此配置容器的完整配置。 对应于已应用{@link #mOverrideConfiguration}的完整父级配置。
     * Contains full configuration applied to this configuration container. Corresponds to full
     * parent's config with applied {@link #mOverrideConfiguration}.
     */
    private Configuration mFullConfiguration = new Configuration();

    /**
     * 包含从层次结构顶部到此特定实例的合并的替代配置设置。 它与{@link #mFullConfiguration}不同，因为它从最顶层容器的替代配置而不是全局配置开始。
     * Contains merged override configuration settings from the top of the hierarchy down to this
     * particular instance. It is different from {@link #mFullConfiguration} because it starts from
     * topmost container's override config instead of global config.
     */
    private Configuration mMergedOverrideConfiguration = new Configuration();

    private ArrayList<ConfigurationContainerListener> mChangeListeners = new ArrayList<>();

    /**
     * 返回应用于此配置容器的完整配置。此方法应用于获取在层次结构的每个特定级别应用的设置。
     * Returns full configuration applied to this configuration container.
     * This method should be used for getting settings applied in each particular level of the
     * hierarchy.
     */
    public Configuration getConfiguration() {
        return mFullConfiguration;
    }

    /**
     * 通知父容器配置变更
     * Notify that parent config changed and we need to update full configuration.
     * @see #mFullConfiguration
     */
    public void onConfigurationChanged(Configuration newParentConfig) {
        mFullConfiguration.setTo(newParentConfig);
        mFullConfiguration.updateFrom(mOverrideConfiguration);
        for (int i = getChildCount() - 1; i >= 0; --i) {
            final ConfigurationContainer child = getChildAt(i);
            child.onConfigurationChanged(mFullConfiguration);
        }
    }

    /** Returns override configuration applied to this configuration container. */
    public Configuration getOverrideConfiguration() {
        return mOverrideConfiguration;
    }

    /**
     * Indicates whether this container has not specified any bounds different from its parent. In
     * this case, it will inherit the bounds of the first ancestor which specifies a bounds.
     * @return {@code true} if no explicit bounds have been set at this container level.
     *         {@code false} otherwise.
     */
    public boolean matchParentBounds() {
        return getOverrideBounds().isEmpty();
    }

    /**
     * Returns whether the bounds specified is considered the same as the existing override bounds.
     * This is either when the two bounds are equal or the override bounds is empty and the
     * specified bounds is null.
     *
     * @return {@code true} if the bounds are equivalent, {@code false} otherwise
     */
    public boolean equivalentOverrideBounds(Rect bounds) {
        return equivalentBounds(getOverrideBounds(),  bounds);
    }

    /**
     * 比较边界是否相同
     * Returns whether the two bounds are equal to each other or are a combination of null or empty.
     */
    public static boolean equivalentBounds(Rect bounds, Rect other) {
        return bounds == other
                || (bounds != null && (bounds.equals(other) || (bounds.isEmpty() && other == null)))
                || (other != null && other.isEmpty() && bounds == null);
    }


    /**
     * Returns the effective bounds of this container, inheriting the first non-empty bounds set in
     * its ancestral hierarchy, including itself.
     * @return
     */
    public Rect getBounds() {
        mReturnBounds.set(getConfiguration().windowConfiguration.getBounds());
        return mReturnBounds;
    }

    /**
     * Returns the current bounds explicitly set on this container. The {@link Rect} handed back is
     * shared for all calls to this method and should not be modified.
     */
    public Rect getOverrideBounds() {
        mReturnBounds.set(getOverrideConfiguration().windowConfiguration.getBounds());

        return mReturnBounds;
    }

    public WindowConfiguration getWindowConfiguration() {
        return mFullConfiguration.windowConfiguration;
    }

    /** Returns the windowing mode the configuration container is currently in. */
    public int getWindowingMode() {
        return mFullConfiguration.windowConfiguration.getWindowingMode();
    }

    public boolean inFreeformWindowingMode() {
        return mFullConfiguration.windowConfiguration.getWindowingMode() == WINDOWING_MODE_FREEFORM;
    }

    public int getActivityType() {
        return mFullConfiguration.windowConfiguration.getActivityType();
    }


    public boolean isActivityTypeHome() {
        return getActivityType() == ACTIVITY_TYPE_HOME;
    }

    public boolean isActivityTypeRecents() {
        return getActivityType() == ACTIVITY_TYPE_RECENTS;
    }

    public boolean isActivityTypeAssistant() {
        return getActivityType() == ACTIVITY_TYPE_ASSISTANT;
    }

    public boolean isActivityTypeStandard() {
        return getActivityType() == ACTIVITY_TYPE_STANDARD;
    }

    boolean isAlwaysOnTop() {
        return mFullConfiguration.windowConfiguration.isAlwaysOnTop();
    }


    //--------------------------- 子类实现 ---------------------

    abstract protected int getChildCount();

    abstract protected E getChildAt(int index);

    abstract protected ConfigurationContainer getParent();


}

```

### ActivityStackSupervisor

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener,
        RecentTasks.Callbacks {

    private final SparseArray<ActivityDisplay> mActivityDisplays = new SparseArray<>();

    void attachDisplay(ActivityDisplay display) {
        mActivityDisplays.put(display.mDisplayId, display);
    }

    ActivityDisplay getActivityDisplay(int displayId) {
        return mActivityDisplays.get(displayId);
    }

    // TODO(multi-display): Look at all callpoints to make sure they make sense in multi-display.
    ActivityDisplay getDefaultDisplay() {
        return mActivityDisplays.get(DEFAULT_DISPLAY);
    }

}

```

### ActivityDisplay

```java

class ActivityDisplay extends ConfigurationContainer<ActivityStack>
        implements WindowContainerListener {

    private final ArrayList<ActivityStack> mStacks = new ArrayList<>();

    private ActivityStack mHomeStack = null;
    private ActivityStack mRecentsStack = null;
    private ActivityStack mPinnedStack = null;
    private ActivityStack mSplitScreenPrimaryStack = null;

    private DisplayWindowController mWindowContainerController;

    ActivityDisplay(ActivityStackSupervisor supervisor, Display display) {
        mWindowContainerController = createWindowContainerController();
        updateBounds();
    }

    void updateBounds() {
        mDisplay.getSize(mTmpDisplaySize);
        setBounds(0, 0, mTmpDisplaySize.x, mTmpDisplaySize.y);
    }

    void addChild(ActivityStack stack, int position) {
        // empty
    }

}

```

### ActivityStack

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    @Override
    protected int getChildCount() {
        return mTaskHistory.size();
    }

    @Override
    protected ConfigurationContainer getChildAt(int index) {
        return mTaskHistory.get(index);
    }

    @Override
    protected ConfigurationContainer getParent() {
        return getDisplay();
    }

    private final ArrayList<TaskRecord> mTaskHistory = new ArrayList<>();

    T mWindowContainerController;


    ActivityStack(ActivityDisplay display, int stackId, ActivityStackSupervisor supervisor,
            int windowingMode, int activityType, boolean onTop) {

        setActivityType(activityType);
        setWindowingMode(windowingMode);
        mWindowContainerController = createStackWindowController(display.mDisplayId, onTop,
                mTmpRect2);
        postAddToDisplay(display, mTmpRect2.isEmpty() ? null : mTmpRect2, onTop);

    }

    /**
     * Updates internal state after adding to new display.
     * @param activityDisplay New display to which this stack was attached.
     * @param bounds Updated bounds.
     */
    private void postAddToDisplay(ActivityDisplay activityDisplay, Rect bounds, boolean onTop) {
        mDisplayId = activityDisplay.mDisplayId;
        setBounds(bounds);
        onParentChanged();

        activityDisplay.addChild(this, onTop ? POSITION_TOP : POSITION_BOTTOM);
        if (inSplitScreenPrimaryWindowingMode()) {
            // If we created a docked stack we want to resize it so it resizes all other stacks
            // in the system.
            mStackSupervisor.resizeDockedStackLocked(
                    getOverrideBounds(), null, null, null, null, PRESERVE_WINDOWS);
        }
    }

    @Override
    public int setBounds(Rect bounds) {
        return super.setBounds(!inMultiWindowMode() ? null : bounds);
    }

    void resize(Rect bounds, Rect tempTaskBounds, Rect tempTaskInsetBounds) {

    }

    TaskRecord createTaskRecord(int taskId, ActivityInfo info, Intent intent,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            boolean toTop) {
        return createTaskRecord(taskId, info, intent, voiceSession, voiceInteractor, toTop,
                null /*activity*/, null /*source*/, null /*options*/);
    }

    TaskRecord createTaskRecord(int taskId, ActivityInfo info, Intent intent,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            boolean toTop, ActivityRecord activity, ActivityRecord source,
            ActivityOptions options) {
        final TaskRecord task = TaskRecord.create(
                mService, taskId, info, intent, voiceSession, voiceInteractor);
        // add the task to stack first, mTaskPositioner might need the stack association
        addTask(task, toTop, "createTaskRecord");
        final int displayId = mDisplayId != INVALID_DISPLAY ? mDisplayId : DEFAULT_DISPLAY;
        final boolean isLockscreenShown = mService.mStackSupervisor.getKeyguardController()
                .isKeyguardOrAodShowing(displayId);
        if (!mStackSupervisor.getLaunchParamsController()
                .layoutTask(task, info.windowLayout, activity, source, options)
                && !matchParentBounds() && task.isResizeable() && !isLockscreenShown) {
            task.updateOverrideConfiguration(getOverrideBounds());
        }
        task.createWindowContainer(toTop, (info.flags & FLAG_SHOW_FOR_ALL_USERS) != 0);
        return task;
    }

    void addTask(final TaskRecord task, final boolean toTop, String reason) {
        addTask(task, toTop ? MAX_VALUE : 0, true /* schedulePictureInPictureModeChange */, reason);
        if (toTop) {
            // TODO: figure-out a way to remove this call.
            mWindowContainerController.positionChildAtTop(task.getWindowContainerController(),
                    true /* includingParents */);
        }
    }

}

```

### TaskRecord

```java

class TaskRecord extends ConfigurationContainer implements TaskWindowContainerListener {

    final ArrayList<ActivityRecord> mActivities;

    private TaskWindowContainerController mWindowContainerController;


    /**
     * Update task's override configuration based on the bounds.
     * @param bounds The bounds of the task.
     * @return True if the override configuration was updated.
     */
    boolean updateOverrideConfiguration(Rect bounds) {
        return updateOverrideConfiguration(bounds, null /* insetBounds */);
    }

    /** Returns the bounds that should be used to launch this task. */
    Rect getLaunchBounds() {
        if (mStack == null) {
            return null;
        }

        final int windowingMode = getWindowingMode();
        if (!isActivityTypeStandardOrUndefined()
                || windowingMode == WINDOWING_MODE_FULLSCREEN
                || (windowingMode == WINDOWING_MODE_SPLIT_SCREEN_PRIMARY && !isResizeable())) {
            return isResizeable() ? mStack.getOverrideBounds() : null;
        } else if (!getWindowConfiguration().persistTaskBounds()) {
            return mStack.getOverrideBounds();
        }
        return mLastNonFullscreenBounds;
    }

}

```

### ActivityRecord

```java

final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    ActivityRecord(ActivityManagerService _service, ProcessRecord _caller, int _launchedFromPid,
            int _launchedFromUid, String _launchedFromPackage, Intent _intent, String _resolvedType,
            ActivityInfo aInfo, Configuration _configuration,
            ActivityRecord _resultTo, String _resultWho, int _reqCode,
            boolean _componentSpecified, boolean _rootVoiceInteraction,
            ActivityStackSupervisor supervisor, ActivityOptions options,
            ActivityRecord sourceRecord) {

        setActivityType(_componentSpecified, _launchedFromUid, _intent, options, sourceRecord);

    }

    /**
     * Computes the bounds to fit the Activity within the bounds of the {@link Configuration}.
     */
    // TODO(b/36505427): Consider moving this method and similar ones to ConfigurationContainer.
    private void computeBounds(Rect outBounds) {

    }

    private void setActivityType(boolean componentSpecified, int launchedFromUid, Intent intent,
            ActivityOptions options, ActivityRecord sourceRecord) {
        int activityType = ACTIVITY_TYPE_UNDEFINED;
        if ((!componentSpecified || canLaunchHomeActivity(launchedFromUid, sourceRecord))
                && isHomeIntent(intent) && !isResolverActivity()) {
            // This sure looks like a home activity!
            activityType = ACTIVITY_TYPE_HOME;

            if (info.resizeMode == RESIZE_MODE_FORCE_RESIZEABLE
                    || info.resizeMode == RESIZE_MODE_RESIZEABLE_VIA_SDK_VERSION) {
                // We only allow home activities to be resizeable if they explicitly requested it.
                info.resizeMode = RESIZE_MODE_UNRESIZEABLE;
            }
        } else if (realActivity.getClassName().contains(LEGACY_RECENTS_PACKAGE_NAME) ||
                service.getRecentTasks().isRecentsComponent(realActivity, appInfo.uid)) {
            activityType = ACTIVITY_TYPE_RECENTS;
        } else if (options != null && options.getLaunchActivityType() == ACTIVITY_TYPE_ASSISTANT
                && canLaunchAssistActivity(launchedFromPackage)) {
            activityType = ACTIVITY_TYPE_ASSISTANT;
        }
        setActivityType(activityType);
    }

    void setTask(TaskRecord task) {
        setTask(task /* task */, false /* reparenting */);
    }

    boolean supportsFreeform() {
        return service.mSupportsFreeformWindowManagement && supportsResizeableMultiWindow();
    }

}

```

### WindowContainer

```java

class WindowContainer<E extends WindowContainer> extends ConfigurationContainer<E>
        implements Comparable<WindowContainer>, Animatable {

    private WindowContainer<WindowContainer> mParent = null;

    // List of children for this window container. List is in z-order as the children appear on
    // screen with the top-most window container at the tail of the list.
    protected final WindowList<E> mChildren = new WindowList<E>();

    // The owner/creator for this container. No controller if null.
    WindowContainerController mController;

    @Override
    final protected WindowContainer getParent() {
        return mParent;
    }

    @Override
    protected int getChildCount() {
        return mChildren.size();
    }

    @Override
    protected E getChildAt(int index) {
        return mChildren.get(index);
    }

    void onResize() {
        for (int i = mChildren.size() - 1; i >= 0; --i) {
            final WindowContainer wc = mChildren.get(i);
            wc.onParentResize();
        }
    }

    void onParentResize() {
        // In the case this container has specified its own bounds, a parent resize will not
        // affect its bounds. Any relevant changes will be propagated through changes to the
        // Configuration override.
        if (hasOverrideBounds()) {
            return;
        }

        // Default implementation is to treat as resize on self.
        onResize();
    }



}

```

### RootWindowContainer

```java

class RootWindowContainer extends WindowContainer<DisplayContent> {

    DisplayContent getDisplayContent(int displayId) {
        for (int i = mChildren.size() - 1; i >= 0; --i) {
            final DisplayContent current = mChildren.get(i);
            if (current.getDisplayId() == displayId) {
                return current;
            }
        }
        return null;
    }

    DisplayContent createDisplayContent(final Display display, DisplayWindowController controller) {
        final int displayId = display.getDisplayId();

        // In select scenarios, it is possible that a DisplayContent will be created on demand
        // rather than waiting for the controller. In this case, associate the controller and return
        // the existing display.
        final DisplayContent existing = getDisplayContent(displayId);

        if (existing != null) {
            existing.setController(controller);
            return existing;
        }

        final DisplayContent dc =
                new DisplayContent(display, mService, mWallpaperController, controller);

        if (DEBUG_DISPLAY) Slog.v(TAG_WM, "Adding display=" + display);

        final DisplayInfo displayInfo = dc.getDisplayInfo();
        final Rect rect = new Rect();
        mService.mDisplaySettings.getOverscanLocked(displayInfo.name, displayInfo.uniqueId, rect);
        displayInfo.overscanLeft = rect.left;
        displayInfo.overscanTop = rect.top;
        displayInfo.overscanRight = rect.right;
        displayInfo.overscanBottom = rect.bottom;
        if (mService.mDisplayManagerInternal != null) {
            mService.mDisplayManagerInternal.setDisplayInfoOverrideFromWindowManager(
                    displayId, displayInfo);
            dc.configureDisplayPolicy();

            // Tap Listeners are supported for:
            // 1. All physical displays (multi-display).
            // 2. VirtualDisplays on VR, AA (and everything else).
            if (mService.canDispatchPointerEvents()) {
                if (DEBUG_DISPLAY) {
                    Slog.d(TAG,
                            "Registering PointerEventListener for DisplayId: " + displayId);
                }
                dc.mTapDetector = new TaskTapPointerEventListener(mService, dc);
                mService.registerPointerEventListener(dc.mTapDetector);
                if (displayId == DEFAULT_DISPLAY) {
                    mService.registerPointerEventListener(mService.mMousePositionTracker);
                }
            }
        }

        return dc;
    }

    private void updateStackBoundsAfterConfigChange(int displayId, List<TaskStack> changedStacks) {
        final DisplayContent dc = getDisplayContent(displayId);
        dc.updateStackBoundsAfterConfigChange(changedStacks);
    }

    @Override
    String getName() {
        return "ROOT";
    }

}

```

### DisplayContent

```java

class DisplayContent extends WindowContainer<DisplayContent.DisplayChildWindowContainer> {

    private final class TaskStackContainers extends DisplayChildWindowContainer<TaskStack> {

        /**
         * Adds the stack to this container.
         * @see DisplayContent#createStack(int, boolean, StackWindowController)
         */
        void addStackToDisplay(TaskStack stack, boolean onTop) {
            addStackReferenceIfNeeded(stack);
            addChild(stack, onTop);
            stack.onDisplayChanged(DisplayContent.this);
        }

    }

    static class DisplayChildWindowContainer<E extends WindowContainer> extends WindowContainer<E> {

    }


    TaskStack createStack(int stackId, boolean onTop, StackWindowController controller) {
        if (DEBUG_STACK) Slog.d(TAG_WM, "Create new stackId=" + stackId + " on displayId="
                + mDisplayId);

        final TaskStack stack = new TaskStack(mService, stackId, controller);
        mTaskStackContainers.addStackToDisplay(stack, onTop);
        return stack;
    }

    private void updateBounds() {
        calculateBounds(mTmpBounds);
        setBounds(mTmpBounds);
    }

    @Override
    public void getBounds(Rect out) {
        calculateBounds(out);
    }

    String getName() {
        return "Display " + mDisplayId + " name=\"" + mDisplayInfo.name + "\"";
    }

}

```

### TaskStack

```java

public class TaskStack extends WindowContainer<Task> implements
        BoundsAnimationTarget {

    @Override
    public int setBounds(Rect bounds) {
        return setBounds(getOverrideBounds(), bounds);
    }

    void addTask(Task task, int position) {
        addTask(task, position, task.showForAllUsers(), true /* moveParents */);
    }

}

```

### Task

```java

class Task extends WindowContainer<AppWindowToken> {

    /** Set the task bounds. Passing in null sets the bounds to fullscreen. */
    @Override
    public int setBounds(Rect bounds) {
        int rotation = Surface.ROTATION_0;
        final DisplayContent displayContent = mStack.getDisplayContent();
        if (displayContent != null) {
            rotation = displayContent.getDisplayInfo().rotation;
        } else if (bounds == null) {
            // Can't set to fullscreen if we don't have a display to get bounds from...
            return BOUNDS_CHANGE_NONE;
        }

        if (equivalentOverrideBounds(bounds)) {
            return BOUNDS_CHANGE_NONE;
        }

        final int boundsChange = super.setBounds(bounds);

        mRotation = rotation;

        return boundsChange;
    }

    @Override
    public void getBounds(Rect out) {
        if (useCurrentBounds()) {
            // No need to adjust the output bounds if fullscreen or the docked stack is visible
            // since it is already what we want to represent to the rest of the system.
            super.getBounds(out);
            return;
        }

        // The bounds has been adjusted to accommodate for a docked stack, but the docked stack is
        // not currently visible. Go ahead a represent it as fullscreen to the rest of the system.
        mStack.getDisplayContent().getBounds(out);
    }

    @Override
    void addChild(AppWindowToken wtoken, int position) {
        position = getAdjustedAddPosition(position);
        super.addChild(wtoken, position);
        mDeferRemoval = false;
    }

}

```

### WindowToken

```java

class WindowToken extends WindowContainer<WindowState> {

    void addWindow(final WindowState win) {
        if (DEBUG_FOCUS) Slog.d(TAG_WM,
                "addWindow: win=" + win + " Callers=" + Debug.getCallers(5));

        if (win.isChildWindow()) {
            // Child windows are added to their parent windows.
            return;
        }
        if (!mChildren.contains(win)) {
            if (DEBUG_ADD_REMOVE) Slog.v(TAG_WM, "Adding " + win + " to " + this);
            addChild(win, mWindowComparator);
            mService.mWindowsChanged = true;
            // TODO: Should we also be setting layout needed here and other places?
        }
    }

    /** Returns true if the token windows list is empty. */
    boolean isEmpty() {
        return mChildren.isEmpty();
    }

}

```

### WindowState

```java

/** A window in the window manager. */
class WindowState extends WindowContainer<WindowState> implements WindowManagerPolicy.WindowState {

    // TODO: Look into whether this override is still necessary.
    @Override
    public Rect getBounds() {
        if (isInMultiWindowMode()) {
            return getTask().getBounds();
        } else if (mAppToken != null){
            return mAppToken.getBounds();
        } else {
            return super.getBounds();
        }
    }

}

```



