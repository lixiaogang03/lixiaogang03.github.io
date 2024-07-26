---
layout:     post
title:      Android P WindowMode
subtitle:   WINDOWING_MODE_FREEFORM
date:       2020-08-19
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - android
---

[Taskbar-github](https://github.com/farmerbb/Taskbar)

### WindowConfiguration

```java

public class WindowConfiguration implements Parcelable, Comparable<WindowConfiguration> {

    /** Can be freely resized within its parent container. */
    public static final int WINDOWING_MODE_FREEFORM = 5;

    /**
     * 窗口菜单栏
     * Returns true if the activities associated with this window configuration display a decor
     * view.
     * @hide
     */
    public boolean hasWindowDecorCaption() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM;
    }

    /**
     * 窗口大小是否可调
     * Returns true if the tasks associated with this window configuration can be resized
     * independently of their parent container.
     * @hide
     */
    public boolean canResizeTask() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM;
    }

    /**
     * 是否持久化窗口大小
     * Returns true if the task bounds should persist across power cycles.
     * @hide
     */
    public boolean persistTaskBounds() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM;
    }


    /**
     * 是否是一个浮动窗口
     * Returns true if the windowingMode represents a floating window.
     * @hide
     */
    public static boolean isFloating(int windowingMode) {
        return windowingMode == WINDOWING_MODE_FREEFORM || windowingMode == WINDOWING_MODE_PINNED;
    }

    /**
     * Returns true if the backdrop on the client side should match the frame of the window.
     * Returns false, if the backdrop should be fullscreen.
     * @hide
     */
    public boolean useWindowFrameForBackdrop() {
        return mWindowingMode == WINDOWING_MODE_FREEFORM || mWindowingMode == WINDOWING_MODE_PINNED;
    }

}

```

### ActivityManagerService

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    // 更改任务栈的大小
    @Override
    public void resizeTask(int taskId, Rect bounds, int resizeMode) {

        -----------------------------------------------------------------------------------

                if (bounds == null && stack.getWindowingMode() == WINDOWING_MODE_FREEFORM) {
                    stack = stack.getDisplay().getOrCreateStack(
                            WINDOWING_MODE_FULLSCREEN, stack.getActivityType(), ON_TOP);
                } else if (bounds != null && stack.getWindowingMode() != WINDOWING_MODE_FREEFORM) {
                    stack = stack.getDisplay().getOrCreateStack(
                            WINDOWING_MODE_FREEFORM, stack.getActivityType(), ON_TOP);
                }

        ----------------------------------------------------------------------------------

    }

}

```

### ActivityDisplay

```java

