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

## 问题

> 03-28 09:57:44.667  7326  7326 W m.sunmi.sidekey: type=1400 audit(0.0:244): avc: denied { write } for name="property_service" dev="tmpfs" ino=220 scontext=u:r:sunmi_app:s0:c512,c768 tcontext=u:object_r:property_socket:s0 tclass=sock_file permissive=0

## android sepolicy

[system/sepolicy](http://androidxref.com/7.1.2_r36/xref/system/sepolicy/)

[device/huawei/angler/sepolicy/](http://androidxref.com/7.1.2_r36/xref/device/huawei/angler/sepolicy/)

## 编译

[/device/huawei/angler/BoardConfig.mk](http://androidxref.com/7.1.2_r36/xref/device/huawei/angler/BoardConfig.mk)

```makefile

BOARD_SEPOLICY_DIRS += \
        <root>/device/manufacturer/device-name/sepolicy

BOARD_SEPOLICY_UNION += \
        genfs_contexts \
        file_contexts \
        sepolicy.te
```

## 编译结果

out/target/product/msm8937_32/obj/ETC/sepolicy_intermediates/policy.conf

[编译-AOSP](https://source.android.com/security/selinux/build)
