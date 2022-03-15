---
layout:     post
title:      Linux Kernel 2
subtitle:   https://www.kernel.org/
date:       2022-03-10
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
　　 （1） 测试控制该资源的信号量。
　　 （2） 若此信号量的值为正，则允许进行使用该资源。进程将信号量减1。
　　 （3） 若此信号量为0，则该资源目前不可用，进程进入睡眠状态，直至信号量值大于0，进程被唤醒，转入步骤（1）。
　　 （4） 当进程不再使用一个信号量控制的资源时，信号量值加1。如果此时有进程正在睡眠等待此信号量，则唤醒此进程。



































