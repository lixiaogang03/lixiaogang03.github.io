---
layout:     post
title:      Android Input System
subtitle:   IMS
date:       2019-02-15
author:     LXG
header-img: img/post-bg-keybord.jpg
catalog: true
tags:
    - android
    - IMS
    - input
---

注：下文摘录自《深入理解android卷三》一书

## 参考文章

[Android输入系统-AOSP官网](https://source.android.google.cn/devices/input)

[深入理解android输入系统](https://www.kancloud.cn/alex_wsc/android-deep3/416415)

[androud输入系统](https://www.kancloud.cn/digest/androidcore/149085)

[InputSystem-袁辉辉](http://gityuan.com/2016/12/10/input-manager/)

## 框架图

![android_input_system](/images/android_input_system.png)


### Linux内核

> 接受输入设备的中断，并将原始事件的数据写入到设备节点中

### 设备节点/dev/input/

> 设备节点，作为内核与IMS的桥梁，它将原始事件的数据暴露给用户空间，以便IMS可以从中读取事件

### InputManagerService

> 一个Android系统服务，它分为Java层和Native层两部分。Java层负责与WMS的通信。而Native层则是InputReader和InputDispatcher两个输入系统关键组件的运行容器

### EventHub

> 直接访问所有的设备节点。并且正如其名字所描述的，它通过一个名为getEvents()的函数将所有输入系统相关的待处理的底层事件返回给使用者。这些事件包括原始输入事件、设备节点的增删等。

### InputReader

> InputReader是IMS中的关键组件之一。它运行于一个独立的线程中，负责管理输入设备的列表与配置，以及进行输入事件的加工处理。
> 它通过其线程循环不断地通过getEvents()函数从EventHub中将事件取出并进行处理。对于设备节点的增删事件，它会更新输入设备列表于配置。
> 对于原始输入事件，InputReader对其进行翻译、组装、封装为包含了更多信息、更具可读性的输入事件，然后交给InputDispatcher进行派发。

### InputReaderPolicy

> 它为InputReader的事件加工处理提供一些策略配置，例如键盘布局信息等

### InputDispatcher

> InputDispatcher，是IMS中的另一个关键组件。它也运行于一个独立的线程中。
> InputDispatcher中保管了来自WMS的所有窗口的信息，其收到来自InputReader的输入事件后，会在其保管的窗口中寻找合适的窗口，并将事件派发给此窗口。

### InputDispatcherPolicy

> 它为InputDispatcher的派发过程提供策略控制。例如截取某些特定的输入事件用作特殊用途，或者阻止将某些事件派发给目标窗口。
> 一个典型的例子就是HOME键被InputDispatcherPolicy截取到PhoneWindowManager中进行处理，并阻止窗口收到HOME键按下的事件。

### WMS

> 虽说不是输入系统中的一员，但是它却对InputDispatcher的正常工作起到了至关重要的作用。当新建窗口时，WMS为新窗口和IMS创建了事件传递所用的通道。
> 另外，WMS还将所有窗口的信息，包括窗口的可点击区域，焦点窗口等信息，实时地更新到IMS的InputDispatcher中，使得InputDispatcher可以正确地将事件派发到指定的窗口

### ViewRootImpl

> 对于某些窗口，如壁纸窗口、SurfaceView的窗口来说，窗口即是输入事件派发的终点。而对于其他的如Activity、对话框等使用了Android控件系统的窗口来说，输入事件的终点是控件（View）。
> ViewRootImpl将窗口所接收到的输入事件沿着控件树将事件派发给感兴趣的控件。




