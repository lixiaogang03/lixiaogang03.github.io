---
layout:     post
title:      Android 11 Property System
subtitle:   属性系统
date:       2020-12-21
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
---

[Android属性系统-简书](https://www.jianshu.com/p/d9a49248a1b5)

## 架构图

![property_system](/images/android/property/property_system.webp)

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

```cpp

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

### init maps

加载init 进程空间的各种文件

```txt

qssi:/ # showmap 1
 virtual                     shared   shared  private  private
    size      RSS      PSS    clean    dirty    clean    dirty     swap  swapPSS   #  object
-------- -------- -------- -------- -------- -------- -------- -------- -------- ---- ------------------------------
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/properties_serial
     120      120        0        0      120        0        0        0        0    2 /dev/__properties__/property_info
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:adbd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:apexd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:apk_verity_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:audio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:binder_cache_bluetooth_server_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:binder_cache_system_server_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:binder_cache_telephony_server_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:bluetooth_a2dp_offload_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:bluetooth_audio_hal_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:bluetooth_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:bootloader_boot_reason_prop:s0
     128       20       14        0       12        0        8        0        0    1 /dev/__properties__/u:object_r:boottime_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:boottime_public_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:bpf_progs_loaded_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:bq_config_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:charger_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:cold_boot_done_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:config_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:cppreopt_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:cpu_variant_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_adbd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_apexd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_bootanim_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_bugreport_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_console_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_dpmd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_dumpstate_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_fuse_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_gsid_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_interface_restart_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_interface_start_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_interface_stop_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_mdnsd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_restart_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_rildaemon_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_sigstop_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_start_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ctl_stop_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:dalvik_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:debug_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:debuggerd_prop:s0
     128       40        0        0       40        0        0        0        0    1 /dev/__properties__/u:object_r:default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_activity_manager_native_boot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_boot_count_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_configuration_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_input_native_boot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_media_native_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_netd_native_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_reset_performed_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_runtime_native_boot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_runtime_native_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_storage_native_boot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_sys_traced_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_config_window_manager_native_boot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:device_logging_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:dhcp_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:dumpstate_options_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:dumpstate_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:dynamic_system_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported2_config_prop:s0
     128       12        0        0       12        0        0        0        0    1 /dev/__properties__/u:object_r:exported2_default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported2_radio_prop:s0
     128        4        1        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:exported2_system_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported2_vold_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:exported3_default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported3_radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported3_system_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_audio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_bluetooth_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_camera_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:exported_config_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_dalvik_prop:s0
     128       12        0        0       12        0        0        0        0    1 /dev/__properties__/u:object_r:exported_default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_dumpstate_prop:s0
     128        4        4        0        0        0        4        0        0    1 /dev/__properties__/u:object_r:exported_ffs_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_fingerprint_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_overlay_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_pm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_secure_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_system_prop:s0
     128        4        1        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:exported_system_radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_vold_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:exported_wifi_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:fastbootd_protocol_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ffs_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:fingerprint_prop:s0
     128        4        2        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:firstboot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:graphics_config_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:gsid_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:heapprofd_enabled_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:heapprofd_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:hwservicemanager_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:incremental_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:init_perf_lsm_hooks_prop:s0
     128       16       16        0        0        0       16        0        0    1 /dev/__properties__/u:object_r:init_svc_debug_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:last_boot_reason_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:llkd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:lmkd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:log_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:log_tag_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:logd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:logpersistd_logging_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:lowpan_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:lpdumpd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:media_variant_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:mmc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:mock_ota_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:module_sdkextensions_prop:s0
     128        4        4        0        0        0        4        0        0    1 /dev/__properties__/u:object_r:net_dns_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:net_radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:netd_stable_secret_prop:s0
     128        4        4        0        0        0        4        0        0    1 /dev/__properties__/u:object_r:nfc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:nnapi_ext_deny_product_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:ota_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:overlay_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:pan_result_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:persist_debug_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:persistent_properties_ready_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:pm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:powerctl_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:rebootescrow_hal_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:restorecon_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:safemode_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:serialno_prop:s0
     128        4        2        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:shell_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:socket_hook_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:storage_config_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:surfaceflinger_display_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:system_adbd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:system_boot_reason_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:system_jvmti_agent_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:system_lmk_prop:s0
     128        8        0        0        8        0        0        0        0    1 /dev/__properties__/u:object_r:system_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:system_radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:system_trace_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:test_boot_reason_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:test_harness_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:theme_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:time_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:traced_enabled_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:traced_lazy_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:traced_perf_enabled_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:use_memfd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:userspace_reboot_config_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:userspace_reboot_exported_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:userspace_reboot_log_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:userspace_reboot_test_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vehicle_hal_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_adsprpc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_alarm_boot_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_audio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_bluetooth_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_boot_mode_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_bservice_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_camera_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_cap_configstore_dbg_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_cgroup_follow_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_cnd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_cnd_vendor_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_console_log_level_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_core_ctl_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_crash_cnt_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_crash_detect_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_netmgrd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_port-bridge_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_qcrild_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_qmuxd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_vendor_hbtp_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_vendor_imsrcsservice_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_vendor_mmid_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_vendor_rmt_storage_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ctl_vendor_wigigsvc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_data_ko_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_data_qmipriod_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_data_shsusr_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_dataadpl_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_dataqdp_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_dataqti_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_dbg_brkpoint_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_dcvs_prop:s0
     128       16        4        0       16        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_disable_spu_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_display_notch_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_display_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_exported_odm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_exported_system_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_fst_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_gpu_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_gralloc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_hvdcp_opti_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ims_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_iop_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ipacm-diag_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ipacm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_km_strongbox_version_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_location_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_mdm_helper_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_mm_osal_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_mm_parser_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_mm_video_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_mmi_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_modem_diag_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_mpctl_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_msm_irqbalance_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_myapp_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_nfc_nq_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_nfc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_pd_locater_dbg_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_per_mgr_state_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_persist_camera_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_persist_dpm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_public_vendor_default_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qcc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qdcmss_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qspm_dbg_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qspm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qvr_persist_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qvr_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qvrd_persist_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_qvrd_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_radio_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ramdump_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_reschedule_service_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_scroll_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_security_patch_level_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_sensors_dbg_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_sensors_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_slm_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_soc_id_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_soc_name_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_socket_hook_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_spcomlib_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_ssr_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_sxr_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_sys_video_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_system_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_tee_listener_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_time_service_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_usb_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_video_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wfd_service_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wfd_sys_debug_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wfd_vendor_debug_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wifi_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wifi_version:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wigig_core_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wigig_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_wlc_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vendor_xlat_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:virtual_ab_prop:s0
     128        4        0        0        4        0        0        0        0    1 /dev/__properties__/u:object_r:vndk_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:vold_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:wifi_log_prop:s0
     128        0        0        0        0        0        0        0        0    1 /dev/__properties__/u:object_r:wifi_prop:s0
       4        4        0        0        4        0        0        0        0    1 /dev/cgroup_info/cgroup.rc
     952      140       91       72        0       64        4       32       32    4 /system/bin/bootstrap/linker64
     984      928      579      644        0      280        4        0        0    4 /system/bin/init
     756      576      246      516        0       56        4        4        4    4 /system/lib64/bootstrap/libc.so
      12        4        2        4        0        0        0        4        4    3 /system/lib64/bootstrap/libdl.so
      12        0        0        0        0        0        0        4        4    3 /system/lib64/bootstrap/libdl_android.so
     220        0        0        0        0        0        0        8        8    4 /system/lib64/bootstrap/libm.so
     156        0        0        0        0        0        0       16       16    4 /system/lib64/libbacktrace.so
     244      180        9      172        0        8        0        0        0    4 /system/lib64/libbase.so
      92        0        0        0        0        0        0        8        8    4 /system/lib64/libbootloader_message.so
     688      600       18      584        0       16        0       16       16    4 /system/lib64/libc++.so
      20       12        4        8        0        4        0        4        4    4 /system/lib64/libcgrouprc.so
    1096        0        0        0        0        0        0       68       68    6 /system/lib64/libcrypto.so
      12        0        0        0        0        0        0        4        4    3 /system/lib64/libcrypto_utils.so
      72       60        0       60        0        0        0       12       12    4 /system/lib64/libcutils.so
      20        0        0        0        0        0        0        8        8    4 /system/lib64/libdexfile_support.so
      24        0        0        0        0        0        0        8        8    4 /system/lib64/libext2_uuid.so
      20        0        0        0        0        0        0        8        8    4 /system/lib64/libext4_utils.so
      88        0        0        0        0        0        0        8        8    4 /system/lib64/libfec.so
     516        0        0        0        0        0        0       16       16    4 /system/lib64/libfs_mgr.so
      16        0        0        0        0        0        0        4        4    3 /system/lib64/libgsi.so
      56        0        0        0        0        0        0        4        4    3 /system/lib64/libhidl-gen-utils.so
     124        0        0        0        0        0        0        4        4    3 /system/lib64/libjsoncpp.so
      12        0        0        0        0        0        0        4        4    3 /system/lib64/libkeyutils.so
      72       72        8       64        0        4        4        0        0    4 /system/lib64/liblog.so
      24        0        0        0        0        0        0        8        8    4 /system/lib64/liblogwrap.so
     160        0        0        0        0        0        0        8        8    4 /system/lib64/liblp.so
     152        0        0        0        0        0        0        8        8    4 /system/lib64/liblzma.so
      36       36        8       28        0        8        0        0        0    4 /system/lib64/libnetd_client.so
      12        0        0        0        0        0        0        4        4    3 /system/lib64/libpackagelistparser.so
     320      204       48      200        0        4        0        4        4    4 /system/lib64/libpcre2.so
     252      252       14      240        0       12        0        0        0    4 /system/lib64/libprocessgroup.so
      28        0        0        0        0        0        0        4        4    3 /system/lib64/libprocessgroup_setup.so
     100      100        9       92        0        4        4        0        0    4 /system/lib64/libselinux.so
      40        0        0        0        0        0        0        8        8    4 /system/lib64/libsparse.so
      12        0        0        0        0        0        0        4        4    3 /system/lib64/libsquashfs_utils.so
     444        0        0        0        0        0        0       24       24    4 /system/lib64/libunwindstack.so
     120      108        0      108        0        0        0        8        8    4 /system/lib64/libutils.so
      16        4        0        4        0        0        0        8        8    4 /system/lib64/libvndksupport.so
      92        0        0        0        0        0        0        8        8    4 /system/lib64/libz.so
       4        0        0        0        0        0        0        0        0    1 /vendor/etc/passwd
     244       96       96        0        0       16       80       48       48   12 [anon:.bss]
      12        8        8        0        0        8        0        4        4    1 [anon:System property context nodes]
       8        0        0        0        0        0        0        8        8    2 [anon:arc4random data]
       8        0        0        0        0        0        0        8        8    2 [anon:atexit handlers]
      36        0        0        0        0        0        0       36       36    6 [anon:bionic_alloc_small_objects]
 2097152        4        4        0        0        4        0        4        4    5 [anon:cfi shadow]
    1200        0        0        0        0        0        0       36       36    3 [anon:linker_alloc]
   11008     1188     1188        0        0      776      412     3412     3412   37 [anon:scudo:primary]
    1008       20       20        0        0        0       20        4        4    1 [anon:stack_and_tls:476]
      16        8        8        0        0        4        4        8        8    1 [anon:stack_and_tls:main]
      64        0        0        0        0        0        0        0        0    2 [anon:thread signal stack]
10245444        0        0        0        0        0        0        0        0   52 [anon]
     132       24       24        0        0        4       20       96       96    1 [stack]
       4        4        0        4        0        0        0        0        0    1 [vdso]
       4        4        0        4        0        0        0        0        0    1 [vvar]
-------- -------- -------- -------- -------- -------- -------- -------- -------- ---- ------------------------------
 virtual                     shared   shared  private  private
    size      RSS      PSS    clean    dirty    clean    dirty     swap  swapPSS   #  object
-------- -------- -------- -------- -------- -------- -------- -------- -------- ---- ------------------------------
12397564     4956     2436     2804      288     1272      592     4004     4004  537 TOTAL

```

## 属性命名规范

### adnroid 4.4

system/core/init/property_service.c

```c

/* White list of permissions for setting property services. */
struct {
    const char *prefix;
    unsigned int uid;
    unsigned int gid;
} property_perms[] = {
    { "net.rmnet0.",      AID_RADIO,    0 },
    { "net.gprs.",        AID_RADIO,    0 },
    { "net.ppp",          AID_RADIO,    0 },
    { "net.qmi",          AID_RADIO,    0 },
    { "net.lte",          AID_RADIO,    0 },
    { "net.cdma",         AID_RADIO,    0 },
    { "ril.",             AID_RADIO,    0 },
    { "gsm.",             AID_RADIO,    0 },
    { "persist.radio",    AID_RADIO,    0 },
    { "net.dns",          AID_RADIO,    0 },
    { "sys.usb.config",   AID_RADIO,    0 },
    { "net.",             AID_SYSTEM,   0 },
    { "dev.",             AID_SYSTEM,   0 },
    { "runtime.",         AID_SYSTEM,   0 },
    { "hw.",              AID_SYSTEM,   0 },
    { "sys.",             AID_SYSTEM,   0 },
    { "sys.powerctl",     AID_SHELL,    0 },
    { "service.",         AID_SYSTEM,   0 },
    { "wlan.",            AID_SYSTEM,   0 },
    { "bluetooth.",       AID_BLUETOOTH,   0 },
    { "dhcp.",            AID_SYSTEM,   0 },
    { "dhcp.",            AID_DHCP,     0 },
    { "debug.",           AID_SYSTEM,   0 },
    { "debug.",           AID_SHELL,    0 },
    { "log.",             AID_SHELL,    0 },
    { "service.adb.root", AID_SHELL,    0 },
    { "service.adb.tcp.port", AID_SHELL,    0 },
    { "persist.sys.",     AID_SYSTEM,   0 },
    { "persist.service.", AID_SYSTEM,   0 },
    { "persist.security.", AID_SYSTEM,   0 },
    { "persist.service.bdroid.", AID_BLUETOOTH,   0 },
    { "selinux."         , AID_SYSTEM,   0 },
    { "wfd.enable",        AID_MEDIA,    0 },
    { NULL, 0, 0 }
};

```

### android 5.0以上

external/sepolicy/property_contexts

system/sepolicy/property_contexts

```txt

##########################
# property service keys
#
#
net.rmnet               u:object_r:net_radio_prop:s0
net.gprs                u:object_r:net_radio_prop:s0
net.ppp                 u:object_r:net_radio_prop:s0
net.qmi                 u:object_r:net_radio_prop:s0
net.lte                 u:object_r:net_radio_prop:s0
net.cdma                u:object_r:net_radio_prop:s0
net.dns                 u:object_r:net_radio_prop:s0
sys.usb.config          u:object_r:system_radio_prop:s0
ril.                    u:object_r:radio_prop:s0
gsm.                    u:object_r:radio_prop:s0
persist.radio           u:object_r:radio_prop:s0

net.                    u:object_r:system_prop:s0
dev.                    u:object_r:system_prop:s0
runtime.                u:object_r:system_prop:s0
hw.                     u:object_r:system_prop:s0
sys.                    u:object_r:system_prop:s0
sys.powerctl            u:object_r:powerctl_prop:s0
sys.usb.ffs.            u:object_r:ffs_prop:s0
service.                u:object_r:system_prop:s0
wlan.                   u:object_r:system_prop:s0
dhcp.                   u:object_r:dhcp_prop:s0
dhcp.bt-pan.result      u:object_r:pan_result_prop:s0
bluetooth.              u:object_r:bluetooth_prop:s0

debug.                  u:object_r:debug_prop:s0
debug.db.               u:object_r:debuggerd_prop:s0
log.                    u:object_r:shell_prop:s0
service.adb.root        u:object_r:shell_prop:s0
service.adb.tcp.port    u:object_r:shell_prop:s0

persist.audio.          u:object_r:audio_prop:s0
persist.logd.           u:object_r:logd_prop:s0
persist.sys.            u:object_r:system_prop:s0
persist.service.        u:object_r:system_prop:s0
persist.service.bdroid. u:object_r:bluetooth_prop:s0
persist.security.       u:object_r:system_prop:s0

# selinux non-persistent properties
selinux.restorecon_recursive   u:object_r:restorecon_prop:s0
selinux.                       u:object_r:security_prop:s0

# default property context
*                       u:object_r:default_prop:s0

# data partition encryption properties
vold.                   u:object_r:vold_prop:s0
crypto.                 u:object_r:vold_prop:s0

# ro.build.fingerprint is either set in /system/build.prop, or is
# set at runtime by system_server.
build.fingerprint       u:object_r:fingerprint_prop:s0

# ctl properties
ctl.bootanim            u:object_r:ctl_bootanim_prop:s0
ctl.dumpstate           u:object_r:ctl_dumpstate_prop:s0

```




