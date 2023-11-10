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

## 问题描述

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

## 源码位置

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

## dumpsys meminfo

```txt

rk3588_s:/ $ dumpsys meminfo com.rockchip.*
Applications Memory Usage (in Kilobytes):
Uptime: 211653 Realtime: 211653

** MEMINFO in pid 1941 [com.rockchip.gpadc.yolodemo] **
                   Pss  Private  Private     Swap      Rss     Heap     Heap     Heap
                 Total    Dirty    Clean    Dirty    Total     Size    Alloc     Free
                ------   ------   ------   ------   ------   ------   ------   ------
  Native Heap    59046    58528        0        0    61088    75984    62982     2323
  Dalvik Heap     7768     6132        0        0    14360     4153     2077     2076
 Dalvik Other     1073      820        0        0     2372                           
        Stack      440      440        0        0      448                           
       Ashmem       20        0        0        0      536                           
    Other dev   451176   256956   194220        0   451464                           
     .so mmap    22061      204    10856        0    49120                           
    .jar mmap     1141        0        0        0    23468                           
    .apk mmap    12299      676    11360        0    14072                           
    .ttf mmap       63        0        4        0      196                           
    .dex mmap     8402        4     8360        0     8848                           
    .oat mmap     3319        0      320        0    11640                           
    .art mmap     3392      528        0        0    14816                           
   Other mmap      151        4       72        0      868                           
      Unknown     1764     1672        0        0     2220                           
        TOTAL   572115   325964   225192        0   655516    80137    65059     4399
 
 App Summary
                       Pss(KB)                        Rss(KB)
                        ------                         ------
           Java Heap:     6660                          29176
         Native Heap:    58528                          61088
                Code:    31800                         107396
               Stack:      440                            448
            Graphics:        0                              0
       Private Other:   453728
              System:    20959
             Unknown:                                  457408
 
           TOTAL PSS:   572115            TOTAL RSS:   655516      TOTAL SWAP (KB):        0
 
 Objects
               Views:        7         ViewRootImpl:        1
         AppContexts:        6           Activities:        2
              Assets:        8        AssetManagers:        0
       Local Binders:       10        Proxy Binders:       34
       Parcel memory:        4         Parcel count:       17
    Death Recipients:        0      OpenSSL Sockets:        0
            WebViews:        0
 
 SQL
         MEMORY_USED:        0
  PAGECACHE_OVERFLOW:        0          MALLOC_SIZE:        0

```






