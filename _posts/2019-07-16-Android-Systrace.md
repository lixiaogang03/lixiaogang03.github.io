---
layout:     post
title:      Android Systrace
subtitle:   Performance tools
date:       2019-07-16
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - performance
---

[systrace-看云](https://www.kancloud.cn/digest/itfootballprefermanc/100913)

[systrace-官网](https://developer.android.com/studio/profile/systrace)

## 简介

![systrace_demo](/images/systrace_demo.png)

## Android Device Monitor
 
1. ./sdk/tools/monitor

2. ![monitor](/images/android_device_monitor.png)

3. ![systrace](/images/systrace.png)

## 命令行

### 命令行抓取systrace

> python ./platform-tools/systrace/systrace.py --time=10 -o mynewtrace.html sched gfx view wm

```txt

lixiaogang@lixiaogang-OptiPlex-7020:~/Android/Sdk$ python ./platform-tools/systrace/systrace.py --time=10 -o mynewtrace.html sched gfx view wm
Starting tracing (10 seconds)
Tracing completed. Collecting output...
Outputting Systrace results...
Tracing complete, writing results

Wrote trace HTML file: file:///home/lixiaogang/Android/Sdk/mynewtrace.html

```

### 列出当前设备支持的抓取类别

> python ./platform-tools/systrace/systrace.py --list-categories

> python ./platform-tools/systrace/systrace.py --help

```txt

lixiaogang@lixiaogang-OptiPlex-7020:~/Android/Sdk$ python ./platform-tools/systrace/systrace.py --list-categories
         gfx - Graphics
       input - Input
        view - View System
     webview - WebView
          wm - Window Manager
          am - Activity Manager
          sm - Sync Manager
       audio - Audio
       video - Video
      camera - Camera
         hal - Hardware Modules
         app - Application
         res - Resource Loading
      dalvik - Dalvik VM
          rs - RenderScript
      bionic - Bionic C Library
       power - Power Management
          pm - Package Manager
          ss - System Server
    database - Database
     network - Network
       sched - CPU Scheduling
        freq - CPU Frequency
        idle - CPU Idle
        load - CPU Load
  memreclaim - Kernel Memory Reclaim
  binder_driver - Binder Kernel driver
  binder_lock - Binder global lock trace

NOTE: more categories may be available with adb root

```

### 命令行参数

![systrace_param](/images/systrace_param.png)