class ActivityDisplay extends ConfigurationContainer<ActivityStack>
        implements WindowContainerListener {

    /**
     * Returns an existing stack compatible with the windowing mode and activity type or creates one
     * if a compatible stack doesn't exist.
     * @see #getStack(int, int)
     * @see #createStack(int, int, boolean)
     */
    <T extends ActivityStack> T getOrCreateStack(int windowingMode, int activityType,
            boolean onTop) {
        if (!alwaysCreateStack(windowingMode, activityType)) {
            T stack = getStack(windowingMode, activityType);
            if (stack != null) {
                return stack;
            }
        }

        return createStack(windowingMode, activityType, onTop);
    }

    /**
     * Returns an existing stack compatible with the input params or creates one
     * if a compatible stack doesn't exist.
     * @see #getOrCreateStack(int, int, boolean)
     */
    <T extends ActivityStack> T getOrCreateStack(@Nullable ActivityRecord r,
            @Nullable ActivityOptions options, @Nullable TaskRecord candidateTask, int activityType,
            boolean onTop) {
        final int windowingMode = resolveWindowingMode(r, options, candidateTask, activityType);
        return getOrCreateStack(windowingMode, activityType, onTop);
    }


    /**
     * Returns an existing stack compatible with the windowing mode and activity type or creates one
     * if a compatible stack doesn't exist.
     * @see #getStack(int, int)
     * @see #createStack(int, int, boolean)
     */
    <T extends ActivityStack> T getOrCreateStack(int windowingMode, int activityType,
            boolean onTop) {
        if (!alwaysCreateStack(windowingMode, activityType)) {
            T stack = getStack(windowingMode, activityType);
            if (stack != null) {
                return stack;
            }
        }

        return createStack(windowingMode, activityType, onTop);
    }


    /**
     * Creates a stack matching the input windowing mode and activity type on this display.
     * @param windowingMode The windowing mode the stack should be created in. If
     *                      {@link WindowConfiguration#WINDOWING_MODE_UNDEFINED} then the stack will
     *                      be created in {@link WindowConfiguration#WINDOWING_MODE_FULLSCREEN}.
     * @param activityType The activityType the stack should be created in. If
     *                     {@link WindowConfiguration#ACTIVITY_TYPE_UNDEFINED} then the stack will
     *                     be created in {@link WindowConfiguration#ACTIVITY_TYPE_STANDARD}.
     * @param onTop If true the stack will be created at the top of the display, else at the bottom.
     * @return The newly created stack.
     */
    <T extends ActivityStack> T createStack(int windowingMode, int activityType, boolean onTop) {

        -------------------------------------------------------------------------------

        final int stackId = getNextStackId();
        return createStackUnchecked(windowingMode, activityType, stackId, onTop);
    }

    @VisibleForTesting
    <T extends ActivityStack> T createStackUnchecked(int windowingMode, int activityType,
            int stackId, boolean onTop) {
        if (windowingMode == WINDOWING_MODE_PINNED) {
            return (T) new PinnedActivityStack(this, stackId, mSupervisor, onTop);
        }

        return (T) new ActivityStack(
                        this, stackId, mSupervisor, windowingMode, activityType, onTop);
    }

}

```

### ActivityStack

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    ActivityStack(ActivityDisplay display, int stackId, ActivityStackSupervisor supervisor,
            int windowingMode, int activityType, boolean onTop) {

        ----------------------------------------------------------------------
  
        setActivityType(activityType);
        setWindowingMode(windowingMode);

        -----------------------------------------------------------------------

    }

    void setWindowingMode(int preferredWindowingMode, boolean animate, boolean showRecents,
            boolean enteringSplitScreenMode, boolean deferEnsuringVisibility) {

        -----------------------------------------------------------------------------------

            mTmpRect2.setEmpty();
            if (windowingMode != WINDOWING_MODE_FULLSCREEN) {
                mWindowContainerController.getRawBounds(mTmpRect2);
                if (windowingMode == WINDOWING_MODE_FREEFORM) {
                    if (topTask != null) {
                        // TODO: Can we consolidate this and other sites that call this methods?
                        Rect bounds = topTask().getLaunchBounds();
                        if (bounds != null) {
                            mTmpRect2.set(bounds);
                        }
                    }
                }
            }

        -----------------------------------------------------------------------------------

    }

}

```

### 调用栈

![actviity_options](/images/android/ams/actviity_options.png)

