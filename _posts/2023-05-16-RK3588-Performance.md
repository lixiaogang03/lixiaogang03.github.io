---
layout:     post
title:      RK3588 Performance
subtitle:   性能模式
date:       2023-05-16
author:     LXG
header-img: img/post-bg-kuaidi.jpg
catalog: true
tags:
    - rk3588
---

## 参考文档

Rockchip_Developer_Guide_CPUFreq_CN.pdf

CPUFreq 是内核开发者定义的⼀套⽀持根据指定的 governor 动态调整 CPU 频率和电压的框架模型，它能有效地降低 CPU 的功耗，同时兼顾 CPU 的性能。CPUFreq framework 由 governor、core、driver、stats 组成，软架构如下：

![linux_cpu_freq](/images/rk3588/linux_cpu_freq.png)

CPUFreq governor: ⽤于 CPU 升降频检测，根据系统负载，决定 CPU 频率。⽬前 Linux4.4 内核中包含了如下⼏ 种 governor：
* conservative ：根据 CPU 负载动态调频，按⼀定的⽐例平滑的升⾼或降低频率。
* ondemand：根据 CPU 负载动态调频，调频幅度⽐较⼤，可直接调到最⾼频或最低频。
* interactive：根据 CPU 负载动态调频，相⽐ ondemand，响应时间更快，可配置参数更多，更灵活。
* userspace：提供相应接⼝供⽤⼾态应⽤程序调整频率。
* powersave：功耗优先，始终将频率设置在最低值。
* performance：性能优先，始终将频率设置为最⾼值。
* schedutil：EAS 使⽤ governor。EAS（Energy Aware Scheduling）是新⼀代的任务调度策略， 结合CPUFreq和 CPUIdle 的策略， 在为某个任务选择运⾏ CPU 时， 同时考虑了性能和功耗， 保证了系统能耗最低，并且不会对性能造成影响。Schedutil 调度策略就是专⻔给 EAS 使⽤的 CPU 调频策略。

CPUFreq core： 对 cpufreq governors 和 cpufreq driver 进⾏了封装和抽象，并定义了清晰的接⼝。
CPUFreq driver：⽤于初始化 CPU 的频率电压表，设置具体 CPU 的频率。
CPUFreq stats：提供 cpufreq 有关的统计信息。

## 查看RK3588 CPU GPU DDR NPU的频率电压表

```txt

130|rk3588_s:/ $ cat /d/opp/opp_summary
 device                rate(Hz)    target(uV)    min(uV)    max(uV)
-------------------------------------------------------------------
 platform-fdab0000.npu
                      300000000       675000      675000      850000
                                      675000      675000      850000
                      400000000       675000      675000      850000
                                      675000      675000      850000
                      500000000       675000      675000      850000
                                      675000      675000      850000
                      600000000       675000      675000      850000
                                      675000      675000      850000
                      700000000       687500      687500      850000
                                      687500      687500      850000
                      800000000       725000      725000      850000
                                      725000      725000      850000
                      900000000       762500      762500      850000
                                      762500      762500      850000
                     1000000000       812500      812500      850000
                                      812500      812500      850000
 platform-dmc
                      528000000       675000      675000      875000
                                      700000      700000      750000
                     1068000000       700000      700000      875000
                                      712500      712500      750000
                     1560000000       775000      775000      875000
                                      725000      725000      750000
                     2112000000       850000      850000      875000
                                      750000      750000      750000
 platform-fb000000.gpu
                      300000000       675000      675000      850000
                                      675000      675000      850000
                      400000000       675000      675000      850000
                                      675000      675000      850000
                      500000000       675000      675000      850000
                                      675000      675000      850000
                      600000000       675000      675000      850000
                                      675000      675000      850000
                      700000000       687500      687500      850000
                                      687500      687500      850000
                      800000000       725000      725000      850000
                                      725000      725000      850000
                      900000000       775000      775000      850000
                                      775000      775000      850000
                     1000000000       825000      825000      850000
                                      825000      825000      850000
 cpu6
                      408000000       675000      675000     1000000
                                      675000      675000     1000000
                      600000000       675000      675000     1000000
                                      675000      675000     1000000
                      816000000       675000      675000     1000000
                                      675000      675000     1000000
                     1008000000       675000      675000     1000000
                                      675000      675000     1000000
                     1200000000       675000      675000     1000000
                                      675000      675000     1000000
                     1416000000       700000      700000     1000000
                                      700000      700000     1000000
                     1608000000       725000      725000     1000000
                                      725000      725000     1000000
                     1800000000       800000      800000     1000000
                                      800000      800000     1000000
                     2016000000       875000      875000     1000000
                                      875000      875000     1000000
                     2208000000       962500      962500     1000000
                                      962500      962500     1000000
                     2256000000      1000000     1000000     1000000
                                     1000000     1000000     1000000
 cpu4
                      408000000       675000      675000     1000000
                                      675000      675000     1000000
                      600000000       675000      675000     1000000
                                      675000      675000     1000000
                      816000000       675000      675000     1000000
                                      675000      675000     1000000
                     1008000000       675000      675000     1000000
                                      675000      675000     1000000
                     1200000000       675000      675000     1000000
                                      675000      675000     1000000
                     1416000000       700000      700000     1000000
                                      700000      700000     1000000
                     1608000000       725000      725000     1000000
                                      725000      725000     1000000
                     1800000000       800000      800000     1000000
                                      800000      800000     1000000
                     2016000000       875000      875000     1000000
                                      875000      875000     1000000
                     2208000000       962500      962500     1000000
                                      962500      962500     1000000
                     2256000000      1000000     1000000     1000000
                                     1000000     1000000     1000000
 cpu0
                      408000000       675000      675000      950000
                                      675000      675000      950000
                      600000000       675000      675000      950000
                                      675000      675000      950000
                      816000000       675000      675000      950000
                                      675000      675000      950000
                     1008000000       675000      675000      950000
                                      675000      675000      950000
                     1200000000       700000      700000      950000
                                      700000      700000      950000
                     1416000000       737500      737500      950000
                                      737500      737500      950000
                     1608000000       825000      825000      950000
                                      825000      825000      950000
                     1800000000       925000      925000      950000
                                      925000      925000      950000

```

