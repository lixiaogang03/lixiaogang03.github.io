---
layout:     post
title:      Android AMS
subtitle:   ActivityManagerService
date:       2019-07-22
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - android
    - ams
---

## 参考链接

## AMS

![ams_activity_stack](/images/ams_activity_stack.png)

### ActivityStackSupervisor

```java

public final class ActivityStackSupervisor implements DisplayListener {

    /** The stack containing the launcher app. Assumed to always be attached to
     * Display.DEFAULT_DISPLAY. */
    ActivityStack mHomeStack;

    /** The stack currently receiving input or launching the next activity. */
    ActivityStack mFocusedStack;

    /** If this is the same as mFocusedStack then the activity on the top of the focused stack has
     * been resumed. If stacks are changing position this will hold the old stack until the new
     * stack becomes resumed after which it will be set to mFocusedStack. */
    private ActivityStack mLastFocusedStack;
}

```


### ActivityStack

```java

//State and management of a single stack of activities.
final class ActivityStack {

    /**
     * The back history of all previous (and possibly still
     * running) activities.  It contains #TaskRecord objects.
     */
    private final ArrayList<TaskRecord> mTaskHistory = new ArrayList<>();

    /** Run all ActivityStacks through this */
    final ActivityStackSupervisor mStackSupervisor;

}

```

### TaskRecord

```java

final class TaskRecord {

    /** Current stack */
    ActivityStack stack;

    /** List of all activities in the task arranged in history order */
    final ArrayList<ActivityRecord> mActivities;

}

```

### ActivityRecord

```java

/**
 * An entry in the history stack, representing an activity.
 */
final class ActivityRecord {

    TaskRecord task;        // the task this is in.

}

```


