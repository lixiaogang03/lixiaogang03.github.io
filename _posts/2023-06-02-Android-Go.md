---
layout:     post
title:      Android Go
subtitle:   低内存设备配置
date:       2023-06-02
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

[Android Go 版本-Google](https://developer.android.google.cn/guide/topics/androidgo?hl=zh-cn)

## 规格要求

![android_go](/images/performance/android_go.png)

## A133 android Q

```makefile

# all devices got ram size equal to or less than 1GB should be defined as low ram device.
# also we can get rid of the software limit, and fully use 2GB ram and config it as regular device.
CONFIG_LOW_RAM_DEVICE := true
ifeq ($(CONFIG_LOW_RAM_DEVICE),true)
    $(call inherit-product, $(LOCAL_PATH)/configs/go/go_base.mk)

    #$(call inherit-product, build/target/product/go_defaults.mk)

    # use special go config

    $(call inherit-product, device/softwinner/common/go_common.mk)
    $(call inherit-product, device/softwinner/common/mainline_go.mk)

    # flattened apex. Go device use flattened apex for the consider of performance

    TARGET_FLATTEN_APEX := true

    DEVICE_PACKAGE_OVERLAYS := $(LOCAL_PATH)/overlay_go \
                               $(DEVICE_PACKAGE_OVERLAYS)
    # Strip the local variable table and the local variable type table to reduce
    # the size of the system image. This has no bearing on stack traces, but will
    # leave less information available via JDWP.

    PRODUCT_MINIMIZE_JAVA_DEBUG_INFO := true

    # Do not generate libartd.

    PRODUCT_ART_TARGET_INCLUDE_DEBUG_BUILD := false

    # Enable DM file preopting to reduce first boot time

    PRODUCT_DEX_PREOPT_GENERATE_DM_FILES :=true
    PRODUCT_DEX_PREOPT_DEFAULT_COMPILER_FILTER := verify

    # Reduces GC frequency of foreground apps by 50% (not recommanded for 512M devices)

    PRODUCT_SYSTEM_DEFAULT_PROPERTIES += dalvik.vm.foreground-heap-growth-multiplier=2.0

    # launcher

    PRODUCT_PACKAGES += Launcher3QuickStepGo

    # include gms package for go

    $(call inherit-product-if-exists, vendor/partner_gms/products/gms_go-mandatory.mk)

    # limit dex2oat threads to improve thermals
    PRODUCT_PROPERTY_OVERRIDES += \
        dalvik.vm.boot-dex2oat-threads=4 \
        dalvik.vm.dex2oat-threads=3 \
        dalvik.vm.image-dex2oat-threads=4

    PRODUCT_PROPERTY_OVERRIDES += \
        dalvik.vm.dex2oat-flags=--no-watch-dog \
        dalvik.vm.jit.codecachesize=0

    PRODUCT_PROPERTY_OVERRIDES += \
        pm.dexopt.boot=extract \
        dalvik.vm.heapstartsize=8m \
        dalvik.vm.heapsize=256m \
        dalvik.vm.heaptargetutilization=0.75 \
        dalvik.vm.heapminfree=512k \
        dalvik.vm.heapmaxfree=8m

   PRODUCT_SYSTEM_DEFAULT_PROPERTIES += \
        dalvik.vm.madvise-random=true

    # camera hal: Q Regular version must use camera hal v3
    USE_CAMERA_HAL_3_4 := true
}

```





























