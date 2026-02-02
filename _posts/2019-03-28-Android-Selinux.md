---
layout:     post
title:      Android Selinux
subtitle:   Security-Enhanced Linux
date:       2019-03-28
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Android
---

[Selinux-AOSP](https://source.android.com/security/selinux)

### 问题

> 03-28 09:57:44.667  7326  7326 W m.sunmi.sidekey: type=1400 audit(0.0:244): avc: denied { write } for name="property_service" dev="tmpfs" ino=220 scontext=u:r:sunmi_app:s0:c512,c768 tcontext=u:object_r:property_socket:s0 tclass=sock_file permissive=0

### 原因分析

seapp_contexts 用于为应用进程和 /data/data 目录分配标签。在每次应用启动时，zygote 进程都会读取此配置；在启动期间，installd 会读取此配置。

> seapp_contexts
> levelFrom=user 不同level的进程无法进行socket通信
> //user=_app seinfo=sunmi domain=sunmi_app type=app_data_file
> user=_app seinfo=sunmi domain=sunmi_app type=app_data_file levelFrom=user
> user=_app domain=untrusted_app type=app_data_file levelFrom=user


s0 是 SELinux为了满足军用和教育行业设计的 Multi-Level Security(MLS)机制有关。MLS将进程和文件进行了分级，不同级别的资源需要不同级别的进程访问

> ps -Z
> u:r:sunmi_app:s0               u0_a69    3588  1258  990992 30876 SyS_epoll_ 00000000 S com.sunmi.***
> u:r:sunmi_app:s0:c512,c768     u0_a69    3588  1258  990992 30876 SyS_epoll_ 00000000 S com.sunmi.***

### 修改方案

//sunmi_app.te
type sunmi_app, domain, domain_deprecated, mlstrustedsubject; // add mlstrustedsubject

### android sepolicy

[system/sepolicy](http://androidxref.com/7.1.2_r36/xref/system/sepolicy/)

[device/huawei/angler/sepolicy/](http://androidxref.com/7.1.2_r36/xref/device/huawei/angler/sepolicy/)

### 编译

[/device/huawei/angler/BoardConfig.mk](http://androidxref.com/7.1.2_r36/xref/device/huawei/angler/BoardConfig.mk)

```makefile

BOARD_SEPOLICY_DIRS += \
        <root>/device/manufacturer/device-name/sepolicy

BOARD_SEPOLICY_UNION += \
        genfs_contexts \
        file_contexts \
        sepolicy.te
```

### 编译结果

out/target/product/msm8937_32/obj/ETC/sepolicy_intermediates/policy.conf

[编译-AOSP](https://source.android.com/security/selinux/build)

### 调试

[调试-AOSP](https://source.android.google.cn/security/selinux/validate)

1. adb shell setenforce 0   //临时关闭selinux

2. cat /proc/kmsg | grep avc  //查看selinux相关log

### audit2allow

> external/selinux/policycoreutils/audit2allow 工具可以获取 dmesg 拒绝事件并将其转换成相应的 SELinux 政策声明。因此，该工具有助于大幅加快 SELinux 开发速度
> audit2allow 包含在 Android 源代码树中，会在您基于源代码编译 Android 时自动编译

1. sudo apt install policycoreutils

2. adb root

3. adb shell "cat /proc/kmsg | grep avc" > avc_log.txt

4. audit2allow -i avc_log.txt



