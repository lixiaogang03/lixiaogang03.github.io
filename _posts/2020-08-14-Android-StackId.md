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

## android 8


### ActivityManager

public class ActivityManager {

    public static class StackId {
        /** Invalid stack ID. */
        public static final int INVALID_STACK_ID = -1;

        /** First static stack ID. */
        public static final int FIRST_STATIC_STACK_ID = 0;

        /** Home activity stack ID. */
        public static final int HOME_STACK_ID = FIRST_STATIC_STACK_ID;

        /** ID of stack where fullscreen activities are normally launched into. */
        public static final int FULLSCREEN_WORKSPACE_STACK_ID = 1;

        /** ID of stack where freeform/resized activities are normally launched into. */
        public static final int FREEFORM_WORKSPACE_STACK_ID = FULLSCREEN_WORKSPACE_STACK_ID + 1;

        /** ID of stack that occupies a dedicated region of the screen. */
        public static final int DOCKED_STACK_ID = FREEFORM_WORKSPACE_STACK_ID + 1;

        /** ID of stack that always on top (always visible) when it exist. */
        public static final int PINNED_STACK_ID = DOCKED_STACK_ID + 1;

        /** ID of stack that contains the Recents activity. */
        public static final int RECENTS_STACK_ID = PINNED_STACK_ID + 1;

        /** ID of stack that contains activities launched by the assistant. */
        public static final int ASSISTANT_STACK_ID = RECENTS_STACK_ID + 1;

        /** Last static stack stack ID. */
        public static final int LAST_STATIC_STACK_ID = ASSISTANT_STACK_ID;

        /** Start of ID range used by stacks that are created dynamically. */
        public static final int FIRST_DYNAMIC_STACK_ID = LAST_STATIC_STACK_ID + 1;

        public static boolean isStaticStack(int stackId) {
            return stackId >= FIRST_STATIC_STACK_ID && stackId <= LAST_STATIC_STACK_ID;
        }

        public static boolean isDynamicStack(int stackId) {
            return stackId >= FIRST_DYNAMIC_STACK_ID;
        }
    }
}

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


    /**
     * Get a topmost stack on the display, that is a valid launch stack for specified activity.
     * If there is no such stack, new dynamic stack can be created.
     * @param displayId Target display.
     * @param r Activity that should be launched there.
     * @return Existing stack if there is a valid one, new dynamic stack if it is valid or null.
     */
    ActivityStack getValidLaunchStackOnDisplay(int displayId, @NonNull ActivityRecord r) {
        final ActivityDisplay activityDisplay = getActivityDisplayOrCreateLocked(displayId);
        if (activityDisplay == null) {
            throw new IllegalArgumentException(
                    "Display with displayId=" + displayId + " not found.");
        }

        // Return the topmost valid stack on the display.
        for (int i = activityDisplay.mStacks.size() - 1; i >= 0; --i) {
            final ActivityStack stack = activityDisplay.mStacks.get(i);
            if (mService.mActivityStarter.isValidLaunchStackId(stack.mStackId, displayId, r)) {
                return stack;
            }
        }

        // If there is no valid stack on the external display - check if new dynamic stack will do.
        if (displayId != Display.DEFAULT_DISPLAY) {
            final int newDynamicStackId = getNextStackId();
            if (mService.mActivityStarter.isValidLaunchStackId(newDynamicStackId, displayId, r)) {
                return createStackOnDisplay(newDynamicStackId, displayId, true /*onTop*/);
            }
        }

        Slog.w(TAG, "getValidLaunchStackOnDisplay: can't launch on displayId " + displayId);
        return null;
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
