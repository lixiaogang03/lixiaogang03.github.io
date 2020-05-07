---
layout:     post
title:      Android EventBus
subtitle:   事件总线
date:       2020-05-07
author:     LXG
header-img: img/post-bg-map.jpg
catalog: true
tags:
    - EventBus
---

[Android_System_UI_EventBus](http://dogee.tech/2016/09/05/2016-09-05_Android_System_UI_EventBus/)

[SystemUI的EventBus实现原理-简书](https://www.jianshu.com/p/9c26c69fa08a)

## EventBus

![event_bus](/images/event_bus.webp)

EventBus的处理流程是订阅者在EventBus中register(订阅)事件，当发布者发送出事件时，EventBus根据事件查找到订阅了该事件的订阅者列表，并逐一调用订阅者的onBusEvent()事件响应函数，把事件传给订阅者处理。

## SystemUI EventBus