```txt

        at com.android.server.am.ActivityStack.setWindowingMode(ActivityStack.java:553)
        at com.android.server.am.ActivityStack.setWindowingMode(ActivityStack.java:523)
        at com.android.server.am.ActivityStack.<init>(ActivityStack.java:474)
        at com.android.server.am.ActivityDisplay.createStackUnchecked(ActivityDisplay.java:325)
        at com.android.server.am.ActivityDisplay.createStack(ActivityDisplay.java:316)
        at com.android.server.am.ActivityDisplay.getOrCreateStack(ActivityDisplay.java:246)
        at com.android.server.am.ActivityDisplay.getOrCreateStack(ActivityDisplay.java:261)
        at com.android.server.am.ActivityStackSupervisor.getLaunchStack(ActivityStackSupervisor.java:2527)
        at com.android.server.am.ActivityStarter.getLaunchStack(ActivityStarter.java:2499)
        at com.android.server.am.ActivityStarter.computeStackFocus(ActivityStarter.java:2392)
        at com.android.server.am.ActivityStarter.setTaskFromReuseOrCreateNewTask(ActivityStarter.java:2125)
        at com.android.server.am.ActivityStarter.startActivityUnchecked(ActivityStarter.java:1489)
        at com.android.server.am.ActivityStarter.startActivity(ActivityStarter.java:1269)
        at com.android.server.am.ActivityStarter.startActivity(ActivityStarter.java:886)
        at com.android.server.am.ActivityStarter.startActivity(ActivityStarter.java:558)
        at com.android.server.am.ActivityStarter.startActivityMayWait(ActivityStarter.java:1168)
        at com.android.server.am.ActivityStarter.execute(ActivityStarter.java:496)
        at com.android.server.am.ActivityManagerService.startActivityAsUser(ActivityManagerService.java:5186)
        at com.android.server.am.ActivityManagerService.startActivityAsUser(ActivityManagerService.java:5160)
        at com.android.server.am.ActivityManagerService.startActivity(ActivityManagerService.java:5151)
        at android.app.IActivityManager$Stub.onTransact$startActivity$(IActivityManager.java:10088)
        at android.app.IActivityManager$Stub.onTransact(IActivityManager.java:122)
        at com.android.server.am.ActivityManagerService.onTransact(ActivityManagerService.java:3326)
        at android.os.Binder.execTransact(Binder.java:731)

```

### TaskBar

```txt

1970-03-15 22:59:42.724 7128-7128/com.farmerbb.taskbar.debug E/WWW: continueLaunchingApp:
Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] flg=0x38000000 cmp=com.android.mms/.ui.ConversationList }, 
Bundle[{
android:activity.animHeight=86,
android.activity.taskOverlayCanResume=false,
android.activity.avoidMoveToFront=false,
android.activity.launchTaskId=-1,
android:activity.animStartX=421,
android:activity.animStartY=925,
android.activity.activityType=0,
android:activity.lockTaskMode=false,
android:activity.disallowEnterPictureInPictureWhileLaunching=false,
android.activity.taskOverlay=false,
android.activity.launchDisplayId=-1,
android.activity.windowingMode=5,                // free form mode
android:activity.animType=11,
android:activity.splitScreenCreateMode=0,
android:activity.animWidth=86,
android:activity.rotationAnimationHint=-1
}]

```

### ActivityOptions

