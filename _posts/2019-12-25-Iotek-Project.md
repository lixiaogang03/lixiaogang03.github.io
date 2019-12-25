---
layout:     post
title:      Iotek Project
subtitle:   2014 Iotek Personal Project
date:       2019-12-25
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - iotek
---

## 源码

[iotek](https://github.com/lixiaogang03/iotek)

## 彩票管理系统

1. 系统初始化
2. 管理员登录
3. 彩民登录
4. 新用户注册
5. 系统退出

### 系统初始化和退出

1. 从文件中加载管理员信息到结构体
2. 从文件中加载用户信息、开奖信息、彩票信息到链表
3. 展示一级菜单等待用户输入
4. 保存最新信息持久化到文件中
5. 释放链表堆内存

![ticket_system](/images/iotek/ticket_system.png)

### 管理员操作

1. 管理员登录验证
2. 摇号开奖
3. 信息查看
4. 信息修改
5. 信息删除

![ticket_admin](/images/iotek/ticket_admin.png)

## 远程终端管理系统

### 服务端

1. 注册中断信号
2. 从文件中加载信息到内存：结构体或者链表
3. socket初始化
4. 创建并运行管理员线程
5. 监听客户端socket连接
6. socket连接到来后启动新线程处理客户请求

![lsd_server_main](/images/iotek/lsd_server_main.png)

### 客户端
