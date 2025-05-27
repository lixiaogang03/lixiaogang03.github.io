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
            case VolumeInfo.STATE_UNMOUNTABLE:
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



























