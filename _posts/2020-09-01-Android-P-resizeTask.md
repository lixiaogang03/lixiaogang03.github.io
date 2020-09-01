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




