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

[Android-RomUpgrade-Github](https://github.com/aystshen/Android-RomUpgrade)

[Android OTA升级流程分析](https://skytoby.github.io/2019/Android%20OTA%E5%8D%87%E7%BA%A7%E6%B5%81%E7%A8%8B%E5%88%86%E6%9E%90/)

[ANDROID OTA升级原理和流程分析](https://www.freesion.com/article/20661087901/)

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

![ota_step](/images/android/ota/ota_step.png)

## RecoverySystem

```java

/**
 * RecoverySystem contains methods for interacting with the Android
 * recovery system (the separate partition that can be used to install
 * system updates, wipe user data, etc.)
 */
public class RecoverySystem {

    /**
     * Reboots the device in order to install the given update
     * package.
     * Requires the {@link android.Manifest.permission#REBOOT} permission.
     *
     * @param context      the Context to use
     * @param packageFile  the update package to install.  Must be on
     * a partition mountable by recovery.  (The set of partitions
     * known to recovery may vary from device to device.  Generally,
     * /cache and /data are safe.)
     *
     * @throws IOException  if writing the recovery command file
     * fails, or if the reboot itself fails.
     */
    public static void installPackage(Context context, File packageFile)
        throws IOException {
        String filename = packageFile.getCanonicalPath();
        Log.w(TAG, "!!! REBOOTING TO INSTALL " + filename + " !!!");
        String arg = "--update_package=" + filename +
            "\n--locale=" + Locale.getDefault().toString();
        bootCommand(context, arg);
    }

    /**
     * Reboot into the recovery system with the supplied argument.
     * @param arg to pass to the recovery utility.
     * @throws IOException if something goes wrong.
     */
    private static void bootCommand(Context context, String arg) throws IOException {
        RECOVERY_DIR.mkdirs();  // In case we need it
        COMMAND_FILE.delete();  // In case it's not writable
        LOG_FILE.delete();

        FileWriter command = new FileWriter(COMMAND_FILE);
        try {
            command.write(arg);
            command.write("\n");
        } finally {
            command.close();
        }

        // Having written the command file, go ahead and reboot
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        pm.reboot("recovery");

        throw new IOException("Reboot failed (no permissions?)");
    }

}

```

## Recovery模式

1. adb reboot recovery
2. POWER + (VOL+)

fastboot 与 recovery 区别， fastboot俗称线刷，需要电脑和数据线刷机，recovery俗称卡刷，通过内部存储刷机

## RK3288固件升级

[Firefly-RK3288升级固件](https://wiki.t-firefly.com/zh_CN/Firefly-RK3288/upgrade_firmware.html)

## 差分资源包

**make otapackage**

用于制作差分升级包: out/target/product/rk3288/obj/PACKAGING/target_files_intermediates/rk3288-target_files-20210603.114202.zip

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

./build/tools/releasetools/ota_from_target_files
 -v -i rk3188-target_files-v1.zip
 -p out/host/linux-x86
 -k build/target/product/security/testkey
 rk3188-target_files-v2.zip out/target/product/rk3188/rk3188-v1-v2.zip

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





