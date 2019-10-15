---
layout:     post
title:      Android Property
subtitle:   属性服务
date:       2019-10-15
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - android
    - property
---

## ctl.start

通过 property_set("ctl.start", service_xx) 来启动 init.rc 中的 service 是一个很方便方法来调用某个可执行程序或某个脚本程序

### Demo 1

```java

package com.android.settings;

public class DevelopmentSettings {

    private void writeLogdSizeOption(Object newValue) {

        SystemProperties.set("ctl.start", "logd-reinit");

    }

}

```

**system/etc/init/logd.rc**

```rc

service logd /system/bin/logd
    socket logd stream 0666 logd logd
    socket logdr seqpacket 0666 logd logd
    socket logdw dgram 0222 logd logd
    group root system readproc
    writepid /dev/cpuset/system-background/tasks

service logd-reinit /system/bin/logd --reinit
    oneshot
    disabled
    writepid /dev/cpuset/system-background/tasks

```

### Demo 2

```java

public class SystemService {

    /** Request that the init daemon start a named service. */
    public static void start(String name) {
        SystemProperties.set("ctl.start", name);
    }

}


public final class ActivityManagerService extends ActivityManagerNative
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    public void requestBugReport(int bugreportType) {
        String service = null;
        switch (bugreportType) {
            case ActivityManager.BUGREPORT_OPTION_FULL:
                service = "bugreport";
                break;
            case ActivityManager.BUGREPORT_OPTION_INTERACTIVE:
                service = "bugreportplus";
                break;
            case ActivityManager.BUGREPORT_OPTION_REMOTE:
                service = "bugreportremote";
                break;
            case ActivityManager.BUGREPORT_OPTION_WEAR:
                service = "bugreportwear";
                break;
            case ActivityManager.BUGREPORT_OPTION_TELEPHONY:
                service = "bugreportelefony";
                break;
        }
        if (service == null) {
            throw new IllegalArgumentException("Provided bugreport type is not correct, value: "
                    + bugreportType);
        }
        enforceCallingPermission(android.Manifest.permission.DUMP, "requestBugReport");
        SystemProperties.set("ctl.start", service);
    }

}

```

**./system/etc/init/dumpstate.rc**

```rc

on boot
    # Allow bugreports access to eMMC 5.0 stats
    chown root mount /sys/kernel/debug/mmc0/mmc0:0001/ext_csd
    chmod 0440 /sys/kernel/debug/mmc0/mmc0:0001/ext_csd

service dumpstate /system/bin/dumpstate -s
    class main
    socket dumpstate stream 0660 shell log
    disabled
    oneshot

# dumpstatez generates a zipped bugreport but also uses a socket to print the file location once
# it is finished.
service dumpstatez /system/bin/dumpstate -S -d -z \
        -o /data/user_de/0/com.android.shell/files/bugreports/bugreport
    socket dumpstate stream 0660 shell log
    class main
    disabled
    oneshot

# bugreportplus is an enhanced version of bugreport that provides a better
# user interface (like displaying progress and allowing user to enter details).
# It's typically triggered by the power button or developer settings.
service bugreportplus /system/bin/dumpstate -d -B -P -z \
        -o /data/user_de/0/com.android.shell/files/bugreports/bugreport
    class main
    disabled
    oneshot

```

### Demo 3

**frameworks/native/services/surfaceflinger/SurfaceFlinger.cpp**

```cpp

void SurfaceFlinger::init() {

    // start boot animation
    startBootAnim();

}


void SurfaceFlinger::startBootAnim() {
    // start boot animation
    property_set("service.bootanim.exit", "0");
    property_set("ctl.start", "bootanim");
}

```

**./system/etc/init/bootanim.rc**

```rc

service bootanim /system/bin/bootanimation
    class core
    user graphics
    group graphics audio
    disabled
    oneshot
    writepid /dev/stune/top-app/tasks

```


