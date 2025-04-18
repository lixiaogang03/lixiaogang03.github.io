---
layout:     post
title:      Ubuntu QtCreator配置交叉编译环境
subtitle:   QT
date:       2023-10-27
author:     LXG
header-img: img/post-bg-miui6.jpg
catalog: true
tags:
    - qt
---

## QtCreator

Qt Creator是跨平台的 Qt IDE， Qt Creator 是 Qt 被 Nokia 收购后推出的一款新的轻量级集成开发环境（IDE）。此 IDE 能够跨平台运行，支持的系统包括 Linux（32 位及 64 位）、Mac OS X 以及 Windows。
使用Qt Creator进行嵌入式程序开发是一个很好的选择

## T113 交叉编译工具链

Linaro，一家非营利性质的开放源代码软件工程公司，主要的目标在于开发不同半导体公司系统单芯片（SoC）平台的共通软件，以促进消费者及厂商的福祉

![cross_compilation_toolchain](/images/qt/cross_compilation_toolchain.png)

buildsetup_t113.sh

```sh

# out/t113/evb1_auto/longan/buildroot/host/opt/ext-toolchain/bin

export CROSS_COMPILE_DIR=$LICHEE_TOP_DIR/out/${LICHEE_IC}/${LICHEE_BOARD}/${ICHEE_LINUX_DEV}/buildroot/host/opt/ext-toolchain/bin/
export CROSS_COMPILE=$CROSS_COMPILE_DIR/arm-linux-gnueabi-

```

out/t113/evb1_auto/longan/buildroot/host/opt/ext-toolchain/bin

./buildroot/buildroot-201902/dl/toolchain-external-linaro-armsf/gcc-linaro-7.3.1-2018.05-x86_64_arm-linux-gnueabi.tar.xz

```txt

t113_linux$ ls -al out/t113/evb1_auto/longan/buildroot/host/opt/ext-toolchain/
总用量 44
drwxr-xr-x 8 lxg lxg  4096 10月  8 15:33 .
drwxr-xr-x 3 lxg lxg  4096 10月  8 15:33 ..
drwxr-xr-x 6 lxg lxg  4096  6月 13  2018 arm-linux-gnueabi
drwxr-xr-x 2 lxg lxg  4096  6月 13  2018 bin
-rw-r--r-- 1 lxg lxg 11256  6月 13  2018 gcc-linaro-7.3.1-2018.05-linux-manifest.txt
drwxr-xr-x 3 lxg lxg  4096  6月 13  2018 include
drwxr-xr-x 3 lxg lxg  4096  6月 13  2018 lib
drwxr-xr-x 3 lxg lxg  4096  6月 13  2018 libexec
drwxr-xr-x 8 lxg lxg  4096  6月 13  2018 share

```

**下载地址**

[gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi](https://releases.linaro.org/components/toolchain/binaries/7.2-2017.11/arm-linux-gnueabi/)

**命名规则**

交叉编译工具链的命名规则为：arch [-vendor] [-os] [-(gnu)eabi]

* arch - 体系架构，如ARM，MIPS
* vendor - 工具链提供商
* os - 目标操作系统
* eabi - 嵌入式应用二进制接口(Embedded Application Binary Interface)


**./brandy/brandy-2.0/tools/toolchain/**

```txt

t113_linux$ ls -al ./brandy/brandy-2.0/tools/toolchain/

drwxrwxr-x  8 lxg lxg      4096 10月  8 16:54 gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi
-rw-rw-r--  1 lxg lxg 108280640 10月  8 14:54 gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi.tar.xz

t113_linux/brandy/brandy-2.0/tools/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi$ tree -L 1
.
├── arm-linux-gnueabi
├── bin
├── gcc-linaro-7.2.1-2017.11-linux-manifest.txt
├── include
├── lib
├── libexec
└── share

```

**build/toolchain**

./build/toolchain/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabi.tar.xz

./device/config/chips/t113/configs/evb1_auto/longan/BoardConfig.mk

```mk

LICHEE_COMPILER_TAR=gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabi.tar.xz

```

## Ubuntu 配置

1. mkdir /usr/local/arm-toolchain
2. cd t113_linux/buildroot/buildroot-201902/dl/toolchain-external-linaro-armsf
3. sudo cp gcc-linaro-7.3.1-2018.05-x86_64_arm-linux-gnueabi.tar.xz /usr/local/arm-toolchain/
4. cd /usr/local/arm-toolchain
5. sudo xz -d gcc-linaro-7.3.1-2018.05-x86_64_arm-linux-gnueabi.tar.xz
6. sudo tar xvf gcc-linaro-7.3.1-2018.05-x86_64_arm-linux-gnueabi.tar
7. vim ~/.bashrc
8. 添加 export PATH="/usr/local/arm-toolchain/gcc-linaro-7.3.1-2018.05-x86_64_arm-linux-gnueabi/bin/:$PATH"
9. arm-linux-gnueabi-gcc -v 查看环境变量配置成功

## QtCreator 配置

**QtCreator添加arm-gcc交叉编译工具链**

![qt_gcc_config](/images/qt/qt_gcc_config.png)

**配置Qt version**

![qt_version_config](/images/qt/qt_version_config.png)

**添加kits**

![qt_kits_config](/images/qt/qt_kits_config.png)

## 重装系统配置

### 重新安装qtcreator

```bash

sudo apt update
sudo apt install qtcreator

```

**安装后的版本如下:**

![qt_creator_version](/images/qt/qt_creator_version.png)


### 修改侧边栏菜单文字太小问题

![qt_creator_size](/images/qt/qt_creator_size.png)

勾选Enable High DPI scaling菜单即可

### 配置交叉编译环境

**配置gcc**

![qt_creator_gcc](/images/qt/qt_creator_gcc.png)

![qt_creator_g++](/images/qt/qt_creator_g++.png)

### 配置qt

**配置的qmake文件必须是项目编译出qmake，否则无法使用**

```bash

sudo apt install libncurses5-dev openssl libssl-dev build-essential pkg-config libc6-dev bison flex libelf-dev minizip libidn11-dev qttools5-dev liblz4-tool u-boot-tools

./wif_build.sh

```

编译完成后qmake目录

/home/lxg/code/project/t113/t113_linux/platform/framework/qt/qt-everywhere-src-5.12.5/Qt_5.12.5/bin/qmake

![qt_creator_qmake](/images/qt/qt_creator_qmake.png)

### 配置编译套件

![qt_creator_kits](/images/qt/qt_creator_kits.png)

导入DeviceTest编译验证

### 配置cmake

sudo apt install cmake

![qt_creator_cmake](/images/qt/qt_creator_cmake.png)

### 导入WifMqtt

**报错1**

```txt

/home/lxg/code/gitlab/linux/WifMqtt/main.c:3: error: curl/curl.h: No such file or directory
/home/lxg/code/gitlab/linux/WifMqtt/main.c:3:10: fatal error: curl/curl.h: No such file or directory
 #include <curl/curl.h>
          ^~~~~~~~~~~~~

```

**解决方案**

由于编译出的程序需要运行在嵌入式平台上，因此编译要用交叉编译的头文件

/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/arm-buildroot-linux-gnueabi/sysroot/usr/include

将上述目录下需要的头文件拷贝到项目include目录中即可





























