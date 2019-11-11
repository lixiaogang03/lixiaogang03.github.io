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

* 查看设备 df -h

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

* 创建挂载目录 mkdir sunmi

* 挂载到指定目录 sudo mount /dev/sda/ /home/lixiaogang/sunmi

* 查询挂载硬盘UUID sudo blkid /dev/sda

> /dev/sda: UUID="2d940cd1-d55c-4a18-9e9e-e80e45d00754" TYPE="ext4"

* 设置开机自动挂载 sudo gedit /etc/fstab

> # /dev/sda
> UUID=2d940cd1-d55c-4a18-9e9e-e80e45d00754 /home/lixiaogang/sunmi           ext4    defaults        0       2







