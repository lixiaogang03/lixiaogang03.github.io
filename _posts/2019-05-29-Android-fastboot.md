---
layout:     post
title:      Android Fastboot
subtitle:   Android sdk tools
date:       2019-05-29
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - fastboot
---

[fastboot和recovery-简书](https://www.jianshu.com/p/d960a6f517d8)

[fastboot-AOSP](https://source.android.com/setup/build/running)

## Fastboot

Fastboot 是一种引导加载程序模式，您可以在该模式下刷写设备。

1. 在设备冷启动过程中，可使用组合键进入 fastboot 模式: 按住音量调低键，然后按住电源键。

2. 可以使用命令 adb reboot bootloader 直接重新启动进入引导加载程序。

## qcom

### 关机充电模式

1. 开启和关闭关机充电模式

> fastboot oem enable-charger-screen
> fastboot oem disable-charger-screen

2. 查看devinfo分区数据

> C:\Users\thinkpad>fastboot oem device-info
> (bootloader)    Device tampered: false
> (bootloader)    Device unlocked: true
> (bootloader)    Device critical unlocked: true
> (bootloader)    Charger screen enabled: false
> (bootloader)    Display panel:
> OKAY [  0.015s]
> Finished. Total time: 0.016s

