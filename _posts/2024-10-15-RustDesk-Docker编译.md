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

![ssrdog_vpn_clash](/images/network/ssrdog_vpn_clash.png)

![ssrdog_vpn_tun](/images/network/ssrdog_vpn_tun.png)


**docker网络**

```txt

$ ifconfig
docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:20:66:24:24  txqueuelen 0  (以太网)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

enp6s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.0.231  netmask 255.255.255.0  broadcast 192.168.0.255
        inet6 fe80::d3c1:923f:88cd:76cf  prefixlen 64  scopeid 0x20<link>
        ether 58:11:22:b7:90:07  txqueuelen 1000  (以太网)
        RX packets 90424  bytes 44922172 (44.9 MB)
        RX errors 0  dropped 4945  overruns 0  frame 0
        TX packets 59792  bytes 16159110 (16.1 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (本地环回)
        RX packets 201134  bytes 161334386 (161.3 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 201134  bytes 161334386 (161.3 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

```




































