---
layout:     post
title:      Android AAR 发布到Maven Central仓库
subtitle:   aar
date:       2026-06-06
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

## 常见发布方式

| 方式              | 适用场景        | 公开访问 | 难度   |
| --------------- | ----------- | ---- | ---- |
| Maven Central   | 开源库、公共 SDK  | 是    | ★★★★ |
| GitHub Packages | 团队内部、私有 SDK | 可私有  | ★★   |
| JitPack         | 开源项目快速发布    | 是    | ★    |
| 阿里云 Maven 仓库    | 国内团队        | 可私有  | ★★   |
| Nexus 私服        | 企业内部        | 私有   | ★★★  |
| Artifactory     | 大型企业        | 私有   | ★★★★ |
| 本地 AAR 文件       | 客户定制项目      | 否    | ★    |

## 云平台对比

| 云厂商                                                             | 优势领域           | 适合人群   |
| --------------------------------------------------------------- | -------------- | ------ |
| [阿里云](https://www.aliyun.com?utm_source=chatgpt.com)            | 企业级、政企、制造业、电商  | 企业客户   |
| [腾讯云](https://cloud.tencent.com?utm_source=chatgpt.com)         | 游戏、音视频、微信生态    | 互联网业务  |
| [火山引擎](https://www.volcengine.com?utm_source=chatgpt.com)       | AI、大模型、推荐系统、直播 | AI创业公司 |
| [Google Cloud](https://cloud.google.com?utm_source=chatgpt.com) | AI、数据分析、全球业务   | 出海企业   |




