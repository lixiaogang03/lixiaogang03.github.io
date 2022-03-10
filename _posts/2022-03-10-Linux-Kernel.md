---
layout:     post
title:      Linux Kernel 1
subtitle:   https://www.kernel.org/
date:       2022-03-10
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - linux
---

## Linux Kernel

```txt

.
├── arch
├── block
├── COPYING
├── CREDITS
├── crypto
├── Documentation
├── drivers
├── firmware
├── fs
├── include
├── init
├── ipc
├── Kbuild
├── Kconfig
├── kernel
├── lib
├── MAINTAINERS
├── Makefile
├── mm
├── net
├── README
├── REPORTING-BUGS
├── samples
├── scripts
├── security
├── sound
├── tools
├── usr
└── virt

```

## Android Kernel

```txt
.
├── android
├── arch
├── backported-features
├── block
├── boot.img
├── build.config.cuttlefish.x86_64
├── certs
├── COPYING
├── CREDITS
├── crypto
├── Documentation
├── drivers
├── firmware
├── fs
├── include
├── init
├── ipc
├── Kbuild
├── Kconfig
├── kernel
├── kernel.img
├── lib
├── logo.bmp
├── logo_kernel.bmp
├── MAINTAINERS
├── Makefile
├── mm
├── modules.builtin
├── modules.order
├── Module.symvers
├── net
├── README
├── REPORTING-BUGS
├── resource.img
├── samples
├── scripts
├── security
├── sound
├── System.map
├── tools
├── usr
├── virt
├── vmlinux
├── vmlinux.o
└── zboot.img

```

## 目录解释

* arch: 处理器相关目录
* block: 块存储设备代码，实际上也是调度算法
* crypto: 密码API和加密算法代码
* Documentation: 包含不同内核框架和子系统所使用API的描述
* drivers: 这是最重要的目录，不断增加的设备驱动程序都被合并到这个目录，不同的子目录中包含不同的设备驱动程序
* fs: 该目录包含内核支持的不同文件系统的实现，如NTFS、FAT、ETX{2,3,4}、sysfs、procfs、NFS等
* include: 该目录包含内核头文件
* init: 该目录包含初始化和启动代码
* ipc: 该目录包含进程间通信(IPC)机制的实现，如消息队列、信号量和共享内存
* kernel: 该目录包含基本内核中与体系架构无关的部分
* lib:该目录包含库函数和一些辅助函数，分别是通用内核对象（kobject）处理程序和循环冗余码（CRC）计算函数等
* mm: 该目录包含内存管理相关的代码
* network: 该目录包含所有类型网络协议的代码
* scripts: 该目录包含内核开发过程中使用的脚本和工具
* security: 该目录包含安全框架相关代码
* sound: 该目录包含音频子系统代码
* usr: 该目录包含了initramfs的实现

## 内核配置

./device/rockchip/rk3288/build.sh

```sh

UBOOT_DEFCONFIG=rk3288_secure_defconfig
KERNEL_DEFCONFIG=rockchip_defconfig
KERNEL_DTS=rk3288-evb-android-rk808-edp

```

./kernel/arch/arm/configs/rockchip_defconfig

命令配置 make menuconfig

## 驱动程序

驱动程序是专用于控制和管理特定硬件设备的软件，提供硬件功能给用户程序

内核模块动态扩展了内核功能，即插即用，CONFIG_MODULES=y

模块的手动加载(insmod)和卸载(rmmod), 查看已经加载的模块(lsmod)

查看内核模块信息

```txt

$ modinfo ./drivers/media/usb/gspca/gspca_main.ko
filename:       /drivers/media/usb/gspca/gspca_main.ko
version:        2.14.0
license:        GPL
description:    GSPCA USB Camera Driver
author:         Jean-François Moine <http://moinejf.free.fr>
srcversion:     F5C20D78E083AA5A11E6F23
depends:
intree:         Y
vermagic:       4.4.143 SMP preempt mod_unload modversions ARMv7 p2v8 
parm:           debug:1:probe 2:config 3:stream 4:frame 5:packet 6:usbi 7:usbo (int)

```

## 驱动程序框架

