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

[androidxref](http://androidxref.com/)

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

## 内核子系统

![linux_subsystem](/images/linux/linux_sub_system.jpg)

### 系统调用接口

SCI 层提供了某些机制执行从用户空间到内核的函数调用。正如前面讨论的一样，这个接口依赖于体系结构，甚至在相同的处理器家族内也是如此。SCI 实际上是一个非常有用的函数调用多路复用和多路分解服务。在 ./linux/kernel 中您可以找到 SCI 的实现，并在 ./linux/arch 中找到依赖于体系结构的部分

### 进程管理

进程管理的重点是进程的执行。在内核中，这些进程称为线程，代表了单独的处理器虚拟化（线程代码、数据、堆栈和 CPU 寄存器）。在用户空间，通常使用进程 这个术语，不过 Linux 实现并没有区分这两个概念（进程和线程）。内核通过 SCI 提供了一个应用程序编程接口（API）来创建一个新进程（fork、exec 或 Portable Operating System Interface [POSIX] 函数），停止进程（kill、exit），并在它们之间进行通信和同步（signal 或者 POSIX 机制）。

进程管理还包括处理活动进程之间共享 CPU 的需求。内核实现了一种新型的调度算法，不管有多少个线程在竞争 CPU，这种算法都可以在固定时间内进行操作。这种算法就称为 O(1) 调度程序，这个名字就表示它调度多个线程所使用的时间和调度一个线程所使用的时间是相同的。 O(1) 调度程序也可以支持多处理器（称为对称多处理器或 SMP）。您可以在 ./linux/kernel 中找到进程管理的源代码，在 ./linux/arch 中可以找到依赖于体系结构的源代码

### 内存管理

内核所管理的另外一个重要资源是内存。为了提高效率，如果由硬件管理虚拟内存，内存是按照所谓的内存页 方式进行管理的（对于大部分体系结构来说都是 4KB）。Linux 包括了管理可用内存的方式，以及物理和虚拟映射所使用的硬件机制。

不过内存管理要管理的可不止 4KB 缓冲区。Linux 提供了对 4KB 缓冲区的抽象，例如 slab 分配器。这种内存管理模式使用 4KB 缓冲区为基数，然后从中分配结构，并跟踪内存页使用情况，比如哪些内存页是满的，哪些页面没有完全使用，哪些页面为空。这样就允许该模式根据系统需要来动态调整内存使用。

为了支持多个用户使用内存，有时会出现可用内存被消耗光的情况。由于这个原因，页面可以移出内存并放入磁盘中。这个过程称为交换，因为页面会被从内存交换到硬盘上。内存管理的源代码可以在 ./linux/mm 中找到

### 虚拟文件系统

虚拟文件系统（VFS）是 Linux 内核中非常有用的一个方面，因为它为文件系统提供了一个通用的接口抽象。VFS 在 SCI 和内核所支持的文件系统之间提供了一个交换层

![linux_vfs](/images/linux/linux_vfs.jpg)

在 VFS 上面，是对诸如 open、close、read 和 write 之类的函数的一个通用 API 抽象。在 VFS 下面是文件系统抽象，它定义了上层函数的实现方式。它们是给定文件系统（超过 50 个）的插件。文件系统的源代码可以在 ./linux/fs 中找到。

文件系统层之下是缓冲区缓存，它为文件系统层提供了一个通用函数集（与具体文件系统无关）。这个缓存层通过将数据保留一段时间（或者随即预先读取数据以便在需要是就可用）优化了对物理设备的访问。缓冲区缓存之下是设备驱动程序，它实现了特定物理设备的接口。

### 网络堆栈

网络堆栈在设计上遵循模拟协议本身的分层体系结构。回想一下，Internet Protocol (IP) 是传输协议（通常称为传输控制协议或 TCP）下面的核心网络层协议。TCP 上面是 socket 层，它是通过 SCI 进行调用的。

socket 层是网络子系统的标准 API，它为各种网络协议提供了一个用户接口。从原始帧访问到 IP 协议数据单元（PDU），再到 TCP 和 User Datagram Protocol (UDP)，socket 层提供了一种标准化的方法来管理连接，并在各个终点之间移动数据。内核中网络源代码可以在 ./linux/net 中找到

### 设备驱动程序

Linux 内核中有大量代码都在设备驱动程序中，它们能够运转特定的硬件设备。Linux 源码树提供了一个驱动程序子目录，这个目录又进一步划分为各种支持设备，例如 Bluetooth、I2C、serial 等。设备驱动程序的代码可以在 ./linux/drivers 中找到

### 依赖体系结构的代码

尽管 Linux 很大程度上独立于所运行的体系结构，但是有些元素则必须考虑体系结构才能正常操作并实现更高效率。./linux/arch 子目录定义了内核源代码中依赖于体系结构的部分，其中包含了各种特定于体系结构的子目录（共同组成了 BSP）。对于一个典型的桌面系统来说，使用的是 i386 目录。每个体系结构子目录都包含了很多其他子目录，每个子目录都关注内核中的一个特定方面，例如引导、内核、内存管理等。这些依赖体系结构的代码可以在 ./linux/arch 中找到

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

## Android Kernel

[Android通用内核-Google](https://source.android.google.cn/devices/architecture/kernel/android-common)

## Android Config

[Android base config](http://androidxref.com/kernel_3.18/xref/android/configs/)

[Arch config](http://androidxref.com/kernel_3.18/xref/arch/arm/configs/)

## Linux Kconfig

```txt

linux-stable$ cat Kconfig

mainmenu "Linux/$(ARCH) $(KERNELVERSION) Kernel Configuration"

comment "Compiler: $(CC_VERSION_TEXT)"

source "scripts/Kconfig.include"

source "init/Kconfig"

source "kernel/Kconfig.freezer"

source "fs/Kconfig.binfmt"

source "mm/Kconfig"

source "net/Kconfig"

source "drivers/Kconfig"

source "fs/Kconfig"

source "security/Kconfig"

source "crypto/Kconfig"

source "lib/Kconfig"

source "lib/Kconfig.debug"

source "Documentation/Kconfig"

```

## Android Kconfig

以寻找U盘驱动为例子

```txt

android/kernel/msm-3.18$ cat Kconfig

mainmenu "Linux/$ARCH $KERNELVERSION Kernel Configuration"

config SRCARCH
	string
	option env="SRCARCH"

source "arch/$SRCARCH/Kconfig"

```

[arch/arm/Kconfig](http://androidxref.com/kernel_3.18/xref/arch/arm/Kconfig)

```txt

source "drivers/Kconfig"

```

[drivers/usb/Kconfig](http://androidxref.com/kernel_3.18/xref/drivers/usb/Kconfig)

```txt

source "drivers/usb/storage/Kconfig"

```

[drivers/usb/storage/Kconfig](http://androidxref.com/kernel_3.18/xref/drivers/usb/storage/Kconfig)

```txt

#
# USB Storage driver configuration
#

comment "NOTE: USB_STORAGE depends on SCSI but BLK_DEV_SD may"
comment "also be needed; see USB_STORAGE Help for more info"

config USB_STORAGE
	tristate "USB Mass Storage support"
	depends on SCSI
	---help---
	  Say Y here if you want to connect USB mass storage devices to your
	  computer's USB port. This is the driver you need for USB
	  floppy drives, USB hard disks, USB tape drives, USB CD-ROMs,
	  USB flash devices, and memory sticks, along with
	  similar devices. This driver may also be used for some cameras
	  and card readers.

	  This option depends on 'SCSI' support being enabled, but you
	  probably also need 'SCSI device support: SCSI disk support'
	  (BLK_DEV_SD) for most USB storage devices.

	  To compile this driver as a module, choose M here: the
	  module will be called usb-storage.

```

## Makefile

[drivers/usb/storage/Makefile](http://androidxref.com/kernel_3.18/xref/drivers/usb/storage/Makefile)

```mk

obj-$(CONFIG_USB_STORAGE)	+= usb-storage.o

usb-storage-y := scsiglue.o protocol.o transport.o usb.o
usb-storage-y += initializers.o sierra_ms.o option_ms.o
usb-storage-y += usual-tables.o

```

从对Kconfig文件的分析，我们确定了只需关注 CONFIG_USB_STORAGE 选项，在 Makefile 中找到此项，对应的模块为usb-storage.o，意味着只需关注
scsiglue.c protocol.c transport.c usb.c initializers.c sierra_ms.c option_ms.c usual-tables.c以及同名到.h文件

## README

[drivers/usb/README](http://androidxref.com/kernel_3.18/xref/drivers/usb/)



