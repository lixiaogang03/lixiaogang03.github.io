---
layout:     post
title:      Android Trace
subtitle:   代码调试方法
date:       2020-01-17
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
    - trace
---

[Android打印Trace堆栈-Gityuan](http://gityuan.com/2017/07/09/android_debug/)

## 当前线程Trace

### Java

```java

Thread.currentThread().dumpStack();   //方法1

android.util.Log.d(TAG,"Gityuan", new RuntimeException("Gityuan")); //方法2

android.util.Log.d(TAG, android.util.Log.getStackTraceString(new Throwable())); // 方法3

new RuntimeException("Gityuan").printStackTrace(); //方法4

```

### Native

```cpp

#include <utils/CallStack.h>
android::CallStack stack(("Gityuan"));

```

## 目标进程Trace

### Java

```java

adb shell kill -3 [pid]     //方法1
Process.sendSignal(pid, Process.SIGNAL_QUIT)  //方法2

```

### Native

```cpp

adb shell debuggerd -b [tid] //方法1
Debug.dumpNativeBacktraceToFile(pid, tracesPath) //方法2

```

### Kernel

```c

adb shell cat /proc/[tid]/stack  //方法1
WatchDog.dumpKernelStackTraces() //方法2

```

## 小结

以下分别列举输出Java, Native, Kernel的调用栈方式：

|类别|函数式|命令式|
|---|---|---|
|Java|Process.sendSignal(pid, Process.SIGNAL_QUIT)|kill -3 [pid]|
|Native|Debug.dumpNativeBacktraceToFile(pid, tracesPath)|debuggerd -b [pid]|
|Kernel|WD.dumpKernelStackTraces()|cat /proc/[tid]/stack|


