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

### Qt

``` txt

t113_linux/platform/framework/qt/qt-everywhere-src-5.12.5$ tree -L 1
.
├── bin
├── buildsetup_sf.sh
├── buildsetup.sh
├── buildsetup_t113.sh
├── _clang-format
├── coin
├── configure
├── configure.bat
├── configure.json
├── fonts
├── gnuwin32
├── LICENSE.FDL
├── LICENSE.GPLv2
├── LICENSE.GPLv3
├── LICENSE.LGPLv21
├── LICENSE.LGPLv3
├── LICENSE.QT-LICENSE-AGREEMENT-4.0
├── qt3d
├── qtactiveqt
├── qtandroidextras
├── qtbase
├── qtcanvas3d
├── qtcharts
├── qtconnectivity
├── qtdatavis3d
├── qtdeclarative
├── qtdoc
├── qtenv_sf.sh
├── qtenv.sh
├── qtgamepad
├── qtgraphicaleffects
├── qtimageformats
├── qtlocation
├── qtmacextras
├── qtmultimedia
├── qtnetworkauth
├── qt.pro
├── qtpurchasing
├── qtquickcontrols
├── qtquickcontrols2
├── qtremoteobjects
├── qtscript
├── qtscxml
├── qtsensors
├── qtserialbus
├── qtserialport
├── qtspeech
├── qtsvg
├── qttools
├── qttranslations
├── qtvirtualkeyboard
├── qtwayland
├── qtwebchannel
├── qtwebengine
├── qtwebglplugin
├── qtwebsockets
├── qtwebview
├── qtwinextras
├── qtx11extras
├── qtxmlpatterns
└── README

```

### buildsetup_t113.sh

