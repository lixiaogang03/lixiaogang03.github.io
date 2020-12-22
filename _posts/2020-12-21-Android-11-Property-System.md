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

    // 属性系统初始化
    PropertyInit();

    // 启动属性服务
    StartPropertyService(&property_fd);

}

```

### property_service.cpp

/system/core/init/property_service.cpp

```cpp

void PropertyInit() {

    // 创建/dev/__properties__设备文件
    mkdir("/dev/__properties__", S_IRWXU | S_IXGRP | S_IXOTH);

    // 创建和初始化属性的共享内存空间，将/dev/__properties__设备文件映射到共享内存
    if (__system_property_area_init()) {
        LOG(FATAL) << "Failed to initialize property area";
    }

    // 初始化系统已有属性值
    PropertyLoadBootDefaults();

}

// 加载属性值
void PropertyLoadBootDefaults() {
    // TODO(b/117892318): merge prop.default and build.prop files into one
    // We read the properties and their values into a map, in order to always allow properties
    // loaded in the later property files to override the properties in loaded in the earlier
    // property files, regardless of if they are "ro." properties or not.
    std::map<std::string, std::string> properties;
    if (!load_properties_from_file("/system/etc/prop.default", nullptr, &properties)) {
        // Try recovery path
        if (!load_properties_from_file("/prop.default", nullptr, &properties)) {
            // Try legacy path
            load_properties_from_file("/default.prop", nullptr, &properties);
        }
    }
    load_properties_from_file("/system/build.prop", nullptr, &properties);
    load_properties_from_file("/system_ext/build.prop", nullptr, &properties);
    load_properties_from_file("/vendor/default.prop", nullptr, &properties);
    load_properties_from_file("/vendor/build.prop", nullptr, &properties);
    if (SelinuxGetVendorAndroidVersion() >= __ANDROID_API_Q__) {
        load_properties_from_file("/odm/etc/build.prop", nullptr, &properties);
    } else {
        load_properties_from_file("/odm/default.prop", nullptr, &properties);
        load_properties_from_file("/odm/build.prop", nullptr, &properties);
    }
    load_properties_from_file("/product/build.prop", nullptr, &properties);
    load_properties_from_file("/factory/factory.prop", "ro.*", &properties);

    if (access(kDebugRamdiskProp, R_OK) == 0) {
        LOG(INFO) << "Loading " << kDebugRamdiskProp;
        load_properties_from_file(kDebugRamdiskProp, nullptr, &properties);
    }

    for (const auto& [name, value] : properties) {
        std::string error;
        if (PropertySet(name, value, &error) != PROP_SUCCESS) {
            LOG(ERROR) << "Could not set '" << name << "' to '" << value
                       << "' while loading .prop files" << error;
        }
    }

    property_initialize_ro_product_props();
    property_derive_build_props();

    update_sys_usb_config();
}


// persist.sys.usb.config values can't be combined on build-time when property
// files are split into each partition.
// So we need to apply the same rule of build/make/tools/post_process_props.py
// on runtime.
static void update_sys_usb_config() {
    bool is_debuggable = android::base::GetBoolProperty("ro.debuggable", false);
    std::string config = android::base::GetProperty("persist.sys.usb.config", "");
    // b/150130503, add (config == "none") condition here to prevent appending
    // ",adb" if "none" is explicitly defined in default prop.
    if (config.empty() || config == "none") {
        InitPropertySet("persist.sys.usb.config", is_debuggable ? "adb" : "none");
    } else if (is_debuggable && config.find("adb") == std::string::npos &&
               config.length() + 4 < PROP_VALUE_MAX) {
        config.append(",adb");
        InitPropertySet("persist.sys.usb.config", config);
    }
}


void StartPropertyService(int* epoll_socket) {
    InitPropertySet("ro.property_service.version", "2");

    int sockets[2];
    if (socketpair(AF_UNIX, SOCK_SEQPACKET | SOCK_CLOEXEC, 0, sockets) != 0) {
        PLOG(FATAL) << "Failed to socketpair() between property_service and init";
    }
    *epoll_socket = from_init_socket = sockets[0];
    init_socket = sockets[1];
    StartSendingMessages();

    // 创建一个socket, 并将该socket与 dev/socket/property_service设备文件绑定
    if (auto result = CreateSocket(PROP_SERVICE_NAME, SOCK_STREAM | SOCK_CLOEXEC | SOCK_NONBLOCK,
                                   false, 0666, 0, 0, {});
        result.ok()) {
        property_set_fd = *result;
    } else {
        LOG(FATAL) << "start_property_service socket creation failed: " << result.error();
    }

    listen(property_set_fd, 8);

    auto new_thread = std::thread{PropertyServiceThread};
    property_service_thread.swap(new_thread);
}

