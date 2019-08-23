---
layout:     post
title:      Android Iptables
subtitle:   Android network firewall
date:       2019-08-23
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - android
    - iptables
---

[linux网络基础知识-简书](https://www.jianshu.com/p/47baebc39923)

### 架构

![linux_iptables](/images/linux_iptables.png)

1. 由iptables客户端调用命令来配置管理防火墙，最后相关请求发送到内核模块；内核模块用于组织iptables使用的表、链和规则。
2. iptables依赖netfilter来注册各种hooks实现对数据包的具体转发逻辑控制

### netd

![android_netd](/images/android_netd.png)

Netd是Android系统中专门负责网络管理和控制的后台daemon程序，其功能主要分三大块：

1. 设置防火墙（Firewall）、网络地址转换（NAT）、带宽控制、无线网卡软接入点（Soft Access Point）控制，网络设备绑定（Tether）等
2. Android系统中DNS信息的缓存和管理
3. 网络服务搜索（Net Service Discovery，简称NSD）功能，包括服务注册（Service Registration）、服务搜索（Service Browse）和服务名解析（Service Resolve）等


Netd的工作流程和Vold类似，其工作可分成两部分:
- Netd接收并处理来自Framework层中NetworkManagementService或NsdService的命令。这些命令最终由Netd中对应的Command对象去处理
- Net接收并解析来自Kernel的UEvent消息，然后再转发给Framework层中对应Service去处理

Netd位于Framework层和Kernel层之间，它是Android系统中网络相关消息和命令转发及处理的中枢模块



