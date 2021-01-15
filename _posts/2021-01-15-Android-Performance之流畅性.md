---
layout:     post
title:      Android Performance之流畅性
subtitle:   流畅性主要指的是卡顿、掉帧，Smooth vs Jank
date:       2021-01-15
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - performance
---

[androidperformance.com](https://www.androidperformance.com/)

[Android性能优化之渲染篇-胡凯](http://hukai.me/android-performance-render/)

[性能评估-AOSP](https://source.android.com/devices/tech/debug/eval_perf?hl=zh-cn)

## 卡顿

大多数手机的屏幕刷新频率是60hz，如果在1000/60=16.67ms内没有办法把这一帧的任务执行完毕，就会发生丢帧的现象。丢帧越多，用户感受到的卡顿情况就越严重

![android_performance_course_drop_frame](/images/performance/android_performance_course_drop_frame.png)

**卡顿分类：**

* 与负载能力相关的卡顿
* 与抖动相关的卡顿

## CPU and GPU

渲染操作通常依赖于两个核心组件：CPU与GPU。CPU负责包括Measure，Layout，Record，Execute的计算操作，GPU负责Rasterization(栅格化)操作。CPU通常存在的问题的原因是存在非必需的视图组件，它不仅仅会带来重复的计算操作，而且还会占用额外的GPU资源。

![android_performance_course_render_problems](/images/performance/android_performance_course_render_problems.jpg)

## 渲染流程

为了能够使得App流畅，我们需要在每帧16ms以内处理完所有的CPU与GPU的计算，绘制，渲染等等操作。

![gpu_cpu_rasterization](/images/performance/gpu_cpu_rasterization.png)

## 平台性能导致的卡顿案例

[Android卡顿丢帧原因-系统篇](https://www.androidperformance.com/2019/09/05/Android-Jank-Due-To-System/)

1. SurfaceFlinger主线程耗时
2. CPU调度问题-重要任务(RenderThread)运行在小核, 导致一帧执行时间过长
3. 触发 Thermal 导致限频
4. 后台活动进程太多导致系统繁忙
5. SystemServer锁导致的线程等待
6. LMK频繁工作抢占CPU
7. Input 报点不均匀
8. 低内存导致IO耗时
9. kswapd跑大核占用CPU
10. 三方应用使用Accessibility服务导致系统卡顿

## 应用导致的卡顿案例

[Android卡顿丢帧原因-应用篇](https://www.androidperformance.com/2019/09/05/Android-Jank-Due-To-App/)

1. App主线程执行时间长：主线程执行 Input \ Animation \ Measure \ Layout \ Draw \ decodeBitmap 等操作超时都会导致卡顿
2. uploadBitmap 超时
3. BuildDrawingCache 超时
4. 使用CPU渲染而不是GPU渲染
5. 主线程Binder耗时
6. WebView 性能不足
7. 帧率和刷新率不匹配
8. 应用性能跟不上高帧率屏幕和系统
9. 主线程IO操作
10. WebView 与主线程交互
11. RenderThread 耗时
12. 多个RenderThread同步导致主线程卡顿

## 流畅度的量化方法

[Software Performance Engineering-Caveman.Work Blog](http://www.caveman.work/)

![phase_of_verifing_code_build](/images/performance/phase_of_verifing_code_build.png)

* Code Build：编译出来的程序
* Verify in Lab：由实验室环境下由人使用测试用例验证
* CI by Robot：程序由可持续集成框架(CI: Continuous Integration)进行自动化性能测试
* Monitor in RUM：使用大数据工具分析线上用户数据在真实环境下的数据

我们推荐的做法是：

* 将定性方法(Qualitative method)应用在 [Verify in Lab]
* 将定量方法(Quantitative method)应用在 [CI by Robot]，[Monitor in RUM]

### 定性方法

由于有些人对应用流畅度感受不够敏感，可以由对其比较敏感，在意的人员来操作。流畅度测试与其他测试不同，他需要
测试人员的对卡顿现象(界面更新不自然)的有与生俱来的感觉与挑剔。 拥有这种品质的人是定性测试的最佳人选。

### 定量方法

针对流畅度量化方法，我们的解决方案是不同界面场景使用不同的量化指标。

**常见应用场景：**

* 流媒体，视频播放，相机类
* 游戏类
* UX应用-内容浏览类
* UX应用-内容交互类

**流畅度量化指标：**

* FPS Family
* Realtime FPS
* Static FPS
* FPS Stability
* Frame Drop Family
* Frame Drop Percent (FDP)
* Frame Drop Badass (FDB)
* Frame Drop Heavy Tail (FDHT)
* Heavy task in UI Thread (HT)


**应用场景与量化指标间的使用关系为：**

* [流媒体，视频播放，相机类} -> [FPS Familiy]
* [游戏类] -> [FPS Family]
* [UX应用-内容浏览类] -> [FDP, FDB, HT]
* [UX应用-内容交互类] -> [FDHT, HT]


## HWUI 呈现模式分析

[检查GPU渲染速度和过渡绘制-Google](https://developer.android.com/topic/performance/rendering/inspect-gpu-rendering?hl=zh-cn)

![profile_gpu_rendering](/images/performance/profile_gpu_rendering.png)

![profile_gpu_rendering_2](/images/performance/profile_gpu_rendering_2.png)


## 流畅度测试应用

**UiBench.apk**

frameworks/base/tests/UiBench/

![uibench_test](/images/performance/uibench_test.png)

**TouchLatency**

frameworks/base/tests/TouchLatency/

![touch_latency_test](/images/performance/touch_latency_test.png)








