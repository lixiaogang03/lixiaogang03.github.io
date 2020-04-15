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

**adb 连接模式**

service.adb.tcp.port // 0为USB调试
persist.adb.tcp.port

**adb 调试用户验证**

[ro.adb.secure]: [1]

**usb上所有支持的功能**

[sys.usb.state]: [diag,serial_smd,rmnet_qti_bam,adb]

**Adbd 是否运行中**

[init.svc.adbd]: [running]

**userdebug**

[ro.debuggable]: [1]

[ro.secure]: [1]















