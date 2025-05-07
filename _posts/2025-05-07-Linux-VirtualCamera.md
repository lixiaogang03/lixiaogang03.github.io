---
layout:     post
title:      Linux Virtual Camera
subtitle:   虚拟相机
date:       2025-05-07
author:     LXG
header-img: img/post-bg-camera.jpg
catalog: true
tags:
    - camera
---

## 概念

Linux 的虚拟相机机制（Virtual Camera）是一种通过软件模拟出一个摄像头设备的方式，常用于以下场景：

* 视频源模拟（测试用途）：没有真实摄像头也能调试视频相关应用；
* 视频流重定向：把本地视频文件、网络流等伪装成摄像头供应用读取；
* 特效或 AI 处理：在采集后先用程序处理，再虚拟成摄像头给其他软件使用。






