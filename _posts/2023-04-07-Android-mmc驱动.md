---
layout:     post
title:      Android mmc 驱动
subtitle:   allwinner, rockchip
date:       2023-04-07
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - Linux
    - 驱动
---

## 概念

Linux 提供了 MMC 子系统来实现对各种 SD/MMC/EMMC/SDIO 设备访问，MMC 子系统由上到下可以分为三层，MMC/SD card 层，MMC/SD core 层以及 MMC/SD host 层，它们之间的层次关系如下所示。

* MMC/SD card 层负主要是按照 LINUX 块设备驱动程序的框架实现一个卡的块设备驱动。负责块设备请求的处理，以及请求队列的管理。
* MMC/SD core 层负责通信协议的处理，包括 SD/MMC/eMMC/SDIO，为上一层提供具体读写接口，同时为下一层提供 host 端接口。
* MMC/SD host 层是实现对 SD/MMC 控制器相关的操作，直接操作硬件，也是主要实现部分。

## 驱动源码

```txt

longan/kernel/linux-4.9/drivers/mmc$ tree -L 1
.
├── card
├── core
├── host
│   ├── sunxi-mmc.c
├── Kconfig
└── Makefile

```

## 硬件原理图

![a133_emmc](/images/allwinner/a133_emmc.png)

![a133_emmc_2](/images/allwinner/a133_emmc_2.png)

## 驱动配置

**sys_config.fex**

```txt

[card2_boot_para]
card_ctrl       = 2                            // 0：选择卡量产相关的控制器
card_high_speed = 1                            // 速度模式 0 为低速，1 为高速
card_line       = 8                            // 代表卡总线宽度，分别有 1,4,8
sdc_clk         = port:PC5<3><1><3><default>   // sdc clk 的 GPIO 配置
sdc_cmd         = port:PC6<3><1><3><default>   // sdc 命令信号的 GPIO 配置
sdc_d0          = port:PC10<3><1><3><default>  // sdc 卡数据 0 线信号的 GPIO 配置
sdc_d1          = port:PC13<3><1><3><default>
sdc_d2          = port:PC15<3><1><3><default>
sdc_d3          = port:PC8<3><1><3><default>
sdc_d4          = port:PC9<3><1><3><default>
sdc_d5          = port:PC11<3><1><3><default>
sdc_d6          = port:PC14<3><1><3><default>
sdc_d7          = port:PC16<3><1><3><default>
sdc_emmc_rst    = port:PC1<3><1><3><default>   // emmc 复位信号的 GPIO 配置
sdc_ds          = port:PC0<3><2><3><default>   // ds 信号的 GPIO 配置
sdc_tm4_hs200_max_freq = 150
sdc_tm4_hs400_max_freq = 100
sdc_ex_dly_used = 2
sdc_io_1v8	= 1                            // 表示 eMMC IO 电平是 1.8V ，需要根据实际 emmc io 供电配置
sdc_tm4_win_th = 8

```

**GPIO解析**

port:PC     15       <3>      <1>        <3>    <default>

Port:端口+组内序号<功能分配><内部电阻><驱动能力><输出电平>

**board.dts**

```c
	soc@03000000 {

                sdc0: sdmmc@04020000 {            // 通常用作 SD 卡
                        bus-width = <4>;
                        cd-gpios = <&pio PF 6 6 1 3 0xffffffff>;
                        /*non-removable;*/
                        /*broken-cd;*/
                        /*cd-inverted*/
                        /*data3-detect;*/
                        cd-used-24M;
                //      cd-gpios = <&pio PF 6 6 1 3 0xffffffff>;
                        cap-sd-highspeed;
                        sd-uhs-sdr50;
                        sd-uhs-ddr50;
                        sd-uhs-sdr104;
                        no-sdio;
                        no-mmc;
                        sunxi-power-save-mode;
                        /*sunxi-dis-signal-vol-sw;*/
                        max-frequency = <150000000>;
                        ctl-spec-caps = <0x8>;
                        vmmc-supply = <&reg_dcdc1>;
                        vqmmc33sw-supply = <&reg_dcdc1>;
                        vdmmc33sw-supply = <&reg_dcdc1>;
                        vqmmc18sw-supply = <&reg_eldo1>;
                        vdmmc18sw-supply = <&reg_eldo1>;
                        status = "disabled";
                };

		sdc1: sdmmc@04021000 {          // 通常用作 SDIO WIFI
			bus-width = <4>;
			no-mmc;
			no-sd;
			cap-sd-highspeed;
			/*sd-uhs-sdr12*/
			sd-uhs-sdr25;
			sd-uhs-sdr50;
			sd-uhs-ddr50;
			sd-uhs-sdr104;
			sdio-used-1v8;
			/*sunxi-power-save-mode;*/
			/*sunxi-dis-signal-vol-sw;*/
			cap-sdio-irq;
			keep-power-in-suspend;
			ignore-pm-notify;
			max-frequency = <150000000>;
			ctl-spec-caps = <0x8>;
			status = "okay";
		};

		sdc2: sdmmc@04022000 {           // 通常用作 eMMC
			non-removable;           // 不可移除
			bus-width = <8>;         // 线宽
			mmc-ddr-1_8v;
			mmc-hs200-1_8v;
			mmc-hs400-1_8v;
			no-sdio;
			no-sd;
			ctl-spec-caps = <0x308>;
			cap-mmc-highspeed;          // MMC 卡的 High speed
			sunxi-power-save-mode;
			sunxi-dis-signal-vol-sw;
			max-frequency = <100000000>;  // 最大频率
			vmmc-supply = <&reg_dcdc1>;   // 供电电压、工作电压，需要根据实际 pmu 供电方案修改
			/*emmc io vol 3.3v*/
			/*vqmmc-supply = <&reg_aldo1>;*/
			/*emmc io vol 1.8v*/
			vqmmc-supply = <&reg_eldo1>;   // IO 电压，需要根据实际 pmu 供电方案修改
			status = "disabled";
		};
	}
```

