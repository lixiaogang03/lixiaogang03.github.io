---
layout:     post
title:      Android InputManagerService
subtitle:   IMS的工作原理
date:       2019-02-20
author:     LXG
header-img: img/home-bg-o.jpg
catalog: true
tags:
    - Android
---

注：下文摘自[RickAi的博客](http://navyblue.top/)

[从源码角度看InputManagerService-RickAi](http://navyblue.top/2018/03/18/%E4%BB%8E%E6%BA%90%E7%A0%81%E8%A7%92%E5%BA%A6%E7%9C%8BInputManagerService/)


## 类图

![InputManagerService_uml](/images/android/input_manager/InputManagerService_uml.jpg)

## 整体流程图

1. 用户轻点屏幕，linux 内核产生中断，向 /dev/input/ 目录下的设备文件 eventxx 下入数据
2. native 层，EventHub 通过 epoll 监测到文件被写入，使用 inotify 读取文件中的数据
3. InputReader 将事件数据解析成装满 RawEvent 的缓冲区中，随后批量使用 InputMapper 进行处理
4. 用户的触摸事件最终被加工为 NotifyMotionArgs，随后被批量插入到 InputDispatcher 的队列中
5. InputDispacher 从队列中取出 EventEntry 数据进行派发
6. 获取触摸事件目标窗口列表，使用 socketpair 向客户端发送输入事件
7. 客户端在将事件分发到各个窗口，处理完毕后会调用 finish 告诉服务端事件已经处理完成
8. InputDispatcher 收到事件处理完成通知，重新初始化 ANR 相关变量

![InputManagerService](/images/android/input_manager/InputManagerService.jpg)

## IMS 初始化与启动

![InputManagerService_uml_2](/images/android/input_manager/InputManagerService_uml_2.jpg)

## 输入事件的读取与解析

![InputManagerService_uml_3](/images/android/input_manager/InputManagerService_uml_3.jpg)

## 输入事件的处理与反馈

![InputManagerService_uml_4](/images/android/input_manager/InputManagerService_uml_4.jpg)



