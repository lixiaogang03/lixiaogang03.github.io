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

1. 由iptables客户端调用命令来配置管理防火墙，最后相关请求发送到内核模块；内核模块用于组织iptables使用的表、链和规则。
2. iptables依赖netfilter来注册各种hooks实现对数据包的具体转发逻辑控制

![linux_iptables](/images/linux_iptables.png)

### Iptable Setting

Netd是Android系统中专门负责网络管理和控制的后台daemon程序，其功能主要分三大块：

1. 设置防火墙（Firewall）、网络地址转换（NAT）、带宽控制、无线网卡软接入点（Soft Access Point）控制，网络设备绑定（Tether）等
2. Android系统中DNS信息的缓存和管理
3. 网络服务搜索（Net Service Discovery，简称NSD）功能，包括服务注册（Service Registration）、服务搜索（Service Browse）和服务名解析（Service Resolve）等


Netd的工作流程和Vold类似，其工作可分成两部分:
- Netd接收并处理来自Framework层中NetworkManagementService或NsdService的命令。这些命令最终由Netd中对应的Command对象去处理
- Net接收并解析来自Kernel的UEvent消息，然后再转发给Framework层中对应Service去处理

Netd位于Framework层和Kernel层之间，它是Android系统中网络相关消息和命令转发及处理的中枢模块

![android_netd](/images/android_netd.png)

### 工作原理

1. 数据包从左边进入IP协议栈，进行IP校验以后，数据包被第一个钩子函数PRE_ROUTING处理，然后就进入路由模块，由其决定该数据包是转发出去还是送给本机
2. 若该数据包是送给本机的，则要经过钩子函数LOCAL_IN处理后传递给本机的上层协议
3. 若该数据包应该被转发，则它将被钩子函数FORWARD处理，然后还要经钩子函数POST_ROUTING处理后才能传输到网络
4. 本机进程产生的数据包要先经过钩子函数LOCAL_OUT处理后，再进行路由选择处理，然后经过钩子函数POST_ROUTING处理后再发送到网络

![iptables_principle](/images/iptables_principle.png)

### 规则

![iptables_rule](/images/iptables_rule.png)

### iptables 命令格式

![iptables_rule_format](/images/iptables_rule_format.png)

添加一条规则

> iptables -A INPUT -p icmp -s 10.24.67.97 -j DROP       //drop掉源为10.24.67.97的icmp报文

删除一条规则

> iptables -D INPUT -p icmp -s 10.24.67.97 -j DROP





