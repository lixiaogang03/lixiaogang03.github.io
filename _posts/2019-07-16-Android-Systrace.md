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


## 参考网址

[systrace-看云](https://www.kancloud.cn/digest/itfootballprefermanc/100913)

[systrace-官网](https://developer.android.com/studio/profile/systrace)

[systrace-AOSP](https://source.android.com/devices/tech/debug/systrace)

[systace-Gityuan](http://gityuan.com/2016/01/17/systrace/)

## 简介

![systrace_demo](/images/performance/systrace/systrace_demo.png)

## Android Device Monitor
 
1. ./sdk/tools/monitor

2. ![monitor](/images/performance/systrace/android_device_monitor.png)

3. ![systrace](/images/performance/systrace/systrace.png)

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

    python systrace.py [options] [category1] [category2] ... [categoryN]

|options|解释|
|---|---|
|-o `<FILE`>|输出的目标文件
|-t N, --time=N|    执行时间，默认5s|
|-b N, --buf-size=N|buffer大小（单位kB),用于限制trace总大小，默认无上限|
|-k `<KFUNCS`>，--ktrace=`<KFUNCS`>|    追踪kernel函数，用逗号分隔|
|-a `<APP_NAME`>,--app=`<APP_NAME`>|    追踪应用包名，用逗号分隔|
|--from-file=`<FROM_FILE`>|从文件中创建互动的systrace|
|-e `<DEVICE_SERIAL`>,--serial=`<DEVICE_SERIAL`>|指定设备|
|-l, --list-categories|列举可用的tags|

## 报告分析

### 打开报告

> google-chrome mynewtrace.html

### 快捷键

#### 导航操作

|导航操作|作用|
|---|---|
|w|放大，[+shift]速度更快|
|s|缩小，[+shift]速度更快|
|a|左移，[+shift]速度更快|
|d|右移，[+shift]速度更快|

#### 快捷操作

|常用操作|作用|
|---|---|
|f|**放大**当前选定区域|
|m|**标记**当前选定区域|
|v|高亮**VSync**|
|g|切换是否显示**60hz**的网格线|
|0|恢复trace到**初始态**，这里是数字0而非字母o|

|一般操作|作用|
|---|---|
|h|切换是否显示详情|
|/|搜索关键字|
|enter|显示搜索结果，可通过← →定位搜索结果|
|`|显示/隐藏脚本控制台|
|?|显示帮助功能|

#### 模式切换

1. Select mode: **双击已选定区**能将所有相同的块高亮选中；（对应数字1）
2. Pan mode: 拖动平移视图（对应数字2）
3. Zoom mode:通过上/下拖动鼠标来实现放大/缩小功能；（对应数字3）
4. Timing mode:拖动来创建或移除时间窗口线。（对应数字4）


可通过按数字1~4，用于切换鼠标模式； 另外，按住alt键，再滚动鼠标滚轮能实现放大/缩小功能。

#### 搜索

1. 输入搜索内容,然后Endter键
2. 鼠标定位搜索结果面板
3. 单击M按键定位位置

![systrace_search](/images/performance/systrace/systrace_search.png)

## 代码增加trace

### java framework层

    import android.os.Trace;
    Trace.traceBegin(long traceTag, String methodName)
    Trace.traceEnd(long traceTag)
    Trace.asyncTraceBegin(long traceTag, String methodName, int cookie) {
    Trace.asyncTraceEnd(long traceTag, String methodName, int cookie)

    Trace.asyncTraceEnd(TRACE_TAG_PACKAGE_MANAGER, "queueInstall", System.identityHashCode(params));
    Trace.traceBegin(TRACE_TAG_PACKAGE_MANAGER, "startCopy");

在代码中必须成对出现，一般将traceEnd放入到finally语句块，另外，必须在同一个线程。


### app层

    import android.os.Trace;
    Trace.beginSection(String sectionName)
    Trace.EndSection()

这里默认的traceTag为`TRACE_TAG_APP`，systrace命令通过指定app参数即

### native framework层

    #include<utils/Trace.h>
    ATRACE_CALL();  // 利用ScopedTrace对象的创建和回收


**system/core/include/utils/Trace.h**

```cpp

#define ATRACE_NAME(name) ScopedTrace ___tracer(name)

// ATRACE_CALL is an ATRACE_NAME that uses the current function name.
#define ATRACE_CALL() ATRACE_NAME(__FUNCTION__)

class ScopedTrace {
  public:
    inline ScopedTrace(const char *name) {
      ATrace_beginSection(name);
    }

    inline ~ScopedTrace() {
      ATrace_endSection();
    }
};

```

## systrace分析案例

### 应用启动分析

[AppLaunch](http://chendongqi.me/2017/02/18/systrace_appLauncher/)

