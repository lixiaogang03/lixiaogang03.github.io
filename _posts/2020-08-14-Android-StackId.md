---
layout:     post
title:      Android StackId
subtitle:   ActivityStack
date:       2020-08-14
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

[Android Stack与Task-简书](https://www.jianshu.com/p/82f3af2135a8)

## android 8

### Home Stack

![home_stack](/images/android/ams/home_stack.webp)

### App Stack

![app_stack](/images/android/ams/app_stack.webp)

### ActivityManager

```java

public class ActivityManager {

    public static class StackId {
        /** Invalid stack ID. */
        public static final int INVALID_STACK_ID = -1;

        /** First static stack ID. */
        public static final int FIRST_STATIC_STACK_ID = 0;

        // Home应用
        /** Home activity stack ID. */
        public static final int HOME_STACK_ID = FIRST_STATIC_STACK_ID;

        // 一般应用所在的栈
        /** ID of stack where fullscreen activities are normally launched into. */
        public static final int FULLSCREEN_WORKSPACE_STACK_ID = 1;

        // 类似桌面操作系统
        /** ID of stack where freeform/resized activities are normally launched into. */
        public static final int FREEFORM_WORKSPACE_STACK_ID = FULLSCREEN_WORKSPACE_STACK_ID + 1;

        // 占用屏幕专用区域的堆栈ID
        /** ID of stack that occupies a dedicated region of the screen. */
        public static final int DOCKED_STACK_ID = FREEFORM_WORKSPACE_STACK_ID + 1;

        // 画中画栈
        /** ID of stack that always on top (always visible) when it exist. */
        public static final int PINNED_STACK_ID = DOCKED_STACK_ID + 1;

        // recents app所在的栈
        /** ID of stack that contains the Recents activity. */
        public static final int RECENTS_STACK_ID = PINNED_STACK_ID + 1;

        /** ID of stack that contains activities launched by the assistant. */
        public static final int ASSISTANT_STACK_ID = RECENTS_STACK_ID + 1;

        /** Last static stack stack ID. */
        public static final int LAST_STATIC_STACK_ID = ASSISTANT_STACK_ID;

        /** Start of ID range used by stacks that are created dynamically. */
        public static final int FIRST_DYNAMIC_STACK_ID = LAST_STATIC_STACK_ID + 1;

        /*
         * 判断是否是一个静态堆栈
         */
        public static boolean isStaticStack(int stackId) {
            return stackId >= FIRST_STATIC_STACK_ID && stackId <= LAST_STATIC_STACK_ID;
        }

        // 判断是否是一个动态堆栈
        public static boolean isDynamicStack(int stackId) {
            return stackId >= FIRST_DYNAMIC_STACK_ID;
        }
    }
}

```

### ActivityStarter

```java

class ActivityStarter {

    boolean isValidLaunchStackId(int stackId, int displayId, ActivityRecord r) {
        switch (stackId) {
            case INVALID_STACK_ID:
            case HOME_STACK_ID:
                return false;
            case FULLSCREEN_WORKSPACE_STACK_ID:
                return true;
            case FREEFORM_WORKSPACE_STACK_ID:
                return r.supportsFreeform();
            case DOCKED_STACK_ID:
                return r.supportsSplitScreen();
            case PINNED_STACK_ID:
                return r.supportsPictureInPicture();
            case RECENTS_STACK_ID:
                return r.isRecentsActivity();
            case ASSISTANT_STACK_ID:
                return r.isAssistantActivity();
            default:
                if (StackId.isDynamicStack(stackId)) {
                    return r.canBeLaunchedOnDisplay(displayId);
                }
                Slog.e(TAG, "isValidLaunchStackId: Unexpected stackId=" + stackId);
                return false;
        }
    }
}

```

### ActivityStackSupervisor

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener {

    ActivityStack mHomeStack;

    ActivityStack mFocusedStack;

    SparseArray<ActivityStack> mStacks = new SparseArray<>();


    int getNextStackId() {
        while (true) {
            if (mNextFreeStackId >= FIRST_DYNAMIC_STACK_ID
                    && getStack(mNextFreeStackId) == null) {
                break;
            }
            mNextFreeStackId++;
        }
        return mNextFreeStackId;
    }


    void postStartActivityProcessing(
            ActivityRecord r, int result, int prevFocusedStackId, ActivityRecord sourceRecord,
            ActivityStack targetStack) {

            // Home ActivityStack
            final ActivityStack homeStack = mSupervisor.getStack(HOME_STACK_ID);

    }

    private ActivityStack computeStackFocus(ActivityRecord r, boolean newTask, Rect bounds,
            int launchFlags, ActivityOptions aOptions) {

                // If there is no suitable dynamic stack then we figure out which static stack to use.
                final int stackId = task != null ? task.getLaunchStackId() :
                        bounds != null ? FREEFORM_WORKSPACE_STACK_ID :       // FreeForm ActivityStack
                                FULLSCREEN_WORKSPACE_STACK_ID;               // 普通ActivityStack
                // 创建ActivityStack
                stack = mSupervisor.getStack(stackId, CREATE_IF_NEEDED, ON_TOP);

    }

    /*
     * 一般调用此方法创建ActivityStack
     */
    protected <T extends ActivityStack> T getStack(int stackId, boolean createStaticStackIfNeeded,
            boolean createOnTop) {
        final ActivityStack stack = mStacks.get(stackId);
        if (stack != null) {
            return (T) stack;
        }
        if (!createStaticStackIfNeeded || !StackId.isStaticStack(stackId)) {
            return null;
        }
        if (stackId == DOCKED_STACK_ID) {
            // Make sure recents stack exist when creating a dock stack as it normally need to be on
            // the other side of the docked stack and we make visibility decisions based on that.
            getStack(RECENTS_STACK_ID, CREATE_IF_NEEDED, createOnTop);
        }
        return (T) createStackOnDisplay(stackId, DEFAULT_DISPLAY, createOnTop);
    }


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

```

### ActivityStack

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    ActivityStack(ActivityStackSupervisor.ActivityDisplay display, int stackId,
            ActivityStackSupervisor supervisor, RecentTasks recentTasks, boolean onTop) {

        mStackId = stackId;

        mStackSupervisor.mStacks.put(mStackId, this);

    }

}

```

## Android 9

### ActivityManager

```java

public class ActivityManager {

    public static class StackId {

        private StackId() {
        }

        /** Invalid stack ID. */
        public static final int INVALID_STACK_ID = -1;

    }

}

```

### ActivityStarter

```java

class ActivityStarter {

    private ActivityStack computeStackFocus(ActivityRecord r, boolean newTask, int launchFlags,
            ActivityOptions aOptions) {

                // If there is no suitable dynamic stack then we figure out which static stack to use.
                stack = mSupervisor.getLaunchStack(r, aOptions, task, ON_TOP);

    }

}

```

### ActivityStackSupervisor

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener,
        RecentTasks.Callbacks {

    /**
     * Returns the right stack to use for launching factoring in all the input parameters.
     *
     * @param r The activity we are trying to launch. Can be null.
     * @param options The activity options used to the launch. Can be null.
     * @param candidateTask The possible task the activity might be launched in. Can be null.
     *
     * @return The stack to use for the launch or INVALID_STACK_ID.
     */
    <T extends ActivityStack> T getLaunchStack(@Nullable ActivityRecord r,
            @Nullable ActivityOptions options, @Nullable TaskRecord candidateTask, boolean onTop,
            int candidateDisplayId) {
        int taskId = INVALID_TASK_ID;
        int displayId = INVALID_DISPLAY;
        //Rect bounds = null;

        // We give preference to the launch preference in activity options.
        if (options != null) {
            taskId = options.getLaunchTaskId();
            displayId = options.getLaunchDisplayId();
            // TODO: Need to work this into the equation...
            //bounds = options.getLaunchBounds();
        }

        // First preference for stack goes to the task Id set in the activity options. Use the stack
        // associated with that if possible.
        if (taskId != INVALID_TASK_ID) {
            // Temporarily set the task id to invalid in case in re-entry.
            options.setLaunchTaskId(INVALID_TASK_ID);
            final TaskRecord task = anyTaskForIdLocked(taskId,
                    MATCH_TASK_IN_STACKS_OR_RECENT_TASKS_AND_RESTORE, options, onTop);
            options.setLaunchTaskId(taskId);
            if (task != null) {
                return task.getStack();
            }
        }

        final int activityType = resolveActivityType(r, options, candidateTask);
        T stack = null;

        // Next preference for stack goes to the display Id set in the activity options or the
        // candidate display.
        if (displayId == INVALID_DISPLAY) {
            displayId = candidateDisplayId;
        }
        if (displayId != INVALID_DISPLAY && canLaunchOnDisplay(r, displayId)) {
            if (r != null) {
                // TODO: This should also take in the windowing mode and activity type into account.
                stack = (T) getValidLaunchStackOnDisplay(displayId, r);
                if (stack != null) {
                    return stack;
                }
            }
            final ActivityDisplay display = getActivityDisplayOrCreateLocked(displayId);
            if (display != null) {
                // 创建ActivityStack
                stack = display.getOrCreateStack(r, options, candidateTask, activityType, onTop);
                if (stack != null) {
                    return stack;
                }
            }
        }

        // Give preference to the stack and display of the input task and activity if they match the
        // mode we want to launch into.
        stack = null;
        ActivityDisplay display = null;
        if (candidateTask != null) {
            stack = candidateTask.getStack();
        }
        if (stack == null && r != null) {
            stack = r.getStack();
        }
        if (stack != null) {
            display = stack.getDisplay();
            if (display != null && canLaunchOnDisplay(r, display.mDisplayId)) {
                final int windowingMode =
                        display.resolveWindowingMode(r, options, candidateTask, activityType);
                if (stack.isCompatible(windowingMode, activityType)) {
                    return stack;
                }
                if (windowingMode == WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY
                        && display.getSplitScreenPrimaryStack() == stack
                        && candidateTask == stack.topTask()) {
                    // This is a special case when we try to launch an activity that is currently on
                    // top of split-screen primary stack, but is targeting split-screen secondary.
                    // In this case we don't want to move it to another stack.
                    // TODO(b/78788972): Remove after differentiating between preferred and required
                    // launch options.
                    return stack;
                }
            }
        }

        if (display == null
                || !canLaunchOnDisplay(r, display.mDisplayId)
                // TODO: Can be removed once we figure-out how non-standard types should launch
                // outside the default display.
                || (activityType != ACTIVITY_TYPE_STANDARD
                && activityType != ACTIVITY_TYPE_UNDEFINED)) {
            display = getDefaultDisplay();
        }

        return display.getOrCreateStack(r, options, candidateTask, activityType, onTop);
    }

}

```

### ActivityDisplay

```java

class ActivityDisplay extends ConfigurationContainer<ActivityStack>
        implements WindowContainerListener {

    /**
     * Counter for next free stack ID to use for dynamic activity stacks. Unique across displays.
     */
    private static int sNextFreeStackId = 0;

    /**
     * All of the stacks on this display. Order matters, topmost stack is in front of all other
     * stacks, bottommost behind. Accessed directly by ActivityManager package classes. Any calls
     * changing the list should also call {@link #onStackOrderChanged()}.
     */
    private final ArrayList<ActivityStack> mStacks = new ArrayList<>();

    // Cached reference to some special stacks we tend to get a lot so we don't need to loop
    // through the list to find them.
    private ActivityStack mHomeStack = null;
    private ActivityStack mRecentsStack = null;
    private ActivityStack mPinnedStack = null;
    private ActivityStack mSplitScreenPrimaryStack = null;

    private void addStackReferenceIfNeeded(ActivityStack stack) {
        final int activityType = stack.getActivityType();
        final int windowingMode = stack.getWindowingMode();

        if (activityType == ACTIVITY_TYPE_HOME) {
            if (mHomeStack != null && mHomeStack != stack) {
                throw new IllegalArgumentException("addStackReferenceIfNeeded: home stack="
                        + mHomeStack + " already exist on display=" + this + " stack=" + stack);
            }
            mHomeStack = stack;
        } else if (activityType == ACTIVITY_TYPE_RECENTS) {
            if (mRecentsStack != null && mRecentsStack != stack) {
                throw new IllegalArgumentException("addStackReferenceIfNeeded: recents stack="
                        + mRecentsStack + " already exist on display=" + this + " stack=" + stack);
            }
            mRecentsStack = stack;
        }
        if (windowingMode == WINDOWING_MODE_PINNED) {
            if (mPinnedStack != null && mPinnedStack != stack) {
                throw new IllegalArgumentException("addStackReferenceIfNeeded: pinned stack="
                        + mPinnedStack + " already exist on display=" + this
                        + " stack=" + stack);
            }
            mPinnedStack = stack;
        } else if (windowingMode == WINDOWING_MODE_SPLIT_SCREEN_PRIMARY) {
            if (mSplitScreenPrimaryStack != null && mSplitScreenPrimaryStack != stack) {
                throw new IllegalArgumentException("addStackReferenceIfNeeded:"
                        + " split-screen-primary" + " stack=" + mSplitScreenPrimaryStack
                        + " already exist on display=" + this + " stack=" + stack);
            }
            mSplitScreenPrimaryStack = stack;
            onSplitScreenModeActivated();
        }
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

    // ActivityStack ID
    private int getNextStackId() {
        return sNextFreeStackId++;
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

        if (activityType == ACTIVITY_TYPE_UNDEFINED) {
            // Can't have an undefined stack type yet...so re-map to standard. Anyone that wants
            // anything else should be passing it in anyways...
            activityType = ACTIVITY_TYPE_STANDARD;
        }

        if (activityType != ACTIVITY_TYPE_STANDARD) {
            // For now there can be only one stack of a particular non-standard activity type on a
            // display. So, get that ignoring whatever windowing mode it is currently in.
            T stack = getStack(WINDOWING_MODE_UNDEFINED, activityType);
            if (stack != null) {
                throw new IllegalArgumentException("Stack=" + stack + " of activityType="
                        + activityType + " already on display=" + this + ". Can't have multiple.");
            }
        }

        final ActivityManagerService service = mSupervisor.mService;
        if (!isWindowingModeSupported(windowingMode, service.mSupportsMultiWindow,
                service.mSupportsSplitScreenMultiWindow, service.mSupportsFreeformWindowManagement,
                service.mSupportsPictureInPicture, activityType)) {
            throw new IllegalArgumentException("Can't create stack for unsupported windowingMode="
                    + windowingMode);
        }

        if (windowingMode == WINDOWING_MODE_UNDEFINED) {
            // TODO: Should be okay to have stacks with with undefined windowing mode long term, but
            // have to set them to something for now due to logic that depending on them.
            windowingMode = getWindowingMode(); // Put in current display's windowing mode
            if (windowingMode == WINDOWING_MODE_UNDEFINED) {
                // Else fullscreen for now...
                windowingMode = WINDOWING_MODE_FULLSCREEN;
            }
        }

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

        mStackId = stackId;
        setActivityType(activityType);
        setWindowingMode(windowingMode);

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

}

```




