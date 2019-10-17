---
layout:     post
title:      SElinux
subtitle:   MAC 强制访问控制
date:       2019-10-17
author:     LXG
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - selinux
---

## 架构

SElinux宏观上包含四个基本组件：对象管理器(OM), 访问向量缓存(AVC), 安全服务器, 安全策略

![selinux_arch](images/selinux/selinux_arch.png)

## 基本工作原理

当一个主体在一个selinux对象上完成一个操作，相关的对象管理器OM会向AVC查询，AVC返回查询结果，如果AVC中没有缓存则查询安全服务器，安全服务器将策略返回给AVC，AVC缓存后将安全决定传回对象管理器OM，最终完成安全检查

## 强制访问控制(MAC-mandatory access control)

MAC主要涉及三个概念：主体、对象、操作

* 主体：通常是活动进程
* 对象：通常是内核管理的操作系统级别的资源，比如文件、套接字、属性
* 操作：读写等资源的操作

## TE 和 MLS

Selinux支持两种形式的安全检查：类型强制(TE)和多层次安全(MLS)。MLS一般用于执行对受限信息的多层次访问。Selinux强制所有主体和对象都要有一个类型，selinux使用此类型执行其安全策略。

主体类型对应是进程和进程组，也被称为域(domain), 对象类型通常指定了对象在策略中扮演的角色，例如系统文件、应用数据文件

## SElinux 模式

1. disable: 关闭模式，不加载策略
2. permissive: 宽容模式，策略被加载，对象访问被检查，只记录不执行拦截
3. enforcing: 强制模式

可以使用getenforce和setenforce方法查询和设置

## 安全上下文

安全上下文(安全标签)是由分号分隔的四个域组成的字符串：用户名(u)、角色(r)、类型(sunmi_app)和一个可选的MLS安全范围(s0:c512,c768)

* 进程角色：r
* 文件角色：object_r

**ps -Z**

```txt

u:r:kernel:s0                  root      2796  2     0      0     worker_thr 00000000 S kworker/1:1
u:r:location_app:s0            system    2798  690   985284 36840 SyS_epoll_ 00000000 S com.qualcomm.location.XT
u:r:sunmi_app:s0               u0_a72    3132  690   997272 42236 SyS_epoll_ 00000000 S com.sunmi.toolbox
u:r:system_app:s0              system    3220  690   981328 35792 SyS_epoll_ 00000000 S com.qualcomm.qti.qs
u:r:untrusted_app:s0:c512,c768 u0_a77    3255  690   998264 47572 SyS_epoll_ 00000000 S cn.showmac.traffic
u:r:radio:s0                   radio     3310  690   982568 48280 SyS_epoll_ 00000000 S com.qualcomm.uimremoteclient:remote
u:r:priv_app:s0:c512,c768      u0_a1     3488  690   982960 38512 SyS_epoll_ 00000000 S com.android.providers.calendar

```

**ls -Z**

```txt

u:object_r:anr_data_file:s0           anr
u:object_r:sunmi_media_file:s0        sunmi
u:object_r:system_data_file:s0        system

```







