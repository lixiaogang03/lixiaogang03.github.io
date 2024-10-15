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





































