---
layout:     post
title:      Linux Kernel
subtitle:   Getting started learning
date:       2019-11-12
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - linux
    - kernel
---

[kernel.org](https://www.kernel.org/)

[linux-stable.git-清华镜像](https://mirror.tuna.tsinghua.edu.cn/help/linux-stable.git/)

[Linux 内核剖析-IBM](https://www.ibm.com/developerworks/cn/linux/l-linux-kernel/)

[Linux kernel-简书](https://www.jianshu.com/p/37d79d484468)

## 架构

![linux_arch](/images/linux/linux_arch.jpg)

GNU C Library (glibc) 提供了连接内核的系统调用接口，还提供了在用户空间应用程序和内核之间进行转换的机制。这点非常重要，因为内核和用户空间的应用程序使用的是不同的保护地址空间。
每个用户空间的进程都使用自己的虚拟地址空间，而内核则占用单独的地址空间

Linux 内核可以进一步划分成 3 层。最上面是系统调用接口，它实现了一些基本的功能，例如 read 和 write。
系统调用接口之下是内核代码，可以更精确地定义为独立于体系结构的内核代码。这些代码是 Linux 所支持的所有处理器体系结构所通用的。
在这些代码之下是依赖于体系结构的代码，构成了通常称为 BSP（Board Support Package）的部分。这些代码用作给定体系结构的处理器和特定于平台的代码。

## 源码目录

```txt

linux-stable$ tree -L 1

├── arch              平台差异
├── block             块设备通用函数
├── certs
├── COPYING
├── CREDITS
├── crypto            常见的加密算法的C语言实现代码，如crc32、md5、sha1等
├── Documentation     说明文档
├── drivers           内核中所有设备的驱动程序，其中的每一个子目录对应一种设备驱动
├── fs                Linux支持的文件系统代码，及各种类型的文件的操作代码。每个子目录都代表Linux支持的一种文件系统类型
├── include           内核编译通用的头文件
├── init              内核初始化的核心代码
├── ipc               内核中进程间的通信代码
├── Kbuild
├── Kconfig
├── kernel            内核的核心代码，此目录下实现了大多数Linux系统的内核函数
├── lib               内核共用的函数库
├── LICENSES
├── MAINTAINERS
├── Makefile
├── mm                内存管理代码
├── net               网络通信相关代码
├── README
├── samples
├── scripts           用于内核配置的脚本文件，用于实现内核配置的图形界面
├── security          安全性相关的代码
├── sound             声卡驱动及其他声音相关代码
├── tools             Linux中的常用工具
├── usr               内核启动相关的代码
└── virt              内核虚拟机相关的代码

```



