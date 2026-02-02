---
layout:     post
title:      Android Kernel Config
subtitle:   Android 内核配置
date:       2021-11-23
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Android
    - Linux
    - 驱动
---

## 内核配置

**A33**

./vendor/softwinner/linux-3.4/arch/arm/configs/sun8iw5p1smp_android_defconfig

**RK3288**

./kernel/arch/arm/configs/rockchip_defconfig

## 图形界面配置

make menuconfig

![make_menuconfig](/images/linux/make_menuconfig.png)

## 内核编译

[编译内核](https://source.android.google.cn/setup/building-kernels?hl=zh-cn)

kernel/.config

make distclean

make uImage

## Linux 3.4 USB Camera Config

CONFIG_V4L_USB_DRIVERS=y
CONFIG_USB_VIDEO_CLASS=m
CONFIG_USB_VIDEO_CLASS_INPUT_EVDEV=y

## 查看设备加载的驱动

**adb shell lsmod**

```txt

# lsmod                                                      
sunxi_schw 12559 0 - Live 0x00000000 (O)
cdc_ether 5099 0 - Live 0x00000000
rtl8152 37073 0 - Live 0x00000000
mcs7830 6292 0 - Live 0x00000000
qf9700 7805 0 - Live 0x00000000
asix 17150 0 - Live 0x00000000
usbnet 17692 4 cdc_ether,mcs7830,qf9700,asix, Live 0x00000000
sunxi_keyboard 3021 0 - Live 0x00000000
gt9xx_ts 28934 0 - Live 0x00000000
uvcvideo 61298 0 - Live 0x00000000
videobuf2_vmalloc 2600 1 uvcvideo, Live 0x00000000
videobuf2_memops 2366 1 videobuf2_vmalloc, Live 0x00000000
videobuf2_core 18902 1 uvcvideo, Live 0x00000000
gc0328 11137 0 - Live 0x00000000
vfe_v4l2 445432 0 - Live 0x00000000
vfe_subdev 4523 2 gc0328,vfe_v4l2, Live 0x00000000
vfe_os 3951 2 vfe_v4l2,vfe_subdev, Live 0x00000000
cci 21738 1 gc0328, Live 0x00000000
videobuf_dma_contig 5567 1 vfe_v4l2, Live 0x00000000
videobuf_core 16520 2 vfe_v4l2,videobuf_dma_contig, Live 0x00000000
leds_sunxi 1359 0 - Live 0x00000000
mali 213482 20 - Live 0x00000000 (O)
lcd 69452 0 - Live 0x00000000
disp 992848 8 mali,lcd, Live 0x00000000
nand 280202 0 - Live 0x00000000 (O)

```

## 加载内核模块

**init.*.rc**

insmod /system/vendor/modules/uvcvideo.ko






