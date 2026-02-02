---
layout:     post
title:      Android Performance Optimization
subtitle:   ROM
date:       2019-08-22
author:     LXG
header-img: img/post-bg-perfomance.jpg
catalog: true
tags:
    - Android
---

## Android Performance Optimization

[官方网站 Performance and Power](https://developer.android.com/topic/performance/)

[官方网站 Android Studio Profile](https://developer.android.com/studio/profile/)

[胡凯翻译 安卓性能优化典范](http://hukai.me/blog/categories/android-performance/)

[Performance-AOSP](https://source.android.com/devices/tech/perf/apk-caching)


## 电量分析

[Battery_Historian_Tool使用说明](https://wwmmyy.github.io/2016/12/14/Battery_Historian_Tool%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E/)

[Android Alarm、WakeLock机制与对齐唤醒](http://codingtrip.com/2017/03/27/0010-alian_wakeup/)

[理解android的alarm机制-Gityuan](http://gityuan.com/2017/03/12/alarm_manager_service/)

[理解JobScheduler机制-Gityuan](http://gityuan.com/2017/03/10/job_scheduler_service/)


## CPU 控制策略

### QCOM

[高通官网](https://developer.qualcomm.com/software/snapdragon-power-optimization-sdk)

[ZGQboost-github](https://github.com/zengge2/ZGQboost)

framework/base/core/java/android/util/[BoostFramework.java]

vendor/qcom/proprietary/android-perf/QPerformance

```java
/** @hide */
public class BoostFramework {

    private static final String TAG = "BoostFramework";
    private static final String PERFORMANCE_JAR = "/system/framework/QPerformance.jar";
    private static final String PERFORMANCE_CLASS = "com.qualcomm.qti.Performance";
}
```

### MTK

frameworks/base/core/java/com/mediatek/perfservice/IPerfServiceManager.java

vendor/mediatek/proprietary/hardware/perfservice/