```pro

#!/bin/sh
#  LICHEE_TOP_DIR   =/home/yuanguochao/other/t5_bak/longan
#  LICHEE_BR_OUT    =/home/yuanguochao/other/t5_bak/longan/out/t507/demo2.0/longan/buildroot
#  GPU include      =$LICHEE_TOP_DIR/platform/core/graphics/gpu_um_pub/mali-bifrost/include
#  GPU lib			=$LICHEE_TOP_DIR/platform/core/graphics/gpu_um_pub/mali-bifrost/fbdev/mali-g31/aarch64-linux-gnu/lib/
#  SYSROOT  		=$LICHEE_BR_OUT/out/t507/demo2.0/longan/buildroot/host/usr/aarch64-buildroot-linux-gnu/sysroot/



PWD=`pwd`
export QT_SRC_DIR=$PWD
source $PWD/bin/export_gcc484.sh

#export QT_GPU_LIB=$LICHEE_TOP_DIR/platform/core/graphics/gpu_um_pub/mali-bifrost/fbdev/mali-g31/aarch64-linux-gnu/lib
#export QT_GPU_INC=$LICHEE_TOP_DIR/platform/core/graphics/gpu_um_pub/mali-bifrost/include

#export SYSROOT=$LICHEE_TOP_DIR/out/t507/demo2.0/longan/buildroot/host/usr/aarch64-buildroot-linux-gnu/sysroot
export SYSROOT=$LICHEE_TOP_DIR/out/${LICHEE_IC}/evb1_auto/longan/buildroot/host/arm-buildroot-linux-gnueabi/sysroot
export PATH=$LICHEE_BR_OUT/host/bin/:$PATH
#export CROSS_COMPILE=$LICHEE_TOP_DIR/out/gcc-linaro-7.4.1-2019.02-x86_64_aarch64-linux-gnu
#./${LICHEE_IC}/${LICHEE_BOARD}/ICHEE_LINUX_DEV/buildroot/host/opt/ext-toolchain/bin/arm-linux-gnueabi-gcc
export CROSS_COMPILE_DIR=$LICHEE_TOP_DIR/out/${LICHEE_IC}/${LICHEE_BOARD}/${ICHEE_LINUX_DEV}/buildroot/host/opt/ext-toolchain/bin/
export CROSS_COMPILE=$CROSS_COMPILE_DIR/arm-linux-gnueabi-

export CPLUS_INCLUDE_PATH=$PWD/qtbase/src/3rdparty/angle/include:$CPLUS_INCLUDE_PATH

QT_ENV_CFG=qtenv.sh
QT_ENV_TARGET_DIR=$LICHEE_PLATFORM_DIR/framework/auto/rootfs/etc

sed -i '/^export  QTDIR*/d' $QT_ENV_CFG
sed -i '1 a \export  QTDIR='$QT_RUN_DIR'' $QT_ENV_CFG

HOST=arm-linux-gnueabi

OUT_GCC=`find ${LICHEE_BR_OUT} -perm /a+x -a -regex '.*-gcc'`
OUT_CPP=`find ${LICHEE_BR_OUT} -perm /a+x -a -regex '.*-g\+\+'`

export CC=$OUT_GCC
export CXX=$OUT_GCC

cpu_cores=`cat /proc/cpuinfo | grep "processor" | wc -l`
if [ ${cpu_cores} -le 8 ] ; then
	LICHEE_JLEVEL=${cpu_cores}
else
	LICHEE_JLEVEL=${cpu_cores}
fi

#env

function cdqtroot
{
cd $QT_SRC_DIR
}
#-no-c++11
function qtmakeconfig
{
	#cp $QT_GPU_LIB/* $SYSROOT/lib/ -rf
	mkdir -p $QT_INSTALL_DIR

	$QT_SRC_DIR/configure \
		-opensource \
		-confirm-license \
		-extprefix $QT_INSTALL_DIR \
		-sysroot $SYSROOT \
		-xplatform arm-linux-gnueabi-g++ \
		-device-option CROSS_COMPILE=$CROSS_COMPILE \
		-R /usr/lib \
		-no-strip \
		-c++std c++11 \
		-shared \
		-nomake examples \
		-accessibility \
		-no-sql-db2 -no-sql-ibase -no-sql-mysql -no-sql-oci \
		-no-sql-odbc -no-sql-psql -no-sql-sqlite2  -no-sql-tds \
 		-no-sql-sqlite -plugin-sql-sqlite \
		-no-qml-debug \
		-no-sse2 \
		-no-sse3 \
		-no-ssse3 \
		-no-sse4.1 \
		-no-sse4.2 \
		-no-avx \
		-no-avx2 \
		-no-mips_dsp \
		-no-mips_dspr2 \
		-qt-zlib \
		-no-journald \
		-qt-libpng \
		-qt-libjpeg \
		-qt-freetype \
		-qt-harfbuzz \
		-no-openssl \
		-no-xcb-xlib \
		-no-glib \
		-no-pulseaudio \
		-alsa \
		-gui \
		-widgets \
		-v \
		-optimized-qmake \
		-no-cups \
		-no-iconv \
		-evdev \
		-no-icu \
		-no-fontconfig \
		-no-strip \
		-pch \
		-dbus \
		-no-use-gold-linker \
		-no-directfb \
		-eglfs \
		-qpa eglfs \
		-linuxfb \
		-no-kms \
		-opengl es2 \
		-no-system-proxies \
		-no-slog2 \
		-no-pps \
		-no-imf \
		-no-lgmon \
		-no-tslib 
}

function qtmakeall
{
	make  -j${LICHEE_JLEVEL} -C $QT_SRC_DIR
}

function qtmakeinstall
{
	make  -j${LICHEE_JLEVEL} -C $QT_SRC_DIR install
	mkdir -p $QT_TARGET_DIR

	#cp libs to target
	cp -rf \
	$QT_INSTALL_DIR/lib $QT_INSTALL_DIR/plugins $QT_INSTALL_DIR/qml \
	 $QT_TARGET_DIR
	#cp fonts to target
	cp -rf fonts $QT_TARGET_DIR 
	#Remove redundant files
	rm -rf $QT_TARGET_DIR/lib/cmake
	rm -rf $QT_TARGET_DIR/lib/pkgconfig
	rm -rf $QT_TARGET_DIR/lib/*.a
	rm -rf $QT_TARGET_DIR/lib/*.prl
	rm -rf $QT_TARGET_DIR/lib/*.la
	
	#cp $QT_GPU_LIB/* $LICHEE_BR_OUT/target/usr/lib/ -rf
	
	cp $QT_ENV_CFG $QT_ENV_TARGET_DIR
}

function qtmakecleanall
{
	cd $QT_SRC_DIR
	make distclean -j${LICHEE_JLEVEL}
	make -C $QT_SRC_DIR clean -j${LICHEE_JLEVEL}
	rm -rf $QT_INSTALL_DIR
	rm -rf $QT_TARGET_DIR
	
}

echo "  "
echo "********************** useage ***************************"
echo "        please use:"
echo "        qtmakeconfig:         config qt env."
echo "        qtmakeall:            build qt"
echo "        qtmakeinstall:        install qt-lib and cp to target dir."
echo "        qtmakecleanall:       clean qt and rm all target."
echo "        QT_INSTALL_DIR:       " $QT_INSTALL_DIR
echo "        QT_TARGET_DIR:       " $QT_TARGET_DIR
echo "        qtmakecleanall:       clean qt and rm all target."
echo "  "

```

### Qt Quick

一种高级用户界面技术，可以轻松创建供移动和嵌入式设备使用的动态触摸式界面和轻量级应用程序。
Qt Quick主要由一个改进的Qt Creator IDE（其中包含了Qt Quick设计器）、新增的简单易学的QML语言和新加入Qt库中名为QtDeclarative的模块等三部分组成。这些使得QML更方便不熟悉C++的开发人员和设计人员使用。

QML（Qt Meta-Object Language，Qt元对象语言）是一种用于描述应用程序用户界面的声明式编程语言。它使用一些可视组件，通过这些组件之间的交互来描述用户界面.

Qt Quick 通常使用基于JS的 QML 来编写代码，但是仍然需要一些基于C++ 或者Python 的代码来帮助通讯，例如连接到后端。（有JS开发经验的小伙伴上手会比较快）

### Qt QWidgets

Qt QWidget 仅可用于基于主流语言的API，比如C++和Python，并不依赖于其他环境


























