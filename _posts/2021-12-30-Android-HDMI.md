---
layout:     post
title:      Android HDMI
subtitle:   High Definition Multimedia Interface
date:       2021-12-30
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
---

[显示器接口VGA、DVI、HDMI、DP](https://www.jianshu.com/p/4b77dc78b0e8)

## 常用显示器接口

图片来自[绿联](https://www.lulian.cn/product/list-12-cn.html)

VGA: Video Graphics Array 视频图形阵列, 模拟信号, 液晶显示器需要 A/D转换器，模拟信号抗干扰能力差，不适合超高清显示，一般用在**1080p**以内

![vga](/images/hdmi/vga.jpg)

HDMI: High Definition Multimedia Interface 高清多媒体接口, 全数字化视频和声音发送接口, 最新的**HDMI2.1**带宽达**48Gbps**，可以支持2K 240hz、4K 144hz、5K 60hz、8K 30hz

![hdmi](/images/hdmi/hdmi.jpg)

DP: DisplayPort 数字高清接口, 最新的**DP2.0**带宽已经高达**80Gbps**，最大支持16K（15360*8460）的超强分辨率

![dp](/images/hdmi/dp.jpg)

## RK3288 dts

```c

&hdmi {	
	status = "okay";
};

```

## RK3288 HDMI 旋转

| 属性值 | 含义 |
| ------ | ----- |
| ro.sf.hwrotation | 主屏初始方向 |
| ro.orientation.einit | 副屏初始方向 |
| ro.same.orientation | 主副屏方向是否相同 |
| ro.rotation.external | 副屏是否随主屏旋转 |




