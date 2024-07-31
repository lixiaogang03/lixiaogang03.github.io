---
layout:     post
title:      AndroidStudio导入AOSP源码
subtitle:   android studio
date:       2019-01-05
author:     LXG
header-img: img/home-bg-geek.jpg
catalog: true
tags:
    - Android
    - debug
    - dumpsys
---

## 环境准备

　[硬件配置要求-官网](https://source.android.com/setup/build/requirements)<br/>
　[搭建编译环境-官网](https://source.android.com/setup/build/initializing)
 
 1. 切换编译时的java版本
 >sudo update-alternatives --config java<br/>
  sudo update-alternatives --config javac
  
 2. 切换make版本
 [make 版本切换](https://www.jianshu.com/p/e42746bd0bac)

## 下载源码

　[下载源码-官网](https://source.android.com/setup/downloading)<br/>
　[清华大学镜像](https://mirror.tuna.tsinghua.edu.cn/help/AOSP/)

1. repo init -u https://android.googlesource.com/platform/manifest -b android-7.1.2_r36
2. repo sync

## 编译源码

　[准备编译-官网](https://source.android.com/setup/build/building)

1. source build/envsetup.sh
2. ./build/envsetup.sh
3. lunch aosp_arm-eng(编译选项可选)
4. make -j4
5. mmm development/tools/idegen/
6. ./development/tools/idegen/idegen.sh

## 配置

1. 选择android.ipr导入源码
2. 建立一个空的jdk, 并设置为工程依赖的jdk
3. 删除所有的依赖库
4. 将frameworks和external目录作为依赖，并调整依赖优先级
5. 将out/target/common/R/设置为依赖
6. 将不需要的目录从索引中删除，提高检索速度

**删除依赖库**

![as_aosp_source](/images/androidstudio/as_aosp_source.png)

**excluded 不常用的目录提高速度**

![as_aosp_source_2](/images/androidstudio/as_aosp_source_2.png)

## 常见问题

　[AS一直不停的scanning files to index](https://blog.csdn.net/seakisbest/article/details/83752736)


