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

### 开启和关闭关机充电模式

> fastboot oem enable-charger-screen  
> fastboot oem disable-charger-screen  

### 查看devinfo分区数据

> C:\Users\thinkpad>fastboot oem device-info  
> (bootloader)    Device tampered: false  
> (bootloader)    Device unlocked: true  
> (bootloader)    Device critical unlocked: true  
> (bootloader)    Charger screen enabled: false  
> (bootloader)    Display panel:  
> OKAY [  0.015s]  
> Finished. Total time: 0.016s  


## 刷机

1. 打开开发者选项-OEM解锁开关

2. adb reboot bootloader

3. fastboot  flashing  unlock

4. 刷机

```txt
  fastboot  flashing  unlock    # 设备必须解锁，开始刷机（这个不同的手机厂商不同）
  fastboot erase {partition}  # 擦除分区
  fastboot  erase  frp    # 擦除 frp 分区，frp 即 Factory Reset Protection，用于防止用户信息在手机丢失后外泄
  fastboot  flash  boot  boot.img    # 刷入 boot 分区
  fastboot  flash  system  system.img    # 刷入 system 分区
  fastboot  flash  recovery  recovery.img    # 刷入 recovery 分区
  fastboot flashall    #烧写所有分区，注意：此命令会在当前目录中查找所有img文件，将这些img文件烧写到所有对应的分区中，并重新启动手机。
  fastboot  format  data    # 格式化 data 分区
  fastboot  flashing lock    # 设备上锁，刷机完毕
  fastboot  continue    # 自动重启设备
  fastboot reboot# 重启手机
  fastboot reboot-bootloader# 重启到bootloader 刷机用
```

## 常见问题

```txt

OptiPlex-7020:~$ fastboot devcies
< waiting for any device >

fastboot devices
no permissions (user in plugdev group; are your udev rules wrong?); see [http://developer.android.com/tools/device.html]	fastboot

```

解决方法：

1. 进入sdk platam-tools目录(或者进入out/host/linux-x86/bin目录)
2. sudo chown root:root /bin/fastboot
3. sudo chmod +s /bin/fastboot


