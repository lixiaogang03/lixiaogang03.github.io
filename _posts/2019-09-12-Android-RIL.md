---
layout:     post
title:      Android RIL
subtitle:   RILJ, RILC, RILD
date:       2019-09-12
author:     LXG
header-img: img/post-bg-iWatch.jpg
catalog: true
tags:
    - android
    - telephony
    - ril
---

## 背景

```java

// 电话状态跟踪
public abstract class CallTracker extends Handler

// 无线服务状态跟踪
public class ServiceStateTracker extends Handler

// 数据连接状态跟踪
public class DcTracker extends Handler;

```

以上三个 Tracker 对象负责与 RIL 类的 Java 对象进行交互，而这些交互在 RIL 层中的处理是与 Modem 基于串口连接的AT命令的发送和执行，最终完成语音通话、网络服务状态和网络数据连接的控制和管理

## 框架

RIL(Radio Interface Layer) 无线通信接口层， 在 Android 源码中分为两大部分

1. Framework 层的 Java 部分，简称 RILJ
2. HAL 层中的 C++ 程序，简称 RILC

![android_ril](/images/android_ril.png)

RILJ 与 RILC 之间通过 rild 端口的 Socket 连接进行 RIL 消息的交互和处理

RILC 与 Modem 之间通过 AT 命令的发送和执行，完成 Modem 的操作控制和查询请求以及 Modem 主动上报的消息处理

