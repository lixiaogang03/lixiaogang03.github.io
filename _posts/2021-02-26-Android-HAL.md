---
layout:     post
title:      Android HAL
subtitle:   硬件抽象层
date:       2021-02-26
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - android
---

[Android HAL](https://source.android.google.cn/devices/architecture/hal)

[Android HAL 层原理分析](https://flyflypeng.github.io/android/2017/03/26/Android-HAL%E5%B1%82%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90.html)

## 概念

HAL 可定义一个标准接口以供硬件供应商实现，这可让 Android 忽略较低版本的驱动程序实现。

HAL 运行在用户空间，将硬件的一些重要的操作都放在这一层中完成，这些操作都封装在厂商所提供的一个动态链接库中，从而达到了避免源码公开的目的，而底层 Linux 内核空间中的设备驱动模块，现在则只提供一些最基本的硬件设备寄存器操作的功能。

## 旧版HAL(Android 8.0 之前)

![android_hal_old](/images/hal/android_hal_old.png)

Android 系统的 HAL 层其实并不复杂，只要你能理解清楚下面这 3 个结构体的含义：

* hw_module_t：用来描述硬件模块
* hw_device_t：用来描述硬件设备
* hw_module_methods_t：用来打开硬件模块中包含硬件设备，获得指向硬件设备结构体的指针

Android 系统中 HAL 层是以模块的方式来管理各个硬件访问的接口，每一个硬件模块都对应一个动态链接库文件，而这些动态链接库文件需要符号一定的规范，而上述的这 3 种结构体就是用来建立这种规范。并且一个硬件模块可以管理多个硬件设备，例如 audio HAL 硬件模块中就管理了扬声器、麦克风等多个硬件设备。

## 标准接口

**/hardware/libhardware/include/hardware/hardware.h**

```txt

android/hardware/libhardware/include/hardware$ tree
.
├── activity_recognition.h
├── audio_alsaops.h
├── audio_effect.h
├── audio.h
├── audio_policy.h
├── bluetooth.h
├── boot_control.h
├── bt_av.h
├── bt_common_types.h
├── bt_gatt_client.h
├── bt_gatt.h
├── bt_gatt_server.h
├── bt_gatt_types.h
├── bt_hf_client.h
├── bt_hf.h
├── bt_hh.h
├── bt_hl.h
├── bt_mce.h
├── bt_pan.h
├── bt_rc.h
├── bt_sdp.h
├── bt_sock.h
├── camera2.h
├── camera3.h
├── camera_common.h
├── camera.h
├── consumerir.h
├── context_hub.h
├── display_defs.h
├── fb.h
├── fingerprint.h
├── fused_location.h
├── gatekeeper.h
├── gps.h
├── gps_internal.h
├── gralloc1.h
├── gralloc.h
├── hardware.h
├── hdmi_cec.h
├── hw_auth_token.h
├── hwcomposer2.h
├── hwcomposer_defs.h
├── hwcomposer.h
├── input.h
├── keymaster0.h
├── keymaster1.h
├── keymaster2.h
├── keymaster_common.h
├── keymaster_defs.h
├── lights.h
├── local_time_hal.h
├── memtrack.h
├── nfc.h
├── nfc_tag.h
├── nvram.h
├── power.h
├── qemud.h
├── qemu_pipe.h
├── radio.h
├── sensors.h
├── sound_trigger.h
├── thermal.h
├── tv_input.h
├── vehicle_camera.h
├── vehicle.h
├── vibrator.h
└── vr.h

```

## 接口实现

```txt

ndroid/hardware/libhardware/modules$ tree -L 1
.
├── Android.mk
├── audio
├── audio_remote_submix
├── camera
├── consumerir
├── fingerprint
├── gralloc
├── hwcomposer
├── input
├── local_time
├── nfc
├── nfc-nci
├── power
├── radio
├── README.android
├── sensors
├── soundtrigger
├── thermal
├── tv_input
├── usbaudio
├── usbcamera
├── vehicle
├── vibrator
└── vr

```

## 编译

```txt

android/out/target/product/msm8937_64/system/lib64/hw$ tree
.
├── audio.a2dp.default.so
├── audio_policy.default.so
├── audio_policy.stub.so
├── audio.primary.default.so
├── audio.primary.msm8937.so
├── audio.r_submix.default.so
├── audio.stub.default.so
├── audio.usb.default.so
├── camera.default.so
├── copybit.msm8937.so
├── gps.default.so
├── gralloc.default.so
├── gralloc.msm8937.so
├── hwcomposer.msm8937.so
├── keystore.default.so
├── lights.msm8937.so
├── local_time.default.so
├── memtrack.msm8937.so
├── power.default.so
├── power.qcom.so
├── sensors.msm8937.so
└── vibrator.default.so

```




