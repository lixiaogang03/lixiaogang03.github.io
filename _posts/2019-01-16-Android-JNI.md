---
layout:     post
title:      Android JNI
subtitle:   NDK
date:       2019-01-16
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - NDK
    - JNI
---

[NDK官网](https://developer.android.com/ndk/)

[NDK开发-简书](https://www.jianshu.com/p/6332418b12b1)

[NDK环境配置](https://juejin.im/entry/5940fe588d6d810058b68e58)

[JNI开发-简书](https://www.jianshu.com/p/87ce6f565d37)

## NDK环境配置（ubuntu 16.04）

### 下载

[官网下载地址](https://developer.android.com/ndk/downloads/)

### 解压

>> 注：解压路径 不要出现空格和中文<br/>
建议：将解压路径设置为：Android Studio的SDK目录里，并命名为ndk-bundle<br/>
好处：启动Android Studio时，Android Studio会自动检查它并直接添加到ndk.dir中，那么在使用时，就不用配置Android Studio与NDK的关联工作<br/>

### 环境配置

* vim ~/.bashrc

* add export

>> export ANDROID_HOME=$HOME/Android/Sdk<br/>
export PATH=$PATH:$ANDROID_HOME/tools<br/>
export PATH=$PATH:$ANDROID_HOME/tools/bin<br/>
export PATH=$PATH:$ANDROID_HOME/platform-tools<br/>
export PATH=$PATH:$ANDROID_HOME/emulator<br/>
export PATH=$PATH:$ANDROID_HOME/ndk-bundle

* source ~/.bashrc

* ndk-build -v

## CMake

CMake是一个跨平台的编译工具，它自己不编译出目标对象，而是根据CMakeLists.txt生成 makefile(Unix) 或 project（Windows）文件,再使用一般的构建方式编译出目标对象。

目前在AndroidStudio中，一共有两种构建方式：

1. ndk-build，需要配置文件Application.mk，Android.mk。
2. Cmake，需要配置文件CMakeLists.txt。这种方式是AndroidStudio2.2版本新增加的方式，是目前google主推的方式

## JNI

![JNI](/images/jni.png)

## Hello World

![DEMO](/images/jni_demo.png)

