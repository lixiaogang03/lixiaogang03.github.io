---
layout:     post
title:      Android Linux Shell
subtitle:   system/bin  system/xbin
date:       2019-06-20
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - linux
    - shell
    - android
---


## toybox 

external/toybox/[Android.mk](http://androidxref.com/9.0.0_r3/xref/external/toybox/Android.mk)

### toybox --help

```txt
usage: toybox [--long | --version | [command] [arguments...]]

With no arguments, shows available commands. First argument is
name of a command to run, followed by any arguments to that command.

--long	Show path to each command
--version	Show toybox version

To install command symlinks, try:
  for i in $(/bin/toybox --long); do ln -s /bin/toybox $i; done
```

### toybox

```txt
acpi base64 basename blkid blockdev bunzip2 bzcat cal cat chattr chcon
chgrp chmod chown chroot cksum clear cmp comm cp cpio cut date dd
df dirname dmesg dos2unix du echo egrep env expand expr fallocate
false fgrep find flock free freeramdisk fsfreeze getenforce getprop
grep groups head help hostname hwclock id ifconfig inotifyd insmod
install ionice iorenice kill killall ln load_policy logname losetup
ls lsattr lsmod lsof lsusb makedevs md5sum mkdir mkfifo mknod mkswap
mktemp modinfo more mount mountpoint mv nbd-client nc netcat netstat
nice nl nohup od partprobe paste patch pgrep pidof pivot_root pkill
pmap printenv printf ps pwd pwdx readlink realpath renice restorecon
rev rfkill rm rmdir rmmod route runcon sed seq setenforce setprop
setsid sha1sum sleep sort split stat strings swapoff swapon switch_root
sync sysctl tac tail tar taskset tee time timeout top touch tr traceroute
traceroute6 true truncate tty ulimit umount uname uniq unix2dos uptime
usleep vconfig vmstat wc which whoami xargs xxd yes
```

## android M userdebug

### adb shell "ls -al /system/bin/"

```txt
-rwxr-xr-x root     shell       31332 2019-04-28 12:11 6620_launcher
-rwxr-xr-x root     shell       18092 2019-04-28 12:11 6620_wmt_concurrency
-rwxr-xr-x root     shell       17992 2019-04-28 12:11 6620_wmt_lpbk
-rwxr-xr-x root     shell       79512 2019-04-28 12:11 AcdApiDaemon
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 MATest
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 MtkCodecService
lrwxr-xr-x root     shell             2019-04-28 12:11 acpi -> toybox
-rwxr-xr-x root     shell       25868 2019-04-28 12:11 aee
-rwxr-xr-x root     shell       17676 2019-04-28 12:11 aee_archive
-rwxr-xr-x root     shell       21968 2019-04-28 12:11 aee_core_forwarder
-rwxr-xr-x root     shell       38232 2019-04-28 12:11 aee_dumpstate
-rwxr-xr-x root     shell       54952 2019-04-28 12:11 akmd09911
-rwxr-xr-x root     shell       46876 2019-04-28 12:11 akmd8963
-rwxr-xr-x root     shell       38692 2019-04-28 12:11 akmd8975
-rwxr-xr-x root     shell         210 2019-04-28 12:11 am
-rwxr-xr-x root     shell       38552 2019-04-28 12:11 ami304d
lrwxr-xr-x root     shell             2019-04-28 12:11 app_process -> app_process32
-rwxr-xr-x root     shell       22144 2019-04-28 12:11 app_process32
-rwxr-xr-x root     shell       66248 2019-04-28 12:11 applypatch
-rwxr-xr-x root     shell       26248 2019-04-28 12:11 applysig
-rwxr-xr-x root     shell         213 2019-04-28 12:11 appops
-rwxr-xr-x root     shell         215 2019-04-28 12:11 appwidget
-rwxr-xr-x root     shell       53292 2019-04-28 12:11 atci_service
-rwxr-xr-x root     shell       50536 2019-04-28 12:11 atcid
-rwxr-xr-x root     shell       30488 2019-04-28 12:11 atrace
-rwxr-xr-x root     shell       71428 2019-04-28 12:11 audiocmdservice_atci
-rwxr-xr-x root     shell       22512 2019-04-28 12:11 autobt
-rwxr-xr-x root     shell       30272 2019-04-28 12:11 autokd
-rwxr-xr-x root     shell       30332 2019-04-28 12:11 badblocks
lrwxr-xr-x root     shell             2019-04-28 12:11 basename -> toybox
-rwxr-xr-x root     shell       17992 2019-04-28 12:11 batterywarning
-rwxr-xr-x root     shell       42612 2019-04-28 12:11 bcc
-rwxr-xr-x root     shell       18056 2019-04-28 12:11 blkid
lrwxr-xr-x root     shell             2019-04-28 12:11 blockdev -> toybox
-rwxr-xr-x root     shell         199 2019-04-28 12:11 bmgr
-rwxr-xr-x root     shell       72296 2019-04-28 12:11 bmm050d
-rwxr-xr-x root     shell       17996 2019-04-28 12:11 boot_logo_updater
-rwxr-xr-x root     shell       46864 2019-04-28 12:11 bootanimation
-rwxr-xr-x root     shell         156 2019-04-28 12:11 bu
-rwxr-xr-x root     shell       13892 2019-04-28 12:11 bugreport
lrwxr-xr-x root     shell             2019-04-28 12:11 bzcat -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 cal -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 cat -> toybox
-rwxr-xr-x root     shell       96984 2019-04-28 12:11 ccci_fsd
-rwxr-xr-x root     shell       76492 2019-04-28 12:11 ccci_mdinit
lrwxr-xr-x root     shell             2019-04-28 12:11 chcon -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 chgrp -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 chmod -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 chown -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 chroot -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 cksum -> toybox
-rwxr-xr-x root     shell       46864 2019-04-28 12:11 clatd
lrwxr-xr-x root     shell             2019-04-28 12:11 clear -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 cmp -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 comm -> toybox
-rwxr-xr-x root     shell         207 2019-04-28 12:11 content
lrwxr-xr-x root     shell             2019-04-28 12:11 cp -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 cpio -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 cut -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 dalvikvm -> dalvikvm32
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 dalvikvm32
lrwxr-xr-x root     shell             2019-04-28 12:11 date -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 dd -> toolbox
-rwxr-xr-x root     shell      406204 2019-04-28 12:11 debuggerd
-rwxr-xr-x root     shell      112248 2019-04-28 12:11 dex2oat
lrwxr-xr-x root     shell             2019-04-28 12:11 df -> toolbox
-rwxr-xr-x root     shell      124832 2019-04-28 12:11 dhcp6c
-rwxr-xr-x root     shell       22084 2019-04-28 12:11 dhcp6ctl
-rwxr-xr-x root     shell      116448 2019-04-28 12:11 dhcp6s
-rwxr-xr-x root     shell       75472 2019-04-28 12:11 dhcpcd
-rwxr-xr-x root     shell       13892 2019-04-28 12:11 dhcptool
lrwxr-xr-x root     shell             2019-04-28 12:11 dirname -> toybox
-rwxr-xr-x root     shell       59060 2019-04-28 12:11 dm_agent_binder
lrwxr-xr-x root     shell             2019-04-28 12:11 dmesg -> toybox
-rwxr-xr-x root     shell       13888 2019-04-28 12:11 dmlog
-rwxr-xr-x root     shell      122488 2019-04-28 12:11 dnsmasq
lrwxr-xr-x root     shell             2019-04-28 12:11 dos2unix -> toybox
-rwxr-xr-x root     shell      227304 2019-04-28 12:11 downloader
-rwxr-xr-x root     shell         156 2019-04-28 12:11 dpm
-rwxr-xr-x root     shell       71292 2019-04-28 12:11 drmserver
lrwxr-xr-x root     shell             2019-04-28 12:11 du -> toolbox
-rwxr-xr-x root     shell       54932 2019-04-28 12:11 dumpstate
-rwxr-xr-x root     shell       18040 2019-04-28 12:11 dumpsys
-rwxr-xr-x root     shell      163020 2019-04-28 12:11 e2fsck
lrwxr-xr-x root     shell             2019-04-28 12:11 echo -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 egrep -> grep
-rwxr-xr-x root     shell       59472 2019-04-28 12:11 em_svr
-rwxr-xr-x root     shell      170168 2019-04-28 12:11 emdlogger1
lrwxr-xr-x root     shell             2019-04-28 12:11 env -> toybox
-rwxr-xr-x root     shell      141148 2019-04-28 12:11 epdg_wod
lrwxr-xr-x root     shell             2019-04-28 12:11 expand -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 expr -> toybox
-rwxr-xr-x root     shell      317164 2019-04-28 12:11 factory
lrwxr-xr-x root     shell             2019-04-28 12:11 fallocate -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 false -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 fgrep -> grep
lrwxr-xr-x root     shell             2019-04-28 12:11 find -> toybox
-rwxr-xr-x root     shell       21912 2019-04-28 12:11 fotabinder
lrwxr-xr-x root     shell             2019-04-28 12:11 free -> toybox
-rwxr-xr-x root     shell       54944 2019-04-28 12:11 fsck.f2fs
-rwxr-xr-x root     shell       46660 2019-04-28 12:11 fsck_msdos
-rwxr-xr-x root     shell       59016 2019-04-28 12:11 fsck_msdos_mtk
-rwxr-xr-x root     shell       13952 2019-04-28 12:11 fuelgauged
-rwxr-xr-x root     shell       13888 2019-04-28 12:11 gas_srv
-rwxr-xr-x root     shell       42620 2019-04-28 12:11 gatekeeperd
-rwxr-xr-x root     shell      397672 2019-04-28 12:11 gdbserver
-rwxr-xr-x root     shell       30736 2019-04-28 12:11 geomagneticd
lrwxr-xr-x root     shell             2019-04-28 12:11 getenforce -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 getevent -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 getprop -> toybox
-rwxr-xr-x root     shell       27036 2019-04-28 12:11 grep
lrwxr-xr-x root     shell             2019-04-28 12:11 groups -> toybox
-rwxr-xr-x root     shell       80004 2019-04-28 12:11 gsm0710muxd
-rwxr-xr-x root     shell       80008 2019-04-28 12:11 gsm0710muxdmd2
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 guiext-server
-rwxr-xr-x root     shell       17984 2019-04-28 12:11 gzip
-rwxr-xr-x root     shell      247792 2019-04-28 12:11 gzip_static
lrwxr-xr-x root     shell             2019-04-28 12:11 head -> toybox
-rwxr-xr-x root     shell         213 2019-04-28 12:11 hid
-rwxr-xr-x root     shell      396568 2019-04-28 12:11 hostapd
-rwxr-xr-x root     shell       38532 2019-04-28 12:11 hostapd_cli
lrwxr-xr-x root     shell             2019-04-28 12:11 hostname -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 hwclock -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 id -> toybox
-rwxr-xr-x root     shell       30272 2019-04-28 12:11 idmap
lrwxr-xr-x root     shell             2019-04-28 12:11 ifconfig -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 iftop -> toolbox
-rwxr-xr-x root     shell         194 2019-04-28 12:11 ime
lrwxr-xr-x root     shell             2019-04-28 12:11 inotifyd -> toybox
-rwxr-xr-x root     shell         203 2019-04-28 12:11 input
lrwxr-xr-x root     shell             2019-04-28 12:11 insmod -> toybox
-rwxr-x--- root     root         1405 2019-04-28 12:11 install-recovery.sh
-rwxr-xr-x root     shell       63392 2019-04-28 12:11 installd
lrwxr-xr-x root     shell             2019-04-28 12:11 ioctl -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 ionice -> toolbox
-rwxr-xr-x root     shell      173948 2019-04-28 12:11 ip
-rwxr-xr-x root     shell      241492 2019-04-28 12:11 ip6tables
-rwxr-xr-x root     shell       42716 2019-04-28 12:11 ipod
-rwxr-xr-x root     shell      237232 2019-04-28 12:11 iptables
-rwxr-xr-x root     shell       71472 2019-04-28 12:11 keystore
-rwxr-xr-x root     shell       18048 2019-04-28 12:11 keystore_cli
lrwxr-xr-x root     shell             2019-04-28 12:11 kill -> toybox
-rwxr-xr-x root     shell       26264 2019-04-28 12:11 kpoc_charger
-rwxr-xr-x root     shell       17992 2019-04-28 12:11 lcdc_screen_cap
-rwxr-xr-x root     shell      526244 2019-04-28 12:11 ld.mc
-rwxr-xr-x root     shell      193872 2019-04-28 12:11 linker
-rwxr-xr-x root     shell       22136 2019-04-28 12:11 lmkd
lrwxr-xr-x root     shell             2019-04-28 12:11 ln -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 load_policy -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 log -> toolbox
-rwxr-xr-x root     shell       30328 2019-04-28 12:11 logcat
-rwxr-xr-x root     shell       50860 2019-04-28 12:11 logd
lrwxr-xr-x root     shell             2019-04-28 12:11 logname -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 logpersist.cat -> logpersist.start
-rwxr-xr-x root     shell         898 2019-04-28 12:11 logpersist.start
lrwxr-xr-x root     shell             2019-04-28 12:11 logpersist.stop -> logpersist.start
-rwxr-xr-x root     shell       22160 2019-04-28 12:11 logwrapper
lrwxr-xr-x root     shell             2019-04-28 12:11 losetup -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 ls -> toolbox
-rwxr-xr-x root     shell       38568 2019-04-28 12:11 lsm303md
lrwxr-xr-x root     shell             2019-04-28 12:11 lsmod -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 lsof -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 lsusb -> toybox
-rwxr-xr-x root     shell       38568 2019-04-28 12:11 magd
-rwxr-xr-x root     shell       18044 2019-04-28 12:11 make_ext4fs
-rwxr-xr-x root     shell       30436 2019-04-28 12:11 make_f2fs
-rwxr-xr-x root     shell       13888 2019-04-28 12:11 matv
-rwxr-xr-x root     shell       39016 2019-04-28 12:11 mc6420d
lrwxr-xr-x root     shell             2019-04-28 12:11 md5sum -> toybox
-rwxr-xr-x root     shell       17984 2019-04-28 12:11 md_ctrl
-rwxr-xr-x root     shell      137484 2019-04-28 12:11 mdlogger
-rwxr-xr-x root     shell      518240 2019-04-28 12:11 mdnsd
-rwxr-xr-x root     shell         210 2019-04-28 12:11 media
-rwxr-xr-x root     shell       26236 2019-04-28 12:11 mediaserver
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 memorydumper
-rwxr-xr-x root     shell       34632 2019-04-28 12:11 memsicd
-rwxr-xr-x root     shell       34640 2019-04-28 12:11 memsicd3416x
-rwxr-xr-x root     shell      400924 2019-04-28 12:11 meta_tst
lrwxr-xr-x root     shell             2019-04-28 12:11 mkdir -> toybox
-rwxr-xr-x root     shell       59052 2019-04-28 12:11 mke2fs
lrwxr-xr-x root     shell             2019-04-28 12:11 mknod -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 mkswap -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 mktemp -> toybox
-rwxr-xr-x root     shell       26224 2019-04-28 12:11 mmp
-rwxr-xr-x root     shell       64056 2019-04-28 12:11 mobile_log_d
lrwxr-xr-x root     shell             2019-04-28 12:11 modinfo -> toybox
-rwxr-xr-x root     shell         217 2019-04-28 12:11 monkey
lrwxr-xr-x root     shell             2019-04-28 12:11 more -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 mount -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 mountpoint -> toybox
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 msensord
-rwxr-xr-x root     shell     1443480 2019-04-28 12:11 mtk_agpsd
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 mtkradiooptions
-rwxr-xr-x root     shell       22176 2019-04-28 12:11 mtkrild
-rwxr-xr-x root     shell       22180 2019-04-28 12:11 mtkrildmd2
-rwxr-xr-x root     shell       26336 2019-04-28 12:11 mtpd
-rwxr-xr-x root     shell       26700 2019-04-28 12:11 muxreport
lrwxr-xr-x root     shell             2019-04-28 12:11 mv -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 nandread -> toolbox
-rwxr-xr-x root     shell       17980 2019-04-28 12:11 ndc
-rwxr-xr-x root     shell      165816 2019-04-28 12:11 netd
-rwxr-xr-x root     shell       46768 2019-04-28 12:11 netdiag
lrwxr-xr-x root     shell             2019-04-28 12:11 netstat -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 newfs_msdos -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 nice -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 nl -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 nohup -> toybox
-rwxr-xr-x root     shell       30340 2019-04-28 12:11 nvram_agent_binder
-rwxr-xr-x root     shell       22296 2019-04-28 12:11 nvram_daemon
-rwxr-xr-x root     shell      140996 2019-04-28 12:11 oatdump
lrwxr-xr-x root     shell             2019-04-28 12:11 od -> toybox
-rwxr-xr-x root     shell       23200 2019-04-28 12:11 orientationd
lrwxr-xr-x root     shell             2019-04-28 12:11 paste -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 patch -> toybox
-rwxr-xr-x root     shell       67140 2019-04-28 12:11 patchoat
-rwxr-xr-x root     shell       17996 2019-04-28 12:11 perf_native_test
lrwxr-xr-x root     shell             2019-04-28 12:11 pgrep -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 pidof -> toybox
-rwxr-xr-x root     shell       38720 2019-04-28 12:11 ping
-rwxr-xr-x root     shell       38984 2019-04-28 12:11 ping6
lrwxr-xr-x root     shell             2019-04-28 12:11 pkill -> toybox
-rwxr-xr-x root     shell         191 2019-04-28 12:11 pm
lrwxr-xr-x root     shell             2019-04-28 12:11 pmap -> toybox
-rwxr-xr-x root     shell       26264 2019-04-28 12:11 pngtest
-rwxr-xr-x root     shell       30332 2019-04-28 12:11 ppl_agent
-rwxr-xr-x root     shell      168232 2019-04-28 12:11 pppd
-rwxr-xr-x root     shell      168232 2019-04-28 12:11 pppd_dt
-rwxr-xr-x root     shell       13884 2019-04-28 12:11 pq
lrwxr-xr-x root     shell             2019-04-28 12:11 printenv -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 printf -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 prlimit -> toolbox
-rwxr-xr-x root     shell       34512 2019-04-28 12:11 program_binary_service
lrwxr-xr-x root     shell             2019-04-28 12:11 ps -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 pwd -> toybox
-rwxr-xr-x root     shell       13884 2019-04-28 12:11 r
-rwxr-xr-x root     shell      171196 2019-04-28 12:11 racoon
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 radiooptions
-rwxr-xr-x root     shell       64044 2019-04-28 12:11 radvd
lrwxr-xr-x root     shell             2019-04-28 12:11 readlink -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 realpath -> toybox
-rwxr-xr-x root     shell       13888 2019-04-28 12:11 reboot
lrwxr-xr-x root     shell             2019-04-28 12:11 renice -> toolbox
-rwxr-xr-x root     shell         188 2019-04-28 12:11 requestsync
-rwxr-xr-x root     shell       50756 2019-04-28 12:11 resize2fs
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 resize_ext4
lrwxr-xr-x root     shell             2019-04-28 12:11 restorecon -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 rm -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 rmdir -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 rmmod -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 route -> toybox
-rwxr-xr-x root     shell       13580 2019-04-28 12:11 rtt
-rwxr-x--- root     shell       17984 2019-04-28 12:11 run-as
lrwxr-xr-x root     shell             2019-04-28 12:11 runcon -> toybox
-rwxr-xr-x root     shell       34440 2019-04-28 12:11 s62xd
-rwxr-xr-x root     shell       13892 2019-04-28 12:11 schedtest
-rwxr-xr-x root     shell       18044 2019-04-28 12:11 screencap
-rwxr-xr-x root     shell      104152 2019-04-28 12:11 screenrecord
-rwxr-xr-x root     shell       30272 2019-04-28 12:11 sdcard
lrwxr-xr-x root     shell             2019-04-28 12:11 sed -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 sendevent -> toolbox
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 sensorservice
lrwxr-xr-x root     shell             2019-04-28 12:11 seq -> toybox
-rwxr-xr-x root     shell       22136 2019-04-28 12:11 service
-rwxr-xr-x root     shell       18096 2019-04-28 12:11 servicemanager
lrwxr-xr-x root     shell             2019-04-28 12:11 setenforce -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 setprop -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 setsid -> toybox
-rwxr-xr-x root     shell         178 2019-04-28 12:11 settings
-rwxr-xr-x root     shell      112308 2019-04-28 12:11 sgdisk
-rwxr-xr-x root     shell      170012 2019-04-28 12:11 sh
lrwxr-xr-x root     shell             2019-04-28 12:11 sha1sum -> toybox
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 showlease
-rwxr-xr-x root     shell       30328 2019-04-28 12:11 sink
lrwxr-xr-x root     shell             2019-04-28 12:11 sleep -> toybox
-rwxr-xr-x root     shell      128708 2019-04-28 12:11 slpd
-rwxr-xr-x root     shell         190 2019-04-28 12:11 sm
-rwxr-xr-x root     shell       17980 2019-04-28 12:11 sn
lrwxr-xr-x root     shell             2019-04-28 12:11 sort -> toybox
-rwxr-xr-x root     shell       26232 2019-04-28 12:11 source
lrwxr-xr-x root     shell             2019-04-28 12:11 split -> toybox
-rwxr-xr-x root     shell       13944 2019-04-28 12:11 spm_loader
lrwxr-xr-x root     shell             2019-04-28 12:11 start -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 stat -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 stop -> toolbox
-rwxr-xr-x root     shell       30324 2019-04-28 12:11 stp_dump3
lrwxr-xr-x root     shell             2019-04-28 12:11 strings -> toybox
-rwxr-xr-x root     shell       42624 2019-04-28 12:11 superumount
-rwxr-xr-x root     shell       17996 2019-04-28 12:11 surfaceflinger
-rwxr-xr-x root     shell         192 2019-04-28 12:11 svc
lrwxr-xr-x root     shell             2019-04-28 12:11 swapoff -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 swapon -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 sync -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 sysctl -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 tac -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 tail -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 tar -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 taskset -> toybox
-rwxr-xr-x root     shell       79696 2019-04-28 12:11 tc
lrwxr-xr-x root     shell             2019-04-28 12:11 tee -> toybox
-rwxr-xr-x root     shell         172 2019-04-28 12:11 telecom
-rwxr-xr-x root     shell       13892 2019-04-28 12:11 terservice
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 tertestclient
-rwxr-xr-x root     shell       31312 2019-04-28 12:11 thermal
-rwxr-xr-x root     shell       18152 2019-04-28 12:11 thermal_manager
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 thermald
lrwxr-xr-x root     shell             2019-04-28 12:11 time -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 timeout -> toybox
-rwxr-xr-x root     shell       13892 2019-04-28 12:11 tiny_mkswap
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 tiny_swapoff
-rwxr-xr-x root     shell       13892 2019-04-28 12:11 tiny_swapon
-rwxr-xr-x root     shell       97332 2019-04-28 12:11 toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 top -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 touch -> toybox
-rwxr-xr-x root     shell      254352 2019-04-28 12:11 toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 tr -> toybox
-rwxr-xr-x root     shell       18052 2019-04-28 12:11 tracepath
-rwxr-xr-x root     shell       18052 2019-04-28 12:11 tracepath6
-rwxr-xr-x root     shell       22172 2019-04-28 12:11 traceroute6
lrwxr-xr-x root     shell             2019-04-28 12:11 true -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 truncate -> toybox
-rwxr-xr-x root     shell       46744 2019-04-28 12:11 tune2fs
-rwxr-xr-x root     shell       22084 2019-04-28 12:11 tzdatacheck
-rwxr-xr-x root     shell        3814 2019-04-28 12:11 uiautomator
lrwxr-xr-x root     shell             2019-04-28 12:11 umount -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 uname -> toybox
-rwxr-x--- root     root        38816 2019-04-28 12:11 uncrypt
lrwxr-xr-x root     shell             2019-04-28 12:11 uniq -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 unix2dos -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 uptime -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 usleep -> toybox
-rwxr-xr-x root     shell       17980 2019-04-28 12:11 vdc
lrwxr-xr-x root     shell             2019-04-28 12:11 vmstat -> toybox
-rwxr-xr-x root     shell      387128 2019-04-28 12:11 vold
-rwxr-xr-x root     shell       13896 2019-04-28 12:11 vtservice
lrwxr-xr-x root     shell             2019-04-28 12:11 watchprops -> toolbox
lrwxr-xr-x root     shell             2019-04-28 12:11 wc -> toybox
-rwxr-xr-x root     shell       36748 2019-04-28 12:11 wfd
lrwxr-xr-x root     shell             2019-04-28 12:11 which -> toybox
lrwxr-xr-x root     shell             2019-04-28 12:11 whoami -> toybox
-rwxr-xr-x root     shell       22084 2019-04-28 12:11 wifi2agps
-rwxr-xr-x root     shell         190 2019-04-28 12:11 wm
-rwxr-xr-x root     shell       18040 2019-04-28 12:11 wmt_loader
-rwxr-xr-x root     shell       80404 2019-04-28 12:11 wpa_cli
-rwxr-xr-x root     shell     1125680 2019-04-28 12:11 wpa_supplicant
lrwxr-xr-x root     shell             2019-04-28 12:11 xargs -> toybox
-rwxr-xr-x root     shell       22080 2019-04-28 12:11 xlog
lrwxr-xr-x root     shell             2019-04-28 12:11 yes -> toybox
```

### adb shell "ls -al /system/xbin/"

```txt
-rwxr-xr-x root     shell       26228 2019-04-28 12:11 BGW
-rwxr-xr-x root     shell      182224 2019-04-28 12:11 add-property-tag
-rwxr-xr-x root     shell      194560 2019-04-28 12:11 check-lost+found
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 cpustats
-rwxr-xr-x root     shell       68240 2019-04-28 12:11 dexdump
-rwxr-xr-x root     shell      769832 2019-04-28 12:11 fio
-rwxr-xr-x root     shell       17984 2019-04-28 12:11 ksminfo
-rwxr-xr-x root     shell       18052 2019-04-28 12:11 latencytop
-rwsr-sr-x root     root        18272 2019-04-28 12:11 librank
-rwxr-xr-x root     shell      126704 2019-04-28 12:11 ltrace
-rwxr-xr-x root     shell       34624 2019-04-28 12:11 micro_bench
-rwxr-xr-x root     shell      194692 2019-04-28 12:11 micro_bench_static
-rwxr-xr-x root     shell       92972 2019-04-28 12:11 mnld
-rwxr-xr-x root     shell      108220 2019-04-28 12:11 perfprofd
-rwsr-sr-x root     root        17984 2019-04-28 12:11 procmem
-rwsr-sr-x root     root        17988 2019-04-28 12:11 procrank
-rwxr-xr-x root     shell       18048 2019-04-28 12:11 puncture_fs
-rwxr-xr-x root     shell       26176 2019-04-28 12:11 rawbu
-rwxr-xr-x root     shell       17992 2019-04-28 12:11 sane_schedstat
-rwxr-xr-x root     shell       17984 2019-04-28 12:11 showmap
-rwxr-xr-x root     shell       17988 2019-04-28 12:11 showslab
-rwxr-xr-x root     shell      128636 2019-04-28 12:11 simpleperf
-rwxr-xr-x root     shell       66868 2019-04-28 12:11 sqlite3
-rwxr-xr-x root     shell      284440 2019-04-28 12:11 strace
-rwsr-x--- root     shell       17980 2019-04-28 12:11 su
-rwxr-xr-x root     shell       22212 2019-04-28 12:11 taskstats
-rwxr-xr-x root     shell      834132 2019-04-28 12:11 tcpdump
```