```c

//helloworld.c
#include <linux/init.h>
#include <linux/module.h>

static int hello_init(void)
{
    printk("hello, world!\r\n");

    return 0;
}

static void hello_exit(void)
{
    printk("byebye!\r\n");
}

module_init(hello_init);
module_exit(hello_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("SIXER");

```

## 内核错误处理

内核树中预定义的错误几乎涵盖了我们可能遇到的所有情况

./include/uapi/asm-generic/errno-base.h

```c

#ifndef _ASM_GENERIC_ERRNO_BASE_H
#define _ASM_GENERIC_ERRNO_BASE_H

#define EPERM            1      /* Operation not permitted 操作不允许 */
#define ENOENT           2      /* No such file or directory */
#define ESRCH            3      /* No such process */
#define EINTR            4      /* Interrupted system call 中断系统调用 */
#define EIO              5      /* I/O error */
#define ENXIO            6      /* No such device or address 没有这样的设备和地址 */
#define E2BIG            7      /* Argument list too long 参数列表太长 */
#define ENOEXEC          8      /* Exec format error */
#define EBADF            9      /* Bad file number 错误的文件数量 */
#define ECHILD          10      /* No child processes 没有子进程 */
#define EAGAIN          11      /* Try again */
#define ENOMEM          12      /* Out of memory 内存不足 */
#define EACCES          13      /* Permission denied 没有权限 */
#define EFAULT          14      /* Bad address 错误地址 */
#define ENOTBLK         15      /* Block device required 块设备要求 */
#define EBUSY           16      /* Device or resource busy 设备或资源忙 */
#define EEXIST          17      /* File exists 文件已存在 */
#define EXDEV           18      /* Cross-device link 跨设备的链接 */
#define ENODEV          19      /* No such device 没有这样的设备 */
#define ENOTDIR         20      /* Not a directory */
#define EISDIR          21      /* Is a directory */
#define EINVAL          22      /* Invalid argument 无效参数 */
#define ENFILE          23      /* File table overflow 文件表溢出 */
#define EMFILE          24      /* Too many open files 打开的文件太多 */
#define ENOTTY          25      /* Not a typewriter */
#define ETXTBSY         26      /* Text file busy 文本文件忙 */
#define EFBIG           27      /* File too large 文件太大 */
#define ENOSPC          28      /* No space left on device 设备上没有空间了 */
#define ESPIPE          29      /* Illegal seek 非法寻求 */
#define EROFS           30      /* Read-only file system 只读文件系统 */
#define EMLINK          31      /* Too many links 链接太多 */
#define EPIPE           32      /* Broken pipe 破坏的管道 */
#define EDOM            33      /* Math argument out of domain of func 函数域外的数学参数 */
#define ERANGE          34      /* Math result not representable 数学结果无法表示 */

#endif

```

./include/uapi/asm-generic/errno.h

