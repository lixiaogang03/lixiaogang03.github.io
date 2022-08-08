---
layout:     post
title:      Android WIFI 驱动移植
subtitle:   Realtek 8723ds
date:       2022-08-08
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Realtek
---

[intgyl.com-wifi](https://intgyl.com/categories/Linux/rockchip/wifi/)

## 概念

**STA 模式 和 AP 模式**

AP模式: Access Point，提供无线接入服务，允许其它无线设备接入，提供数据访问，一般的无线路由/网桥工作在该模式下。AP和AP之间允许相互连接。
Sta模式: Station, 类似于无线终端，sta本身并不接受无线的接入，它可以连接到AP，一般无线网卡即工作在该模式。

**SD 和 MMC**

SD (Secure Digital) 与 MMC (Multimedia Card)
MMC 是较早的一种记忆卡标准，目前已经被 SD 标准取代。
SD 是一种 flash memory card 的标准,也就是一般常见的 SD 记忆卡。

**SDIO（Secure Digital I/O）**

SDIO 就是 SD 的 I/O 接口的意思。更具体的说，SD 本来是记忆卡的标准,但是现在也可以把 SD 拿来插上一些外围接口使用,这样的技术便是 SDIO。

SDIO 通过 SD 的 I/O 管脚来连接外部的外围 device 并传输数据。这些外围设备，我们称为 SDIO 卡，常见的有：

* Wi-Fi card(无线网络卡)
* CMOS sensor card(照相模块)
* GPS card
* GSM/GPRS modem card
* Bluetooth card
* Radio/TV card

**SDIO 卡 和 SD 卡 的区别**

SD卡使用的是SD卡协议，而SDIO卡使用的是SDIO协议！协议不一样，初始化/读写方式也不一样！

**SDIO-Wifi 模块**

SDIO-Wifi 模块是基于 SDIO 接口的符合 wifi 无线网络标准的嵌入式模块，内置无线网络协议IEEE802.11协议栈以及TCP/IP协议栈，能够实现用户主平台数据通过SDIO口到无线网络之间的转换。
SDIO 具有传输数据快，兼容SD、MMC接口等特点。

对于SDIO接口的wifi，首先，它是一个sdio的卡的设备，然后具备了wifi的功能。所以，注册的时候还是先以sdio的卡的设备去注册的。然后检测到卡之后就要驱动他的wifi功能。

**SDIO 总线**

SDIO总线 和 USB总线 类似，SDIO也有两端，其中一端是HOST端，另一端是device端。所有的通信都是由HOST端 发送 命令 开始的，Device端只要能解析命令，就可以相互通信。
CLK信号：HOST给DEVICE的 时钟信号，每个时钟周期传输一个命令。
CMD信号：双向 的信号，用于传送 命令 和 反应。
DAT0-DAT3 信号：四条用于传送的数据线。
VDD信号：电源信号。
VSS1，VSS2：电源地信号。

**SDIO 命令**
SDIO总线上都是HOST端发起请求，然后DEVICE端回应请求。
SDIO 命令由6个字节组成。

a – Command:用于开始传输的命令，是由HOST端发往DEVICE端的。其中命令是通过CMD信号线传送的。
b – Response:回应是DEVICE返回的HOST的命令，作为Command的回应。也是通过CMD线传送的。
c – Data:数据是双向的传送的。可以设置为1线模式，也可以设置为4线模式。数据是通过DAT0-DAT3信号线传输的。

SDIO的每次操作都是由HOST在CMD线上发起一个CMD，对于有的CMD，DEVICE需要返回Response，有的则不需要。
对于读命令，首先HOST会向DEVICE发送命令，紧接着DEVICE会返回一个握手信号，此时，当HOST收到回应的握手信号后，会将数据放在4位的数据线上，在传送数据的同时会跟随着CRC校验码。当整个读传送完毕后，HOST会再次发送一个命令，通知DEVICE操作完毕，DEVICE同时会返回一个响应。
对于写命令，首先HOST会向DEVICE发送命令，紧接着DEVICE会返回一个握手信号，此时，当HOST收到回应的握手信号后，会将数据放在4位的数据线上，在传送数据的同时会跟随着CRC校验码。当整个写传送完毕后，HOST会再次发送一个命令，通知DEVICE操作完毕，DEVICE同时会返回一个响应。

## WIFI 模块解析和启动流程

![wifi_driver](/images/driver/wifi_driver.jpg)

## SDIO 接口驱动

SDIO 接口的 wifi，首先，它是一个 sdio 卡 设备，然后具备了 wifi 的功能，所以 SDIO 接口的 WiFi 驱动就是在 wifi 驱动 外面套上了一个 SDIO 驱动 的外壳。

SDIO 驱动部分代码: kernel/linux-4.9/drivers/mmc

## WIFI联网的步骤

1. 加载驱动
2. 扫卡
3. 下载firmware
4. 起wlan0网卡
5. 起wpa_supplicant服务
6. WifiManager联网

## 全志 A133 日志

```txt

[    1.509128] sunxi-bt soc@03000000:bt@0: bt_power_name (axp803-dldo1)
[    1.516293] sunxi-bt soc@03000000:bt@0: Missing bt_io_regulator.
[    1.523061] sunxi-bt soc@03000000:bt@0: io_regulator_name ((null))
[    1.530078] sunxi-bt soc@03000000:bt@0: bt_rst gpio=356  mul-sel=1  pull=-1  drv_level=-1  data=0
[    1.540124] sunxi-bt soc@03000000:bt@0: clk not config
[    1.545921] sunxi-bt soc@03000000:bt@0: dcxo not config
[    1.551814] sunxi-bt soc@03000000:bt@0: devm_pinctrl_get() failed!
[    1.559467] sunxi-wlan soc@03000000:wlan@0: wlan_busnum (1)
[    1.565754] sunxi-wlan soc@03000000:wlan@0: wlan_power_name (axp803-dldo1)
[    1.573505] sunxi-wlan soc@03000000:wlan@0: Missing wlan_io_regulator.
[    1.580858] sunxi-wlan soc@03000000:wlan@0: io_regulator_name ((null))
[    1.588255] sunxi-wlan soc@03000000:wlan@0: wlan_regon gpio=359  mul-sel=1  pull=-1  drv_level=-1  data=0
[    1.599045] sunxi-wlan soc@03000000:wlan@0: get gpio chip_en failed
[    1.606125] sunxi-wlan soc@03000000:wlan@0: power_en gpio=361  mul-sel=1  pull=-1  drv_level=-1  data=0
[    1.616726] sunxi-wlan soc@03000000:wlan@0: wlan_hostwake gpio=360  mul-sel=6  pull=-1  drv_level=-1  data=0
[    1.627914] sunxi-wlan soc@03000000:wlan@0: dcxo not config
[    1.634202] sunxi-wlan soc@03000000:wlan@0: devm_pinctrl_get() failed!


[    7.845837] aicbsp_init
[    7.848777] aicbsp_init, Driver Release Tag: aic-bsp-sdio-20220429-002
[    7.861291] -->aicbt_rfkill_init
[    7.867558] <--aicbt_rfkill_init
[    7.891805] read descriptors
[    7.893843] [BT_LPM] bluesleep_init: BlueSleep Mode Driver Ver 1.3.3
[    7.893847] [BT_LPM] bluesleep_init: Driver Release Tag: aic-btlpm-20220429
[    7.894439] [BT_LPM] bluesleep_probe: bt_hostwake gpio=357 assert=1
[    7.894439] 
[    7.894535] [BT_LPM] bluesleep_probe: bt_wake gpio=358 assert=1
[    7.894535] 
[    7.894547] [BT_LPM] bluesleep_probe: uart_index (1)


[   71.436318] Driver Release Tag: aic-rwnx-sdio-20220606-005-6.4.3.0
[   71.443295] aicbsp: aicbsp_set_subsys, subsys: AIC_WIFI, state to: 1
[   71.450551] aicbsp: aicbsp_set_subsys, power state change to 1 dure to AIC_WIFI
[   71.458813] aicbsp: aicbsp_platform_power_on
[   71.463701] sunxi-wlan soc@03000000:wlan@0: bus_index: 1
[   71.472489] sunxi-wlan soc@03000000:wlan@0: check wlan wlan_power voltage: 1800000


[   71.890375] aicbsp: aicbsp_sdio_probe:1
[   71.895467] aicbsp: aicbsp_sdio_probe:2
[   71.900006] aicbsp: aicbsp_sdio_probe after replace:1
[   71.906266] sunxi-mmc sdc1: sdc set ios:clk 70000000Hz bm PP pm ON vdd 21 width 4 timing LEGACY(SDR12) dt B
[   71.917906] aicbsp: Set SDIO Clock 66 MHz
[   71.926436] aicbsp: aicbsp_driver_fw_init, chip rev: 7
[   71.935383] rwnx_request_firmware, name: fw_adid_u03.bin
[   71.945421] rwnx_request_firmware, name: fw_patch_u03.bin
[   71.964714] rwnx_request_firmware, name: fw_patch_table_u03.bin
[   71.990515] aicbt_patch_table_load bt uart baud: 1500000, flowctrl: 1, lpm_enable: 1, tx_pwr: 24608
[   72.015835] aicbsp: bt patch version: - Jun 20 2022 18:17:55 - git 05db3e7
[   72.026242] rwnx_request_firmware, name: fmacfw.bin
[   72.098730] aicbsp: crypto data A76055DAB286D886A5CB46011A942652
[   72.105585] aicbsp: verify data 8D0B3699065740C4338BBD4EF191F7DF
[   72.113366] aicsdio: aicwf_sdio_probe:1
[   72.117858] sunxi-mmc sdc1: sdc set ios:clk 70000000Hz bm PP pm ON vdd 21 width 4 timing LEGACY(SDR12) dt B
[   72.128949] aicsdio: Set SDIO Clock 66 MHz
[   72.139058] aicbsp: aicbsp_resv_mem_alloc_skb, alloc resv_mem_txdata succuss, id: 0, size: 98304
[   72.144136] aicbsp: sdio_err:<aicwf_sdio_bus_pwrctl,1029>: bus down
[   72.156578] >>> rwnx_platform_init()
[   72.160642] >>> rwnx_cfg80211_init()
[   72.165360] >>> rwnx_init_aic()
[   72.169138] >>> rwnx_cmd_mgr_init()
[   72.174564] is 5g support = 1, vendor_info = 0x21
[   72.180303] Firmware Version: di Jun 20 2022 14:13:38 - g93895adfm>>> rwnx_platform_on()
[   72.190446] >>> rwnx_plat_fmac_load()
[   72.196149] userconfig file path:aic_userconfig.txt 


```































