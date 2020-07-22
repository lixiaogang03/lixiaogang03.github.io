---
layout:     post
title:      Android Architecture Components
subtitle:   Android Architecture Components samples
date:       2020-07-21
author:     LXG
header-img: img/post-bg-ioses.jpg
catalog: true
tags:
    - android
---

[Android 架构组件-google](https://developer.android.google.cn/topic/libraries/architecture)

[Android Jetpack-google](https://developer.android.google.cn/jetpack)

## 简介

Android 架构组件是一组库，可帮助您设计稳健、可测试且易维护的应用。您可以从管理界面组件生命周期和处理数据持久性的类着手。

1. 通过应用架构指南，学习有关汇编稳健应用的基础知识。
2. 管理应用的生命周期。新的生命周期感知型组件可帮助您管理 Activity 和 Fragment 的生命周期。在配置更改后继续有效、避免内存泄漏，以及轻松加载数据到界面中。
3. 使用 LiveData 构建数据对象，在基础数据库改变时通知视图。
4. ViewModel 存储界面相关的数据，这些数据不会在应用轮转时销毁。
5. Room 是一个 SQLite 对象映射库。它可用来避免样板代码，并轻松地将 SQLite 表数据转换为 Java 对象。Room 提供 SQLite 语句的编译时检查，并且可以返回 RxJava、Flowable 和 LiveData 可观察对象。

## Jetpack

Jetpack 是一套库、工具和指南，可帮助开发者更轻松地编写优质应用。这些组件可帮助您遵循最佳做法、让您摆脱编写样板代码的工作并简化复杂任务，以便您将精力集中放在所需的代码上。

Jetpack 包含与平台 API 解除捆绑的 androidx.* 软件包库。这意味着，它可以提供向后兼容性，且比 Android 平台的更新频率更高，以此确保您始终可以获取最新且最好的 Jetpack 组件版本。

## 架构图

![final-architecture](/images/final-architecture.png)

## sunflower

[sunflower-github](https://github.com/android/sunflower)

A gardening app illustrating Android development best practices with Android Jetpack.