```c

#ifndef _ASM_GENERIC_ERRNO_H
#define _ASM_GENERIC_ERRNO_H

#include <asm-generic/errno-base.h>

#define	EDEADLK		35	/* Resource deadlock would occur */
#define	ENAMETOOLONG	36	/* File name too long */
#define	ENOLCK		37	/* No record locks available */

/*
 * This error code is special: arch syscall entry code will return
 * -ENOSYS if users try to call a syscall that doesn't exist.  To keep
 * failures of syscalls that really do exist distinguishable from
 * failures due to attempts to use a nonexistent syscall, syscall
 * implementations should refrain from returning -ENOSYS.
 */
#define	ENOSYS		38	/* Invalid system call number */

#define	ENOTEMPTY	39	/* Directory not empty */
#define	ELOOP		40	/* Too many symbolic links encountered */
#define	EWOULDBLOCK	EAGAIN	/* Operation would block */
#define	ENOMSG		42	/* No message of desired type */
#define	EIDRM		43	/* Identifier removed */
#define	ECHRNG		44	/* Channel number out of range */
#define	EL2NSYNC	45	/* Level 2 not synchronized */
#define	EL3HLT		46	/* Level 3 halted */
#define	EL3RST		47	/* Level 3 reset */
#define	ELNRNG		48	/* Link number out of range */
#define	EUNATCH		49	/* Protocol driver not attached */
#define	ENOCSI		50	/* No CSI structure available */
#define	EL2HLT		51	/* Level 2 halted */
#define	EBADE		52	/* Invalid exchange */
#define	EBADR		53	/* Invalid request descriptor */
#define	EXFULL		54	/* Exchange full */
#define	ENOANO		55	/* No anode */
#define	EBADRQC		56	/* Invalid request code */
#define	EBADSLT		57	/* Invalid slot */

#define	EDEADLOCK	EDEADLK

#define	EBFONT		59	/* Bad font file format */
#define	ENOSTR		60	/* Device not a stream */
#define	ENODATA		61	/* No data available */
#define	ETIME		62	/* Timer expired */
#define	ENOSR		63	/* Out of streams resources */
#define	ENONET		64	/* Machine is not on the network */
#define	ENOPKG		65	/* Package not installed */
#define	EREMOTE		66	/* Object is remote */
#define	ENOLINK		67	/* Link has been severed */
#define	EADV		68	/* Advertise error */
#define	ESRMNT		69	/* Srmount error */
#define	ECOMM		70	/* Communication error on send */
#define	EPROTO		71	/* Protocol error */
#define	EMULTIHOP	72	/* Multihop attempted */
#define	EDOTDOT		73	/* RFS specific error */
#define	EBADMSG		74	/* Not a data message */
#define	EOVERFLOW	75	/* Value too large for defined data type */
#define	ENOTUNIQ	76	/* Name not unique on network */
#define	EBADFD		77	/* File descriptor in bad state */
#define	EREMCHG		78	/* Remote address changed */
#define	ELIBACC		79	/* Can not access a needed shared library */
#define	ELIBBAD		80	/* Accessing a corrupted shared library */
#define	ELIBSCN		81	/* .lib section in a.out corrupted */
#define	ELIBMAX		82	/* Attempting to link in too many shared libraries */
#define	ELIBEXEC	83	/* Cannot exec a shared library directly */
#define	EILSEQ		84	/* Illegal byte sequence */
#define	ERESTART	85	/* Interrupted system call should be restarted */
#define	ESTRPIPE	86	/* Streams pipe error */
#define	EUSERS		87	/* Too many users */
#define	ENOTSOCK	88	/* Socket operation on non-socket */
#define	EDESTADDRREQ	89	/* Destination address required */
#define	EMSGSIZE	90	/* Message too long */
#define	EPROTOTYPE	91	/* Protocol wrong type for socket */
#define	ENOPROTOOPT	92	/* Protocol not available */
#define	EPROTONOSUPPORT	93	/* Protocol not supported */
#define	ESOCKTNOSUPPORT	94	/* Socket type not supported */
#define	EOPNOTSUPP	95	/* Operation not supported on transport endpoint */
#define	EPFNOSUPPORT	96	/* Protocol family not supported */
#define	EAFNOSUPPORT	97	/* Address family not supported by protocol */
#define	EADDRINUSE	98	/* Address already in use */
#define	EADDRNOTAVAIL	99	/* Cannot assign requested address */
#define	ENETDOWN	100	/* Network is down */
#define	ENETUNREACH	101	/* Network is unreachable */
#define	ENETRESET	102	/* Network dropped connection because of reset */
#define	ECONNABORTED	103	/* Software caused connection abort */
#define	ECONNRESET	104	/* Connection reset by peer */
#define	ENOBUFS		105	/* No buffer space available */
#define	EISCONN		106	/* Transport endpoint is already connected */
#define	ENOTCONN	107	/* Transport endpoint is not connected */
#define	ESHUTDOWN	108	/* Cannot send after transport endpoint shutdown */
#define	ETOOMANYREFS	109	/* Too many references: cannot splice */
#define	ETIMEDOUT	110	/* Connection timed out */
#define	ECONNREFUSED	111	/* Connection refused */
#define	EHOSTDOWN	112	/* Host is down */
#define	EHOSTUNREACH	113	/* No route to host */
#define	EALREADY	114	/* Operation already in progress */
#define	EINPROGRESS	115	/* Operation now in progress */
#define	ESTALE		116	/* Stale file handle */
#define	EUCLEAN		117	/* Structure needs cleaning */
#define	ENOTNAM		118	/* Not a XENIX named type file */
#define	ENAVAIL		119	/* No XENIX semaphores available */
#define	EISNAM		120	/* Is a named type file */
#define	EREMOTEIO	121	/* Remote I/O error */
#define	EDQUOT		122	/* Quota exceeded */

#define	ENOMEDIUM	123	/* No medium found */
#define	EMEDIUMTYPE	124	/* Wrong medium type */
#define	ECANCELED	125	/* Operation Canceled */
#define	ENOKEY		126	/* Required key not available */
#define	EKEYEXPIRED	127	/* Key has expired */
#define	EKEYREVOKED	128	/* Key has been revoked */
#define	EKEYREJECTED	129	/* Key was rejected by service */

/* for robust mutexes */
#define	EOWNERDEAD	130	/* Owner died */
#define	ENOTRECOVERABLE	131	/* State not recoverable */

#define ERFKILL		132	/* Operation not possible due to RF-kill */

#define EHWPOISON	133	/* Memory page has hardware error */

#endif

```

