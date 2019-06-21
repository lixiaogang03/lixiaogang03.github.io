---
layout:     post
title:      AndroidStudio FAQ
subtitle:   FAQ
date:       2019-06-21
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - androidstudio
---

## 常见问题解决方法

### gradle下载慢问题

```gradle

// 使用阿里云的镜像

buildscript {

    repositories {
        maven { url 'http://maven.aliyun.com/nexus/content/groups/public/' }
    }

}

allprojects {

    repositories {
        maven { url 'http://maven.aliyun.com/nexus/content/groups/public/' }
    }

}

```


