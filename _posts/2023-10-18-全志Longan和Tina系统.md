---
layout:     post
title:      全志Longan和Tina系统
subtitle:   T113-S3
date:       2023-10-18
author:     LXG
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
tags:
    - linux
---

[Tina Linux 系统介绍](https://d1.docs.aw-ol.com/study/study_1tina/)

## Tina

Tina_Linux_系统软件_开发指南.pdf

Tina Linux是全志科技基于Linux内核开发的针对智能硬件类产品的嵌入式软件系统。Tina Linux基于openwrt-14.07 版本的软件开发包，包含了 Linux 系统开发用到的内核源码、驱动、工具、系统中间件与应用程序包。

![Tina_Linux_ARCH](/images/allwinner/Tina_Linux_ARCH.png)

Tina系统软件架构如图所示。从下至上分别为Kernel && Driver、Libraries、System Services、Applications 四层

1. Kernel&&Driver 层主要提供 Linux Kernel 的标准实现。Tina 平台的 Linux Kernel 采用 Linux3.4、Linux3.10、Linux4.4、Linux4.9、Linux5.4 等内核，不同硬件平台使用不同内核版本，提供安全性、内存管理、进程管理、网络协议栈等基础支持，并通过 Linux 内核管理设备硬件资源，如 CPU 调度、缓存、内存、I/O 等。 其中D1-H适配的是Linux 5.4内核。
2. Libraries 层对应一般嵌入式系统，相当于中间件层次。其包含了各种系统基础库、第三方开源程序库支持，为应用层提供 API 接口，系统定制者和应用开发者可以基于 Libraries 层的API 开发新的系统服务和应用程序。
3. System Services 层对应系统服务层，包含系统启动管理、配置管理、热插拔管理、存储管理、多媒体中间件等。
4. Applications 层主要是实现具体的产品功能及交互逻辑，开发者可以开发实现自己的应用程序，提供系统各种能力给到终端用户。

### Tina SDK 目录

Tina Linux SDK 主要由构建系统、配置工具、工具链、host 工具包、目标设备应用程序、文档、脚本、linux 内核、bootloader 部分组成，下文按照目录顺序介绍相关的组成组件。

```txt

Tina-SDK/
├── build
├── config
├── Config.in
├── device
├── dl
├── docs
├── lichee
├── Makefile
├── out
├── package
├── prebuilt
├── rules.mk
├── scripts
├── target
├── tmp
├── toolchain
└── tools

```

### Tina GUI 框架

![tina_gui](/images/allwinner/tina_gui.jpeg)

## Longan

longan 是 lichee 和 kunos 合并后的名称，是全志平台统一使用的 linux 开发平台。它集成了BSP，构建系统，独立 IP 和测试，既可作为 BSP 开发和 IP 验证平台，也可以作为量产的嵌入式 linux 系统。

longan 的功能包括以下四部分：
1. BSP 开发，包括 bootloader，uboot 和 kernel
2. Linux SDK 开发，包括量产的嵌入式 linux 系统
3. IP 的验证和发布平台，包括 gpu，cedarx，gstreamer，drm/weston，security 以及其
他的私有软件包。IP 随 longan 的发布而发布，减少使用邮件发布；并且给出 IP 的使用方法
和系统集成的 demo 程序，方便第三方快速使用
4. 测试，包括板级测试和系统测试，如 SATA 和 drangonboard。

### Longan SDK 目录

```txt

t113_linux$ tree -L 1
.
├── brandy
├── build
├── buildroot
├── build.sh
├── device
├── Docs
├── evb1_auto -> device/config/chips/t113/configs/evb1_auto/
├── kernel
├── platform
├── README.md
├── test
└── tools

```































