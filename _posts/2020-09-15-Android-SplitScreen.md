---
layout:     post
title:      Android SplitScreen
subtitle:   Android P
date:       2020-09-15
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

## 代码

从Recent启动分屏模式

![recent_split_screen](/images/ams/recent_split_screen.png)

### Launcher

packages/apps/Launcher3/quickstep/src/com/android/quickstep/TaskSystemShortcut.java

```java

public class TaskSystemShortcut<T extends SystemShortcut> extends SystemShortcut {

    public static class SplitScreen extends TaskSystemShortcut {


        @Override
        public View.OnClickListener getOnClickListener(
                BaseDraggingActivity activity, TaskView taskView) {

            -------------------------------------------------------------------------------------------

                // 启动分屏
                if (ActivityManagerWrapper.getInstance().startActivityFromRecents(taskId,
                        ActivityOptionsCompat.makeSplitScreenOptions(dockTopOrLeft))) {
                    ISystemUiProxy sysUiProxy = RecentsModel.getInstance(activity).getSystemUiProxy();
                    try {
                        sysUiProxy.onSplitScreenInvoked();
                    } catch (RemoteException e) {
                        Log.w(TAG, "Failed to notify SysUI of split screen: ", e);
                        return;
                    }

                    -------------------------------------------------------------------

                }

        }
    }

}

public abstract class ActivityOptionsCompat {

    /**
     * @return ActivityOptions for starting a task in split screen.
     */
    public static ActivityOptions makeSplitScreenOptions(boolean dockTopLeft) {
        final ActivityOptions options = ActivityOptions.makeBasic();
        options.setLaunchWindowingMode(WINDOWING_MODE_SPLIT_SCREEN_PRIMARY);
        options.setSplitScreenCreateMode(dockTopLeft
                ? SPLIT_SCREEN_CREATE_MODE_TOP_OR_LEFT
                : SPLIT_SCREEN_CREATE_MODE_BOTTOM_OR_RIGHT);
        return options;
    }

}

```

### SystemServer

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {


    @Override
    public final int startActivityFromRecents(int taskId, Bundle bOptions) {
        enforceCallerIsRecentsOrHasPermission(START_TASKS_FROM_RECENTS,
                "startActivityFromRecents()");

        final int callingPid = Binder.getCallingPid();
        final int callingUid = Binder.getCallingUid();
        final SafeActivityOptions safeOptions = SafeActivityOptions.fromBundle(bOptions);
        final long origId = Binder.clearCallingIdentity();
        try {
            synchronized (this) {
                return mStackSupervisor.startActivityFromRecents(callingPid, callingUid, taskId,
                        safeOptions);
            }
        } finally {
            Binder.restoreCallingIdentity(origId);
        }
    }

}


