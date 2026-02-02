---
layout:     post
title:      Android Jetpack Compose
subtitle:   应用开发实践
date:       2025-08-01
author:     LXG
header-img: img/google_android.jpg
catalog: true
tags:
    - Android
---

[Android-Google](https://developer.android.google.cn/get-started/overview?hl=zh-cn)

## gradle 配置

[build.gradle](https://developer.android.google.cn/build/releases/gradle-plugin?hl=zh-cn)

**以前的方式**

```gradle

plugins {
    id 'com.android.application' version '8.11.0' apply false
    id 'com.android.library' version '8.11.0' apply false
    id 'org.jetbrains.kotlin.android' version '2.1.20' apply false
}

```

**新方式libs.versions.toml**

```toml

[versions]
# Android Gradle Plugin (AGP) 版本，用于 Gradle 构建 Android 应用
agp = "8.7.3"

# Kotlin 编译器和语言版本
kotlin = "2.0.0"

# AndroidX core-ktx，提供 Kotlin 扩展函数
coreKtx = "1.10.1"

# JUnit（Java 单元测试框架）版本
junit = "4.13.2"

# AndroidX 测试库的 JUnit 扩展版本（用于 instrumented test）
junitVersion = "1.1.5"

# Espresso 测试框架的核心库版本（UI 自动化测试）
espressoCore = "3.5.1"

# AndroidX 生命周期库的 Kotlin 扩展
lifecycleRuntimeKtx = "2.6.1"

# 用于 Jetpack Compose 的 Activity 支持库
activityCompose = "1.8.0"

# Jetpack Compose 的 Bill of Materials（BoM）版本，用于统一 Compose 各组件版本
composeBom = "2024.04.01"

[libraries]
# Kotlin 扩展函数支持
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }

# Java JUnit 测试库
junit = { group = "junit", name = "junit", version.ref = "junit" }

# AndroidX JUnit 扩展测试库（用于 instrumentation 测试）
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }

# Espresso UI 测试框架
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }

# Lifecycle runtime 支持的 Kotlin 扩展库（用于生命周期感知组件）
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }

# Jetpack Compose 的 Activity 整合库
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }

# Jetpack Compose UI 核心模块
androidx-ui = { group = "androidx.compose.ui", name = "ui" }

# Material Design 3 风格的 UI 控件支持库（Compose 版本）
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }


[plugins]
# 应用模块使用的 Android 插件（编译 APK 等）
android-application = { id = "com.android.application", version.ref = "agp" }

# Kotlin Android 插件（编译 Kotlin Android 项目）
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }

# Kotlin Compose 插件（用于启用 Jetpack Compose 相关功能）
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }

```

## Kotlin DSL 与 Groovy DSL

| 方面         | Kotlin DSL                     | Groovy DSL                  |
|--------------|-------------------------------|-----------------------------|
| 语言类型     | 静态类型，编译时检查           | 动态类型，运行时检查         |
| IDE 支持     | 强，智能补全和重构完善         | 一般，智能提示有限           |
| 语法风格     | 规范、明确，类似 Kotlin        | 灵活、简洁，支持闭包         |
| 错误发现     | 编译阶段发现错误               | 运行阶段发现错误             |
| 学习曲线     | 略陡，需熟悉 Kotlin            | 低，容易上手                 |
| 代码维护     | 易维护，结构清晰               | 灵活但代码易混乱             |
| 社区支持     | 趋势增长，官方推荐             | 成熟稳定，历史广泛使用       |
| 插件兼容性   | 现代插件支持好                 | 几乎所有插件兼容             |

**Kotlin DSL自定义apk输出名称非常困难**

## Jetpack Compose

Jetpack Compose 是一个用于构建原生 Android UI 的 声明式 UI 工具包（Toolkit），使用 Kotlin 编写，灵感来源于 React 和 Flutter。

| 维度 | Jetpack Compose | 传统 View 系统（XML + View） |
|------|------------------|-------------------------------|
| **UI 构建方式** | 使用 Kotlin 函数 + `@Composable` 注解 | 使用 XML 布局 + Activity/Fragment 控制 |
| **布局逻辑** | 组合式函数，结构扁平，声明式 | 嵌套 ViewGroup，结构层级多，命令式 |
| **状态响应** | 自动根据状态更新 UI（如 `remember { mutableStateOf(...) }`） | 手动更新 UI（如 `TextView.setText()`） |
| **代码结构** | 布局逻辑合一，可读性高 | XML 与 Java/Kotlin 分离，切换成本高 |
| **性能优化** | 高效编译为 UI Tree，避免不必要的重绘 | 层级多时性能下降，需优化布局层级 |
| **复用与封装** | 函数组合，支持默认参数与高阶函数 | 需定义自定义 View 或 include 重用布局 |
| **动画实现** | `animate*AsState` 简洁易用 | 使用 `Animator`, `ViewPropertyAnimator` 较复杂 |
| **生态兼容性** | 官方支持逐渐成熟，部分三方库未迁移 | 生态稳定，几乎所有 UI 库支持 |
| **UI 编辑器支持** | 支持 Compose Preview，但功能略简 | Android Studio 的 Layout Editor 功能强大 |
| **学习曲线** | 新思维（响应式 + 函数式）需适应 | 延续已有开发者经验，学习门槛较低 |
| **官方推荐度** | 推荐用于新项目，未来发展方向 | 保守维护，官方不建议新项目使用 |
| **跨平台能力** | 支持 Compose Multiplatform（桌面/网页） | 仅限 Android 平台 |

## 应用架构

[architecture](https://developer.android.google.cn/topic/architecture/intro?hl=zh-cn)













































