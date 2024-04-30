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

[AS快捷键](https://developer.android.google.cn/studio/intro/keyboard-shortcuts?hl=zh-cn)

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

## 编译顺序

./DevicePolicyTest/app/app.iml

```xml

    <orderEntry type="sourceFolder" forTests="false" />
    <orderEntry type="jdk" jdkName="Android API 28 Platform" jdkType="Android SDK" />

```

## 找不到app.iml文件解决方案

![gradle_iml](/images/androidstudio/gradle_iml.png)


## gradle 下载慢问题

gradle.properties

```txt

distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-6.5-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists

```

## gradle 版本和 java版本不匹配问题

Caused by: org.codehaus.groovy.control.MultipleCompilationErrorsException: startup failed:

**解决方案**

![gradle_java](/images/androidstudio/gradle_java.png)

## ndk 版本配置

local.properties

```txt

ndk.dir=/home/lxg/Android/Sdk/ndk/21.4.7075529

```






























