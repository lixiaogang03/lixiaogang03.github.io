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
[搭建编译环境-官网](https://source.android.com/setup/build/initializing)</br>

## 下载源码

[下载源码-官网](https://source.android.com/setup/downloading)<br/>
[清华大学镜像](https://mirror.tuna.tsinghua.edu.cn/help/AOSP/)</br>

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

### AndroidStudio导入源码

### jdk 配置

### 依赖项配置


