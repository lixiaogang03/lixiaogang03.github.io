---
layout:     post
title:      Docker Android
subtitle:   Docker中配置Android编译环境
date:       2020-11-08
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - docker
---

## 安装Docker

```txt

$ curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

```

## 编译Image

使用github的方式比较简单

### 源码

[/build/tools/docker/-androidxref](http://androidxref.com/9.0.0_r3/xref/build/tools/docker/)

```txt

# Copy your host gitconfig, or create a stripped down version
$ cp ~/.gitconfig gitconfig
$ docker build --build-arg userid=$(id -u) --build-arg groupid=$(id -g) --build-arg username=$(id -un) -t android-build-trusty .

```

### github-kylemanna-docker-aosp

[docker-aosp-github](https://github.com/kylemanna/docker-aosp)

```txt

$ make aosp
$ cd aosp
$ export AOSP_VOL=$PWD
$ curl -O https://raw.githubusercontent.com/kylemanna/docker-aosp/master/tests/build-nougat.sh
$ bash ./build-nougat.sh

```

## 导入镜像

```txt

docker load < compile.tar

```

## 挂载容器

```txt

$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
<none>              <none>              31efdd4ea934        5 days ago          1.1GB

& docker run -d -it --mount type=bind,source=/home/lxg/code/,target=/aosp/ 31efdd4ea934

```

## root用户问题


```txt

$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
<none>              <none>              31efdd4ea934        5 days ago          1.1GB

$ id
uid=1000(lxg) gid=1000(lxg) 组=1000(lxg),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),131(lxd),132(sambashare),998(docker)

$ docker run -it -d --net=host --user 1000:1000 -v /etc/passwd:/etc/passwd:ro -v /etc/shadow:/etc/shadow:ro -v /etc/group:/etc/group:ro --entrypoint=/bin/bash --mount type=bind,source=/home/lxg/code/,target=/aosp/ 31efdd4ea934

```

## 进入容器

```txt

$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
56663213f9a9        31efdd4ea934        "/bin/bash"         4 days ago          Exited (0) 2 minutes ago                       happy_brattain

$ docker start 56663213f9a9
56663213f9a9

$ docker exec -it 56663213f9a9 /bin/bash
lxg@56663213f9a9:/aosp$ 

```

## 退出

```txt

$ exit

$ docker stop 56663213f9a9

```

## FAQ

### 问题一

```txt

FAILED: out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack
/bin/bash -c "(mkdir -p out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack.tmpjill.res ) && (unzip -qo prebuilts/sdk/16/android.jar -d out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack.tmpjill.res ) && (find out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack.tmpjill.res -iname \"*.class\" -delete ) && (JACK_VERSION=4.31.CANDIDATE out/host/linux-x86/bin/jack @build/core/jack-default.args    -D jack.import.resource.policy=keep-first -D jack.import.type.policy=keep-first -D jack.android.min-api-level=16 --import prebuilts/sdk/16/android.jar --import-resource out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack.tmpjill.res --output-jack out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack ) && (rm -rf out/target/common/obj/JAVA_LIBRARIES/sdk_v16_intermediates/classes.jack.tmpjill.res )"
out/host/linux-x86/bin/jack: line 80: USER: unbound variable

解决方法：

$ export USER=$(whoami)

```

### 问题二

```txt

Notice file: system/extras/ext4_utils/NOTICE -- out-E8909/target/product/msm8909/obj/NOTICE_FILES/src//system/lib/libext4_utils_static.a.txt
/bin/bash: mkisofs: command not found

解决方法：

$ sudo apt-get update
$ sudo apt-get install mkisofs
$ sudo apt-get install genisoimage

```







