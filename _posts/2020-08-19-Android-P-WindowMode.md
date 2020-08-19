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

### ActivityDisplay

```java

class ActivityDisplay extends ConfigurationContainer<ActivityStack>
        implements WindowContainerListener {

    // 是否创建新的ActivityStack
    private boolean alwaysCreateStack(int windowingMode, int activityType) {
        // Always create a stack for fullscreen, freeform, and split-screen-secondary windowing
        // modes so that we can manage visual ordering and return types correctly.
        return activityType == ACTIVITY_TYPE_STANDARD
                && (windowingMode == WINDOWING_MODE_FULLSCREEN
                || windowingMode == WINDOWING_MODE_FREEFORM
                || windowingMode == WINDOWING_MODE_SPLIT_SCREEN_SECONDARY);
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

### ActivityStack

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

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

    /**
     * 通过选择还可以更新可见活动的配置来确保可见性。
     * Ensure visibility with an option to also update the configuration of visible activities.
     * @see #ensureActivitiesVisibleLocked(ActivityRecord, int, boolean)
     * @see ActivityStackSupervisor#ensureActivitiesVisibleLocked(ActivityRecord, int, boolean)
     */
    // TODO: Should be re-worked based on the fact that each task as a stack in most cases.
    final void ensureActivitiesVisibleLocked(ActivityRecord starting, int configChanges,
            boolean preserveWindows, boolean notifyClients) {

        ---------------------------------------------------------------------------------------------

                final int windowingMode = getWindowingMode();
                if (windowingMode == WINDOWING_MODE_FREEFORM) {
                    // The visibility of tasks and the activities they contain in freeform stack are
                    // determined individually unlike other stacks where the visibility or fullscreen
                    // status of an activity in a previous task affects other.
                    behindFullscreenActivity = !stackShouldBeVisible;
                } else if (isActivityTypeHome()) {
                    if (DEBUG_VISIBILITY) Slog.v(TAG_VISIBILITY, "Home task: at " + task
                            + " stackShouldBeVisible=" + stackShouldBeVisible
                            + " behindFullscreenActivity=" + behindFullscreenActivity);
                    // No other task in the home stack should be visible behind the home activity.
                    // Home activities is usually a translucent activity with the wallpaper behind
                    // them. However, when they don't have the wallpaper behind them, we want to
                    // show activities in the next application stack behind them vs. another
                    // task in the home stack like recents.
                    behindFullscreenActivity = true;
                }

        --------------------------------------------------------------------------------------------

    }

    /** @return True if the resizing of the primary-split-screen stack affects this stack size. */
    boolean affectedBySplitScreenResize() {
        if (!supportsSplitScreenWindowingMode()) {
            return false;
        }
        final int windowingMode = getWindowingMode();
        return windowingMode != WINDOWING_MODE_FREEFORM && windowingMode != WINDOWING_MODE_PINNED;
    }

}

```

### ActivityStackSupervisor

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener,
        RecentTasks.Callbacks {

    // TODO: Can probably be consolidated into getLaunchStack()...
    private boolean isValidLaunchStack(ActivityStack stack, int displayId, ActivityRecord r) {
        switch (stack.getActivityType()) {
            case ACTIVITY_TYPE_HOME: return r.isActivityTypeHome();
            case ACTIVITY_TYPE_RECENTS: return r.isActivityTypeRecents();
            case ACTIVITY_TYPE_ASSISTANT: return r.isActivityTypeAssistant();
        }
        switch (stack.getWindowingMode()) {
            case WINDOWING_MODE_FULLSCREEN: return true;
            case WINDOWING_MODE_FREEFORM: return r.supportsFreeform();
            case WINDOWING_MODE_PINNED: return r.supportsPictureInPicture();
            case WINDOWING_MODE_SPLIT_SCREEN_PRIMARY: return r.supportsSplitScreenWindowingMode();
            case WINDOWING_MODE_SPLIT_SCREEN_SECONDARY: return r.supportsSplitScreenWindowingMode();
        }

        if (!stack.isOnHomeDisplay()) {
            return r.canBeLaunchedOnDisplay(displayId);
        }
        Slog.e(TAG, "isValidLaunchStack: Unexpected stack=" + stack);
        return false;
    }

    /**
     * Returns the reparent target stack, creating the stack if necessary.  This call also enforces
     * the various checks on tasks that are going to be reparented from one stack to another.
     */
    // TODO: Look into changing users to this method to ActivityDisplay.resolveWindowingMode()
    ActivityStack getReparentTargetStack(TaskRecord task, ActivityStack stack, boolean toTop) {

        -----------------------------------------------------------------------------------------

        // Ensure that we aren't trying to move into a freeform stack without freeform support
        if (stack.getWindowingMode() == WINDOWING_MODE_FREEFORM
                && !mService.mSupportsFreeformWindowManagement) {
            throw new IllegalArgumentException("Device doesn't support freeform, can not reparent"
                    + " task=" + task);
        }

        -----------------------------------------------------------------------------------------

    }

}

