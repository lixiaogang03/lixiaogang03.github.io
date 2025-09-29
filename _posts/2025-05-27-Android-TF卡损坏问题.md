---
layout:     post
title:      Android TF卡损坏问题
subtitle:   A133
date:       2025-05-27
author:     LXG
header-img: img/post-bg-phone.jpg
catalog: true
tags:
    - android
---

## 整体工作流程

```arduino

┌──────────────────────────────┐
│ 1. TF卡插入/拔出/异常事件     │
└────────────┬─────────────────┘
             │ 内核检测 TF 卡事件
             ▼
┌──────────────────────────────┐
│ 2. 内核发送 uevent 到用户空间 │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 3. vold 接收并解析 uevent    │
│    - 创建 VolumeInfo         │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 4. vold 尝试挂载 TF 卡       │
│    - 检测分区、文件系统等    │
└────────────┬─────────────────┘
      ┌──────┴──────┐
      ▼             ▼
┌─────────────┐   ┌──────────────────────────────┐
│ 挂载成功    │   │ 挂载失败（文件系统损坏等）   │
└────┬────────┘   └────────────┬─────────────────┘
     │                         ▼
     │               ┌──────────────────────────────┐
     │               │ 5. 设置状态为 STATE_UNMOUNTABLE │
     │               └────────────┬─────────────────┘
     │                         ▼
     │               ┌──────────────────────────────┐
     │               │ 6. vold 通知 StorageManager   │
     │               │    via Binder 调用            │
     │               └────────────┬─────────────────┘
     │                         ▼
     │               ┌──────────────────────────────┐
     │               │ 7. Framework 更新 UI 状态      │
     │               │    弹出“SD 卡已损坏”提示       │
     │               └────────────┬─────────────────┘
     │                         ▼
     │               ┌──────────────────────────────┐
     │               │ 8. 用户选择格式化或移除 TF 卡  │
     │               └──────────────────────────────┘
     ▼
┌──────────────────────────────┐
│ 正常使用 TF 卡               │
└──────────────────────────────┘

```

## 源码

**frameworks/base/core/java/android/os/storage/VolumeInfo.java**

```java

public class VolumeInfo implements Parcelable {


    public static final int STATE_UNMOUNTED = IVold.VOLUME_STATE_UNMOUNTED;
    public static final int STATE_CHECKING = IVold.VOLUME_STATE_CHECKING;
    public static final int STATE_MOUNTED = IVold.VOLUME_STATE_MOUNTED;
    public static final int STATE_MOUNTED_READ_ONLY = IVold.VOLUME_STATE_MOUNTED_READ_ONLY;
    public static final int STATE_FORMATTING = IVold.VOLUME_STATE_FORMATTING;
    public static final int STATE_EJECTING = IVold.VOLUME_STATE_EJECTING;
    public static final int STATE_UNMOUNTABLE = IVold.VOLUME_STATE_UNMOUNTABLE;
    public static final int STATE_REMOVED = IVold.VOLUME_STATE_REMOVED;
    public static final int STATE_BAD_REMOVAL = IVold.VOLUME_STATE_BAD_REMOVAL;

    static {
        // 存储未挂载，通常表示设备已插入但尚未挂载
        sStateToDescrip.put(VolumeInfo.STATE_UNMOUNTED, R.string.ext_media_status_unmounted);
        // 正在检查存储设备的文件系统完整性
        sStateToDescrip.put(VolumeInfo.STATE_CHECKING, R.string.ext_media_status_checking);
        // 存储已挂载且可读写
        sStateToDescrip.put(VolumeInfo.STATE_MOUNTED, R.string.ext_media_status_mounted);
        // 存储已挂载，但只能读取（只读模式）
        sStateToDescrip.put(VolumeInfo.STATE_MOUNTED_READ_ONLY, R.string.ext_media_status_mounted_ro);
        // 正在格式化存储设备
        sStateToDescrip.put(VolumeInfo.STATE_FORMATTING, R.string.ext_media_status_formatting);
        // 正在弹出存储设备，准备移除
        sStateToDescrip.put(VolumeInfo.STATE_EJECTING, R.string.ext_media_status_ejecting);
        // 存储设备无法挂载，可能因文件系统损坏或不支持
        sStateToDescrip.put(VolumeInfo.STATE_UNMOUNTABLE, R.string.ext_media_status_unmountable);
        // 存储设备已被物理移除
        sStateToDescrip.put(VolumeInfo.STATE_REMOVED, R.string.ext_media_status_removed);
        // 存储设备被非正常移除（未卸载就拔出）
        sStateToDescrip.put(VolumeInfo.STATE_BAD_REMOVAL, R.string.ext_media_status_bad_removal);
    }

}

```

**frameworks/base/services/core/java/com/android/server/StorageManagerService.java**

