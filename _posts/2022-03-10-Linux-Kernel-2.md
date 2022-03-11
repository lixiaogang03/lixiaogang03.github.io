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











