---
layout:     post
title:      Adb Shell Conmand
subtitle:   Shell
date:       2018-10-10
author:     LXG
header-img: img/post-bg-ios10.jpg
catalog: true
tags:
    - adb
    - debug
    - shell
    - linux
---

## 参考文章

[ADB Shell Commands-官方](http://androiddoc.qiniudn.com/tools/help/shell.html)

[Pm命令-Gityuan](http://gityuan.com/2016/02/28/pm-command/)

[Am命令-Gityuan](http://gityuan.com/2016/02/27/am-command/)

[Ps命令-Gityuan](http://gityuan.com/2015/10/11/ps-command/)

[adb常用命令查询表](https://github.com/mzlogin/awesome-adb/blob/master/README.md)

## Adb Shell Conmand


| shell 命令          | 服务                                |  含义              | 详细信息        |
|:---------------:|:------------------------------:|:----------------:|:----------------:|
| pm list permissions -g -d       | PMS | 查看系统中的危险权限列表 |
| dumpsys package com.immomo.momo       | PMS | 查看某个应用的AndroidManifest.xml的配置情况 |
| ps -t -p 2390       | Linux | 查看某个进程的线程情况 |
| dumpsys activity p com.android.baseservice       | AMS | 查看某个应用的进程(ProcessRecord)情况 |
| wm size       | WMS | 查看本机分辨率 | Physical size: 1920x1080 |
| wm density       | WMS | 查看本机屏幕密度(ro.sf.lcd_density) | DisplayMetrics.java |
| wm density 260      | WMS | 设置本机屏幕密度(ro.sf.lcd_density) | Physical density: 230 Override density: 260 |
| wm density reset      | WMS | 重置本机屏幕密度(ro.sf.lcd_density) |
| aapt dump badging *.apk      | SDK | 根据APK查询包名 |