```java

class StorageManagerService extends IStorageManager.Stub
        implements Watchdog.Monitor, ScreenObserver {

    private final IVoldListener mListener = new IVoldListener.Stub() {

        @Override
        public void onVolumeStateChanged(String volId, int state) {
            synchronized (mLock) {
                final VolumeInfo vol = mVolumes.get(volId);
                if (vol != null) {
                    final int oldState = vol.state;
                    final int newState = state;
                    vol.state = newState;
                    onVolumeStateChangedLocked(vol, oldState, newState);
                }
            }
        }

    }

    @GuardedBy("mLock")
    private void onVolumeStateChangedLocked(VolumeInfo vol, int oldState, int newState) {

        mCallbacks.notifyVolumeStateChanged(vol, oldState, newState);

        // Do not broadcast before boot has completed to avoid launching the
        // processes that receive the intent unnecessarily.
        if (mBootCompleted && isBroadcastWorthy(vol)) {
            final Intent intent = new Intent(VolumeInfo.ACTION_VOLUME_STATE_CHANGED);
            intent.putExtra(VolumeInfo.EXTRA_VOLUME_ID, vol.id);
            intent.putExtra(VolumeInfo.EXTRA_VOLUME_STATE, newState);
            intent.putExtra(VolumeRecord.EXTRA_FS_UUID, vol.fsUuid);
            intent.addFlags(Intent.FLAG_RECEIVER_REGISTERED_ONLY_BEFORE_BOOT
                    | Intent.FLAG_RECEIVER_INCLUDE_BACKGROUND);
            mHandler.obtainMessage(H_INTERNAL_BROADCAST, intent).sendToTarget();
        }

    }
    
    private boolean isBroadcastWorthy(VolumeInfo vol) {
        switch (vol.getType()) {
            case VolumeInfo.TYPE_PRIVATE:
            case VolumeInfo.TYPE_PUBLIC:
            case VolumeInfo.TYPE_EMULATED:
            case VolumeInfo.TYPE_STUB:
                break;
            default:
                return false;
        }

        switch (vol.getState()) {
            case VolumeInfo.STATE_MOUNTED:
            case VolumeInfo.STATE_MOUNTED_READ_ONLY:
            case VolumeInfo.STATE_EJECTING:
            case VolumeInfo.STATE_UNMOUNTED:
            case VolumeInfo.STATE_UNMOUNTABLE:  // 此状态时会提示SD卡损坏
            case VolumeInfo.STATE_BAD_REMOVAL:
                break;
            default:
                return false;
        }

        return true;
    }

}

```

**./system/vold/binder/android/os/IVold.aidl**

```java

interface IVold {

    const int VOLUME_STATE_UNMOUNTED = 0;
    const int VOLUME_STATE_CHECKING = 1;
    const int VOLUME_STATE_MOUNTED = 2;
    const int VOLUME_STATE_MOUNTED_READ_ONLY = 3;
    const int VOLUME_STATE_FORMATTING = 4;
    const int VOLUME_STATE_EJECTING = 5;
    const int VOLUME_STATE_UNMOUNTABLE = 6;
    const int VOLUME_STATE_REMOVED = 7;
    const int VOLUME_STATE_BAD_REMOVAL = 8;

}

```

## 错误日志分析

