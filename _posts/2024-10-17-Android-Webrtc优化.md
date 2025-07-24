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

Google 已经停止webrtc android sdk 的更新了, 最新的版本是Aug 27, 2020更新的

```gradle

    implementation 'org.webrtc:google-webrtc:1.0.32006'

```

**VPN 开启TUN模式后开启下一步**

```sh

$ fetch --nohooks webrtc_android
$ gclient sync

```

这将获取添加了 Android 特定部分的WebRTC代码。请注意，Android 特定部分（如 Android SDK 和 NDK）非常大（约 8 GB），因此总签出大小约为 16 GB。
由于您可以为每个构建配置在不同的目录中生成Ninja项目文件，因此相同的签出可用于 Linux 和 Android 开发。


## 三方webrtc

| SDK 名称                  | Android 支持 | 音视频通话 | 屏幕共享 | 服务端方案         | 活跃度 | 典型用途                     |
|---------------------------|---------------|--------------|------------|----------------------|--------|------------------------------|
| LiveKit (`io.livekit`)    | ✅ 官方 SDK    | ✅            | ✅          | LiveKit SFU          | ⭐⭐⭐⭐⭐ | 多人通话、协作、直播         |
| react-native-webrtc       | ✅ 可提取 AAR  | ✅            | ❌*         | 自定义（WebSocket）  | ⭐⭐⭐⭐  | 远程控制、轻量音视频         |
| OpenVidu                  | ✅ 官方 SDK    | ✅            | ✅          | Kurento/KMS          | ⭐⭐⭐⭐  | 教育平台、Web+App会议        |
| mediasoup-android         | ✅ 官方 SDK    | ✅            | ❌*         | mediasoup SFU        | ⭐⭐⭐⭐  | 低延迟多方通信               |
| Jitsi Meet SDK            | ✅ 官方 SDK    | ✅            | ✅          | Jitsi Videobridge    | ⭐⭐⭐⭐  | 视频会议系统                 |
| Pion WebRTC (Go)          | ✅ 客户端接入  | ✅            | ❌*         | Pion SFU 或 P2P      | ⭐⭐⭐⭐  | 自建信令服务，远控/语音视频 |
| webrtc-sdk                | ✅ AAR 发布    | ✅            | ❌          | 无（需自建）         | ⭐⭐⭐   | 原生开发者快速接入           |
| WebRTC-Android (Piasy)    | ✅ 编译脚本    | ✅            | ❌          | 无（需自建）         | ⭐⭐⭐   | 自编译 AAR / 学习项目        |

## 最新aar编译

[google-webrtc-aar](https://repo.maven.apache.org/maven2/com/infobip/google-webrtc/)

























