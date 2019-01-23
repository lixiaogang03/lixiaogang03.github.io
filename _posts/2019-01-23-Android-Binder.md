---
layout:     post
title:      Android Binder
subtitle:   IPC
date:       2019-01-23
author:     LXG
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
tags:
    - Binder
    - IPC
---


### 服务端实现

#### SQRService2.h

```c++

// SQRService2.h

#ifndef ANDROID_MISOO_SQRSERVICE2_H
#define ANDROID_MISOO_SQRSERVICE2_H

#include <stdint.h>
#include <sys/types.h>

#include "ISQRSStub.h"

namespace android {

class SQRService2 : public BnSQRS {

    public:

        static int instantiate();

        virtual int square(const int& n);

        virtual int mul(const int& n, const int& m);

        virtual int add(const int& x, const int& y);

};

}; //namespace android

#endif
```

#### SQRService2.cpp 

```c++

// SQRService2.cpp

#include <binder/IServiceManager.h>

#include <cutils/log.h>

#include "SQRService2.h"

namespace android {

int SQRService2::instantiate() {

    ALOGE("SQRService instantiate");

    //add service to servicemanager
    int r = defaultServiceManager()->addService(String16("misoo.sqr"), new SQRService2());

    ALOGE("SQRService r= %d\n", r);

    return r;
}

int SQRService2::square(const int& n) {

    return n * n;
}

int SQRService2::mul(const int& n, const int& m) {

    return n * m;
}

int SQRService2::add(const int& x, const int& y) {

    return x + y;
}

}; //namespace android
```

### Binder协议接口-服务端

#### ISQRSStub.h

```c++

// ISQRSStub.h

#ifndef ANDROID_MISOO_ISQRSStub_H
#define ANDROID_MISOO_ISQRSStub_H

#include <utils/RefBase.h>
#include <binder/IInterface.h>
#include <binder/Parcel.h>

#include "ISQRS.h"

namespace android {

//Bn端
class BnSQRS: public BnInterface<ISQRS> {

    public:

        virtual status_t onTransact(uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags = 0);

};


}; // namespace android

#endif
```

#### ISQRSStub.cpp

```c++

// ISQRSStub.cpp

#include <stdint.h>
#include <sys/types.h>
#include <binder/Parcel.h>

#include "ISQRSStub.h"

namespace android {

enum {

    SQUARE = IBinder::FIRST_CALL_TRANSACTION,
    MUL, // IBinder::FIRST_CALL_TRANSACTION + 1
    ADD, // IBinder::FIRST_CALL_TRANSACTION + 2

};

//--------------------------------------------------
status_t BnSQRS::onTransact(uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags) {

    switch (code) {

        case SQUARE:
             {
                 int num = data.readInt32();
                 int k = square(num);
                 reply->writeInt32(k);
                 return NO_ERROR;
             }
             break;

        case MUL:
             {
                 int num1 = data.readInt32();
                 int num2 = data.readInt32();
                 int k = mul(num1, num2);
                 reply->writeInt32(k);
                 return NO_ERROR;
             }
             break;

        case ADD:
             {
                 int num1 = data.readInt32();
                 int num2 = data.readInt32();
                 int k = add(num1, num2);
                 reply->writeInt32(k);
                 return NO_ERROR;
             }
             break;

        default:
            return BBinder::onTransact(code, data, reply, flags);
    }

}


} // namespace android
```

### Binder协议接口-客户端

#### ISQRS.h

```c++

// ISQRS.h

#include <utils/RefBase.h>
#include <binder/IInterface.h>
#include <binder/Parcel.h>

#ifndef ANDROID_MISOO_ISQRS_SERVICE_H
#define ANDROID_MISOO_ISQRS_SERVICE_H

namespace android {

//--------------------IInterface------------------------

class ISQRS: public IInterface {

    public:

        DECLARE_META_INTERFACE(SQRS);

        virtual int square(const int& n) = 0;

        virtual int mul(const int& n, const int& m) = 0;

        virtual int add(const int& x, const int& y) = 0;

};

//--------------------BpInterface------------------------

class BpSQRS: public BpInterface<ISQRS> {

    public:

        BpSQRS(const sp<IBinder>& impl): BpInterface<ISQRS>(impl) {}

        virtual int square(const int& n);

        virtual int mul(const int& n, const int& m);

        virtual int add(const int& x, const int& y);
};


}; //namespace android

#endif
```

#### ISQRS.cpp

//ISQRS.cpp

#include "ISQRS.h"

#include <cutils/log.h>

