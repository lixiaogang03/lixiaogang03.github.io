---
layout:     post
title:      Android Radio 日志分析
subtitle:   4G无法上网原因统计
date:       2024-07-17
author:     LXG
header-img: img/post-bg-phone.jpg
catalog: true
tags:
    - Android
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

## 案例

AT< +QENG: "servingcell","NOCONN","LTE","TDD",460,00,4148780,367,38400,39,5,5,B8DA,-96,-10,-85,15,22

| 序号 | 字段名           |             该行值 | 含义 / 解释                                                                            |
| -- | ------------- | --------------: | ---------------------------------------------------------------------------------- |
| 1  | 报文类型          | `"servingcell"` | 表示这是“当前服务小区”信息                                                                     |
| 2  | state         |      `"NOCONN"` | 模块内部状态标识（NOCONN = 没有承载连接/未处于DATA承载的已连接状态；有时模块仍在营运但显示 NOCONN）                       |
| 3  | RAT           |         `"LTE"` | 无线接入技术：LTE                                                                         |
| 4  | is_tdd        |         `"TDD"` | 该小区是 TDD 模式（而不是 FDD）                                                               |
| 5  | MCC           |           `460` | 移动国家码 — 460 = 中国                                                                   |
| 6  | MNC           |            `00` | 移动网络码 — 00 常见为中国移动 (CMCC)                                                          |
| 7  | cellId (hex)  |       `4148780` | 小区 ID（十六进制表示）。十六进制 `0x4148780` = **68,454,272**（十进制）                               |
| 8  | PCI           |           `367` | 物理小区标识（Physical Cell ID），用于下行同步                                                    |
| 9  | EARFCN        |         `38400` | E-UTRA Absolute Radio Frequency Channel Number（表示具体频点）                             |
| 10 | freq_band_ind |            `39` | 频段指示（频段号），这里是 **Band 39**（TDD），中国常用 TDD 频段之一                                       |
| 11 | UL bandwidth  |             `5` | 上行带宽指示（编码值，模块手册定义的带宽索引/值）                                                          |
| 12 | DL bandwidth  |             `5` | 下行带宽指示（同上）                                                                         |
| 13 | TAC (hex)     |          `B8DA` | Tracking Area Code（跟踪区域码），这里十六进制 `0xB8DA` = **47322**（十进制）                         |
| 14 | RSRP          |           `-96` | Reference Signal Received Power，单位 dBm。**-96 dBm** = 较弱/差的接收功率（见下方信号等级说明）          |
| 15 | RSRQ          |           `-10` | Reference Signal Received Quality，单位 dB（通常是负值）。**-10 dB** 表示信号质量偏差（差）              |
| 16 | RSSI          |           `-85` | Received Signal Strength Indication，单位 dBm（包含噪声/干扰）。`-85 dBm` 为弱到一般                |
| 17 | SINR          |            `15` | Signal-to-Interference-plus-Noise Ratio，单位 dB（正值为好）。**15 dB** 表示信号相对干扰不错（不错的 SINR） |
| 18 | CQI           |            `22` | Channel Quality Indicator（调制适配质量指标），数值越大表示链路质量越好（具体范围/含义与基带/制造商有关）                 |

### RSRP = -96 dBm

* 代表：基站给你的“信号强不强”
* 类似：手机信号条的核心指标

| RSRP(dBm)   | 信号质量            |
| ----------- | --------------- |
| -80 以上      | 很好              |
| -90 ~ -100  | 中等（你的 -96 属于一般） |
| -100 ~ -110 | 差               |
| < -110      | 很差，容易掉线         |

### RSRQ = -10 dB（信号质量 / 干扰）

* 代表：信号是否被周围基站干扰
* 类似：信号“干不干净”，不是强度，而是“纯度”

| RSRQ(dB) | 质量         |
| -------- | ---------- |
| -5 ~ -8  | 好          |
| -9 ~ -12 | 一般（你的 -10） |
| -12 以下   | 差          |

### RSSI = -85 dBm

| RSSI(dBm)   | 信号整体能量       | 说明        |
| ----------- | ------------ | --------- |
| -60以上       | 很强           | 信号非常好     |
| -70到-80     | 中等偏好         | 常见良好场景    |
| **-80到-90** | 一般（你现在的 -85） | 基站不远，干扰中等 |
| -90到-100    | 差            | 信号弱或干扰大   |
| < -100      | 很差           | 经常掉线      |

### SINR = 15 dB（信号可用度）⭐决定网速

* 代表：信号中的“有效成分”比例
* 类似：你听广播，声音大但杂音多 = 网速还是烂

| SINR(dB) | 网络体验              |
| -------- | ----------------- |
| >20      | 非常好（速度快）          |
| 13~20    | 中等（你的 15，稳定但不是最快） |
| 0~10     | 差（卡顿）             |
| <0       | 很差（几乎不能用）         |



## SIM卡停机日志

```txt

07-10 14:50:59.452  2173  2295 D ATC     : AT> AT+QENG="servingcell"
07-10 14:50:59.461  2173  2375 D ATC     : AT< +QENG: "servingcell","LIMSRV","LTE","TDD",460,00,1F1B320,420,38950,40,5,5,4977,-110,-9,-105,19,8

```

"LIMSRV" - 连接状态，这里表示设备正受限服务（Limited Service）状态，可能是由于某些服务被限制或网络问题

## 机卡分离 和 区域限制

机卡分离和区域限制时, 设备的信号和小区状态都是正常的, 只是无法上网

## 域名和IP白名单设置



