## CPU 定频

RK3588的cpu是4个A55+4个A76

```

rk3588_s:/ $ ls -al /sys/devices/system/cpu/cpufreq/
total 0
drwxr-xr-x  5 root root 0 2023-05-16 06:05 .
drwxr-xr-x 16 root root 0 2023-05-16 06:05 ..
drwxr-xr-x  3 root root 0 2023-05-16 06:05 policy0            // 4个A55 cpu0 ~ cpu3
drwxr-xr-x  3 root root 0 2023-05-16 06:05 policy4            // 2个A76 cpu4 ~ cpu5
drwxr-xr-x  3 root root 0 2023-05-16 06:05 policy6            // 2个A76 cpu6 ~ cpu7

```

## 修改节点控制频率

```txt

rk3588_s:/ $ ls -al sys/devices/system/cpu/cpufreq/policy6/
-r--r--r-- 1 root   root   4096 2023-05-16 06:50 affected_cpus
-r-------- 1 root   root   4096 2023-05-16 06:50 cpuinfo_cur_freq              /* 硬件寄存器中读取CPU当前所处的运⾏频率 */
-r--r--r-- 1 root   root   4096 2023-05-16 06:05 cpuinfo_max_freq              /* CPU所⽀持的最⾼运⾏频率 */
-r--r--r-- 1 root   root   4096 2023-05-16 06:05 cpuinfo_min_freq              /* CPU所⽀持的最低运⾏频率 */
-r--r--r-- 1 root   root   4096 2023-05-16 06:50 cpuinfo_transition_latency    /* 两个不同频率之间切换时所需要的时间，单位ns */
-r--r--r-- 1 root   root   4096 2023-05-16 06:05 related_cpus
-r--r--r-- 1 root   root   4096 2023-05-16 06:05 scaling_available_frequencies   /* 系统⽀持的频率 */
-r--r--r-- 1 root   root   4096 2023-05-16 06:50 scaling_available_governors     /* 系统⽀持的变频策略 */
-r--r--r-- 1 root   root   4096 2023-05-16 06:05 scaling_cur_freq                /* 软件上最后⼀次设置的频率 */
-r--r--r-- 1 root   root   4096 2023-05-16 06:50 scaling_driver
-rw-r--r-- 1 root   root   4096 2023-05-16 06:05 scaling_governor                /* 当前使用的变频策略 */
-rw-rw-r-- 1 system system 4096 2023-05-16 06:05 scaling_max_freq                /* 软件上限制的最⾼频率 */
-rw-rw-r-- 1 system system 4096 2023-05-16 06:05 scaling_min_freq                /* 软件上限制的最低频率 */
-rw-r--r-- 1 root   root   4096 2023-05-16 06:50 scaling_setspeed                /* 将governor切换为userspace才会出现，可以通过该节点修改频率 */
drwxr-xr-x 2 root   root      0 2023-05-16 06:05 stats

```

## 默认修改为性能模式

init.rk3588.rc

```c

    # modify gpu performance

    write sys/class/devfreq/fb000000.gpu/governor performance

    # modify cpu performance

    write /sys/devices/system/cpu/cpufreq/policy0/scaling_governor performance
    write /sys/devices/system/cpu/cpufreq/policy4/scaling_governor performance
    write /sys/devices/system/cpu/cpufreq/policy6/scaling_governor performance

    # modify ddr performance

    write /sys/class/devfreq/dmc/governor performance

    # modsify npu performace

    write /sys/class/devfreq/fdab0000.npu/governor performance

```




































