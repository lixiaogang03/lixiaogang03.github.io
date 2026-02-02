---
layout:     post
title:      DecorCaptionView
subtitle:   Freeform winfow maximize_window
date:       2020-08-25
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - Android
---

## 效果图

![freeform_window](/images/android/freeform/freeform_window.png)

## 布局文件-Android 9

frameworks/base/core/res/res/layout/decor_caption.xml

```xml

<?xml version="1.0" encoding="utf-8"?>
<com.android.internal.widget.DecorCaptionView xmlns:android="http://schemas.android.com/apk/res/android"
        android:orientation="vertical"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:descendantFocusability="beforeDescendants" >
    <LinearLayout
            android:id="@+id/caption"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:gravity="end"
            android:background="@drawable/decor_caption_title"
            android:focusable="false"
            android:descendantFocusability="blocksDescendants" >
        <Button
                android:id="@+id/maximize_window"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:layout_margin="5dp"
                android:padding="4dp"
                android:layout_gravity="center_vertical|end"
                android:contentDescription="@string/maximize_button_text"
                android:background="@drawable/decor_maximize_button_dark" />
        <Button
                android:id="@+id/close_window"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:layout_margin="5dp"
                android:padding="4dp"
                android:layout_gravity="center_vertical|end"
                android:contentDescription="@string/close_button_text"
                android:background="@drawable/decor_close_button_dark" />
    </LinearLayout>
</com.android.internal.widget.DecorCaptionView>

```

## DecorCaptionView

```java

public class DecorCaptionView extends ViewGroup implements View.OnTouchListener,
        GestureDetector.OnGestureListener {

    private PhoneWindow mOwner = null;

    private View mCaption;
    private View mContent;

    // 最大化窗口
    private View mMaximize;

    // 关闭窗口
    private View mClose;

    public void setPhoneWindow(PhoneWindow owner, boolean show) {
        mMaximize = findViewById(R.id.maximize_window);
        mClose = findViewById(R.id.close_window);
    }

    @Override
    public void addView(View child, int index, ViewGroup.LayoutParams params) {
        mContent = child;
    }

    /**
     * Maximize the window by moving it to the maximized workspace stack.
     **/
    private void maximizeWindow() {
        Window.WindowControllerCallback callback = mOwner.getWindowControllerCallback();
        if (callback != null) {
            try {
                callback.exitFreeformMode();
            } catch (RemoteException ex) {
                Log.e(TAG, "Cannot change task workspace.");
            }
        }
    }

    @Override
    public boolean onSingleTapUp(MotionEvent e) {
        if (mClickTarget == mMaximize) {
            maximizeWindow();
        } else if (mClickTarget == mClose) {
            mOwner.dispatchOnWindowDismissed(
                    true /*finishTask*/, false /*suppressWindowTransition*/);
        }
        return true;
    }

}

```

## 事件处理trace

