---
layout:     post
title:      Android Webrtc 优化
subtitle:   从源码角度分析
date:       2024-10-17
author:     LXG
header-img: img/post-bg-xiaomi.jpg
catalog: true
tags:
    - Webrtc
---

[2021-08-12-WebRTC](https://lixiaogang03.github.io/2021/08/12/WebRTC/)

[2022-01-12-Webrtc-Protocol](https://lixiaogang03.github.io/2022/01/12/Webrtc-Protocol/)

[2022-04-18-Webrtc调试](https://lixiaogang03.github.io/2022/04/18/Webrtc%E8%B0%83%E8%AF%95/)

## webrtc 编译环境

[源码编译](https://webrtc.mthli.com/basic/webrtc-compilation/)

**将 depot_tools clone 到本地**

```sh

$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

```

**添加环境变量**

```sh

vim ~/.bashrc

export PATH=/home/lxg/code/webrtc/depot_tools:$PATH

source ~/.bashrc

```

## webrtc 源码

[WebRTC Android development](https://webrtc.googlesource.com/src/+/main/docs/native-code/android/)

[声网Agora WebRTC团队-国内镜像-已经停止更新了](https://webrtc.org.cn/mirror/)

[webrtc-android)](https://github.com/GetStream/webrtc-android)

Google 已经停止webrtc android sdk 的更新了, 最新的版本是Aug 27, 2020更新的

```gradle

    implementation 'org.webrtc:google-webrtc:1.0.32006'

```



































