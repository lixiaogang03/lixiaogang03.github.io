---
layout:     post
title:      Android OTA
subtitle:   Recovery
date:       2022-03-07
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - ota
---

## update.zip

```txt
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

## updater-script

updater-script：此脚本文件具体描述了更新过程，可根据需要进行客制化
update-binary：此文件是脚本解释器，负责解析updater-script中的操作

```txt

(!less_than_int(1646637040, getprop("ro.build.date.utc"))) || abort("E3003: Can't install this package (2022年 03月 07日 星期一 15:10:40 CST) over newer build (" + getprop("ro.build.date") + ").");
getprop("ro.product.device") == "rk3288" || abort("E3004: This package is for \"rk3288\" devices; this is a \"" + getprop("ro.product.device") + "\".");
getprop("ro.product.model") == "R01F11" || abort("E3004: This package is for \"R01F11\" devices; this is a \"" + getprop("ro.product.model") + "\".");
ui_print("Target: WIF/rk3288/rk3288:7.1.2/NHG47K/20220307.151040:userdebug/release-keys");
show_progress(0.750000, 0);
ui_print("Patching system image unconditionally...");
block_image_update("/dev/block/rknand_system", package_extract_file("system.transfer.list"), "system.new.dat", "system.patch.dat") ||
  abort("E1001: Failed to update system image.");
show_progress(0.050000, 5);
write_raw_image(package_extract_file("boot.img"), "boot");
show_progress(0.200000, 10);
ui_print("Writing trust img...");
write_raw_image(package_extract_file("trust.img"), "trust");
ui_print("Writing uboot loader img...");
write_raw_image(package_extract_file("uboot.img"), "uboot");
ui_print("Writing vendor1 img...");
write_raw_sparse_image("vendor1", "vendor1.img") || abort("update vendor1.img failed.");
ui_print("Writing vendor0 img...");
write_raw_sparse_image("vendor0", "vendor0.img") || abort("update vendor0.img failed.");
set_progress(1.000000);

```

## metadata

此文件描述设备信息和环境变量的元数据

```txt

model=R01F11
ota-required-cache=0
ota-type=BLOCK
post-build=WIF/rk3288/rk3288:7.1.2/NHG47K/20220307.151040:userdebug/release-keys
post-timestamp=1646637040
pre-device=rk3288

```



