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

![home_stack](/images/ams/home_stack.webp)

### App Stack

![app_stack](/images/ams/app_stack.webp)

### ActivityManager

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
