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
3. 网络服务搜索功能(Net Service Discovery, 简称NSD)功能，包括服务注册(Service Registration) 、服务搜索(Service Browse)和服务名解析(Service Resolve)等

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

### socket

system/netd/server/netd.rc

```rc

service netd /system/bin/netd
    class main
    socket netd stream 0660 root system
    socket dnsproxyd stream 0660 root inet
    socket mdns stream 0660 root system
    socket fwmarkd stream 0660 root inet

```

* Framework 层中 NetworkManagementService和NsdService将分别和"netd"及"mdns"建立链接并交互
* 每一个调用域名解析socket API的进程都会借由"dnsproxyd"监听socket与Netd建立链接

### netstat -apn | grep netd

Active UNIX domain sockets (servers and established)
Proto RefCnt Flags       Type       State           I-Node PID/Program Name    Path
unix  2      [ ACC ]     STREAM     LISTENING        13121 770/netd            /dev/socket/netd
unix  2      [ ACC ]     STREAM     LISTENING        13126 770/netd            /dev/socket/dnsproxyd
unix  2      [ ACC ]     STREAM     LISTENING        13129 770/netd            /dev/socket/mdns
unix  2      [ ACC ]     STREAM     LISTENING        13132 770/netd            /dev/socket/fwmarkd
unix  3      [ ]         STREAM     CONNECTED        22795 770/netd            /dev/socket/mdns
unix  3      [ ]         STREAM     CONNECTED        21159 770/netd
unix  2      [ ]         DGRAM                       13174 770/netd
unix  3      [ ]         STREAM     CONNECTED        22773 770/netd            /dev/socket/netd
unix  3      [ ]         STREAM     CONNECTED        21160 770/netd

### main.cpp

```cpp

int main() {

    using android::net::gCtls;

    ALOGI("Netd 1.0 starting");
    remove_pid_file();

    blockSigpipe();

    NetlinkManager *nm = NetlinkManager::Instance();
    if (nm == nullptr) {
        ALOGE("Unable to create NetlinkManager");
        exit(1);
    };

    gCtls = new android::net::Controllers();

    -------------------netd socket--------------------

    CommandListener cl;
    nm->setBroadcaster((SocketListener *) &cl);

    if (nm->start()) {
        ALOGE("Unable to start NetlinkManager (%s)", strerror(errno));
        exit(1);
    }

    -------------------dnsproxyd socket------------------------------

    // Set local DNS mode, to prevent bionic from proxying
    // back to this service, recursively.
    setenv("ANDROID_DNS_MODE", "local", 1);
    DnsProxyListener dpl(&gCtls->netCtrl, &gCtls->eventReporter);
    if (dpl.startListener()) {
        ALOGE("Unable to start DnsProxyListener (%s)", strerror(errno));
        exit(1);
    }

    -------------------mdns socket-------------------------------------

    MDnsSdListener mdnsl;
    if (mdnsl.startListener()) {
        ALOGE("Unable to start MDnsSdListener (%s)", strerror(errno));
        exit(1);
    }

    -------------------fwmarkd socket-----------------------------------

    FwmarkServer fwmarkServer(&gCtls->netCtrl, &gCtls->eventReporter);
    if (fwmarkServer.startListener()) {
        ALOGE("Unable to start FwmarkServer (%s)", strerror(errno));
        exit(1);
    }


    status_t ret;
    if ((ret = NetdNativeService::start()) != android::OK) {
        ALOGE("Unable to start NetdNativeService: %d", ret);
        exit(1);
    }

    /*
     * Now that we're up, we can respond to commands. Starting the listener also tells
     * NetworkManagementService that we are up and that our binder interface is ready.
     */
    if (cl.startListener()) {
        ALOGE("Unable to start CommandListener (%s)", strerror(errno));
        exit(1);
    }

    write_pid_file();

    IPCThreadState::self()->joinThreadPool();

    ALOGI("Netd exiting");

    remove_pid_file();

    exit(0);

}

```

* NetlinkManager: 接收并处理来自Kernel的UEvent消息。这些消息经NetlinkManager解析后将借助它的Broadcaster(CommandListener) 发送给Framework层的NetworkManagementService
* CommandListener: 创建netd socket, 处理来自客户端的命令
* DnsProxyListener: dnsproxyd socket
* MDnsSdListener: mdns socket
* FwmarkServer: fwmarkd socket










