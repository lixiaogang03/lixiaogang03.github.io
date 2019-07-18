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

### 参考文章

[Android 9.x 设置默认桌面流程-简书](https://www.jianshu.com/p/f8913ce0a004?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation)

### Home Setting

**adb shell am start -a android.settings.HOME_SETTINGS**

**adb shell dumpsys package pref**

> pref[erred]: print preferred package settings

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

**adb shell dumpsys package preferred-xml**

> preferred-xml [--full]: print preferred package settings as xml

```txt

$ adb shell dumpsys package preferred-xml

<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<preferred-activities>

    <item name="com.tencent.mobileqq/.activity.SplashActivity">
        <filter>
            <action name="android.intent.action.MAIN" />
            <cat name="android.intent.category.HOME" />
            <cat name="android.intent.category.DEFAULT" />
        </filter>
    </item>

</preferred-activities>

```

### PMS

**接口**

```java

    // 设置默认桌面
    public abstract void replacePreferredActivity(IntentFilter filter, int match,
            ComponentName[] set, ComponentName activity);

    // 启动桌面
    private ResolveInfo chooseBestActivity(Intent intent, String resolvedType,
            int flags, List<ResolveInfo> query, int userId) {

```

### Home 启动

![pms_home_start](/images/pms_home_start.png)