```txt

05-26 16:02:06.430313  1806  1819 D vold    : exfatfsck 1.3.0
05-26 16:02:06.430427  1806  1819 D vold    : 
05-26 16:02:06.430460  1806  1819 D vold    : Checking file system on /dev/block/vold/public:179,65.
05-26 16:02:06.430473  1806  1819 D vold    : 
05-26 16:02:06.430495  1806  1819 D vold    : File system version           1.0
05-26 16:02:06.430506  1806  1819 D vold    : 
05-26 16:02:06.430526  1806  1819 D vold    : Sector size                 512 bytes
05-26 16:02:06.430538  1806  1819 D vold    : 
05-26 16:02:06.430557  1806  1819 D vold    : Cluster size                128 KB
05-26 16:02:06.430569  1806  1819 D vold    : 
05-26 16:02:06.430589  1806  1819 D vold    : Volume size                 116 GB
05-26 16:02:06.430601  1806  1819 D vold    : 
05-26 16:02:06.430620  1806  1819 D vold    : Used space                   85 GB
05-26 16:02:06.430632  1806  1819 D vold    : 
05-26 16:02:06.430651  1806  1819 D vold    : Available space              32 GB
05-26 16:02:06.430664  1806  1819 D vold    : 

# 这是 exfat 文件系统解析目录项时发生异常
05-26 16:02:06.430848  2771  2771 E exfat   : unexpected entry type 0x84 after 0x85 at 1/225
05-26 16:02:07.322705  2771  2771 E exfat   : unexpected entry type 0x45 after 0x85 at 1/51
05-26 16:02:08.399323  1806  1819 D vold    : Totally 63 directories and 26236 files.
05-26 16:02:08.399643  1806  1819 D vold    : 
05-26 16:02:08.399708  1806  1819 D vold    : File system checking finished. ERRORS FOUND: 2, FIXED: 0.
05-26 16:02:08.399725  1806  1819 D vold    : 
05-26 16:02:08.402308  1806  1819 E vold    : Process exited with code: 1
05-26 16:02:08.402392  1806  1819 E vold    : Check failed (code 1)
05-26 16:02:08.402426  1806  1819 E vold    : public:179,65 failed filesystem check

05-26 16:02:08.406522  2239  2331 E StorageManagerService: 
05-26 16:02:08.406522  2239  2331 E StorageManagerService: android.os.ServiceSpecificException:  (code -5)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.Parcel.createException(Parcel.java:2085)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.Parcel.readException(Parcel.java:2039)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.Parcel.readException(Parcel.java:1987)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.IVold$Stub$Proxy.mount(IVold.java:1565)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at com.android.server.StorageManagerService.mount(StorageManagerService.java:1810)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at com.android.server.StorageManagerService.access$1600(StorageManagerService.java:188)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at com.android.server.StorageManagerService$StorageManagerServiceHandler.handleMessage(StorageManagerService.java:650)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.Handler.dispatchMessage(Handler.java:107)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.Looper.loop(Looper.java:214)
05-26 16:02:08.406522  2239  2331 E StorageManagerService: 	at android.os.HandlerThread.run(HandlerThread.java:67)

05-26 16:02:16.583012  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:02:16.583012  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:02:16.583012  2375  2375 D StorageNotification:     state=UNMOUNTABLE 
05-26 16:02:16.583012  2375  2375 D StorageNotification:     fsType=exfat fsUuid=86BA-1239 fsLabel=android 
05-26 16:02:16.583012  2375  2375 D StorageNotification:     path=null internalPath=null 

05-26 16:08:31.504062[    1.522384] FAT-fs (mmcblk0p16): Volume was not properly unmounted. Some data may be corrupt. Please run fsck.

```

**日志分析**

```yaml

┌────────────────────────────────┐
│ 插入 TF 卡（含 exFAT/FAT 分区）│
└────────────┬───────────────────┘
             ▼
      [Kernel 检测到 uevent]
             ▼
      vold 接收设备节点
             ▼
      检测文件系统类型
             ▼
┌─────────────┬──────────────┐
│  执行 exfatfsck / fsck.vfat │
└─────────────┴──────────────┘
             ▼
       检查失败 → ERRORS FOUND: 2, FIXED: 0
             ▼
       vold 返回 code=1
             ▼
       StorageManager 接收失败状态（code -5）
             ▼
       标记状态为 STATE_UNMOUNTABLE
             ▼
       UI 提示用户“SD 卡已损坏”

```

state=UNMOUNTABLE 时会提示`已损坏`

## exfat 文件系统报错日志

**./vendor/aw/public/package/bin/fstools/exfat**

