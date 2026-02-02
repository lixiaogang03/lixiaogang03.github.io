---
layout:     post
title:      Buildroot swupdate
subtitle:   OTA 升级
date:       2023-12-02
author:     LXG
header-img: img/post-bg-alibaba.jpg
catalog: true
tags:
    - Linux
---

[全志Linux Tina-SDK开发完全手册](https://tina.100ask.net/SdkModule/Linux_OTA_DevelopmentGuide-01/#13)

## swupdate

SWUpdate提供了一种可靠的方式来更新 嵌入式系统上的软件。 源代码托管在https://github.com/sbabic/swupdate

## T113 源码

```txt

t113_linux/buildroot/buildroot-201902/package/swupdate$ tree
.
├── 0001-Makefile-fix-static-build.patch
├── 0002-Support-ext4-write.patch
├── 0003-Add-ota-burnboot-lib.patch
├── Config.in
├── swupdate_cmd.sh
├── swupdate.config
├── swupdate.hash
└── swupdate.mk


t113_linux/buildroot/buildroot-201902/dl/swupdate$ tree -L 2
.
├── swupdate-2018.11
│   ├── bindings
│   ├── bootloader
│   ├── configs
│   ├── COPYING
│   ├── core
│   ├── corelib
│   ├── debian
│   ├── doc
│   ├── examples
│   ├── handlers
│   ├── include
│   ├── ipc
│   ├── Kconfig
│   ├── Licenses
│   ├── Makefile
│   ├── Makefile.deps
│   ├── Makefile.flags
│   ├── Makefile.help
│   ├── mongoose
│   ├── parser
│   ├── README.md
│   ├── scripts
│   ├── suricatta
│   ├── SWUpdate.svg
│   ├── tools
│   ├── web-app
│   └── www
└── swupdate-2018.11.tar.gz

```

## recovery OTA 升级方案

recovery 系统方案，是在主系统之外，增加一个recovery 系统。升级时，主系统负责升级recovery系统，recovery 系统负责升级主系统。
这样如果升级中途发生掉电，也不会影响当前正在使用的这个系统。重启后仍可正常进入系统，继续完成升级。
一般recovery 系统会使用intiramfs 功能，并大量裁剪不必要的应用，只保留OTA 必需的功能，把size 尽量减小。

recovery 系统方案优点：recovery 系统可以做得比较小，省flash 空间。

recovery 系统方案缺点：
1. recovery 系统一般不包含主应用，所以OTA 期间，处于recovery 系统中时，无法为用户正常提供服务。
2. 需要重启两次。
3. 需要维护两份系统配置，即主系统和recovery 系统。

## AB OTA 升级方案

AB 系统方案，是将原有的系统，增加一份。即flash 上总共有AB 两套系统。两套系统互相升级。OTA 时，若当前运行的是A 系统，则升级B 系统，升级完成后，
设置标志，重启切换到B系统。OTA 时，若当前运行的是B 系统，则升级A 系统，升级完成后，设置标志，重启切换到A 系统。

AB 系统方案优点：

1. 更新过程是在完整系统中进行的，更新期间可正常提供服务，用户无感知。最终做一次重启即可。
2. 逻辑简单，只重启一次。
3. 只维护一套系统配置。

AB 系统方案缺点：flash 占用较大。

## OTA 升级步骤

OTA升级流程可分为以下四步：
1. 配置OTA 策略描述文件
2. 配置OTA包配置文件
3. 生成OTA包
4. 执行升级命令

### 配置OTA 策略描述文件

OTA策略描述文件是 sw-description 文件，位于device/config/chips/t113_i/configs/evb1_auto/longan。
以t113-i linux5.4升级rootfs为例，升级uboot的配置类似。
配置文件可参考T113 SDK自带的sw-description-ab文件，具体语法可参考 swup-date官方文档，链接：http://sbabic.github.io/swupdate。

本次OTA升级的策略描述文件内容如下所示

./device/config/chips/t113/configs/evb1_auto/longan/sw-description-ab

```sh

software =
{
    version = "0.1.0";
    description = "Firmware update for T113 Project";

    stable = {

        /* now in systemA, we need to upgrade systemB(bootB, rootfsB, dspxB) */
        now_A_next_B = {
            images: (
                {
                    filename = "kernel";
                    device = "/dev/mmcblk0p5";
                    installed-directly = true;
                },
                {
                    filename = "rootfs";
                    device = "/dev/mmcblk0p7";
                    installed-directly = true;
                }/*,
                {
                    filename = "uboot";
                    type = "awuboot";
                },
                {
                    filename = "boot0";
                    type = "awboot0";
                }*/
            );
            bootenv: (
                {
                    name = "swu_mode";
                    value = "";
                },
                {
                    name = "boot_partition";
                    value = "bootB";
                },
                {
                    name = "root_partition";
                    value = "rootfsB";
                },
                {
                    name = "swu_next";
                    value = "reboot";
                }
            );
        };

        /* now in systemB, we need to upgrade systemA(bootA, rootfsA, dspxA) */
        now_B_next_A = {
            images: (
                {
                    filename = "kernel";
                    device = "/dev/mmcblk0p4";
                    installed-directly = true;
                },
                {
                    filename = "rootfs";
                    device = "/dev/mmcblk0p6";
                    installed-directly = true;
                }/*,
                {
                    filename = "uboot";
                    type = "awuboot";
                },
                {
                    filename = "boot0";
                    type = "awboot0";
                }*/
            );
            bootenv: (
                {
                    name = "swu_mode";
                    value = "";
                },
                {
                    name = "boot_partition";
                    value = "bootA";
                },
                {
                    name = "root_partition";
                    value = "rootfsA";
                },
                {
                    name = "swu_next";
                    value = "reboot";
                }
            );
        };


    };

    /* when not call with -e xxx,xxx    just clean */
    bootenv: (
        {
            name = "swu_param";
            value = "";
        },
        {
            name = "swu_software";
            value = "";
        },
        {
            name = "swu_mode";
            value = "";
        },
        {
            name = "swu_version";
            value = "";
        }
    );

}

```

其中，/dev/mmcblk05是rootfs所在的分区，可通过cat proc/cmdline查看。

```txt

sh-4.4# cat proc/cmdline 
earlycon=uart8250,mmio32,0x05000000 clk_ignore_unused initcall_debug=0 console=ttyS0,115200 loglevel=8 root=/dev/mmcblk0p5 init=/init partitions=boot-resource@mmcblk0p1:env@mmcblk0p2:env-redund@mmcblk0p3:boot@mmcblk0p4:rootfs@mmcblk0p5:dsp0@mmcblk0p6:private@mmcblk0p7:UDISK@mmcblk0p8 cma=16M snum= mac_addr= wifi_mac= bt_mac= specialstr= gpt=1 androidboot.hardware=sun8iw20p1 boot_type=2 androidboot.boot_type=2 gpt=1 uboot_message=2018.05(11/30/2023-03:08:02) disp_reserve=4096000,0x448ec000 androidboot.dramsize=128

```

## 配置OTA包配置文件

OTA包配置文件sw-subimg.cfg也位于device/config/chips/t113_i/configs/evb1_auto/longan。同样地，这里只配置rootfs，用户可根据实际情况配置uboot、dsp0等。sw-subimg.cfg配置内容如下所示。

```txt

device/config/chips/t113/configs/evb1_auto/longan$ cat sw-subimgs-ab.cfg
swota_file_list=(
${LICHEE_BOARD_CONFIG_DIR}/${LICHEE_LINUX_DEV}/sw-description-ab:sw-description
#out/${TARGET_BOARD}/boot_initramfs_recovery.img:recovery
#${LICHEE_PACK_OUT_DIR}/u-boot.fex:uboot
#${LICHEE_PACK_OUT_DIR}/boot0_sdcard.fex:boot0
${LICHEE_PLAT_OUT}/boot.img:kernel
${LICHEE_PLAT_OUT}/rootfs.ext4:rootfs
#out/${TARGET_BOARD}/image/dsp0.fex:dsp0
#out/${TARGET_BOARD}/image/dsp1.fex:dsp1
#out/${TARGET_BOARD}/usr.img:usr
)

```

### 编译生成OTA包

```txt

lxg@lxg:~/code/t113_linux$ swupdate_pack_swu
####/home/lxg/code/t113_linux/device/config/chips/t113/configs/evb1_auto/longan/sw-subimgs.cfg####
/home/lxg/code/t113_linux/device/config/chips/t113/configs/evb1_auto/longan/sw-description-ab:sw-description
/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/boot.img:kernel
/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/rootfs.ext4:rootfs

-------------------- config --------------------
subimgs config by: /home/lxg/code/t113_linux/device/config/chips/t113/configs/evb1_auto/longan/sw-subimgs.cfg
out dir: /home/lxg/code/t113_linux/out/t113/evb1_auto/longan/swupdate
-------------------- do copy --------------------
-------------------- do sha256 --------------------
-------------------- do md5sum --------------------
5495ce254152ccfcf933384e02a41de6  sw-description
c41149215c6dc3f222c22c4b0a54c5d1  kernel
f4a74a502df11f95b4604223f863f383  rootfs
-------------------- do cpio --------------------
sw-description
kernel
rootfs
cpio_item_md5
767537 块
-------------------- out file in --------------------


/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/swupdate/t113_evb1_auto.swu

375M	/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/swupdate/t113_evb1_auto.swu

```

### 执行升级命令

将OTA包t113_evb1_auto.swu拷贝开发板/mnt目录，执行命令swupdate，完成升级。

```txt

# swupdate -v -i /mnt/t113_evb1_auto.swu -e stable,now_A_next_B
Swupdate v2018.11.0
……
Software updated successfully
Please reboot the device to start the new software
[INFO ] : SWUPDATE successful

```

### U盘升级

swupdate -v -i /mnt/usb/sda1/t113_evb1_auto.swu -e stable,now_A_next_B

```txt

sh-4.4# swupdate -v -i /mnt/usb/sda1/t113_evb1_auto.swu -e stable,now_A_next_B
Swupdate v2018.11.0

Licensed under GPLv2. See source distribution for detailed copyright notices.

Registered handlers:
	dummy
	awuboot
	awboot0
	uboot
	bootloader
	raw
	rawfile
	ubivol
	ubipartition
software set: stable mode: now_A_next_B
[TRACE] : SWUPDATE running :  [network_initializer] : Main loop Daemon
[TRACE] : SWUPDATE running :  [listener_create] : creating socket at /tmp/swupdateprog
[TRACE] : SWUPDATE running :  [listener_create] : creating socket at /tmp/sockinstctrl
[TRACE] : SWUPDATE running :  [extract_sw_description] : Found file:
	filename sw-description
	size 2966
	checksum 0x27a1e VERIFIED
[TRACE] : SWUPDATE running :  [get_common_fields] : Version 0.1.0
[TRACE] : SWUPDATE running :  [get_common_fields] : Description Firmware update for T113 Project
[TRACE] : SWUPDATE running :  [parse_images] : Found Image: rootfs in device : /dev/mmcblk0p7 for handler raw (installed from stream)
[TRACE] : SWUPDATE running :  [parse_images] : Found Image: kernel in device : /dev/mmcblk0p5 for handler raw (installed from stream)
[TRACE] : SWUPDATE running :  [parse_bootloader] : Bootloader var: swu_next = reboot
[TRACE] : SWUPDATE running :  [parse_bootloader] : Bootloader var: root_partition = rootfsB
[TRACE] : SWUPDATE running :  [parse_bootloader] : Bootloader var: boot_partition = bootB
[WARN ] : SWUPDATE running :  [check_field_string] : Configuration Key is empty!
[TRACE] : SWUPDATE running :  [parse_bootloader] : Bootloader var: swu_mode = 
[TRACE] : SWUPDATE running :  [cpio_scan] : Found file:
	filename kernel
	size 18855936
	REQUIRED
[TRACE] : SWUPDATE running :  [cpio_scan] : Found file:
	filename rootfs
	size 374076168
	REQUIRED
[TRACE] : SWUPDATE running :  [cpio_scan] : Found file:
	filename cpio_item_md5
	size 131
	not required
[TRACE] : SWUPDATE running :  [install_single_image] : Found installer for stream kernel raw
[TRACE] : SWUPDATE running :  [install_single_image] : Found installer for stream rootfs raw
[TRACE] : SWUPDATE running :  [install_raw_image] : six -- find [rootfs] to use 
Software updated successfully
Please reboot the device to start the new software
[INFO ] : SWUPDATE successful !

```











