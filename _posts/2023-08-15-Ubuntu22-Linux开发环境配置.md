---
layout:     post
title:      Ubuntu22 Linux 开发环境配置
subtitle:   T113-S3
date:       2023-08-15
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - linux
---

[git.buildroot.org](https://git.buildroot.org/buildroot/tree/)

[全志哪吒D1开发板代码下载编译与调试(基于ubuntu22.04)](http://fuqiang1986.com/2022/07/22/%E5%85%A8%E5%BF%97%E5%93%AA%E5%90%92d1%E5%BC%80%E5%8F%91%E6%9D%BF%E4%BB%A3%E7%A0%81%E4%B8%8B%E8%BD%BD%E7%BC%96%E8%AF%91%E4%B8%8E%E8%B0%83%E8%AF%95/)

## 依赖安装

sudo apt install libncurses5-dev openssl libssl-dev build-essential pkg-config libc6-dev bison flex libelf-dev zlibc minizip libidn11-dev libidn11 qttools5-dev liblz4-tool

## 编译错误-1

```txt

make[4]: *** [Makefile:642: libfakeroot.lo] Error 1
make[4]: *** Waiting for unfinished jobs....
make[3]: *** [Makefile:660: all-recursive] Error 1
make[2]: *** [Makefile:434: all] Error 2
make[1]: *** [package/pkg-generic.mk:241: /home/lxg/code/linux/t133_linux/t113-linux-2023-0313/out/t113/evb1_auto/longan/buildroot/build/host-fakeroot-1.20.2/.stamp_built] Error 2
make: *** [Makefile:96: _all] Error 2
make: Leaving directory '/home/lxg/code/linux/t133_linux/t113-linux-2023-0313/buildroot/buildroot-201902'
ERROR: build buildroot Failed
INFO: mkbr failed

```

**解决办法**

1. 0003-libfakeroot.c-define-_stat_ver-if-not-already-define.patch 文件拷贝到 buildroot/buildroot-201902/package/fakeroot 目录下
2. rm -rf ./out/t113/evb1_auto/longan/buildroot/build/host-fakeroot-1.20.2/

```patch

From ca68c7336dea4a07cf5b77c1fdc9e9aee4984ca5 Mon Sep 17 00:00:00 2001
From: Ilya Lipnitskiy <ilya.lipnitskiy@gmail.com>
Date: Thu, 11 Feb 2021 20:59:25 -0800
Subject: [PATCH 1/3] libfakeroot.c: define _STAT_VER if not already defined

Signed-off-by: Ilya Lipnitskiy <ilya.lipnitskiy@gmail.com>
---
 libfakeroot.c | 10 ++++++++++
 1 file changed, 10 insertions(+)

diff --git a/libfakeroot.c b/libfakeroot.c
index 3e80e38..14cdbc4 100644
--- a/libfakeroot.c
+++ b/libfakeroot.c
@@ -90,6 +90,16 @@
 #define SEND_GET_XATTR64(a,b,c) send_get_xattr64(a,b)
 #endif
 
+#ifndef _STAT_VER
+ #if defined (__aarch64__)
+  #define _STAT_VER 0
+ #elif defined (__x86_64__)
+  #define _STAT_VER 1
+ #else
+  #define _STAT_VER 3
+ #endif
+#endif
+
 /*
    These INT_* (which stands for internal) macros should always be used when
    the fakeroot library owns the storage of the stat variable.
-- 
2.30.1

```

## 编译错误-2

```txt

c-stack.c:55:26: error: missing binary operator before token "("
   55 | #elif HAVE_LIBSIGSEGV && SIGSTKSZ < 16384
      |                          ^~~~~~~~
make[5]: *** [Makefile:1915: c-stack.o] Error 1
make[5]: *** Waiting for unfinished jobs....
make[4]: *** [Makefile:1674: all] Error 2
make[3]: *** [Makefile:1572: all-recursive] Error 1
make[2]: *** [Makefile:1528: all] Error 2
make[1]: *** [package/pkg-generic.mk:241: /home/lxg/code/linux/t133_linux/t113-linux-2023-0313/out/t113/evb1_auto/longan/buildroot/build/host-m4-1.4.18/.stamp_built] Error 2
make: *** [Makefile:96: _all] Error 2
make: Leaving directory '/home/lxg/code/linux/t133_linux/t113-linux-2023-0313/buildroot/buildroot-201902'
ERROR: build buildroot Failed
INFO: mkbr failed

```

**解决办法**

https://git.buildroot.org/buildroot/tree/package/m4/0003-c-stack-stop-using-SIGSTKSZ.patch?id=5a9504831f3fa1ef3be334036c93da30150fde55

接复制里面的patch的内容放入tools/m4/patch/目录

## 编译错误-3

```txt

gdbusmessage.c: In function 'g_dbus_message_to_blob':
gdbusmessage.c:2702:30: error: '%s' directive argument is null [-Werror=format-overflow=]
 2702 |       tupled_signature_str = g_strdup_printf ("(%s)", signature_str);
      |                              ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
cc1: some warnings being treated as errors
make[6]: *** [Makefile:3682: libgio_2_0_la-gdbusmessage.lo] Error 1
make[5]: *** [Makefile:4471: all-recursive] Error 1
make[4]: *** [Makefile:2049: all] Error 2
make[3]: *** [Makefile:1272: all-recursive] Error 1
make[2]: *** [Makefile:893: all] Error 2
make[1]: *** [package/pkg-generic.mk:241: /home/lxg/code/linux/t133_linux/t113-linux-2023-0313/out/t113/evb1_auto/longan/buildroot/build/host-libglib2-2.56.3/.stamp_built] Error 2
make: *** [Makefile:96: _all] Error 2
make: Leaving directory '/home/lxg/code/linux/t133_linux/t113-linux-2023-0313/buildroot/buildroot-201902'
ERROR: build buildroot Failed
INFO: mkbr failed

```

**解决方法**

./out/t113/evb1_auto/longan/buildroot/build/host-libglib2-2.56.3/gio/gdbusmessage.c

./out/t113/evb1_auto/longan/buildroot/build/host-libglib2-2.56.3/gio/gdbusauth.c

./out/t113/evb1_auto/longan/buildroot/build/libgpg-error-1.33/src/mkstrtable.awk

./out/t113/evb1_auto/longan/buildroot/build/libgpg-error-1.33/src/mkerrcodes2.awk

./out/t113/evb1_auto/longan/buildroot/build/libgpg-error-1.33/lang/cl/mkerrcodes.awk



## 编译报错-4

```txt

strerror-sym.c:45:13: warning: implicit declaration of function 'errnos_msgidxof'; did you mean 'msgidxof'? [-Wimplicit-function-declaration]
       idx = errnos_msgidxof (code);
             ^~~~~~~~~~~~~~~
             msgidxof
strerror-sym.c:47:9: error: 'errnos_msgstr' undeclared (first use in this function)
  return errnos_msgstr + errnos_msgidx[idx];
         ^~~~~~~~~~~~~
strerror-sym.c:47:9: note: each undeclared identifier is reported only once for each function it appears in
strerror-sym.c:47:25: error: 'errnos_msgidx' undeclared (first use in this function); did you mean 'errnos_msgstr'?
  return errnos_msgstr + errnos_msgidx[idx];
                         ^~~~~~~~~~~~~
                         errnos_msgstr
make[5]: *** [Makefile:1120: gpg_error-strerror-sym.o] Error 1
make[5]: *** Waiting for unfinished jobs....
good
cp gpg-error-config-old gpg-error-config
make[4]: *** [Makefile:648: all] Error 2
make[3]: *** [Makefile:508: all-recursive] Error 1
make[2]: *** [Makefile:440: all] Error 2
make[1]: *** [package/pkg-generic.mk:241: /home/lxg/code/linux/t133_linux/t113-linux-2023-0313/out/t113/evb1_auto/longan/buildroot/build/libgpg-error-1.33/.stamp_built] Error 2
make: *** [Makefile:96: _all] Error 2
make: Leaving directory '/home/lxg/code/linux/t133_linux/t113-linux-2023-0313/buildroot/buildroot-201902'
ERROR: build buildroot Failed
INFO: mkbr failed

```

./out/t113/evb1_auto/longan/buildroot/build/libgpg-error-1.33/src/errnos-sym.h

## 编译报错-5

```txt

controller-enumtypes.c:6:1: error: stray '\' in program
 \#include "gstinterpolationcontrolsource.h"
 ^
controller-enumtypes.c:6:2: error: stray '#' in program
 \#include "gstinterpolationcontrolsource.h"
  ^
controller-enumtypes.c:6:11: error: expected '=', ',', ';', 'asm' or '__attribute__' before string constant
 \#include "gstinterpolationcontrolsource.h"
           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
controller-enumtypes.c:7:1: error: stray '\' in program
 \#include "gstlfocontrolsource.h"
 ^
controller-enumtypes.c:7:2: error: stray '#' in program
 \#include "gstlfocontrolsource.h"
  ^
controller-enumtypes.c: In function 'gst_lfo_waveform_get_type':
controller-enumtypes.c:35:9: error: 'GST_LFO_WAVEFORM_SINE' undeclared (first use in this function); did you mean 'GST_TYPE_LFO_WAVEFORM'?
       { GST_LFO_WAVEFORM_SINE, "GST_LFO_WAVEFORM_SINE", "sine" },
         ^~~~~~~~~~~~~~~~~~~~~
         GST_TYPE_LFO_WAVEFORM
controller-enumtypes.c:35:9: note: each undeclared identifier is reported only once for each function it appears in
controller-enumtypes.c:36:9: error: 'GST_LFO_WAVEFORM_SQUARE' undeclared (first use in this function); did you mean 'GST_LFO_WAVEFORM_SINE'?
       { GST_LFO_WAVEFORM_SQUARE, "GST_LFO_WAVEFORM_SQUARE", "square" },
         ^~~~~~~~~~~~~~~~~~~~~~~
         GST_LFO_WAVEFORM_SINE
controller-enumtypes.c:37:9: error: 'GST_LFO_WAVEFORM_SAW' undeclared (first use in this function); did you mean 'GST_LFO_WAVEFORM_SINE'?
       { GST_LFO_WAVEFORM_SAW, "GST_LFO_WAVEFORM_SAW", "saw" },
         ^~~~~~~~~~~~~~~~~~~~
         GST_LFO_WAVEFORM_SINE
controller-enumtypes.c:38:9: error: 'GST_LFO_WAVEFORM_REVERSE_SAW' undeclared (first use in this function); did you mean 'GST_LFO_WAVEFORM_SAW'?
       { GST_LFO_WAVEFORM_REVERSE_SAW, "GST_LFO_WAVEFORM_REVERSE_SAW", "reverse-saw" },
         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~
         GST_LFO_WAVEFORM_SAW
controller-enumtypes.c:39:9: error: 'GST_LFO_WAVEFORM_TRIANGLE' undeclared (first use in this function); did you mean 'GST_LFO_WAVEFORM_SINE'?
       { GST_LFO_WAVEFORM_TRIANGLE, "GST_LFO_WAVEFORM_TRIANGLE", "triangle" },
         ^~~~~~~~~~~~~~~~~~~~~~~~~
         GST_LFO_WAVEFORM_SINE
make[7]: *** [Makefile:780: libgstcontroller_1.0_la-controller-enumtypes.lo] Error 1
make[7]: *** Waiting for unfinished jobs....
make[6]: *** [Makefile:608: all] Error 2
make[5]: *** [Makefile:549: all-recursive] Error 1
make[4]: *** [Makefile:544: all-recursive] Error 1
make[3]: *** [Makefile:761: all-recursive] Error 1
make[2]: *** [Makefile:667: all] Error 2
make[1]: *** [package/pkg-generic.mk:241: /home/lxg/code/linux/t133_linux/t113-linux-2023-0313/out/t113/evb1_auto/longan/buildroot/build/gstreamer1-1.14.4/.stamp_built] Error 2
make: *** [Makefile:96: _all] Error 2
make: Leaving directory '/home/lxg/code/linux/t133_linux/t113-linux-2023-0313/buildroot/buildroot-201902'
ERROR: build buildroot Failed
INFO: mkbr failed

```

./out/t113/evb1_auto/longan/buildroot/build/gstreamer1-1.14.4/libs/gst/controller/controller-enumtypes.c

**解决方案**

https://bugs.gentoo.org/attachment.cgi?id=615942&action=edit

https://gitlab.freedesktop.org/gstreamer/gstreamer/-/issues/515











