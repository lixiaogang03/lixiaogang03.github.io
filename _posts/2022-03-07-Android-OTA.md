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

## releasetools

build/tools/releasetools

```txt

├── add_img_to_target_files -> add_img_to_target_files.py
├── add_img_to_target_files.py
├── blockimgdiff.py
├── blockimgdiff.pyc
├── build_image.py
├── check_target_files_signatures -> check_target_files_signatures.py
├── check_target_files_signatures.py
├── common.py
├── common.pyc
├── edify_generator.py
├── img_from_target_files -> img_from_target_files.py
├── img_from_target_files.py
├── make_recovery_patch -> make_recovery_patch.py
├── make_recovery_patch.py
├── ota_from_target_files -> ota_from_target_files.py
├── ota_from_target_files.py
├── pylintrc
├── rangelib.py
├── rangelib.pyc
├── sign_target_files_apks -> sign_target_files_apks.py
├── sign_target_files_apks.py
├── sparse_img.py
├── sparse_img.pyc
├── target_files_diff.py
├── test_blockimgdiff.py
├── test_common.py
└── test_rangelib.py

```

## 增加OTA校验标识

```py

diff --git a/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/edify_generator.py b/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/edify_generator.py
index efaebce..065c8eb 100755
--- a/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/edify_generator.py
+++ b/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/edify_generator.py
@@ -138,6 +138,16 @@ class EdifyGenerator(object):
                device, common.ErrorCode.DEVICE_MISMATCH, device)
     self.script.append(cmd)
 
+  # add by lixiaogang start
+  def AssertModel(self, device):
+    """Assert that the device identifier is the given string."""
+    cmd = ('getprop("ro.product.model") == "%s" || '
+           'abort("E%d: This package is for \\"%s\\" devices; '
+           'this is a \\"" + getprop("ro.product.model") + "\\".");') % (
+               device, common.ErrorCode.DEVICE_MISMATCH, device)
+    self.script.append(cmd)
+  # add by lixiaogang end
+
   def AssertSomeBootloader(self, *bootloaders):
     """Asert that the bootloader version is one of *bootloaders."""
     cmd = ("assert(" +
diff --git a/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/ota_from_target_files.py b/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/ota_from_target_files.py
index e88fa7d..2c87647 100755
--- a/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/ota_from_target_files.py
+++ b/rk3288_android7.1_tablet_v1.01_20170630/build/tools/releasetools/ota_from_target_files.py
@@ -456,6 +456,12 @@ def AppendAssertions(script, info_dict, oem_dict=None):
   if oem_props is None or len(oem_props) == 0:
     device = GetBuildProp("ro.product.device", info_dict)
     script.AssertDevice(device)
+
+    # add by lixiaogang start
+    model = GetBuildProp("ro.product.model", info_dict)
+    script.AssertModel(model)
+    # add by lixiaogang end
+
   else:
     if oem_dict is None:
       raise common.ExternalError(
@@ -593,6 +599,10 @@ def WriteFullOTAPackage(input_zip, output_zip):
       "pre-device": GetOemProperty("ro.product.device", oem_props, oem_dict,
                                    OPTIONS.info_dict),
       "post-timestamp": GetBuildProp("ro.build.date.utc", OPTIONS.info_dict),
+
+      # add by lixiaogang start
+      "model": GetBuildProp("ro.product.model", OPTIONS.info_dict),
+      # add by lixiaogang end
   }

```



