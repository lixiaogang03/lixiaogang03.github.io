---
layout:     post
title:      Android Freeform Mode
subtitle:   类似于 Windows 的窗口模式
date:       2020-07-29
author:     LXG
header-img: img/post-bg-e2e-ux.jpg
catalog: true
tags:
    - wms
---

[WindowManagerService架构剖析-简书](https://www.jianshu.com/p/6e575d9160f2)

## AMS

![ams_activity_stack](/images/ams/ams_activity_stack.png)

![ams_data_structure](/images/ams/ams_data_structure.webp)

## WMS

![wms_data_structure](/images/wms/wms_data_structure.webp)

## Token

![window_token](/images/wms/window_token.webp)

[AMS_WMS_APP 中Token惟一性-简书](https://www.jianshu.com/p/5e2efbaa2949)

![wms_token_2](/images/wms/wms_token_2.webp)

### appToken 

```java

/**
 * An entry in the history stack, representing an activity.
 */
final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    final IApplicationToken.Stub appToken; // window manager token

    ActivityRecord(ActivityManagerService _service, ProcessRecord _caller, int _launchedFromPid,
            int _launchedFromUid, String _launchedFromPackage, Intent _intent, String _resolvedType,
            ActivityInfo aInfo, Configuration _configuration,
            ActivityRecord _resultTo, String _resultWho, int _reqCode,
            boolean _componentSpecified, boolean _rootVoiceInteraction,
            ActivityStackSupervisor supervisor, ActivityOptions options,
            ActivityRecord sourceRecord) {

        appToken = new Token(this);

    }

    static class Token extends IApplicationToken.Stub {
        private final WeakReference<ActivityRecord> weakActivity;

        Token(ActivityRecord activity) {
            weakActivity = new WeakReference<>(activity);
        }

        private static ActivityRecord tokenToActivityRecordLocked(Token token) {
            if (token == null) {
                return null;
            }
            ActivityRecord r = token.weakActivity.get();
            if (r == null || r.getStack() == null) {
                return null;
            }
            return r;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder(128);
            sb.append("Token{");
            sb.append(Integer.toHexString(System.identityHashCode(this)));
            sb.append(' ');
            sb.append(weakActivity.get());
            sb.append('}');
            return sb.toString();
        }
    }


    void createWindowContainer() {

        // 将token传递到WMS中
        mWindowContainerController = new AppWindowContainerController(taskController, appToken,
                this, Integer.MAX_VALUE /* add on top */, info.screenOrientation, fullscreen,
                (info.flags & FLAG_SHOW_FOR_ALL_USERS) != 0, info.configChanges,
                task.voiceSession != null, mLaunchTaskBehind, isAlwaysFocusable(),
                appInfo.targetSdkVersion, mRotationAnimationHint,
                ActivityManagerService.getInputDispatchingTimeoutLocked(this) * 1000000L,
                getOverrideConfiguration(), mBounds);

    }

}


public class AppWindowContainerController
        extends WindowContainerController<AppWindowToken, AppWindowContainerListener> {

    private final IApplicationToken mToken;

    public AppWindowContainerController(TaskWindowContainerController taskController,
            IApplicationToken token, AppWindowContainerListener listener, int index,
            int requestedOrientation, boolean fullscreen, boolean showForAllUsers, int configChanges,
            boolean voiceInteraction, boolean launchTaskBehind, boolean alwaysFocusable,
            int targetSdkVersion, int rotationAnimationHint, long inputDispatchingTimeoutNanos,
            WindowManagerService service, Configuration overrideConfig, Rect bounds) {

        mToken = token;

        synchronized(mWindowMap) {
            AppWindowToken atoken = mRoot.getAppWindowToken(mToken.asBinder());

            atoken = createAppWindow(mService, token, voiceInteraction, task.getDisplayContent(),
                    inputDispatchingTimeoutNanos, fullscreen, showForAllUsers, targetSdkVersion,
                    requestedOrientation, rotationAnimationHint, configChanges, launchTaskBehind,
                    alwaysFocusable, this, overrideConfig, bounds);

        }
    }


    AppWindowToken createAppWindow(WindowManagerService service, IApplicationToken token,
            boolean voiceInteraction, DisplayContent dc, long inputDispatchingTimeoutNanos,
            boolean fullscreen, boolean showForAllUsers, int targetSdk, int orientation,
            int rotationAnimationHint, int configChanges, boolean launchTaskBehind,
            boolean alwaysFocusable, AppWindowContainerController controller,
            Configuration overrideConfig, Rect bounds) {
        return new AppWindowToken(service, token, voiceInteraction, dc,
                inputDispatchingTimeoutNanos, fullscreen, showForAllUsers, targetSdk, orientation,
                rotationAnimationHint, configChanges, launchTaskBehind, alwaysFocusable,
                controller, overrideConfig, bounds);
    }


}


class AppWindowToken extends WindowToken implements WindowManagerService.AppFreezeListener {

    // Non-null only for application tokens.
    final IApplicationToken appToken;

    AppWindowToken(WindowManagerService service, IApplicationToken token, boolean voiceInteraction,
            DisplayContent dc, boolean fillsParent, Configuration overrideConfig, Rect bounds) {
        super(service, token != null ? token.asBinder() : null, TYPE_APPLICATION, true, dc,
                false /* ownerCanManageAppTokens */);
        appToken = token;

    }

}

class WindowToken extends WindowContainer<WindowState> {

    // The actual token.
    final IBinder token;


    WindowToken(WindowManagerService service, IBinder _token, int type, boolean persistOnEmpty,
            DisplayContent dc, boolean ownerCanManageAppTokens) {

        token = _token;

    }
}

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener {

    final boolean realStartActivityLocked(ActivityRecord r, ProcessRecord app,
            boolean andResume, boolean checkConfig) throws RemoteException {

                app.thread.scheduleLaunchActivity(new Intent(r.intent), r.appToken,
                        System.identityHashCode(r), r.info,
                        // TODO: Have this take the merged configuration instead of separate global
                        // and override configs.
                        mergedConfiguration.getGlobalConfiguration(),
                        mergedConfiguration.getOverrideConfiguration(), r.compat,
                        r.launchedFromPackage, task.voiceInteractor, app.repProcState, r.icicle,
                        r.persistentState, results, newIntents, !andResume,
                        mService.isNextTransitionForward(), profilerInfo);

    }

}


public final class ActivityThread {

   private class ApplicationThread extends IApplicationThread.Stub {


        // we use token to identify this activity without having to send the
        // activity itself back to the activity manager. (matters more with ipc)
        @Override
        public final void scheduleLaunchActivity(Intent intent, IBinder token, int ident,
                ActivityInfo info, Configuration curConfig, Configuration overrideConfig,
                CompatibilityInfo compatInfo, String referrer, IVoiceInteractor voiceInteractor,
                int procState, Bundle state, PersistableBundle persistentState,
                List<ResultInfo> pendingResults, List<ReferrerIntent> pendingNewIntents,
                boolean notResumed, boolean isForward, ProfilerInfo profilerInfo) {

            ActivityClientRecord r = new ActivityClientRecord();

            r.token = token;

        }

   }

}


```


## AMS vs WMS

[Android之AMS和WMS数据对应关系(基于Android9.0)-简书](https://www.jianshu.com/p/c14b1a5a3a84)

![ams_wms](/images/ams/ams_wms.webp)

### ActivityStack vs TaskStack

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener {

    // displayId 多屏幕显示
    ActivityStack createStackOnDisplay(int stackId, int displayId, boolean onTop) {
        final ActivityDisplay activityDisplay = getActivityDisplayOrCreateLocked(displayId);
        if (activityDisplay == null) {
            return null;
        }
        return createStack(stackId, activityDisplay, onTop);

    }


    ActivityStack createStack(int stackId, ActivityDisplay display, boolean onTop) {
        switch (stackId) {
            case PINNED_STACK_ID:
                return new PinnedActivityStack(display, stackId, this, mRecentTasks, onTop);
            default:
                return new ActivityStack(display, stackId, this, mRecentTasks, onTop);
        }
    }

}

/**
 * State and management of a single stack of activities.
 */
class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    final int mStackId;

    ActivityStack(ActivityStackSupervisor.ActivityDisplay display, int stackId,
            ActivityStackSupervisor supervisor, RecentTasks recentTasks, boolean onTop) {

        mStackId = stackId;

        mWindowContainerController = createStackWindowController(display.mDisplayId, onTop,
                mTmpRect2);

    }

    T createStackWindowController(int displayId, boolean onTop, Rect outBounds) {
        return (T) new StackWindowController(mStackId, this, displayId, onTop, outBounds);
    }

}


public class StackWindowController
        extends WindowContainerController<TaskStack, StackWindowListener> {

    public StackWindowController(int stackId, StackWindowListener listener,
            int displayId, boolean onTop, Rect outBounds, WindowManagerService service) {
        super(listener, service);
        mStackId = stackId;
        mHandler = new H(new WeakReference<>(this), service.mH.getLooper());

        synchronized (mWindowMap) {
            final DisplayContent dc = mRoot.getDisplayContent(displayId);
            if (dc == null) {
                throw new IllegalArgumentException("Trying to add stackId=" + stackId
                        + " to unknown displayId=" + displayId);
            }

            // 与 TaskStack 联系起来了
            final TaskStack stack = dc.addStackToDisplay(stackId, onTop);
            stack.setController(this);
            getRawBounds(outBounds);
        }
    }

}

class DisplayContent extends WindowContainer<DisplayContent.DisplayChildWindowContainer> {

    TaskStack addStackToDisplay(int stackId, boolean onTop) {
        if (DEBUG_STACK) Slog.d(TAG_WM, "Create new stackId=" + stackId + " on displayId="
                + mDisplayId);

        TaskStack stack = getStackById(stackId);
        if (stack != null) {
            // It's already attached to the display...clear mDeferRemoval and move stack to
            // appropriate z-order on display as needed.
            stack.mDeferRemoval = false;
            // We're not moving the display to front when we're adding stacks, only when
            // requested to change the position of stack explicitly.
            mTaskStackContainers.positionChildAt(onTop ? POSITION_TOP : POSITION_BOTTOM, stack,
                    false /* includingParents */);
        } else {
            stack = new TaskStack(mService, stackId);
            mTaskStackContainers.addStackToDisplay(stack, onTop);
        }

        if (stackId == DOCKED_STACK_ID) {
            mDividerControllerLocked.notifyDockedStackExistsChanged(true);
        }
        return stack;
    }

}

public class TaskStack extends WindowContainer<Task> implements DimLayer.DimLayerUser,
        BoundsAnimationTarget {

    /** Unique identifier */
    final int mStackId;

    TaskStack(WindowManagerService service, int stackId) {
        mStackId = stackId;
    }

}

class WindowContainer<E extends WindowContainer> implements Comparable<WindowContainer> {

    // The owner/creator for this container. No controller if null.
    private WindowContainerController mController;

    void setController(WindowContainerController controller) {
        if (mController != null && controller != null) {
            throw new IllegalArgumentException("Can't set controller=" + mController
                    + " for container=" + this + " Already set to=" + mController);
        }
        if (controller != null) {
            controller.setContainer(this);
        } else if (mController != null) {
            mController.setContainer(null);
        }
        mController = controller;
    }


}

```

### TaskRecord vs Task

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    TaskRecord createTaskRecord(int taskId, ActivityInfo info, Intent intent,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            boolean toTop, int type) {
        TaskRecord task = new TaskRecord(mService, taskId, info, intent, voiceSession,
                voiceInteractor, type);
        // add the task to stack first, mTaskPositioner might need the stack association
        addTask(task, toTop, "createTaskRecord");
        final boolean isLockscreenShown = mService.mStackSupervisor.mKeyguardController
                .isKeyguardShowing(mDisplayId != INVALID_DISPLAY ? mDisplayId : DEFAULT_DISPLAY);
        if (!layoutTaskInStack(task, info.windowLayout) && mBounds != null && task.isResizeable()
                && !isLockscreenShown) {
            task.updateOverrideConfiguration(mBounds);
        }

        // 与WMS的task建立联系
        task.createWindowContainer(toTop, (info.flags & FLAG_SHOW_FOR_ALL_USERS) != 0);
        return task;
    }

}


final class TaskRecord extends ConfigurationContainer implements TaskWindowContainerListener {

    final int taskId;       // Unique identifier for this task.

    private TaskWindowContainerController mWindowContainerController;

    TaskRecord(ActivityManagerService service, int _taskId, ActivityInfo info, Intent _intent,
            IVoiceInteractionSession _voiceSession, IVoiceInteractor _voiceInteractor, int type) {

        taskId = _taskId;

    }


    void createWindowContainer(boolean onTop, boolean showForAllUsers) {
        if (mWindowContainerController != null) {
            throw new IllegalArgumentException("Window container=" + mWindowContainerController
                    + " already created for task=" + this);
        }

        final Rect bounds = updateOverrideConfigurationFromLaunchBounds();
        final Configuration overrideConfig = getOverrideConfiguration();
        setWindowContainerController(new TaskWindowContainerController(taskId, this,
                getStack().getWindowContainerController(), userId, bounds, overrideConfig,
                mResizeMode, mSupportsPictureInPicture, isHomeTask(), onTop, showForAllUsers,
                lastTaskDescription));
    }


    protected void setWindowContainerController(TaskWindowContainerController controller) {
        if (mWindowContainerController != null) {
            throw new IllegalArgumentException("Window container=" + mWindowContainerController
                    + " already created for task=" + this);
        }

        mWindowContainerController = controller;
    }

}


public class TaskWindowContainerController
        extends WindowContainerController<Task, TaskWindowContainerListener> {

    private final int mTaskId;

    public TaskWindowContainerController(int taskId, TaskWindowContainerListener listener,
            StackWindowController stackController, int userId, Rect bounds,
            Configuration overrideConfig, int resizeMode, boolean supportsPictureInPicture,
            boolean homeTask, boolean toTop, boolean showForAllUsers,
            TaskDescription taskDescription, WindowManagerService service) {
        super(listener, service);
        mTaskId = taskId;
        mHandler = new H(new WeakReference<>(this), service.mH.getLooper());

        synchronized(mWindowMap) {
            if (DEBUG_STACK) Slog.i(TAG_WM, "TaskWindowContainerController: taskId=" + taskId
                    + " stack=" + stackController + " bounds=" + bounds);

            final TaskStack stack = stackController.mContainer;
            if (stack == null) {
                throw new IllegalArgumentException("TaskWindowContainerController: invalid stack="
                        + stackController);
            }
            EventLog.writeEvent(WM_TASK_CREATED, taskId, stack.mStackId);
            final Task task = createTask(taskId, stack, userId, bounds, overrideConfig, resizeMode,
                    supportsPictureInPicture, homeTask, taskDescription);
            final int position = toTop ? POSITION_TOP : POSITION_BOTTOM;
            // We only want to move the parents to the parents if we are creating this task at the
            // top of its stack.
            stack.addTask(task, position, showForAllUsers, toTop /* moveParents */);
        }
    }

    Task createTask(int taskId, TaskStack stack, int userId, Rect bounds,
            Configuration overrideConfig, int resizeMode, boolean supportsPictureInPicture,
            boolean homeTask, TaskDescription taskDescription) {
        return new Task(taskId, stack, userId, mService, bounds, overrideConfig, resizeMode,
                supportsPictureInPicture, homeTask, taskDescription, this);
    }

}


class Task extends WindowContainer<AppWindowToken> implements DimLayer.DimLayerUser {


    // TODO: Track parent marks like this in WindowContainer.
    TaskStack mStack;
    final int mTaskId;

    Task(int taskId, TaskStack stack, int userId, WindowManagerService service, Rect bounds,
            Configuration overrideConfig, int resizeMode, boolean supportsPictureInPicture,
            boolean homeTask, TaskDescription taskDescription,
            TaskWindowContainerController controller) {
        mTaskId = taskId;
        mStack = stack;
        mUserId = userId;
        mService = service;
        mResizeMode = resizeMode;
        mSupportsPictureInPicture = supportsPictureInPicture;
        mHomeTask = homeTask;
        setController(controller);
        setBounds(bounds, overrideConfig);
        mTaskDescription = taskDescription;

        // Tasks have no set orientation value (including SCREEN_ORIENTATION_UNSPECIFIED).
        setOrientation(SCREEN_ORIENTATION_UNSET);
    }

}

```

### ActivityRecord vs AppWindowToken

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    final void startActivityLocked(ActivityRecord r, ActivityRecord focusedTopActivity,
            boolean newTask, boolean keepCurTransition, ActivityOptions options) {
        TaskRecord rTask = r.getTask();
        final int taskId = rTask.taskId;


        // TODO: Need to investigate if it is okay for the controller to already be created by the
        // time we get to this point. I think it is, but need to double check.
        // Use test in b/34179495 to trace the call path.
        if (r.getWindowContainerController() == null) {
            r.createWindowContainer();
        }
        task.setFrontOfTask();

    }

}


/**
 * An entry in the history stack, representing an activity.
 */
final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    final IApplicationToken.Stub appToken; // window manager token
    AppWindowContainerController mWindowContainerController;
    final ActivityInfo info; // all about me


    ActivityRecord(ActivityManagerService _service, ProcessRecord _caller, int _launchedFromPid,
            int _launchedFromUid, String _launchedFromPackage, Intent _intent, String _resolvedType,
            ActivityInfo aInfo, Configuration _configuration,
            ActivityRecord _resultTo, String _resultWho, int _reqCode,
            boolean _componentSpecified, boolean _rootVoiceInteraction,
            ActivityStackSupervisor supervisor, ActivityOptions options,
            ActivityRecord sourceRecord) {
        service = _service;
        appToken = new Token(this);
        info = aInfo;

    }

    void createWindowContainer() {

        mWindowContainerController = new AppWindowContainerController(taskController, appToken,
                this, Integer.MAX_VALUE /* add on top */, info.screenOrientation, fullscreen,
                (info.flags & FLAG_SHOW_FOR_ALL_USERS) != 0, info.configChanges,
                task.voiceSession != null, mLaunchTaskBehind, isAlwaysFocusable(),
                appInfo.targetSdkVersion, mRotationAnimationHint,
                ActivityManagerService.getInputDispatchingTimeoutLocked(this) * 1000000L,
                getOverrideConfiguration(), mBounds);

    }

}


