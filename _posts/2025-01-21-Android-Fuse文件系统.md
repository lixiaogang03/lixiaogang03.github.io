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























