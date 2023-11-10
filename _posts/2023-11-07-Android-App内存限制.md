---
layout:     post
title:      Android App 内存限制
subtitle:   Java Native
date:       2023-11-07
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

[内存管理概览](https://developer.android.google.cn/topic/performance/memory-overview?hl=zh-cn)

[Android系统中的内存占用统计原理](https://juejin.cn/post/7140592088013340702)

## 问题描述

为了允许多个进程同时运行，Android 针对为每个应用分配的堆大小设置了硬性限制。设备的确切堆大小限制因设备总体可用的 RAM 容量而异。如果您的应用达到堆容量上限并尝试分配更多内存，系统就会抛出 OutOfMemoryError。

```txt

I .gpadc.yolodem: Alloc young concurrent copying GC freed 6910(352KB) AllocSpace objects, 17(1984KB) LOS objects, 0% free, 764MB/768MB, paused 41us,26us total 7.151ms
I .gpadc.yolodem: Forcing collection of SoftReferences for 22MB allocation
I .gpadc.yolodem: Starting a blocking GC Alloc
I .gpadc.yolodem: Clamp target GC heap from 785MB to 768MB
I .gpadc.yolodem: Alloc concurrent copying GC freed 3041(179KB) AllocSpace objects, 5(3200KB) LOS objects, 0% free, 761MB/768MB, paused 25us,32us total 10.123ms
W .gpadc.yolodem: Throwing OutOfMemoryError "Failed to allocate a 23969804 byte allocation with 7320896 free bytes and 7149KB until OOM, target footprint 805306368, growth limit 805306368" (VmSize 3915852 kB)
I .gpadc.yolodem: Starting a blocking GC Alloc
I .gpadc.yolodem: Starting a blocking GC Alloc
I .gpadc.yolodem: Alloc young concurrent copying GC freed 10(59KB) AllocSpace objects, 1(20KB) LOS objects, 0% free, 761MB/768MB, paused 26us,21us total 5.686ms
I .gpadc.yolodem: Forcing collection of SoftReferences for 22MB allocation
I .gpadc.yolodem: Starting a blocking GC Alloc
I .gpadc.yolodem: Clamp target GC heap from 785MB to 768MB
I .gpadc.yolodem: Alloc concurrent copying GC freed 5053(117KB) AllocSpace objects, 10(848KB) LOS objects, 0% free, 761MB/768MB, paused 28us,26us total 9.191ms
W .gpadc.yolodem: Throwing OutOfMemoryError "Failed to allocate a 23969808 byte allocation with 7281440 free bytes and 7110KB until OOM, target footprint 805306368, growth limit 805306368" (VmSize 3912580 kB)
D AndroidRuntime: Shutting down VM
E AndroidRuntime: FATAL EXCEPTION: main
E AndroidRuntime: Process: com.rockchip.gpadc.yolodemo, PID: 2270
E AndroidRuntime: java.lang.OutOfMemoryError: Failed to allocate a 23969808 byte allocation with 7281440 free bytes and 7110KB until OOM, target footprint 805306368, growth limit 805306368
E AndroidRuntime: 	at com.rockchip.gpadc.demo.gige.HKCameraControl.getOneBmp(HKCameraControl.java:519)
E AndroidRuntime: 	at com.rockchip.gpadc.app.OcrPositionAct.ocrTakePicture(OcrPositionAct.kt:557)
E AndroidRuntime: 	at com.rockchip.gpadc.app.OcrPositionAct.dealTakePhoto$lambda$5(OcrPositionAct.kt:419)
E AndroidRuntime: 	at com.rockchip.gpadc.app.OcrPositionAct.$r8$lambda$BRclX27CrRub3uN3h50Ovr231Vo(Unknown Source:0)
E AndroidRuntime: 	at com.rockchip.gpadc.app.OcrPositionAct$$ExternalSyntheticLambda6.run(Unknown Source:8)
E AndroidRuntime: 	at android.os.Handler.handleCallback(Handler.java:938)
E AndroidRuntime: 	at android.os.Handler.dispatchMessage(Handler.java:99)
E AndroidRuntime: 	at android.os.Looper.loopOnce(Looper.java:201)
E AndroidRuntime: 	at android.os.Looper.loop(Looper.java:288)
E AndroidRuntime: 	at android.app.ActivityThread.main(ActivityThread.java:7870)
E AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
E AndroidRuntime: 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1003)

```

## OOM 源码位置

art/runtime/gc/heap.cc

```c

void Heap::ThrowOutOfMemoryError(Thread* self, size_t byte_count, AllocatorType allocator_type) {
  // If we're in a stack overflow, do not create a new exception. It would require running the
  // constructor, which will of course still be in a stack overflow.
  if (self->IsHandlingStackOverflow()) {
    self->SetException(
        Runtime::Current()->GetPreAllocatedOutOfMemoryErrorWhenHandlingStackOverflow());
    return;
  }

  std::ostringstream oss;
  size_t total_bytes_free = GetFreeMemory();
  oss << "Failed to allocate a " << byte_count << " byte allocation with " << total_bytes_free
      << " free bytes and " << PrettySize(GetFreeMemoryUntilOOME()) << " until OOM,"
      << " target footprint " << target_footprint_.load(std::memory_order_relaxed)
      << ", growth limit "
      << growth_limit_;
  // If the allocation failed due to fragmentation, print out the largest continuous allocation.
  if (total_bytes_free >= byte_count) {
    space::AllocSpace* space = nullptr;
    if (allocator_type == kAllocatorTypeNonMoving) {
      space = non_moving_space_;
    } else if (allocator_type == kAllocatorTypeRosAlloc ||
               allocator_type == kAllocatorTypeDlMalloc) {
      space = main_space_;
    } else if (allocator_type == kAllocatorTypeBumpPointer ||
               allocator_type == kAllocatorTypeTLAB) {
      space = bump_pointer_space_;
    } else if (allocator_type == kAllocatorTypeRegion ||
               allocator_type == kAllocatorTypeRegionTLAB) {
      space = region_space_;
    }

    // There is no fragmentation info to log for large-object space.
    if (allocator_type != kAllocatorTypeLOS) {
      CHECK(space != nullptr) << "allocator_type:" << allocator_type
                              << " byte_count:" << byte_count
                              << " total_bytes_free:" << total_bytes_free;
      // LogFragmentationAllocFailure returns true if byte_count is greater than
      // the largest free contiguous chunk in the space. Return value false
      // means that we are throwing OOME because the amount of free heap after
      // GC is less than kMinFreeHeapAfterGcForAlloc in proportion of the heap-size.
      // Log an appropriate message in that case.
      if (!space->LogFragmentationAllocFailure(oss, byte_count)) {
        oss << "; giving up on allocation because <"
            << kMinFreeHeapAfterGcForAlloc * 100
            << "% of heap free after GC.";
      }
    }
  }
  self->ThrowOutOfMemoryError(oss.str().c_str());
}

```

## 单个应用内存上限获取

**App接口**

```java

public void doSomethingMemoryIntensive() {

    // Before doing something that requires a lot of memory,
    // check whether the device is in a low memory state.
    ActivityManager.MemoryInfo memoryInfo = getAvailableMemory();

    if (!memoryInfo.lowMemory) {
        // Do memory intensive work.
    }
}

// Get a MemoryInfo object for the device's current memory status.
private ActivityManager.MemoryInfo getAvailableMemory() {
    ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
    ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
    activityManager.getMemoryInfo(memoryInfo);
    return memoryInfo;
}

```

**framework**

ActivityManager.java

```java

@SystemService(Context.ACTIVITY_SERVICE)
public class ActivityManager {
    private static String TAG = "ActivityManager";

    public static class MemoryInfo implements Parcelable {
        /**
         * The available memory on the system.  This number should not
         * be considered absolute: due to the nature of the kernel, a significant
         * portion of this memory is actually in use and needed for the overall
         * system to run well.
         */
        public long availMem;

        /**
         * The total memory accessible by the kernel.  This is basically the
         * RAM size of the device, not including below-kernel fixed allocations
         * like DMA buffers, RAM for the baseband CPU, etc.
         */
        public long totalMem;

        /**
         * The threshold of {@link #availMem} at which we consider memory to be
         * low and start killing background services and other non-extraneous
         * processes.
         */
        public long threshold;

        /**
         * Set to true if the system considers itself to currently be in a low
         * memory situation.
         */
        public boolean lowMemory;
        
   }

}

```

ActivityManagerService.java

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback, ActivityManagerGlobalLock {

    /**
     * Process management.
     */
    final ProcessList mProcessList;

    public ActivityManagerService(Injector injector, ServiceThread handlerThread) {

        mProcessList = injector.getProcessList(this);
        mProcessList.init(this, activeUids, mPlatformCompat);

    }

    @Override
    public void getMemoryInfo(ActivityManager.MemoryInfo outInfo) {
        mProcessList.getMemoryInfo(outInfo);
    }

}

```

ProcessList.java

```java

/**
 * Activity manager code dealing with processes.
 */
public final class ProcessList {

    void getMemoryInfo(ActivityManager.MemoryInfo outInfo) {
        final long homeAppMem = getMemLevel(HOME_APP_ADJ);
        final long cachedAppMem = getMemLevel(CACHED_APP_MIN_ADJ);
        outInfo.availMem = getFreeMemory();
        outInfo.totalMem = getTotalMemory();
        outInfo.threshold = homeAppMem;
        outInfo.lowMemory = outInfo.availMem < (homeAppMem + ((cachedAppMem-homeAppMem)/2));
        outInfo.hiddenAppThreshold = cachedAppMem;
        outInfo.secondaryServerThreshold = getMemLevel(SERVICE_ADJ);
        outInfo.visibleAppThreshold = getMemLevel(VISIBLE_APP_ADJ);
        outInfo.foregroundAppThreshold = getMemLevel(FOREGROUND_APP_ADJ);
    }

}

```

Process.java

```java

/**
 * Tools for managing OS processes.
 */
public class Process {

    /** @hide */
    @UnsupportedAppUsage
    public static final native long getFreeMemory();

    /** @hide */
    @UnsupportedAppUsage
    public static final native long getTotalMemory();

}

```

./base/core/jni/android_util_Process.cpp

```cpp

static jlong android_os_Process_getFreeMemory(JNIEnv* env, jobject clazz)
{
    std::array<std::string_view, 2> memFreeTags = {
        ::android::meminfo::SysMemInfo::kMemFree,
        ::android::meminfo::SysMemInfo::kMemCached,
    };
    std::vector<uint64_t> mem(memFreeTags.size());
    ::android::meminfo::SysMemInfo smi;

    if (!smi.ReadMemInfo(memFreeTags.size(),
                         memFreeTags.data(),
                         mem.data())) {
        jniThrowRuntimeException(env, "SysMemInfo read failed to get Free Memory");
        return -1L;
    }

    jlong sum = 0;
    std::for_each(mem.begin(), mem.end(), [&](uint64_t val) { sum += val; });
    return sum * 1024;
}

static jlong android_os_Process_getTotalMemory(JNIEnv* env, jobject clazz)
{
    struct sysinfo si;
    if (sysinfo(&si) == -1) {
        ALOGE("sysinfo failed: %s", strerror(errno));
        return -1;
    }

    return static_cast<jlong>(si.totalram) * si.mem_unit;
}

```

./kernel-5.10/include/uapi/linux/sysinfo.h

```c

/* SPDX-License-Identifier: GPL-2.0 WITH Linux-syscall-note */
#ifndef _LINUX_SYSINFO_H
#define _LINUX_SYSINFO_H

#include <linux/types.h>

#define SI_LOAD_SHIFT   16
struct sysinfo {
        __kernel_long_t uptime;         /* Seconds since boot */
        __kernel_ulong_t loads[3];      /* 1, 5, and 15 minute load averages */
        __kernel_ulong_t totalram;      /* Total usable main memory size */
        __kernel_ulong_t freeram;       /* Available memory size */
        __kernel_ulong_t sharedram;     /* Amount of shared memory */
        __kernel_ulong_t bufferram;     /* Memory used by buffers */
        __kernel_ulong_t totalswap;     /* Total swap space size */
        __kernel_ulong_t freeswap;      /* swap space still available */
        __u16 procs;                    /* Number of current processes */
        __u16 pad;                      /* Explicit padding for m68k */
        __kernel_ulong_t totalhigh;     /* Total high memory size */
        __kernel_ulong_t freehigh;      /* Available high memory size */
        __u32 mem_unit;                 /* Memory unit size in bytes */
        char _f[20-2*sizeof(__kernel_ulong_t)-sizeof(__u32)];   /* Padding: libc5 uses this.. */
};

#endif /* _LINUX_SYSINFO_H */

```


## dumpsys meminfo

```txt

Applications Memory Usage (in Kilobytes):
Uptime: 6294345 Realtime: 6294345

** MEMINFO in pid 2611 [com.rockchip.gpadc.yolodemo] **
                   Pss      Pss   Shared  Private   Shared  Private     Swap      Rss     Heap     Heap     Heap
                 Total    Clean    Dirty    Dirty    Clean    Clean    Dirty    Total     Size    Alloc     Free
                ------   ------   ------   ------   ------   ------   ------   ------   ------   ------   ------
  Native Heap    46498        0     2516    46000        0        0        0    48516    63076    50190     2420
  Dalvik Heap     2660        0     8264     1020        0        0        0     9284     4120     2060     2060
 Dalvik Other      938        0     1544      692        0        0        0     2236                           
        Stack      441        0       12      440        0        0        0      452                           
       Ashmem       23        0      532        0        4        0        0      536                           
    Other dev   365560        0      272   209836        0   155724        0   365832                           
     .so mmap    22200    10628     4208      196    34592    10628        0    49624                           
    .jar mmap     1194        0        0        0    23624        0        0    23624                           
    .apk mmap    13048    11936        0      676     2016    11936        0    14628                           
    .ttf mmap       30        0        0        0      152        0        0      152                           
    .dex mmap     8420     8380       12        4      444     8380        0     8840                           
    .oat mmap     3341      256       64        0    11516      256        0    11836                           
    .art mmap     3386        0    14204      512      136        0        0    14852                           
   Other mmap      158        0       32        4      788       64        0      888                           
      Unknown     1765        0      544     1672        0        0        0     2216                           
        TOTAL   469662    31200    32204   261052    73272   186988        0   553516    67196    52250     4480
 
 Dalvik Details
        .Heap      584        0        0      584        0        0        0      584                           
         .LOS      352        0     1772       12        0        0        0     1784                           
      .Zygote     1704        0     6492      404        0        0        0     6896                           
   .NonMoving       20        0        0       20        0        0        0       20                           
 .LinearAlloc      792        0     1396      572        0        0        0     1968                           
          .GC       77        0      108       56        0        0        0      164                           
   .ZygoteJIT        5        0       36        0        0        0        0       36                           
      .AppJIT       16        0        0       16        0        0        0       16                           
 .IndirectRef       48        0        4       48        0        0        0       52                           
   .Boot vdex       23        0        0        0      416        0        0      416                           
     .App dex      116      100       12        4       24      100        0      140                           
    .App vdex     8281     8280        0        0        4     8280        0     8284                           
    .Boot art     3386        0    14204      512      136        0        0    14852                           
 
 App Summary
                       Pss(KB)                        Rss(KB)
                        ------                         ------
           Java Heap:     1532                          24136
         Native Heap:    46000                          48516
                Code:    32092                         108756
               Stack:      440                            452
            Graphics:        0                              0
       Private Other:   367976
              System:    21622
             Unknown:                                  371656
 
           TOTAL PSS:   469662            TOTAL RSS:   553516      TOTAL SWAP (KB):        0
 
 Objects
               Views:        7         ViewRootImpl:        1
         AppContexts:        6           Activities:        2
              Assets:        8        AssetManagers:        0
       Local Binders:        9        Proxy Binders:       33
       Parcel memory:        4         Parcel count:       18
    Death Recipients:        0      OpenSSL Sockets:        0
            WebViews:        0
 
 SQL
         MEMORY_USED:        0
  PAGECACHE_OVERFLOW:        0          MALLOC_SIZE:        0
 
----------------------------------------------------------------------------------------------------------

Total RSS by process:
    553,516K: com.rockchip.gpadc.yolodemo (pid 2611 / activities)
    514,020K: system (pid 625)
    269,168K: com.android.systemui (pid 796)
    215,320K: com.android.launcher3 (pid 1127 / activities)
    194,544K: zygote64 (pid 422)
    173,916K: zygote (pid 423)

Total RSS by OOM adjustment:
  1,048,724K: Native
        194,544K: zygote64 (pid 422)
        173,916K: zygote (pid 423)
         74,204K: surfaceflinger (pid 331)

Total RSS by category:
  1,362,276K: .so mmap
    743,264K: .jar mmap
    537,972K: .art mmap
        532,072K: .Boot art
          5,900K: .App art
    389,164K: Other dev
    382,176K: Native
    338,644K: .oat mmap
    289,948K: Dalvik
        201,276K: .Zygote
         50,308K: .LOS
         35,456K: .Heap
          2,908K: .NonMoving
    231,312K: .apk mmap
    149,404K: .dex mmap
        121,736K: .App dex
         14,844K: .App vdex
         12,824K: .Boot vdex
    138,252K: Other mmap
     87,192K: Dalvik Other
         74,404K: .LinearAlloc
          5,484K: .GC
          4,132K: .AppJIT
          1,900K: .IndirectRef
          1,272K: .ZygoteJIT
              0K: .CompilerMetadata
     60,712K: Unknown
     20,228K: Stack
     14,280K: Ashmem
     12,600K: .ttf mmap
          0K: Cursor
          0K: Gfx dev
          0K: EGL mtrack
          0K: GL mtrack
          0K: Other mtrack

Total RAM: 16,071,376K (status normal)
 Free RAM: 14,102,789K (   96,005K cached pss +   832,840K cached kernel + 13,173,944K free)
DMA-BUF:   455,268K (        0K mapped +   455,268K unmapped)
DMA-BUF Heaps:    89,724K
DMA-BUF Heaps pool:    98,980K
 Used RAM: 2,447,645K (1,393,609K used pss + 1,054,036K kernel)
 Lost RAM:  -479,062K
     ZRAM:         4K physical used for         0K in swap (8,035,684K total swap)
   Tuning: 256 (large 768), oom   322,560K, restore limit   107,520K (high-end-gfx)

```

## 流程图

![dumpsys_meminfo](/images/ams/dumpsys_meminfo.png)

## 源码

./base/core/java/android/os/Debug.java

```java

public final class Debug
{

     * Retrieves information about this processes memory usages. This information is broken down by
     * how much is in use by dalvik, the native heap, and everything else.
     *
     * <p><b>Note:</b> this method directly retrieves memory information for the given process
     * from low-level data available to it.  It may not be able to retrieve information about
     * some protected allocations, such as graphics.  If you want to be sure you can see
     * all information about allocations by the process, use
     * {@link android.app.ActivityManager#getProcessMemoryInfo(int[])} instead.</p>
     */
    public static native void getMemoryInfo(MemoryInfo memoryInfo);

    /**
     * Note: currently only works when the requested pid has the same UID
     * as the caller.
     *
     * @return true if the meminfo was read successfully, false if not (i.e., given pid has gone).
     *
     * @hide
     */
    @UnsupportedAppUsage
    public static native boolean getMemoryInfo(int pid, MemoryInfo memoryInfo);

}

```

./native/libs/binder/Debug.cpp

```cpp


static const JNINativeMethod gMethods[] = {
    { "getNativeHeapSize",      "()J",
            (void*) android_os_Debug_getNativeHeapSize },
    { "getNativeHeapAllocatedSize", "()J",
            (void*) android_os_Debug_getNativeHeapAllocatedSize },
    { "getNativeHeapFreeSize",  "()J",
            (void*) android_os_Debug_getNativeHeapFreeSize },
    { "getMemoryInfo",          "(Landroid/os/Debug$MemoryInfo;)V",
            (void*) android_os_Debug_getDirtyPages },
    { "getMemoryInfo",          "(ILandroid/os/Debug$MemoryInfo;)Z",
            (void*) android_os_Debug_getDirtyPagesPid },

}

static void android_os_Debug_getDirtyPages(JNIEnv *env, jobject clazz, jobject object)
{
    android_os_Debug_getDirtyPagesPid(env, clazz, getpid(), object);
}

static jboolean android_os_Debug_getDirtyPagesPid(JNIEnv *env, jobject clazz,
        jint pid, jobject object)
{
    bool foundSwapPss;
    stats_t stats[_NUM_HEAP];
    memset(&stats, 0, sizeof(stats));

   // 该方法的主要业务逻辑是遍历/proc/pid/smaps，根据内存的不同分类，计算出各个类别的内存占用情况
    if (!load_maps(pid, stats, &foundSwapPss)) {
        return JNI_FALSE;
    }

    // 获取没有归属到/proc/pid/smaps中的graphics，gl，other类别的内存。
    struct graphics_memory_pss graphics_mem;
    if (read_memtrack_memory(pid, &graphics_mem) == 0) {
        stats[HEAP_GRAPHICS].pss = graphics_mem.graphics;
        stats[HEAP_GRAPHICS].privateDirty = graphics_mem.graphics;
        stats[HEAP_GRAPHICS].rss = graphics_mem.graphics;
        stats[HEAP_GL].pss = graphics_mem.gl;
        stats[HEAP_GL].privateDirty = graphics_mem.gl;
        stats[HEAP_GL].rss = graphics_mem.gl;
        stats[HEAP_OTHER_MEMTRACK].pss = graphics_mem.other;
        stats[HEAP_OTHER_MEMTRACK].privateDirty = graphics_mem.other;
        stats[HEAP_OTHER_MEMTRACK].rss = graphics_mem.other;
    }

    // 将包括graphics，gl，other在内的内存统一归并到HEAP_UNKNOWN
    for (int i=_NUM_CORE_HEAP; i<_NUM_EXCLUSIVE_HEAP; i++) {
        stats[HEAP_UNKNOWN].pss += stats[i].pss;
        stats[HEAP_UNKNOWN].swappablePss += stats[i].swappablePss;
        stats[HEAP_UNKNOWN].rss += stats[i].rss;
        stats[HEAP_UNKNOWN].privateDirty += stats[i].privateDirty;
        stats[HEAP_UNKNOWN].sharedDirty += stats[i].sharedDirty;
        stats[HEAP_UNKNOWN].privateClean += stats[i].privateClean;
        stats[HEAP_UNKNOWN].sharedClean += stats[i].sharedClean;
        stats[HEAP_UNKNOWN].swappedOut += stats[i].swappedOut;
        stats[HEAP_UNKNOWN].swappedOutPss += stats[i].swappedOutPss;
    }

    // 将HEAP_UNKNOWN, HEAP_DALVIK, HEAP_NATIVE传递给Java层的MemoryInfo对应的实例
    for (int i=0; i<_NUM_CORE_HEAP; i++) {
        env->SetIntField(object, stat_fields[i].pss_field, stats[i].pss);
        env->SetIntField(object, stat_fields[i].pssSwappable_field, stats[i].swappablePss);
        env->SetIntField(object, stat_fields[i].rss_field, stats[i].rss);
        env->SetIntField(object, stat_fields[i].privateDirty_field, stats[i].privateDirty);
        env->SetIntField(object, stat_fields[i].sharedDirty_field, stats[i].sharedDirty);
        env->SetIntField(object, stat_fields[i].privateClean_field, stats[i].privateClean);
        env->SetIntField(object, stat_fields[i].sharedClean_field, stats[i].sharedClean);
        env->SetIntField(object, stat_fields[i].swappedOut_field, stats[i].swappedOut);
        env->SetIntField(object, stat_fields[i].swappedOutPss_field, stats[i].swappedOutPss);
    }


    env->SetBooleanField(object, hasSwappedOutPss_field, foundSwapPss);
    jintArray otherIntArray = (jintArray)env->GetObjectField(object, otherStats_field);

    jint* otherArray = (jint*)env->GetPrimitiveArrayCritical(otherIntArray, 0);
    if (otherArray == NULL) {
        return JNI_FALSE;
    }

    //  将HEAP_DALVIK_OTHER到HEAP_OTHER_MEMTRACK的内存数据传递给Java层的otherStats数组中
    int j=0;
    for (int i=_NUM_CORE_HEAP; i<_NUM_HEAP; i++) {
        otherArray[j++] = stats[i].pss;
        otherArray[j++] = stats[i].swappablePss;
        otherArray[j++] = stats[i].rss;
        otherArray[j++] = stats[i].privateDirty;
        otherArray[j++] = stats[i].sharedDirty;
        otherArray[j++] = stats[i].privateClean;
        otherArray[j++] = stats[i].sharedClean;
        otherArray[j++] = stats[i].swappedOut;
        otherArray[j++] = stats[i].swappedOutPss;
    }

    env->ReleasePrimitiveArrayCritical(otherIntArray, otherArray, 0);
    return JNI_TRUE;
}


//--------------------------------------------/proc/%d/smaps------------------------------------------

static bool load_maps(int pid, stats_t* stats, bool* foundSwapPss)
{
    *foundSwapPss = false;
    uint64_t prev_end = 0;
    int prev_heap = HEAP_UNKNOWN;

    std::string smaps_path = base::StringPrintf("/proc/%d/smaps", pid);
    auto vma_scan = [&](const meminfo::Vma& vma) {
        int which_heap = HEAP_UNKNOWN;
        int sub_heap = HEAP_UNKNOWN;
        bool is_swappable = false;
        std::string name;
        if (base::EndsWith(vma.name, " (deleted)")) {
            name = vma.name.substr(0, vma.name.size() - strlen(" (deleted)"));
        } else {
            name = vma.name;
        }

        uint32_t namesz = name.size();
        if (base::StartsWith(name, "[heap]")) {
            which_heap = HEAP_NATIVE;
        } else if (base::StartsWith(name, "[anon:libc_malloc]")) {
            which_heap = HEAP_NATIVE;
        } else if (base::StartsWith(name, "[anon:scudo:")) {
            which_heap = HEAP_NATIVE;
        } else if (base::StartsWith(name, "[anon:GWP-ASan")) {
            which_heap = HEAP_NATIVE;
        } else if (base::StartsWith(name, "[stack")) {
            which_heap = HEAP_STACK;
        } else if (base::StartsWith(name, "[anon:stack_and_tls:")) {
            which_heap = HEAP_STACK;
        } else if (base::EndsWith(name, ".so")) {
            which_heap = HEAP_SO;
            is_swappable = true;
        } else if (base::EndsWith(name, ".jar")) {
            which_heap = HEAP_JAR;
            is_swappable = true;
        } else if (base::EndsWith(name, ".apk")) {
            which_heap = HEAP_APK;
            is_swappable = true;
        } else if (base::EndsWith(name, ".ttf")) {
            which_heap = HEAP_TTF;
            is_swappable = true;
        } else if ((base::EndsWith(name, ".odex")) ||
                (namesz > 4 && strstr(name.c_str(), ".dex") != nullptr)) {
            which_heap = HEAP_DEX;
            sub_heap = HEAP_DEX_APP_DEX;
            is_swappable = true;
        } else if (base::EndsWith(name, ".vdex")) {
            which_heap = HEAP_DEX;
            // Handle system@framework@boot and system/framework/boot|apex
            if ((strstr(name.c_str(), "@boot") != nullptr) ||
                    (strstr(name.c_str(), "/boot") != nullptr) ||
                    (strstr(name.c_str(), "/apex") != nullptr)) {
                sub_heap = HEAP_DEX_BOOT_VDEX;
            } else {
                sub_heap = HEAP_DEX_APP_VDEX;
            }
            is_swappable = true;
        } else if (base::EndsWith(name, ".oat")) {
            which_heap = HEAP_OAT;
            is_swappable = true;
        } else if (base::EndsWith(name, ".art") || base::EndsWith(name, ".art]")) {
            which_heap = HEAP_ART;
            // Handle system@framework@boot* and system/framework/boot|apex*
            if ((strstr(name.c_str(), "@boot") != nullptr) ||
                    (strstr(name.c_str(), "/boot") != nullptr) ||
                    (strstr(name.c_str(), "/apex") != nullptr)) {
                sub_heap = HEAP_ART_BOOT;
            } else {
                sub_heap = HEAP_ART_APP;
            }
            is_swappable = true;
        } else if (base::StartsWith(name, "/dev/")) {
            which_heap = HEAP_UNKNOWN_DEV;
            if (base::StartsWith(name, "/dev/kgsl-3d0")) {
                which_heap = HEAP_GL_DEV;
            } else if (base::StartsWith(name, "/dev/ashmem/CursorWindow")) {
                which_heap = HEAP_CURSOR;
            } else if (base::StartsWith(name, "/dev/ashmem/jit-zygote-cache")) {
                which_heap = HEAP_DALVIK_OTHER;
                sub_heap = HEAP_DALVIK_OTHER_ZYGOTE_CODE_CACHE;
            } else if (base::StartsWith(name, "/dev/ashmem")) {
                which_heap = HEAP_ASHMEM;
            }
        } else if (base::StartsWith(name, "/memfd:jit-cache")) {
          which_heap = HEAP_DALVIK_OTHER;
          sub_heap = HEAP_DALVIK_OTHER_APP_CODE_CACHE;
        } else if (base::StartsWith(name, "/memfd:jit-zygote-cache")) {
          which_heap = HEAP_DALVIK_OTHER;
          sub_heap = HEAP_DALVIK_OTHER_ZYGOTE_CODE_CACHE;
        } else if (base::StartsWith(name, "[anon:")) {
            which_heap = HEAP_UNKNOWN;
            if (base::StartsWith(name, "[anon:dalvik-")) {
                which_heap = HEAP_DALVIK_OTHER;
                if (base::StartsWith(name, "[anon:dalvik-LinearAlloc")) {
                    sub_heap = HEAP_DALVIK_OTHER_LINEARALLOC;
                } else if (base::StartsWith(name, "[anon:dalvik-alloc space") ||
                        base::StartsWith(name, "[anon:dalvik-main space")) {
                    // This is the regular Dalvik heap.
                    which_heap = HEAP_DALVIK;
                    sub_heap = HEAP_DALVIK_NORMAL;
                } else if (base::StartsWith(name,
                            "[anon:dalvik-large object space") ||
                        base::StartsWith(
                            name, "[anon:dalvik-free list large object space")) {
                    which_heap = HEAP_DALVIK;
                    sub_heap = HEAP_DALVIK_LARGE;
                } else if (base::StartsWith(name, "[anon:dalvik-non moving space")) {
                    which_heap = HEAP_DALVIK;
                    sub_heap = HEAP_DALVIK_NON_MOVING;
                } else if (base::StartsWith(name, "[anon:dalvik-zygote space")) {
                    which_heap = HEAP_DALVIK;
                    sub_heap = HEAP_DALVIK_ZYGOTE;
                } else if (base::StartsWith(name, "[anon:dalvik-indirect ref")) {
                    sub_heap = HEAP_DALVIK_OTHER_INDIRECT_REFERENCE_TABLE;
                } else if (base::StartsWith(name, "[anon:dalvik-jit-code-cache") ||
                        base::StartsWith(name, "[anon:dalvik-data-code-cache")) {
                    sub_heap = HEAP_DALVIK_OTHER_APP_CODE_CACHE;
                } else if (base::StartsWith(name, "[anon:dalvik-CompilerMetadata")) {
                    sub_heap = HEAP_DALVIK_OTHER_COMPILER_METADATA;
                } else {
                    sub_heap = HEAP_DALVIK_OTHER_ACCOUNTING;  // Default to accounting.
                }
            }
        } else if (namesz > 0) {
            which_heap = HEAP_UNKNOWN_MAP;
        } else if (vma.start == prev_end && prev_heap == HEAP_SO) {
            // bss section of a shared library
            which_heap = HEAP_SO;
        }

        prev_end = vma.end;
        prev_heap = which_heap;

        const meminfo::MemUsage& usage = vma.usage;
        if (usage.swap_pss > 0 && *foundSwapPss != true) {
            *foundSwapPss = true;
        }

        uint64_t swapable_pss = 0;
        if (is_swappable && (usage.pss > 0)) {
            float sharing_proportion = 0.0;
            if ((usage.shared_clean > 0) || (usage.shared_dirty > 0)) {
                sharing_proportion = (usage.pss - usage.uss) / (usage.shared_clean + usage.shared_dirty);
            }
            swapable_pss = (sharing_proportion * usage.shared_clean) + usage.private_clean;
        }

        stats[which_heap].pss += usage.pss;
        stats[which_heap].swappablePss += swapable_pss;
        stats[which_heap].rss += usage.rss;
        stats[which_heap].privateDirty += usage.private_dirty;
        stats[which_heap].sharedDirty += usage.shared_dirty;
        stats[which_heap].privateClean += usage.private_clean;
        stats[which_heap].sharedClean += usage.shared_clean;
        stats[which_heap].swappedOut += usage.swap;
        stats[which_heap].swappedOutPss += usage.swap_pss;
        if (which_heap == HEAP_DALVIK || which_heap == HEAP_DALVIK_OTHER ||
                which_heap == HEAP_DEX || which_heap == HEAP_ART) {
            stats[sub_heap].pss += usage.pss;
            stats[sub_heap].swappablePss += swapable_pss;
            stats[sub_heap].rss += usage.rss;
            stats[sub_heap].privateDirty += usage.private_dirty;
            stats[sub_heap].sharedDirty += usage.shared_dirty;
            stats[sub_heap].privateClean += usage.private_clean;
            stats[sub_heap].sharedClean += usage.shared_clean;
            stats[sub_heap].swappedOut += usage.swap;
            stats[sub_heap].swappedOutPss += usage.swap_pss;
        }
    };

    return meminfo::ForEachVmaFromFile(smaps_path, vma_scan);
}

```

## rk3588 memtrack

./system/memory/libmemtrack/memtrack.cpp

**HAL层接口**

./hardware/interfaces/memtrack/

```txt

hardware/interfaces/memtrack$ tree
.
├── 1.0
│   ├── Android.bp
│   ├── default
│   │   ├── Android.bp
│   │   ├── android.hardware.memtrack@1.0-service.rc
│   │   ├── Memtrack.cpp
│   │   ├── Memtrack.h
│   │   └── service.cpp
│   ├── IMemtrack.hal
│   ├── types.hal
│   └── vts
│       └── functional
│           ├── Android.bp
│           └── VtsHalMemtrackV1_0TargetTest.cpp
└── aidl
    ├── aidl_api
    │   └── android.hardware.memtrack
    │       ├── 1
    │       │   └── android
    │       │       └── hardware
    │       │           └── memtrack
    │       │               ├── DeviceInfo.aidl
    │       │               ├── IMemtrack.aidl
    │       │               ├── MemtrackRecord.aidl
    │       │               └── MemtrackType.aidl
    │       └── current
    │           └── android
    │               └── hardware
    │                   └── memtrack
    │                       ├── DeviceInfo.aidl
    │                       ├── IMemtrack.aidl
    │                       ├── MemtrackRecord.aidl
    │                       └── MemtrackType.aidl
    ├── android
    │   └── hardware
    │       └── memtrack
    │           ├── DeviceInfo.aidl
    │           ├── IMemtrack.aidl
    │           ├── MemtrackRecord.aidl
    │           └── MemtrackType.aidl
    ├── Android.bp
    ├── default
    │   ├── Android.bp
    │   ├── main.cpp
    │   ├── Memtrack.cpp
    │   ├── memtrack-default.rc
    │   ├── memtrack-default.xml
    │   └── Memtrack.h
    └── vts
        ├── Android.bp
        └── VtsHalMemtrackTargetTest.cpp

```

**RK的具体实现**

```txt

hardware/rockchip/libmemtrack$ tree
.
├── Android.mk
├── memtrack.cpp
├── memtrack.h
├── rk322x.cpp
├── rk3326.cpp
├── rk3399.cpp
└── rk_common.cpp

```

## Android 资源限制命令

```txt

rk3588_s:/ $ ulimit -a
-t: time(cpu-seconds)     unlimited
-f: file(blocks)          unlimited
-c: coredump(blocks)      0
-d: data(KiB)             unlimited
-s: stack(KiB)            8192
-l: lockedmem(KiB)        65536
-n: nofiles(descriptors)  32768
-p: processes             62250
-i: sigpending            62250
-q: msgqueue(bytes)       819200
-e: maxnice               40
-r: maxrtprio             0
-m: resident-set(KiB)     unlimited
-v: address-space(KiB)    unlimited
-x: filelocks             unlimited


rk3588_s:/ $ cat /proc/2613/limits
Limit                     Soft Limit           Hard Limit           Units     
Max cpu time              unlimited            unlimited            seconds   
Max file size             unlimited            unlimited            bytes     
Max data size             unlimited            unlimited            bytes     
Max stack size            8388608              unlimited            bytes     
Max core file size        0                    unlimited            bytes     
Max resident set          unlimited            unlimited            bytes     
Max processes             62250                62250                processes 
Max open files            32768                32768                files     // 表示可以在进程中打开文件的数量
Max locked memory         67108864             67108864             bytes     
Max address space         unlimited            unlimited            bytes     
Max file locks            unlimited            unlimited            locks     
Max pending signals       62250                62250                signals   
Max msgqueue size         819200               819200               bytes     
Max nice priority         40                   40                   
Max realtime priority     0                    0                    
Max realtime timeout      unlimited            unlimited            us

```

## App Java 内存限制

frameworks/native/build/tablet-10in-xhdpi-2048-dalvik-heap.mk

dalvik.vm.heapsize : 该参数设置VM所能使用的最大的heap的内存大小。即一个Android应用程序在开启largeHeap后，所能使用到的最大的VM的heap的大小，但不会超过该阈值

dalvik.vm.heapgrowthlimit : 该参数用来设置一个Java进程在默认情况下能使用的最大VM的heap的大小

```makefile

PRODUCT_VENDOR_PROPERTIES += \
    dalvik.vm.heapstartsize?=16m \
    dalvik.vm.heapgrowthlimit?=256m \
    dalvik.vm.heapsize?=768m \
    dalvik.vm.heaptargetutilization?=0.75 \
    dalvik.vm.heapminfree?=512k \
    dalvik.vm.heapmaxfree?=8m

```








