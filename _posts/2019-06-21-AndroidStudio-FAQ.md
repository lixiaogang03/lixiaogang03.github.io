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

## 应用开发常用库

### leakcanary

```gradle

    debugImplementation 'com.squareup.leakcanary:leakcanary-android:1.5.4'
    releaseImplementation 'com.squareup.leakcanary:leakcanary-android-no-op:1.5.4'

```

### okhttp

```gradle

    implementation 'com.squareup.okhttp3:okhttp:3.10.0'

```

### room

```gradle

    implementation 'android.arch.persistence.room:runtime:1.1.1'
    annotationProcessor 'android.arch.persistence.room:compiler:1.1.1'
    implementation 'android.arch.persistence.room:testing:1.1.1'

```

### fastjson

```gradle

    implementation 'com.alibaba:fastjson:1.1.71.android'

```

### gson

```gradle

    implementation 'com.google.code.gson:gson:2.8.2'

```

### picasso

```gradle

    implementation 'com.squareup.picasso:picasso:2.5.2'

```

### bugly

```gradle

    implementation 'com.tencent.bugly:crashreport:latest.release'

```





