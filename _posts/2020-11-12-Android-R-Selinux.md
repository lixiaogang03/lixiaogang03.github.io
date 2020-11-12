---
layout:     post
title:      Android R Selinux
subtitle:   增强型Linux
date:       2020-11-12
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - selinux
---

[Android Seinux-Google](https://source.android.google.cn/security/selinux?hl=zh-cn)

## ServiceManager

system/sepolicy/public/service.te

```txt

type activity_service, app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
type package_service, app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
type statusbar_service, app_api_service, ephemeral_app_api_service, system_server_service, service_manager_type;
type nfc_service,               service_manager_type;


```

system/sepolicy/private/service_context

```txt

activity                                  u:object_r:activity_service:s0
package                                   u:object_r:package_service:s0
statusbar                                 u:object_r:statusbar_service:s0
nfc                                       u:object_r:nfc_service:s0

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


