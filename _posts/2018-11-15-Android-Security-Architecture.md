---
layout:     post
title:      Android Security Architecture
subtitle:   ROM
date:       2018-11-15
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Android
    - Permission
    - Security
    - SELinux
---

## Android Security Architecture

[AOSP安全指南](https://source.android.com/security)

[官网应用安全最佳实践](https://developer.android.com/topic/security/best-practices#permissions)

[源码权限定义](http://androidxref.com/7.1.2_r36/xref/frameworks/base/core/res/AndroidManifest.xml)

[官网权限定义](https://developer.android.google.cn/reference/android/Manifest.permission)

[源码UID定义](http://androidxref.com/7.1.2_r36/xref/system/core/include/private/android_filesystem_config.h)


### 应用程序沙箱

#### 进程级
```txt
root      1     0     14388  2384  SyS_epoll_ 00004c9810 S /init
root      715   1     2161460 83980 poll_sched 7f8eeb4898 S zygote64
root      716   1     1592656 70568 poll_sched 00e96b8594 S zygote
system    1385  715   2371452 134876 SyS_epoll_ 7f8eeb4778 S system_server
root      377   1     49176  4008  hrtimer_na 7fa6d901b0 S /system/bin/vold
radio     2532  715   1586980 50552 SyS_epoll_ 7f8eeb4778 S com.android.phone
media     727   1     44112  7672  binder_thr 00ea4874ec S /system/bin/mediaserver
u0_a41    2286  715   1659016 83256 SyS_epoll_ 7f8eeb4778 S com.android.launcher3
```

#### 文件级

```txt
drwxrwx--x  2 root sdcard_rw     4096 2018-11-14 15:16 Download
drwx------   4 system    system    4096 1970-09-08 08:32 android
drwx------   4 u0_a27    u0_a27    4096 1970-09-08 08:32 com.android.systemui
```

### 权限


### SELinux

>
11-06 17:06:27.241  1336  1336 I auditd  : type=1400 audit(0.0:323): avc: denied { search } for comm="ActivityManager" name="media" dev="dm-0" ino=472354 scontext=u:r:system_server:s0 tcontext=u:object_r:sunmi_media_file:s0 tclass=dir permissive=0







