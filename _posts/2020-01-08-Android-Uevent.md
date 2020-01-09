---
layout:     post
title:      Android Uevent
subtitle:   事件上报
date:       2020-01-08
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
---

[Linux设备模型之Uevent-简书](https://www.jianshu.com/p/10653d83909d)

[Android Ueventd-简书](https://www.jianshu.com/p/8a34ba82ac1f)

## Linux Uevent

![linux_uevent](/images/uevent/linux_uevent.png)

## Linux Netlink

Netlink套接字是用以实现用户进程与内核进程通信的一种特殊的进程间通信(IPC) ,也是网络应用程序与内核通信的最常用的接口。

在Linux 内核中，使用netlink 进行应用与内核通信的应用有很多，如

* 路由 daemon（NETLINK_ROUTE）
* 用户态 socket 协议（NETLINK_USERSOCK）
* 防火墙（NETLINK_FIREWALL）
* netfilter 子系统（NETLINK_NETFILTER）
* 内核事件向用户态通知（NETLINK_KOBJECT_UEVENT）
* 通用netlink（NETLINK_GENERIC）

Netlink 是一种在内核与用户应用间进行双向数据传输的非常好的方式，用户态应用使用标准的 socket API 就可以使用 netlink 提供的强大功能，内核态需要使用专门的内核 API 来使用 netlink。

一般来说用户空间和内核空间的通信方式有三种：/proc、ioctl、Netlink。而前两种都是单向的，而Netlink可以实现双工通信。

![linux_netlink](/images/uevent/linux_netlink.png)

## Android Ueventd

Android 中的 ueventd 是一个守护进程，它通过netlink scoket监听内核生成的uevent消息，
当ueventd收到这样的消息时，它通过采取适当的行动来处理它，通常是在/dev中创建设备节点，设置文件权限，设置selinux标签等。
ueventd还可以处理内核请求的固件加载、创建块设备符号链接以及创建字符设备

## ueventd 源码

### init.rc

**system/core/rootdir/init.rc**

```rc

on early-init

    start ueventd

on init

## Daemon processes to be run by init.
##
service ueventd /sbin/ueventd
    class core
    critical
    seclabel u:r:ueventd:s0

```

### Android.mk

**adb shell ls sbin/ -l**

```txt

L2K:/ # ls sbin/ -l
lrwxrwxrwx 1 root root      7 1970-01-01 08:00 ueventd -> ../init
lrwxrwxrwx 1 root root      7 1970-01-01 08:00 watchdogd -> ../init

``

**system/core/init/Android.mk**

```makefile

LOCAL_SRC_FILES:= \
    bootchart.cpp \
    builtins.cpp \
    devices.cpp \
    init.cpp \
    keychords.cpp \
    property_service.cpp \
    signal_handler.cpp \
    ueventd.cpp \
    ueventd_parser.cpp \
    watchdogd.cpp \

LOCAL_MODULE:= init

# Create symlinks
LOCAL_POST_INSTALL_CMD := $(hide) mkdir -p $(TARGET_ROOT_OUT)/sbin; \
    ln -sf ../init $(TARGET_ROOT_OUT)/sbin/ueventd; \
    ln -sf ../init $(TARGET_ROOT_OUT)/sbin/watchdogd

```

### init.c

**system/core/init/init.cpp**

```cpp

int main(int argc, char** argv) {

    if (!strcmp(basename(argv[0]), "ueventd")) {
        return ueventd_main(argc, argv);
    }

    if (!strcmp(basename(argv[0]), "watchdogd")) {
        return watchdogd_main(argc, argv);
    }
}

```

### ueventd.cpp

**system/core/init/ueventd.cpp**

ueventd_main()函数就是ueventd进程的主体，实现了以下几个功能：

* 解析ueventd.rc文件，管理设备节点权限
* 递归扫描/sys目录，根据uevent文件，静态创建设备节点
* 通过netlink获取内核uevent事件，动态创建设备节点

```cpp

int ueventd_main(int argc, char **argv)
{

    ----------------------------------------------------------

    // 解析ueventd.rc文件
    ueventd_parse_config_file("/ueventd.rc");
    ueventd_parse_config_file(android::base::StringPrintf("/ueventd.%s.rc", hardware.c_str()).c_str());

    // 创建netlink sockfd, 用于监听ueventd事件
    device_init();

    pollfd ufd;
    ufd.events = POLLIN;

    // 获取device_init()创建的sockfd
    ufd.fd = get_device_fd();

    while (true) {
        ufd.revents = 0;

        // 通过sockfd监听内核uevent事件
        int nr = poll(&ufd, 1, -1);
        if (nr <= 0) {
            continue;
        }
        if (ufd.revents & POLLIN) {
            // 当接收到内核uevent事件时，创建相应设备节点
            handle_device_fd();
        }
    }

    return 0;
}

```

**system/core/init/devices.cpp**

```cpp

void device_init() {
    sehandle = selinux_android_file_context_handle();
    selinux_status_open(true);

    /* is 256K enough? udev uses 16MB! */
    // 创建 netlink sockfd, 用于监听 uevent 事件
    device_fd = uevent_open_socket(256*1024, true);
    if (device_fd == -1) {
        return;
    }
    fcntl(device_fd, F_SETFL, O_NONBLOCK);

    if (access(COLDBOOT_DONE, F_OK) == 0) {
        NOTICE("Skipping coldboot, already done!\n");
        return;
    }

    Timer t;
    coldboot("/sys/class");
    coldboot("/sys/block");
    coldboot("/sys/devices");
    close(open(COLDBOOT_DONE, O_WRONLY|O_CREAT|O_CLOEXEC, 0000));
    NOTICE("Coldboot took %.2fs.\n", t.duration());
}

```

### ueventd.rc

**system/core/rootdir/ueventd.rc**

[system/core/rootdir/ueventd.rc](http://androidxref.com/7.1.2_r36/xref/system/core/rootdir/ueventd.rc)

## ueventd init

![ueventd_init](/images/uevent/ueventd_init.png)

## Ueventd 处理

![uevent_handle](/images/uevent/uevent_handle.png)

## UEventObserver

[android/os/UEventObserver.java](http://androidxref.com/7.1.2_r36/xref/frameworks/base/core/java/android/os/UEventObserver.java)

[android_os_UEventObserver.cpp](http://androidxref.com/7.1.2_r36/xref/frameworks/base/core/jni/android_os_UEventObserver.cpp)

[libhardware_legacy/uevent/uevent.c](http://androidxref.com/7.1.2_r36/xref/hardware/libhardware_legacy/uevent/uevent.c)

注册 Uevent 事件监听

![uevent_observer](/images/uevent/uevent_observer.png)










