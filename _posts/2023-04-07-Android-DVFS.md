---
layout:     post
title:      Android DVFS
subtitle:   动态调频调压
date:       2023-04-07
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Linux
    - 驱动
---

[Devfreq学习笔记](https://www.cnblogs.com/hellokitty2/p/13061707.html)

## 概念

当今的复杂SoC由多个子模块协同工作组成。在执行各种用例的操作系统中，并非SoC中的所有模块都需要始终保持最高性能。为方便起见，将SoC中的子模块分组为域，从而允许某些域以较低的电压和频率运行，而其他域以较高的电压/频率对运行。

对于这些设备支持的频率和电压对，我们称之为OPP（Operating Performance Point）。对于具有OPP功能的非CPU设备，本文称之为OPP device，需要通过devfreq进行动态的调频调压。

devfreq：Generic Dynamic Voltage and Frequency Scaling (DVFS) Framework for Non-CPU Devices。是由三星电子MyungJoo Ham <myungjoo.ham@samsung.com>，提交到社区。原理和/deivers/cpufreq 非常近似。但是cpufreq驱动并不允许多个设备来注册，而且也不适合不同的设备具有不同的governor。devfreq则支持多个设备，并且允许每个设备有自己对应的governor。

如下图，devfreq framework是功耗子系统的一部分，与cpufreq，cpuidle，powermanager相互配合协作，已达到节省系统功耗的目的。

![linux_devfreq](/images/allwinner/linux_devfreq.png)

## 全志驱动代码

longan/kernel/linux-4.9/drivers/devfreq

```txt

├── devfreq.c
├── devfreq-event.c
├── dramfreq
│   ├── Makefile
│   ├── sunxi-ddrfreq.c
│   ├── sunxi-mdfs.c
│   └── sunxi-mdfs.h
├── event
│   ├── exynos-nocp.c
│   ├── exynos-nocp.h
│   ├── exynos-ppmu.c
│   ├── exynos-ppmu.h
│   ├── Kconfig
│   ├── Makefile
│   └── rockchip-dfi.c
├── exynos-bus.c
├── governor_adaptive.c
├── governor.h
├── governor_passive.c
├── governor_performance.c
├── governor_powersave.c
├── governor_simpleondemand.c
├── governor_userspace.c
├── Kconfig
├── Makefile
├── rk3399_dmc.c
├── sunxi-dramfreq.c
└── tegra-devfreq.c

```

**board.dts**

```c

#include "sun50iw10p1.dtsi"
#include "lvds-1920x1080.dtsi"
/{
        model = "sun50iw10";
        compatible = "allwinner,a133", "arm,sun50iw10p1";

        gpu: gpu@0x01800000 {
                        gpu_idle = <0>;
                        dvfs_status = <1>;
                        pll_rate = <504000>;
                        independent_power = <0>;
                        operating-points = <
                                 /* KHz   uV */
                                504000 950000
                                472500 950000
                                441000 950000
                                252000 950000
                         >;
                         gpu-supply = <&reg_dcdc4>;
        };
}

```

## 瑞芯微驱动

Rockchip_Developer_Guide_Devfreq_CN.pdf

rk3399_Android10.0/kernel/drivers/devfreq

```txt

├── devfreq.c
├── devfreq-event.c
├── event
│   ├── exynos-nocp.c
│   ├── exynos-nocp.h
│   ├── exynos-ppmu.c
│   ├── exynos-ppmu.h
│   ├── Kconfig
│   ├── Makefile
│   ├── rockchip-dfi.c
│   └── rockchip-nocp.c
├── exynos-bus.c
├── governor.h
├── governor_passive.c
├── governor_performance.c
├── governor_powersave.c
├── governor_simpleondemand.c
├── governor_userspace.c
├── Kconfig
├── Makefile
├── rockchip_bus.c
├── rockchip_dmc.c
├── rockchip_dmc_dbg.c
├── rockchip_dmc_timing.h
└── tegra-devfreq.c

```

## 内核开关

CONFIG_PM_DEVFREQ=y

## 全志调试

```txt

ceres-c3:/sys/class/devfreq/gpu $ ls -al 
total 0
drwxr-xr-x 3 root root    0 1970-01-01 08:00 .
drwxr-xr-x 3 root root    0 1970-01-01 08:00 ..
-r--r--r-- 1 root root 4096 2023-04-04 20:06 available_frequencies     /* 系统支持的频率 */
-r--r--r-- 1 root root 4096 2023-04-04 20:06 available_governors       /* 系统支持的变频策略 */
-r--r--r-- 1 root root 4096 2023-04-04 20:06 cur_freq                  /* 当前频率 */
lrwxrwxrwx 1 root root    0 2023-04-04 20:06 device -> ../../../gpu
-rw-r--r-- 1 root root 4096 2023-04-04 20:06 governor                  /* 当前使用的变频策略 */
-rw-r--r-- 1 root root 4096 2023-04-04 20:06 max_freq                  /* 软件上限制的最高频率 */
-rw-r--r-- 1 root root 4096 2023-04-04 20:06 min_freq                  /* 软件上限制的最低频率 */
-rw-r--r-- 1 root root 4096 2023-04-04 20:06 polling_interval          /* 检测负载的间隔时间 */
drwxr-xr-x 2 root root    0 2023-04-04 20:06 power
lrwxrwxrwx 1 root root    0 2023-04-04 20:06 subsystem -> ../../../../../class/devfreq
-r--r--r-- 1 root root 4096 2023-04-04 20:06 target_freq               /* 软件上最后一次设置的频率 */
-r--r--r-- 1 root root 4096 2023-04-04 20:06 trans_stat                /* 每个频率上的变频次数和运行时间 */
-rw-r--r-- 1 root root 4096 2023-04-04 20:06 uevent

```

**查看频率电压表**

```txt

ceres-c3:/ $ ls  /sys/kernel/debug/opp/platform-gpu/
opp:252000000 opp:441000000 opp:472500000 opp:504000000

```

**每个频率上的变频次数和运行时间**

```txt

ceres-c3:/ $ cat sys/class/devfreq/gpu/trans_stat
     From  :   To
           : 252000000 441000000 472500000 504000000   time(ms)
  252000000:         0         0         0         0         0
  441000000:         0         0         0         0         0
  472500000:         0         0         0         0         0
* 504000000:         0         0         0         0     45440
Total transition : 0

```











