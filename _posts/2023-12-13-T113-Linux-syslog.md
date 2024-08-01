---
layout:     post
title:      T113 Linux syslog
subtitle:   Linux
date:       2023-12-13
author:     LXG
header-img: img/post-bg-coffee.jpeg
catalog: true
tags:
    - syslog
---

## syslog

**buildroot syslog**

t113_linux/buildroot/buildroot-201902/package/sysklogd

**buildroot syslog-ng**

t113_linux/buildroot/buildroot-201902/package/syslog-ng

syslog-ng 是一个开源的 syslog 替代方案，它提供了更强大的日志处理和转发功能。

**busybox syslog**

buildroot/buildroot-201902/package/busybox

busybox 1.19.4的syslog是专门给嵌入式设备使用的，因此有一些功能被精简掉了，如syslog.conf，该版本不支持配置文件，所有配置都在启动syslogd守护进程时通过参数输入

```txt

t113_linux/out/t113/evb1_auto/longan/buildroot/build/busybox-1.29.3/sysklogd$ tree
.
├── built-in.o
├── Config.in
├── Config.src
├── Kbuild
├── Kbuild.src
├── klogd.c
├── klogd.o
├── lib.a
├── logger.c
├── logread.c
├── syslogd_and_logger.c
├── syslogd_and_logger.o
└── syslogd.c

```

**参数配置**

-O /userdata/syslog 缓存文件路径
-b 10 缓存文件个数
-s 2048 单个日志文件大小
-l 日志级别

```sh

sh-4.4# cat /etc/init.d/S01syslogd 
#!/bin/sh

DAEMON="syslogd"
PIDFILE="/var/run/$DAEMON.pid"

SYSLOGD_ARGS="-O /userdata/syslog -b 5"

# shellcheck source=/dev/null
[ -r "/etc/default/$DAEMON" ] && . "/etc/default/$DAEMON"

# BusyBox' syslogd does not create a pidfile, so pass "-n" in the command line
# and use "-m" to instruct start-stop-daemon to create one.
start() {
	printf 'Starting %s: ' "$DAEMON"
	# shellcheck disable=SC2086 # we need the word splitting
	start-stop-daemon -b -m -S -q -p "$PIDFILE" -x "/sbin/$DAEMON" \
		-- -n $SYSLOGD_ARGS
	status=$?
	if [ "$status" -eq 0 ]; then
		echo "OK"
	else
		echo "FAIL"
	fi
	return "$status"
}

stop() {
	printf 'Stopping %s: ' "$DAEMON"
	start-stop-daemon -K -q -p "$PIDFILE"
	status=$?
	if [ "$status" -eq 0 ]; then
		rm -f "$PIDFILE"
		echo "OK"
	else
		echo "FAIL"
	fi
	return "$status"
}

restart() {
	stop
	sleep 1
	start
}

case "$1" in
        start|stop|restart)
		"$1";;
	reload)
		# Restart, since there is no true "reload" feature.
		restart;;
        *)
                echo "Usage: $0 {start|stop|restart|reload}"
                exit 1
esac

```

**修改方案**

platform/framework/auto/rootfs/etc/init.d/S01syslogd

SYSLOGD_ARGS="-O /userdata/syslog/log -b 10 -s 2048 -l 6"

日志文件数量为 10

单个日志文件大小为 2048 (2Mb)

日志打印级别为 6

## var/log

```txt

T113/log$ tree
.
├── asound.state.lock
├── dbus
│   └── machine-id
├── dhcpd.leases
├── dhcpd.leases~
├── LCK..ttyS4
├── LCK..ttyUSB1
├── LCK..ttyUSB2
├── messages
├── messages.0
├── resolv.conf
├── runtime-root
└── subsys
    └── dbus-daemon

```

## 实时显示日志命令

tail -f /var/log/messages

**日志打印到syslog用法**

```c


#include <syslog.h>

syslog(LOG_INFO, "this is my log info.%d", 23);		//使用方法与printk 类似可以格式化的输出

```

**QT 打印日志到syslog的方法**

```cpp

#include <QCoreApplication>
#include <QSyslogMessage>

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    // 设置 syslog 的标识符和选项
    openlog("MyQtApp", LOG_PID | LOG_CONS, LOG_USER);

    // 创建一个 syslog 消息对象
    QSyslogMessage message;

    // 设置消息的优先级
    message.setPriority(LOG_INFO);

    // 设置消息的内容
    message.setMsg("Hello, world!");

    // 发送 syslog 消息
    syslog() << message;

    return a.exec();
}

```
## 485 串口

这里指明了ttyS4 串口哪个程序在占用

```txt

T113/log$ cat LCK..ttyS4 
5149
smart_cabinet
kunos
ecdc5787de4ab6852e2b911c00000004
143c6549-afd2-4aba-84bb-2b9a3cb2ecd5

```

## 4G 串口

ttyUSB1 18295 smart_cabinet 程序正在占用

ttyUSB2 22005 pppd 程序在占用

```

lxg@lixiaogang:~/code/android_log/T113/log$ cat LCK..ttyUSB1
18295
smart_cabinet
kunos
ecdc5787de4ab6852e2b911c00000004
143c6549-afd2-4aba-84bb-2b9a3cb2ecd5
lxg@lixiaogang:~/code/android_log/T113/log$ cat LCK..ttyUSB2
     22005

```

## resolv.conf

在Linux和其他类Unix操作系统中，/etc/resolv.conf 是一个重要的系统配置文件，用于设置名称解析服务（DNS）的相关参数。当用户尝试访问互联网上的域名时，计算机需要将这些域名转换为IP地址以便进行通信。

```txt

sh-4.4# cat resolv.conf 
nameserver 211.138.21.66
nameserver 211.138.23.66

```

## var/log/messages

**syslog.info syslogd started: BusyBox v1.29.3**



