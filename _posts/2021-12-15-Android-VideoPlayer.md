---
layout:     post
title:      Android VideoPlayer
subtitle:   音频和视频
date:       2021-12-15
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - Android
---

[音频和视频-Google](https://developer.android.google.cn/guide/topics/media?hl=zh-cn)

[Ijkplayer、ExoPlayer、VLC播放器综合比较](https://zhuanlan.zhihu.com/p/397425806)

## ExoPlayer

[ExoPlayer-github](https://github.com/google/ExoPlayer)

ExoPlayer 是一个不在 Android 框架内的开放源代码项目，它与 Android SDK 分开提供。ExoPlayer 的标准音频和视频组件基于 Android 的 MediaCodec API 构建，该 API 是在 Android 4.1（API 级别 16）中发布的。由于 ExoPlayer 是一个库，因此您可以通过更新应用来轻松利用新推出的功能。

ExoPlayer 支持基于 HTTP 的动态自适应流 (DASH)、SmoothStreaming 和通用加密等功能，这些功能不受 MediaPlayer 的支持。它采用易于自定义和扩展的设计。

## ijkplayer

[ijkplayer-github](https://github.com/Bilibili/ijkplayer)

IjkPlayer 是BiliBili公司维护的一个开源工程，是基于ffmpeg开发的一个播放器软件，目前支持Android和iOS两种平台

![ijkplayer](/images/android/media/ijkplayer.jpg)

![ijkplayer_2](/images/android/media/ijkplayer_2.jpg)

## GSYVideoPlayer

[GSYVideoPlayer-github](https://github.com/CarGuo/GSYVideoPlayer)

视频播放器（IJKplayer、ExoPlayer、MediaPlayer），HTTPS，支持弹幕，外挂字幕，支持滤镜、水印、gif截图，片头广告、中间广告，多个同时播放，支持基本的拖动，声音、亮度调节，支持边播边缓存，支持视频自带rotation的旋转（90,270之类），重力旋转与手动旋转的同步支持，支持列表播放 ，列表全屏动画，视频加载速度，列表小窗口支持拖动，动画效果，调整比例，多分辨率切换，支持切换播放器，进度条小窗口预览，列表切换详情页面无缝播放，rtsp、concat、mpeg。

![gsyvideoplayer](/images/android/media/gsyvideoplayer.jpg)





