---
layout:     post
title:      Buildroot Dropbear
subtitle:   A smallish SSH server and client
date:       2024-05-09
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - buildroot
---

## T113 init.d

```txt

-rwxrwxr-x    1 root     root           463 Apr 29 11:16 etc/init.d/S00mount_userdata
-rwxr-xr-x    1 root     root          1114 Apr 29 11:16 etc/init.d/S01syslogd
-rwxr-xr-x    1 root     root          1046 Apr 29 11:16 etc/init.d/S02klogd
-rwxr-xr-x    1 root     root          1594 Apr 29 11:16 etc/init.d/S10udev
-rwxr-xr-x    1 root     root          1272 Apr 29 11:16 etc/init.d/S20urandom    // Linux系统中的一个伪随机数生成器
-rwxr-xr-x    1 root     root           404 Apr 28 17:50 etc/init.d/S21haveged    // haveged 是一个用于增加系统熵池（entropy pool）的守护进程
-rwxr-xr-x    1 root     root          1635 Apr 29 11:16 etc/init.d/S30dbus       // D-Bus 是一个消息总线系统，用于进程间通信
-rwxr-xr-x    1 root     root           438 Apr 29 11:16 etc/init.d/S40network
-rwxr-xr-x    1 root     root           617 Apr 28 17:16 etc/init.d/S41dhcpcd
-rwxr-xr-x    1 root     root           581 Apr 28 17:10 etc/init.d/S49ntp
-rwxrwxr-x    1 root     root           235 Apr 29 11:16 etc/init.d/S50bluetooth  // 已裁剪
-rwxr-xr-x    1 root     root          1354 Apr 28 17:20 etc/init.d/S50dropbear
-rwxr-xr-x    1 root     root           642 Apr 29 11:16 etc/init.d/S50postgresql  // 是一种功能强大的开源对象关系型数据库管理系统（ORDBMS）
-rwxr-xr-x    1 root     root           614 Apr 28 17:11 etc/init.d/S50telnet      // elnet 是一种远程登录协议，允许用户通过网络在本地计算机上登录并控制远程主机。
-rwxrwxr-x    1 root     root           153 Apr 29 11:16 etc/init.d/S52_4G-Daemon.sh
-rwxr-xr-x    1 root     root          1190 Apr 28 17:16 etc/init.d/S80dhcp-relay
-rwxr-xr-x    1 root     root          1156 Apr 28 17:16 etc/init.d/S80dhcp-server

// dnsmasq 能够作为一个轻量级的 DNS 缓存服务器，为局域网内的客户端提供域名解析服务。
它会缓存外部 DNS 查询结果，提高后续相同查询的响应速度，减少对外部 DNS 服务器的访问需求，从而降低网络延迟和带宽消耗
-rwxr-xr-x    1 root     root           427 Apr 29 11:16 etc/init.d/S80dnsmasq

-rwxrwxr-x    1 root     root            56 Apr 29 11:16 etc/init.d/S90alsa.sh     // 音频相关
-rwxrwxr-x    1 root     root           291 Apr 29 11:16 etc/init.d/S92monitor_usb.sh
-rwxrwxr-x    1 root     root           270 Apr 29 11:16 etc/init.d/S94wif_mqtt.sh
-rwxr-xr-x    1 root     root           423 Apr 29 11:16 etc/init.d/rcK
-rwxr-xr-x    1 root     root           990 Apr 29 11:16 etc/init.d/rcS

```

## S50dropbear 和 S50telnet

Telnet:

* 安全性：Telnet 是一种非常老的远程访问协议，它以明文形式传输数据，包括用户名和密码，因此极其不安全。任何在网络中监听流量的人都能轻易获取这些敏感信息。
* 功能：Telnet 主要用于远程登录和命令行交互，允许用户在本地计算机上操作远程主机上的命令行界面。
* 端口：默认使用TCP端口23。
* 现代使用：由于安全性问题，Telnet 在现代网络环境中已较少使用，尤其是在需要安全通信的场合。

Dropbear:

* 安全性：Dropbear 是一个轻量级的SSH服务器和客户端实现，专为嵌入式设备设计。它支持SSH协议，这意味着所有通信都会被加密，提供比Telnet高得多的安全级别。SSH可以防止中间人攻击（MITM）和数据包嗅探。
* 资源占用：相比于OpenSSH，Dropbear消耗的系统资源更少，特别适合那些内存和处理能力有限的设备，如路由器、嵌入式系统等。
* 功能：除了提供安全的远程登录外，Dropbear也支持公钥认证、端口转发等功能，类似于OpenSSH。
* 端口：Dropbear 默认使用SSH协议的端口，即TCP端口22，但可以配置为其他端口。
* 集成与配置：在一些嵌入式Linux发行版如OpenWrt中，Dropbear常常作为默认的SSH服务器，因为它的小尺寸和低资源需求更适合这类环境。

## telnet 命令使用

**修改root密码**

```txt

sh-4.4# passwd root
Changing password for root
New password: 123456
Bad password: too weak
Retype password: 123456
passwd: password for root changed by root

```


telnet 192.168.0.51 登陆

```txt

$ telnet 192.168.0.51
Trying 192.168.0.51...
Connected to 192.168.0.51.
Escape character is '^]'.

kunos login: root
Password: 123456
# 

```

## dropbear 命令使用

**修改root密码**

```txt

sh-4.4# passwd root
Changing password for root
New password: 123456
Bad password: too weak
Retype password: 123456
passwd: password for root changed by root

```

**ssh命令连接**

```txt

ssh root@192.168.0.51
root@192.168.0.51's password: 123456
#

```





















