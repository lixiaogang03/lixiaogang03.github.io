---
layout:     post
title:      android VINTF 机制
subtitle:   Vendor Interface Versioning and Testing Framework
date:       2025-03-08
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
---

[供应商接口对象](https://source.android.com/docs/core/architecture/vintf?hl=zh-cn)

## 概念

VINTF（Vendor Interface Versioning and Testing Framework）是用于验证 Android 系统框架（Framework） 和 供应商实现（Vendor Implementation） 之间兼容性的机制。
AOSP 在编译时，会生成和校验 VINTF 相关文件，确保 Framework 和 HAL（Hardware Abstraction Layer） 之间的接口匹配

## 编译生成-RK3568

**./vendor/etc/vintf**

```bash

.
├── compatibility_matrix.xml
├── manifest
│   ├── android.hardware.cas@1.2-service.xml
│   ├── android.hardware.drm@1.3-service.widevine.xml
│   ├── android.hardware.gatekeeper@1.0-service.optee.xml
│   ├── android.hardware.gnss@2.0-service.xml
│   ├── android.hardware.health@2.1.xml
│   ├── android.hardware.keymaster@4.0-service.optee.xml
│   ├── android.hardware.weaver@1.0-service.xml
│   ├── android.hardware.wifi@1.0-service.xml
│   ├── android.hardware.wifi.hostapd.xml
│   ├── lights-rockchip.xml
│   ├── manifest_android.hardware.drm@1.3-service.clearkey.xml
│   ├── manifest.xml
│   ├── power-aidl-rockchip.xml
│   ├── rockchip.hardware.neuralnetworks@1.0-service.xml
│   ├── rockchip.hardware.outputmanager@1.0-service.xml
│   └── rockchip.hardware.rockit.hw@1.0-service.xml
└── manifest.xml


```

**./system/etc/vintf**

```bash

├── compatibility_matrix.1.xml
├── compatibility_matrix.2.xml
├── compatibility_matrix.3.xml
├── compatibility_matrix.4.xml
├── compatibility_matrix.5.xml
├── compatibility_matrix.device.xml
├── compatibility_matrix.legacy.xml
├── manifest
│   ├── android.frameworks.stats@1.0-service.xml
│   ├── android.hidl.allocator@1.0-service.xml
│   ├── android.system.suspend@1.0-service.xml
│   ├── manifest_android.frameworks.cameraservice.service@2.1.xml
│   └── manifest_media_c2_software.xml
└── manifest.xml

```

**./hardware/interfaces/compatibility_matrices/**

| **文件名**                           | **作用** |
|--------------------------------------|----------|
| `compatibility_matrix.1.xml`        | **适用于 Android 8（API Level 26）** 的兼容性矩阵，定义了该版本系统所需的 HAL（HIDL/AIDL）接口。 |
| `compatibility_matrix.2.xml`        | **适用于 Android 8.1（API Level 27）**，相比 `compatibility_matrix.1.xml`，可能包含新的 HAL 需求。 |
| `compatibility_matrix.3.xml`        | **适用于 Android 9（API Level 28）**，新增或更新了一些 HAL 版本，例如 `camera@3.4`、`audio@5.0`。 |
| `compatibility_matrix.4.xml`        | **适用于 Android 10（API Level 29）**，继续扩展 HAL 需求，如 `vibrator@1.3`、`biometrics@2.0` 等。 |
| `compatibility_matrix.5.xml`        | **适用于 Android 11（API Level 30）**，进一步调整 HAL 版本要求，例如 `graphics.mapper@4.0`、`neuralnetworks@1.3` 等。 |
| `compatibility_matrix.legacy.xml`   | **向后兼容性矩阵**，定义旧 HAL 版本，以支持老设备（例如 Android 7.x 及更早版本）。 |
| `compatibility_matrix.empty.xml`    | **空的兼容性矩阵文件**，用于特定调试或实验场景，可能用于 **跳过 VINTF 校验**。 |


## 编译流程

AOSP 在编译时涉及 VINTF 的主要流程包括：

1. 解析 VINTF 相关 XML 文件
2. 生成 framework 兼容性矩阵
3. 生成 vendor manifest
4. 在编译阶段进行 VINTF 验证
5. 安装 VINTF 相关文件到系统分区

### 解析 VINTF 相关 XML 文件

AOSP 的 VINTF 主要依赖 两类 XML 配置文件，分别用于描述 Framework 兼容性矩阵 和 Vendor Manifest：

**Framework Compatibility Matrix（框架兼容性矩阵）**

定义 Android 系统期望的 HAL 版本和接口，规定哪些 HAL 必须存在

**Vendor Manifest（供应商清单）**

定义设备上实际支持的 HAL 接口及其版本

### 生成 Framework 兼容性矩阵

在 framework（系统框架）编译时，AOSP 会生成 Framework Compatibility Matrix，并存放到 system/etc/vintf/

### 生成 Vendor Manifest

对于 设备厂商（Vendor），HAL 模块会定义自己的 manifest.xml，编译时，AOSP 会：

device/rockchip/common/BoardConfig.mk

```makefile

DEVICE_MANIFEST_FILE ?= device/rockchip/common/manifest.xml
DEVICE_MATRIX_FILE   ?= device/rockchip/common/compatibility_matrix.xml

#for rk 4g modem
BOARD_HAS_RK_4G_MODEM ?= true

ifeq ($(strip $(BOARD_HAS_RK_4G_MODEM)),true)
DEVICE_MANIFEST_FILE += device/rockchip/common/4g_modem/manifest.xml
endif

```

**device/rockchip/common/manifest.xml**

```xml

<manifest version="2.0" type="device" target-level="5">
    <hal format="hidl">
        <name>android.hardware.audio</name>
        <transport>hwbinder</transport>
        <version>6.0</version>
        <interface>
            <name>IDevicesFactory</name>
            <instance>default</instance>
        </interface>
        <fqname>@6.0::IDevicesFactory/default</fqname>
    </hal>
    <kernel target-level="5"/>
</manifest>

```

**system/etc/vintf/compatibility_matrix.5.xml**

```xml

<compatibility-matrix version="2.0" type="framework" level="5">
    <hal format="hidl" optional="false">
        <name>android.hardware.audio</name>
        <version>6.0</version>
        <interface>
            <name>IDevicesFactory</name>
            <instance>default</instance>
        </interface>
    </hal>
    <kernel version="5.4.42" level="5">
</compatibility-matrix>

```

可以看到manifest.xml和compatibility_matrix.5.xml是存在对应关系的, compatibility_matrix.5.xml是系统需求， manifest.xml是设备实际供给

### 在编译阶段进行 VINTF 验证

**生成 checkvintf 工具**

AOSP 在编译 vintf 相关模块时，会构建 checkvintf 这个工具。checkvintf 主要用于：

* 在编译时校验 manifest.xml 和 compatibility_matrix.xml 是否匹配
* 在设备启动时进行 VINTF 兼容性检查


build/make/core/Makefile

```makefile

# -- Check system manifest / matrix including fragments (excluding other framework manifests / matrices, e.g. product);
check_vintf_system_deps := $(filter $(TARGET_OUT)/etc/vintf/%, $(check_vintf_common_srcs))
ifneq ($(check_vintf_system_deps),)
check_vintf_has_system := true
check_vintf_system_log := $(intermediates)/check_vintf_system_log
check_vintf_all_deps += $(check_vintf_system_log)
$(check_vintf_system_log): $(HOST_OUT_EXECUTABLES)/checkvintf $(check_vintf_system_deps)
        @( $< --check-one --dirmap /system:$(TARGET_OUT) > $@ 2>&1 ) || ( cat $@ && exit 1 )
check_vintf_system_log :=
endif # check_vintf_system_deps
check_vintf_system_deps :=


```

### 检查内容分析

./out/target/product/rk3568_r/obj/PACKAGING/check_vintf_all_intermediates/check_vintf_system_log

```txt

checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:447] Checking system manifest.
checkvintf I 03-03 16:38:21 25030 25030 VintfObject.cpp:55] getFrameworkHalManifest: Reading VINTF information.
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:84] List 'out/target/product/rk3568_r/system/etc/vintf/manifest/': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest/android.frameworks.stats@1.0-service.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest/android.hidl.allocator@1.0-service.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest/manifest_media_c2_software.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest/android.system.suspend@1.0-service.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest/manifest_android.frameworks.cameraservice.service@2.1.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 VintfObject.cpp:61] getFrameworkHalManifest: Successfully processed VINTF information
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:453] Checking system matrix.
checkvintf I 03-03 16:38:21 25030 25030 VintfObject.cpp:55] getDeviceHalManifest: Reading VINTF information.
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:119] Sysprop ro.boot.product.vendor.sku is missing, default to ''
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:119] Sysprop ro.boot.product.hardware.sku is missing, default to ''
checkvintf E 03-03 16:38:21 25030 25030 VintfObject.cpp:65] getDeviceHalManifest: status from fetching VINTF information: -2
checkvintf E 03-03 16:38:21 25030 25030 VintfObject.cpp:66] getDeviceHalManifest: -2 VINTF parse error: Cannot resolve path /vendor/manifest.xml
checkvintf I 03-03 16:38:21 25030 25030 VintfObject.cpp:55] getFrameworkCompatibilityMatrix: Reading VINTF information.
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:84] List 'out/target/product/rk3568_r/system/etc/vintf/': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.1.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.device.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.2.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/manifest.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.legacy.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.3.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.4.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:74] Fetch 'out/target/product/rk3568_r/system/etc/vintf/compatibility_matrix.5.xml': SUCCESS
checkvintf I 03-03 16:38:21 25030 25030 check_vintf.cpp:119] Sysprop ro.product.first_api_level is missing, default to ''
checkvintf I 03-03 16:38:21 25030 25030 VintfObject.cpp:61] getFrameworkCompatibilityMatrix: Successfully processed VINTF information


```

**系统 Manifest 校验**

**系统 Compatibility Matrix 校验**

从 out/target/product/rk3568_r/system/etc/vintf/ 目录下依次获取各个兼容性矩阵文件（例如 compatibility_matrix.1.xml、compatibility_matrix.device.xml、compatibility_matrix.2.xml、compatibility_matrix.legacy.xml、compatibility_matrix.3.xml、compatibility_matrix.4.xml、compatibility_matrix.5.xml），并验证这些文件是否正确反映了系统对 HAL 接口和版本的要求

在 Android 8.0（Oreo）引入 Treble 架构后，Google 提出了 VINTF（Vendor Interface Versioning and Testing Framework）机制，用于解耦 系统框架（System / Framework） 与 供应商实现（Vendor）。
VINTF 通过一组 XML 文件 来描述 系统所需的硬件接口（Compatibility Matrix） 和 设备实际提供的硬件接口（Manifest），从而在 编译时 和 设备启动时 检查二者是否兼容。

* 系统 Compatibility Matrix：定义 系统 需要哪些 HAL、HIDL/AIDL 接口以及对应版本（相当于「需求侧」）
* Vendor Manifest：定义 设备（vendor） 实际提供了哪些 HAL 及版本（相当于「供给侧」）

**需求侧**

system/etc/vintf/compatibility_matrix.5.xml

**供给侧**

vendor/etc/vintf/manifest.xml

![android_vintf](/images/hardware/android_vintf.png)


## 异常日志和分析

```txt

FAILED: ninja: out/target/product/rk3566_r/system/etc/vintf/compatibility_matrix.1.xml, needed by 'out/target/product/rk3566_r/obj/PACKAGING/check_vintf_all_intermediates/check_vintf.system.log', missing and no known rule to make it

```

问题原因： hardware/interfaces/compatibility_matrices/android.bp 文件被打开，导致编译系统无法访问








