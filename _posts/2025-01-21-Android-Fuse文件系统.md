---
layout:     post
title:      Android Fuse 文件系统
subtitle:   android 11
date:       2025-01-21
author:     LXG
header-img: img/post-bg-xiaomi.jpg
catalog: true
tags:
    - android
---

[分区存储-AOSP](https://source.android.com/docs/core/storage/scoped?hl=zh-cn)

[深入分析Android 11 FUSE文件系统-掘金](https://juejin.cn/post/7260732088412553253)

## FUSE 文件系统

[fuse_filesystem](/images/fuse/fuse_filesystem.webp)

1. Fuse包含一个内核模块和一个用户空间守护进程
2. 内核模块加载时被注册成 Linux 虚拟文件系统的一个 fuse 文件系统驱动
3. 还注册了一个/dev/fuse的块设备。该块设备作为fuse daemon与内核通信的桥梁，fuse daemon通过/dev/fuse读取fuse request，处理后将reply写入/dev/fuse

### 内核模块

```bash

rk3568_android_11/kernel/fs/fuse$ tree
.
├── acl.c           // 管理 FUSE 文件系统中的访问控制列表（ACL），用于定义更细粒度的权限管理
├── control.c       // 处理与 FUSE 控制接口相关的逻辑，例如通过特殊文件 /dev/fuse 与用户空间交互
├── cuse.c
├── dev.c           // 定义 FUSE 文件系统的设备操作，比如初始化 /dev/fuse 设备节点
├── dir.c           // 处理目录相关的操作，例如创建、读取和删除目录
├── file.c          // 处理文件的读写操作，是核心文件之一
├── fuse_i.h
├── inode.c         // 管理 FUSE 文件系统的 inode（文件系统的元数据），例如文件类型、大小、权限等信息
├── Kconfig
├── Makefile
├── OWNERS
└── xattr.c         // 实现扩展属性（Extended Attributes）功能，用于为文件和目录存储额外的元数据

```

### rk3568 android 11

fuse 分区

```

rk3568_r:/ $ mount | grep fuse
none on /sys/fs/fuse/connections type fusectl (rw,relatime)
/dev/fuse on /mnt/user/0/emulated type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
/dev/fuse on /mnt/installer/0/emulated type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
/dev/fuse on /mnt/androidwritable/0/emulated type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
/dev/fuse on /storage/emulated type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)

# TF卡
/dev/fuse on /mnt/user/0/4552-4F43 type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
/dev/fuse on /mnt/installer/0/4552-4F43 type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
/dev/fuse on /mnt/androidwritable/0/4552-4F43 type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
/dev/fuse on /storage/4552-4F43 type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)

```

### FuseDaemon

Android 11整个FUSE文件系统的用户态Daemon是在MediaProvider里面实现的，是用JNI来实现的。而FUSE文件系统的核心代码的实现都是在libfuse中，由FuseDaemon来调用的

**MediaProvider**

```bash

lxg@lxg:~/code/project/rk3568_android_11/packages/providers/MediaProvider/src$ tree
.
└── com
    └── android
        └── providers
            └── media
                ├── CacheClearingActivity.java
                ├── DatabaseHelper.java
                ├── fuse
                │   ├── ExternalStorageServiceImpl.java
                │   └── FuseDaemon.java
                ├── IdleService.java
                ├── LocalCallingIdentity.java
                ├── MediaApplication.java
                ├── MediaDocumentsProvider.java
                ├── MediaProvider.java
                ├── MediaReceiver.java
                ├── MediaService.java
                ├── MediaUpgradeReceiver.java
                ├── PermissionActivity.java
                ├── playlist
                │   ├── M3uPlaylistPersister.java
                │   ├── Playlist.java
                │   ├── PlaylistPersister.java
                │   ├── PlsPlaylistPersister.java
                │   ├── WplPlaylistPersister.java
                │   └── XspfPlaylistPersister.java
                ├── scan
                │   ├── LegacyMediaScanner.java
                │   ├── MediaScanner.java
                │   ├── ModernMediaScanner.java
                │   └── NullMediaScanner.java
                └── util
                    ├── BackgroundThread.java
                    ├── CachedSupplier.java
                    ├── DatabaseUtils.java
                    ├── ExifUtils.java
                    ├── FileUtils.java
                    ├── ForegroundThread.java
                    ├── HandlerExecutor.java
                    ├── IsoInterface.java
                    ├── Logging.java
                    ├── LongArray.java
                    ├── Memory.java
                    ├── Metrics.java
                    ├── MimeUtils.java
                    ├── PermissionUtils.java
                    ├── RedactingFileDescriptor.java
                    ├── SQLiteQueryBuilder.java
                    ├── SQLiteTokenizer.java
                    └── XmpInterface.java


lxg@lxg:~/code/project/rk3568_android_11/packages/providers/MediaProvider/jni$ tree
.
├── Android.bp
├── com_android_providers_media_FuseDaemon.cpp
├── FuseDaemon.cpp
├── FuseDaemon.h
├── fuse_node_test.xml
├── FuseUtils.cpp
├── FuseUtilsTest.cpp
├── FuseUtilsTest.xml
├── include
│   └── libfuse_jni
│       ├── FuseUtils.h
│       ├── ReaddirHelper.h
│       └── RedactionInfo.h
├── jni_init.cpp
├── MediaProviderWrapper.cpp
├── MediaProviderWrapper.h
├── node.cpp
├── node-inl.h
├── node_test.cpp
├── ReaddirHelper.cpp
├── RedactionInfo.cpp
├── RedactionInfoTest.cpp
├── RedactionInfoTest.xml
└── TEST_MAPPING

```

**libfuse**

```bash

lxg@lxg:~/code/project/rk3568_android_11/external/libfuse$ tree
.
├── Android.bp
├── Android.patch
├── AUTHORS
├── GPL2.txt
├── include
│   ├── cuse_lowlevel.h
│   ├── fuse_common.h
│   ├── fuse.h
│   ├── fuse_kernel.h
│   ├── fuse_log.h
│   ├── fuse_lowlevel.h
│   ├── fuse_opt.h
│   └── meson.build
├── LGPL2.txt
├── lib
│   ├── android_config.h
│   ├── buffer.c
│   ├── config.h
│   ├── cuse_lowlevel.c
│   ├── fuse.c
│   ├── fuse_i.h
│   ├── fuse_log.c
│   ├── fuse_loop.c
│   ├── fuse_loop_mt.c
│   ├── fuse_lowlevel.c
│   ├── fuse_misc.h
│   ├── fuse_opt.c
│   ├── fuse_signals.c
│   ├── fuse_versionscript
│   ├── helper.c
│   ├── meson.build
│   ├── modules
│   │   ├── iconv.c
│   │   └── subdir.c
│   ├── mount_bsd.c
│   ├── mount.c
│   ├── mount_util.c
│   └── mount_util.h
├── LICENSE
├── meson.build
├── METADATA
├── MODULE_LICENSE_LGPL2
├── NOTICE -> LGPL2.txt
└── README.md

```

## 开机过程

**SystemServer**

```java


public final class SystemServer {

    private void startOtherServices(@NonNull TimingsTraceAndSlog t) {

                t.traceBegin("StartStorageManagerService");
                try {
                    /*
                     * NotificationManagerService is dependant on StorageManagerService,
                     * (for media / usb notifications) so we must start StorageManagerService first.
                     */
                    mSystemServiceManager.startService(STORAGE_MANAGER_SERVICE_CLASS);
                    storageManager = IStorageManager.Stub.asInterface(
                            ServiceManager.getService("mount"));
                } catch (Throwable e) {
                    reportWtf("starting StorageManagerService", e);
                }
                t.traceEnd();

                t.traceBegin("StartStorageStatsService");
                try {
                    mSystemServiceManager.startService(STORAGE_STATS_SERVICE_CLASS);
                } catch (Throwable e) {
                    reportWtf("starting StorageStatsService", e);
                }
                t.traceEnd();
            }
    }
}

```

**StorageManagerService**


```java

class StorageManagerService extends IStorageManager.Stub
        implements Watchdog.Monitor, ScreenObserver {

    public static class Lifecycle extends SystemService {

        @Override
        public void onStart() {
            mStorageManagerService = new StorageManagerService(getContext());
            publishBinderService("mount", mStorageManagerService);
            mStorageManagerService.start();
        }

    }

    private void start() {
        connectStoraged();
        connectVold();
    }

    private void connectStoraged() {
        IBinder binder = ServiceManager.getService("storaged");
        if (binder != null) {
            try {
                binder.linkToDeath(new DeathRecipient() {
                    @Override
                    public void binderDied() {
                        Slog.w(TAG, "storaged died; reconnecting");
                        mStoraged = null;
                        connectStoraged();
                    }
                }, 0);
            } catch (RemoteException e) {
                binder = null;
            }
        }

        if (binder != null) {
            mStoraged = IStoraged.Stub.asInterface(binder);
        } else {
            Slog.w(TAG, "storaged not found; trying again");
        }

        if (mStoraged == null) {
            BackgroundThread.getHandler().postDelayed(() -> {
                connectStoraged();
            }, DateUtils.SECOND_IN_MILLIS);
        } else {
            onDaemonConnected();
        }
    }

    private void connectVold() {
        IBinder binder = ServiceManager.getService("vold");
        if (binder != null) {
            try {
                binder.linkToDeath(new DeathRecipient() {
                    @Override
                    public void binderDied() {
                        Slog.w(TAG, "vold died; reconnecting");
                        mVold = null;
                        connectVold();
                    }
                }, 0);
            } catch (RemoteException e) {
                binder = null;
            }
        }

        if (binder != null) {
            mVold = IVold.Stub.asInterface(binder);
            try {
                mVold.setListener(mListener);
            } catch (RemoteException e) {
                mVold = null;
                Slog.w(TAG, "vold listener rejected; trying again", e);
            }
        } else {
            Slog.w(TAG, "vold not found; trying again");
        }

        if (mVold == null) {
            BackgroundThread.getHandler().postDelayed(() -> {
                connectVold();
            }, DateUtils.SECOND_IN_MILLIS);
        } else {
            onDaemonConnected();
        }
    }

}

```

## VOLD

Vold: Volume Daemon, 用于管理和控制Android平台外部存储设备的后台进程,这些管理和控制,包括SD卡的插拔事件检测/SD卡挂载/卸载/格式化等，是一个开机启动的服务

system/vold/vold.rc

```rc

service vold /system/bin/vold \
        --blkid_context=u:r:blkid:s0 --blkid_untrusted_context=u:r:blkid_untrusted:s0 \
        --fsck_context=u:r:fsck:s0 --fsck_untrusted_context=u:r:fsck_untrusted:s0
    class core
    ioprio be 2
    writepid /dev/cpuset/foreground/tasks
    shutdown critical
    group root reserved_disk

```

## Storaged

storaged主要就是实现存储的一些统计信息，如每个UID的IO访问统计，主要就是定期访问/proc/uid_io/stats，给dumpsys提供存储相关的信息，是一个开机启动的服务

system/core/storaged/storaged.rc

```rc

service storaged /system/bin/storaged
    class main
    capabilities DAC_READ_SEARCH
    priority 10
    file /d/mmc0/mmc0:0001/ext_csd r
    writepid /dev/cpuset/system-background/tasks
    user root
    group package_info

```

## 内部存储卡的挂载流程

Android启动后会默认首先挂载内卡，从开机动画结束开始，进行内卡的挂载操作，主要涉及ActivityManagerService，VOLD，StorageManagerService等模块。

![storage_manager](/images/fuse/storage_manager.webp)

## dumpsys mount

设置分区存储白名单

```txt

adb shell device_config  put storage_native_boot forced_scoped_storage_whitelist com.ctq.simkey.sdk.appa

adb shell device_config  get storage_native_boot forced_scoped_storage_whitelist

```

adb shell dumpsys mount

```txt

Disks:
  DiskInfo{disk:179,0}:
    flags=SD size=5699010560 label= 
    sysPath=/sys//devices/platform/fe2b0000.dwmmc/mmc_host/mmc0/mmc0:0001/block/mmcblk0 

Volumes:
  VolumeInfo{public:179,1}:
    type=PUBLIC diskId=disk:179,0 partGuid= mountFlags=VISIBLE mountUserId=0 state=MOUNTED 
    fsType=vfat fsUuid=4552-4F43 fsLabel= 
    path=/storage/4552-4F43 internalPath=/mnt/media_rw/4552-4F43 
  VolumeInfo{emulated;0}:
    type=EMULATED diskId=null partGuid= mountFlags=PRIMARY|VISIBLE mountUserId=0 state=MOUNTED 
    fsType=null fsUuid=null fsLabel=null 
    path=/storage/emulated internalPath=/data/media 

Records:
  VolumeRecord:
    type=PUBLIC fsUuid=4552-4F43 partGuid= 
    nickname=null userFlags=0 
    createdMillis=2025-01-21 09:27:06 lastSeenMillis=2025-01-22 01:56:06 lastTrimMillis=unknown lastBenchMillis=unknown 

Primary storage UUID: null

Internal storage (null) total size: 16000000000 (16777216000000000 MiB)

Local unlocked users: [0]
System unlocked users: [0]

Isolated storage, local feature flag: 0
Isolated storage, remote feature flag: 0
Isolated storage, resolved: true
Forced scoped storage app list: com.ctq.simkey.sdk.appa
isAutomotive:false

mObbMounts:

mObbPathToStateMap:

Last maintenance: 2025-01-21 09:26:5

```

## 外部存储卡的挂载过程

### MediaProvider

```txt

u0_a49         1281    274 13985964 155456 0                  0 S com.android.providers.media.module

```

**TF卡拔出日志**

```txt

2025-01-22 14:01:22.899  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:01:22.899  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state ejecting
2025-01-22 14:01:22.900  1265-1415  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary}
2025-01-22 14:01:22.919  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:01:22.919  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state ejecting
2025-01-22 14:01:22.920  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary}
2025-01-22 14:01:22.939  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:01:22.939  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state ejecting
2025-01-22 14:01:22.939  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary}
2025-01-22 14:01:23.394  1265-1563  FuseDaemon              com.android.providers.media.module   I  Ending fuse...
2025-01-22 14:01:23.394  1265-1563  FuseDaemon              com.android.providers.media.module   I  DESTROY /storage/4552-4F43
2025-01-22 14:01:23.394  1265-1563  FuseDaemon              com.android.providers.media.module   I  Ended fuse
2025-01-22 14:01:23.395  1265-1563  FuseDaemonThread        com.android.providers.media.module   I  Exiting thread for public:179,1 ...
2025-01-22 14:01:23.395  1265-1563  ExternalSt...erviceImpl com.android.providers.media.module   I  Exiting session for id: public:179,1
2025-01-22 14:01:23.395  1265-1563  FuseDaemonThread        com.android.providers.media.module   I  Exited thread for public:179,1
2025-01-22 14:01:23.426  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:01:23.426  1265-1415  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary}

```

**TF卡插入日志**

```txt

2025-01-22 14:04:26.519  1265-1415  ExternalSt...erviceImpl com.android.providers.media.module   I  Starting session for id: public:179,1
2025-01-22 14:04:26.520  1265-1415  FuseDaemonThread        com.android.providers.media.module   V  Waiting 1000ms for FUSE start. Count 4
2025-01-22 14:04:26.521  1265-2190  FuseDaemonThread        com.android.providers.media.module   I  Starting thread for public:179,1 ...
2025-01-22 14:04:26.522  1265-2190  FuseDaemon              com.android.providers.media.module   I  Starting fuse...
2025-01-22 14:04:27.600  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.600  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.600  1265-1415  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.630  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.630  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.630  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.645  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.645  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.645  1265-1415  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.679  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.679  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.679  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.695  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.695  1265-1415  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.695  1265-1415  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.704  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.705  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.705  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.723  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.723  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.723  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.747  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume emulated;0 with name external_primary and state mounted
2025-01-22 14:04:27.747  1265-1265  MediaStore              com.android.providers.media.module   V  Examining volume public:179,1 with name 4552-4f43 and state mounted
2025-01-22 14:04:27.748  1265-1265  MediaProvider           com.android.providers.media.module   V  Updated external volumes to: {external_primary, 4552-4f43}
2025-01-22 14:04:27.793  1265-1988  MediaProvider           com.android.providers.media.module   I  Begin Intent { act=android.intent.action.MEDIA_MOUNTED dat=file:///storage/4552-4F43 flg=0x5000010 cmp=com.android.providers.media.module/com.android.providers.media.MediaService (has extras) }
2025-01-22 14:04:27.813  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned internal due to REASON_MOUNTED, found 2 items in 11ms, 0 inserts 0 updates 0 deletes
2025-01-22 14:04:27.817  1265-1988  ModernMediaScanner      com.android.providers.media.module   W  Failed to visit /oem/media: java.nio.file.NoSuchFileException: /oem/media
2025-01-22 14:04:27.820  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned internal due to REASON_MOUNTED, found 0 items in 4ms, 0 inserts 0 updates 0 deletes
2025-01-22 14:04:28.435  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned internal due to REASON_MOUNTED, found 230 items in 611ms, 0 inserts 7 updates 0 deletes
2025-01-22 14:04:28.616  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned 4552-4f43 due to REASON_MOUNTED, found 25 items in 163ms, 0 inserts 0 updates 0 deletes
2025-01-22 14:04:28.621  1265-1988  MediaProvider           com.android.providers.media.module   I  End Intent { act=android.intent.action.MEDIA_MOUNTED dat=file:///storage/4552-4F43 flg=0x5000010 cmp=com.android.providers.media.module/com.android.providers.media.MediaService (has extras) }
2025-01-22 14:04:28.622  1265-1988  MediaProvider           com.android.providers.media.module   I  Begin Intent { act=android.intent.action.MEDIA_MOUNTED dat=file:///storage/4552-4F43 flg=0x5000010 cmp=com.android.providers.media.module/com.android.providers.media.MediaService (has extras) }
2025-01-22 14:04:28.640  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned internal due to REASON_MOUNTED, found 2 items in 10ms, 0 inserts 0 updates 0 deletes
2025-01-22 14:04:28.645  1265-1988  ModernMediaScanner      com.android.providers.media.module   W  Failed to visit /oem/media: java.nio.file.NoSuchFileException: /oem/media
2025-01-22 14:04:28.649  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned internal due to REASON_MOUNTED, found 0 items in 5ms, 0 inserts 0 updates 0 deletes
2025-01-22 14:04:29.190  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned internal due to REASON_MOUNTED, found 230 items in 537ms, 0 inserts 7 updates 0 deletes
2025-01-22 14:04:29.270  1265-1988  MediaProvider           com.android.providers.media.module   I  Scanned 4552-4f43 due to REASON_MOUNTED, found 25 items in 67ms, 0 inserts 0 updates 0 deletes
2025-01-22 14:04:29.274  1265-1988  MediaProvider           com.android.providers.media.module   I  End Intent { act=android.intent.action.MEDIA_MOUNTED dat=file:///storage/4552-4F43 flg=0x5000010 cmp=com.android.providers.media.module/com.android.providers.media.MediaService (has extras) }

```

### system_process

**TF 卡插入日志**

```txt

2025-01-22 14:09:49.603   494-2129  StorageManagerService   system_process                       D  -----for all public volume is visible-----
2025-01-22 14:09:49.604   494-576   StorageManagerService   system_process                       I  Mounting volume VolumeInfo{public:179,1}:
                                                                                                        type=PUBLIC diskId=disk:179,0 partGuid= mountFlags=VISIBLE mountUserId=0 
                                                                                                        state=UNMOUNTED 
                                                                                                        fsType=null fsUuid=null fsLabel=null 
                                                                                                        path=null internalPath=null 
2025-01-22 14:09:50.227   494-576   StorageSes...Controller system_process                       I  On volume mount VolumeInfo{public:179,1}:
                                                                                                        type=PUBLIC diskId=disk:179,0 partGuid= mountFlags=VISIBLE mountUserId=0 
                                                                                                        state=CHECKING 
                                                                                                        fsType=vfat fsUuid=4552-4F43 fsLabel= 
                                                                                                        path=/storage/4552-4F43 internalPath=/mnt/media_rw/4552-4F43 
2025-01-22 14:09:50.228   494-576   StorageSes...Controller system_process                       I  Creating and starting session with id: public:179,1
2025-01-22 14:09:51.278   494-576   StorageManagerService   system_process                       I  Mounted volume VolumeInfo{public:179,1}:
                                                                                                        type=PUBLIC diskId=disk:179,0 partGuid= mountFlags=VISIBLE mountUserId=0 
                                                                                                        state=MOUNTED 
                                                                                                        fsType=vfat fsUuid=4552-4F43 fsLabel= 
                                                                                                        path=/storage/4552-4F43 internalPath=/mnt/media_rw/4552-4F43 
2025-01-22 14:09:51.294   494-576   StorageSes...Controller system_process                       I  Notifying volume state changed for session with id: public:179,1
2025-01-22 14:09:51.403   494-576   StorageSes...Controller system_process                       I  Notifying volume state changed for session with id: public:179,1
2025-01-22 14:09:51.447   494-576   StorageManagerService   system_process                       D  Volume public:179,1 broadcasting mounted to UserHandle{0}
2025-01-22 14:09:51.451   494-576   StorageManagerService   system_process                       D  Volume public:179,1 broadcasting mounted to UserHandle{0}

```

**TF卡拔出日志**

```txt

2025-01-22 14:13:26.174   494-576   StorageSes...Controller system_process                       I  Notifying volume state changed for session with id: public:179,1
2025-01-22 14:13:26.210   494-576   StorageManagerService   system_process                       D  Volume public:179,1 broadcasting ejecting to UserHandle{0}
2025-01-22 14:13:26.720   494-576   StorageSes...Controller system_process                       I  Notifying volume state changed for session with id: public:179,1
2025-01-22 14:13:26.721   494-864   StorageSes...Controller system_process                       I  On volume remove VolumeInfo{public:179,1}:
                                                                                                        type=PUBLIC diskId=disk:179,0 partGuid= mountFlags=VISIBLE mountUserId=0 
                                                                                                        state=BAD_REMOVAL 
                                                                                                        fsType=vfat fsUuid=4552-4F43 fsLabel= 
                                                                                                        path=/storage/4552-4F43 internalPath=/mnt/media_rw/4552-4F43 
2025-01-22 14:13:26.730   494-864   StorageSes...Controller system_process                       I  Removed session for vol with id: public:179,1
2025-01-22 14:13:26.745   494-576   StorageSes...Controller system_process                       I  Notifying volume state changed for session with id: public:179,1
2025-01-22 14:13:26.746   494-576   StorageUserConnection   system_process                       I  No session found for sessionId: public:179,1
2025-01-22 14:13:26.748   494-576   StorageManagerService   system_process                       D  Volume public:179,1 broadcasting bad_removal to UserHandle{0}

```

### vold

**TF卡插入日志**

```txt

01-22 14:16:17.329   170   186 D vold    : /system/bin/sgdisk
01-22 14:16:17.329   170   186 D vold    :     --android-dump
01-22 14:16:17.329   170   186 D vold    :     /dev/block/vold/disk:179,0
01-22 14:16:17.357   170   186 D vold    : DISK mbr
01-22 14:16:17.357   170   186 D vold    : PART 1 b
01-22 14:16:17.363   170  1260 D vold    : /system/bin/blkid
01-22 14:16:17.363   170  1260 D vold    :     -c
01-22 14:16:17.363   170  1260 D vold    :     /dev/null
01-22 14:16:17.363   170  1260 D vold    :     -s
01-22 14:16:17.363   170  1260 D vold    :     TYPE
01-22 14:16:17.364   170  1260 D vold    :     -s
01-22 14:16:17.364   170  1260 D vold    :     UUID
01-22 14:16:17.364   170  1260 D vold    :     -s
01-22 14:16:17.364   170  1260 D vold    :     LABEL
01-22 14:16:17.364   170  1260 D vold    :     /dev/block/vold/public:179,1
01-22 14:16:17.661   170  1260 D vold    : /dev/block/vold/public:179,1: UUID="4552-4F43" TYPE="vfat" 
01-22 14:16:17.665   170  1260 D vold    : /system/bin/fsck_msdos
01-22 14:16:17.665   170  1260 D vold    :     -p
01-22 14:16:17.665   170  1260 D vold    :     -f
01-22 14:16:17.665   170  1260 D vold    :     -y
01-22 14:16:17.665   170  1260 D vold    :     /dev/block/vold/public:179,1
01-22 14:16:17.950   170  1260 D vold    : /dev/block/vold/public:179,1: 71 files, 5554432 KiB free (173576 clusters)
01-22 14:16:17.954   170  1260 I vold    : Filesystem check completed OK
01-22 14:16:17.972   170  1260 I vold    : Mounting public fuse volume
01-22 14:16:17.980   170  1260 I vold    : Bind mounting /mnt/media_rw/4552-4F43 to /mnt/pass_through/0/4552-4F43
01-22 14:16:19.029   170  1260 I vold    : Configuring read_ahead of /mnt/user/0/4552-4F43 fuse filesystem to 256kb
01-22 14:16:19.031   170  1260 I vold    : Writing 256 to /sys/class/bdi/0:65/read_ahead_kb
01-22 14:16:19.031   170  1260 I vold    : Configuring max_ratio of /mnt/user/0/4552-4F43 fuse filesystem to 40
01-22 14:16:19.032   170  1260 I vold    : Writing 40 to /sys/class/bdi/0:65/max_ratio


```

**TF卡拔出日志**

```txt

01-22 14:18:01.848   170   186 I vold    : Unmounting pass_through_path /mnt/pass_through/0/4552-4F43
01-22 14:18:01.866   170   186 I vold    : Unmounting fuse path /mnt/user/0/4552-4F43

```

**内核日志**

```txt

// TF卡插入
[ 1000.053504] mmc_host mmc0: Bus speed (slot 0) = 375000Hz (slot req 400000Hz, actual 375000HZ div = 0)
[ 1000.366490] mmc_host mmc0: Bus speed (slot 0) = 50000000Hz (slot req 50000000Hz, actual 50000000HZ div = 0)
[ 1000.366720] mmc0: new high speed SDHC card at address 0001
[ 1000.372287] mmcblk0: mmc0:0001  5.31 GiB 
[ 1000.375717] mmcblk0: p1

// TF卡拔出
[ 1001.015799] FAT-fs (mmcblk0p1): Volume was not properly unmounted. Some data may be corrupt. Please run fsck.
[ 1104.367364] mmc0: card 0001 removed

```

## 电信量子加密TF卡SDK初始化失败问题

问题原因：android 11 强制分区存储和fuse文件系统cache模式导致

修改方案：APP 申请系统权限android.permission.MANAGE_EXTERNAL_STORAGE 和  android.permission.WRITE_MEDIA_STORAGE, fuse 文件系统修改为direct_io模式

## fuse 文件系统direct_io 和 keep_cache模式对比

| 特性                  | `direct_io`                                        | `keep_cache`                                    |
|-----------------------|----------------------------------------------------|------------------------------------------------|
| **缓存使用**          | 不使用内核缓存，直接访问底层存储                    | 使用内核缓存进行读写操作                       |
| **数据一致性**        | 数据一致性强，实时反映底层存储的更改                | 数据一致性较弱，可能存在缓存与底层数据不同步问题 |
| **性能**              | 较低（直接与存储设备交互）                         | 较高（减少底层存储访问）                       |
| **适用场景**          | 实时数据访问，高一致性需求                         | 高性能需求，低一致性要求                       |
| **内存使用**          | 内存占用较低（无缓存）                              | 内存占用较高（依赖缓存）                       |
| **底层存储压力**      | 压力较大（每次操作直接访问存储设备）                 | 压力较小（大部分操作通过缓存完成）             |
| **文件访问方式**      | 强制直接访问存储，跳过文件缓存                      | 使用文件缓存，读写更高效                       |
| **典型场景**          | 数据库、日志文件、实时写入场景                      | 媒体播放、静态文件访问、频繁读写的小文件       |












