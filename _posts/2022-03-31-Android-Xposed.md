---
layout:     post
title:      Android Xposed
subtitle:   virtual camera
date:       2022-03-31
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - xposed
---

[Xposed Module Repository](https://repo.xposed.info/)

[Xposed-github](https://github.com/rovo89/Xposed)

[com.example.vcam](https://repo.xposed.info/module/com.example.vcam)

[xposed-download](https://dl-xda.xposed.info/framework/)

## Xposed

Xposed包含如下几个工程：

* XposedInstaller，这是Xposed的插件管理和功能控制APP, 它包括启用Xposed插件功能，下载和启用指定插件APP，还可以禁用Xposed插件功能等。注意，这个app要正常无误得运行必须能拿到root权限。
* Xposed，这个项目属于Xposed框架，其实它就是单独搞了一套xposed版的zygote。这个zygote会替换系统原生的zygote。所以，它需要由XposedInstaller在root之后放到/system/bin下。
* XposedBridge。这个项目也是Xposed框架，它属于Xposed框架的Java部分，编译出来是一个XposedBridge.jar包。
* XposedTools。Xposed和XposedBridge编译依赖于Android源码，而且还有一些定制化的东西。所以XposedTools就是用来帮助我们编译Xposed和XposedBridge的。


