---
layout:     post
title:      Buildroot Add App
subtitle:   T113
date:       2023-12-05
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - buildroot
---

## 新增app源码

**目录**

```txt

t113_linux/platform/apps/monitor_usb$ tree
.
├── Makefile
└── monitor_usb.c

```

**monitor_usb.c**

```c

#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <libudev.h>
#include <stdlib.h>
#include <sys/reboot.h>

/**
 * swupdate ota
 */
void swupdate_ota() {
    const char *filename = "/mnt/usb/sda1/update.swu";
    int result = access(filename, F_OK);

    if (result == 0) {
        int response = system("swupdate -v -i /mnt/usb/sda1/update.swu -e stable,now_A_next_B");
        if (response == -1) {
            printf("Failed to execute swupdate command\n");
        } else {
            printf("Rebooting the device...\n");
            sync();// 同步磁盘上的数据
            if (reboot(RB_AUTOBOOT) == -1) {
                printf("Failed to reboot the system\n");
            }
        }
    } else {
        printf("/mnt/usb/sda1/update.swu does not exits\n");
    }
}

int main() {
    struct udev *udev;
    struct udev_monitor *mon;
    struct udev_device *dev;
    int fd;

    /* 初始化 udev */
    udev = udev_new();
    if (!udev) {
        fprintf(stderr, "Can't create udev\n");
        return 1;
    }

    /* 创建 udev 监听器 */
    mon = udev_monitor_new_from_netlink(udev, "udev");
    if (!mon) {
        fprintf(stderr, "Can't create udev monitor\n");
        return 1;
    }

    /* 设置要监听的事件类型 */
    if (udev_monitor_filter_add_match_subsystem_devtype(mon, "block", "disk") < 0 ||
        udev_monitor_enable_receiving(mon) < 0) {
        fprintf(stderr, "Can't filter block subsystem or enable receiving\n");
        return 1;
    }

    // 获取文件描述符
    fd = udev_monitor_get_fd(mon);

    /* 循环监听并处理事件 */
    while (1) {
        // 使用 select 系统调用来等待设备事件或超时
        fd_set fds;
        FD_ZERO(&fds);
        FD_SET(fd, &fds);

        struct timeval timeout;
        timeout.tv_sec = 5;  // 设置超时时间为 5 秒
        timeout.tv_usec = 0;

        // 使用 select() 设置超时时间
        if (select(fd + 1, &fds, NULL, NULL, &timeout) < 0) {
            printf("Error waiting for device event\n");
            continue;
        }

        if (FD_ISSET(fd, &fds)) {
            // 当设备事件发生时，从监视器接收设备对象
            dev = udev_monitor_receive_device(mon);
            if (dev == NULL) {
                printf("Invalid device received from udev monitor\n");
                continue;
            }

            const char *action = udev_device_get_action(dev);
            const char *devpath = udev_device_get_devnode(dev);

            printf("Action: %s, Device Path: %s\n", action, devpath);

            if (strcmp("add", action) == 0) {
                swupdate_ota();
            }

            udev_device_unref(dev);
        } else {
            // 没有设备事件发生
            // printf("No device events received\n");
        }
    }

    /* 清理资源 */
    udev_monitor_unref(mon);
    udev_unref(udev);

    return 0;
}

```

**Makefile**

```makefile

OBJS = monitor_usb.o
OUT_BIN = monitor_usb

all:$(OBJS)
        $(CC) $(LDFLAGS) -g -o $(OUT_BIN) $^

%.o: %.c
        $(CC) $(CFLAGS) -c -o $@ $<

.PHONY: clean
clean:
        rm -rf *.o
        rm -rf $(OUT_BIN)
        rm -rf $(shell find -name "*.d")

```

## buildroot 配置

**目录**

```txt

t113_linux/platform/config/buildroot/monitor_usb$ tree
.
├── Config.in
└── monitor_usb.mk

```

**Config.in**

```in

config BR2_PACKAGE_MONITOR_USB
	bool "monitor_usb"
	select BR2_PACKAGE_EUDEV
	help
	  monitor usb

```

**monitor_usb.mk**

```makefile

################################################################################
#
# monitor usb
#
################################################################################
MONITOR_USB_SITE_METHOD = local
MONITOR_USB_SITE = $(PLATFORM_PATH)/../../apps/monitor_usb
MONITOR_USB_LICENSE = GPLv2+, GPLv3+
MONITOR_USB_LICENSE_FILES = Copyright COPYING
MONITOR_USB_DEPENDENCIES = udev

MONITOR_USB_LDFLAGS += -L$(TARGET_DIR)/usr/lib/ -ludev

define MONITOR_USB_BUILD_CMDS
        $(MAKE) CC="$(TARGET_CC)" CFLAGS="$(MONITOR_USB_CFLAGS)" \
                LDFLAGS="$(MONITOR_USB_LDFLAGS)" -C $(@D) all
endef

define MONITOR_USB_INSTALL_TARGET_CMDS
        $(INSTALL) -D -m 0755 $(@D)/monitor_usb $(TARGET_DIR)/usr/bin
endef

$(eval $(generic-package))

```

**platform/config/buildroot/Config.in**

```in

source "../../platform/config/buildroot/monitor_usb/Config.in"

```

**platform/config/buildroot/platform.mk**

```makefile

include ${PLATFORM_PATH}/monitor_usb/monitor_usb.mk

```

**buildroot/buildroot-201902/configs/sun8iw20p1_t113_defconfig**

BR2_PACKAGE_MONITOR_USB=y

## 配置程序为默认启动

```txt

t113_linux/platform/framework/auto/rootfs/etc/init.d$ tree
.
├── rcK
├── rcS
├── S01syslogd
├── S02klogd
├── S05mount_userdata
├── S10udev
├── S20urandom
├── S30dbus
├── S40network
├── S50bluetooth
├── S50postgresql
├── S52_4G-Daemon.sh
├── S80dnsmasq
├── S90alsa.sh
└── S92monitor_usb.sh

```

**S92monitor_usb.sh**

```sh

#!/bin/sh

case "$1" in
  start)
    echo "Starting monitor_usb"
    /usr/bin/monitor_usb &
    ;;
  stop)
    echo "Stopping monitor_usb"
    killall monitor_usb
    ;;
  restart)
    $0 stop
    $0 start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac

exit 0

```










