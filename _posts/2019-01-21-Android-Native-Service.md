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
#ifndef ANDROID_MISOO_SQRSERVICE_H<br/>
#define ANDROID_MISOO_SQRSERVICE_H

#include <stdint.h><br/>
#include <sys/types.h><br/>
#include <binder/Parcel.h><br/>
#include <binder/IInterface.h><br/>
#include <utils/RefBase.h><br/>


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