## 内核消息打印---printk()

dmesg 命令可以显示printk()打印的日志

./include/linux/kern_levels.h

```c

#ifndef __KERN_LEVELS_H__
#define __KERN_LEVELS_H__

#define KERN_SOH        "\001"          /* ASCII Start Of Header */
#define KERN_SOH_ASCII  '\001'

#define KERN_EMERG      KERN_SOH "0"    /* system is unusable */
#define KERN_ALERT      KERN_SOH "1"    /* action must be taken immediately */
#define KERN_CRIT       KERN_SOH "2"    /* critical conditions */
#define KERN_ERR        KERN_SOH "3"    /* error conditions */
#define KERN_WARNING    KERN_SOH "4"    /* warning conditions */
#define KERN_NOTICE     KERN_SOH "5"    /* normal but significant condition */
#define KERN_INFO       KERN_SOH "6"    /* informational */
#define KERN_DEBUG      KERN_SOH "7"    /* debug-level messages */

#define KERN_DEFAULT    KERN_SOH "d"    /* the default kernel loglevel */

/*
 * Annotation for a "continued" line of log printout (only done after a
 * line that had no enclosing \n). Only to be used by core/arch code
 * during early bootup (a continued line is not SMP-safe otherwise).
 */
#define KERN_CONT       ""

/* integer equivalents of KERN_<LEVEL> */
#define LOGLEVEL_SCHED          -2      /* Deferred messages from sched code
                                         * are set to this special level */
#define LOGLEVEL_DEFAULT        -1      /* default (or last) loglevel */
#define LOGLEVEL_EMERG          0       /* system is unusable */
#define LOGLEVEL_ALERT          1       /* action must be taken immediately */
#define LOGLEVEL_CRIT           2       /* critical conditions */
#define LOGLEVEL_ERR            3       /* error conditions */
#define LOGLEVEL_WARNING        4       /* warning conditions */
#define LOGLEVEL_NOTICE         5       /* normal but significant condition */
#define LOGLEVEL_INFO           6       /* informational */
#define LOGLEVEL_DEBUG          7       /* debug-level messages */

#endif

```

查看当前日志级别 cat proc/sys/kernel/printk
修改当前日志级别 echo level > proc/sys/kernel/printk

## 交叉编译

交叉编译内核模块时，内核makefile需要了解两个变量：ARCH和CROSS_COMPILE, 它们分别表示目标体系结构和编译器的前缀名称。

```txt

============================================
PLATFORM_VERSION_CODENAME=REL
PLATFORM_VERSION=7.1.2
TARGET_PRODUCT=rk3288
TARGET_BUILD_VARIANT=user
TARGET_BUILD_TYPE=release
TARGET_BUILD_APPS=
TARGET_ARCH=arm
TARGET_ARCH_VARIANT=armv7-a-neon
TARGET_CPU_VARIANT=cortex-a15
TARGET_2ND_ARCH=
TARGET_2ND_ARCH_VARIANT=
TARGET_2ND_CPU_VARIANT=
HOST_ARCH=x86_64
HOST_2ND_ARCH=x86
HOST_OS=linux
HOST_OS_EXTRA=Linux-4.15.0-142-generic-x86_64-with-Ubuntu-16.04-xenial
HOST_CROSS_OS=windows
HOST_CROSS_ARCH=x86
HOST_CROSS_2ND_ARCH=x86_64
HOST_BUILD_TYPE=release
BUILD_ID=NHG47K
OUT_DIR=out
============================================

```


