public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener,
        RecentTasks.Callbacks {

    int startActivityFromRecents(int callingPid, int callingUid, int taskId,
            SafeActivityOptions options) {
        TaskRecord task = null;
        final String callingPackage;
        final Intent intent;
        final int userId;
        int activityType = ACTIVITY_TYPE_UNDEFINED;
        int windowingMode = WINDOWING_MODE_UNDEFINED;       // WINDOWING_MODE_SPLIT_SCREEN_PRIMARY
        final ActivityOptions activityOptions = options != null
                ? options.getOptions(this)
                : null;
        if (activityOptions != null) {
            activityType = activityOptions.getLaunchActivityType();
            windowingMode = activityOptions.getLaunchWindowingMode();
        }
        if (activityType == ACTIVITY_TYPE_HOME || activityType == ACTIVITY_TYPE_RECENTS) {
            throw new IllegalArgumentException("startActivityFromRecents: Task "
                    + taskId + " can't be launch in the home/recents stack.");
        }

        mWindowManager.deferSurfaceLayout();
        try {
            if (windowingMode == WINDOWING_MODE_SPLIT_SCREEN_PRIMARY) {
                mWindowManager.setDockedStackCreateState(
                        activityOptions.getSplitScreenCreateMode(), null /* initialBounds */);

                // Defer updating the stack in which recents is until the app transition is done, to
                // not run into issues where we still need to draw the task in recents but the
                // docked stack is already created.
                deferUpdateRecentsHomeStackBounds();
                mWindowManager.prepareAppTransition(TRANSIT_DOCK_TASK_FROM_RECENTS, false);
            }

            task = anyTaskForIdLocked(taskId, MATCH_TASK_IN_STACKS_OR_RECENT_TASKS_AND_RESTORE,
                    activityOptions, ON_TOP);

            -----------------------------------------------------------------------------------

            callingPackage = task.mCallingPackage;
            intent = task.intent;
            intent.addFlags(Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY);
            userId = task.userId;
            return mService.getActivityStartController().startActivityInPackage(
                    task.mCallingUid, callingPid, callingUid, callingPackage, intent, null, null,
                    null, 0, 0, options, userId, task, "startActivityFromRecents",
                    false /* validateIncomingUser */, null /* originatingPendingIntent */);
        } finally {
            if (windowingMode == WINDOWING_MODE_SPLIT_SCREEN_PRIMARY && task != null) {
                // If we are launching the task in the docked stack, put it into resizing mode so
                // the window renders full-screen with the background filling the void. Also only
                // call this at the end to make sure that tasks exists on the window manager side.
                setResizingDuringAnimation(task);

                final ActivityDisplay display = task.getStack().getDisplay();
                final ActivityStack topSecondaryStack =
                        display.getTopStackInWindowingMode(WINDOWING_MODE_SPLIT_SCREEN_SECONDARY);

                // 如果第二窗口显示的为Home则将Home移动到主焦点界面
                if (topSecondaryStack.isActivityTypeHome()) {
                    // If the home activity if the top split-screen secondary stack, then the
                    // primary split-screen stack is in the minimized mode which means it can't
                    // receive input keys, so we should move the focused app to the home app so that
                    // window manager can correctly calculate the focus window that can receive
                    // input keys.
                    moveHomeStackToFront("startActivityFromRecents: homeVisibleInSplitScreen");

                    // Immediately update the minimized docked stack mode, the upcoming animation
                    // for the docked activity (WMS.overridePendingAppTransitionMultiThumbFuture)
                    // will do the animation to the target bounds
                    mWindowManager.checkSplitScreenMinimizedChanged(false /* animate */);
                }
            }
            mWindowManager.continueSurfaceLayout();
        }
    }

}


public class WindowManagerService extends IWindowManager.Stub
        implements Watchdog.Monitor, WindowManagerPolicy.WindowManagerFuncs {

    public void checkSplitScreenMinimizedChanged(boolean animate) {
        synchronized (mWindowMap) {
            final DisplayContent displayContent = getDefaultDisplayContentLocked();
            displayContent.getDockedDividerController().checkMinimizeChanged(animate);
        }
    }

}

public class DockedStackDividerController {

    DockedStackDividerController(WindowManagerService service, DisplayContent displayContent) {
        mService = service;
        mDisplayContent = displayContent;
        final Context context = service.mContext;
        mMinimizedDockInterpolator = AnimationUtils.loadInterpolator(
                context, android.R.interpolator.fast_out_slow_in);
        loadDimens();
    }

    private void loadDimens() {
        final Context context = mService.mContext;
        mDividerWindowWidth = context.getResources().getDimensionPixelSize(
                com.android.internal.R.dimen.docked_stack_divider_thickness);
        mDividerInsets = context.getResources().getDimensionPixelSize(
                com.android.internal.R.dimen.docked_stack_divider_insets);
        mDividerWindowWidthInactive = WindowManagerService.dipToPixel(
                DIVIDER_WIDTH_INACTIVE_DP, mDisplayContent.getDisplayMetrics());

        // 启动分屏后的最小化宽度
        mTaskHeightInMinimizedMode = getTaskHeightInMinimizedMode();
        initSnapAlgorithmForRotations();
    }

