---
layout:     post
title:      Android USB Debug
subtitle:   USB调试
date:       2020-04-15
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
    - usb
---

[Android 调试桥 (adb)](https://developer.android.google.cn/studio/command-line/adb?hl=zh-cn)

[Android Adb 架构及实现分析](https://pkiller.com/android/)

## adb debug

![adb_debug](/images/adb/adb_debug.png)

## adbd

```txt

shell     1706  1     27572  656   poll_sched 0000000000 S /sbin/adbd

```

### 源码

[system/core/adb](http://androidxref.com/7.1.2_r36/xref/system/core/adb/)

system/core/adb/daemon/main.cpp

```cpp

int adbd_main(int server_port) {

    // adbd socket
    init_transport_registration();

    // We need to call this even if auth isn't enabled because the file
    // descriptor will always be open.
    adbd_cloexec_auth_socket();

    if (ALLOW_ADBD_NO_AUTH && property_get_bool("ro.adb.secure", 0) == 0) {
        auth_required = false;
    }

    adbd_auth_init();

    // 降低权限到shell
    drop_privileges(server_port);

    // 当存在/dev/android_adb或/dev/usb-ffs/adb/ep0时, 先预设为USB模式
    bool is_usb = false;
    if (access(USB_ADB_PATH, F_OK) == 0 || access(USB_FFS_ADB_EP0, F_OK) == 0) {
        // Listen on USB.
        usb_init();
        is_usb = true;
    }

    // 若port不为0，则使用TCP/IP模式，否则维持USB模式.
    // If one of these properties is set, also listen on that port.
    // If one of the properties isn't set and we couldn't listen on usb, listen
    // on the default port.
    char prop_port[PROPERTY_VALUE_MAX];
    property_get("service.adb.tcp.port", prop_port, "");
    if (prop_port[0] == '\0') {
        property_get("persist.adb.tcp.port", prop_port, "");
    }

    int port;
    if (sscanf(prop_port, "%d", &port) == 1 && port > 0) {
        D("using port=%d", port);
        // Listen on TCP port specified by service.adb.tcp.port property.
        local_init(port);
    } else if (!is_usb) {
        // Listen on default port.
        local_init(DEFAULT_ADB_LOCAL_TRANSPORT_PORT);
    }

    D("adbd_main(): pre init_jdwp()");
    init_jdwp();
    D("adbd_main(): post init_jdwp()");

    D("Event loop starting");
    fdevent_loop();

    return 0;

}


static bool should_drop_privileges() {
#if defined(ALLOW_ADBD_ROOT)
    char value[PROPERTY_VALUE_MAX];

    // The properties that affect `adb root` and `adb unroot` are ro.secure and
    // ro.debuggable. In this context the names don't make the expected behavior
    // particularly obvious.
    //
    // ro.debuggable:
    //   Allowed to become root, but not necessarily the default. Set to 1 on
    //   eng and userdebug builds.
    //
    // ro.secure:
    //   Drop privileges by default. Set to 1 on userdebug and user builds.
    property_get("ro.secure", value, "1");
    bool ro_secure = (strcmp(value, "1") == 0);

    property_get("ro.debuggable", value, "");
    bool ro_debuggable = (strcmp(value, "1") == 0);

    // Drop privileges if ro.secure is set...
    bool drop = ro_secure;

    property_get("service.adb.root", value, "");
    bool adb_root = (strcmp(value, "1") == 0);
    bool adb_unroot = (strcmp(value, "0") == 0);

    // ... except "adb root" lets you keep privileges in a debuggable build.
    if (ro_debuggable && adb_root) {
        drop = false;
    }

    // ... and "adb unroot" lets you explicitly drop privileges.
    if (adb_unroot) {
        drop = true;
    }

    return drop;
#else
    return true; // "adb root" not allowed, always drop privileges.
#endif // ALLOW_ADBD_ROOT
}

```

## 相关属性

```txt

// adb 连接模式
service.adb.tcp.port // 0为USB调试
persist.adb.tcp.port

// adb 调试用户验证

[ro.adb.secure]: [1] // 需要弹框勾选授权

// usb上所有支持的功能

[sys.usb.state]: [diag,serial_smd,rmnet_qti_bam,adb]

// Adbd 是否运行中

[init.svc.adbd]: [running]

// userdebug

[ro.debuggable]: [1]

[ro.secure]: [1]

// vold

[vold.decrypt]: [trigger_restart_framework]

```

## Framework

### Usb Debugging Init

![UsbDebug_init](/images/adb/UsbDebug_init.png)

### 手动打开USB调试

在Android中，当Mobile通过USB连接到PC后，到底开启哪些功能(如：adbd、midi、mtp等) 都是由UsbDeviceManager来做总控的。
而UsbDeviceManager对这些功能控制的方式就是通过修改property。adbd会根据相关preoperty项作出相应操作，从而决定是否被打开。
那么adbd是如何响应property的更改呢？
这主要依赖init.usb.rc或init.*.usb.rc在一开机就注册好的property事件，当指定的property项如sys.usb.config的值被设为mtp,usb时，就会触发启动adbd的命令。

system/core/rootdir/init.usb.rc

```rc

on post-fs-data
    chown system system /sys/class/android_usb/android0/f_mass_storage/lun/file
    chmod 0660 /sys/class/android_usb/android0/f_mass_storage/lun/file
    chown system system /sys/class/android_usb/android0/f_rndis/ethaddr
    chmod 0660 /sys/class/android_usb/android0/f_rndis/ethaddr
    mkdir /data/misc/adb 02750 system shell
    mkdir /data/adb 0700 root root

# adbd is controlled via property triggers in init.<platform>.usb.rc
service adbd /sbin/adbd --root_seclabel=u:r:su:s0
    class core
    socket adbd stream 660 system system
    disabled
    seclabel u:r:adbd:s0

# adbd on at boot in emulator
on property:ro.kernel.qemu=1
    start adbd

on boot
    setprop sys.usb.configfs 0

# Used to disable USB when switching states
on property:sys.usb.config=none && property:sys.usb.configfs=0
    stop adbd
    write /sys/class/android_usb/android0/enable 0
    write /sys/class/android_usb/android0/bDeviceClass 0
    setprop sys.usb.state ${sys.usb.config}

# adb only USB configuration
# This is the fallback configuration if the
# USB manager fails to set a standard configuration
on property:sys.usb.config=adb && property:sys.usb.configfs=0
    write /sys/class/android_usb/android0/enable 0
    write /sys/class/android_usb/android0/idVendor 18d1
    write /sys/class/android_usb/android0/idProduct 4EE7
    write /sys/class/android_usb/android0/functions ${sys.usb.config}
    write /sys/class/android_usb/android0/enable 1
    start adbd
    setprop sys.usb.state ${sys.usb.config}

........................................................

```

![open_debug](/images/adb/open_debug.png)