namespace android {

enum {
    SQUARE = IBinder::FIRST_CALL_TRANSACTION,
    MUL, // IBinder::FIRST_CALL_TRANSACTION + 1
    ADD, // IBinder::FIRST_CALL_TRANSACTION + 2
};

int BpSQRS::square(const int& n) {

    Parcel data, reply;

    data.writeInt32(n);

    ALOGV("BpSQRService::create remote()->transact()\n");

    // IPC 通信
    remote()->transact(SQUARE, data, &reply);

    ALOGV("BpSQRService::create n=%d\n", n);

    int num = reply.readInt32();

    ALOGV("num=%d", num);

    return num;
}

int BpSQRS::mul(const int& n, const int& m) {

    Parcel data, reply;

    data.writeInt32(n);
    data.writeInt32(m);

    ALOGV("BpSQRService::create remote()->transact()\n");

    // IPC 通信
    remote()->transact(MUL, data, &reply);

    ALOGV("BpSQRService::create n=%d, m=%d\n", n, m);

    int num = reply.readInt32();

    ALOGV("num=%d", num);

    return num;

}

int BpSQRS::add(const int& x, const int& y) {

    Parcel data, reply;

    data.writeInt32(x);
    data.writeInt32(y);

    ALOGV("BpSQRService::create remote()->transact()\n");

    // IPC 通信
    remote()->transact(ADD, data, &reply);

    ALOGV("BpSQRService::create x=%d, y=%d\n", x, y);

    int num = reply.readInt32();

    ALOGV("num=%d", num);

    return num;

}

IMPLEMENT_META_INTERFACE(SQRS, "android.misoo.IAS");

};//namespace android
```

### 公共so库

#### Android.mk

```makefile

LOCAL_PATH:= $(call my-dir)
include $(CLEAR_VARS)
LOCAL_SRC_FILES:= ISQRSStub.cpp ISQRS.cpp
LOCAL_SHARED_LIBRARIES:= libutils libbinder liblog
LOCAL_PRELINK_MODULE:= false
LOCAL_MODULE_TAGS:= optional
LOCAL_MODULE:= libSQRS02
include $(BUILD_SHARED_LIBRARY)

```

### 服务端进程

#### Android.mk

```makefile

include $(CLEAR_VARS)
LOCAL_SRC_FILES:= addserver2.cpp SQRService2.cpp
LOCAL_SHARED_LIBRARIES:= libutils libbinder libSQRS02 liblog
LOCAL_MODULE_TAGS:= optional
LOCAL_MODULE:= squareserver
include $(BUILD_EXECUTABLE)

```

#### addserver2.cpp

```c++
// addserver2.cpp
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
#include <grp.h>
#include <binder/IPCThreadState.h>
#include <binder/ProcessState.h>
#include <binder/IServiceManager.h>
#include <cutils/log.h>

#include "SQRService2.h"

using namespace android;

int main(int argc, char** argv) {

    sp<ProcessState> proc(ProcessState::self());

    sp<IServiceManager> sm = defaultServiceManager();

    ALOGI("ServiceManager: %p", sm.get());

    SQRService2::instantiate();

    ProcessState::self()->startThreadPool();

    IPCThreadState::self()->joinThreadPool();

    return 0;

}
```

### 客户端进程

#### Android.mk

```makefile

include $(CLEAR_VARS)
LOCAL_SRC_FILES:= SQR2.cpp addclient.cpp
LOCAL_SHARED_LIBRARIES:= libutils libbinder libSQRS02 liblog
LOCAL_MODULE_TAGS:= optional
LOCAL_MODULE:= squareclient
include $(BUILD_EXECUTABLE)

```

#### addclient.cpp

```c++

// addclent.cpp
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>

#include "SQR2.h"

using namespace android;

int main(int argc, char** argv) {

    SQR2 *sqr = new SQR2();

    int num1 = sqr->square(2);

    ALOGV("square(2)=%d\n", num1);

    int num2 = sqr->add(2, 3);

    ALOGV("add(2, 3)=%d\n", num2);

    int num3 = sqr->mul(2, 3);

    ALOGV("mul(2, 3)=%d\n", num3);
    
    return 0;

}

```

#### SQR2.h

```c++

// SQR2.h

#include "ISQRS.h"

namespace android {

class SQR2 {

    public:

        int square(int n);

        int mul(int n, int m);

        int add(int x, int y);

    private:

        static const sp<ISQRS>& getSQRService();

        static sp<ISQRS> sSQRService;

};


}; // namespace android
```

#### SQR2.cpp

```c++

// SQR2.cpp

#include <binder/IServiceManager.h>
#include <binder/IPCThreadState.h>

#include <cutils/log.h>

#include "SQR2.h"
#include "ISQRS.h"

namespace android {

const sp<ISQRS>& SQR2::getSQRService() {

    sp<IServiceManager> sm = defaultServiceManager();

    sp<IBinder> ib = sm->getService(String16("missoo.sqr"));

    ALOGV("SQR2::getSQRService");

    sp<ISQRS> sService = interface_cast<ISQRS>(ib);

    return sService;

}


int SQR2::square(int n) {

    int k = 0;

    const sp<ISQRS>& isqrs = getSQRService();

    if (isqrs != NULL) {
        k = isqrs->square(n);
    }

    return k;

}

int SQR2::mul(int n, int m) {

    int k = 0;

    const sp<ISQRS>& isqrs = getSQRService();

    if (isqrs != NULL) {
        k = isqrs->mul(n, m);
    }

    return k;
}

int SQR2::add(int x, int y) {

    int k = 0;

    const sp<ISQRS>& isqrs = getSQRService();

    if (isqrs != NULL) {
        k = isqrs->add(x, y);
    }

    return k;

}


}; // namespace android
```



