```java

/**
 * Helper class for building an options Bundle that can be used with
 * {@link android.content.Context#startActivity(android.content.Intent, android.os.Bundle)
 * Context.startActivity(Intent, Bundle)} and related methods.
 */
public class ActivityOptions {


    /**
     * The bounds (window size) that the activity should be launched in. Set to null explicitly for
     * full screen. If the key is not found, previous bounds will be preserved.
     * NOTE: This value is ignored on devices that don't have
     * {@link android.content.pm.PackageManager#FEATURE_FREEFORM_WINDOW_MANAGEMENT} or
     * {@link android.content.pm.PackageManager#FEATURE_PICTURE_IN_PICTURE} enabled.
     * @hide
     */
    public static final String KEY_LAUNCH_BOUNDS = "android:activity.launchBounds";

    /**
     * The windowing mode the activity should be launched into.
     * @hide
     */
    private static final String KEY_LAUNCH_WINDOWING_MODE = "android.activity.windowingMode";

    /**
     * The activity type the activity should be launched as.
     * @hide
     */
    private static final String KEY_LAUNCH_ACTIVITY_TYPE = "android.activity.activityType";


    private Rect mLaunchBounds;

    @WindowConfiguration.WindowingMode
    private int mLaunchWindowingMode = WINDOWING_MODE_UNDEFINED;
    @WindowConfiguration.ActivityType
    private int mLaunchActivityType = ACTIVITY_TYPE_UNDEFINED;


    /** @hide */
    public ActivityOptions(Bundle opts) {

        mLaunchBounds = opts.getParcelable(KEY_LAUNCH_BOUNDS);

        mLaunchWindowingMode = opts.getInt(KEY_LAUNCH_WINDOWING_MODE, WINDOWING_MODE_UNDEFINED);
        mLaunchActivityType = opts.getInt(KEY_LAUNCH_ACTIVITY_TYPE, ACTIVITY_TYPE_UNDEFINED);

    }

    /** @hide */
    public int getLaunchWindowingMode() {
        return mLaunchWindowingMode;
    }

    /**
     * Sets the windowing mode the activity should launch into. If the input windowing mode is
     * {@link android.app.WindowConfiguration#WINDOWING_MODE_SPLIT_SCREEN_SECONDARY} and the device
     * isn't currently in split-screen windowing mode, then the activity will be launched in
     * {@link android.app.WindowConfiguration#WINDOWING_MODE_FULLSCREEN} windowing mode. For clarity
     * on this you can use
     * {@link android.app.WindowConfiguration#WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY}
     *
     * @hide
     */
    @TestApi
    public void setLaunchWindowingMode(int windowingMode) {
        mLaunchWindowingMode = windowingMode;
    }

    /** @hide */
    public int getLaunchActivityType() {
        return mLaunchActivityType;
    }

    /** @hide */
    @TestApi
    public void setLaunchActivityType(int activityType) {
        mLaunchActivityType = activityType;
    }

    /**
     * Returns the bounds that should be used to launch the activity.
     * @see #setLaunchBounds(Rect)
     * @return Bounds used to launch the activity.
     */
    @Nullable
    public Rect getLaunchBounds() {
        return mLaunchBounds;
    }

    /**
     * Create a basic ActivityOptions that has no special animation associated with it.
     * Other options can still be set.
     */
    public static ActivityOptions makeBasic() {
        final ActivityOptions opts = new ActivityOptions();
        return opts;
    }

    public Bundle toBundle() {
        Bundle b = new Bundle();

        if (mLaunchBounds != null) {
            b.putParcelable(KEY_LAUNCH_BOUNDS, mLaunchBounds);
        }

        b.putInt(KEY_LAUNCH_WINDOWING_MODE, mLaunchWindowingMode);
        b.putInt(KEY_LAUNCH_ACTIVITY_TYPE, mLaunchActivityType);

    }

}

```

### ContextImpl

```java

class ContextImpl extends Context {

    // window mode in options
    @Override
    public void startActivity(Intent intent, Bundle options) {
        warnIfCallingFromSystemProcess();

        -------------------------------------------------------------------

        mMainThread.getInstrumentation().execStartActivity(
                getOuterContext(), mMainThread.getApplicationThread(), null,
                (Activity) null, intent, -1, options);
    }

}

```

### Instrumentation

```java

public class Instrumentation {

    public ActivityResult execStartActivity(
        Context who, IBinder contextThread, IBinder token, String target,
        Intent intent, int requestCode, Bundle options) {

        -----------------------------------------------------------------

        try {
            intent.migrateExtraStreamToClipData();
            intent.prepareToLeaveProcess(who);
            int result = ActivityManager.getService()
                .startActivity(whoThread, who.getBasePackageName(), intent,
                        intent.resolveTypeIfNeeded(who.getContentResolver()),
                        token, target, requestCode, 0, null, options);
            checkStartActivityResult(result, intent);
        } catch (RemoteException e) {
            throw new RuntimeException("Failure from system", e);
        }
        return null;
    }

}

```