```

## /dev/socket/property_service

```txt

qssi:/ # netstat -apn
unix  2      [ ACC ]     STREAM     LISTENING        19757 1/init             /dev/socket/property_service

```

## dev/__properties__

```txt

qssi:/ # ls -al dev/__properties__/
total 1220
drwx--x--x  2 root root   5220 1970-01-04 05:23 .
drwxr-xr-x 26 root root   3960 2020-12-21 11:03 ..
-r--r--r--  1 root root 131072 1970-01-04 05:23 properties_serial
-r--r--r--  1 root root  60948 1970-01-04 05:23 property_info                // 将加载属性信息到内存
-r--r--r--  1 root root 131072 1970-01-04 05:23 u:object_r:adbd_prop:s0
-r--r--r--  1 root root 131072 1970-01-04 05:23 u:object_r:apexd_prop:s0
-r--r--r--  1 root root 131072 1970-01-04 05:23 u:object_r:apk_verity_prop:s0
-r--r--r--  1 root root 131072 1970-01-04 05:23 u:object_r:audio_prop:s0
...
...

```

## 系统属性设置

### SystemProperties

./frameworks/base/core/java/android/os/SystemProperties.java

```java

public class SystemProperties {

    @FastNative
    @UnsupportedAppUsage(maxTargetSdk = Build.VERSION_CODES.P)
    private static native String native_get(String key, String def);

    @UnsupportedAppUsage(maxTargetSdk = Build.VERSION_CODES.P)
    private static native void native_set(String key, String def);

}

```

### android_os_SystemProperties.cpp

./frameworks/base/core/jni/android_os_SystemProperties.cpp

```cpp

template<typename Functor>
void ReadProperty(JNIEnv* env, jstring keyJ, Functor&& functor)
{
    ScopedUtfChars key(env, keyJ);
    if (!key.c_str()) {
        return;
    }
#if defined(__BIONIC__)
    const prop_info* prop = __system_property_find(key.c_str());  // 读取系统属性
    if (!prop) {
        return;
    }
    ReadProperty(prop, std::forward<Functor>(functor));
#else
    std::forward<Functor>(functor)(
        android::base::GetProperty(key.c_str(), "").c_str());
#endif
}

// 获取属性
jstring SystemProperties_getSS(JNIEnv* env, jclass clazz, jstring keyJ,
                               jstring defJ)
{
    jstring ret = defJ;
    ReadProperty(env, keyJ, [&](const char* value) {
        if (value[0]) {
            ret = env->NewStringUTF(value);
        }
    });
    if (ret == nullptr && !env->ExceptionCheck()) {
      ret = env->NewStringUTF("");  // Legacy behavior
    }
    return ret;
}


// 设置属性
void SystemProperties_set(JNIEnv *env, jobject clazz, jstring keyJ,
                          jstring valJ)
{
    ScopedUtfChars key(env, keyJ);
    if (!key.c_str()) {
        return;
    }
    std::optional<ScopedUtfChars> value;
    if (valJ != nullptr) {
        value.emplace(env, valJ);
        if (!value->c_str()) {
            return;
        }
    }
    bool success;
#if defined(__BIONIC__)
    success = !__system_property_set(key.c_str(), value ? value->c_str() : "");   // 设置系统属性
#else
    success = android::base::SetProperty(key.c_str(), value ? value->c_str() : "");
#endif
    if (!success) {
        jniThrowException(env, "java/lang/RuntimeException",
                          "failed to set system property (check logcat for reason)");
    }
}

int register_android_os_SystemProperties(JNIEnv *env)
{
    const JNINativeMethod method_table[] = {
        { "native_get",
          "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",
          (void*) SystemProperties_getSS },
        { "native_set", "(Ljava/lang/String;Ljava/lang/String;)V",
          (void*) SystemProperties_set },
    };
    return RegisterMethodsOrDie(env, "android/os/SystemProperties",
                                method_table, NELEM(method_table));
}

```

### system_properties.cpp

bionic/libc/include/sys/system_properties.h

```h

#define PROP_VALUE_MAX  92

/*
 * Sets system property `name` to `value`, creating the system property if it doesn't already exist.
 */
int __system_property_set(const char* __name, const char* __value);

/*
 * Returns a `prop_info` corresponding system property `name`, or nullptr if it doesn't exist.
 * Use __system_property_read_callback to query the current value.
 *
 * Property lookup is expensive, so it can be useful to cache the result of this function.
 */
const prop_info* __system_property_find(const char* __name);

```



