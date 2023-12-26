---
layout:     post
title:      Buildroot dhcpcd编译报错问题
subtitle:   T113
date:       2023-12-26
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - linux
---

## 编译报错日志

make[3]: *** ../: Is a directory.  Stop.

```txt

>>> dhcpcd 7.0.3 Building
PATH="/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/bin:/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games" /usr/bin/make  -C /home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/build/dhcpcd-7.0.3 all
for x in src hooks; do cd $x; /usr/bin/make all; cd ..; done

------------------------------------------------------------------------------------------------------

/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/bin/arm-linux-gnueabi-gcc -fPIC -DPIC  -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64 -DHAVE_CONFIG_H -DNDEBUG -D_GNU_SOURCE -D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -DINET -DARP -DARPING -DIPV4LL -DINET6 -DDHCP6 -DAUTH -DPLUGIN_DEV -I../../ -I../..//src   -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64  -Os   -std=c99 -I/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/bin/../arm-buildroot-linux-gnueabi/sysroot/usr/include  -c udev.c -o udev.So
/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/bin/arm-linux-gnueabi-gcc -Wl,-export-dynamic -shared -Wl,-x -o udev.so -Wl,-soname,udev.so \
	    udev.So -L/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/host/bin/../arm-buildroot-linux-gnueabi/sysroot/usr/lib -ludev 
make[3]: *** ../: Is a directory.  Stop.
>>> dhcpcd 7.0.3 Installing to target

------------------------------------------------------------------------------

# Move RDM monotonic to new location
if [ ! -e /home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/target/var/db/dhcpcd/rdm_monotonic -a \
	    -e /home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/target/var/db/dhcpcd/../dhcpcd-rdm.monotonic ]; \
	then \
		mv /home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/target/var/db/dhcpcd/../dhcpcd-rdm.monotonic \
			/home/lxg/code/t113_linux/out/t113/evb1_auto/longan/buildroot/target/var/db/dhcpcd/rdm_monotonic; \
	fi
make[3]: *** ../: Is a directory.  Stop.

```

## 调试方法

dhcpcd/Makefile

添加echo打印，辅助调试

```makefile

SUBDIRS=	src hooks

#######################

all: config.h
	@echo "---------start-------------"
	for x in ${SUBDIRS}; do cd $$x; ${MAKE} $@ || exit $$?; cd ..; done
	@echo "----------end--------------"

```

dhcpcd/hooks/Makefile

```makefile

TOP=		..
include ${TOP}/iconfig.mk

@echo "-----------11111111111-----------"

#######################

all:
        @echo "-----------hook start-----------"
	${PROG} ${MAN8} ${SCRIPTS} ${EGHOOKSCRIPTS}
	@echo "-----------hook end-------------"

```

编译输出发现11111111111未打印出来，说明此Makefile 文件编译报错，出错文件在iconfig.mk

dhcpcd/iconfig.mk

```makefile

# Nasty hack so that make clean works without configure being run
# Requires gmake4
TOP?=		.
_CONFIG_MK!=	test -e ${TOP}/config.mk && \
		    echo config.mk || echo config-null.mk
CONFIG_MK?=	${_CONFIG_MK}
include		${TOP}/${CONFIG_MK}

```

定位到CONFIG_MK变量为空，导致编译报错

## 编译验证方法

**方法1**

cd out/t113/evb1_auto/longan/buildroot/build/dhcpcd-7.0.3

make

**方法2**

rm -rf out/t113/evb1_auto/longan/buildroot/build/dhcpcd-7.0.3

./build.sh buildroot

## 修改方案

对比高版本的iconfig文件修改如下

```makefile

# Nasty hack so that make clean works without configure being run
TOP?=		.
_CONFIG_MK!=	test -e ${TOP}/config.mk && \
		    echo config.mk || echo config-null.mk
# add start
_CONFIG_MK?=	$(shell test -e ${TOP}/config.mk && \
		    echo config.mk || echo config-null.mk)
# add end

CONFIG_MK?=	${_CONFIG_MK}
include		${TOP}/${CONFIG_MK}

```

最终生成patch文件文件放入buildroot/buildroot-201902/package/dhcpcd/0001-iconfig-build-error.patch

```patch

diff --git a/iconfig.mk b/iconfig.mk
index 465e02ea..50c50340 100644
--- a/iconfig.mk
+++ b/iconfig.mk
@@ -1,7 +1,8 @@
 # Nasty hack so that make clean works without configure being run
-# Requires gmake4
 TOP?=		.
 _CONFIG_MK!=	test -e ${TOP}/config.mk && \
 		    echo config.mk || echo config-null.mk
+_CONFIG_MK?=	$(shell test -e ${TOP}/config.mk && \
+		    echo config.mk || echo config-null.mk)
 CONFIG_MK?=	${_CONFIG_MK}
 include		${TOP}/${CONFIG_MK}


```





