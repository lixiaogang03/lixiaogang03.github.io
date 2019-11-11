---
layout:     post
title:      Ubuntu配置Android开发环境
subtitle:   Ubuntu 16.04
date:       2019-11-11
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - ubuntu
---

## 安装Ubuntu 16.04

* U盘制作启动盘
* F12 (Dell) 进入启动选择U盘启动
* 安装

128G 固态硬盘分区建议:

主分区：50G  /
交换分区：32G  内存*2 (16*2)
逻辑分区：others /home

## 挂载磁盘

```txt

文件系统          容量  已用  可用 已用% 挂载点
udev            7.8G     0  7.8G    0% /dev
tmpfs           1.6G  9.6M  1.6G    1% /run
/dev/sdb1        47G  5.5G   39G   13% /
tmpfs           7.8G  335M  7.5G    5% /dev/shm
tmpfs           5.0M  4.0K  5.0M    1% /run/lock
tmpfs           7.8G     0  7.8G    0% /sys/fs/cgroup
/dev/sdb6        41G  471M   38G    2% /home
/dev/sda        3.6T  2.1T  1.4T   62% /home/lixiaogang/sunmi
tmpfs           1.6G   60K  1.6G    1% /run/user/1000

```

* 查看设备 df -h

* 创建挂载目录 mkdir sunmi

* 挂载到指定目录 sudo mount /dev/sda/ /home/lixiaogang/sunmi

* 查询挂载硬盘UUID sudo blkid /dev/sda  --- /dev/sda: UUID="2d940cd1-d55c-4a18-9e9e-e80e45d00754" TYPE="ext4"

* 设置开机自动挂载 sudo gedit /etc/fstab --- UUID=2d940cd1-d55c-4a18-9e9e-e80e45d00754 /home/lixiaogang/sunmi    ext4    defaults    0    2

## ssh-keygen 生成密钥(gitlab、gerrit)

* ssh-keygen -t rsa -C "your_email@example.com"

* cat .ssh/id_rsa.pub

* 拷贝到gitlab、github、gerrit

## Git配置

sudo apt-get install git

sudo apt-get install gitk

git config --global user.name "maxsu"
git config --global user.email "yiibai.com@gmail.com"

git命令显示中文乱码解决： git config --global core.quotepath false

## Java环境配置

OpenJDK 可以直接使用 apt-get 安装

sudo apt-get install openjdk-7-jdk openjdk-7-jre openjdk-7-doc

sudo apt-get install openjdk-8-jdk openjdk-8-jre openjdk-8-doc


根据Ubuntu版本，如果不能安装openjdk指定的版本，则需要执行下面命令

sudo add-apt-repository ppa:openjdk-r/ppa

sudo apt-get update

sudo apt-get install openjdk-7-jdk openjdk-7-jre openjdk-7-doc openjdk-7-jre-headless openjdk-7-source openjdk-7-jre-lib

sudo apt-get install openjdk-8-jdk openjdk-8-jre openjdk-8-doc openjdk-8-jre-headless openjdk-8-source openjdk-8-jdk-headless


配置JDK默认版本

sudo update-alternatives --config java

sudo update-alternatives --config javac

java -version 查看默认版本是否正确

## 编译环境配置

sudo rm /bin/sh && sudo ln -sn /bin/bash /bin/sh

sudo apt-get install vim samba expect sshpass openssh-server openssh-client

sudo apt-get install libssl-dev

sudo apt-get install libtool openssh-server samba git-core g++ make diffstat texi2html texinfo subversion gawk chrpath libsm6 libxrender1 libfontconfig1 lzop libxml-sax-expat-perl python-xlrd python-xlwt tofrodos xsltproc

sudo apt-get install gnupg flex bison gperf build-essential zip curl zlib1g-dev libc6-dev lib32ncurses5-dev lib32z1 lib32ncurses5 x11proto-core-dev libx11-dev libreadline-gplv2-dev lib32z1-dev libgl1-mesa-dev g++-multilib binutils-mingw-w64 tofrodos python-markdown libxml2-utils xsltproc genisoimage python-imaging bc liblz4-tool

## gcc/g++ 版本

Ubuntu 16.04及以上系统， gcc/g++ 版本过高，编译可能会报错，所以需要把gcc/g++ 降级为4.8 版本，命令如下：

sudo apt-get install aptitude

sudo aptitude install gcc-4.8

sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-5 999

sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 800

sudo aptitude install g++-4.8

sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 800

sudo update-alternatives --config gcc

sudo update-alternatives --config g++

## 配置sdk

下载AndroidStudio[下载地址](https://developer.android.google.cn/studio/)

运行/bin/studio.sh, 安装并下载SDK

环境变量配置

sudo gedit ~/.bashrc

export PATH=$PATH:/home/lixiaogang/sunmi/androidstudio/sdk/tools/
export PATH=$PATH:/home/lixiaogang/sunmi/androidstudio/sdk/platform-tools

source ~/.bashrc

adb version