```bash

lxg@lxg:~/code/project/a133/haoqiang_BE/A133_android_10/android/vendor/aw/public/package/bin/fstools$ grep -ri "exfat_error(\"" .
./exfat/fuse/main.c:		exfat_error("'%s' is not a directory (%#hx)", path, parent->attrib);
./exfat/fuse/main.c:		exfat_error("failed to open directory '%s'", path);
./exfat/fuse/main.c:		exfat_error("failed to reallocate options string");
./exfat/fuse/main.c:		exfat_error("failed to allocate escaped string for %s", spec);
./exfat/fuse/main.c:		exfat_error("failed to determine username");
./exfat/fuse/main.c:		exfat_error("failed to allocate options string");
./exfat/mkfs/fat.c:		exfat_error("failed to write FAT entry 0x%x", value);
./exfat/mkfs/uct.c:		exfat_error("failed to write upcase table of %zu bytes",
./exfat/mkfs/main.c:			exfat_error("cluster size %"PRIu64" %s is too small for "
./exfat/mkfs/main.c:		exfat_error("failed to form volume id");
./exfat/mkfs/main.c:				exfat_error("invalid option value: '%s'", optarg);
./exfat/mkfs/cbm.c:		exfat_error("failed to allocate bitmap of %zu bytes",
./exfat/mkfs/cbm.c:		exfat_error("failed to write bitmap of %zu bytes",
./exfat/mkfs/vbr.c:		exfat_error("failed to allocate sector-sized block of memory");
./exfat/mkfs/vbr.c:		exfat_error("failed to write super block sector");
./exfat/mkfs/vbr.c:			exfat_error("failed to write a sector with boot signature");
./exfat/mkfs/vbr.c:			exfat_error("failed to write an empty sector");
./exfat/mkfs/vbr.c:		exfat_error("failed to write checksum sector");
./exfat/mkfs/mkexfat.c:		exfat_error("too small device (%"PRIu64" %s)", vhb.value, vhb.unit);
./exfat/mkfs/mkexfat.c:		exfat_error("seek to 0x%"PRIx64" failed", start);
./exfat/mkfs/mkexfat.c:			exfat_error("failed to erase block %"PRIu64"/%"PRIu64
./exfat/mkfs/mkexfat.c:		exfat_error("failed to allocate erase block");
./exfat/mkfs/mkexfat.c:			exfat_error("seek to 0x%"PRIx64" failed", position);
./exfat/libexfat/repair.c:		exfat_error("failed to write correct VBR checksum");
./exfat/libexfat/node.c:	exfat_error("read %zd bytes instead of %zu bytes", size,
./exfat/libexfat/node.c:	exfat_error("wrote %zd bytes instead of %zu bytes", size,
./exfat/libexfat/node.c:		exfat_error("failed to allocate node");
./exfat/libexfat/node.c:			exfat_error("unexpected entry type %#x after %#x at %d/%d",
./exfat/libexfat/node.c:		exfat_error("'%s' has invalid checksum (%#hx != %#hx)", buffer,
./exfat/libexfat/node.c:		exfat_error("'%s' has valid size (%"PRIu64") greater than size "
./exfat/libexfat/node.c:		exfat_error("'%s' is empty but start cluster is %#x", buffer,
./exfat/libexfat/node.c:		exfat_error("'%s' points to invalid cluster %#x", buffer,
./exfat/libexfat/node.c:		exfat_error("'%s' is larger than clusters heap: %"PRIu64" > %"PRIu64,
./exfat/libexfat/node.c:		exfat_error("'%s' is empty but marked as contiguous (%#hx)", buffer,
./exfat/libexfat/node.c:		exfat_error("'%s' directory size %"PRIu64" is not divisible by %d", buffer,
./exfat/libexfat/node.c:		exfat_error("too few continuations (%hhu)", meta1->continuations);
./exfat/libexfat/node.c:		exfat_error("unknown flags in meta2 (%#hhx)", meta2->flags);
./exfat/libexfat/node.c:		exfat_error("too few continuations (%hhu < %d)",
./exfat/libexfat/node.c:				exfat_error("invalid cluster 0x%x in upcase table",
./exfat/libexfat/node.c:				exfat_error("bad upcase table size (%"PRIu64" bytes)",
./exfat/libexfat/node.c:				exfat_error("failed to allocate upcase table (%"PRIu64" bytes)",
./exfat/libexfat/node.c:				exfat_error("failed to read upper case table "
./exfat/libexfat/node.c:				exfat_error("failed to allocate decompressed upcase table");
./exfat/libexfat/node.c:				exfat_error("invalid cluster 0x%x in clusters bitmap",
./exfat/libexfat/node.c:				exfat_error("invalid clusters bitmap size: %"PRIu64
./exfat/libexfat/node.c:				exfat_error("failed to allocate clusters bitmap chunk "
./exfat/libexfat/node.c:				exfat_error("failed to read clusters bitmap "
./exfat/libexfat/node.c:				exfat_error("too long label (%hhu chars)", label->length);
./exfat/libexfat/node.c:			exfat_error("unknown entry type %#hhx", entry.type);
./exfat/libexfat/node.c:		exfat_error("failed to allocate directory bitmap (%"PRIu64")",
./exfat/libexfat/utf.c:			exfat_error("illegal UTF-16 sequence");
./exfat/libexfat/utf.c:			exfat_error("name is too long");
./exfat/libexfat/utf.c:		exfat_error("name is too long");
./exfat/libexfat/utf.c:			exfat_error("illegal UTF-8 sequence");
./exfat/libexfat/utf.c:			exfat_error("name is too long");
./exfat/libexfat/utf.c:		exfat_error("name is too long");
./exfat/libexfat/mount.c:			exfat_error("root directory cannot occupy all %d clusters",
./exfat/libexfat/mount.c:			exfat_error("bad cluster %#x while reading root directory",
./exfat/libexfat/mount.c:		exfat_error("failed to read boot sector");
./exfat/libexfat/mount.c:			exfat_error("failed to read VBR sector");
./exfat/libexfat/mount.c:		exfat_error("failed to read VBR checksum sector");
./exfat/libexfat/mount.c:			exfat_error("invalid VBR checksum 0x%x (expected 0x%x)",
./exfat/libexfat/mount.c:		exfat_error("failed to write super block");
./exfat/libexfat/mount.c:		exfat_error("failed to allocate memory for the super block");
./exfat/libexfat/mount.c:		exfat_error("failed to read boot sector");
./exfat/libexfat/mount.c:		exfat_error("exFAT file system is not found");
./exfat/libexfat/mount.c:		exfat_error("too small sector size: 2^%hhd", ef->sb->sector_bits);
./exfat/libexfat/mount.c:		exfat_error("too big cluster size: 2^(%hhd+%hhd)",
./exfat/libexfat/mount.c:		exfat_error("failed to allocate zero sector");
./exfat/libexfat/mount.c:		exfat_error("unsupported exFAT version: %hhu.%hhu",
./exfat/libexfat/mount.c:		exfat_error("unsupported FAT count: %hhu", ef->sb->fat_count);
./exfat/libexfat/mount.c:		exfat_error("file system in clusters is larger than device: "
./exfat/libexfat/mount.c:		exfat_error("failed to allocate root node");
./exfat/libexfat/mount.c:		exfat_error("upcase table is not found");
./exfat/libexfat/mount.c:		exfat_error("clusters bitmap is not found");
./exfat/libexfat/time.c:		exfat_error("bad date %u-%02hu-%02hu",
./exfat/libexfat/time.c:		exfat_error("bad time %hu:%02hu:%02u",
./exfat/libexfat/time.c:		exfat_error("bad centiseconds count %hhu", centisec);
./exfat/libexfat/io.c:			exfat_error("failed to open /dev/null");
./exfat/libexfat/io.c:		exfat_error("failed to allocate memory for device structure");
./exfat/libexfat/io.c:			exfat_error("failed to open '%s' in read-only mode: %s", spec,
./exfat/libexfat/io.c:			exfat_error("failed to open '%s' in read-write mode: %s", spec,
./exfat/libexfat/io.c:		exfat_error("failed to open '%s': %s", spec, strerror(errno));
./exfat/libexfat/io.c:		exfat_error("failed to fstat '%s'", spec);
./exfat/libexfat/io.c:		exfat_error("'%s' is neither a device, nor a regular file", spec);
./exfat/libexfat/io.c:			exfat_error("failed to get block size");
./exfat/libexfat/io.c:			exfat_error("failed to get blocks count");
./exfat/libexfat/io.c:			exfat_error("failed to get disklabel");
./exfat/libexfat/io.c:			exfat_error("failed to get size of '%s'", spec);
./exfat/libexfat/io.c:			exfat_error("failed to seek to the beginning of '%s'", spec);
./exfat/libexfat/io.c:		exfat_error("failed to initialize ublio");
./exfat/libexfat/io.c:		exfat_error("failed to close ublio");
./exfat/libexfat/io.c:		exfat_error("failed to close device: %s", strerror(errno));
./exfat/libexfat/io.c:		exfat_error("ublio fsync failed");
./exfat/libexfat/io.c:		exfat_error("fsync failed: %s", strerror(errno));
./exfat/libexfat/io.c:		exfat_error("invalid cluster 0x%x while reading", cluster);
./exfat/libexfat/io.c:			exfat_error("invalid cluster 0x%x while reading", cluster);
./exfat/libexfat/io.c:			exfat_error("failed to read cluster %#x", cluster);
./exfat/libexfat/io.c:		exfat_error("invalid cluster 0x%x while writing", cluster);
./exfat/libexfat/io.c:			exfat_error("invalid cluster 0x%x while writing", cluster);
./exfat/libexfat/io.c:			exfat_error("failed to write cluster %#x", cluster);
./exfat/libexfat/cluster.c:			exfat_error("failed to write clusters bitmap");
./exfat/libexfat/cluster.c:		exfat_error("failed to write the next cluster %#x after %#x", next,
./exfat/libexfat/cluster.c:		exfat_error("no free space left");
./exfat/libexfat/cluster.c:			exfat_error("invalid cluster 0x%x while growing", previous);
./exfat/libexfat/cluster.c:			exfat_error("invalid cluster 0x%x while shrinking", last);
./exfat/libexfat/cluster.c:			exfat_error("invalid cluster 0x%x while freeing after shrink",
./exfat/libexfat/cluster.c:		exfat_error("failed to erase %zu bytes at %"PRId64, size, offset);
./exfat/libexfat/cluster.c:		exfat_error("invalid cluster 0x%x while erasing", cluster);
./exfat/fsck/main.c:			exfat_error("file '%s' has invalid cluster 0x%x", name, c);
./exfat/fsck/main.c:			exfat_error("cluster 0x%x of file '%s' is not allocated", c, name);
./exfat/fsck/main.c:		exfat_error("out of memory");
./exfat/dump/main.c:		exfat_error("failed to read from '%s'", spec);
./exfat/dump/main.c:		exfat_error("exFAT file system is not found on '%s'", spec);
./exfat/dump/main.c:		exfat_error("'%s': %s", path, strerror(-rc));
./exfat/dump/main.c:			exfat_error("'%s' has invalid cluster %#x", path, cluster);

```

