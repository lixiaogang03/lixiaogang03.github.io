---
layout:     post
title:      Android NetworkControl
subtitle:   网速和防火墙管理
date:       2019-09-26
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - android
    - netd
    - iptables
---

## netd

### 概述

Netd 是 Android 系统中专门负责网络管理和控制的后台守护程序，其功能主要分为三个部分

1. 设置防火墙(Firewall) 、网络地址转换(NAT) 、带宽控制 、无线网卡软接入点控制(Soft Access Ponit)控制，网络设备绑定等等
2. Android 系统中 DNS 信息的缓存和管理
3. 网络服务搜索功能(Net Service Discovery, 简称NSD)功能，包括服务注册(Service Registration) 、服务搜索(Service Browse)和服务名机械

Netd 的工作流程分为两个部分：

1. 接收并处理来自Framework层中的NetworkManagementService或者NsdService的命令。这些命令最终由Netd中对应的Command去处理
2. 接收并解析来自Kernel的UEvent消息，然后转发给Framework层对应的Service去处理

### 源码

tree system/netd

```txt

├── Android.mk
├── client
│   ├── Android.mk
│   ├── FwmarkClient.cpp
│   ├── FwmarkClient.h
│   └── NetdClient.cpp
├── include
│   ├── FwmarkCommand.h
│   ├── Fwmark.h
│   ├── NetdClient.h
│   ├── Permission.h
│   └── Stopwatch.h
├── MODULE_LICENSE_APACHE2
├── NOTICE
├── server
│   ├── Android.mk
│   ├── BandwidthController.cpp
│   ├── BandwidthController.h
│   ├── BandwidthControllerTest.cpp
│   ├── binder
│   │   └── android
│   │       └── net
│   │           ├── INetd.aidl
│   │           ├── metrics
│   │           │   └── INetdEventListener.aidl
│   │           ├── UidRange.aidl
│   │           ├── UidRange.cpp
│   │           └── UidRange.h
│   ├── ClatdController.cpp
│   ├── ClatdController.h
│   ├── CleanSpec.mk
│   ├── CommandListener.cpp
│   ├── CommandListener.h
│   ├── ConnmarkFlags.h
│   ├── Controllers.cpp
│   ├── Controllers.h
│   ├── DnsProxyListener.cpp
│   ├── DnsProxyListener.h
│   ├── DummyNetwork.cpp
│   ├── DummyNetwork.h
│   ├── DumpWriter.cpp
│   ├── DumpWriter.h
│   ├── EventReporter.cpp
│   ├── EventReporter.h
│   ├── FirewallController.cpp
│   ├── FirewallController.h
│   ├── FirewallControllerTest.cpp
│   ├── FwmarkServer.cpp
│   ├── FwmarkServer.h
│   ├── IdletimerController.cpp
│   ├── IdletimerController.h
│   ├── InterfaceController.cpp
│   ├── InterfaceController.h
│   ├── IptablesBaseTest.cpp
│   ├── IptablesBaseTest.h
│   ├── LocalNetwork.cpp
│   ├── LocalNetwork.h
│   ├── main.cpp
│   ├── MDnsSdListener.cpp
│   ├── MDnsSdListener.h
│   ├── NatController.cpp
│   ├── NatController.h
│   ├── NatControllerTest.cpp
│   ├── ndc.c
│   ├── NetdCommand.cpp
│   ├── NetdCommand.h
│   ├── NetdConstants.cpp
│   ├── NetdConstants.h
│   ├── NetdNativeService.cpp
│   ├── NetdNativeService.h
│   ├── netd.rc
│   ├── NetlinkHandler.cpp
│   ├── NetlinkHandler.h
│   ├── NetlinkManager.cpp
│   ├── NetlinkManager.h
│   ├── NetworkController.cpp
│   ├── NetworkController.h
│   ├── Network.cpp
│   ├── Network.h
│   ├── oem_iptables_hook.cpp
│   ├── oem_iptables_hook.h
│   ├── PhysicalNetwork.cpp
│   ├── PhysicalNetwork.h
│   ├── PppController.cpp
│   ├── PppController.h
│   ├── QtiConnectivityAdapter.cpp
│   ├── QtiConnectivityAdapter.h
│   ├── QtiDataController.cpp
│   ├── QtiDataController.h
│   ├── ResolverController.cpp
│   ├── ResolverController.h
│   ├── ResolverStats.h
│   ├── ResponseCode.h
│   ├── RouteController.cpp
│   ├── RouteController.h
│   ├── SockDiag.cpp
│   ├── SockDiag.h
│   ├── SockDiagTest.cpp
│   ├── SoftapController.cpp
│   ├── SoftapController.h
│   ├── StrictController.cpp
│   ├── StrictController.h
│   ├── StrictControllerTest.cpp
│   ├── TetherController.cpp
│   ├── TetherController.h
│   ├── UidRanges.cpp
│   ├── UidRanges.h
│   ├── VirtualNetwork.cpp
│   └── VirtualNetwork.h
└── tests
    ├── Android.mk
    ├── benchmarks
    │   ├── Android.mk
    │   ├── connect_benchmark.cpp
    │   ├── dns_benchmark.cpp
    │   └── main.cpp
    ├── binder_test.cpp
    ├── dns_responder
    │   ├── Android.mk
    │   ├── dns_responder_client.cpp
    │   ├── dns_responder_client.h
    │   ├── dns_responder.cpp
    │   └── dns_responder.h
    ├── netd_integration_test.cpp
    └── netd_test.cpp

```

### 进程启动