public class AppWindowContainerController
        extends WindowContainerController<AppWindowToken, AppWindowContainerListener> {

    private final IApplicationToken mToken;

    public AppWindowContainerController(TaskWindowContainerController taskController,
            IApplicationToken token, AppWindowContainerListener listener, int index,
            int requestedOrientation, boolean fullscreen, boolean showForAllUsers, int configChanges,
            boolean voiceInteraction, boolean launchTaskBehind, boolean alwaysFocusable,
            int targetSdkVersion, int rotationAnimationHint, long inputDispatchingTimeoutNanos,
            WindowManagerService service, Configuration overrideConfig, Rect bounds) {
        super(listener, service);
        mHandler = new H(service.mH.getLooper());
        mToken = token;
        synchronized(mWindowMap) {
            AppWindowToken atoken = mRoot.getAppWindowToken(mToken.asBinder());
            if (atoken != null) {
                // TODO: Should this throw an exception instead?
                Slog.w(TAG_WM, "Attempted to add existing app token: " + mToken);
                return;
            }

            final Task task = taskController.mContainer;
            if (task == null) {
                throw new IllegalArgumentException("AppWindowContainerController: invalid "
                        + " controller=" + taskController);
            }

            // 与WMS的AppWidnowToken建立关系
            atoken = createAppWindow(mService, token, voiceInteraction, task.getDisplayContent(),
                    inputDispatchingTimeoutNanos, fullscreen, showForAllUsers, targetSdkVersion,
                    requestedOrientation, rotationAnimationHint, configChanges, launchTaskBehind,
                    alwaysFocusable, this, overrideConfig, bounds);
            if (DEBUG_TOKEN_MOVEMENT || DEBUG_ADD_REMOVE) Slog.v(TAG_WM, "addAppToken: " + atoken
                    + " controller=" + taskController + " at " + index);
            task.addChild(atoken, index);
        }

    }

    AppWindowToken createAppWindow(WindowManagerService service, IApplicationToken token,
            boolean voiceInteraction, DisplayContent dc, long inputDispatchingTimeoutNanos,
            boolean fullscreen, boolean showForAllUsers, int targetSdk, int orientation,
            int rotationAnimationHint, int configChanges, boolean launchTaskBehind,
            boolean alwaysFocusable, AppWindowContainerController controller,
            Configuration overrideConfig, Rect bounds) {
        return new AppWindowToken(service, token, voiceInteraction, dc,
                inputDispatchingTimeoutNanos, fullscreen, showForAllUsers, targetSdk, orientation,
                rotationAnimationHint, configChanges, launchTaskBehind, alwaysFocusable,
                controller, overrideConfig, bounds);
    }

}


