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

## 卡顿

大多数手机的屏幕刷新频率是60hz，如果在1000/60=16.67ms内没有办法把这一帧的任务执行完毕，就会发生丢帧的现象。丢帧越多，用户感受到的卡顿情况就越严重

![android_performance_course_drop_frame](/images/performance/android_performance_course_drop_frame.png)

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










