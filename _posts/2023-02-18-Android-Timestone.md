---
layout:     post
title:      Android Timestone
subtitle:   稳定性问题分析
date:       2023-02-18
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - Android
---

[介绍addr2line调试命令-Gityuan](http://gityuan.com/2017/09/02/addr2line/)

[调试系列2：bugreport实战篇-Gityuan](http://gityuan.com/2016/06/11/bugreport-2/)

## 问题描述

RK3288 android 7.1 偶现无法开机问题

## 抓取bugreport

adb bugreport .

```txt

bugreport-NHG47K-2023-02-17-17-56-54$ tree
.
├── bugreport-NHG47K-2023-02-17-17-56-54.txt
├── FS
│   ├── cache
│   │   └── recovery
│   │       ├── last_install
│   │       ├── last_kmsg
│   │       ├── last_kmsg.1
│   │       ├── last_kmsg.2
│   │       ├── last_kmsg.3
│   │       ├── last_kmsg.4
│   │       ├── last_kmsg.5
│   │       ├── last_kmsg.6
│   │       ├── last_kmsg.7
│   │       ├── last_locale
│   │       ├── last_log
│   │       ├── last_log.1
│   │       ├── last_log.2
│   │       ├── last_log.3
│   │       ├── last_log.4
│   │       ├── last_log.5
│   │       ├── last_log.6
│   │       └── last_log.7
│   ├── data
│   │   ├── misc
│   │   │   └── profiles
│   │   │       └── cur
│   │   │           └── 0
│   │   │               ├── android
│   │   │               │   └── primary.prof
│   │   │               ├── android.ext.services
│   │   │               │   └── primary.prof
│   │   │               ├── android.ext.shared
│   │   │               │   └── primary.prof
│   │   │               ├── com.android.backupconfirm
│   │   │               │   └── primary.prof
│   │   │               ├── com.android.bluetooth
│   │   │               │   └── primary.prof
│   │   │               ├── com.android.bluetoothmidiservice
│   │   │               │   └── primary.prof
│   │   │               ├── com.android.browser
│   │   │               │   └── primary.prof
│   │   │               ├── com.android.calculator2
│   │   │               │   └── primary.prof
│   │   └── tombstones
│   │       ├── tombstone_00
│   │       ├── tombstone_01
│   │       ├── tombstone_02
│   │       ├── tombstone_03
│   │       ├── tombstone_04
│   │       ├── tombstone_05
│   │       ├── tombstone_06
│   │       ├── tombstone_07
│   │       ├── tombstone_08
│   │       └── tombstone_09
│   └── proc
│       ├── 1
│       │   └── mountinfo
│       ├── 1253
│       │   └── mountinfo
│       ├── 1267
│       │   └── mountinfo
│       ├── 1305
│       │   └── mountinfo
│       ├── 1600
│       │   └── mountinfo
├── main_entry.txt
└── version.txt

107 directories, 130 files

```

## timestone 日志

```txt

Build fingerprint: 'WIF/rk3288/rk3288:7.1.2/NHG47K/20230217.135520:userdebug/release-keys'
Revision: '0'
ABI: 'arm'
pid: 1973, tid: 1973, name: main  >>> zygote <<<
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x10000000
    r0 10000000  r1 bec0b19c  r2 bec0b198  r3 00010000
    r4 a5eea200  r5 10000000  r6 000059af  r7 bec0b198
    r8 bec0b198  r9 000059b3  sl bec0b1a0  fp bec0b19c
    ip 00800000  sp bec0b178  lr a5b0642b  pc a5b09d0c  cpsr 200f0030
    d0  a59615a0a59612a0  d1  a5961a20a59618a0
    d2  7070f1f87070f177  d3  7070f2007070f170
    d4  7070f2087070f204  d5  7070f2107070f20c
    d6  7070f2187070f214  d7  7070f2207070f21c
    d8  0000000000000000  d9  0000000000000000
    d10 0000000000000000  d11 0000000000000000
    d12 0000000000000000  d13 0000000000000000
    d14 0000000000000000  d15 0000000000000000
    d16 a5eea208a5e61390  d17 bec0b173bec0b174
    d18 00310020006e0069  d19 002e0073006d0030
    d20 0000002400000000  d21 414000000000003d
    d22 0000000000000000  d23 0000000000000000
    d24 0000003f0000003f  d25 0000000000000000
    d26 0000000000000000  d27 0000000000000000
    d28 0000000000000000  d29 0000000000000000
    d30 0000000000000000  d31 0000000000000000
    scr 80000011

backtrace:
    #00 pc 0017bd0c  /system/lib/libart.so (_ZN3art6mirror6Object15VisitReferencesILb1ELNS_17VerifyObjectFlagsE0ELNS_17ReadBarrierOptionE0ENS_2gc9collector11MarkVisitorENS6_9MarkSweep29DelayReferenceReferentVisitorEEEvRKT2_RKT3_+7)
    #01 pc 00178427  /system/lib/libart.so (_ZN3art2gc9collector9MarkSweep16ProcessMarkStackEb+206)
    #02 pc 00177559  /system/lib/libart.so (_ZN3art2gc9collector9MarkSweep20MarkReachableObjectsEv+32)
    #03 pc 00176501  /system/lib/libart.so (_ZN3art2gc9collector9MarkSweep12MarkingPhaseEv+132)
    #04 pc 00176399  /system/lib/libart.so (_ZN3art2gc9collector9MarkSweep9RunPhasesEv+144)
    #05 pc 00171171  /system/lib/libart.so (_ZN3art2gc9collector16GarbageCollector3RunENS0_7GcCauseEb+244)
    #06 pc 0019470d  /system/lib/libart.so (_ZN3art2gc4Heap22CollectGarbageInternalENS0_9collector6GcTypeENS0_7GcCauseEb+2364)
    #07 pc 7388d5e7  /data/dalvik-cache/arm/system@framework@boot.oat (offset 0x27ae000)

```

## addr2line 解析

```txt

cd k3288_android_7.1/android/prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.9/bin

$ ./arm-linux-androideabi-addr2line -f -e ../../../../../../out/target/product/rk3288/symbols/system/lib/libart.so 0017bd0c
_ZNK3art6mirror15ObjectReferenceILb0ENS0_5ClassEE10UnCompressEv
/proc/self/cwd/art/runtime/mirror/object_reference.h:71

$ ./arm-linux-androideabi-addr2line -f -e ../../../../../../out/target/product/rk3288/symbols/system/lib/libart.so 0019470d
_ZN3art2gc4Heap22CollectGarbageInternalENS0_9collector6GcTypeENS0_7GcCauseEb
/proc/self/cwd/art/runtime/gc/heap.cc:2720 (discriminator 2)

ls data/dalvik-cache/arm/
system@framework@boot.art   system@framework@boot.oat

```

## oatdump

adb shell oatdump --oat-file=data/dalvik-cache/arm/system@framework@boot.oat

```txt

$ adb shell oatdump

No arguments specified
Usage: oatdump [options] ...
    Example: oatdump --image=$ANDROID_PRODUCT_OUT/system/framework/boot.art
    Example: adb shell oatdump --image=/system/framework/boot.art

  --oat-file=<file.oat>: specifies an input oat filename.
      Example: --oat-file=/system/framework/boot.oat

  --output=<file> may be used to send the output to a file.
      Example: --output=/tmp/oatdump.txt


  --addr2instr=<address>: output matching method disassembled code from relative
                          address (e.g. PC from crash dump)
      Example: --addr2instr=0x00001a3b

  ------------------------------------------------------------------------------------

```

**地址计算**

0x710e05e7 = 0x7388d5e7 - 0x27ae000 + 0x1000;

SEARCH ADDRESS (executable offset + input): 0x7388d5e7


```txt

adb shell oatdump --oat-file=data/dalvik-cache/arm/system@framework@boot.oat --addr2instr=0x710e05e7
MAGIC:
oat
088

LOCATION:
data/dalvik-cache/arm/system@framework@boot.oat

CHECKSUM:
0x998b33b2

INSTRUCTION SET:
Thumb2

INSTRUCTION SET FEATURES:
smp,div,atomic_ldrd_strd

DEX FILE COUNT:
14

EXECUTABLE OFFSET:
0x027ad000

INTERPRETER TO INTERPRETER BRIDGE OFFSET:
0x00000000

INTERPRETER TO COMPILED CODE BRIDGE OFFSET:
0x00000000

JNI DLSYM LOOKUP OFFSET:
0x027ad001

QUICK GENERIC JNI TRAMPOLINE OFFSET:
0x027ad011

QUICK IMT CONFLICT TRAMPOLINE OFFSET:
0x027ad019

QUICK RESOLUTION TRAMPOLINE OFFSET:
0x027ad021

QUICK TO INTERPRETER BRIDGE OFFSET:
0x027ad029

IMAGE PATCH DELTA:
0 (0x00000000)

IMAGE FILE LOCATION OAT CHECKSUM:
0x00000000

IMAGE FILE LOCATION OAT BEGIN:
0x00000000

KEY VALUE STORE:
compiler-filter = speed
debuggable = true
dex2oat-cmdline = --image=/data/dalvik-cache/arm/system@framework@boot.art --dex-file=/system/framework/core-oj.jar --dex-file=/system/framework/core-libart.jar --dex-file=/system/framework/conscrypt.jar --dex-file=/system/f
ramework/okhttp.jar --dex-file=/system/framework/core-junit.jar --dex-file=/system/framework/bouncycastle.jar --dex-file=/system/framework/ext.jar --dex-file=/system/framework/framework.jar --dex-file=/system/framework/telep
hony-common.jar --dex-file=/system/framework/voip-common.jar --dex-file=/system/framework/ims-common.jar --dex-file=/system/framework/apache-xml.jar --dex-file=/system/framework/org.apache.http.legacy.boot.jar --oat-file=/da
ta/dalvik-cache/arm/system@framework@boot.oat --instruction-set=arm --instruction-set-features=smp,div,atomic_ldrd_strd --base=0x6fc27000 --runtime-arg -Xms64m --runtime-arg -Xmx64m --image-classes=/system/etc/preloaded-clas
ses --compiled-classes=/system/etc/compiled-classes --instruction-set-variant=cortex-a15 --instruction-set-features=default
dex2oat-host = Arm
has-patch-info = false
native-debuggable = false
pic = false

SIZE:
62242364

SEARCH ADDRESS (executable offset + input):
0x7388d5e7

OatDexFile:
location: /system/framework/core-oj.jar
checksum: 0xb4a880b3
dex-file: 0x000007a0..0x003d62cb
type-table: 0x01d9b494..0x01da3493


```

**分析到此处，依然陷入的困境**