## 开机日志

**uboot err说明**

* err 0x00000100 表示 Response timeout
* err 0x00000042 表示 Response CRC error
* err 0x00000080 表示 Data CRC error
* err 0x00000200 表示 Data timeout
* err 0x00002000 表示 Data Start Error
* err 0x00008000 表示 Data End-bit error

**内核错误说明**

* RTO ：Response timeout
* RCE ：Response CRC error
* EBE ：Data End-bit error
* SBE ：Data Start Error
* DCE ：Data CRC error
* DTO ：Data timeout

```txt

************uboot*****************

[167]card no is 2
[169]sdcard 2 line count 8
[171][mmc]: mmc driver ver 2020-05-25 09:40-202007019516
[182][mmc]: Wrong media type 0x0
[185][mmc]: ***Try SD card 2***
[189][mmc]: mmc 2 cmd 8 timeout, err 100       // Response timeout
[193][mmc]: mmc 2 cmd 8 err 100
[196][mmc]: mmc 2 send if cond failed
[201][mmc]: mmc 2 cmd 55 timeout, err 100
[205][mmc]: mmc 2 cmd 55 err 100
[208][mmc]: mmc 2 send app cmd failed
[212][mmc]: ***Try MMC card 2***
[237][mmc]: RMCA OK!
[239][mmc]: bias 4
[241][mmc]: mmc 2 bias 4
[244][mmc]: MMC 5.1
[246][mmc]: HSSDR52/SDR25 8 bit
[249][mmc]: 50000000 Hz
[251][mmc]: 7456 MB
[253][mmc]: ***SD/MMC 2 init OK!!!***            // 初始化成功

[01.446][mmc]: mmc driver ver uboot2018:2020-5-25 9:26:00-2021-09-17 14:45:00
[01.454][mmc]: get sdc_type fail and use default host:tm4.
[01.465][mmc]: SUNXI SDMMC Controller Version:0x50300
[01.490][mmc]: Best spd md: 4-HS400, freq: 3-100000000, Bus width: 8

************kernel*****************

[02.856]Starting kernel ...

[02.858][mmc]: mmc exit start
[02.877][mmc]: mmc 2 exit ok

[    2.541143] sunxi-mmc sdc2: SD/MMC/SDIO Host Controller Driver(v3.46 2020-6-1 11:33-202006021635)
[    2.541230] sunxi-mmc sdc2: ***ctl-spec-caps*** 308
[    2.541916] sunxi-mmc sdc2: No vdmmc regulator found
[    2.541920] sunxi-mmc sdc2: No vd33sw regulator found
[    2.541924] sunxi-mmc sdc2: No vd18sw regulator found
[    2.541928] sunxi-mmc sdc2: No vq33sw regulator found
[    2.541933] sunxi-mmc sdc2: No vq18sw regulator found
[    2.548165] sunxi-mmc sdc2: set host busy
[    2.548243] mmc:failed to get gpios
[    2.548505] sunxi-mmc sdc2: sdc set ios:clk 0Hz bm PP pm UP vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.563319] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm PP pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.579991] sunxi-mmc sdc2: detmode:alway in(non removable)
[    2.580013] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm PP pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.582475] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm PP pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.583550] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm OD pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.583956] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm OD pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.584028] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm OD pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.586512] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm OD pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.604736] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm PP pm ON vdd 22 width 1 timing LEGACY(SDR12) dt B
[    2.617876] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm PP pm ON vdd 22 width 8 timing LEGACY(SDR12) dt B
[    2.619984] sunxi-mmc sdc2: sdc set ios:clk 400000Hz bm PP pm ON vdd 22 width 8 timing MMC-HS200 dt B
[    2.620396] sunxi-mmc sdc2: sdc set ios:clk 100000000Hz bm PP pm ON vdd 22 width 8 timing MMC-HS200 dt B
[    2.620642] sunxi-mmc sdc2: sdc set ios:clk 100000000Hz bm PP pm ON vdd 22 width 8 timing MMC-HS(SDR20) dt B
[    2.620790] sunxi-mmc sdc2: sdc set ios:clk 52000000Hz bm PP pm ON vdd 22 width 8 timing MMC-HS(SDR20) dt B
[    2.621178] sunxi-mmc sdc2: sdc set ios:clk 50000000Hz bm PP pm ON vdd 22 width 8 timing MMC-HS400 dt B
[    2.621338] sunxi-mmc sdc2: sdc set ios:clk 100000000Hz bm PP pm ON vdd 22 width 8 timing MMC-HS400 dt B
[    2.621598] mmc0: new HS400 MMC card at address 0001
[    2.622445] mmcblk0: mmc0:0001 8GTF4R 7.28 GiB             //能正常出现检测到新卡和相应地址以及容量的 log，emmc 的检测成功
[    2.622830] mmcblk0boot0: mmc0:0001 8GTF4R partition 1 4.00 MiB
```

