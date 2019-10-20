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

[深入理解Netd](https://www.kancloud.cn/alex_wsc/android-wifi-nfc-gps/414019)

## netd

![android_netd](/images/android_netd.png)

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

```txt

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

```

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

### NetlinkManager.cpp(NM)

主要负责接收并解析来自Kernel的UEvent消息

```cpp

int NetlinkManager::start() {

    if ((mUeventHandler = setupSocket(&mUeventSock, NETLINK_KOBJECT_UEVENT,
         0xffffffff, NetlinkListener::NETLINK_FORMAT_ASCII, false)) == NULL) {
        return -1;
    }

    if ((mRouteHandler = setupSocket(&mRouteSock, NETLINK_ROUTE,
                                     RTMGRP_LINK |
                                     RTMGRP_IPV4_IFADDR |
                                     RTMGRP_IPV6_IFADDR |
                                     RTMGRP_IPV6_ROUTE |
                                     (1 << (RTNLGRP_ND_USEROPT - 1)),
         NetlinkListener::NETLINK_FORMAT_BINARY, false)) == NULL) {
        return -1;
    }

    if ((mQuotaHandler = setupSocket(&mQuotaSock, NETLINK_NFLOG,
            NFLOG_QUOTA_GROUP, NetlinkListener::NETLINK_FORMAT_BINARY, false)) == NULL) {
        ALOGW("Unable to open qlog quota socket, check if xt_quota2 can send via UeventHandler");
        // TODO: return -1 once the emulator gets a new kernel.
    }

    if ((mStrictHandler = setupSocket(&mStrictSock, NETLINK_NETFILTER,
            0, NetlinkListener::NETLINK_FORMAT_BINARY_UNICAST, true)) == NULL) {
        ALOGE("Unable to open strict socket");
        // TODO: return -1 once the emulator gets a new kernel.
    }

    return 0;

}

```

* NETLINK_KOBJECT_UEVENT: 代表kobject事件，这些事件包含的信息格式是NETLINK_FORMAT_ASCII，表示使用字符串解析的方式解析UEvent消息。
kobject一般用于通知内核中某个模块的加载和卸载。对NM来说关注的是 sys/class/net 下模块的加载和卸载消息

* NETLINK_ROUTE: 代表kernel中routing或者link改变时对应的消息。消息内容格式为NETLINK_FORMAT_BINARY

* NETLINK_NFLOG: 和带宽控制有关, netd中的带宽控制可以设置一个预警值，当网络数据超过一定字节数时就会触发kernel发送一个警告

* NETLINK_NETFILTER: Netfilter 利用一些封包过滤的规则设定, 来定义出什么数据包可以接收, 什么数据包需要剔除,位于内核层。
iptables 通过命令的方式对 Netfilter 规则进行排序与修改, 位于用户层

![netlink_manager_class](/images/netd/netlink_manager_class.png)

### NetlinkHandler.cpp

```cpp

void NetlinkHandler::onEvent(NetlinkEvent *evt) {

    if (!strcmp(subsys, "net")) {                              // NETLINK_KOBJECT_UEVENT、NETLINK_ROUTE

        --------------------------------------------------

        if (action == NetlinkEvent::Action::kAdd) {
            notifyInterfaceAdded(iface);
        } else if (action == NetlinkEvent::Action::kRemove) {
            notifyInterfaceRemoved(iface);
        }

        ---------------------------------------------------

    } else if (!strcmp(subsys, "qlog")
            || !strcmp(subsys, "xt_quota2")) {                 // NETLINK_NFLOG

        const char *alertName = evt->findParam("ALERT_NAME");
        const char *iface = evt->findParam("INTERFACE");
        notifyQuotaLimitReached(alertName, iface);             // 流量预警通知

    } else if (!strcmp(subsys, "strict")) {                    // NETLINK_NETFILTER

        const char *uid = evt->findParam("UID");
        const char *hex = evt->findParam("HEX");
        notifyStrictCleartext(uid, hex);

    } else if (!strcmp(subsys, "xt_idletimer")) {              // 用于跟踪某个NIC的工作状态，即是"idle"还是"active"

        const char *label = evt->findParam("INTERFACE");
        const char *state = evt->findParam("STATE");
        const char *timestamp = evt->findParam("TIME_NS");
        const char *uid = evt->findParam("UID");
        if (state)
            notifyInterfaceClassActivity(label, !strcmp("active", state),
                                         timestamp, uid);
    }

}

void NetlinkHandler::notify(int code, const char *format, ...) {
    char *msg;
    va_list args;
    va_start(args, format);
    if (vasprintf(&msg, format, args) >= 0) {
        mNm->getBroadcaster()->sendBroadcast(code, msg, false);             // 发送给 Framework 层的 NetworkManagerService
        free(msg);
    } else {
        SLOGE("Failed to send notification: vasprintf: %s", strerror(errno));
    }
    va_end(args);
}

void NetlinkHandler::notifyStrictCleartext(const char* uid, const char* hex) {
    notify(ResponseCode::StrictCleartext, "%s %s", uid, hex);
}

```

![netlink_manager](/images/netd/netlink_manager.png)

### CommandListener.cpp(CL)

主要作用是接收来自Framework的NetworkManagementService的命令

```cpp

void CommandListener::registerLockingCmd(FrameworkCommand *cmd, android::RWLock& lock) {
    registerCmd(new LockingFrameworkCommand(cmd, lock));
}

CommandListener::CommandListener() :
                 FrameworkListener("netd", true) {
    registerLockingCmd(new InterfaceCmd());
    registerLockingCmd(new IpFwdCmd());
    registerLockingCmd(new TetherCmd());
    registerLockingCmd(new NatCmd());
    registerLockingCmd(new ListTtysCmd());
    registerLockingCmd(new PppdCmd());
    registerLockingCmd(new SoftapCmd());
    registerLockingCmd(new BandwidthControlCmd(), gCtls->bandwidthCtrl.lock);
    registerLockingCmd(new IdletimerControlCmd());
    registerLockingCmd(new ResolverCmd());
    registerLockingCmd(new FirewallCmd(), gCtls->firewallCtrl.lock);
    registerLockingCmd(new ClatdCmd());
    registerLockingCmd(new NetworkCommand());
    registerLockingCmd(new StrictCmd());
    registerLockingCmd(getQtiConnectivityCmd(this));

    initializeDataControllerLib();

    /*
     * This is the only time we touch top-level chains in iptables; controllers
     * should only mutate rules inside of their children chains, as created by
     * the constants above.
     *
     * Modules should never ACCEPT packets (except in well-justified cases);
     * they should instead defer to any remaining modules using RETURN, or
     * otherwise DROP/REJECT.
     */

    // Create chains for children modules
    createChildChains(V4V6, "filter", "INPUT", FILTER_INPUT);
    createChildChains(V4V6, "filter", "FORWARD", FILTER_FORWARD);
    createChildChains(V4V6, "filter", "OUTPUT", FILTER_OUTPUT);
    createChildChains(V4V6, "raw", "PREROUTING", RAW_PREROUTING);
    createChildChains(V4V6, "mangle", "POSTROUTING", MANGLE_POSTROUTING);
    createChildChains(V4V6, "mangle", "FORWARD", MANGLE_FORWARD);
    createChildChains(V4, "nat", "PREROUTING", NAT_PREROUTING);
    createChildChains(V4, "nat", "POSTROUTING", NAT_POSTROUTING);

    // Let each module setup their child chains
    setupOemIptablesHook();

    /* When enabled, DROPs all packets except those matching rules. */
    gCtls->firewallCtrl.setupIptablesHooks();

    /* Does DROPs in FORWARD by default */
    gCtls->natCtrl.setupIptablesHooks();
    /*
     * Does REJECT in INPUT, OUTPUT. Does counting also.
     * No DROP/REJECT allowed later in netfilter-flow hook order.
     */
    gCtls->bandwidthCtrl.setupIptablesHooks();
    /*
     * Counts in nat: PREROUTING, POSTROUTING.
     * No DROP/REJECT allowed later in netfilter-flow hook order.
     */
    gCtls->idletimerCtrl.setupIptablesHooks();

    gCtls->bandwidthCtrl.enableBandwidthControl(false);

    if (int ret = RouteController::Init(NetworkController::LOCAL_NET_ID)) {
        ALOGE("failed to initialize RouteController (%s)", strerror(-ret));
    }
}

```

![command_listener](/images/netd/command_listener.png)

假设Client端发送的命令名是"nat"，当CL收到这个命令后，首先会从其构造函数中注册的那些命令对象中找到对应该名字（即"nat"）的命令对象，
其结果就是图中的NatCmd对象。而该命令最终的处理工作将由此NatCmd对象的runCommand函数完成

### ndc命令

**ndc monitor**

```txt

// 关闭wifi

130|L2K:/ # ndc monitor

[Connected to Netd]
614 Address removed 10.10.167.12/20 wlan0 128 0
616 Route removed fe80::/64 dev wlan0
614 Address removed fe80::20a:f5ff:fe05:888/64 wlan0 128 253
600 Iface linkstate wlan0 down
600 Iface linkstate wlan0 down
600 Iface linkstate wlan0 down
613 IfaceClass active 0 2316907674321 0
600 Iface linkstate rmnet_data0 up
616 Route updated fe80::/64 dev rmnet_data0
614 Address updated fe80::e14:e07f:1b23:67a5/64 rmnet_data0 196 253
600 Iface linkstate wlan0 down
614 Address updated 10.154.101.251/29 rmnet_data0 128 0
614 Address updated fe80::e14:e07f:1b23:67a5/64 rmnet_data0 128 253
600 Iface linkstate p2p0 down
600 Iface linkstate p2p0 down
600 Iface linkstate wlan0 down
600 Iface removed wlan0
600 Iface removed p2p0

```

## Iptables

### iptables --list

```txt

Chain INPUT (policy ACCEPT)
target     prot opt source               destination 
REJECT     all  --  anywhere             anywhere             owner UID match u0_a88 reject-with icmp-port-unreachable
REJECT     all  --  anywhere             anywhere             owner UID match u0_a88 reject-with icmp-port-unreachable
bw_INPUT   all  --  anywhere             anywhere
fw_INPUT   all  --  anywhere             anywhere

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
oem_fwd    all  --  anywhere             anywhere
fw_FORWARD  all  --  anywhere             anywhere
bw_FORWARD  all  --  anywhere             anywhere
natctrl_FORWARD  all  --  anywhere             anywhere

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
REJECT     all  --  anywhere             anywhere             owner UID match u0_a88 reject-with icmp-port-unreachable
REJECT     all  --  anywhere             anywhere             owner UID match u0_a88 reject-with icmp-port-unreachable
oem_out    all  --  anywhere             anywhere
fw_OUTPUT  all  --  anywhere             anywhere
st_OUTPUT  all  --  anywhere             anywhere
bw_OUTPUT  all  --  anywhere             anywhere
blacklist-mms  all  --  anywhere             anywhere

Chain blacklist-mms (1 references)
target     prot opt source               destination
DROP       all  --  anywhere             10.0.0.200           owner UID match u0_a88
DROP       all  --  anywhere             10.0.0.172           owner UID match u0_a88
DROP       all  --  anywhere             10.0.0.200           owner UID match system
DROP       all  --  anywhere             10.0.0.172           owner UID match system
DROP       all  --  anywhere             10.0.0.200           owner UID match u0_a84
DROP       all  --  anywhere             10.0.0.172           owner UID match u0_a84
DROP       all  --  anywhere             10.0.0.200           owner UID match u0_a89
DROP       all  --  anywhere             10.0.0.172           owner UID match u0_a89
DROP       all  --  anywhere             10.0.0.200           owner UID match u0_a90
DROP       all  --  anywhere             10.0.0.172           owner UID match u0_a90
DROP       all  --  anywhere             10.0.0.200           owner UID match u0_a91
DROP       all  --  anywhere             10.0.0.172           owner UID match u0_a91

Chain bw_FORWARD (1 references)
target     prot opt source               destination

Chain bw_INPUT (1 references)
target     prot opt source               destination
           all  --  anywhere             anywhere             ! quota globalAlert: 2097152 bytes
           all  --  anywhere             anywhere             owner socket exists

Chain bw_OUTPUT (1 references)
target     prot opt source               destination
           all  --  anywhere             anywhere             ! quota globalAlert: 2097152 bytes
           all  --  anywhere             anywhere             owner socket exists

Chain bw_costly_shared (0 references)
target     prot opt source               destination
bw_penalty_box  all  --  anywhere             anywhere

Chain bw_data_saver (1 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere

Chain bw_happy_box (1 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere             owner UID match u0_a8
RETURN     all  --  anywhere             anywhere             owner UID match u0_a29
RETURN     all  --  anywhere             anywhere             owner UID match 0-9999
bw_data_saver  all  --  anywhere             anywhere

Chain bw_penalty_box (1 references)
target     prot opt source               destination
bw_happy_box  all  --  anywhere             anywhere

Chain fw_FORWARD (1 references)
target     prot opt source               destination

Chain fw_INPUT (1 references)
target     prot opt source               destination

Chain fw_OUTPUT (1 references)
target     prot opt source               destination

Chain fw_dozable (0 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere
RETURN     tcp  --  anywhere             anywhere             tcp flags:RST/RST
RETURN     all  --  anywhere             anywhere             owner UID match 0-9999
DROP       all  --  anywhere             anywhere

Chain fw_powersave (0 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere
RETURN     tcp  --  anywhere             anywhere             tcp flags:RST/RST
RETURN     all  --  anywhere             anywhere             owner UID match 0-9999
DROP       all  --  anywhere             anywhere

Chain fw_standby (0 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere
RETURN     tcp  --  anywhere             anywhere             tcp flags:RST/RST

Chain natctrl_FORWARD (1 references)
target     prot opt source               destination
DROP       all  --  anywhere             anywhere

Chain natctrl_tether_counters (0 references)
target     prot opt source               destination

Chain oem_fwd (1 references)
target     prot opt source               destination

Chain oem_out (1 references)
target     prot opt source               destination

Chain st_OUTPUT (1 references)
target     prot opt source               destination

Chain st_clear_caught (2 references)
target     prot opt source               destination

Chain st_clear_detect (0 references)
target     prot opt source               destination
REJECT     all  --  anywhere             anywhere             connmark match  0x2000000/0x2000000 reject-with icmp-port-unreachable
RETURN     all  --  anywhere             anywhere             connmark match  0x1000000/0x1000000
CONNMARK   tcp  --  anywhere             anywhere             u32 "0x0>>0x16&0x3c@0xc>>0x1a&0x3c@0x0&0xffff0000=0x16030000&&0x0>>0x16&0x3c@0xc>>0x1a&0x3c@0x4&0xff0000=0x10000" CONNMARK or 0x1000000
CONNMARK   udp  --  anywhere             anywhere             u32 "0x0>>0x16&0x3c@0x8&0xffff0000=0x16fe0000&&0x0>>0x16&0x3c@0x14&0xff0000=0x10000" CONNMARK or 0x1000000
RETURN     all  --  anywhere             anywhere             connmark match  0x1000000/0x1000000
st_clear_caught  tcp  --  anywhere             anywhere             state ESTABLISHED u32 "0x0>>0x16&0x3c@0xc>>0x1a&0x3c@0x0&0x0=0x0"
st_clear_caught  udp  --  anywhere             anywhere

Chain st_penalty_log (0 references)
target     prot opt source               destination
CONNMARK   all  --  anywhere             anywhere             CONNMARK or 0x1000000
NFLOG      all  --  anywhere             anywhere

Chain st_penalty_reject (0 references)
target     prot opt source               destination
CONNMARK   all  --  anywhere             anywhere             CONNMARK or 0x2000000
NFLOG      all  --  anywhere             anywhere
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

```

### 概念

iptables是Linux系统中最重要的网络管控工具。它与Kernel中的netfilter模块配合工作，其主要功能是为netfilter设置一些过滤（filter）或网络地址转换（NAT）的规则。当Kernel收到网络数据包后，将会依据iptables设置的规则进行相应的操作。举个最简单的例子，可以利用iptables设置这样一条防火墙规则：丢弃来自IP地址为192.168.1.108的所有数据包

![iptables_rule](/images/netd/iptables_rule.jpg)

* iptables内部(其实是Kernel的netfilter模块)维护着四个Table，分别是filter、nat、mangle和raw
* Table中定义了Chain。一个Table可以支持多个Chain，Chain实际上是Rule的集合，每个Table都有默认的Chain。例如filter表默认的Chain有INPUT、OUTPUT、FORWARD。用户可以自定义Chain，也可修改Chain中的Rule
* Rule就是iptables工作的规则。首先，系统将检查要处理的数据包是否满足Rule设置的条件，如果满足则执行Rule中设置的目标(Target)，否则继续执行Chain中的下一条Rule

![iptables_chain](/images/netd/iptables_chain.jpg)

### 工作过程

1. 数据包从左边进入IP协议栈，进行IP校验以后，数据包被第一个钩子函数PRE_ROUTING处理，然后就进入路由模块，由其决定该数据包是转发出去还是送给本机
2. 若该数据包是送给本机的，则要经过钩子函数LOCAL_IN处理后传递给本机的上层协议
3. 若该数据包应该被转发，则它将被钩子函数FORWARD处理，然后还要经钩子函数POST_ROUTING处理后才能传输到网络
4. 本机进程产生的数据包要先经过钩子函数LOCAL_OUT处理后，再进行路由选择处理，然后经过钩子函数POST_ROUTING处理后再发送到网络

![iptables_principle](/images/netd/iptables_principle.png)

### 命令

![iptables_rule_format](/images/netd/iptables_rule_format.png)

**Target**

```txt

ACCEPT：接收数据包。
DROP：直接丢弃数据包。没有任何信息会反馈给数据源端。
REJECT: 直接丢弃数据包。会反馈给数据源端。
RETURN：返回到调用Chain，略过后续的Rule处理。
QUEUE：数据返回到用户空间去处理。

```

**Action**

```txt

-t：指定table。如果不带此参数，则默认为filter表。
-A，--append chain rule-specification：在指定Chain的末尾添加一条Rule，rule-specification指明该Rule的内容。
-D，--delete chain rule-specification：删除指定Chain中满足rule-specification的那条Rule。
-I，--insert chain[rule num]rule-specification：为指定Chain插入一条Rule，位置由rule num指定。如果没有该参数，则默认加到Chain-N：创建一条新Chain。
-L，--list：显示指定Table的Chain和Rule的信息。

-i：指定接收数据包的网卡名，如eth0、eth1等。
-o：指定发出数据包的网卡名。
-p：指定协议，如tcp、udp等。
-s，--source address[/mask]：指定数据包的源IP地址。
-j，--jump target：跳转到指定目标，如ACCEPT、DROP等

```

**Demo**

iptables -t filter -A INPUT -s 192.168.1.108 -j DROP


**List the rules in a chain**

```txt

L2K:/ # iptables -L INPUT

Chain INPUT (policy ACCEPT)
target     prot opt source               destination
REJECT     all  --  anywhere             anywhere             owner UID match u0_a88 reject-with icmp-port-unreachable
REJECT     all  --  anywhere             anywhere             owner UID match u0_a88 reject-with icmp-port-unreachable
bw_INPUT   all  --  anywhere             anywhere
fw_INPUT   all  --  anywhere             anywhere
DROP       all  --  192.168.1.108        anywhere

```

**Print the rules in a chain**

```txt

L2K:/ # iptables -S INPUT
-P INPUT ACCEPT
-A INPUT -i wlan0 -m owner --uid-owner 10088 -j REJECT --reject-with icmp-port-unreachable
-A INPUT -i rmnet_data0 -m owner --uid-owner 10088 -j REJECT --reject-with icmp-port-unreachable
-A INPUT -j bw_INPUT
-A INPUT -j fw_INPUT
-A INPUT -s 192.168.1.108/32 -j DROP

```













