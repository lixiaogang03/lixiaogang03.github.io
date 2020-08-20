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






