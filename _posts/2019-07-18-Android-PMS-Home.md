---
layout:     post
title:      Android PMS Home
subtitle:   Default Home App
date:       2019-07-18
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - pms
---

## Home Setting

**adb shell am start -a android.settings.HOME_SETTINGS**

**adb shell dumpsys package pref**

```txt

$ dumpsys package pref

Preferred Activities User 0:

  Non-Data Actions:
      android.intent.action.MAIN:
        572566a com.tencent.mobileqq/.activity.SplashActivity
         mMatch=0x100000 mAlways=true
          Selected from:
            com.woyou.launcher/com.android.launcher3.Launcher
            com.tencent.mobileqq/.activity.SplashActivity
            com.android.settings/.FallbackHome
          Action: "android.intent.action.MAIN"
          Category: "android.intent.category.HOME"
          Category: "android.intent.category.DEFAULT"
          AutoVerify=false

```


