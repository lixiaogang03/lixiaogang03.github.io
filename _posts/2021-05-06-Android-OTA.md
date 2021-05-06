---
layout:     post
title:      Android OTA
subtitle:   Android 系统升级
date:       2021-05-06
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - android
---

[OTA更新-AOSP](https://source.android.google.cn/devices/tech/ota?hl=zh-cn)

## 普通系统升级

**boot引导分区**

包含 Linux 内核和最小的根文件系统（加载到 RAM 磁盘）。它装载了系统和其他分区，并启动位于 system 分区上的运行时。

boot header, kernel, ramdisk

[Ramdisk 分区-AOSP](https://source.android.google.cn/devices/bootloader/partitions/ramdisk-partitions?hl=zh_cn)

**system分区**

包含在 Android 开源项目 (AOSP) 上提供源代码的系统应用和库。在正常操作期间，此分区被装载为只读分区；其内容仅在 OTA 更新期间更改。

**vendor分区**

包含在 Android 开源项目 (AOSP) 上未提供源代码的系统应用和库。在正常操作期间，此分区被装载为只读分区；其内容仅在 OTA 更新期间更改。

**userdata分区**

存储由用户安装的应用所保存的数据等。OTA 更新过程通常不会触及该分区。

**cache分区**

几个应用使用的临时保留区域（访问此分区需要使用特殊的应用权限），用于存储下载的 OTA 更新软件包。其他程序也可使用该空间，但是此类文件可能会随时消失。
安装某些 OTA 软件包可能会导致此分区被完全擦除。cache 分区还包含 OTA 更新的更新日志。

**recovery分区**

包含第二个完整的 Linux 系统，其中包括一个内核和特殊的恢复二进制文件（该文件可读取一个软件包并使用其内容来更新其他分区）。

**misc**

执行恢复操作时使用的微小分区，可在应用 OTA 软件包并重新启动设备时，隐藏某些进程的信息。


## OTA更新过程

1. 设备会与 OTA 服务器进行定期确认，获知是否有更新可用，包括更新软件包的 URL 和向用户显示的描述字符串。
2. 将更新下载到 cache 或 userdata 分区，并根据 /system/etc/security/otacerts.zip 中的证书验证加密签名。系统提示用户安装更新。
3. 设备重新启动进入恢复模式，引导 recovery 分区中的内核和系统（而非 boot 分区中的内核）启动。
4. recovery 分区的二进制文件由 init 启动。它会在 /cache/recovery/command 中寻找将其指向下载软件包的命令行参数。
5. 恢复操作会根据 /res/keys（包含在 recovery 分区中的 RAM 磁盘的一部分）中的公钥来验证软件包的加密签名
6. 从软件包中提取数据，并根据需要使用该数据更新 boot、system 和/或 vendor 分区。system 分区上的某个新文件包含新的 recovery 分区的内容。
7. 设备正常重启。
   a. 加载最新更新的 boot 分区，在最新更新的 system 分区中装载并开始执行二进制文件。
   b. 作为正常启动的一部分，系统会根据所需内容（预先存储为 /system 中的一个文件）检查 recovery 分区的内容。二者内容不同，所以 recovery 分区会被所需内容重新刷写（在后续引导中，recovery 分区已经包含新内容，因此无需重新刷写）。
系统更新完成！更新日志可以在 /cache/recovery/last_log.# 中找到。








