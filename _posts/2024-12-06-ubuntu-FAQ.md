---
layout:     post
title:      Ubuntu FAQ
subtitle:   服务器运维
date:       2024-12-06
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - markdown
---

## 无法开机问题

ubuntu 服务器运行过程中突然无法访问其中一块儿硬盘，重启后无法开机，有如下提示

```txt

/dev/sda3:recovering iournal6469469124895299 blocks
/dev/sda3:clean,269463/31227904 files
You are in emergency mode

```
**排查过程**

将无法访问的硬盘从服务器抽出，重启后仍然无法开机，提示上述错误

**问题原因**

故障盘移除后, /etc/fstab 文件需要重新配置，否则无法开机

**解决步骤**

1. 在报错提示界面按下回车键
2. vim /etc/fstab 注释掉所有外部挂载的盘
3. 重启设备
4. sudo lsblk -o NAME,UUID,TYPE,SIZE,MOUNTPOINT
5. sudo vim /etc/fstab 

```txt

$ lsblk -o NAME,UUID,TYPE,SIZE,MOUNTPOINT
NAME   UUID                                 TYPE   SIZE MOUNTPOINT
sda    d35af772-7249-4d0e-a748-642ecae10a67 disk 447.1G 
sdb                                         disk 476.9G 
├─sdb1                                      part   977K 
├─sdb2 3629-766D                            part 513.1M /boot/efi
└─sdb3 21a2803a-1a5b-4a58-9f0e-3810ef67291c part 476.4G /
sdc    97f3001d-2931-4f34-a150-816eccff241e disk 223.6G 
└─sdc1                                      part 223.6G 
sdd    fe2b7078-748a-4447-afff-f1f16b5505bb disk 223.6G 
└─sdd1                                      part 223.6G 
sde    bf9c8a83-ea88-4a3f-9cf6-843581451c40 disk 476.9G 
sdf    38c88796-ed55-4649-af59-fc7a8457e528 disk 894.3G 
sdg    1ffd3437-cb37-4ce5-8a21-6eda8794c0e3 disk 476.9G 
sdh    5ef2f6c6-f22c-4059-bbfa-70c0f34f6350 disk 894.3G 
sdi    82f66504-6c42-44c4-a0dd-e68d4b5e5ea7 disk 223.6G 
└─sdi1                                      part 223.6G 
sdj    99691cdc-3096-46b0-a385-1b80e18f08dd disk 223.6G 
└─sdj1                                      part 223.6G

```

**vim /etc/fstab**

```txt

UUID=d35af772-7249-4d0e-a748-642ecae10a67 /home/sy/code/sda               ext4    defaults     0       0
UUID=97f3001d-2931-4f34-a150-816eccff241e /home/sy/code/sdc               ext4    defaults     0       0
UUID=fe2b7078-748a-4447-afff-f1f16b5505bb /home/sy/code/sdd               ext4    defaults     0       0
UUID=bf9c8a83-ea88-4a3f-9cf6-843581451c40 /home/sy/code/sde               ext4    defaults     0       0
UUID=38c88796-ed55-4649-af59-fc7a8457e528 /home/sy/code/sdf               ext4    defaults     0       0
UUID=1ffd3437-cb37-4ce5-8a21-6eda8794c0e3 /home/sy/code/sdg               ext4    defaults     0       0
UUID=5ef2f6c6-f22c-4059-bbfa-70c0f34f6350 /home/sy/code/sdh               ext4    defaults     0       0
UUID=82f66504-6c42-44c4-a0dd-e68d4b5e5ea7 /home/sy/code/sdi               ext4    defaults     0       0
UUID=99691cdc-3096-46b0-a385-1b80e18f08dd /home/sy/code/sdj               ext4    defaults     0       0

```

## ubuntu 22.04 中文输入法卡顿问题

[Ubuntu 22.04 环境下，使用 ibus-libpinyin 输入延迟严重](https://github.com/libpinyin/ibus-libpinyin/issues/429)

**解决方案**

```bash

rm ~/.cache/ibus/libpinyin/__db.user_pinyin_index.bin.tmp

```










