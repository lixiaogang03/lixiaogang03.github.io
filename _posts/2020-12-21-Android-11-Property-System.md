---
layout:     post
title:      Android 11 Property System
subtitle:   属性系统
date:       2020-12-21
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - property
---

[Android属性系统-简书](https://www.jianshu.com/p/d9a49248a1b5)

## 架构图

![property_system](/images/property/property_system.webp)

1. Android系统一启动就会从若干属性脚本文件中加载属性内容
2. Android系统中的所有属性(key/value)会存入同一块共享内存中
3. 系统中的各个进程会将这块共享内存映射到自己的内存空间，这样就可以直接读取属性内容了
4. 系统中只有一个实体可以设置、修改属性值，它就是属性系统(init进程)
5. 不同进程只可以通过sockeet方式，向属性系统(init进程)发出修改，而不能直接修改属性值
6. 共享内存中的键值内容会以一种字典树的形式进行组织。

## 代码

### main.cpp

/system/core/init/main.cpp

```cpp

using namespace android::init;

int main(int argc, char** argv) {

    if (!strcmp(basename(argv[0]), "ueventd")) {
        return ueventd_main(argc, argv);
    }

    if (argc > 1) {
        if (!strcmp(argv[1], "subcontext")) {
            android::base::InitLogging(argv, &android::base::KernelLogger);
            const BuiltinFunctionMap& function_map = GetBuiltinFunctionMap();

            return SubcontextMain(argc, argv, &function_map);
        }

        if (!strcmp(argv[1], "selinux_setup")) {
            return SetupSelinux(argv);
        }

        if (!strcmp(argv[1], "second_stage")) {
            return SecondStageMain(argc, argv); // property is here
        }
    }

    return FirstStageMain(argc, argv);

}

```

### init.cpp

/system/core/init/init.cpp

```cpp

int SecondStageMain(int argc, char** argv) {

    PropertyInit();

}

```



