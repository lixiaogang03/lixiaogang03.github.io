---
layout:     post
title:      Rochchip PCIE
subtitle:   rk3399
date:       2024-05-20
author:     LXG
header-img: img/post-bg-smart_phone.jpg
catalog: true
tags:
    - rk3399
---

[patchwork.kernel.org](https://patchwork.kernel.org/project/linux-rockchip/list/)

[rockchip-linux](https://github.com/rockchip-linux/kernel)

Rockchip_Developer_Guide_PCIe_CN.pdf

## PCIe

Peripheral Component Interconnect Express(快速外设组件互连)

PCI Express，简称 PCIe，是电脑总线 PCI 的一种，它沿用了现有的 PCI 编程概念及通讯标准，但建基于更快的串行通信系统。是 Intel 提出的新一代的总线接口，PCI Express 采用了目前业内流行的点对点串行连接，比起 PCI 以及更早期的计算机总线的共享并行架构每个 PCIe 设备都有自己的专用连接，不需要向整个总线请求带宽，而且可以把数据传输率提高到一个很高的频率，达到 PCI 所不能提供的高带宽。

## PCIE 速率

![pcie_version](/images/hardware/pcie/pcie_version.jpg)

## 4G PCIE

![pcie_4g](/images/hardware/pcie/pcie_4g.png)

实际上走的是USB协议

## SSD PCIE

![pcie_ssd_1](/images/hardware/pcie/pcie_ssd_1.png)

![pcie_ssd_2](/images/hardware/pcie/pcie_ssd_2.png)

## 驱动配置

**ep-gpios = <&gpio2 RK_PD4 GPIO_ACTIVE_HIGH>;**

此项是设置PCIe接口的PERST#复位信号；不论是插槽还是焊贴的设备，请在原理图上找到该引脚，并正确配置。否则将无法完成链路建立。

**num-lanes = <4>;**

此配置设置PCIe设备所使用的lane数量，默认不需要调整

**max-link-speed = <1>;**

此配置设置PCIe的速度登记，1表示gen1，2表示gen2。RK3399限制不超过gen2。另，此配置默认是写在dtsi，也就是说默认限制为gen1；原因是gen2的TX测试指标无法达到标准，所以不推荐客户开启gen2模式，以免引起不必要的链路异常。

**vpcie3v3-supply = <&vdd_pcie3v3>;**

此配置是可选项，用于配置PCIe外设的3V3供电。如果板级针对PCIe外设的3V3需要控制使能，则如范例所示定义一组对应的regulator

```c

	vcca0v9_s3: vcca0v9-s3 {
		compatible = "regulator-fixed";
		regulator-min-microvolt = <900000>;
		regulator-max-microvolt = <900000>;
		regulator-name = "vcca0v9_s3";
		vin-supply = <&vcc1v8_dvp>;
	};

	/* As above, actually supplied by vcc3v3_sys */
	vcca1v8_s3: vcca1v8-s3 {
		compatible = "regulator-fixed";
		regulator-min-microvolt = <1800000>;
		regulator-max-microvolt = <1800000>;
		regulator-name = "vcca1v8_s3";
		vin-supply = <&vcc3v3_sys>;
	};

	vdd_pcie3v3: vdd3v3-pcie-regulator {
		compatible = "regulator-fixed";
		gpio = <&gpio2 RK_PB4 GPIO_ACTIVE_HIGH>;
		pinctrl-names = "default";
		pinctrl-0 = <&vdd3v3_pcie_gpio>;
		regulator-name = "vdd3v3_pcie";
		enable-active-high;
		regulator-always-on;
		regulator-boot-on;
	};

&pcie_phy {
	assigned-clock-parents = <&cru SCLK_PCIEPHY_REF100M>;
	assigned-clock-rates = <100000000>;
	assigned-clocks = <&cru SCLK_PCIEPHY_REF>;
	status = "okay";
};

&pcie0 {
	ep-gpios = <&gpio2 RK_PD4 GPIO_ACTIVE_HIGH>;	//PCIE_PERST_L
	num-lanes = <4>;
	pinctrl-names = "default";
	pinctrl-0 = <&pcie_clkreqn_cpm>;
	vpcie3v3-supply = <&vdd_pcie3v3>;
	vpcie0v9-supply = <&vcca0v9_s3>;
	vpcie1v8-supply = <&vcca1v8_s3>;
	status = "okay";
};


&pinctrl {
	vdd3v3-pcie-gpio {
		vdd3v3_pcie_gpio: vdd3v3-pcie-gpio {
			rockchip,pins = <2 12 RK_FUNC_GPIO &pcfg_pull_none>;
		};
	};

	pcie {
		pcie_clkreqn_cpm: pci-clkreqn-cpm {
		    /*
		     * Since our pcie doesn't support ClockPM(CPM), we want
		     * to hack this as gpio, so the EP could be able to
		     * de-assert it along and make ClockPM(CPM) work.
		     */
		    rockchip,pins = <2 26 RK_FUNC_GPIO &pcfg_pull_none>;
		};
	};

};

```

## 启动日志

**android 11**

```txt

[    0.122607] reg-fixed-voltage vdd3v3-pcie-regulator: ===WIF===vdd3v3_pcie supplying 0uV

[    0.210582] rockchip-pcie f8000000.pcie: missing "memory-region" property
[    0.210721] rockchip-pcie f8000000.pcie: no vpcie12v regulator found
[    0.210794] rockchip-pcie f8000000.pcie: Linked as a consumer to regulator.18
[    0.210852] rockchip-pcie f8000000.pcie: Linked as a consumer to regulator.17
[    0.210924] rockchip-pcie f8000000.pcie: Dropping the link to regulator.17
[    0.210974] rockchip-pcie f8000000.pcie: Dropping the link to regulator.18
[    4.068799] rockchip-pcie f8000000.pcie: missing "memory-region" property
[    4.068918] rockchip-pcie f8000000.pcie: no vpcie12v regulator found
[    4.068979] rockchip-pcie f8000000.pcie: Linked as a consumer to regulator.18
[    4.069034] rockchip-pcie f8000000.pcie: Linked as a consumer to regulator.17
[    4.069063] vcca0v9_s3: supplied by vcc1v8_dvp
[    4.069120] rockchip-pcie f8000000.pcie: Linked as a consumer to regulator.16
[    4.069143] rockchip-pcie f8000000.pcie: host bridge /pcie@f8000000 ranges:
[    4.069159] rockchip-pcie f8000000.pcie:   MEM 0xfa000000..0xfbdfffff -> 0xfa000000
[    4.069169] rockchip-pcie f8000000.pcie:    IO 0xfbe00000..0xfbefffff -> 0xfbe00000
[    4.106940] rockchip-pcie f8000000.pcie: PCI host bridge to bus 0000:00
[    4.106963] pci_bus 0000:00: root bus resource [bus 00-1f]
[    4.106970] pci_bus 0000:00: root bus resource [mem 0xfa000000-0xfbdfffff]
[    4.106977] pci_bus 0000:00: root bus resource [io  0x0000-0xfffff] (bus address [0xfbe00000-0xfbefffff])
[    4.107003] pci 0000:00:00.0: [1d87:0100] type 01 class 0x060400
[    4.107083] pci 0000:00:00.0: supports D1
[    4.107087] pci 0000:00:00.0: PME# supported from D0 D1 D3hot
[    4.109875] pci 0000:00:00.0: bridge configuration invalid ([bus 00-00]), reconfiguring
[    4.110006] pci 0000:01:00.0: [15b7:501a] type 00 class 0x010802
[    4.110122] pci 0000:01:00.0: reg 0x10: [mem 0x00000000-0x00003fff 64bit]
[    4.110215] pci 0000:01:00.0: reg 0x20: [mem 0x00000000-0x000000ff 64bit]
[    4.110624] pci 0000:01:00.0: 8.000 Gb/s available PCIe bandwidth, limited by 2.5 GT/s x4 link at 0000:00:00.0 (capable of 31.504 Gb/s with 8 GT/s x4 link)
[    4.121921] pci_bus 0000:01: busn_res: [bus 01-1f] end is updated to 01
[    4.121943] pci 0000:00:00.0: BAR 8: assigned [mem 0xfa000000-0xfa0fffff]
[    4.122008] pci 0000:01:00.0: BAR 0: assigned [mem 0xfa000000-0xfa003fff 64bit]
[    4.122059] pci 0000:01:00.0: BAR 4: assigned [mem 0xfa004000-0xfa0040ff 64bit]
[    4.122108] pci 0000:00:00.0: PCI bridge to [bus 01]
[    4.122125] pci 0000:00:00.0:   bridge window [mem 0xfa000000-0xfa0fffff]
[    4.122283] pcieport 0000:00:00.0: enabling device (0000 -> 0002)
[    4.122484] pcieport 0000:00:00.0: Signaling PME with IRQ 90
[    4.122577] pcieport 0000:00:00.0: AER enabled with IRQ 90
[    4.122980] nvme nvme0: pci function 0000:01:00.0
[    4.123083] nvme 0000:01:00.0: enabling device (0000 -> 0002)

```

**android 7**

```txt

[    3.980904] rockchip-pcie f8000000.pcie: GPIO lookup for consumer ep
[    3.980914] rockchip-pcie f8000000.pcie: using device tree for GPIO lookup
[    3.980940] of_get_named_gpiod_flags: parsed 'ep-gpios' property of node '/pcie@f8000000[0]' - status (0)
[    3.995404] mmc1: MAN_BKOPS_EN bit is not set
[    4.004796] rockchip-pcie f8000000.pcie: invalid power supply
[    4.004883] PCI host bridge /pcie@f8000000 ranges:
[    4.004905]   MEM 0xfa000000..0xfbdfffff -> 0xfa000000
[    4.004913]    IO 0xfbe00000..0xfbefffff -> 0xfbe00000
[    4.005148] rockchip-pcie f8000000.pcie: PCI host bridge to bus 0000:00
[    4.005165] pci_bus 0000:00: root bus resource [bus 00-1f]
[    4.005173] pci_bus 0000:00: root bus resource [mem 0xfa000000-0xfbdfffff]
[    4.005182] pci_bus 0000:00: root bus resource [io  0x0000-0xfffff] (bus address [0xfbe00000-0xfbefffff])
[    4.005213] pci 0000:00:00.0: [1d87:0100] type 01 class 0x060400
[    4.005292] pci 0000:00:00.0: supports D1
[    4.005299] pci 0000:00:00.0: PME# supported from D0 D1 D3hot
[    4.005489] pci 0000:00:00.0: bridge configuration invalid ([bus 00-00]), reconfiguring
[    4.005574] pci_bus 0000:01: busn_res: can not insert [bus 01-ff] under [bus 00-1f] (conflicts with (null) [bus 00-1f])
[    4.005611] pci 0000:01:00.0: [126f:2263] type 00 class 0x010802
[    4.005682] pci 0000:01:00.0: reg 0x10: [mem 0x00000000-0x00003fff 64bit]
[    4.011512] pci_bus 0000:01: busn_res: [bus 01-ff] end is updated to 01
[    4.011584] pci 0000:00:00.0: BAR 8: assigned [mem 0xfa000000-0xfa0fffff]
[    4.011639] pci 0000:01:00.0: BAR 0: assigned [mem 0xfa000000-0xfa003fff 64bit]
[    4.011685] pci 0000:00:00.0: PCI bridge to [bus 01]
[    4.011716] pci 0000:00:00.0:   bridge window [mem 0xfa000000-0xfa0fffff]
[    4.011891] pcieport 0000:00:00.0: enabling device (0000 -> 0002)
[    4.012405] pcieport 0000:00:00.0: Signaling PME through PCIe PME interrupt
[    4.012448] pci 0000:01:00.0: Signaling PME through PCIe PME interrupt
[    4.012479] pcie_pme 0000:00:00.0:pcie01: service driver pcie_pme loaded
[    4.012714] aer 0000:00:00.0:pcie02: service driver aer loaded
[    4.017252] nvme 0000:01:00.0: enabling device (0000 -> 0002)

```

## 调试

**android 11**

```txt

1|rk3399_Android11:/ $ lspcie -vv
00:00.0 Class 0604: Device 1d87:0100
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx+
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0
	Interrupt: pin A routed to IRQ 90
	Bus: primary=00, secondary=01, subordinate=01, sec-latency=0
	I/O behind bridge: 00000000-00000fff
	Memory behind bridge: fa000000-fa0fffff
	Prefetchable memory behind bridge: 00000000-000fffff
	Secondary status: 66MHz- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- <SERR- <PERR-
	BridgeCtl: Parity- SERR- NoISA- VGA- MAbort- >Reset- FastB2B-
		PriDiscTmr- SecDiscTmr- DiscTmrStat- DiscTmrSERREn-
	Capabilities: <access denied>
	Kernel driver in use: pcieport

01:00.0 Class 0108: Device 15b7:501a (prog-if 02)
	Subsystem: Device 15b7:501a
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx+
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0
	Interrupt: pin A routed to IRQ 89
	Region 0: Memory at fa000000 (64-bit, non-prefetchable) [size=16K]
	Region 4: Memory at fa004000 (64-bit, non-prefetchable) [size=256]
	Capabilities: <access denied>
	Kernel driver in use: nvme


```

**android 7**

```txt

rk3399_all:/ $ lspcie -vv 
00:00.0 Class 0604: Device 1d87:0100
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx+
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort+ <TAbort+ <MAbort+ >SERR+ <PERR+ INTx-
	Latency: 0
	Interrupt: pin A routed to IRQ 247
	Bus: primary=00, secondary=01, subordinate=01, sec-latency=0
	I/O behind bridge: 00000000-00000fff
	Memory behind bridge: fa000000-fa0fffff
	Prefetchable memory behind bridge: 00000000-000fffff
	Secondary status: 66MHz- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- <SERR- <PERR-
	BridgeCtl: Parity- SERR- NoISA- VGA- MAbort- >Reset- FastB2B-
		PriDiscTmr- SecDiscTmr- DiscTmrStat- DiscTmrSERREn-
	Capabilities: <access denied>
	Kernel driver in use: pcieport

01:00.0 Class 0108: Device 126f:2263 (rev 03) (prog-if 02)
	Subsystem: Device 126f:2263
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx+
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0
	Interrupt: pin A routed to IRQ 246
	Region 0: Memory at fa000000 (64-bit, non-prefetchable) [size=16K]
	Capabilities: <access denied>
	Kernel driver in use: nvme

```

## df 命令

**android 11**

```txt

rk3399_Android11:/ $ df
Filesystem            1K-blocks    Used Available Use% Mounted on
tmpfs                    998924     820    998104   1% /dev
tmpfs                    998924       0    998924   0% /mnt
/dev/block/mmcblk2p11     11760     144     11132   2% /metadata
/dev/block/dm-0         1133268 1129836         0 100% /
/dev/block/dm-2          270500  269676         0 100% /vendor
/dev/block/dm-4             528     524         0 100% /odm
/dev/block/dm-3          174488  173964         0 100% /product
/dev/block/dm-1          120492  120112         0 100% /system_ext
tmpfs                    998924       0    998924   0% /apex
tmpfs                    998924     256    998668   1% /linkerconfig
/dev/block/mmcblk2p10    364504     252    352456   1% /cache
/dev/block/dm-5        10579968   67536  10381360   1% /data
tmpfs                    998924       0    998924   0% /data_mirror
/dev/fuse              10579968   67536  10381360   1% /storage/emulated
/dev/fuse             499984448     768 499983680   1% /storage/8367-1B20

```

**android 7**

```txt

rk3399_all:/ $ df
Filesystem              1K-blocks    Used Available Use% Mounted on
rootfs                     993136    4816    988320   1% /
tmpfs                     1002716     436   1002280   1% /dev
tmpfs                     1002716       0   1002716   0% /mnt
/dev/block/dm-0           1499760 1037108    368856  74% /system
/dev/block/mmcblk1p9       124912    1072    114668   1% /cache
/dev/block/mmcblk1p11       12016      52     10824   1% /metadata
/dev/block/dm-1          12928808  364280  12417072   3% /data
/data/media              12826408  511736  12314672   4% /storage/emulated
/mnt/media_rw/3C1D-101D 499516224      24 499516200   1% /storage/3C1D-101D

```

## android 7 支持 PCIE 硬盘

```diff

diff --git a/device/rockchip/rk3399/fstab.rk30board.bootmode.emmc b/device/rockchip/rk3399/fstab.rk30board.bootmode.emmc
index 8668a0f1f6..e3b3f1dd42 100755
--- a/device/rockchip/rk3399/fstab.rk30board.bootmode.emmc
+++ b/device/rockchip/rk3399/fstab.rk30board.bootmode.emmc
@@ -19,4 +19,7 @@
 
 /devices/platform/*usb*   auto vfat defaults      voldmanaged=usb:auto
 
+# pcie
+/dev/block/platform/f8000000.pcie/nvme0n1p1           auto vfat defaults     voldmanaged=pcie:auto
+
 /dev/block/zram0                                none                swap      defaults                                              zramsize=533413200
diff --git a/frameworks/base/core/java/android/os/storage/DiskInfo.java b/frameworks/base/core/java/android/os/storage/DiskInfo.java
index 911410744b..abe21cb874 100755
--- a/frameworks/base/core/java/android/os/storage/DiskInfo.java
+++ b/frameworks/base/core/java/android/os/storage/DiskInfo.java
@@ -47,6 +47,7 @@ public class DiskInfo implements Parcelable {
     public static final int FLAG_DEFAULT_PRIMARY = 1 << 1;
     public static final int FLAG_SD = 1 << 2;
     public static final int FLAG_USB = 1 << 3;
+    public static final int FLAG_PCIE= 1 << 5;
 
     public final String id;
     public final int flags;
@@ -128,6 +129,10 @@ public class DiskInfo implements Parcelable {
         return (flags & FLAG_USB) != 0;
     }
 
+    public boolean isPcie() {
+        return (flags & FLAG_PCIE) != 0;
+    }
+
     @Override
     public String toString() {
         final CharArrayWriter writer = new CharArrayWriter();
diff --git a/system/vold/Disk.cpp b/system/vold/Disk.cpp
index 1103b0d3b3..8b433d1df0 100755
--- a/system/vold/Disk.cpp
+++ b/system/vold/Disk.cpp
@@ -68,6 +68,7 @@ static const unsigned int kMajorBlockScsiP = 135;
 static const unsigned int kMajorBlockMmc = 179;
 static const unsigned int kMajorBlockExperimentalMin = 240;
 static const unsigned int kMajorBlockExperimentalMax = 254;
+static const unsigned int kMajorBlockPcie = 259;
 
 static const char* kGptBasicData = "EBD0A0A2-B9E5-4433-87C0-68B6B72699C7";
 static const char* kGptAndroidMeta = "19A710A2-B3CA-11E4-B026-10604B889DCF";
@@ -261,6 +262,18 @@ status_t Disk::readMetadata() {
         }
         break;
     }
+
+    case kMajorBlockPcie: {
+        std::string path(mSysPath + "/device/device/vendor");
+        std::string tmp;
+        if (!ReadFileToString(path, &tmp)) {
+            PLOG(WARNING) << "Failed to read vendor from " << path;
+            return -errno;
+        }
+        mLabel = tmp;
+        break;
+    }
+
     default: {
         if (isVirtioBlkDevice(majorId)) {
             LOG(DEBUG) << "Recognized experimental block major ID " << majorId
@@ -556,6 +569,14 @@ int Disk::getMaxMinors() {
         }
         return atoi(tmp.c_str());
     }
+    case kMajorBlockPcie: {
+        std::string tmp;
+        if (!ReadFileToString(kSysfsMmcMaxMinors, &tmp)) {
+            LOG(ERROR) << "Failed to read max minors";
+            return -errno;
+        }
+        return atoi(tmp.c_str());
+    }
     default: {
         if (isVirtioBlkDevice(majorId)) {
             // drivers/block/virtio_blk.c has "#define PART_BITS 4", so max is
diff --git a/system/vold/Disk.h b/system/vold/Disk.h
index 77ec7df971..6662fa4abd 100755
--- a/system/vold/Disk.h
+++ b/system/vold/Disk.h
@@ -52,6 +52,7 @@ public:
         kUsb = 1 << 3,
         /* Flag that disk is EMMC internal */
         kEmmc = 1 << 4,
+        kPcie = 1 << 5,
     };
 
     const std::string& getId() { return mId; }
diff --git a/system/vold/VolumeManager.cpp b/system/vold/VolumeManager.cpp
index 5cc60a16eb..d0c37abb10 100755
--- a/system/vold/VolumeManager.cpp
+++ b/system/vold/VolumeManager.cpp
@@ -93,7 +93,7 @@ static const char* kUserMountPath = "/mnt/user";
 static const unsigned int kMajorBlockMmc = 179;
 static const unsigned int kMajorBlockExperimentalMin = 240;
 static const unsigned int kMajorBlockExperimentalMax = 254;
-
+static const unsigned int kMajorBlockPcie = 259;
 /* writes superblock at end of file or device given by name */
 static int writeSuperBlock(const char* name, struct asec_superblock *sb, unsigned int numImgSectors) {
     int sbfd = open(name, O_RDWR | O_CLOEXEC);
@@ -302,11 +302,14 @@ void VolumeManager::handleBlockEvent(NetlinkEvent *evt) {
                 // emulator-specific; see Disk.cpp for details) devices are SD,
                 // and that everything else is USB
                 int flags = source->getFlags();
+                LOG(VERBOSE) << "handleBlockEvent with action  kAdd flags" << flags;
                 if (major == kMajorBlockMmc
                     || (android::vold::IsRunningInEmulator()
                     && major >= (int) kMajorBlockExperimentalMin
                     && major <= (int) kMajorBlockExperimentalMax)) {
                     flags |= android::vold::Disk::Flags::kSd;
+                } else if (major == kMajorBlockPcie) {
+                    flags |= android::vold::Disk::Flags::kPcie;
                 } else {
                     flags |= android::vold::Disk::Flags::kUsb;
                 }

```