    void checkMinimizeChanged(boolean animate) {
        
        ------------------------------------------------------------

        setMinimizedDockedStack(homeVisible || minimizedForRecentsAnimation, animate);

    }

}

```

## SystemUI

```java

public class Divider extends SystemUI {

    @Override
    public void start() {
        mWindowManager = new DividerWindowManager(mContext);
        update(mContext.getResources().getConfiguration());
        putComponent(Divider.class, this);
        mDockDividerVisibilityListener = new DockDividerVisibilityListener();
        SystemServicesProxy ssp = Recents.getSystemServices();
        ssp.registerDockedStackListener(mDockDividerVisibilityListener);
        mForcedResizableController = new ForcedResizableInfoActivityController(mContext);
        EventBus.getDefault().register(this);
    }

    // 分割线
    private void addDivider(Configuration configuration) {
        mView = (DividerView)
                LayoutInflater.from(mContext).inflate(R.layout.docked_stack_divider, null);
        mView.injectDependencies(mWindowManager, mDividerState);
        mView.setVisibility(mVisible ? View.VISIBLE : View.INVISIBLE);
        mView.setMinimizedDockStack(mMinimized, mHomeStackResizable);
        final int size = mContext.getResources().getDimensionPixelSize(
                com.android.internal.R.dimen.docked_stack_divider_thickness);
        final boolean landscape = configuration.orientation == ORIENTATION_LANDSCAPE;
        final int width = landscape ? size : MATCH_PARENT;
        final int height = landscape ? MATCH_PARENT : size;
        mWindowManager.add(mView, width, height);
    }

}

```

## setMinimizedDockedStack Trace

```txt

// SystemServer trace

system_process D/LXG: updateMinimizedDockedStack: java.lang.Throwable
        at com.android.server.wm.DockedStackDividerController.notifyDockedStackMinimizedChanged(DockedStackDividerController.java:554)
        at com.android.server.wm.DockedStackDividerController.setMinimizedDockedStack(DockedStackDividerController.java:763)
        at com.android.server.wm.DockedStackDividerController.checkMinimizeChanged(DockedStackDividerController.java:737)
        at com.android.server.wm.WindowManagerService.checkSplitScreenMinimizedChanged(WindowManagerService.java:2823)
        at com.android.server.am.ActivityStackSupervisor.startActivityFromRecents(ActivityStackSupervisor.java:4952)
        at com.android.server.am.ActivityManagerService.startActivityFromRecents(ActivityManagerService.java:5652)
        at android.app.IActivityManager$Stub.onTransact(IActivityManager.java:2357)
        at com.android.server.am.ActivityManagerService.onTransact(ActivityManagerService.java:3320)
        at android.os.Binder.execTransact(Binder.java:731)

// SystemUI trace

com.android.systemui D/LXG: updateMinimizedDockedStack: java.lang.Throwable
        at com.android.systemui.stackdivider.Divider.updateMinimizedDockedStack(Divider.java:130)
        at com.android.systemui.stackdivider.Divider.access$800(Divider.java:41)
        at com.android.systemui.stackdivider.Divider$DockDividerVisibilityListener.onDockedStackMinimizedChanged(Divider.java:198)
        at android.view.IDockedStackListener$Stub.onTransact(IDockedStackListener.java:77)
        at android.os.Binder.execTransact(Binder.java:731)

com.android.systemui D/LXG: resizeStack: java.lang.Throwable
        at com.android.systemui.stackdivider.DividerView.resizeStack(DividerView.java:1004)
        at com.android.systemui.stackdivider.DividerView.resizeStack(DividerView.java:999)
        at com.android.systemui.stackdivider.DividerView.setMinimizedDockStack(DividerView.java:798)
        at com.android.systemui.stackdivider.Divider$2.run(Divider.java:139)
        at android.os.Handler.handleCallback(Handler.java:873)
        at android.os.Handler.dispatchMessage(Handler.java:99)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6746)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)

```



