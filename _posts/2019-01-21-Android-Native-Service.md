---
layout:     post
title:      Android Native Service
subtitle:   A native binder service demo
date:       2019-01-21
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - native
---

## Demo实现要点

1. 核心服务通常在特定进程执行（一般为守护进程）

2. 需要提供IBinder接口，以便应用程序可以进行跨进程的绑定和调用

3. 因为共用，所以必须确保多线程安全

4. 加入到ServiceManager进程管理

5. 实现JNI, 以便应用程序方便调用


## native进程实现（实现平方运算）

### SQRService.h

```c++
#ifndef ANDROID_MISOO_SQRSERVICE_H

#define ANDROID_MISOO_SQRSERVICE_H

#include <stdint.h>

#include <sys/types.h>

#include <binder/Parcel.h>

#include <binder/IInterface.h>

#include <utils/RefBase.h>


namespace android {

class SQRService : public BBinder
    {
      public:
          static int instantiate();

          virtual status_t onTransact(uint32_t, const Parcel&, Parcel*, uint32_t);

          SQRService();

          virtual ~SQRService();
    };

} // namespace android

#endif
```

### SQRService.cpp

```c++
#include <binder/IServiceManager.h>

#include <cutils/log.h>

#include "SQRService.h"

namespace android {

enum {
        SQUARE = IBinder::FIRST_CALL_TRANSACTION,
};

int SQRService::instantiate() {
    ALOGE("SQRService instantiate");
    int r = defaultServiceManager()->addService(String16("misoo.sqr"), new SQRService());//add service to servicemanager
    ALOGE("SQRService r= %d\n", r);
    return r;
}

SQRService::SQRService() {
    ALOGV("SQRService created");
}

SQRService::~SQRService() {
    ALOGV("SQRService destroyed");
}

status_t SQRService::onTransact(uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags) {

    switch(code) {
        case SQUARE:
        {
            int num = data.readInt32();
            reply->writeInt32(num * num);
            ALOGE("onTransact::CREATE_NUM..n=%d\n", num);
            return NO_ERROR;
        }
        break;
        default:
            ALOGE("onTransact::default\n");

        return BBinder::onTransact(code, data, reply, flags);
    }

}


} // namespace android
```

### addserver.cpp

```c++
#include <stdio.h>

#include <sys/types.h>

#include <unistd.h>

#include <grp.h>

#include <binder/IPCThreadState.h>

#include <binder/ProcessState.h>

#include <binder/IServiceManager.h>

#include <cutils/log.h>

#include "SQRService.h"

using namespace android;

int main(int argc, char** argv) {

    sp<ProcessState> proc(ProcessState::self());

    sp<IServiceManager> sm = defaultServiceManager();

    ALOGI("ServiceManager: %p", sm.get());

    SQRService::instantiate();

    ProcessState::self()->startThreadPool();

    IPCThreadState::self()->joinThreadPool();

    return 0;

}
```

### Android.mk

```makefile
#libSQRS01.so

LOCAL_PATH:= $(call my-dir)

include $(CLEAR_VARS)

LOCAL_SRC_FILES:= SQRService.cpp

LOCAL_SHARED_LIBRARIES:= libutils libbinder liblog

LOCAL_PRELINK_MODULE:= false

LOCAL_MODULE_TAGS:= optional

LOCAL_MODULE:= libSQRS01

include $(BUILD_SHARED_LIBRARY)

# addserver.bin

include $(CLEAR_VARS)

LOCAL_SRC_FILES:= addserver.cpp

LOCAL_SHARED_LIBRARIES:= libutils libbinder libSQRS01 liblog

LOCAL_MODULE_TAGS:= optional

LOCAL_MODULE:= square

include $(BUILD_EXECUTABLE)
```








