---
layout:     post
title:      Android R Selinux
subtitle:   增强型Linux
date:       2020-11-12
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Android
---

[Android Seinux-Google](https://source.android.google.cn/security/selinux?hl=zh-cn)

## ServiceManager

system/sepolicy/public/service.te

```txt

type activity_service, app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
type package_service, app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
type statusbar_service, app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
type nfc_service,               service_manager_type;
type default_android_service,   service_manager_type;


```

system/sepolicy/private/service_context

```txt

activity                                  u:object_r:activity_service:s0
package                                   u:object_r:package_service:s0
statusbar                                 u:object_r:statusbar_service:s0
nfc                                       u:object_r:nfc_service:s0
window                                    u:object_r:window_service:s0
*                                         u:object_r:default_android_service:s0

```

system/sepolicy/private/system_server.te

```txt

allow system_server nfc_service:service_manager find;

```

system/sepolicy/private/system_app.te

```txt

# TODO: scope this down? Too broad?
allow system_app {
  service_manager_type
  -apex_service
  -dnsresolver_service
  -dumpstate_service
  -installd_service
  -iorapd_service
  -lpdump_service
  -netd_service
  -system_suspend_control_service
  -virtual_touchpad_service
  -vold_service
  -vr_hwc_service
  -default_android_service
}:service_manager find;

```

system/sepolicy/private/untrusted_app_.te

```txt

allow untrusted_app_all audioserver_service:service_manager find;
allow untrusted_app_all cameraserver_service:service_manager find;
allow untrusted_app_all drmserver_service:service_manager find;
allow untrusted_app_all mediaserver_service:service_manager find;
allow untrusted_app_all mediaextractor_service:service_manager find;
allow untrusted_app_all mediametrics_service:service_manager find;
allow untrusted_app_all mediadrmserver_service:service_manager find;
allow untrusted_app_all nfc_service:service_manager find;
allow untrusted_app_all radio_service:service_manager find;
allow untrusted_app_all app_api_service:service_manager find;
allow untrusted_app_all vr_manager_service:service_manager find;
allow untrusted_app_all gpu_service:service_manager find;

```

## 调试

```txt

adb shell su root dmesg | grep 'avc: '

10-30 17:25:18.904   510   510 E SELinux : avc:  denied  { add } for pid=976 uid=1000 name=sunmi_perception_service scontext=u:r:system_server:s0 tcontext=u:object_r:default_android_service:s0 tclass=service_manager permissive=0
10-30 17:25:37.514   510   510 E SELinux : avc:  denied  { find } for pid=1676 uid=1000 name=sunmi_perception_service scontext=u:r:system_server:s0 tcontext=u:object_r:default_android_service:s0 tclass=service_manager permissive=0
10-30 17:25:37.520   510   510 E SELinux : avc:  denied  { find } for pid=1676 uid=1000 name=sunmi_system_server scontext=u:r:system_server:s0 tcontext=u:object_r:default_android_service:s0 tclass=service_manager permissive=0

```

以下是此拒绝事件的关键元素：

* 操作 - 试图进行的操作会使用括号突出显示：read write 或 setenforce
* 操作方 - scontext（来源环境）条目表示操作方；在此例中为 rmt_storage 守护程序
* 对象 - tcontext（目标环境）条目表示对哪个对象执行操作；在此例中为 kmem
* 结果 - tclass（目标类别）条目表示操作对象的类型；在此例中为 chr_file（字符设备）







