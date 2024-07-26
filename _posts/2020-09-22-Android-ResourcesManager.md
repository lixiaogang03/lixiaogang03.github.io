---
layout:     post
title:      Android ResourcesManager
subtitle:   资源管理框架
date:       2020-09-22
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - android
---

[理解Android Context-Gityuan](http://gityuan.com/2017/04/09/android_context/)

## Context作用域

![](/images/android/app/context.png)

## Resources类图

![ResourcesImpl](/images/android/app/ResourcesImpl.png)

## 应用冷启动ResourcesManager日志

```txt

-------------------------------------createAppContext------------------------------------

2020-09-22 11:16:37.398 9331-9331/com.android.calculator2 W/ResourcesManager: !! Get resources for activity=null key=ResourcesKey{ mHash=ff417a20 mResDir=/system/app/ExactCalculator/ExactCalculator.apk mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=v28 mCompatInfo={240dpi always-compat}}
    java.lang.Throwable
        at android.app.ResourcesManager.getOrCreateResources(ResourcesManager.java:756)
        at android.app.ResourcesManager.getResources(ResourcesManager.java:870)
        at android.app.LoadedApk.getResources(LoadedApk.java:1029)
        at android.app.ContextImpl.createAppContext(ContextImpl.java:2345)
        at android.app.ActivityThread.handleBindApplication(ActivityThread.java:5811)
        at android.app.ActivityThread.access$1100(ActivityThread.java:201)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1657)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6749)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)
2020-09-22 11:16:37.401 9331-9331/com.android.calculator2 D/ResourcesManager: - creating impl=android.content.res.ResourcesImpl@f03a44d with key: ResourcesKey{ mHash=ff417a20 mResDir=/system/app/ExactCalculator/ExactCalculator.apk mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=v28 mCompatInfo={240dpi always-compat}}
2020-09-22 11:16:37.401 9331-9331/com.android.calculator2 D/ResourcesManager: - creating new ref=android.content.res.Resources@12a9b02
2020-09-22 11:16:37.401 9331-9331/com.android.calculator2 D/ResourcesManager: - setting ref=android.content.res.Resources@12a9b02 with impl=android.content.res.ResourcesImpl@f03a44d

-----------------------------------------createSystemUiContext-------------------------------

2020-09-22 11:16:37.413 9331-9331/com.android.calculator2 W/ResourcesManager: !! Get resources for activity=null key=ResourcesKey{ mHash=fdbb0c5e mResDir=null mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=v28 mCompatInfo={240dpi always-compat}}
    java.lang.Throwable
        at android.app.ResourcesManager.getOrCreateResources(ResourcesManager.java:756)
        at android.app.ResourcesManager.getResources(ResourcesManager.java:870)
        at android.app.ContextImpl.createResources(ContextImpl.java:2050)
        at android.app.ContextImpl.createSystemUiContext(ContextImpl.java:2336)
        at android.app.ActivityThread.getSystemUiContext(ActivityThread.java:2167)
        at android.app.ActivityThread.handleConfigurationChanged(ActivityThread.java:5127)
        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3079)
        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78)
        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6749)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)
2020-09-22 11:16:37.416 9331-9331/com.android.calculator2 D/ResourcesManager: - creating impl=android.content.res.ResourcesImpl@2ac166f with key: ResourcesKey{ mHash=fdbb0c5e mResDir=null mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=v28 mCompatInfo={240dpi always-compat}}
2020-09-22 11:16:37.416 9331-9331/com.android.calculator2 D/ResourcesManager: - creating new ref=android.content.res.Resources@af58f7c
2020-09-22 11:16:37.416 9331-9331/com.android.calculator2 D/ResourcesManager: - setting ref=android.content.res.Resources@af58f7c with impl=android.content.res.ResourcesImpl@2ac166f
2020-09-22 11:16:37.416 9331-9331/com.android.calculator2 V/ResourcesManager: Skipping new config: curSeq=4, newSeq=4

-------------------------------------createActivityContext---------------------------------------

2020-09-22 11:16:37.422 9331-9331/com.android.calculator2 D/ResourcesManager: createBaseActivityResources activity=android.os.BinderProxy@ad8de50 with key=ResourcesKey{ mHash=bbc86095 mResDir=/system/app/ExactCalculator/ExactCalculator.apk mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=b+zh+Hans+CN-ldltr-sw400dp-w400dp-h853dp-normal-long-notround-lowdr-nowidecg-port-notnight-hdpi-finger-keysexposed-nokeys-navhidden-nonav-v28 mCompatInfo={240dpi always-compat}}
2020-09-22 11:16:37.422 9331-9331/com.android.calculator2 D/ResourcesManager: updating resources override for activity=android.os.BinderProxy@ad8de50 from oldConfig=v28 to newConfig=b+zh+Hans+CN-ldltr-sw400dp-w400dp-h853dp-normal-long-notround-lowdr-nowidecg-port-notnight-hdpi-finger-keysexposed-nokeys-navhidden-nonav-v28 displayId=0
2020-09-22 11:16:37.423 9331-9331/com.android.calculator2 W/ResourcesManager: !! Get resources for activity=android.os.BinderProxy@ad8de50 key=ResourcesKey{ mHash=bbc86095 mResDir=/system/app/ExactCalculator/ExactCalculator.apk mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=b+zh+Hans+CN-ldltr-sw400dp-w400dp-h853dp-normal-long-notround-lowdr-nowidecg-port-notnight-hdpi-finger-keysexposed-nokeys-navhidden-nonav-v28 mCompatInfo={240dpi always-compat}}
    java.lang.Throwable
        at android.app.ResourcesManager.getOrCreateResources(ResourcesManager.java:756)
        at android.app.ResourcesManager.createBaseActivityResources(ResourcesManager.java:733)
        at android.app.ContextImpl.createActivityContext(ContextImpl.java:2384)
        at android.app.ActivityThread.createBaseContextForActivity(ActivityThread.java:3037)
        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2866)
        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3090)
        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78)
        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6749)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)
2020-09-22 11:16:37.425 9331-9331/com.android.calculator2 V/ResourcesManager: Applied overrideConfig={1.0 ?mcc?mnc [zh_CN_#Hans] ldltr sw400dp w400dp h853dp 240dpi nrml long port finger -keyb/v/h -nav/h winConfig={ mBounds=Rect(600, 0 - 1200, 1280) mAppBounds=Rect(600, 0 - 1200, 1280) mWindowingMode=freeform mActivityType=standard} s.4}
2020-09-22 11:16:37.426 9331-9331/com.android.calculator2 D/ResourcesManager: - creating impl=android.content.res.ResourcesImpl@b8daa8b with key: ResourcesKey{ mHash=bbc86095 mResDir=/system/app/ExactCalculator/ExactCalculator.apk mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=b+zh+Hans+CN-ldltr-sw400dp-w400dp-h853dp-normal-long-notround-lowdr-nowidecg-port-notnight-hdpi-finger-keysexposed-nokeys-navhidden-nonav-v28 mCompatInfo={240dpi always-compat}}
2020-09-22 11:16:37.426 9331-9331/com.android.calculator2 D/ResourcesManager: - creating new ref=android.content.res.Resources@7ca2768
2020-09-22 11:16:37.426 9331-9331/com.android.calculator2 D/ResourcesManager: - setting ref=android.content.res.Resources@7ca2768 with impl=android.content.res.ResourcesImpl@b8daa8b

---------------------------------------------Use AppContext-----------------------------------------------

2020-09-22 11:16:37.430 9331-9331/com.android.calculator2 W/ResourcesManager: !! Get resources for activity=null key=ResourcesKey{ mHash=ff417a20 mResDir=/system/app/ExactCalculator/ExactCalculator.apk mSplitDirs=[] mOverlayDirs=[] mLibDirs=[] mDisplayId=0 mOverrideConfig=v28 mCompatInfo={240dpi always-compat}}
    java.lang.Throwable
        at android.app.ResourcesManager.getOrCreateResources(ResourcesManager.java:756)
        at android.app.ResourcesManager.getResources(ResourcesManager.java:870)
        at android.app.ActivityThread.getTopLevelResources(ActivityThread.java:1963)
        at android.app.ApplicationPackageManager.getResourcesForApplication(ApplicationPackageManager.java:1420)
        at android.app.ApplicationPackageManager.getText(ApplicationPackageManager.java:1677)
        at android.content.pm.ComponentInfo.loadUnsafeLabel(ComponentInfo.java:107)
        at android.content.pm.PackageItemInfo.loadLabel(PackageItemInfo.java:194)
        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2898)
        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3090)
        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78)
        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1817)
        at android.os.Handler.dispatchMessage(Handler.java:106)
        at android.os.Looper.loop(Looper.java:193)
        at android.app.ActivityThread.main(ActivityThread.java:6749)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)
2020-09-22 11:16:37.430 9331-9331/com.android.calculator2 D/ResourcesManager: - using existing impl=android.content.res.ResourcesImpl@f03a44d
2020-09-22 11:16:37.430 9331-9331/com.android.calculator2 D/ResourcesManager: - using existing ref=android.content.res.Resources@12a9b02
2020-09-22 11:16:37.559 9331-9331/com.android.calculator2 V/ResourcesManager: Skipping new config: curSeq=4, newSeq=4

```

