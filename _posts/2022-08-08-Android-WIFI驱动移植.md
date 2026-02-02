---
layout:     post
title:      Android WIFI 驱动移植
subtitle:   Realtek 8723ds
date:       2022-08-08
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
    - 驱动
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

## 全志 A133 RTL8723DS模组

```txt

[    1.504618] sunxi-bt soc@03000000:bt@0: bt_power_name (axp803-dldo1)
[    1.511789] sunxi-bt soc@03000000:bt@0: Missing bt_io_regulator.
[    1.518573] sunxi-bt soc@03000000:bt@0: io_regulator_name ((null))
[    1.525589] sunxi-bt soc@03000000:bt@0: bt_rst gpio=356  mul-sel=1  pull=-1  drv_level=-1  data=0
[    1.535646] sunxi-bt soc@03000000:bt@0: clk not config
[    1.541444] sunxi-bt soc@03000000:bt@0: dcxo not config
[    1.547337] sunxi-bt soc@03000000:bt@0: devm_pinctrl_get() failed!
[    1.555008] sunxi-wlan soc@03000000:wlan@0: wlan_busnum (1)
[    1.561295] sunxi-wlan soc@03000000:wlan@0: wlan_power_name (axp803-dldo1)
[    1.569057] sunxi-wlan soc@03000000:wlan@0: Missing wlan_io_regulator.
[    1.576411] sunxi-wlan soc@03000000:wlan@0: io_regulator_name ((null))
[    1.583833] sunxi-wlan soc@03000000:wlan@0: wlan_regon gpio=359  mul-sel=1  pull=-1  drv_level=-1  data=0
[    1.594624] sunxi-wlan soc@03000000:wlan@0: get gpio chip_en failed
[    1.601711] sunxi-wlan soc@03000000:wlan@0: power_en gpio=361  mul-sel=1  pull=-1  drv_level=-1  data=0
[    1.612313] sunxi-wlan soc@03000000:wlan@0: wlan_hostwake gpio=360  mul-sel=6  pull=-1  drv_level=-1  data=0
[    1.623502] sunxi-wlan soc@03000000:wlan@0: dcxo not config
[    1.629794] sunxi-wlan soc@03000000:wlan@0: devm_pinctrl_get() failed!

[    3.561933] Kernel init done

[    7.015101] file system registered

[    9.706292] insmod_device_driver

[   16.479806] init: Received control message 'interface_start' for 'android.hardware.wifi@1.0::IWifi/default' from pid: 1636 (/system/bin/hwservicemanager)
[   16.497420] init: starting service 'vendor.wifi_hal_legacy'...
[   16.507881] init: Received control message 'interface_start' for 'android.hardware.wifi@1.0::IWifi/default' from pid: 1636 (/system/bin/hwservicemanager)

[   17.602537] RTW: module init start
[   17.616382] RTW: rtl8723ds v5.6.5_31752.20181221_COEX20181130-2e2e
[   17.631726] RTW: build time: Aug  9 2022 11:10:27
[   17.645516] RTW: rtl8723ds BT-Coex version = COEX20181130-2e2e
[   17.665034] sunxi-wlan soc@03000000:wlan@0: check wlan wlan_power voltage: 1800000
[   17.832966] sunxi-wlan soc@03000000:wlan@0: bus_index: 1
[   17.839387] sunxi-mmc sdc1: sdc set ios:clk 0Hz bm PP pm UP vdd 21 width 1 timing LEGACY(SDR12) dt B
[   17.863133] sunxi-mmc sdc1: no vqmmc,Check if there is regulator
[   17.865878] RTW: module init ret=0
[   17.944519] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing LEGACY(SDR12) dt B
[   18.007729] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing LEGACY(SDR12) dt B
[   18.034160] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing LEGACY(SDR12) dt B
[   18.061153] sunxi-mmc sdc1: card claims to support voltages below defined range
[   18.094393] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing SD-HS(SDR25) dt B
[   18.114302] sunxi-mmc sdc1: sdc set ios:clk 50000000Hz bm PP pm ON vdd 21 width 1 timing SD-HS(SDR25) dt B
[   18.154010] sunxi-mmc sdc1: sdc set ios:clk 50000000Hz bm PP pm ON vdd 21 width 4 timing SD-HS(SDR25) dt B
[   18.203734] mmc1: new high speed SDIO card at address 0001
[   18.272673] RTW: == SDIO Card Info ==
[   18.283460] RTW:   clock: 50000000 Hz
[   18.296784] RTW:   timing spec: sd high-speed
[   18.303252] RTW:   sd3_bus_mode: FALSE
[   18.311907] RTW: ================
[   18.398583] RTW: HW EFUSE
[   18.402384] RTW: 0x000: 29 81 00 7C  E1 88 07 00  A0 04 EC 35  12 
[   18.411137] init: Received control message 'interface_start' for 'android.hardware.wifi.supplicant@1.0::ISupplicant/default' from pid: 1636 (/system/bin/hwservicemanager)
[   18.412796] init: starting service 'wpa_supplicant'...
[   18.419019] init: Created socket '/dev/socket/wpa_wlan0', mode 660, user 1010, group 1010
[   20.400858] RTW: rtw_regsty_chk_target_tx_power_valid return _FALSE for band:0, path:0, rs:0, t:-1
[   20.424142] RTW: rtw_ndev_init(wlan0) if1 mac_addr=30:7b:c9:4a:12:7a
[   20.461366] RTW: rtw_ndev_init(p2p0) if2 mac_addr=32:7b:c9:4a:12:7a


```

