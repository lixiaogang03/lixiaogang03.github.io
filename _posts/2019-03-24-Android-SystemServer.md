---
layout:     post
title:      Android SystemServer
subtitle:   Android system_server process
date:       2019-03-24
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - system_server
    - android
---

## Service

### StatusBarManagerService

[StatusBarManagerService](http://androidxref.com/7.1.2_r36/xref/frameworks/base/services/core/java/com/android/server/statusbar/StatusBarManagerService.java)

> StatusBarManagerService是SystemUI中的状态栏与导航栏在system_server中的代理.
> 所有对状态栏或导航栏有需求的对象都可以通过获取StatusBarManagerService的实例或Bp端达到其目的。
> 只不过使用者必须拥有能够完成操作的相应权限.

