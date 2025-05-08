---
layout:     post
title:      Windows以太网带宽测试步骤
subtitle:   iperf3
date:       2025-05-08
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - linux
---

## 下载iperf3测试工具

下载地址： https://files.budman.pw/

点击 iperf3.18_64.zip 即可下载

![iperf3_download](/images/tools/iperf3_download.png)

下载后解压的某个目录下，例如：

![windows_iperf3](/images/tools/windows_iperf3.png)

## 测试准备

`Windows主机和待测试主板接在同一个局域网内`

`注意需要用千兆的路由器或者交换机，还有支持千兆的网线`

## 最新主板固件地址

**V2主板**

[V2KFH_1024x768_12_20250421.1104_user](http://rk3588image.wif.ink/V2KFH/V2KFH_1024x768_12_20250421.1104_user.img)

**V3主板**

[V3KFH_1024x768_12_20250421.1431_user](http://rk3588image.wif.ink/V3KFH/V3KFH_1024x768_12_20250421.1431_user.img)

## 查看windows本机IP地址

打开window终端，执行ipconfig命令

![windows_ipconfig](/images/tools/windows_ipconfig.png)

可以看到当前windows电脑的IP地址为 `192.168.1.54`

## 运行windows端的iperf3指令

将iperf3.exe文件用鼠标拖入终端窗口即可, 然后输入-s参数，此时服务端就运行起来了，等待测试端的连接

![windows_iperf3_cmd](/images/tools/windows_iperf3_cmd.png)

## 运行待测试主板端的iperf3指令

Windows电脑上新打开一个终端窗口

运行 adb shell 指令

运行 ifconfig 指令

![rk3588_ifconfig](/images/tools/rk3588_ifconfig.png)

运行iperf3指令: `ipef3 -c 192.168.1.54` (电脑的IP地址)

![rk3588_iperf3_cmd](/images/tools/rk3588_iperf3_cmd.png)

可以看到测试结果的带宽是256MB，显然未达到千兆, 此时的测试结果是`失败`的

针对3588主板，另一个网口使用相同办法测试即可