## 格式化日志

```txt

05-26 16:11:19.885454  2239  2660 V KioskMode: Resuming ActivityRecord{2d34d58 u0 com.android.settings/.deviceinfo.StorageWizardFormatProgress t549}

05-26 16:11:20.016075  1806  1819 D vold    : /system/bin/sgdisk
05-26 16:11:20.016240  1806  1819 D vold    :     --zap-all
05-26 16:11:20.016270  1806  1819 D vold    :     /dev/block/vold/disk:179,64
05-26 16:11:20.017775  2239  2331 D StorageManagerService: Volume public:179,65 broadcasting removed to UserHandle{0}
--------- switch to main
05-26 16:11:20.029110  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:11:20.029110  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:11:20.029110  2375  2375 D StorageNotification:     state=REMOVED 
05-26 16:11:20.029110  2375  2375 D StorageNotification:     fsType=exfat fsUuid=86BA-1239 fsLabel=android 
05-26 16:11:20.029110  2375  2375 D StorageNotification:     path=null internalPath=null 
05-26 16:11:21.147359  1806  1819 D vold    : 
05-26 16:11:21.147487  1806  1819 D vold    : 
05-26 16:11:21.147550  1806  1819 D vold    : ***************************************************************
05-26 16:11:21.147570  1806  1819 D vold    : 
05-26 16:11:21.147603  1806  1819 D vold    : Found invalid GPT and valid MBR; converting MBR to GPT format
05-26 16:11:21.147622  1806  1819 D vold    : 
05-26 16:11:21.147651  1806  1819 D vold    : in memory. 
05-26 16:11:21.147669  1806  1819 D vold    : 
05-26 16:11:21.147706  1806  1819 D vold    : ***************************************************************
05-26 16:11:21.147725  1806  1819 D vold    : 
05-26 16:11:21.147768  1806  1819 D vold    : 
05-26 16:11:21.147801  1806  1819 D vold    : GPT data structures destroyed! You may now partition the disk using fdisk or
05-26 16:11:21.147819  1806  1819 D vold    : 
05-26 16:11:21.147846  1806  1819 D vold    : other utilities.
05-26 16:11:21.147864  1806  1819 D vold    : 
05-26 16:11:21.148873  1806  1819 D vold    : /system/bin/sgdisk
05-26 16:11:21.148932  1806  1819 D vold    :     --new=0:0:-0
05-26 16:11:21.148961  1806  1819 D vold    :     --typecode=0:0c00
05-26 16:11:21.148989  1806  1819 D vold    :     --gpttombr=1
05-26 16:11:21.149016  1806  1819 D vold    :     /dev/block/vold/disk:179,64
05-26 16:11:22.198774  1806  1819 D vold    : Creating new GPT entries.
05-26 16:11:22.198849  1806  1819 D vold    : 
05-26 16:11:22.198899  1806  1819 D vold    : GPT data structures destroyed! You may now partition the disk using fdisk or
05-26 16:11:22.198916  1806  1819 D vold    : 
05-26 16:11:22.198944  1806  1819 D vold    : other utilities.
05-26 16:11:22.198961  1806  1819 D vold    : 
05-26 16:11:22.200371  1806  1818 D vold    : Disk at 179:64 changed
05-26 16:11:22.201923  1806  1818 D vold    : /system/bin/sgdisk
05-26 16:11:22.201997  1806  1818 D vold    :     --android-dump
05-26 16:11:22.202018  1806  1818 D vold    :     /dev/block/vold/disk:179,64
05-26 16:11:22.221743  1806  1818 D vold    : DISK mbr
05-26 16:11:22.221821  1806  1818 D vold    : 
05-26 16:11:22.221855  1806  1818 D vold    : PART 1 c
05-26 16:11:22.221870  1806  1818 D vold    : 
05-26 16:11:22.222893  1806  1818 D vold    : Device just partitioned; silently formatting
05-26 16:11:22.225588  1806  1818 I vold    : About to discard 125084089856 on /dev/block/vold/public:179,65
05-26 16:11:22.225696  1806  1818 E vold    : Discard failure on /dev/block/vold/public:179,65: Operation not supported on transport endpoint
05-26 16:11:22.225730  1806  1818 W vold    : public:179,65 failed to wipe
05-26 16:11:22.225835  1806  1818 D vold    : /system/bin/mkfs.exfat
05-26 16:11:22.225867  1806  1818 D vold    :     -n
05-26 16:11:22.225885  1806  1818 D vold    :     android
05-26 16:11:22.225905  1806  1818 D vold    :     /dev/block/vold/public:179,65
05-26 16:11:22.241836  1806  1818 D vold    : mkexfatfs 1.3.0
05-26 16:11:22.241925  1806  1818 D vold    : 
05-26 16:11:22.262466  1806  1818 D vold    : Creating... done.
05-26 16:11:22.262545  1806  1818 D vold    : 
05-26 16:11:22.400120  1806  1818 D vold    : Flushing... done.
05-26 16:11:22.400201  1806  1818 D vold    : 
05-26 16:11:22.400245  1806  1818 D vold    : File system created successfully.
05-26 16:11:22.400258  1806  1818 D vold    : 
05-26 16:11:22.401051  1806  1818 I vold    : Format OK
05-26 16:11:22.402058  1806  1818 D vold    : VolumeBase create onVolumeCreated
05-26 16:11:22.402316  1806  1818 D vold    : Disk at 179:64 changed
--------- switch to main
05-26 16:11:22.403982  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:11:22.403982  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:11:22.403982  2375  2375 D StorageNotification:     state=UNMOUNTED 
05-26 16:11:22.403982  2375  2375 D StorageNotification:     fsType=null fsUuid=null fsLabel=null 
05-26 16:11:22.403982  2375  2375 D StorageNotification:     path=null internalPath=null 
--------- switch to system
05-26 16:11:22.404312  1806  1818 D vold    : /system/bin/sgdisk
05-26 16:11:22.404376  1806  1818 D vold    :     --android-dump
05-26 16:11:22.404396  1806  1818 D vold    :     /dev/block/vold/disk:179,64
05-26 16:11:22.407516  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:11:22.407516  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:11:22.407516  2375  2375 D StorageNotification:     state=REMOVED 
05-26 16:11:22.407516  2375  2375 D StorageNotification:     fsType=null fsUuid=null fsLabel=null 
05-26 16:11:22.407516  2375  2375 D StorageNotification:     path=null internalPath=null 
--------- switch to system
05-26 16:11:22.424104  1806  1818 D vold    : DISK mbr
05-26 16:11:22.424175  1806  1818 D vold    : 
05-26 16:11:22.424206  1806  1818 D vold    : PART 1 c
05-26 16:11:22.424219  1806  1818 D vold    : 
05-26 16:11:22.425915  1806  1818 D vold    : VolumeBase create onVolumeCreated
05-26 16:11:22.426196  1806  2972 D vold    : /system/bin/blkid
05-26 16:11:22.426237  1806  2972 D vold    :     -c
05-26 16:11:22.426256  1806  2972 D vold    :     /dev/null
05-26 16:11:22.426273  1806  2972 D vold    :     -s
05-26 16:11:22.426288  1806  2972 D vold    :     TYPE
05-26 16:11:22.426303  1806  2972 D vold    :     -s
05-26 16:11:22.426318  1806  2972 D vold    :     UUID
05-26 16:11:22.426333  1806  2972 D vold    :     -s
05-26 16:11:22.426347  1806  2972 D vold    :     LABEL
05-26 16:11:22.426365  1806  2972 D vold    :     /dev/block/vold/public:179,65
05-26 16:11:22.430189  2239  3055 V KioskMode: Resuming ActivityRecord{8057b8 u0 com.android.settings/.deviceinfo.StorageWizardFormatSlow t549}
05-26 16:11:22.434692  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:11:22.434692  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:11:22.434692  2375  2375 D StorageNotification:     state=UNMOUNTED 
05-26 16:11:22.434692  2375  2375 D StorageNotification:     fsType=null fsUuid=null fsLabel=null 
05-26 16:11:22.434692  2375  2375 D StorageNotification:     path=null internalPath=null 
05-26 16:11:22.436403  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:11:22.436403  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:11:22.436403  2375  2375 D StorageNotification:     state=CHECKING 
05-26 16:11:22.436403  2375  2375 D StorageNotification:     fsType=null fsUuid=null fsLabel=null 
05-26 16:11:22.436403  2375  2375 D StorageNotification:     path=null internalPath=null 

05-26 16:11:22.625115  2239  2492 I ActivityTaskManager: START u0 {cmp=com.android.settings/.deviceinfo.StorageWizardReady (has extras)} from uid 1000
05-26 16:11:22.637249  1806  2972 D vold    : exfatfsck 1.3.0
05-26 16:11:22.637667  1806  2972 D vold    : 
05-26 16:11:22.637717  1806  2972 D vold    : Checking file system on /dev/block/vold/public:179,65.
05-26 16:11:22.637731  1806  2972 D vold    : 
05-26 16:11:22.637776  1806  2972 D vold    : File system version           1.0
05-26 16:11:22.637791  1806  2972 D vold    : 
05-26 16:11:22.637813  1806  2972 D vold    : Sector size                 512 bytes
05-26 16:11:22.637826  1806  2972 D vold    : 
05-26 16:11:22.637847  1806  2972 D vold    : Cluster size                128 KB
05-26 16:11:22.637860  1806  2972 D vold    : 
05-26 16:11:22.637881  1806  2972 D vold    : Volume size                 116 GB
05-26 16:11:22.637900  1806  2972 D vold    : 
05-26 16:11:22.637921  1806  2972 D vold    : Used space                 4336 KB
05-26 16:11:22.637934  1806  2972 D vold    : 
05-26 16:11:22.637954  1806  2972 D vold    : Available space             116 GB
05-26 16:11:22.637966  1806  2972 D vold    : 
05-26 16:11:22.637986  1806  2972 D vold    : Totally 0 directories and 0 files.
05-26 16:11:22.637998  1806  2972 D vold    : 
05-26 16:11:22.637304  2239  2492 V KioskMode: Resuming ActivityRecord{d12e3ef u0 com.android.settings/.deviceinfo.StorageWizardReady t549}
05-26 16:11:22.638018  1806  2972 D vold    : File system checking finished. No errors found.
05-26 16:11:22.638030  1806  2972 D vold    : 
05-26 16:11:22.638679  1806  2972 I vold    : Check OK
05-26 16:11:22.644355  1806  2972 E vold    : Mount failed; attempting read-only: No such device
05-26 16:11:22.646085  1806  2972 D vold    : /system/bin/mount.exfat
05-26 16:11:22.646162  1806  2972 D vold    :     -o
05-26 16:11:22.646183  1806  2972 D vold    :     uid=1023,gid=1023,fmask=7,dmask=7
05-26 16:11:22.646204  1806  2972 D vold    :     /dev/block/vold/public:179,65
05-26 16:11:22.646221  1806  2972 D vold    :     /mnt/media_rw/22A3-B024

05-26 16:11:22.901784  2375  2375 D StorageNotification: Notifying about public volume: VolumeInfo{public:179,65}:
05-26 16:11:22.901784  2375  2375 D StorageNotification:     type=PUBLIC diskId=disk:179,64 partGuid= mountFlags=VISIBLE mountUserId=0 
05-26 16:11:22.901784  2375  2375 D StorageNotification:     state=MOUNTED 
05-26 16:11:22.901784  2375  2375 D StorageNotification:     fsType=exfat fsUuid=22A3-B024 fsLabel=android 
05-26 16:11:22.901784  2375  2375 D StorageNotification:     path=/storage/22A3-B024 internalPath=/mnt/media_rw/22A3-B024 

```