## 调试

/sys/block/mmcblk0/device/

```txt

ceres-c3:/ $ ls -al  /sys/block/mmcblk0/device/
total 0
drwxr-xr-x 4 root root    0 1970-01-01 08:00 .
drwxr-xr-x 4 root root    0 1970-01-01 08:00 ..
drwxr-xr-x 3 root root    0 1970-01-01 08:00 block
-r--r--r-- 1 root root 4096 2023-04-04 19:42 cid        // 获取唯一识别码
-r--r--r-- 1 root root 4096 2023-04-04 19:42 csd
-r--r--r-- 1 root root 4096 2023-04-04 19:42 date       // 获取生产日期
lrwxrwxrwx 1 root root    0 2023-04-04 19:42 driver -> ../../../../../../../bus/mmc/drivers/mmcblk
-r--r--r-- 1 root root 4096 2023-04-04 19:42 dsr
-r--r--r-- 1 root root 4096 2023-04-04 19:42 enhanced_area_offset
-r--r--r-- 1 root root 4096 2023-04-04 19:42 enhanced_area_size
-r--r--r-- 1 root root 4096 2023-04-04 19:42 erase_size
-r--r--r-- 1 root root 4096 2023-04-04 19:42 ffu_capable
-r--r--r-- 1 root root 4096 2023-04-04 19:42 fwrev
-r--r--r-- 1 root root 4096 2023-04-04 19:42 hwrev
-r--r--r-- 1 root root 4096 2023-04-04 19:42 life_time    // 寿命信息
-r--r--r-- 1 root root 4096 2023-04-04 19:42 manfid       // 获取制造商 id
-r--r--r-- 1 root root 4096 2023-04-04 19:42 name         // emmc 名字
-r--r--r-- 1 root root 4096 2023-04-04 19:42 ocr
-r--r--r-- 1 root root 4096 2023-04-04 19:42 oemid
drwxr-xr-x 2 root root    0 1970-01-01 08:00 power
-r--r--r-- 1 root root 4096 2023-04-04 19:42 pre_eol_info
-r--r--r-- 1 root root 4096 2023-04-04 19:42 preferred_erase_size
-r--r--r-- 1 root root 4096 2023-04-04 19:42 prv
-r--r--r-- 1 root root 4096 2023-04-04 19:42 raw_rpmb_size_mult
-r--r--r-- 1 root root 4096 2023-04-04 19:42 rel_sectors
-r--r--r-- 1 root root 4096 2023-04-04 19:42 rev
-r--r--r-- 1 root root 4096 2023-04-04 19:42 serial
lrwxrwxrwx 1 root root    0 1970-01-01 08:00 subsystem -> ../../../../../../../bus/mmc
-r--r--r-- 1 root root 4096 2023-04-04 19:42 type
-rw-r--r-- 1 root root 4096 1970-01-01 08:00 uevent

```

内核查询 mmc 设备属性 /sys/kernel/debug/mmc0/ios


```txt

ceres-c3:/ # cat /sys/kernel/debug/mmc0/ios                                                                                                                                                                                    
clock:		100000000 Hz
vdd:		22 (3.4 ~ 3.5 V)
bus mode:	2 (push-pull)
chip select:	0 (don't care)
power mode:	2 (on)
bus width:	3 (8 bits)
timing spec:	10 (mmc HS400)
signal voltage:	1 (1.80 V)
driver type:	0 (driver type B)

```














