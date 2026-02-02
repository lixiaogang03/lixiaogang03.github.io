---
layout:     post
title:      Framework 编译
subtitle:   定制framework
date:       2022-02-11
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - Android
---

[Android SDK开发艺术探索](https://zhuanlan.zhihu.com/p/151406299)

## JAR

JAR文件的全称是Java Archive File，意思就是Java档案文件。通常JAR文件是一种压缩文件，与常见的ZIP压缩文件兼容，同城也被称为JAR包。
JAR文件与zip文件的去区别就是在JAR文件中默认包含了一个名为META-INF/MANIFEST.MF的清单文件，这个清单文件是在生成JAR文件时系统自动创建的。

## 静态jar和动态jar

静态jar和共享jar最明显的区别在于，引入了静态jar的模块实际上是把jar包里用到class都包含到引用的模块里了，会增大APK占用的空间，而共享jar系统里仅有一份，由系统加载提供。
因此在做系统应用时，如果jar包较大，且多个模块需要调用时，建议作为共享jar提供。

## AAR

![aar](/images/android/sdk/aar.png)

## AAR 安全验证

![sdk_verify](/images/android/sdk/sdk_verify.jpg)

## Baidu LBS JAR

```xml

        <service
            android:name="com.baidu.location.f"
            android:enabled="true"
            android:process=":remote" />

        <meta-data
            android:name="com.baidu.lbsapi.API_KEY"
            android:value="qLa5jbIxOf73RZc8dSyCKfUGBOmPGYZx" />

```

![baidu_lbs](/images/android/sdk/baidu_lbs.png)


## framework.jar

out/target/common/obj/JAVA_LIBRARIES/framework_intermediates/classes.jar

## okhttp

external/okhttp/

```makefile

LOCAL_JAVA_LIBRARIES := okhttp

include $(CLEAR_VARS)
LOCAL_MODULE := okhttp
LOCAL_MODULE_TAGS := optional
LOCAL_SRC_FILES := $(okhttp_system_src_files)
LOCAL_JARJAR_RULES := $(LOCAL_PATH)/jarjar-rules.txt
LOCAL_JAVA_LIBRARIES := core-oj core-libart conscrypt
LOCAL_NO_STANDARD_LIBRARIES := true
LOCAL_ADDITIONAL_DEPENDENCIES := $(LOCAL_PATH)/Android.mk
LOCAL_JAVA_LANGUAGE_VERSION := 1.7
include $(BUILD_JAVA_LIBRARY)

```

## build/core/mappath.mk

```mk

#
# A list of all source roots under frameworks/base, which will be
# built into the android.jar.
#
FRAMEWORKS_BASE_SUBDIRS := \
	$(addsuffix /java, \
	    core \
	    graphics \
	    location \
	    media \
	    media/mca/effect \
	    media/mca/filterfw \
	    media/mca/filterpacks \
	    drm \
	    opengl \
	    sax \
	    telecomm \
	    telephony \
	    wifi \
	    keystore \
	    rs \
	    ocr \
	 )

```

## framework/base/media

```txt

frameworks/base/media$ tree -L 2
.
├── java
│   └── android
├── jni
│   ├── android_media_AmrInputStream.cpp
│   ├── android_media_ExifInterface.cpp
│   ├── android_media_ImageReader.cpp
│   ├── android_media_ImageWriter.cpp
│   ├── android_media_MediaCodec.cpp
│   ├── android_media_MediaCodec.h
│   ├── android_media_MediaCodecList.cpp
│   ├── android_media_MediaCrypto.cpp
│   ├── android_media_MediaCrypto.h
│   ├── android_media_MediaDataSource.cpp
│   ├── android_media_MediaDataSource.h
│   ├── android_media_MediaDrm.cpp
│   ├── android_media_MediaDrm.h
│   ├── android_media_MediaExtractor.cpp
│   ├── android_media_MediaExtractor.h
│   ├── android_media_MediaHTTPConnection.cpp
│   ├── android_media_MediaHTTPConnection.h
│   ├── android_media_MediaMetadataRetriever.cpp
│   ├── android_media_MediaMuxer.cpp
│   ├── android_media_MediaPlayer.cpp
│   ├── android_media_MediaProfiles.cpp
│   ├── android_media_MediaRecorder.cpp
│   ├── android_media_MediaScanner.cpp
│   ├── android_media_MediaSync.cpp
│   ├── android_media_MediaSync.h
│   ├── android_media_PlaybackParams.h
│   ├── android_media_ResampleInputStream.cpp
│   ├── android_media_SyncParams.cpp
│   ├── android_media_SyncParams.h
│   ├── android_media_Utils.cpp
│   ├── android_media_Utils.h
│   ├── Android.mk
│   ├── android_mtp_MtpDatabase.cpp
│   ├── android_mtp_MtpDevice.cpp
│   ├── android_mtp_MtpServer.cpp
│   ├── audioeffect
│   ├── MODULE_LICENSE_APACHE2
│   ├── NOTICE
│   └── soundpool
├── lib
│   ├── remotedisplay
│   ├── signer
│   └── tvremote
├── mca
│   ├── Android.mk
│   ├── effect
│   ├── filterfw
│   ├── filterpacks
│   ├── samples
│   ├── structgen.py
│   └── tests
├── packages
│   └── BluetoothMidiService
└── tests
    ├── audiotests
    ├── CameraBrowser
    ├── contents
    ├── EffectsTest
    ├── MediaDump
    ├── MediaFrameworkTest
    ├── players
    ├── README.txt
    ├── ScoAudioTest
    └── SoundPoolTest

```