## 20250807 TF卡不识别问题分析

```txt

[    2.761917] mmc1: card never left busy state
[    2.761950] mmc1: error -110 whilst initialising SD card

```

这类问题 在 嵌入式 Android/Linux 设备中非常典型，一般是由于软重启时 TF 卡电源或复位未正确拉低，导致卡仍处于 busy 状态，无法重新初始化。


1. 软重启时 TF 卡没有断电

* TF 卡在 reset 过程中需要完整的断电/上电周期，否则它的控制器会残留上一次 session 的状态（即“卡一直 busy”）。
* 断电重启时主控和卡都掉电，重新初始化 OK。
* 软重启时，如果 TF 卡电源由某个 LDO 或 GPIO 控制，而该供电未重新拉低，那么就会出现 card never left busy state

**DTS**

```c

		sdc0: sdmmc@04020000 {
			bus-width = <4>;
			cd-gpios = <&pio PF 6 6 1 3 0xffffffff>;
			/*non-removable;*/
			/*broken-cd;*/
			/*cd-inverted;*/
			/*data3-detect;*/
			cd-used-24M;
			cap-sd-highspeed;
			sd-uhs-sdr50;
			sd-uhs-ddr50;
			sd-uhs-sdr104;
			no-sdio;
			no-mmc;
			sunxi-power-save-mode;
			/*sunxi-dis-signal-vol-sw;*/
			max-frequency = <150000000>;
			ctl-spec-caps = <0x8>;
			vmmc-supply = <&reg_dcdc1>;
			vqmmc33sw-supply = <&reg_dcdc1>;
			vdmmc33sw-supply = <&reg_dcdc1>;
			vqmmc18sw-supply = <&reg_eldo1>;
			vdmmc18sw-supply = <&reg_eldo1>;
			status = "okay";
		};

```

