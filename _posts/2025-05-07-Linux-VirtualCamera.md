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

### v4l2loopback-ctl 和  v4l2-ctl

* v4l2-ctl：用于与实际的硬件摄像头（或者视频捕捉设备）进行交互，操作摄像头的参数。
* v4l2loopback-ctl：用于与虚拟摄像头设备交互，通常与 v4l2loopback 驱动一起使用，用于创建和管理虚拟视频设备。

```bash

sh-4.4# v4l2loopback-ctl list
OUTPUT       	CAPTURE      	NAME
/dev/video0  	/dev/video0  	Dummy video device (0x0000)

```

**v4l2loopback-ctl常用命令**

| 命令                      | 参数说明                                                     | 功能描述                                       |
|---------------------------|--------------------------------------------------------------|------------------------------------------------|
| `add`                     | `[OPTIONS] [<outputdevice> [<capturedevice>]]`               | 添加新的 v4l2loopback 虚拟设备                 |
| `delete`                  | `<device>`                                                   | 删除指定的虚拟设备                             |
| `list`                    | `[OPTIONS]`                                                  | 列出当前所有 v4l2loopback 虚拟设备             |
| `query`                   | `<device>`                                                   | 查询设备的当前配置与能力                       |
| `set-fps`                 | `<device> <fps>`                                             | 设置指定设备的帧率                             |
| `get-fps`                 | `<device>`                                                   | 获取指定设备的帧率                             |
| `set-caps`                | `<device> <caps>`                                            | 设置视频格式能力（如分辨率、帧率）            |
| `get-caps`                | `<device>`                                                   | 获取当前设置的视频格式能力                    |
| `set-timeout-image`       | `[OPTIONS] <device> <image>`                                 | 设置在无输入帧时显示的占位图像                 |


## 测试demo

[v4l2_camera_demo](https://github.com/ConvergenceSoftware/v4l2_camera_demo)

**对开源项目做如下修改**

添加lib/libjpeg.so 和 jpeglib.h 文件, 从T113-S3源码out目录中提取

```diff

diff --git a/camera_demo.pro b/camera_demo.pro
index 14fdae1..7cad2a6 100644
--- a/camera_demo.pro
+++ b/camera_demo.pro
@@ -16,7 +16,7 @@ DEFINES += QT_DEPRECATED_WARNINGS
 # You can also select to disable deprecated APIs only up to a certain version of Qt.
 #DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0
 
-unix:LIBS += /usr/lib/x86_64-linux-gnu/libjpeg.so
+unix:LIBS += $$PWD/lib/libjpeg.so
 
 SOURCES += \
     main.cpp \

diff --git a/widget.cpp b/widget.cpp
index bb0ce64..ed69b5a 100644
--- a/widget.cpp
+++ b/widget.cpp
@@ -39,7 +39,7 @@ void Widget::InitWidget()
             ui->cb_camera_name->addItem(QString::fromLatin1(GetCameraName(i)));
 
         //启动默认视频
-        StartRun(2);
+        StartRun(0);
         imageprocessthread->init(ui->cb_camera_name->currentIndex());
         imageprocessthread->start();

diff --git a/v4l2.c b/v4l2.c
index 014c5b0..6d9ef68 100644
--- a/v4l2.c
+++ b/v4l2.c
@@ -2,6 +2,7 @@
 #include <jpeglib.h>
 #include "sys/time.h"
 #include "libv4l2.h"
+#include <stdbool.h>
 
 #ifdef __cplusplus
 extern "C" {
@@ -22,7 +23,7 @@ int fd = -1;
 int videoIsRun = -1;
 int deviceIsOpen = -1;
 unsigned char *rgb24 = NULL;
-int WIDTH = 1280, HEIGHT = 720;
+int WIDTH = 640, HEIGHT = 480;
 
 //V4l2相关结构体
 static struct v4l2_capability cap;
@@ -101,7 +102,7 @@ int MJPEG2RGB(unsigned char* data_frame, unsigned char *rgb, int bytesused)
     cinfo.err = jpeg_std_error(&jerr);
     jpeg_create_decompress(&cinfo);
     jpeg_mem_src(&cinfo, data, data_size);
-     int rc = jpeg_read_header(&cinfo, TRUE);
+     int rc = jpeg_read_header(&cinfo, true);
      if(!(1==rc))
      {
          //printf("Not a jpg frame.\n");
@@ -169,7 +170,7 @@ void StartVideoPrePare()
     format.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
     format.fmt.pix.width = WIDTH;
     format.fmt.pix.height = HEIGHT;
-    format.fmt.pix.pixelformat = V4L2_PIX_FMT_MJPEG;
+    format.fmt.pix.pixelformat = V4L2_PIX_FMT_MJPEG; //V4L2_PIX_FMT_YUYV
     ioctl(fd, VIDIOC_S_FMT, &format);
 
     //申请帧缓存区
@@ -434,7 +435,7 @@ int V4L2SetResolution(int new_width, int new_height)
     WIDTH = new_width;
     HEIGHT = new_height;
 
-    StartRun(2);
+    StartRun(0);
 
     return 0;
 }


```

## 图片测试命令

```bash

ffmpeg -re -loop 1 -i image.jpg -vcodec mjpeg -f v4l2 /dev/video0

```

| 参数               | 说明                                                                 |
|--------------------|----------------------------------------------------------------------|
| `ffmpeg`           | 启动 FFmpeg 工具。                                                    |
| `-re`              | 按“实时”速度读取输入，模拟真实摄像头的帧率（而不是尽快读完）。         |
| `-loop 1`          | 循环输入，`1` 表示无限次循环播放输入图片。                            |
| `-i image.jpg`     | 指定输入文件为 `image.jpg`。                                          |
| `-vcodec mjpeg`    | 设置视频编码格式为 MJPEG（Motion JPEG），每帧都是独立 JPEG 图像。       |
| `-f v4l2`          | 设置输出格式为 V4L2（Linux 视频设备接口标准）。                        |
| `/dev/video0`      | 指定输出为虚拟摄像头设备 `/dev/video0`（由 v4l2loopback 驱动创建）。    |


## 视频测试命令

```bash

ffmpeg -re -stream_loop -1 -i meihua_640x480.mp4 -vcodec mjpeg -f v4l2 /dev/video0

```

| **参数**               | **解释**                                                                 |
|------------------------|--------------------------------------------------------------------------|
| `ffmpeg`                | `ffmpeg` 是一个强大的命令行工具，用于处理音频和视频数据。                  |
| `-re`                   | 以实时速度读取输入文件。这是为了模拟实时播放视频，确保推送到虚拟摄像头时不会过快地发送帧。 |
| `-stream_loop -1`       | `-stream_loop` 参数指定循环播放视频。`-1` 表示无限循环，即视频将持续不断地播放，直到手动停止。 |
| `-i meihua_640x480.mp4` | 指定输入文件，这里是名为 `meihua_640x480.mp4` 的视频文件。该文件将被推送到虚拟摄像头。 |
| `-vcodec mjpeg`         | 设置视频编码格式为 **MJPEG**（Motion JPEG），这是虚拟摄像头通常支持的格式。 |
| `-f v4l2`               | 指定输出格式为 **v4l2**，表示将视频流推送到 V4L2（Video for Linux 2）设备，即虚拟摄像头。 |
| `/dev/video0`           | 输出设备的路径，指向虚拟相机设备 `/dev/video0`。这是虚拟摄像头的设备文件，应用程序可以通过它获取视频流。 |


、





