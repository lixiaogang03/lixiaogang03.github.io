---
layout:     post
title:      Android Camera
subtitle:   安卓相机入门
date:       2021-10-27
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - camera
---

[相机基础](https://www.princetoninstruments.com/learn/camera-fundamentals/fundamentals-behind-modern-scientific-cameras)

[相机分辨率](https://www.princetoninstruments.com/learn/camera-fundamentals/pixel-size-and-camera-resolution)

[Camera-AOSP](https://source.android.google.cn/devices/camera)

## 传感器

![camera_senser](/images/camera/camera_senser.png)

## 像素

![pixel](/images/camera/pixel.png)

## 生成图像

![picture_gen](/images/camera/picture_gen.png)

![image_generation](/images/camera/image_generation.png)

## 像素大小

![pixel_size](/images/camera/pixel_size.png)

## 相机分辨率

![camera_resolution](/images/camera/camera_resolution.png)

![camera_resolution_2](/images/camera/camera_resolution_2.png)

## Android Camera 架构

![ape_fwk_camera](/images/camera/ape_fwk_camera.png)

### 应用框架

应用代码位于应用框架级别，它使用 android.hardware.Camera API 与相机硬件进行互动。在内部，此代码会调用相应的 JNI 粘合类，以访问与相机互动的原生代码。

### JNI

与 android.hardware.Camera 相关联的 JNI 代码位于 frameworks/base/core/jni/android_hardware_Camera.cpp 中。此代码会调用较低级别的原生代码以获取对实体相机的访问权限，并返回用于在框架级别创建 android.hardware.Camera 对象的数据。

### 原生框架

在 frameworks/av/camera/Camera.cpp 中定义的原生框架可提供相当于 android.hardware.Camera 类的原生类。此类会调用 IPC binder 代理，以获取对相机服务的访问权限。

### binder IPC 代理

IPC binder 代理用于促进跨越进程边界的通信。调用相机服务的 3 个相机 binder 类位于 frameworks/av/camera 目录中。ICameraService 是相机服务的接口，ICamera 是已打开的特定相机设备的接口，ICameraClient 是返回到应用框架的设备接口。

### 相机服务

位于 frameworks/av/services/camera/libcameraservice/CameraService.cpp 下的相机服务是与 HAL 进行互动的实际代码。

### HAL

硬件抽象层定义了由相机服务调用、且您必须实现以确保相机硬件正常运行的标准接口。

### 内核驱动程序

相机的驱动程序可与实际相机硬件以及您的 HAL 实现进行互动。相机和驱动程序必须支持 YV12 和 NV21 图像格式，以便在显示和视频录制时支持预览相机图像。

## Camera Preview

[Camera Android架构-简书](https://www.jianshu.com/p/760dec1a9078)

![camera_preview](/images/camera/camera_preview.webp)

![camera_preview_2](/images/camera/camera_preview_2.webp)