```txt

1970-03-20 04:22:43.907 5227-5227/com.android.calculator2 D/WWW: maximizeWindow:
    java.lang.Throwable
        at com.android.internal.widget.DecorCaptionView.maximizeWindow(DecorCaptionView.java:347)
        at com.android.internal.widget.DecorCaptionView.onSingleTapUp(DecorCaptionView.java:412)
        at android.view.GestureDetector.onTouchEvent(GestureDetector.java:641)
        at com.android.internal.widget.DecorCaptionView.onTouchEvent(DecorCaptionView.java:170)
        at android.view.View.dispatchTouchEvent(View.java:12514)
        at android.view.ViewGroup.dispatchTransformedTouchEvent(ViewGroup.java:3024)
        at android.view.ViewGroup.dispatchTouchEvent(ViewGroup.java:2705)
        at android.view.ViewGroup.dispatchTransformedTouchEvent(ViewGroup.java:3030)
        at android.view.ViewGroup.dispatchTouchEvent(ViewGroup.java:2719)
        at com.android.internal.policy.DecorView.superDispatchTouchEvent(DecorView.java:440)
        at com.android.internal.policy.PhoneWindow.superDispatchTouchEvent(PhoneWindow.java:1830)
        at android.app.Activity.dispatchTouchEvent(Activity.java:3401)
        at com.android.calculator2.Calculator.dispatchTouchEvent(Calculator.java:598)
        at android.view.WindowCallbackWrapper.dispatchTouchEvent(WindowCallbackWrapper.java:53)
        at com.android.internal.policy.DecorView.dispatchTouchEvent(DecorView.java:398)
        at android.view.View.dispatchPointerEvent(View.java:12753)
        at android.view.ViewRootImpl$ViewPostImeInputStage.processPointerEvent(ViewRootImpl.java:5122)
        at android.view.ViewRootImpl$ViewPostImeInputStage.onProcess(ViewRootImpl.java:4925)
        at android.view.ViewRootImpl$InputStage.deliver(ViewRootImpl.java:4442)
        at android.view.ViewRootImpl$InputStage.onDeliverToNext(ViewRootImpl.java:4495)
        at android.view.ViewRootImpl$InputStage.forward(ViewRootImpl.java:4461)
        at android.view.ViewRootImpl$AsyncInputStage.forward(ViewRootImpl.java:4601)
        at android.view.ViewRootImpl$InputStage.apply(ViewRootImpl.java:4469)
        at android.view.ViewRootImpl$AsyncInputStage.apply(ViewRootImpl.java:4658)
        at android.view.ViewRootImpl$InputStage.deliver(ViewRootImpl.java:4442)
        at android.view.ViewRootImpl$InputStage.onDeliverToNext(ViewRootImpl.java:4495)
        at android.view.ViewRootImpl$InputStage.forward(ViewRootImpl.java:4461)
        at android.view.ViewRootImpl$InputStage.apply(ViewRootImpl.java:4469)
        at android.view.ViewRootImpl$InputStage.deliver(ViewRootImpl.java:4442)
        at android.view.ViewRootImpl.deliverInputEvent(ViewRootImpl.java:7117)
        at android.view.ViewRootImpl.doProcessInputEvents(ViewRootImpl.java:7086)
        at android.view.ViewRootImpl.enqueueInputEvent(ViewRootImpl.java:7047)
        at android.view.ViewRootImpl$WindowInputEventReceiver.onInputEvent(ViewRootImpl.java:7220)
        at android.view.InputEventReceiver.dispatchInputEvent(InputEventReceiver.java:187)
        at android.os.MessageQueue.nativePollOnce(Native Method)
        at android.os.MessageQueue.next(MessageQueue.java:326)
        at android.os.Looper.loop(Looper.java:160)
        at android.app.ActivityThread.main(ActivityThread.java:6746)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)

```

## AMS

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    @Override
    public void exitFreeformMode(IBinder token) throws RemoteException {
        synchronized (this) {
            long ident = Binder.clearCallingIdentity();
            try {
                final ActivityRecord r = ActivityRecord.forTokenLocked(token);
                if (r == null) {
                    throw new IllegalArgumentException(
                            "exitFreeformMode: No activity record matching token=" + token);
                }

                final ActivityStack stack = r.getStack();
                if (stack == null || !stack.inFreeformWindowingMode()) {
                    throw new IllegalStateException(
                            "exitFreeformMode: You can only go fullscreen from freeform.");
                }

                stack.setWindowingMode(WINDOWING_MODE_FULLSCREEN);
            } finally {
                Binder.restoreCallingIdentity(ident);
            }
        }
    }

}

```

## 窗口大小变更

### 服务端

```txt

1970-03-20 05:47:11.109 1448-1618/system_process D/WWW: ActivityRecord scheduleConfigurationChanged:
    java.lang.Throwable
        at com.android.server.am.ActivityRecord.scheduleConfigurationChanged(ActivityRecord.java:654)
        at com.android.server.am.ActivityRecord.ensureActivityConfiguration(ActivityRecord.java:2538)
        at com.android.server.am.ActivityRecord.ensureActivityConfiguration(ActivityRecord.java:2436)
        at com.android.server.am.TaskRecord.resize(TaskRecord.java:561)
        at com.android.server.am.ActivityManagerService.resizeTask(ActivityManagerService.java:11037)
        at com.android.server.wm.TaskPositioner$WindowPositionerEventReceiver.onInputEvent(TaskPositioner.java:168)
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
        at com.android.server.ServiceThread.run(ServiceThread.java:

```

### ActivityRecord

```java

final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    private void scheduleConfigurationChanged(Configuration config) {
        if (app == null || app.thread == null) {
            if (DEBUG_CONFIGURATION) Slog.w(TAG,
                    "Can't report activity configuration update - client not running"
                            + ", activityRecord=" + this);
            return;
        }
        try {
            if (DEBUG_CONFIGURATION) Slog.v(TAG, "Sending new config to " + this + ", config: "
                    + config);

            // Binder 调用到客户端
            service.getLifecycleManager().scheduleTransaction(app.thread, appToken,
                    ActivityConfigurationChangeItem.obtain(config));
        } catch (RemoteException e) {
            // If process died, whatever.
        }
    }

}

