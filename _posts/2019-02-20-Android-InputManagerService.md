---
layout:     post
title:      Android InputManagerService
subtitle:   IMS的工作原理
date:       2019-02-20
author:     LXG
header-img: img/home-bg-o.jpg
catalog: true
tags:
    - IMS
---

注：下文摘自[RickAi的博客](http://navyblue.top/)

[从源码角度看InputManagerService-RickAi](http://navyblue.top/2018/03/18/%E4%BB%8E%E6%BA%90%E7%A0%81%E8%A7%92%E5%BA%A6%E7%9C%8BInputManagerService/)


## 类图

![InputManagerService_uml](/images/InputManagerService_uml.jpg)

## 整体流程图

![InputManagerService](/images/InputManagerService.jpg)

## IMS 初始化与启动

![InputManagerService_uml_2](/images/InputManagerService_uml_2.jpg)

## 输入事件的读取与解析

![InputManagerService_uml_3](/images/InputManagerService_uml_3.jpg)

## 输入事件的处理与反馈

![InputManagerService_uml_4](/images/InputManagerService_uml_4.jpg)



