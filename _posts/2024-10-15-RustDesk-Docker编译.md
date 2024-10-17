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

## Clash Nyanpasun 不显示GUI问题

[最新版本clash-nyanpasu](https://github.com/LibNyanpasu/clash-nyanpasu/releases)

![clash_gui](/images/network/clash_gui.png)

[clash-nyanpasu](https://github.com/libnyanpasu/clash-nyanpasu/issues/685)

[nvidia linux 驱动](https://www.nvidia.cn/drivers/unix/)

**ubuntu 查看本机显卡型号**

```txt

o$ sudo lshw -c video
  *-display                 
       description: VGA compatible controller
       product: GK208B [GeForce GT 710]
       vendor: NVIDIA Corporation
       physical id: 0
       bus info: pci@0000:07:00.0
       version: a1
       width: 64 bits
       clock: 33MHz
       capabilities: pm msi pciexpress vga_controller bus_master cap_list rom
       configuration: driver=nvidia latency=0
       resources: irq:74 memory:fb000000-fbffffff memory:e0000000-e7ffffff memory:e8000000-e9ffffff ioport:e000(size=128) memory:fc000000-fc07ffff
  *-graphics
       product: simpledrmdrmfb
       physical id: 1
       logical name: /dev/fb0
       capabilities: fb
       configuration: depth=32 resolution=2560,1440

```

**查看NVIDIA显卡驱动**

```txt

$ nvidia-smi
Wed Oct 16 18:20:57 2024       
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 470.256.02   Driver Version: 470.256.02   CUDA Version: 11.4     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:07:00.0 N/A |                  N/A |
| 37%   50C    P0    N/A /  N/A |    286MiB /  1979MiB |     N/A      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+

```

GK208B [GeForce GT 710] 最新驱动是: 传统GPU超级新版本(470.xx 系列): 470.256.02

**ubuntu查看系统推荐的驱动**

```txt

$ ubuntu-drivers devices
== /sys/devices/pci0000:00/0000:00:03.1/0000:07:00.0 ==
modalias : pci:v000010DEd0000128Bsv00001458sd000036F7bc03sc00i00
vendor   : NVIDIA Corporation
model    : GK208B [GeForce GT 710]
driver   : nvidia-driver-390 - distro non-free
driver   : nvidia-driver-470 - distro non-free recommended
driver   : nvidia-driver-470-server - distro non-free
driver   : nvidia-driver-418-server - distro non-free
driver   : nvidia-driver-450-server - distro non-free
driver   : xserver-xorg-video-nouveau - distro free builtin


```

## Clash.Nyanpasu_2.0.0-alpha+d87b0e5_amd64.AppImage 报错

```txt

$ sudo ./Clash.Nyanpasu_2.0.0-alpha+d87b0e5_amd64.AppImage 
[sudo] lxg 的密码： 
KMS: DRM_IOCTL_MODE_CREATE_DUMB failed: 权限不够
Failed to create GBM buffer of size 800x642: 权限不够

```

**解决方案**

```txt

sudo WEBKIT_DISABLE_DMABUF_RENDERER=1 ./Clash.Nyanpasu_2.0.0-alpha+d87b0e5_amd64.AppImage

```






