![a133_tf_card](/images/hardware/a133_tf_card.png)

![a133_tf_card_vcc](/images/hardware/a133_tf_card_vcc.png)

**结论：软重启时TF卡电源不可控**

结合两张图来看，可以得出以下结论：

1. 第一张图显示VCC-CARD通过一个0欧姆电阻RC3连接到VCC-CARD-3.3V，然后为TF卡供电。
2. 第二张图显示VCC-CARD直接由DCDC1的3.3V输出供电。

问题点在于：

1. DCDC1是一个电源转换器。通常在嵌入式系统中，DCDC转换器只有在系统完全关机（即硬重启）时才会断电。
2. 当主控芯片执行软重启时，DCDC1通常会持续工作，保持3.3V输出不变。
3. 由于VCC-CARD直接连接到DCDC1的输出，因此在软重启时，VCC-CARD（以及VCC-CARD-3.3V）的电压不会被拉低，TF卡会一直保持供电状态。

## 软重启导致的TF卡异常

**文件系统未正常卸载**

软重启过程中，TF 卡上的文件系统缓存（页缓存、写缓存）没来得及 flush 到物理卡，导致 FS 出现 dirty 标记甚至损坏。

下次挂载时可能被内核标记为“脏盘”或“只读”。

**驱动/电源管理问题**

某些平台（尤其 Allwinner、Rockchip 等）在 reboot 时，SDIO/SDMMC 控制器掉电不彻底，卡状态机没有复位干净。

下次挂载时，驱动读到卡状态异常，导致“掉卡”或不可识别。
















