---
layout:     post
title:      Android Permission
subtitle:   ROM
date:       2018-11-09
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Android
    - Permission
---

## Android Permission

[AOSP安全指南](https://source.android.com/security)

[官网应用安全最佳实践](https://developer.android.com/topic/security/best-practices#permissions)

[源码权限定义](http://androidxref.com/7.1.2_r36/xref/frameworks/base/core/res/AndroidManifest.xml)

[官网权限定义](https://developer.android.google.cn/reference/android/Manifest.permission)

### android.permission.INJECT_EVENTS
'''
    <!-- @SystemApi Allows an application to inject user events (keys, touch, trackball)
         into the event stream and deliver them to ANY window.  Without this
         permission, you can only deliver events to windows in your own process.
         <p>Not for use by third-party applications.
         @hide
    -->
    <permission android:name="android.permission.INJECT_EVENTS"
        android:protectionLevel="signature" />
'''