## 属性

```txt

[init.svc.vendor.wifi_hal_legacy]: [running]
[init.svc.wificond]: [running]
[ro.boottime.vendor.wifi_hal_legacy]: [13781179448]
[ro.boottime.wificond]: [6523056927]
[ro.wifi.channels]: []
[sys.wifitracing.started]: [1]
[wifi.active.interface]: [wlan0]
[wifi.direct.interface]: [p2p0]
[wifi.interface]: [wlan0]

[persist.vendor.wlan_vendor]: [realtek]
[vendor.wlan.driver.version]: [v5.6.5_31752.20181221_COEX20181130-2e2e]
[vendor.wlan.firmware.version]: [v47.0]
[wifi.active.interface]: [wlan0]
[wifi.interface]: [wlan0]
[wlan.driver.status]: [ok]

```

## WIFI 驱动加载过程

**hardware/interfaces/wifi/1.3/default/android.hardware.wifi@1.0-service-lazy.rc**
vendor/etc/init/android.hardware.wifi@1.0-service-lazy.rc

```rc

service vendor.wifi_hal_legacy /vendor/bin/hw/android.hardware.wifi@1.0-service-lazy
    interface android.hardware.wifi@1.0::IWifi default
    oneshot
    disabled
    class hal
    capabilities NET_ADMIN NET_RAW SYS_MODULE
    user wifi
    group wifi gps

```

**./hardware/interfaces/wifi/1.3/default/Android.mk**


```mk

###
### android.hardware.wifi daemon
###
include $(CLEAR_VARS)
LOCAL_MODULE := android.hardware.wifi@1.0-service-lazy
LOCAL_OVERRIDES_MODULES := android.hardware.wifi@1.0-service
LOCAL_CFLAGS := -DLAZY_SERVICE
LOCAL_MODULE_RELATIVE_PATH := hw
LOCAL_PROPRIETARY_MODULE := true
LOCAL_CPPFLAGS := -Wall -Werror -Wextra
LOCAL_SRC_FILES := \
    service.cpp
LOCAL_SHARED_LIBRARIES := \
    libbase \
    libcutils \
    libhidlbase \
    libhidltransport \
    liblog \
    libnl \
    libutils \
    libwifi-hal \
    libwifi-system-iface \
    android.hardware.wifi@1.0 \
    android.hardware.wifi@1.1 \
    android.hardware.wifi@1.2 \
    android.hardware.wifi@1.3
LOCAL_STATIC_LIBRARIES := \
    android.hardware.wifi@1.0-service-lib
LOCAL_INIT_RC := android.hardware.wifi@1.0-service-lazy.rc
include $(BUILD_EXECUTABLE)

```

**./hardware/interfaces/wifi/1.3/default/service.cpp**

```cpp

int main(int /*argc*/, char** argv) {
    android::base::InitLogging(
        argv, android::base::LogdLogger(android::base::SYSTEM));
    LOG(INFO) << "Wifi Hal is booting up...";

    configureRpcThreadpool(1, true /* callerWillJoin */);

    const auto iface_tool =
        std::make_shared<android::wifi_system::InterfaceTool>();
    // Setup hwbinder service
    android::sp<android::hardware::wifi::V1_3::IWifi> service =
        new android::hardware::wifi::V1_3::implementation::Wifi(
            iface_tool, std::make_shared<WifiLegacyHal>(iface_tool),
            std::make_shared<WifiModeController>(),
            std::make_shared<WifiIfaceUtil>(iface_tool),
            std::make_shared<WifiFeatureFlags>());
    if (kLazyService) {
        LazyServiceRegistrar registrar;
        CHECK_EQ(registrar.registerService(service), android::NO_ERROR)
            << "Failed to register wifi HAL";
    } else {
        CHECK_EQ(service->registerAsService(), android::NO_ERROR)
            << "Failed to register wifi HAL";
    }

    joinRpcThreadpool();

    LOG(INFO) << "Wifi Hal is terminating...";
    return 0;
}

```

**frameworks/opt/net/wifi/libwifi_hal/wifi_hal_common.cpp**

