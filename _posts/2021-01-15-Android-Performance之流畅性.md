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


