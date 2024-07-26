---
layout:     post
title:      Battery Optimization
subtitle:   Optimize for battery life
date:       2019-03-12
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
    - battery
---

[电池优化-官网](https://developer.android.com/topic/performance/power)

## Doze and App Standby

### Doze-低功耗模式

> 如果用户设备未插接电源、处于静止状态一段时间且屏幕关闭，设备会进入低电耗模式。 在低电耗模式下，系统会尝试通过限制应用对网络和 CPU 密集型服务的访问来节省电量。 这还可以阻止应用访问网络并推迟其作业、同步和标准闹铃。

> 系统会定期退出低电耗模式一会儿，好让应用完成其已推迟的 Activity。在此维护时段内，系统会运行所有待定同步、作业和闹铃并允许应用访问网络。

![Doze](/images/android/doze.png)

### App Standby-应用待机模式

> 应用待机模式允许系统判定应用在用户未主动使用它时处于空闲状态。 当用户有一段时间未触摸应用时，系统便会作出此判定。

> 当用户将设备插入电源时，系统将从待机状态释放应用，从而让它们可以自由访问网络并执行任何待定作业和同步。 如果设备长时间处于空闲状态，系统将按每天大约一次的频率允许空闲应用访问网络。

## App Standby Buckets

> Android 9 (API level 28) introduces a new battery management feature, App Standby Buckets. App Standby Buckets help the system prioritize apps' requests for resources based on how recently and how frequently the apps are used. Based on app usage patterns, each app is placed in one of five priority buckets. The system limits the device resources available to each app based on which bucket the app is in.

## Background restrictions-隐方广播限制

[Android-O后台服务和广播限制](https://developer.android.com/about/versions/oreo/background?hl=zh-cn)

## Power management restrictions



## Testing and troubleshooting
