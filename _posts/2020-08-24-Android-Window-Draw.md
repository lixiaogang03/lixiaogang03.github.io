---
layout:     post
title:      Android Window Draw
subtitle:   窗口结构、布局、绘制
date:       2020-08-24
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - Android
---

[Activity窗口构成和绘制解析-简书](https://www.jianshu.com/p/0b99db3b8ed8)

## 窗口结构

![window_structure](/images/android/ams/window_structure.png)

## APP 数据结构

![window_structure_2](/images/android/ams/window_structure_2.png)

## uml

![activity_window](/images/android/ams/activity_window.png)

## startWindow

![start_window](/images/android/ams/start_window.png)

```txt

system_process D/WWW: scheduleAddStartingWindow:java.lang.Throwable
        at com.android.server.wm.AppWindowContainerController.scheduleAddStartingWindow(AppWindowContainerController.java:577)
        at com.android.server.wm.AppWindowContainerController.addStartingWindow(AppWindowContainerController.java:552)
        at com.android.server.am.ActivityRecord.showStartingWindow(ActivityRecord.java:2270)
        at com.android.server.am.ActivityRecord.showStartingWindow(ActivityRecord.java:2255)
        at com.android.server.am.ActivityStack.startActivityLocked(ActivityStack.java:3055)
        at com.android.server.am.ActivityStarter.startActivityUnchecked(ActivityStarter.java:1530)
        at com.android.server.am.ActivityStarter.startActivity(ActivityStarter.java:1282)
        at com.android.server.am.ActivityStarter.startActivity(ActivityStarter.java:899)
        at com.android.server.am.ActivityStarter.startActivity(ActivityStarter.java:558)
        at com.android.server.am.ActivityStarter.startActivityMayWait(ActivityStarter.java:1181)
        at com.android.server.am.ActivityStarter.execute(ActivityStarter.java:496)
        at com.android.server.am.ActivityManagerService.startActivityAsUser(ActivityManagerService.java:5187)
        at com.android.server.am.ActivityManagerService.startActivityAsUser(ActivityManagerService.java:5161)
        at com.android.server.am.ActivityManagerService.startActivity(ActivityManagerService.java:5151)
        at android.app.IActivityManager$Stub.onTransact$startActivity$(IActivityManager.java:10088)
        at android.app.IActivityManager$Stub.onTransact(IActivityManager.java:122)
        at com.android.server.am.ActivityManagerService.onTransact(ActivityManagerService.java:3326)
        at android.os.Binder.execTransact(Binder.java:731)
system_process D/WWW: onResourcesLoaded:java.lang.Throwable
        at com.android.internal.policy.DecorView.onResourcesLoaded(DecorView.java:1877)
        at com.android.internal.policy.PhoneWindow.generateLayout(PhoneWindow.java:2599)
        at com.android.internal.policy.PhoneWindow.installDecor(PhoneWindow.java:2672)
        at com.android.internal.policy.PhoneWindow.getDecorView(PhoneWindow.java:2071)
        at com.android.server.policy.PhoneWindowManager.addSplashScreen(PhoneWindowManager.java:3338)
        at com.android.server.wm.SplashScreenStartingData.createStartingSurface(SplashScreenStartingData.java:56)
        at com.android.server.wm.AppWindowContainerController$1.run(AppWindowContainerController.java:160)
        at android.os.Handler.handleCallback(Handler.java:873)
        at android.os.Handler.dispatchMessage(Handler.java:99)
        at android.os.Looper.loop(Looper.java:193)
        at android.os.HandlerThread.run(HandlerThread.java:65)
        at com.android.server.ServiceThread.run(ServiceThread.java:44)

```

## Activity-PhoneWindow-DecorView

![window_decor](/images/android/ams/window_decor.png)

```txt

1970-03-19 05:07:08.418 5257-5257/com.android.mms D/WWW: onResourcesLoaded:java.lang.Throwable
        at com.android.internal.policy.DecorView.onResourcesLoaded(DecorView.java:1877)
        at com.android.internal.policy.PhoneWindow.generateLayout(PhoneWindow.java:2599)
        at com.android.internal.policy.PhoneWindow.installDecor(PhoneWindow.java:2672)
        at com.android.internal.policy.PhoneWindow.setContentView(PhoneWindow.java:410)
        at android.app.Activity.setContentView(Activity.java:2775)
        at com.android.mms.ui.ConversationList.onCreate(ConversationList.java:181)
        at android.app.Activity.performCreate(Activity.java:7148)
        at android.app.Activity.performCreate(Activity.java:7139)
        at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1272)
        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2932)
        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3087)
        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78)
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

## ViewRootImpl

![view_root_impl](/images/android/ams/view_root_impl.png)

```txt

1970-03-19 06:54:18.729 3493-3493/com.android.contacts D/WWW: new ViewRootImpl:java.lang.Throwable
        at android.view.ViewRootImpl.<init>(ViewRootImpl.java:512)
        at android.view.WindowManagerGlobal.addView(WindowManagerGlobal.java:346)
        at android.view.WindowManagerImpl.addView(WindowManagerImpl.java:94)
        at android.app.ActivityThread.handleResumeActivity(ActivityThread.java:3907)
        at android.app.servertransaction.ResumeActivityItem.execute(ResumeActivityItem.java:51)
        at android.app.servertransaction.TransactionExecutor.executeLifecycleState(TransactionExecutor.java:145)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:70)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6746)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)

```

## Systrace

![app_launch](/images/android/ams/app_launch.png)