```

### ActivityStarter

```java

class ActivityStarter {

    /** Check if provided activity record can launch in currently focused stack. */
    // TODO: This method can probably be consolidated into getLaunchStack() below.
    private boolean canLaunchIntoFocusedStack(ActivityRecord r, boolean newTask) {
        final ActivityStack focusedStack = mSupervisor.mFocusedStack;
        final boolean canUseFocusedStack;
        if (focusedStack.isActivityTypeAssistant()) {
            canUseFocusedStack = r.isActivityTypeAssistant();
        } else {
            switch (focusedStack.getWindowingMode()) {
                case WINDOWING_MODE_FULLSCREEN:
                    // The fullscreen stack can contain any task regardless of if the task is
                    // resizeable or not. So, we let the task go in the fullscreen task if it is the
                    // focus stack.
                    canUseFocusedStack = true;
                    break;
                case WINDOWING_MODE_SPLIT_SCREEN_PRIMARY:
                case WINDOWING_MODE_SPLIT_SCREEN_SECONDARY:
                    // Any activity which supports split screen can go in the docked stack.
                    canUseFocusedStack = r.supportsSplitScreenWindowingMode();
                    break;
                case WINDOWING_MODE_FREEFORM:
                    // Any activity which supports freeform can go in the freeform stack.
                    canUseFocusedStack = r.supportsFreeform();
                    break;
                default:
                    // Dynamic stacks behave similarly to the fullscreen stack and can contain any
                    // resizeable task.
                    canUseFocusedStack = !focusedStack.isOnHomeDisplay()
                            && r.canBeLaunchedOnDisplay(focusedStack.mDisplayId);
            }
        }
        return canUseFocusedStack && !newTask
                // Using the focus stack isn't important enough to override the preferred display.
                && (mPreferredDisplayId == focusedStack.mDisplayId);

    }

}

```

### TaskRecord

```java

class TaskRecord extends ConfigurationContainer implements TaskWindowContainerListener {


    /**
     * 将任务重新放入首选堆栈，并在必要时创建它
     * Reparents the task into a preferred stack, creating it if necessary.
     *
     */
    // TODO: Inspect all call sites and change to just changing windowing mode of the stack vs.
    // re-parenting the task. Can only be done when we are no longer using static stack Ids.
    boolean reparent(ActivityStack preferredStack, int position,
            @ReparentMoveStackMode int moveStackMode, boolean animate, boolean deferResume,
            boolean schedulePictureInPictureModeChange, String reason) {

        final int toStackWindowingMode = toStack.getWindowingMode();

        ---------------------------------------------------------------------------------------

            } else if (toStackWindowingMode == WINDOWING_MODE_FREEFORM) {
                Rect bounds = getLaunchBounds();
                if (bounds == null) {
                    mService.mStackSupervisor.getLaunchParamsController().layoutTask(this, null);
                    bounds = configBounds;
                }
                kept = resize(bounds, RESIZE_MODE_FORCED, !mightReplaceWindow, deferResume);
            }
        ------------------------------------------------------------------------------------------

    }

    private static boolean replaceWindowsOnTaskMove(
            int sourceWindowingMode, int targetWindowingMode) {
        return sourceWindowingMode == WINDOWING_MODE_FREEFORM
                || targetWindowingMode == WINDOWING_MODE_FREEFORM;
    }

}

```






