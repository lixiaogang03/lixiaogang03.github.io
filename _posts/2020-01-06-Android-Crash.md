---
layout:     post
title:      Android Crash
subtitle:   Android App 崩溃处理流程
date:       2020-01-06
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - crash
---

[理解Android Crash处理流程-gityuan](http://gityuan.com/2016/06/24/app-crash/)

## Process Start

![runtime_init](/images/android/crash_anr/runtime_init.png)

## Crash Init

![crash_init](/images/android/crash_anr/crash_init.png)

```java

public class RuntimeInit {

    private static final void commonInit() {
        if (DEBUG) Slog.d(TAG, "Entered RuntimeInit!");

        /* set default handler; this applies to all threads in the VM */
        Thread.setDefaultUncaughtExceptionHandler(new UncaughtHandler());

    }

}

public class Thread implements Runnable {

    // null unless explicitly set
    private static volatile UncaughtExceptionHandler defaultUncaughtExceptionHandler;

}

```

## Crash处理流程

![crash_trace](/images/android/crash_anr/crash_trace.png)





