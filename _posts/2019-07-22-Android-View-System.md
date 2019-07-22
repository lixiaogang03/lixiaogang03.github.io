---
layout:     post
title:      Android View System
subtitle:   图形显示系统
date:       2019-07-22
author:     LXG
header-img: img/post-bg-miui6.jpg
catalog: true
tags:
    - android
    - wms
    - view
---

## 参考链接

[Android图形显示系统-简书](https://www.jianshu.com/p/424918260fa9)

[Android图形系统-简书](https://www.jianshu.com/p/180e1b6d0dcd)

[图形架构-AOSP](https://source.android.com/devices/graphics/architecture)

## Android Graphics

1. 无论开发者使用什么渲染 API，一切内容都会渲染到“Surface”
2. Surface 表示缓冲队列中的生产方，而缓冲队列通常会被 SurfaceFlinger 消耗
3. 在 Android 平台上创建的每个窗口都由 Surface 提供支持
4. 所有被渲染的可见 Surface 都被 SurfaceFlinger 合成到显示部分

下图显示了关键组件如何协同工作：

![android_graphics](/images/android_graphics.png)


