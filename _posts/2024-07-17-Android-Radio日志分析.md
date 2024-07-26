---
layout:     post
title:      Android Radio 日志分析
subtitle:   4G无法上网原因统计
date:       2024-07-17
author:     LXG
header-img: img/post-bg-phone.jpg
catalog: true
tags:
    - radio
---

[移动物联卡查询地址](https://m.fjtytx.com/renew)

## 信号强度表格

![signal_strength](/images/android/apn/signal_strength.png)

## 物联卡正常的日志

```txt

07-17 11:51:18.144  1865  1999 D ATC     : AT> AT+QENG="servingcell"
07-17 11:51:18.151  1865  2062 D ATC     : AT< +QENG: "servingcell","NOCONN","LTE","FDD",460,00,B973F53,134,1300,3,5,5,4977,-113,-6,-102,8,13

```

**AT> AT+QENG="servingcell"**

这条命令是请求设备报告当前服务小区的信息。+QENG 是Quectel（或其他兼容厂商）的扩展AT命令，用于启用或报告各种工程信息，这里 "servingcell" 表示请求服务小区的状态

**AT< +QENG: "servingcell","NOCONN","LTE","FDD",460,00,B973F53,134,1300,3,5,5,4977,-113,-6,-102,8,13**

* "servingcell" - 请求的服务小区信息。
* "NOCONN" - 当前的连接状态，这里表示没有建立连接（NOCONN）。
* "LTE" - 当前服务小区的网络技术类型，这里是长期演进技术（Long Term Evolution）。
* "FDD" - 频分双工（Frequency Division Duplex），指上行链路和下行链路使用不同的频率。
* 460 - MCC（Mobile Country Code），中国区的MCC是460。
* 00 - MNC（Mobile Network Code），这里可能代表未知或默认值。
* B973F53 - 小区全球唯一标识符（CGI，Cell Global Identity），用于识别一个特定的小区。
* 134 - 服务小区的频段。
* 1300 - 小区的载波中心频率，单位是kHz，因此这里的频率是1300 MHz。
* 3 - PCI（Physical Cell ID），物理小区ID。
* 5 - RSRP（Reference Signal Received Power），参考信号接收功率，单位是dBm，这里为-113 dBm。
* 5 - RSRQ（Reference Signal Received Quality），参考信号接收质量，这里为-6 dB。
* 4977 - SINR（Signal-to-Interference plus Noise Ratio），信号与干扰加噪声比，这里为-102 dB。
* 8 - EARFCN（Evolved Absolute Radio Frequency Channel Number），用于LTE的绝对射频信道号。
* 13 - 其他参数，可能与设备的实现有关。

## SIM卡停机日志

```txt

07-10 14:50:59.452  2173  2295 D ATC     : AT> AT+QENG="servingcell"
07-10 14:50:59.461  2173  2375 D ATC     : AT< +QENG: "servingcell","LIMSRV","LTE","TDD",460,00,1F1B320,420,38950,40,5,5,4977,-110,-9,-105,19,8

```

"LIMSRV" - 连接状态，这里表示设备正受限服务（Limited Service）状态，可能是由于某些服务被限制或网络问题

## 机卡分离 和 区域限制

机卡分离和区域限制时, 设备的信号和小区状态都是正常的, 只是无法上网

## 域名和IP白名单设置



























