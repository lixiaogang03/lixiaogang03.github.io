---
layout:     post
title:      Linux Virtual Camera
subtitle:   虚拟相机
date:       2025-05-07
author:     LXG
header-img: img/post-bg-camera.jpg
catalog: true
tags:
    - camera
---

[T113-S3荣品电子](https://doc.rpdzkj.cn/#/zh_cn/%E5%85%A8%E5%BF%97%E7%B3%BB%E5%88%97/t113-s3/4.Linux%E5%BC%80%E5%8F%91)

## 概念

Linux 的虚拟相机机制（Virtual Camera）是一种通过软件模拟出一个摄像头设备的方式，常用于以下场景：

* 视频源模拟（测试用途）：没有真实摄像头也能调试视频相关应用；
* 视频流重定向：把本地视频文件、网络流等伪装成摄像头供应用读取；
* 特效或 AI 处理：在采集后先用程序处理，再虚拟成摄像头给其他软件使用。

## 下载 v4l2loopback 源码

https://github.com/v4l2loopback/v4l2loopback

```txt

v4l2loopback$ tree
.
├── AUTHORS
├── ChangeLog
├── COPYING
├── currentversion.sh
├── dkms.conf
├── doc
│   ├── docs.txt
│   ├── kernel_debugging.txt
│   ├── makeformats.sh
│   ├── missingformats.h # 内核级调试说明，建议在调试初始化失败时查看
│   └── v4l2_formats.txt  # 支持的视频格式说明
├── examples   # 示例代码目录，包含如何使用虚拟设备进行图像写入
│   ├── Makefile
│   ├── ondemandcam.c
│   ├── README
│   ├── restarting-writer.sh
│   ├── test.c
│   ├── yuv420_infiniteloop.c
│   └── yuv4mpeg_to_v4l2.c
├── Kbuild
├── Makefile
├── Makefile.manual
├── man
├── NEWS
├── README.md
├── release.sh
├── SECURITY.md
├── tests     # 自动测试脚本和测试程序，用于验证模块功能
│   ├── checkformat.sh
│   ├── common.h
│   ├── consumer.c
│   ├── interlaced_w
│   ├── Makefile
│   ├── producer.c
│   └── test_dqbuf.c
├── TODO
├── udev    # 包含 udev 规则（用于自动命名 /dev/video*）
│   └── 60-persistent-v4l2loopback.rules
├── utils   # 用于动态修改 loopback 设备参数（如分辨率、支持格式等）的工具程序源码。
│   ├── Makefile
│   └── v4l2loopback-ctl.c
├── v4l2loopback.c            # ✅ 核心驱动源码（主 .ko 编译对象）
├── v4l2loopback_formats.h    # 视频格式定义
├── v4l2loopback.h            # ✅ 用于编译内核模块的主 Makefile
└── vagrant
    ├── README.md
    ├── Vagrantfile
    └── vbox-restart

```

## 移植到T113-S3 linux kernel-5.4

```bash

t113_linux/kernel/linux-5.4/drivers/media/v4l2loopback$ tree
.
├── Kconfig
├── Makefile
├── v4l2loopback.c
├── v4l2loopback_formats.h
└── v4l2loopback.h

```

**Kconfig**

```c

config VIDEO_V4L2LOOPBACK
    tristate "Virtual video loopback device"
    depends on VIDEO_DEV && MEDIA_CONTROLLER
    help
      This is a virtual video driver that allows user-space programs
      to feed video data to video4linux devices.

      Say Y here to include support for v4l2loopback.

```

**Makefile**

```makefile

obj-y += v4l2loopback.o

```

### 编译

t113_linux/kernel/linux-5.4/drivers/media/Kconfig

```c

source "drivers/media/v4l2loopback/Kconfig"

```

t113_linux/kernel/linux-5.4/drivers/media/Makefile

```makefile

obj-y += v4l2loopback/

```

### /dev/video0

内核添加v4l2loopback驱动后，自动生成了/dev/video0节点

v4l2-ctl --all -d /dev/video0

```bash

sh-4.4# v4l2-ctl --all -d /dev/video0 
Driver Info:
	Driver name      : v4l2 loopback
	Card type        : Dummy video device (0x0000)
	Bus info         : platform:v4l2loopback-000
	Driver version   : 5.4.61
	Capabilities     : 0x85200003
		Video Capture
		Video Output
		Read/Write
		Streaming
		Extended Pix Format
		Device Capabilities
	Device Caps      : 0x05200003
		Video Capture
		Video Output
		Read/Write
		Streaming
		Extended Pix Format
Priority: 2
Video input : 0 (loopback: no signal)
Video output: 0 (loopback in)
Format Video Capture:
	Width/Height      : 640/480
	Pixel Format      : 'BGR4' (32-bit BGRA/X 8-8-8-8)
	Field             : None
	Bytes per Line    : 2560
	Size Image        : 1228800
	Colorspace        : sRGB
	Transfer Function : Default (maps to sRGB)
	YCbCr/HSV Encoding: Default (maps to ITU-R 601)
	Quantization      : Default (maps to Full Range)
	Flags             : 
Format Video Output:
	Width/Height      : 640/480
	Pixel Format      : 'BGR4' (32-bit BGRA/X 8-8-8-8)
	Field             : None
	Bytes per Line    : 2560
	Size Image        : 1228800
	Colorspace        : sRGB
	Transfer Function : Default (maps to sRGB)
	YCbCr/HSV Encoding: Default (maps to ITU-R 601)
	Quantization      : Default (maps to Full Range)
	Flags             : 
Streaming Parameters Video Capture:
	Capabilities     : timeperframe
	Frames per second: 30.000 (30/1)
	Read buffers     : 2
Streaming Parameters Video Output:
	Capabilities     : timeperframe
	Frames per second: 30.000 (30/1)
	Write buffers    : 2

User Controls

                    keep_format 0x0098f900 (bool)   : default=0 value=0
              sustain_framerate 0x0098f901 (bool)   : default=0 value=0
                        timeout 0x0098f902 (int)    : min=0 max=100000 step=1 default=0 value=0
               timeout_image_io 0x0098f903 (button) : flags=write-only, execute-on-write


```

## buildroot 添加 v4l2loopback-ctl

t113_linux/buildroot/buildroot-201902/configs/sun8iw20p1_t113_defconfig

```c

BR2_PACKAGE_V4L2LOOPBACK_CTL=y

```

**添加的源码**

```txt

t113_linux/buildroot/buildroot-201902/package/v4l2loopback-ctl$ tree
.
├── Config.in
├── v4l2loopback-ctl.c
├── v4l2loopback-ctl.mk
├── v4l2loopback_formats.h
└── v4l2loopback.h

```

**编译脚本**

```makefile

################################################################################
#
# v4l2loopback-ctl (local version)
#
################################################################################

V4L2LOOPBACK_CTL_VERSION = v0.14.0
V4L2LOOPBACK_CTL_SITE = $(TOPDIR)/package/v4l2loopback-ctl
V4L2LOOPBACK_CTL_SITE_METHOD = local

define V4L2LOOPBACK_CTL_BUILD_CMDS
	$(TARGET_CC) $(TARGET_CFLAGS) \
		-I$(TOPDIR)/package/v4l2loopback-ctl \
		-o $(@D)/v4l2loopback-ctl $(TOPDIR)/package/v4l2loopback-ctl/v4l2loopback-ctl.c
endef

define V4L2LOOPBACK_CTL_INSTALL_TARGET_CMDS
	$(INSTALL) -D -m 0755 $(@D)/v4l2loopback-ctl $(TARGET_DIR)/usr/bin/v4l2loopback-ctl
endef

$(eval $(generic-package))

```

### v4l2loopback-ctl 使用

```bash



```