/**
 * Version of WindowToken that is specifically for a particular application (or
 * really activity) that is displaying windows.
 */
class AppWindowToken extends WindowToken implements WindowManagerService.AppFreezeListener {

    // Non-null only for application tokens.
    final IApplicationToken appToken;

    // The bounds of this activity. Mainly used for aspect-ratio compatibility.
    // TODO(b/36505427): Every level on WindowContainer now has bounds information, which directly
    // affects the configuration. We should probably move this into that class.
    private final Rect mBounds = new Rect();

    AppWindowToken(WindowManagerService service, IApplicationToken token, boolean voiceInteraction,
            DisplayContent dc, long inputDispatchingTimeoutNanos, boolean fullscreen,
            boolean showForAllUsers, int targetSdk, int orientation, int rotationAnimationHint,
            int configChanges, boolean launchTaskBehind, boolean alwaysFocusable,
            AppWindowContainerController controller, Configuration overrideConfig, Rect bounds) {
        this(service, token, voiceInteraction, dc, fullscreen, overrideConfig, bounds);
        setController(controller);
    }

}


class WindowToken extends WindowContainer<WindowState> {

    // The actual token.
    final IBinder token;

}

class WindowContainer<E extends WindowContainer> implements Comparable<WindowContainer> {

    // The owner/creator for this container. No controller if null.
    private WindowContainerController mController;

    void setController(WindowContainerController controller) {
        if (mController != null && controller != null) {
            throw new IllegalArgumentException("Can't set controller=" + mController
                    + " for container=" + this + " Already set to=" + mController);
        }
        if (controller != null) {
            controller.setContainer(this);
        } else if (mController != null) {
            mController.setContainer(null);
        }
        mController = controller;
    }

}

/** A window in the window manager. */
class WindowState extends WindowContainer<WindowState> implements WindowManagerPolicy.WindowState {

    final Session mSession;
    final IWindow mClient;

    // The same object as mToken if this is an app window and null for non-app windows.
    AppWindowToken mAppToken;

}

```

![ams_vs_wms](/images/ams/ams_vs_wms.png)


