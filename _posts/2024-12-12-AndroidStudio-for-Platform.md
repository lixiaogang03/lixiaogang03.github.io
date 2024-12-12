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

























