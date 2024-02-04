---
layout:     post
title:      OpenHarmony
subtitle:   开源鸿蒙
author:     LXG
header-img: img/open_harmony.jpg
catalog: true
tags:
    - huawei
---

[OpenHarmony](https://www.openharmony.cn/mainPlay)

[HarmonyOS NEXT](https://developer.huawei.com/consumer/cn/next)

## 简介

OpenHarmony是由开放原子开源基金会（OpenAtom Foundation）孵化及运营的开源项目, 目标是面向全场景、全连接、全智能时代、基于开源的方式，搭建一个智能终端设备操作系统的框架和平台，促进万物互联产业的繁荣发展

## 代码贡献排行榜

1. 华为           91.4%
2. 深开鸿         5.07%
3. 软通动力       1.24%
4. 九联开鸿       1.06%
5. 开鸿智谷       1.01%

## OpenHarmony VS Harmony NEXT

HarmonyOS NEXT 指华为在自身产品和服务上使用的鸿蒙操作系统的下一代版本或者未来规划中的新特性、新技术。
它是华为基于 OpenHarmony 开源项目，并结合自身技术和生态优势进行深度定制和优化后的产品形态。
对于华为而言，Harmony NEXT 更侧重于实现自身的商业目标和技术路线图，提供给消费者和合作伙伴的是具有华为特色且功能丰富、体验优良的操作系统版本

## 技术架构

OpenHarmony整体遵从分层设计，从下向上依次为：内核层、系统服务层、框架层和应用层。系统功能按照“系统 > 子系统 > 组件”逐级展开，在多设备部署场景下，支持根据实际需求裁剪某些非必要的组件

![arch](/images/open_harmony/arch.png)

## 源码目录

```txt

open-harmony/purple-pi$ tree -L 1
.
├── applications
├── arkcompiler
├── base
├── build
├── build.py -> build/lite/build.py
├── build.sh -> build/build_scripts/build.sh
├── ccache.log
├── ccache.log.old
├── commonlibrary
├── developtools
├── device
├── docs
├── drivers
├── foundation
├── interface
├── kernel
├── mkboot.sh
├── napi_generator
├── ohos_config.json
├── out
├── prebuilts
├── productdefine
├── qemu-run -> vendor/ohemu/common/qemu-run
├── test
├── third_party
├── tools_previewer
└── vendor

```

| 目录名      | 描述 |
| ----------- | ----------- |
| applications	| 应用程序样例，包括camera等 |
| base	| 基础软件服务子系统集&硬件服务子系统集 |
| build	| 组件化编译、构建和配置脚本 |
| docs	| 说明文档 |
| domains | 增强软件服务子系统集 |
| drivers   |	驱动子系统  |
| foundation  |	系统基础能力子系统集 |
| kernel	| 内核子系统 |
| prebuilts	| 编译器及工具链子系统 |
| test	| 测试子系统 |
| third_party	| 开源第三方组件 |
| utils	| 常用的工具集 |
| vendor  |	厂商提供的软件 |
| build.py  |	编译脚本文件  |

## 系统类型

**轻量系统（mini system）**

面向MCU类处理器例如Arm Cortex-M、RISC-V 32位的设备，硬件资源极其有限，支持的设备最小内存为128KiB，可以提供多种轻量级网络协议，轻量级的图形框架，以及丰富的IOT总线读写部件等。可支撑的产品如智能家居领域的连接类模组、传感器设备、穿戴类设备等。

**小型系统（small system）**

面向应用处理器例如Arm Cortex-A的设备，支持的设备最小内存为1MiB，可以提供更高的安全能力、标准的图形框架、视频编解码的多媒体能力。可支撑的产品如智能家居领域的IP Camera、电子猫眼、路由器以及智慧出行域的行车记录仪等。

**标准系统（standard system）**

面向应用处理器例如Arm Cortex-A的设备，支持的设备最小内存为128MiB，可以提供增强的交互能力、3D GPU以及硬件合成能力、更多控件以及动效更丰富的图形能力、完整的应用框架。可支撑的产品如高端的冰箱显示屏。

## 内核层

* 内核子系统：采用多内核（Linux内核或者LiteOS）设计，支持针对不同资源受限设备选用适合的OS内核。内核抽象层（KAL，Kernel Abstract Layer）通过屏蔽多内核差异，对上层提供基础的内核能力，包括进程/线程管理、内存管理、文件系统、网络管理和外设管理等。

* 驱动子系统：驱动框架（HDF）是系统硬件生态开放的基础，提供统一外设访问能力和驱动开发、管理框架。

```txt

open-harmony/purple-pi/kernel$ tree -L 1
.
├── linux
├── liteos_a
├── liteos_m
└── uniproton

open-harmony/purple-pi/drivers$ tree  -L 1
.
├── hdf_core
├── interface
├── liteos
└── peripheral

```

## 系统服务层

系统服务层是OpenHarmony的核心能力集合，通过框架层对应用程序提供服务。该层包含以下几个部分：

* 系统基本能力子系统集：为分布式应用在多设备上的运行、调度、迁移等操作提供了基础能力，由分布式软总线、分布式数据管理、分布式任务调度、公共基础库、多模输入、图形、安全、AI等子系统组成。
* 基础软件服务子系统集：提供公共的、通用的软件服务，由事件通知、电话、多媒体、DFX（Design For X） 等子系统组成。
* 增强软件服务子系统集：提供针对不同设备的、差异化的能力增强型软件服务，由智慧屏专有业务、穿戴专有业务、IoT专有业务等子系统组成。
* 硬件服务子系统集：提供硬件服务，由位置服务、用户IAM、穿戴专有硬件服务、IoT专有硬件服务等子系统组成。

根据不同设备形态的部署环境，基础软件服务子系统集、增强软件服务子系统集、硬件服务子系统集内部可以按子系统粒度裁剪，每个子系统内部又可以按功能粒度裁剪。

**基础软件服务子系统集&硬件服务子系统集**

```txt

open-harmony/purple-pi/base$ tree -L 1
.
├── account
├── customization
├── global
├── hiviewdfx
├── inputmethod
├── iothardware
├── location
├── msdp
├── notification
├── powermgr
├── request
├── security
├── sensors
├── startup
├── telephony
├── theme
├── time
├── update
├── usb
├── useriam
└── web

```

**系统基本能力子系统集**

```txt

open-harmony/purple-pi/foundation$ tree -L 1
.
├── ability
├── ai
├── arkui
├── barrierfree
├── bundlemanager
├── communication
├── deviceprofile
├── distributeddatamgr
├── distributedhardware
├── filemanagement
├── graphic
├── multimedia
├── multimodalinput
├── resourceschedule
├── systemabilitymgr
└── window

```

## 框架层

框架层为应用开发提供了C/C++/JS等多语言的用户程序框架和Ability框架，适用于JS语言的ArkUI框架，以及各种软硬件服务对外开放的多语言框架API。根据系统的组件化裁剪程度，设备支持的API也会有所不同。

## 应用层

应用层包括系统应用和第三方非系统应用。应用由一个或多个FA（Feature Ability）或PA（Particle Ability）组成。其中，FA有UI界面，提供与用户交互的能力；
而PA无UI界面，提供后台运行任务的能力以及统一的数据访问抽象。基于FA/PA开发的应用，能够实现特定的业务功能，支持跨设备调度与分发，为用户提供一致、高效的应用体验。

```txt

open-harmony/purple-pi/applications$ tree -L 2
.
├── sample
│   ├── camera
│   └── wifi-iot
└── standard
    ├── admin_provisioning
    ├── app_samples
    ├── call
    ├── camera
    ├── contacts
    ├── contactsdata
    ├── filepicker
    ├── hap
    ├── launcher
    ├── mms
    ├── notes
    ├── permission_manager
    ├── photos
    ├── screenlock
    ├── screenshot
    ├── security_privacy_center
    ├── settings
    ├── settings_data
    ├── systemui
    └── theme

```





