```

### 客户端Trace

```txt

// 1
1970-03-20 05:47:11.219 3726-3726/com.android.calculator2 D/WWW: Activity onConfigurationChanged:
    java.lang.Throwable
        at android.app.Activity.onConfigurationChanged(Activity.java:2271)
        at android.app.ActivityThread.performActivityConfigurationChanged(ActivityThread.java:5070)
        at android.app.ActivityThread.performConfigurationChangedForActivity(ActivityThread.java:4937)
        at android.app.ActivityThread.performConfigurationChangedForActivity(ActivityThread.java:4915)
        at android.app.ActivityThread.handleActivityConfigurationChanged(ActivityThread.java:5288)
        at android.app.servertransaction.ActivityConfigurationChangeItem.execute(ActivityConfigurationChangeItem.java:43)
        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6746)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)

// 2
1970-03-20 05:47:11.220 3726-3726/com.android.calculator2 D/WWW: DecorView onConfigurationChanged:
    java.lang.Throwable
        at com.android.internal.policy.DecorView.onConfigurationChanged(DecorView.java:1850)
        at android.view.View.dispatchConfigurationChanged(View.java:13049)
        at android.view.ViewGroup.dispatchConfigurationChanged(ViewGroup.java:1575)
        at android.view.ViewRootImpl.updateConfiguration(ViewRootImpl.java:3956)
        at android.app.ActivityThread.handleActivityConfigurationChanged(ActivityThread.java:5293)
        at android.app.servertransaction.ActivityConfigurationChangeItem.execute(ActivityConfigurationChangeItem.java:43)
        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6746)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)

```

### 客户端代码

```java

public final class ActivityThread extends ClientTransactionHandler {

    /**
     * Handle new activity configuration and/or move to a different display.
     * @param activityToken Target activity token.
     * @param overrideConfig Activity override config.
     * @param displayId Id of the display where activity was moved to, -1 if there was no move and
     *                  value didn't change.
     */
    @Override
    public void handleActivityConfigurationChanged(IBinder activityToken,
            Configuration overrideConfig, int displayId) {
        ActivityClientRecord r = mActivities.get(activityToken);
        // Check input params.
        if (r == null || r.activity == null) {
            if (DEBUG_CONFIGURATION) Slog.w(TAG, "Not found target activity to report to: " + r);
            return;
        }
        final boolean movedToDifferentDisplay = displayId != INVALID_DISPLAY
                && displayId != r.activity.getDisplay().getDisplayId();

        // Perform updates.
        r.overrideConfig = overrideConfig;
        final ViewRootImpl viewRoot = r.activity.mDecor != null
            ? r.activity.mDecor.getViewRootImpl() : null;

        if (movedToDifferentDisplay) {
            if (DEBUG_CONFIGURATION) Slog.v(TAG, "Handle activity moved to display, activity:"
                    + r.activityInfo.name + ", displayId=" + displayId
                    + ", config=" + overrideConfig);

            final Configuration reportedConfig = performConfigurationChangedForActivity(r,
                    mCompatConfiguration, displayId, true /* movedToDifferentDisplay */);
            if (viewRoot != null) {
                viewRoot.onMovedToDisplay(displayId, reportedConfig);
            }
        } else {
            if (DEBUG_CONFIGURATION) Slog.v(TAG, "Handle activity config changed: "
                    + r.activityInfo.name + ", config=" + overrideConfig);

            // 1
            performConfigurationChangedForActivity(r, mCompatConfiguration);
        }

        // 2
        // Notify the ViewRootImpl instance about configuration changes. It may have initiated this
        // update to make sure that resources are updated before updating itself.
        if (viewRoot != null) {
            viewRoot.updateConfiguration(displayId);
        }
        mSomeActivitiesChanged = true;
    }

}

```


