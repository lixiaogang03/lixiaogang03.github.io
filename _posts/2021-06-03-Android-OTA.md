---
layout:     post
title:      Android OTA
subtitle:   over-the-air (OTA)
date:       2021-06-03
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - OTA
---

[OTA更新-AOSP](https://source.android.google.cn/devices/tech/ota?hl=zh-cn)

[Android-RomUpgrade-Github](https://github.com/aystshen/Android-RomUpgrade)

[Android OTA升级流程分析](https://skytoby.github.io/2019/Android%20OTA%E5%8D%87%E7%BA%A7%E6%B5%81%E7%A8%8B%E5%88%86%E6%9E%90/)

## RK3288固件升级

[Firefly-RK3288升级固件](https://wiki.t-firefly.com/zh_CN/Firefly-RK3288/upgrade_firmware.html)

## 差分资源包

**make otapackage**

out/target/product/rk3288/obj/PACKAGING/target_files_intermediates/rk3288-target_files-20210603.114202.zip

用于制作差分升级包

```txt

rk3288-target_files-20210603.114202$ tree -L 2
.
├── BOOT
│   ├── cmdline
│   ├── kernel
│   ├── RAMDISK
│   └── resource.img
├── DATA
│   ├── benchmarktest
│   ├── DATA
│   └── nativetest
├── IMAGES
│   ├── boot.img
│   ├── recovery.img
│   ├── recovery-two-step.img
│   ├── system.img
│   └── system.map
├── META
│   ├── apkcerts.txt
│   ├── boot_filesystem_config.txt
│   ├── file_contexts.bin
│   ├── filesystem_config.txt
│   ├── misc_info.txt
│   ├── otakeys.txt
│   ├── recovery_filesystem_config.txt
│   ├── releasetools.py
│   └── vendor_filesystem_config.txt
├── OTA
│   ├── android-info.txt
│   └── bin
├── RECOVERY
│   ├── cmdline
│   ├── kernel
│   ├── RAMDISK
│   └── resource.img
├── SYSTEM
│   ├── app
│   ├── bin
│   ├── build.prop
│   ├── etc
│   ├── fake-libs
│   ├── fonts
│   ├── framework
│   ├── lib
│   ├── lib64
│   ├── manifest.xml
│   ├── media
│   ├── priv-app
│   ├── recovery-from-boot.p
│   ├── tts
│   ├── usr
│   ├── vendor -> /vendor
│   └── xbin
├── trust.img
├── uboot.img
├── vendor0.img
└── vendor1.img

26 directories, 29 files

```

## OTA全量升级包

**./mkimage.sh ota**

out/target/product/rk3288/rk3288-ota-20210603.114202.zip

```txt

rk3288-ota-20210603.114202$ tree
.
├── boot.img
├── file_contexts.bin
├── META-INF
│   ├── CERT.RSA
│   ├── CERT.SF
│   ├── com
│   │   ├── android
│   │   │   ├── metadata
│   │   │   └── otacert
│   │   └── google
│   │       └── android
│   │           ├── update-binary
│   │           └── updater-script
│   └── MANIFEST.MF
├── system.new.dat
├── system.patch.dat
├── system.transfer.list
├── trust.img
├── uboot.img
├── vendor0.img
└── vendor1.img

5 directories, 16 files

```

## 差分升级包

./build/tools/releasetools/ota_from_target_files -v -i rk3188-target_files-v1.zip -p out/host/linux-x86 -k build/target/product/security/testkey rk3188-target_files-v2.zip out/target/product/rk3188/rk3188-v1-v2.zip

```txt

./build/tools/releasetools/ota_from_target_files -h

Given a target-files zipfile, produces an OTA package that installs
that build.  An incremental OTA is produced if -i is given, otherwise
a full OTA is produced.

Usage:  ota_from_target_files [flags] input_target_files output_ota_package

  -k (--package_key) <key> Key to use to sign the package (default is
      the value of default_system_dev_certificate from the input
      target-files's META/misc_info.txt, or
      "build/target/product/security/testkey" if that value is not
      specified).

      For incremental OTAs, the default value is based on the source
      target-file, not the target build.

  -i  (--incremental_from)  <file>
      Generate an incremental OTA using the given target-files zip as
      the starting build.

  -v  (--verify)
      Remount and verify the checksums of the files written to the
      system and vendor (if used) partitions.  Incremental builds only.

  -w  (--wipe_user_data)
      Generate an OTA package that will wipe the user data partition
      when installed.

  -p  (--path)  <dir>
      Prepend <dir>/bin to the list of places to search for binaries
      run by this script, and expect to find jars in <dir>/framework.

  -v  (--verbose)
      Show command lines being executed.

  -h  (--help)
      Display this usage message and exit.

```