```cpp

static int insmod(const char *filename, const char *args) {
  PLOG(INFO) << "insmod " << filename; //add by lixiaogang
  int ret;
  int fd;

  fd = TEMP_FAILURE_RETRY(open(filename, O_RDONLY | O_CLOEXEC | O_NOFOLLOW));
  if (fd < 0) {
    PLOG(ERROR) << "Failed to open " << filename;
    return -1;
  }

  ret = syscall(__NR_finit_module, fd, args, 0);

  usleep(3000000); //add by lixiaogang
  PLOG(INFO) << "sleep 3 seconds end";

  close(fd);
  if (ret < 0) {
    PLOG(ERROR) << "finit_module return: " << ret;
  }

  return ret;
}


int wifi_load_driver() {
  if (is_wifi_driver_loaded()) {
    return 0;
  }

  if (insmod(DRIVER_MODULE_PATH, DRIVER_MODULE_ARG) < 0) return -1;

  return 0;
}

```

## A133 8723ds 首次打开wifi失败问题

现象：设备开机首次无法打开wifi

分析：找不到wlan0网卡, 报错日志如下, 从内核日志可以看到驱动初始化到wlan0网卡时间是17.602537-20.46136约3秒钟，因此需要insmod网卡后延迟3秒以上再执行扫描网卡的动作

修改：frameworks/opt/net/wifi/libwifi_hal/wifi_hal_common.cpp insmod函数增加3秒延时

```txt

# dmesg log

[   17.602537] RTW: module init start
[   17.616382] RTW: rtl8723ds v5.6.5_31752.20181221_COEX20181130-2e2e
[   17.631726] RTW: build time: Aug  9 2022 11:10:27
[   17.645516] RTW: rtl8723ds BT-Coex version = COEX20181130-2e2e
[   17.665034] sunxi-wlan soc@03000000:wlan@0: check wlan wlan_power voltage: 1800000
[   17.832966] sunxi-wlan soc@03000000:wlan@0: bus_index: 1
[   17.839387] sunxi-mmc sdc1: sdc set ios:clk 0Hz bm PP pm UP vdd 21 width 1 timing LEGACY(SDR12) dt B
[   17.863133] sunxi-mmc sdc1: no vqmmc,Check if there is regulator
[   17.865878] RTW: module init ret=0
[   17.944519] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing LEGACY(SDR12) dt B
[   18.007729] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing LEGACY(SDR12) dt B
[   18.034160] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing LEGACY(SDR12) dt B
[   18.061153] sunxi-mmc sdc1: card claims to support voltages below defined range
[   18.094393] sunxi-mmc sdc1: sdc set ios:clk 400000Hz bm PP pm ON vdd 21 width 1 timing SD-HS(SDR25) dt B
[   18.114302] sunxi-mmc sdc1: sdc set ios:clk 50000000Hz bm PP pm ON vdd 21 width 1 timing SD-HS(SDR25) dt B
[   18.154010] sunxi-mmc sdc1: sdc set ios:clk 50000000Hz bm PP pm ON vdd 21 width 4 timing SD-HS(SDR25) dt B
[   18.203734] mmc1: new high speed SDIO card at address 0001
[   18.272673] RTW: == SDIO Card Info ==
[   18.283460] RTW:   clock: 50000000 Hz
[   18.296784] RTW:   timing spec: sd high-speed
[   18.303252] RTW:   sd3_bus_mode: FALSE
[   18.311907] RTW: ================
[   18.398583] RTW: HW EFUSE
[   18.402384] RTW: 0x000: 29 81 00 7C  E1 88 07 00  A0 04 EC 35  12 
[   18.411137] init: Received control message 'interface_start' for 'android.hardware.wifi.supplicant@1.0::ISupplicant/default' from pid: 1636 (/system/bin/hwservicemanager)
[   18.412796] init: starting service 'wpa_supplicant'...
[   18.419019] init: Created socket '/dev/socket/wpa_wlan0', mode 660, user 1010, group 1010
[   20.400858] RTW: rtw_regsty_chk_target_tx_power_valid return _FALSE for band:0, path:0, rs:0, t:-1
[   20.424142] RTW: rtw_ndev_init(wlan0) if1 mac_addr=30:7b:c9:4a:12:7a
[   20.461366] RTW: rtw_ndev_init(p2p0) if2 mac_addr=32:7b:c9:4a:12:7a

# android log

2022-08-11 16:39:45.251 2180-2180/? E/android.hardware.wifi@1.0-service-lazy: insmod /vendor/modules/8723ds.ko: Success
2022-08-11 16:39:46.280 2180-2180/? I/android.hardware.wifi@1.0-service-lazy: Wifi HAL started
2022-08-11 16:39:46.865 2180-2180/? E/android.hardware.wifi@1.0-service-lazy: Could not read interface state for wlan0 (No such device)
2022-08-11 16:39:46.865 2180-2180/? E/android.hardware.wifi@1.0-service-lazy: Failed to set WiFi interface up
2022-08-11 16:39:46.865 2180-2180/? E/android.hardware.wifi@1.0-service-lazy: Failed to start legacy HAL: UNKNOWN

```




