### AMS

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    @Override
    public final int startActivity(IApplicationThread caller, String callingPackage,
            Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
            int startFlags, ProfilerInfo profilerInfo, Bundle bOptions) {

        return startActivityAsUser(caller, callingPackage, intent, resolvedType, resultTo,
                resultWho, requestCode, startFlags, profilerInfo, bOptions,
                UserHandle.getCallingUserId());
    }

    public final int startActivityAsUser(IApplicationThread caller, String callingPackage,
            Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
            int startFlags, ProfilerInfo profilerInfo, Bundle bOptions, int userId,
            boolean validateIncomingUser) {

        // TODO: Switch to user app stacks here.
        return mActivityStartController.obtainStarter(intent, "startActivityAsUser")
                .setCaller(caller)
                .setCallingPackage(callingPackage)
                .setResolvedType(resolvedType)
                .setResultTo(resultTo)
                .setResultWho(resultWho)
                .setRequestCode(requestCode)
                .setStartFlags(startFlags)
                .setProfilerInfo(profilerInfo)
                .setActivityOptions(bOptions)             //ActivityOptions
                .setMayWait(userId)
                .execute();

    }

}

```

### ActivityStartController

```java

/**
 * 外部界面启动控制器
 * Controller for delegating activity launches.
 */
public class ActivityStartController {

    ActivityStarter obtainStarter(Intent intent, String reason) {
        return mFactory.obtain().setIntent(intent).setReason(reason);
    }

}

```

### SafeActivityOptions

```java

class SafeActivityOptions {

    static SafeActivityOptions fromBundle(Bundle bOptions) {
        return bOptions != null
                ? new SafeActivityOptions(ActivityOptions.fromBundle(bOptions))
                : null;
    }

}

```

### ActivityStarter

```java

class ActivityStarter {

    private ActivityOptions mOptions;

    /*
     * Request details provided through setter methods. Should be reset after {@link #execute()}
     * to avoid unnecessarily retaining parameters. Note that the request is ignored when
     * {@link #startResolvedActivity} is invoked directly.
     */
    private Request mRequest = new Request();

    ActivityStarter setActivityOptions(Bundle bOptions) {
        return setActivityOptions(SafeActivityOptions.fromBundle(bOptions));
    }

    ActivityStarter setActivityOptions(SafeActivityOptions options) {
        mRequest.activityOptions = options;
        return this;
    }

    ActivityStarter setStartFlags(int startFlags) {
        mRequest.startFlags = startFlags;
        return this;
    }


    /**
     * Starts an activity based on the request parameters provided earlier.
     * @return The starter result.
     */
    int execute() {
        try {
            // TODO(b/64750076): Look into passing request directly to these methods to allow
            // for transactional diffs and preprocessing.
            if (mRequest.mayWait) {
                return startActivityMayWait(mRequest.caller, mRequest.callingUid,
                        mRequest.callingPackage, mRequest.realCallingPid, mRequest.realCallingUid,
                        mRequest.intent, mRequest.resolvedType,
                        mRequest.voiceSession, mRequest.voiceInteractor, mRequest.resultTo,
                        mRequest.resultWho, mRequest.requestCode, mRequest.startFlags,
                        mRequest.profilerInfo, mRequest.waitResult, mRequest.globalConfig,
                        mRequest.activityOptions, mRequest.ignoreTargetSecurity, mRequest.userId,
                        mRequest.inTask, mRequest.reason,
                        mRequest.allowPendingRemoteAnimationRegistryLookup,
                        mRequest.originatingPendingIntent);
            } else {
                return startActivity(mRequest.caller, mRequest.intent, mRequest.ephemeralIntent,
                        mRequest.resolvedType, mRequest.activityInfo, mRequest.resolveInfo,
                        mRequest.voiceSession, mRequest.voiceInteractor, mRequest.resultTo,
                        mRequest.resultWho, mRequest.requestCode, mRequest.callingPid,
                        mRequest.callingUid, mRequest.callingPackage, mRequest.realCallingPid,
                        mRequest.realCallingUid, mRequest.startFlags, mRequest.activityOptions,
                        mRequest.ignoreTargetSecurity, mRequest.componentSpecified,
                        mRequest.outActivity, mRequest.inTask, mRequest.reason,
                        mRequest.allowPendingRemoteAnimationRegistryLookup,
                        mRequest.originatingPendingIntent);
            }
        } finally {
            onExecutionComplete();
        }
    }

