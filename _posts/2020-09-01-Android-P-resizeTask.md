---
layout:     post
title:      Android P resizeTask
subtitle:   Android Freeform 模式窗口大小调整
date:       2020-09-01
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---


## Systrace

![systrace_resize_task](/images/wms/systrace_resize_task.png)

## System

![resize_task](/images/wms/resize_task.png)

```txt

2020-09-01 17:06:56.991 2084-2169/system_process D/LXG: dispatchResized: reportDraw: true
    java.lang.Throwable
        at com.android.server.wm.WindowState.dispatchResized(WindowState.java:3109)
        at com.android.server.wm.WindowState.reportResized(WindowState.java:3045)
        at com.android.server.wm.RootWindowContainer.handleResizingWindows(RootWindowContainer.java:879)
        at com.android.server.wm.RootWindowContainer.performSurfacePlacement(RootWindowContainer.java:675)
        at com.android.server.wm.WindowSurfacePlacer.performSurfacePlacementLoop(WindowSurfacePlacer.java:207)
        at com.android.server.wm.WindowSurfacePlacer.performSurfacePlacement(WindowSurfacePlacer.java:155)
        at com.android.server.wm.WindowSurfacePlacer.performSurfacePlacement(WindowSurfacePlacer.java:145)
        at com.android.server.wm.WindowSurfacePlacer.continueLayout(WindowSurfacePlacer.java:136)
        at com.android.server.wm.WindowManagerService.continueSurfaceLayout(WindowManagerService.java:2895)
        at com.android.server.am.TaskRecord.resize(TaskRecord.java:561)
        at com.android.server.am.ActivityManagerService.resizeTask(ActivityManagerService.java:10995)
        at com.android.server.wm.TaskPositioner$WindowPositionerEventReceiver.onInputEvent(TaskPositioner.java:174)
        at android.view.InputEventReceiver.dispatchInputEvent(InputEventReceiver.java:187)
        at android.view.InputEventReceiver.nativeConsumeBatchedInputEvents(Native Method)
        at android.view.InputEventReceiver.consumeBatchedInputEvents(InputEventReceiver.java:178)
        at android.view.BatchedInputEventReceiver.doConsumeBatchedInput(BatchedInputEventReceiver.java:49)
        at android.view.BatchedInputEventReceiver$BatchedInputRunnable.run(BatchedInputEventReceiver.java:78)
        at android.view.Choreographer$CallbackRecord.run(Choreographer.java:1012)
        at android.view.Choreographer.doCallbacks(Choreographer.java:823)
        at android.view.Choreographer.doFrame(Choreographer.java:752)
        at android.view.Choreographer$FrameDisplayEventReceiver.run(Choreographer.java:998)
        at android.os.Handler.handleCallback(Handler.java:873)
        at android.os.Handler.dispatchMessage(Handler.java:99)
        at android.os.Looper.loop(Looper.java:193)
        at android.os.HandlerThread.run(HandlerThread.java:65)
        at com.android.server.ServiceThread.run(ServiceThread.java:44)

```

## APP

![resize_task_2](/images/wms/resize_task_2.png)

## 代码

### AMS

```java

    @Override
    public void resizeTask(int taskId, Rect bounds, int resizeMode) {

        -------------------------------------------------------------------------

                TaskRecord task = mStackSupervisor.anyTaskForIdLocked(taskId);

        ------------------------------------------------------------------------------------

                // After reparenting (which only resizes the task to the stack bounds), resize the
                // task to the actual bounds provided
                task.resize(bounds, resizeMode, preserveWindow, !DEFER_RESUME);
    }

```

### TaskRecord

```java

    boolean resize(Rect bounds, int resizeMode, boolean preserveWindow, boolean deferResume) {

        mService.mWindowManager.deferSurfaceLayout();          // 开始推迟布局传递, 在进行多项更改时很有用，但为了优化性能，仅应执行一次布局遍历

        try {

            ---------------------------------------------------------------------------------------

            // Do not move the task to another stack here.
            // This method assumes that the task is already placed in the right stack.
            // we do not mess with that decision and we only do the resize!

            Trace.traceBegin(TRACE_TAG_ACTIVITY_MANAGER, "am.resizeTask_" + taskId);

            final boolean updatedConfig = updateOverrideConfiguration(bounds);   // 处理configChange

            // This variable holds information whether the configuration didn't change in a significant
            // way and the activity was kept the way it was. If it's false, it means the activity
            // had to be relaunched due to configuration change.
            boolean kept = true;
            if (updatedConfig) {
                final ActivityRecord r = topRunningActivityLocked();
                if (r != null && !deferResume) {
                    kept = r.ensureActivityConfiguration(0 /* globalChanges */,
                            preserveWindow);
                    mService.mStackSupervisor.ensureActivitiesVisibleLocked(r, 0,
                            !PRESERVE_WINDOWS);
                    if (!kept) {
                        mService.mStackSupervisor.resumeFocusedStackTopActivityLocked();
                    }
                }
            }
            mWindowContainerController.resize(kept, forced);

            Trace.traceEnd(TRACE_TAG_ACTIVITY_MANAGER);
            return kept;
        } finally {
            mService.mWindowManager.continueSurfaceLayout();          //  Resumes layout passes after deferring them. See {@link #deferSurfaceLayout()}
        }
   }

```


















