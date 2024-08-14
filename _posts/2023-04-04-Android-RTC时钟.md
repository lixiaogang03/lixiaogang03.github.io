---
layout:     post
title:      Android RTC 时钟
subtitle:   allwinner rockchip
date:       2023-04-04
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - rtc
---

## 全志软件架构

![a133_rtc](/images/allwinner/a133_rtc.png)

## 全志RTC驱动

**sun50iw10p1.dtsi**

```c

                rtc: rtc@07000000 {
                        compatible = "allwinner,sunxi-rtc";
                        device_type = "rtc";
                        wakeup-source;                                   // 表示RTC是具备休眠唤醒能力的中断唤醒源
                        auto_switch;                                     // 支持RTC使用的32k时钟源硬件自动切换
                        reg = <0x0 0x07000000 0x0 0x200>;                // RTC寄存器基地址和映射范围
                        interrupts = <GIC_SPI 108 IRQ_TYPE_LEVEL_HIGH>;
                        gpr_offset = <0x100>;                            // RTC通用寄存器的偏移
                        gpr_len    = <8>;
                        gpr_cur_pos = <6>;                               // RTC通用寄存器的个数
                };

```

## 全志查看RTC寄存器

```txt

ceres-c3:/ # echo 0x07000000,0x07000200 > /sys/class/sunxi_dump/dump                                                                                                                                                           
ceres-c3:/ # cat /sys/class/sunxi_dump/dump                                                                                                                                                                                    

0x0000000007000000: 0x00004011 0x00000001 0x0000000f 0x7a000000
0x0000000007000010: 0x00004bfe 0x000a350e 0x00000000 0x00000000
0x0000000007000020: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000030: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000040: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000050: 0x00000001 0x00000000 0x00000000 0x00000000
0x0000000007000060: 0x00000001 0x00000000 0x00000000 0x00000000
0x0000000007000070: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000080: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000090: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070000a0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070000b0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070000c0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070000d0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070000e0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070000f0: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000100: 0x00000000 0x00000000 0x00000000 0x0000b00f
0x0000000007000110: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000120: 0x20000000 0x00000000 0x00000000 0x00000000
0x0000000007000130: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000140: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000150: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000160: 0x083f10f7 0x00000043 0x00000000 0x00000000
0x0000000007000170: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000180: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000190: 0x00000004 0x00000000 0x00000000 0x00000000
0x00000000070001a0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070001b0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070001c0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070001d0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070001e0: 0x00000000 0x00000000 0x00000000 0x00000000
0x00000000070001f0: 0x00000000 0x00000000 0x00000000 0x00000000
0x0000000007000200: 0x00000000

```

## 查看硬件RTC时间

Linux时间有两个， 系统时间(Wall Time)， RTC时间, 上电-->RTC驱动加载-->从RTC同步时间到WT时间

```txt

1|ceres-c3:/ # hwclock --show 
Thu Apr  6 10:55:57 2023  0.000000 seconds

```

## 查看Linux内核维护的时间

```txt

ceres-c3:/ $ date
Mon Apr  3 17:41:05 CST 2023

```

## A133 RTC 原理图

![a133_rtc_hardware](/images/allwinner/a133_rtc_hardware.png)


**BAT54C**

![BAT54C](/images/allwinner/BAT54C.png)

BAT54C是一款正向电压为520mV的半导体二极管

* VCC-RTC 是正常供电电源 1.8V
* J13 是电池供电电源 3V (随着时间会有衰减)，实际上1.8V的电池即可满足要求

当电源供电时，电压大的二极管导通，当电池供电时，下边的二极管导通

## RK3288 HYM8563 原理图

HYM8563 是一款低功耗CMOS实时时钟/日历芯片，它提供一个可编程的时钟输出，一个中断输出和一个掉电检测器，所有的地址和数据都通过I2C总线接口串行传递。

[HYM8563.pdf](https://www.t-firefly.com/download/fireprime/hardware/HYM8563.pdf)

![rk3288_rtc_hardware](/images/rockchip/rk3288/rk3288_rtc_hardware.png)

## 调试

[RTC 使用-firefly](https://wiki.t-firefly.com/zh_CN/ROC-RK3588-RT/usage_rtc.html)

HYM8563是一款低功耗CMOS实时时钟/日历芯片,它提供一个可编程的时钟输出,一个中断 输出和一个掉电检测器,所有的地址和数据都通过I2C总线接口串行传递。最大总线速度为 400Kbits/s,每次读写数据后,内嵌的字地址寄存器会自动递增

* 可计时基于 32.768kHz 晶体的秒,分,小时,星期,天,月和年
* 宽工作电压范围:1.0~5.5V
* 低休眠电流:典型值为 0.25μA(VDD =3.0V, TA =25°C)
* 内部集成振荡电容
* 漏极开路中断引脚

kernel-5.10/drivers/rtc/rtc-hym8563.c

Linux 提供了三种用户空间调用接口。在 ROC-RK3588-RT开发板中对应的路径为：

* SYSFS接口：/sys/class/rtc/rtc0/
* PROCFS接口： /proc/driver/rtc
* IOCTL接口： /dev/rtc0

```txt

# cat /proc/driver/rtc
rtc_time        : 06:53:50
rtc_date        : 2022-06-21
alrm_time       : 06:55:05
alrm_date       : 2022-06-21
alarm_IRQ       : yes
alrm_pending    : no
update IRQ enabled      : no
periodic IRQ enabled    : no
periodic IRQ frequency  : 1
max user IRQ frequency  : 64
24hr            : yes

```

比如查看当前 RTC 的日期和时间：

```txt

# cat /sys/class/rtc/rtc0/date 
2022-06-21
# cat /sys/class/rtc/rtc0/time 
06:52:08

```

设置开机时间，如设置 120 秒后开机：

```txt

#120秒后定时开机
echo +120 >  /sys/class/rtc/rtc0/wakealarm
# 查看开机时间
cat /sys/class/rtc/rtc0/wakealarm
#关机
reboot -p

```






