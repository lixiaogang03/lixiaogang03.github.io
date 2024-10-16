---
layout:     post
title:      RustDesk Docker 编译
subtitle:   Docker
date:       2024-10-15
author:     LXG
header-img: img/post-bg-sky.jpg
catalog: true
tags:
    - Docker
---

[RustDesk Docker 编译](https://rustdesk.com/docs/zh-cn/dev/build/docker/)

[Ubuntu 22.04 Docker 安装](https://cloud.tencent.com/developer/article/2378028)

## Ubuntu 22.04 安装Docker

**安装依赖包**

```sh

sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common

```

**添加 Docker 的官方 GPG 密钥**

```sh

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

```

**添加 Docker 的存储库**

```sh

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb\_release -cs) stable"

```

**安装 Docker 引擎**

```sh

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io

```

**验证 Docker 是否安装成功**

```sh

sudo docker --version

```

**启动并启用 Docker 服务**

```sh

sudo systemctl start docker
sudo systemctl enable docker

```

**将用户添加到 Docker 组**

为了不每次都使用 sudo 运行 Docker 命令，可以将当前用户添加到 docker 组：

```sh

sudo usermod -aG docker $USER

newgrp docker

```

**配置镜像加速器**

sudo nano /etc/docker/daemon.json

[国内镜像地址](https://github.com/dongyubin/DockerHub)

```json

{
    "registry-mirrors": ["https://dockerproxy.cn","https://docker.rainbond.cc","https://docker.udayun.com"]
}

```

sudo systemctl daemon-reload
sudo systemctl restart docker

**测试 Docker 安装**

```txt

$ docker pull hello-world
Using default tag: latest
latest: Pulling from library/hello-world
c1ec31eb5944: Pull complete 
Digest: sha256:d211f485f2dd1dee407a80973c8f129f00d54604d2c90732e8e320e5038a0348
Status: Downloaded newer image for hello-world:latest
docker.io/library/hello-world:latest


$ docker run hello-world

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/

```

## Docker 编译 rustdesk

```sh

git clone https://github.com/rustdesk/rustdesk
cd rustdesk
docker build -t "rustdesk-builder" .

```

**制作Docker镜像时的报错**

```txt

$ docker build -t "rustdesk-builder" .
[+] Building 167.8s (7/12)                                                                                                                                                                                        docker:default
 => [internal] load build definition from Dockerfile                                                                                                                                                                        0.0s
 => => transferring dockerfile: 1.51kB                                                                                                                                                                                      0.0s
 => [internal] load metadata for docker.io/library/debian:bullseye-slim                                                                                                                                                     3.2s
 => [internal] load .dockerignore                                                                                                                                                                                           0.0s
 => => transferring context: 2B                                                                                                                                                                                             0.0s
 => [1/9] FROM docker.io/library/debian:bullseye-slim@sha256:3f9e53602537cc817d96f0ebb131a39bdb16fa8b422137659a9a597e7e3853c1                                                                                               0.0s
 => [internal] load build context                                                                                                                                                                                           0.0s
 => => transferring context: 35B                                                                                                                                                                                            0.0s
 => CACHED [2/9] RUN apt update -y &&     apt install --yes --no-install-recommends         g++         gcc         git         curl         nasm         yasm         libgtk-3-dev         clang         libxcb-randr0-de  0.0s
 => ERROR [3/9] RUN git clone --branch 2023.04.15 --depth=1 https://github.com/microsoft/vcpkg &&     /vcpkg/bootstrap-vcpkg.sh -disableMetrics &&     /vcpkg/vcpkg --disable-metrics install libvpx libyuv opus aom      164.5s
------
 > [3/9] RUN git clone --branch 2023.04.15 --depth=1 https://github.com/microsoft/vcpkg &&     /vcpkg/bootstrap-vcpkg.sh -disableMetrics &&     /vcpkg/vcpkg --disable-metrics install libvpx libyuv opus aom:                   
0.163 Cloning into 'vcpkg'...

164.5 error: RPC failed; curl 28 Failed to connect to github.com port 443: Connection timed out
164.5 fatal: expected flush after ref listing
------
Dockerfile:34
--------------------
  33 |     
  34 | >>> RUN git clone --branch 2023.04.15 --depth=1 https://github.com/microsoft/vcpkg && \
  35 | >>>     /vcpkg/bootstrap-vcpkg.sh -disableMetrics && \
  36 | >>>     /vcpkg/vcpkg --disable-metrics install libvpx libyuv opus aom
  37 |     
--------------------
ERROR: failed to solve: process "/bin/sh -c git clone --branch 2023.04.15 --depth=1 https://github.com/microsoft/vcpkg &&     /vcpkg/bootstrap-vcpkg.sh -disableMetrics &&     /vcpkg/vcpkg --disable-metrics install libvpx libyuv opus aom" did not complete successfully: exit code: 128

```

## ssrdog TUN模式

**透明代理**

透明代理的意思是客户端不需要知道有代理服务器的存在，它改变 request fields（报文）并传送真实 IP。本文中的透明代理是指使用 Clash 的 TUN 模式虚拟出来的一块 TUN 网卡，作为局域网中的网关，从而实现透明代理。

![ssrdog_vpn_clash](/images/network/ssrdog_vpn_clash.png)

![ssrdog_vpn_tun](/images/network/ssrdog_vpn_tun.png)

**如何判断tun代理是否开启成功**

输出结果中应该会有一个类似tun0的设备，表示TUN设备已经被加载, 以下显示TUN没有开启成功

```txt

$ ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: enp6s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 58:11:22:b7:90:07 brd ff:ff:ff:ff:ff:ff
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default 
    link/ether 02:42:20:66:24:24 brd ff:ff:ff:ff:ff:ff

```

**TUN模式开启报错日志**

```txt

cat ~/.config/clash-nyanpasu/logs/clash-nyanpasu.2024-10-16.app.log

{"timestamp":"2024-10-16T07:25:59.126565Z","level":"INFO","fields":{"message":"[clash]: ERR [Inbound] start failed error=operation not permitted type=TUN stackType=gvisor inet=198.18.0.1/16\n","log.target":"app","log.module_path":"clash_verge::core::clash::core","log.file":"tauri/src/core/clash/core.rs","log.line":206},"target":"app","filename":"tauri/src/core/clash/core.rs","line_number":206}


```

[Ubuntu无法使用Tun模式 #365](https://github.com/libnyanpasu/clash-nyanpasu/issues/365)

































