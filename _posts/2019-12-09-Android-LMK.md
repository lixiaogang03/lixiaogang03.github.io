---
layout:     post
title:      Android LMK
subtitle:   LowMemoryKiller
date:       2019-12-09
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - lmk
---

[lowmemorykiller-Gityuan](http://gityuan.com/2016/09/17/android-lowmemorykiller/)

[LowmemoryKiller机制分析-简书](https://www.jianshu.com/p/221f4a246b45)

## 架构

![lmk_arch](/images/lmk/lmk_arch.png)

## Framework

[ActivityManagerService.java](http://androidxref.com/7.1.2_r36/xref/frameworks/base/services/core/java/com/android/server/am/ActivityManagerService.java)

位于`ProcessList.java`中定义了3种命令类型，这些文件的定义必须跟`lmkd.c`定义完全一致，格式分别如下：

    LMK_TARGET <minfree> <minkillprio> ... (up to 6 pairs)
    LMK_PROCPRIO <pid> <prio>
    LMK_PROCREMOVE <pid>

上述3个命令的使用都通过`ProcessList.java`中的如下方法:

|功能|命令|对应方法|
|---|---|---|---|
|LMK_PROCPRIO|设置进程adj|PL.setOomAdj()|
|LMK_TARGET|更新oom_adj|PL.updateOomLevels()|
|LMK_PROCREMOVE|移除进程|PL.remove()|

- 当AMS.applyOomAdjLocked()过程,则会设置某个进程的adj;
- 当AMS.updateConfiguration()过程中便会更新整个各个级别的oom_adj信息.
- 当AMS.cleanUpApplicationRecordLocked()或者handleAppDiedLocked()过程,则会将某个进程从lmkd策略中移除.

### applyOomAdjLocked

**设置某个进程的adj---/proc/pid/oom_score_adj**

```java

// ActivityManagerService.java

    private final int computeOomAdjLocked(ProcessRecord app, int cachedAdj, ProcessRecord TOP_APP,
            boolean doingAll, long now) {

        --------------------------------------------------

    }

    private final boolean applyOomAdjLocked(ProcessRecord app, boolean doingAll, long now,
            long nowElapsed) {

        -----------------------------------------------------
            ProcessList.setOomAdj(app.pid, app.info.uid, app.curAdj);
        -----------------------------------------------------

    }

// ProcessList.java

    static final byte LMK_TARGET = 0;            // 更新水位线
    static final byte LMK_PROCPRIO = 1;          // 更新oom_adj
    static final byte LMK_PROCREMOVE = 2;


    public static final void setOomAdj(int pid, int uid, int amt) {

        buf.putInt(LMK_PROCPRIO);
        buf.putInt(pid);
        buf.putInt(uid);
        buf.putInt(amt);
        writeLmkd(buf);

    }


    private static void writeLmkd(ByteBuffer buf) {

        // lmkd socket write

    }

```

[oom_adj](/images/lmk/oom_adj.png)

命令查看：adb shell dumpsys activity oom | grep "com.android.settings" -A 5

### updateConfiguration

**更新窗口配置，这个过程中，分别向/sys/module/lowmemorykiller/parameters目录下的minfree和adj节点写入相应数值**

```java

// AMS

    public void updateConfiguration(Configuration values) {

        -------------------------------------------------

        // Update OOM levels based on display size.
        mProcessList.applyDisplaySize(mWindowManager);

        -------------------------------------------------

    }

// ProcessList

    void applyDisplaySize(WindowManagerService wm) {

        ---------------------------------------

        // 传入屏幕的尺寸
        updateOomLevels(p.x, p.y, true);

        ---------------------------------------

    }

    private void updateOomLevels(int displayWidth, int displayHeight, boolean write) {

        -----------------------------------------------

        if (write) {
            ByteBuffer buf = ByteBuffer.allocate(4 * (2*mOomAdj.length + 1));
            buf.putInt(LMK_TARGET);
            for (int i=0; i<mOomAdj.length; i++) {
                buf.putInt((mOomMinFree[i]*1024)/PAGE_SIZE); // 五个水位线
                buf.putInt(mOomAdj[i]); // 与上面水位线对应的五个adj数值
            }

            writeLmkd(buf);
            SystemProperties.set("sys.sysctl.extra_free_kbytes", Integer.toString(reserve));
        }

        -----------------------------------------------

    }


```

这里携带的命令协议是LMK_TARGET, 要求kernel更新如下两个文件

> /sys/module/lowmemorykiller/parameters/minfree   // 水位线
> /sys/module/lowmemorykiller/parameters/adj       // 水位线对应的adj

```txt

L2# cat /sys/module/lowmemorykiller/parameters/minfree
15360,19200,23040,26880,34415,43737

L2# cat /sys/module/lowmemorykiller/parameters/adj
0,100,200,300,900,906

```

### cleanUpApplicationRecordLocked

**这里携带的命令协议是LMK_PROCREMOVE, 删除/proc/<pid>下面的文件**

```java

// AMS

    private final boolean cleanUpApplicationRecordLocked(ProcessRecord app,
            boolean restarting, boolean allowRestart, int index, boolean replacingPid) {
        Slog.d(TAG, "cleanUpApplicationRecord -- " + app.pid);
        if (index >= 0) {
            removeLruProcessLocked(app);
            ProcessList.remove(app.pid);
        }

    }


    private final void handleAppDiedLocked(ProcessRecord app,
            boolean restarting, boolean allowRestart) {

                ProcessList.remove(pid);

    }

// ProcessList.java

    public static final void remove(int pid) {
        ByteBuffer buf = ByteBuffer.allocate(4 * 2);
        buf.putInt(LMK_PROCREMOVE);
        buf.putInt(pid);
        writeLmkd(buf);
    }

```








