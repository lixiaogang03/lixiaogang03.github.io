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

![systrace_resize_task](/images/android/wms/systrace_resize_task.png)

## System

![resize_task](/images/android/wms/resize_task.png)

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

![resize_task_2](/images/android/wms/resize_task_2.png)

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

### ActivityRecord

```java


    /**
     * Make sure the given activity matches the current configuration. Ensures the HistoryRecord
     * is updated with the correct configuration and all other bookkeeping is handled.
     *
     * @param globalChanges The changes to the global configuration.
     * @param preserveWindow If the activity window should be preserved on screen if the activity
     *                       is relaunched.
     * @param ignoreStopState If we should try to relaunch the activity even if it is in the stopped
     *                        state. This is useful for the case where we know the activity will be
     *                        visible soon and we want to ensure its configuration before we make it
     *                        visible.
     * @return True if the activity was relaunched and false if it wasn't relaunched because we
     *         can't or the app handles the specific configuration that is changing.
     */
    boolean ensureActivityConfiguration(int globalChanges, boolean preserveWindow,
            boolean ignoreStopState) {

        --------------------------------------------------------------------------

        if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                "Ensuring correct configuration: " + this);

        --------------------------------------------------------------------------

        // TODO(b/36505427): Is there a better place to do this?
        updateOverrideConfiguration();

        // Short circuit: if the two full configurations are equal (the common case), then there is
        // nothing to do.  We test the full configuration instead of the global and merged override
        // configurations because there are cases (like moving a task to the pinned stack) where
        // the combine configurations are equal, but would otherwise differ in the override config
        mTmpConfig.setTo(mLastReportedConfiguration.getMergedConfiguration());
        if (getConfiguration().equals(mTmpConfig) && !forceNewConfig && !displayChanged) {
            if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                    "Configuration & display unchanged in " + this);
            return true;
        }

        // Okay we now are going to make this activity have the new config.
        // But then we need to figure out how it needs to deal with that.

        // Find changes between last reported merged configuration and the current one. This is used
        // to decide whether to relaunch an activity or just report a configuration change.
        final int changes = getConfigurationChanges(mTmpConfig);

        // Update last reported values.
        final Configuration newMergedOverrideConfig = getMergedOverrideConfiguration();

        setLastReportedConfiguration(service.getGlobalConfiguration(), newMergedOverrideConfig);

        ----------------------------------------------------------------------------------

        if (changes == 0 && !forceNewConfig) {
            if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                    "Configuration no differences in " + this);
            // There are no significant differences, so we won't relaunch but should still deliver
            // the new configuration to the client process.
            if (displayChanged) {
                scheduleActivityMovedToDisplay(newDisplayId, newMergedOverrideConfig);
            } else {
                scheduleConfigurationChanged(newMergedOverrideConfig);
            }
            return true;
        }

        if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                "Configuration changes for " + this + ", allChanges="
                        + Configuration.configurationDiffToString(changes));

        --------------------------------------------------------------------------------

        // Figure out how to handle the changes between the configurations.
        if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                "Checking to restart " + info.name + ": changed=0x"
                        + Integer.toHexString(changes) + ", handles=0x"
                        + Integer.toHexString(info.getRealConfigChanged())
                        + ", mLastReportedConfiguration=" + mLastReportedConfiguration);

        if (shouldRelaunchLocked(changes, mTmpConfig) || forceNewConfig) {
            // Aha, the activity isn't handling the change, so DIE DIE DIE.
            configChangeFlags |= changes;
            startFreezingScreenLocked(app, globalChanges);
            forceNewConfig = false;
            preserveWindow &= isResizeOnlyChange(changes);
            if (app == null || app.thread == null) {

                ------------------------------------------------------------------------

            } else if (mState == PAUSING) {

                -------------------------------------------------------------------------

            } else if (mState == RESUMED) {
                // Try to optimize this case: the configuration is changing and we need to restart
                // the top, resumed activity. Instead of doing the normal handshaking, just say
                // "restart!".
                if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                        "Config is relaunching resumed " + this);

                if (DEBUG_STATES && !visible) {
                    Slog.v(TAG_STATES, "Config is relaunching resumed invisible activity " + this
                            + " called by " + Debug.getCallers(4));
                }

                relaunchActivityLocked(true /* andResume */, preserveWindow);
            } else {
                if (DEBUG_SWITCH || DEBUG_CONFIGURATION) Slog.v(TAG_CONFIGURATION,
                        "Config is relaunching non-resumed " + this);
                relaunchActivityLocked(false /* andResume */, preserveWindow);
            }

            // All done...  tell the caller we weren't able to keep this activity around.
            return false;
        }

        ----------------------------------------------------------------------------------

        return true;
    }


```


















