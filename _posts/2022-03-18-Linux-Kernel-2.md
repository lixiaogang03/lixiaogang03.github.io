---
layout:     post
title:      Linux Kernel 2
subtitle:   https://www.kernel.org/
date:       2022-03-18
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - linux
---

[一文搞懂 Linux 内核链表](https://cloud.tencent.com/developer/article/1805773)

## 内核工具和辅助函数

内核是独立的软件，它没有使用任何C语言库，它实现了现代库中可能的所有机制。

## 宏 container_of

include/linux/kernel.h

```c

/**
 * container_of - cast a member of a structure out to the containing structure
 * @ptr:	the pointer to the member.
 * @type:	the type of the container struct this is embedded in.
 * @member:	the name of the member within the struct.
 *
 */
#define container_of(ptr, type, member) ({			\
	const typeof( ((type *)0)->member ) *__mptr = (ptr);	\
	(type *)( (char *)__mptr - offsetof(type,member) );})


```

container_of()的作用就是通过一个结构变量中一个成员的地址找到这个结构体变量的首地址

![container_off](/images/kernel/container_off.jpeg)

## 链表

**单链表**

![single_linked_list](/images/kernel/single_linked_list.png)

**双链表**

![double_linked_list](/images/kernel/double_linked_list.png)

**循环链表**

![loop_linked_list](/images/kernel/loop_linked_list.png)

在Linux内核中使用了大量的链表结构组织数据，包括数据列表以及各种功能模块中的数据组织。这些链表大多采用在(include/linux/list.h)实现的一个相当精彩的
链表数据结果。事实上，内核链表就是采用双循环链表机制。

内核链表有别于传统链表就在节点本身并不包含数据域，只包含指针域，可以说这是内核链表的核心。

## 内核的睡眠机制

[内核中休眠与唤醒的使用](https://blog.csdn.net/ZHONGCAI0901/article/details/120348014)

内核使用这个结构来给进程一个休眠的地方。
task_list是一个链表，想要入睡的进程都在该链表中排队(因此被称作等待队列), 并进入睡眠状态，直到条件变为真，等待队列可以被看作简单的进程链表和锁。

kernel/include/linux/wait.h

```c

struct __wait_queue {
	unsigned int		flags;
	void			*private;
	wait_queue_func_t	func;
	struct list_head	task_list;
};



```

**等待队列的睡眠**

condition: 睡眠条件

wait_event(wq, condition);                                 建立不可以杀进程（信号不能唤醒，效果和msleep相同）。

wait_event_interruptible(wq, condition)；                  它可以被被信号唤醒。休眠过程中，进程可以接收信号，收到后不管条件如何，直接返回。

wait_event_timeout(wq, condition, timeout);                休眠期间效果和 wait_event ，但是有一个超时时间 ，时间到，不管条件如何，直接返回。

wait_event_interruptible_timeout(wq, condition, timeout);  休眠期间效果和 wait_event_interruptible相同，区别是有超时功能。时间 到，不管条件如何，直接返回。

**等待队列的唤醒**

通过调用 wake_up* 函数（表面上是宏）唤醒进程

wake_up(wq)                                能用于唤醒各种方式进入休眠的进程，只唤醒队列上的一个进程。
wake_up_all(wq)                            效果和wake_up相同，只是能唤醒队列上所有的进程。
wake_up_interruptible(wq)                  只能用于唤醒一个 使用wait_event_interruptible*休眠的进程。
wake_up_interruptible_all(wq)              能唤醒队列所有使用wait_event_interruptible*休眠的进程。

## 延时和定时器管理

[Linux内核定时器](https://zhuanlan.zhihu.com/p/399441638)

[Linux内核时钟系统和定时器实现](http://walkerdu.com/2016/07/25/linux-kernel-timer/)

时间是继内存之后常用的资源之一。它用于执行几乎所有的事情：延迟工作、睡眠、调度、超时等任务

Linux 内核中有大量的函数需要时间管理，比如周期性的调度程序、延时程序等。硬件定时器提供时钟源，时钟源的频率可以设置， 设置好以后就周期性的产生定时中断，系统使用定时中断来计时。

Linux 内核使用全局变量 jiffies 来记录系统从启动以来的系统节拍数，系统启动的时候会将 jiffies 初始化为 0

**定时器**

include/linux/timer.h

```c

struct timer_list {
	/*
	 * All fields that change during normal runtime grouped to the
	 * same cacheline
	 */
	struct hlist_node	entry;
	unsigned long		expires;  //定时器服务函数开始执行时间
	void			(*function)(unsigned long); //定义一个指向定时器服务函数的指针function
	unsigned long		data;  //定时时间到时，data参数会传入服务函数
	u32			flags;
	int			slack;
};

```

![timer](/images/kernel/timer.jpg)

**使用定时器的步骤**

struct timer_list my_timer_list;//定义一个定时器，可以把它放在你的设备结构中

init_timer(&my_timer_list);//初始化一个定时器

my_timer_list.expire=jiffies+HZ;//定时器1s后运行服务程序

my_timer_list.function=timer_function;//定时器服务函数

add_timer(&my_timer_list);//添加定时器

void timer_function(unsigned long);//写定时器服务函数

del_timer(&my_timer_list);//当定时器不再需要时删除定时器

del_timer_sync(&my_timer_list);//基本和del_timer一样，比较适合在多核处理器使用，一般推荐使用del_timer_sync

**高精度定时器**

CONFIG_HZ=300  标准定时器，精度为毫秒，时钟中断触发的频率 1000 / 300 = 3.333ms
CONFIG_HIGH_RES_TIMERS=y  支持高精度时钟，精度为微秒

msleep() 是让当前进程休眠，让出CPU给其它进程使用，等到时间到了之后再唤醒
mdelay() 是CPU空转，一般不推荐使用

## 内核的锁机制

锁机制有助于不同线程和进程之间共享资源。

**互斥锁**

include/linux/mutex.h

```c

struct mutex {
	/* 1: unlocked, 0: locked, negative: locked, possible waiters */
	atomic_t		count;
	spinlock_t		wait_lock;
	struct list_head	wait_list; //等待链表
        [...]
};

```

1. 在访问共享资源后临界区域前，对互斥锁进行加锁；
2. 在访问完成后释放互斥锁导上的锁。在访问完成后释放互斥锁导上的锁；
3. 对互斥锁进行加锁后，任何其他试图再次对互斥锁加锁的线程将会被阻塞，直到锁被释放。

**自旋锁**

自旋锁与互斥量功能一样，唯一一点不同的就是互斥量阻塞后休眠让出cpu，而自旋锁阻塞后不会让出cpu，会一直忙等待，直到得到锁。

自旋锁在用户态使用的比较少，在内核使用的比较多！自旋锁的使用场景：锁的持有时间比较短，或者说小于2次上下文切换的时间。

**信号量**

信号量又称为信号灯（semaphore），它是用来协调不同进程间的数据对象的，本质上信号量是一个计数器，它用来记录对某个资源（如共享内存）的存取状况。一般说来，为了获得共享资源，进程需要执行下列操作：

1. 测试控制该资源的信号量。
2. 若此信号量的值为正，则允许进行使用该资源。进程将信号量减1。
3. 若此信号量为0，则该资源目前不可用，进程进入睡眠状态，直至信号量值大于0，进程被唤醒，转入步骤（1）。
4. 当进程不再使用一个信号量控制的资源时，信号量值加1。如果此时有进程正在睡眠等待此信号量，则唤醒此进程。


## 工作延迟机制

[Linux内核硬中断 / 软中断的原理和实现](https://cloud.tencent.com/developer/article/1518703)

延迟是将所要做的工作安排在将来执行的一种方法，这种方法推后发布操作。

* SoftIRQ: 执行在原子上下文
* Tasklet: 执行在原子上下文
* 工作队列：执行在进程上下文

**SoftIRQ** 

中断是一种异步的事件处理机制，用来提高系统的并发处理能力。中断事件发生，会触发执行中断处理程序，而中断处理程序被分为上半部和下半部这两个部分。上半部对应硬中断，用来快速处理中断；下半部对应软中断，用来异步处理上半部未完成的工作。Linux 中的软中断包括网络收发、定时、调度、RCU 锁等各种类型，我们可以查看 proc 文件系统中的 /proc/softirqs ，观察软中断的运行情况。在 Linux 中，每个 CPU 都对应一个软中断内核线程，名字是 ksoftirqd/CPU 编号。当软中断事件的频率过高时，内核线程也会因为 CPU 使用率过高而导致软中断处理不及时，进而引发网络收发延迟、调度缓慢等性能问题

**中断概念**

![interrupt](/images/kernel/interrupt.jpeg)

硬中断：中断控制器就把电信号发送给处理器的某个特定引脚。处理器于是立即停止自己正在做的事，跳到中断处理程序的入口点，进行中断处理。由与系统相连的外设(比如网卡、硬盘)自动产生的。主要是用来通知操作系统系统外设状态的变化。比如当网卡收到数据包的时候，就会发出一个中断。我们通常所说的中断指的是硬中断(hardirq)。

软中断：为了满足实时系统的要求，中断处理应该是越快越好。linux为了实现这个特点，当中断发生的时候，硬中断处理那些短时间就可以完成的工作，而将那些处理事件比较长的工作，放到中断之后来完成，也就是软中断(softirq)来完成。

之前分享过Linux内核网络数据包的接收过程，当执行到网卡通过硬件中断（IRQ）通知CPU，告诉它有数据来了，CPU会根据中断表，调用已经注册的中断函数，这个中断函数会调到驱动程序（NIC Driver）中相应的函数。驱动先禁用网卡的中断，表示驱动程序已经知道内存中有数据了，告诉网卡下次再收到数据包直接写内存就可以了，不要再通知CPU了，这样可以提高效率，避免CPU不停的被中断。

由于硬中断处理程序执行的过程中不能被中断，所以如果它执行时间过长，会导致CPU没法响应其它硬件的中断，于是内核引入软中断，这样可以将硬中断处理函数中耗时的部分移到软中断处理函数里面来慢慢处理。内核中的ksoftirqd进程专门负责软中断的处理，当它收到软中断后，就会调用相应软中断所对应的处理函数，网卡驱动模块抛出的软中断，ksoftirqd会调用网络模块的net_rx_action函数。

硬中断和软中断的区别：
1. 软中断是执行中断指令产生的，而硬中断是由外设引发的。
2. 硬中断的中断号是由中断控制器提供的，软中断的中断号由指令直接指出，无需使用中断控制器。
3. 硬中断是可屏蔽的，软中断不可屏蔽。
4. 硬中断处理程序要确保它能快速地完成任务，这样程序执行时才不会等待较长时间，称为上半部。
5. 软中断处理硬中断未完成的工作，是一种推后执行的机制，属于下半部。

**proc/softirqs**

```txt

# cat proc/softirqs                                          
                    CPU0       CPU1       CPU2       CPU3       
          HI:          6          2          0          1
       TIMER:       7512       2845       2004       2827
      NET_TX:          7          2          0          1
      NET_RX:        515          0          0          0
       BLOCK:          6          2          0          1
BLOCK_IOPOLL:          6          2          0          1
     TASKLET:      26440          2          0          1
       SCHED:       2010       1289        837        864
     HRTIMER:         24          4          2          3
         RCU:       4959       3592       1662       1842

```

**Tasklet**

[Linux内核中的下半部机制之tasklet](http://unicornx.github.io/2016/02/12/20160212-lk-drv-tasklet/)

Tasklet机制是一种较为特殊的软中断。Tasklet一词的原意是“小片任务”的意思，这里是指一小段可执行的代码，且通常以函数的形式出现。

1. 与一般的软中断不同，同一段tasklet代码（也就是对应某一个tasklet_struct对象的func函数）在某个时刻只能在一个CPU上运行，而不像一般的软中断服务函数（即softirq_action结构中的action函数指针）那样——在同一时刻可以被多个CPU并发地执行。
2. 不同的tasklet代码在同一时刻可以在多个CPU上并发地执行。

```c

struct tasklet_struct
{
    struct tasklet_struct *next;  // 指向下一个tasklet的指针，说明这个结构体的成员会被加入到一个链表里。
    unsigned long state;          // 用于标识tasklet状态, 可以理解为每个tasklet有一个简单的状态机，0 -> TASKLET_STATE_SCHED -> TASKLET_STATE_RUN -> 0
    atomic_t count;               // 引用计数，若不为0，则tasklet被禁止，只有当它为0时，tasklet才被激活，也就是说该tasklet的处理函数func才可以被执行，只有设置为激活后，tasklet对应的软中断被raise时该tasklet才会被投入运行
    void (*func)(unsigned long);  // 是一个函数指针，也是对应这个tasklet的处理函数。
    unsigned long data;           // 函数func的参数。这是一个32位的无符号整数，其具体含义可供func函数自行解释，比如将其解释成一个指向某个用户自定义数据结构的地址值
};

```

**工作队列**

* 内核全局工作队列---共享队列
* 专用工作队列
