    private int startActivity(IApplicationThread caller, Intent intent, Intent ephemeralIntent,
            String resolvedType, ActivityInfo aInfo, ResolveInfo rInfo,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            IBinder resultTo, String resultWho, int requestCode, int callingPid, int callingUid,
            String callingPackage, int realCallingPid, int realCallingUid, int startFlags,
            SafeActivityOptions options, boolean ignoreTargetSecurity, boolean componentSpecified,
            ActivityRecord[] outActivity, TaskRecord inTask, String reason,
            boolean allowPendingRemoteAnimationRegistryLookup,
            PendingIntentRecord originatingPendingIntent) {

        ----------------------------------------------------------------------------------

        ActivityRecord r = new ActivityRecord(mService, callerApp, callingPid, callingUid,
                callingPackage, intent, resolvedType, aInfo, mService.getGlobalConfiguration(),
                resultRecord, resultWho, requestCode, componentSpecified, voiceSession != null,
                mSupervisor, checkedOptions, sourceRecord);

        -----------------------------------------------------------------------------------

        return startActivity(r, sourceRecord, voiceSession, voiceInteractor, startFlags,
                true /* doResume */, checkedOptions, inTask, outActivity);

    }


    private int startActivity(final ActivityRecord r, ActivityRecord sourceRecord,
                IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
                int startFlags, boolean doResume, ActivityOptions options, TaskRecord inTask,
                ActivityRecord[] outActivity) {

            result = startActivityUnchecked(r, sourceRecord, voiceSession, voiceInteractor,
                    startFlags, doResume, options, inTask, outActivity);

    }

    private int startActivityUnchecked(final ActivityRecord r, ActivityRecord sourceRecord,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            int startFlags, boolean doResume, ActivityOptions options, TaskRecord inTask,
            ActivityRecord[] outActivity) {

        setInitialState(r, options, inTask, doResume, startFlags, sourceRecord, voiceSession,
                voiceInteractor);

        if (mOptions != null) {
            preferredWindowingMode = mOptions.getLaunchWindowingMode();  //窗口模式
            preferredLaunchDisplayId = mOptions.getLaunchDisplayId();
        }

        --------------------------------------------------------------------------------

            result = setTaskFromReuseOrCreateNewTask(taskToAffiliate, topStack);

        -------------------------------------------------------------------------------
    }

    private void setInitialState(ActivityRecord r, ActivityOptions options, TaskRecord inTask,
            boolean doResume, int startFlags, ActivityRecord sourceRecord,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor) {

        mOptions = options;

    }


    private int setTaskFromReuseOrCreateNewTask(
            TaskRecord taskToAffiliate, ActivityStack topStack) {
        mTargetStack = computeStackFocus(mStartActivity, true, mLaunchFlags, mOptions);  // mOptions

    }


    private static class Request {

        int startFlags;

        SafeActivityOptions activityOptions;

    }

}

```

### ActivityRecord

```java

final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    ActivityOptions pendingOptions; // most recently given options

    ActivityRecord(ActivityManagerService _service, ProcessRecord _caller, int _launchedFromPid,
            int _launchedFromUid, String _launchedFromPackage, Intent _intent, String _resolvedType,
            ActivityInfo aInfo, Configuration _configuration,
            ActivityRecord _resultTo, String _resultWho, int _reqCode,
            boolean _componentSpecified, boolean _rootVoiceInteraction,
            ActivityStackSupervisor supervisor, ActivityOptions options,
            ActivityRecord sourceRecord) {

        if (options != null) {
            pendingOptions = options;
        }

    }

}

```









