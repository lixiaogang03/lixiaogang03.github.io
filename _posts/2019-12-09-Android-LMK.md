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

[lmkd-AOSP](https://source.android.google.cn/devices/tech/perf/lmkd)

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

![oom_adj](/images/lmk/oom_adj.png)

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

## lmkd

```txt

L2K:/ $ ps | grep lmkd
root      1     0     12164  1364  SyS_epoll_ 00000000 S /init
root      493   1     4716   1464  SyS_epoll_ 00000000 S /system/bin/lmkd

```

### lmk.rc

system/core/lmkd/lmkd.rc

```rc

service lmkd /system/bin/lmkd
    class core
    group root readproc
    critical
    socket lmkd seqpacket 0660 system system
    writepid /dev/cpuset/system-background/tasks

```

### lmkd.c

```c

#define INKERNEL_MINFREE_PATH "/sys/module/lowmemorykiller/parameters/minfree"
#define INKERNEL_ADJ_PATH "/sys/module/lowmemorykiller/parameters/adj"

// socket 通信协议
enum lmk_cmd {
    LMK_TARGET,
    LMK_PROCPRIO,
    LMK_PROCREMOVE,
};


static int lowmem_adj[MAX_TARGETS];
static int lowmem_minfree[MAX_TARGETS];
static int lowmem_targets_size;

struct proc {
    struct adjslot_list asl;
    int pid;
    uid_t uid;
    int oomadj;
    struct proc *pidhash_next;
};

int main(int argc __unused, char **argv __unused) {
    struct sched_param param = {
            .sched_priority = 1,
    };

    mlockall(MCL_FUTURE);
    sched_setscheduler(0, SCHED_FIFO, &param);

    // init socket 创建
    if (!init())
        // 等待AMS的指令
        mainloop();

    ALOGI("exiting");
    return 0;
}

static int init(void) {

    // 创建epoll监听文件句柄
    epollfd = epoll_create(MAX_EPOLL_EVENTS);

    // 获取lmkd控制描述符
    ctrl_lfd = android_get_control_socket("lmkd");

    // 监听lmkd socket
    ret = listen(ctrl_lfd, 1);

    // 将文件句柄ctrl_lfd，加入epoll句柄
    if (epoll_ctl(epollfd, EPOLL_CTL_ADD, ctrl_lfd, &epev) == -1) {
        return -1;
    }

}

static void mainloop(void) {
    while (1) {
        struct epoll_event events[maxevents];
        int nevents;
        int i;

        ctrl_dfd_reopened = 0;

        // 等待socket指令
        nevents = epoll_wait(epollfd, events, maxevents, -1);

        if (nevents == -1) {
            if (errno == EINTR)
                continue;
            ALOGE("epoll_wait failed (errno=%d)", errno);
            continue;
        }

        for (i = 0; i < nevents; ++i) {
            if (events[i].events & EPOLLERR)
                ALOGD("EPOLLERR on event #%d", i);
            // 当事件到来，则调用ctrl_connect_handler方法
            if (events[i].data.ptr)
                (*(void (*)(uint32_t))events[i].data.ptr)(events[i].events);
        }
    }
}

```

### ctrl_command_handler

**处理上层的socket指令**

```c

static void ctrl_command_handler(void) {
    int ibuf[CTRL_PACKET_MAX / sizeof(int)];
    int len;
    int cmd = -1;
    int nargs;
    int targets;

    len = ctrl_data_read((char *)ibuf, CTRL_PACKET_MAX);
    if (len <= 0)
        return;

    nargs = len / sizeof(int) - 1;
    if (nargs < 0)
        goto wronglen;

    cmd = ntohl(ibuf[0]);

    switch(cmd) {
    case LMK_TARGET:
        targets = nargs / 2;
        if (nargs & 0x1 || targets > (int)ARRAY_SIZE(lowmem_adj))
            goto wronglen;
        cmd_target(targets, &ibuf[1]);
        break;
    case LMK_PROCPRIO:
        if (nargs != 3)
            goto wronglen;
        cmd_procprio(ntohl(ibuf[1]), ntohl(ibuf[2]), ntohl(ibuf[3]));
        break;
    case LMK_PROCREMOVE:
        if (nargs != 1)
            goto wronglen;
        cmd_procremove(ntohl(ibuf[1]));
        break;
    default:
        ALOGE("Received unknown command code %d", cmd);
        return;
    }

}

```

## Kernel

**drivers/staging/android/lowmemorykiller.c**

### 初始化

```c

static struct shrinker lowmem_shrinker = {
	.scan_objects = lowmem_scan,
	.count_objects = lowmem_count,
	.seeks = DEFAULT_SEEKS * 16
};

static int __init lowmem_init(void)
{
	register_shrinker(&lowmem_shrinker);
	vmpressure_notifier_register(&lmk_vmpr_nb);
	return 0;
}

static void __exit lowmem_exit(void)
{
	unregister_shrinker(&lowmem_shrinker);
}

```

### shrinker

LMK驱动通过注册shrinker来实现的，shrinker是linux kernel标准的回收内存page的机制，由内核线程kswapd负责监控。

当内存不足时kswapd线程会遍历一张shrinker链表，并回调已注册的shrinker函数来回收内存page，kswapd还会周期性唤醒来执行内存操作。每个zone维护active_list和inactive_list链表，内核根据页面活动状态将page在这两个链表之间移动，最终通过shrink_slab和shrink_zone来回收内存页，有兴趣想进一步了解linux内存回收机制，可自行研究，这里再回到LowMemoryKiller的过程分析。

### lowmem_count

```c

    static unsigned long lowmem_count(struct shrinker *s,
                      struct shrink_control *sc)
    {
        return global_page_state(NR_ACTIVE_ANON) +
            global_page_state(NR_ACTIVE_FILE) +
            global_page_state(NR_INACTIVE_ANON) +
            global_page_state(NR_INACTIVE_FILE);
    }

```

ANON代表匿名映射，没有后备存储器；FILE代表文件映射；
内存计算公式= 活动匿名内存 + 活动文件内存 + 不活动匿名内存 + 不活动文件内存

### lowmem_scan

当触发lmkd,则先杀oom_score_adj最大的进程, 当oom_adj相等时,则选择rss最大的进程.

```c

    static unsigned long lowmem_scan(struct shrinker *s, struct shrink_control *sc)
    {
        struct task_struct *tsk;
        struct task_struct *selected = NULL;
        unsigned long rem = 0;
        int tasksize;
        int i;
        short min_score_adj = OOM_SCORE_ADJ_MAX + 1;
        int minfree = 0;
        int selected_tasksize = 0;
        short selected_oom_score_adj;
        int array_size = ARRAY_SIZE(lowmem_adj);
        //获取当前剩余内存大小
        int other_free = global_page_state(NR_FREE_PAGES) - totalreserve_pages;
        int other_file = global_page_state(NR_FILE_PAGES) -
                            global_page_state(NR_SHMEM) -
                            total_swapcache_pages();
        //获取数组大小
        if (lowmem_adj_size < array_size)
            array_size = lowmem_adj_size;
        if (lowmem_minfree_size < array_size)
            array_size = lowmem_minfree_size;

        //遍历lowmem_minfree数组找出相应的最小adj值
        for (i = 0; i < array_size; i++) {
            minfree = lowmem_minfree[i];
            if (other_free < minfree && other_file < minfree) {
                min_score_adj = lowmem_adj[i];
                break;
            }
        }

        if (min_score_adj == OOM_SCORE_ADJ_MAX + 1) {
            return 0;
        }
        selected_oom_score_adj = min_score_adj;

        rcu_read_lock();
        for_each_process(tsk) {
            struct task_struct *p;
            short oom_score_adj;
            if (tsk->flags & PF_KTHREAD)
                continue;
            p = find_lock_task_mm(tsk);
            if (!p)
                continue;
            if (test_tsk_thread_flag(p, TIF_MEMDIE) &&
                time_before_eq(jiffies, lowmem_deathpending_timeout)) {
                task_unlock(p);
                rcu_read_unlock();
                return 0;
            }
            oom_score_adj = p->signal->oom_score_adj;
            //小于目标adj的进程，则忽略
            if (oom_score_adj < min_score_adj) {
                task_unlock(p);
                continue;
            }
            //获取的是进程的Resident Set Size，也就是进程独占内存 + 共享库大小。
            tasksize = get_mm_rss(p->mm);
            task_unlock(p);
            if (tasksize <= 0)
                continue;

            //算法关键，选择oom_score_adj最大的进程中，并且rss内存最大的进程.
            if (selected) {
                if (oom_score_adj < selected_oom_score_adj)
                    continue;
                if (oom_score_adj == selected_oom_score_adj &&
                    tasksize <= selected_tasksize)
                    continue;
            }
            selected = p;
            selected_tasksize = tasksize;
            selected_oom_score_adj = oom_score_adj;
            lowmem_print(2, "select '%s' (%d), adj %hd, size %d, to kill\n",
                     p->comm, p->pid, oom_score_adj, tasksize);
        }

        if (selected) {
            long cache_size = other_file * (long)(PAGE_SIZE / 1024);
            long cache_limit = minfree * (long)(PAGE_SIZE / 1024);
            long free = other_free * (long)(PAGE_SIZE / 1024);
            //输出kill的log
            lowmem_print(1, "Killing '%s' (%d), adj %hd,\n" \ ...);

            lowmem_deathpending_timeout = jiffies + HZ;
            set_tsk_thread_flag(selected, TIF_MEMDIE);
            //向选中的目标进程发送signal 9来杀掉目标进程
            send_sig(SIGKILL, selected, 0);
            rem += selected_tasksize;
        }
        rcu_read_unlock();
        return rem;
    }

```

- 选择oom_score_adj最大的进程中，并且rss内存最大的进程作为选中要杀的进程。
- 杀进程方式：`send_sig(SIGKILL, selected, 0)``向选中的目标进程发送signal 9来杀掉目标进程。












