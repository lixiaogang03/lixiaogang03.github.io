---
layout:     post
title:      Android Studio for Platform
subtitle:   Android 源码开发工具
date:       2024-12-12
author:     LXG
header-img: img/post-bg-digital_circuits.jpg
catalog: true
tags:
    - androidstudio
---

[Android Studio for Platform](https://developer.android.google.cn/studio/platform)

## 简介

Android Studio for Platform (ASfP) 是 Android Studio IDE 的一个版本，适用于使用 Soong 构建系统进行构建的 Android 开源项目 (AOSP) 平台开发者

## 下载AOSP源码

[下载 Android 源代码](https://source.android.google.cn/docs/setup/download?hl=zh-cn)

### 安装repo

```bash

sudo apt install repo

```

### 初始化仓库

```bash

repo init --partial-clone -b main -u https://android.googlesource.com/platform/manifest

```

### 下载源码

```bash

repo sync -c -j8

```

-c 参数会指示 Repo 从服务器提取当前的清单分支。-j8 命令会将同步操作拆分成多个线程，以更快地完成同步。此操作应该需要一小时多一点的时间

### SystemUI 单独编译

android 13 单独编译SystemUI时，test 目录编译报错的解决方法

```diff

diff --git a/android/frameworks/base/packages/SystemUI/Android.bp b/android/frameworks/base/packages/SystemUI/Android.bp
index e148d4f547..757b621fe5 100644
--- a/android/frameworks/base/packages/SystemUI/Android.bp
+++ b/android/frameworks/base/packages/SystemUI/Android.bp
@@ -276,6 +276,7 @@ android_library {

 android_library {
     name: "SystemUI-tests",
+    enabled: false,
     defaults: [
         "SystemUI_compose_defaults",
     ],

diff --git a/android/frameworks/base/packages/SystemUI/tests/Android.bp b/android/frameworks/base/packages/SystemUI/tests/Android.bp
index 3c418ed49a..2361e815b2 100644
--- a/android/frameworks/base/packages/SystemUI/tests/Android.bp
+++ b/android/frameworks/base/packages/SystemUI/tests/Android.bp
@@ -20,6 +20,7 @@ package {
 
 android_test {
     name: "SystemUITests",
+    enabled: false,
 
     dxflags: ["--multi-dex"],
     platform_apis: true,

diff --git a/android/build/make/core/Makefile b/android/build/make/core/Makefile
index 935d59739c..007ad0593c 100755
--- a/android/build/make/core/Makefile
+++ b/android/build/make/core/Makefile
@@ -6965,7 +6965,7 @@ include $(sort $(wildcard $(BUILD_SYSTEM)/tasks/*.mk))
 -include $(sort $(wildcard device/*/*/build/tasks/*.mk))
 -include $(sort $(wildcard product/*/*/build/tasks/*.mk))
 # Also add test specifc tasks
-include $(sort $(wildcard platform_testing/build/tasks/*.mk))
+# include $(sort $(wildcard platform_testing/build/tasks/*.mk))
 include $(sort $(wildcard test/vts/tools/build/tasks/*.mk))
 endif

```

























