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

![camera_senser](/images/hardware/camera/camera_senser.png)

## 像素

![pixel](/images/hardware/camera/pixel.png)

## 生成图像

![picture_gen](/images/hardware/camera/picture_gen.png)

![image_generation](/images/hardware/camera/image_generation.png)

## 像素大小

![pixel_size](/images/hardware/camera/pixel_size.png)

## 相机分辨率

![camera_resolution](/images/hardware/camera/camera_resolution.png)

![camera_resolution_2](/images/hardware/camera/camera_resolution_2.png)

## Android Camera 架构

![ape_fwk_camera](/images/hardware/camera/ape_fwk_camera.png)

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

![camera_preview](/images/hardware/camera/camera_preview.webp)

![camera_preview_2](/images/hardware/camera/camera_preview_2.webp)

## V4L2 框架

![v4l2](/images/hardware/camera/v4l2.png)

## USB Camera

[UVCCamera-Github](https://github.com/saki4510t/UVCCamera)

[外接 USB 摄像头](https://source.android.google.cn/devices/camera/external-usb-cameras?hl=zh-cn)

Android 平台支持使用即插即用的 USB 摄像头（即网络摄像头），但前提是这些摄像头采用标准的 Android Camera2 API 和摄像头 HIDL 接口。网络摄像头通常支持 USB 视频类 (UVC) 驱动程序，并且在 Linux 上，系统采用标准的 Video4Linux (V4L) 驱动程序控制 UVC 摄像头。

## CSI Camera

MIPI 是 Mobile Industry Processor Interface（移动行业处理器接口）的缩写。MIPI 联盟是一个开放的会员制组织。2003年7月，由美国德州仪器（TI）、意法半导体（ST）、英国 ARM 和芬兰诺基亚（Nokia）4 家公司共同成立。

MIPI CSI（Camera Serial Interface）是由MIPI联盟下 Camera 工作组指定的接口标准。CSI-2 是 MIPI CSI 第二版，主要由应用层、协议层、物理层组成，最大支持4通道数据传输、单线传输速度高达1Gb/s。

## Camera 参数

![camera_param](/images/hardware/camera/camera_param.png)









