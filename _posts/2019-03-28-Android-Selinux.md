---
layout:     post
title:      Android Selinux
subtitle:   Security-Enhanced Linux
date:       2019-03-28
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - selinux
    - android
---

[Selinux-AOSP](https://source.android.com/security/selinux)

### 问题

> 03-28 09:57:44.667  7326  7326 W m.sunmi.sidekey: type=1400 audit(0.0:244): avc: denied { write } for name="property_service" dev="tmpfs" ino=220 scontext=u:r:sunmi_app:s0:c512,c768 tcontext=u:object_r:property_socket:s0 tclass=sock_file permissive=0

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



