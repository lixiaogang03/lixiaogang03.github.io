---
layout:     post
title:      DecorCaptionView
subtitle:   Freeform winfow maximize_window
date:       2020-08-25
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - android
---

## 效果图

![freeform_window](/images/freeform/freeform_window.png)

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


