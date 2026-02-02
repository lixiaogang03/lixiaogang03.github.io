---
layout:     post
title:      Android Root su
subtitle:   App run su command rk3288 android 7
date:       2022-06-23
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
---

## 概念

**adb root**

指的是 adbd 守护进程的权限是 root 组，非 root 时是 shell 组

```txt

rk3288:/ $ ps | grep adb
shell     2250  1     108556 944            0 00000000 S /sbin/adbd
root     2250  1     108556 944            0 00000000 S /sbin/adbd

```

**app root**

指的是 app 本身的权限组

```txt

system    939   219   1055416 133120          0 00000000 S com.android.settings
u0_a44    1564  219   1003732 74248          0 00000000 S com.iflytek.speechcloud

```



## build

**Android.mk**

LOCAL_MODULE_TAGS := optional

**device.mk**

PRODUCT_PACKAGES += su

## su.c

system/extras/su/su.c

```c

int main(int argc, char** argv) {
    uid_t current_uid = getuid();

    //delete by lixiaogang
    //if (current_uid != AID_ROOT && current_uid != AID_SHELL) error(1, 0, "not allowed");

    // Handle -h and --help.
    ++argv;
    if (*argv && (strcmp(*argv, "--help") == 0 || strcmp(*argv, "-h") == 0)) {
        fprintf(stderr,
                "usage: su [UID[,GID[,GID2]...]] [COMMAND [ARG...]]\n"
                "\n"
                "Switch to WHO (default 'root') and run the given command (default sh).\n"
                "\n"
                "where WHO is a comma-separated list of user, group,\n"
                "and supplementary groups in that order.\n"
                "\n");
        return 0;
    }

    // The default user is root.
    uid_t uid = 0;
    gid_t gid = 0;

    // If there are any arguments, the first argument is the uid/gid/supplementary groups.
    if (*argv) {
        gid_t gids[10];
        int gids_count = sizeof(gids)/sizeof(gids[0]);
        extract_uidgids(*argv, &uid, &gid, gids, &gids_count);
        if (gids_count) {
            if (setgroups(gids_count, gids)) {
                error(1, errno, "setgroups failed");
            }
        }
        ++argv;
    }

    if (setgid(gid)) error(1, errno, "setgid failed");
    if (setuid(uid)) error(1, errno, "setuid failed");

    // Reset parts of the environment.
    setenv("PATH", _PATH_DEFPATH, 1);
    unsetenv("IFS");
    struct passwd* pw = getpwuid(uid);
    if (pw) {
        setenv("LOGNAME", pw->pw_name, 1);
        setenv("USER", pw->pw_name, 1);
    } else {
        unsetenv("LOGNAME");
        unsetenv("USER");
    }

    // Set up the arguments for exec.
    char* exec_args[argc + 1];  // Having too much space is fine.
    size_t i = 0;
    for (; *argv != NULL; ++i) {
      exec_args[i] = *argv++;
    }
    // Default to the standard shell.
    if (i == 0) exec_args[i++] = "/system/bin/sh";
    exec_args[i] = NULL;

    execvp(exec_args[0], exec_args);
    error(1, errno, "failed to exec %s", exec_args[0]);
}

```

## fs_config.c

system/core/libcutils/fs_config.c

```c

//    { 04750, AID_ROOT,      AID_SHELL,     0, "system/xbin/su" },
    { 06755, AID_ROOT,      AID_SHELL,     CAP_MASK_LONG(CAP_SETUID) | CAP_MASK_LONG(CAP_SETGID), "system/xbin/su" },

```

## app_main.cpp

frameworks/base/cmds/app_process/app_main.cpp

```c

 int main(int argc, char* const argv[])
 {
    //delete by lixiaogang start
    /*if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) < 0) {
         // Older kernels don't understand PR_SET_NO_NEW_PRIVS and return
         // EINVAL. Don't die on such kernels.
         if (errno != EINVAL) {
             LOG_ALWAYS_FATAL("PR_SET_NO_NEW_PRIVS failed: %s", strerror(errno));
             return 12;
         }
    }*/
    //delete by lixiaogang end

  }

```

## com_android_internal_os_Zygote.cpp

frameworks/base/core/jni/com_android_internal_os_Zygote.cpp

```c

 static void DropCapabilitiesBoundingSet(JNIEnv* env) {
  //delete by lixiaogang start
  /*for (int i = 0; prctl(PR_CAPBSET_READ, i, 0, 0, 0) >= 0; i++) {
     int rc = prctl(PR_CAPBSET_DROP, i, 0, 0, 0);
     if (rc == -1) {
       if (errno == EINVAL) {
@@ -235,7 +236,8 @@ static void DropCapabilitiesBoundingSet(JNIEnv* env) {
         RuntimeAbort(env, __LINE__, "prctl(PR_CAPBSET_DROP) failed");
       }
     }
  }*/
  //delete by lixiaogang end
 }

```

## android 11

```diff

commit e2ddb9d0d2817122deaa08f67fbe3b3f23908c92
Author: xiaogang.li <xiaogang.li@xintiangui.com>
Date:   Wed Mar 20 11:36:10 2024 +0800

    user版本支持su命令

diff --git a/android/frameworks/base/core/jni/com_android_internal_os_Zygote.cpp b/android/frameworks/base/core/jni/com_android_internal_os_Zygote.cpp
index 9eede83e21..e6f22b2407 100644
--- a/android/frameworks/base/core/jni/com_android_internal_os_Zygote.cpp
+++ b/android/frameworks/base/core/jni/com_android_internal_os_Zygote.cpp
@@ -656,7 +656,8 @@ static void EnableKeepCapabilities(fail_fn_t fail_fn) {
 }
 
 static void DropCapabilitiesBoundingSet(fail_fn_t fail_fn) {
-  for (int i = 0; prctl(PR_CAPBSET_READ, i, 0, 0, 0) >= 0; i++) {;
+  //delete by lixiaogang start
+  /*for (int i = 0; prctl(PR_CAPBSET_READ, i, 0, 0, 0) >= 0; i++) {;
     if (prctl(PR_CAPBSET_DROP, i, 0, 0, 0) == -1) {
       if (errno == EINVAL) {
         ALOGE("prctl(PR_CAPBSET_DROP) failed with EINVAL. Please verify "
@@ -665,7 +666,8 @@ static void DropCapabilitiesBoundingSet(fail_fn_t fail_fn) {
         fail_fn(CREATE_ERROR("prctl(PR_CAPBSET_DROP, %d) failed: %s", i, strerror(errno)));
       }
     }
-  }
+  }*/
+  //delete by lixiaogang end
 }
 
 static void SetInheritable(uint64_t inheritable, fail_fn_t fail_fn) {
diff --git a/android/kernel/security/commoncap.c b/android/kernel/security/commoncap.c
index 876cfe01d9..207cbeadd5 100644
--- a/android/kernel/security/commoncap.c
+++ b/android/kernel/security/commoncap.c
@@ -1167,10 +1167,12 @@ static int cap_prctl_drop(unsigned long cap)
 {
 	struct cred *new;
 
+	/* delete by lixiaogang for root permission
 	if (!ns_capable(current_user_ns(), CAP_SETPCAP))
 		return -EPERM;
 	if (!cap_valid(cap))
 		return -EINVAL;
+	*/
 
 	new = prepare_creds();
 	if (!new)
diff --git a/android/system/core/libcutils/fs_config.cpp b/android/system/core/libcutils/fs_config.cpp
index 5805a4d19b..900bd0b12f 100644
--- a/android/system/core/libcutils/fs_config.cpp
+++ b/android/system/core/libcutils/fs_config.cpp
@@ -85,7 +85,7 @@ static const struct fs_path_config android_dirs[] = {
     { 00751, AID_ROOT,         AID_SHELL,        0, "system/bin" },
     { 00755, AID_ROOT,         AID_ROOT,         0, "system/etc/ppp" },
     { 00755, AID_ROOT,         AID_SHELL,        0, "system/vendor" },
-    { 00751, AID_ROOT,         AID_SHELL,        0, "system/xbin" },
+    { 00755, AID_ROOT,         AID_SHELL,        0, "system/xbin" },
     { 00751, AID_ROOT,         AID_SHELL,        0, "system/apex/*/bin" },
     { 00751, AID_ROOT,         AID_SHELL,        0, "system_ext/bin" },
     { 00751, AID_ROOT,         AID_SHELL,        0, "system_ext/apex/*/bin" },
@@ -188,7 +188,7 @@ static const struct fs_path_config android_files[] = {
     // the following two files are INTENTIONALLY set-uid, but they
     // are NOT included on user builds.
     { 06755, AID_ROOT,      AID_ROOT,      0, "system/xbin/procmem" },
-    { 04750, AID_ROOT,      AID_SHELL,     0, "system/xbin/su" },
+    { 06755, AID_ROOT,      AID_SHELL,     0, "system/xbin/su" },
 
     // the following files have enhanced capabilities and ARE included
     // in user builds.
diff --git a/android/system/extras/su/su.cpp b/android/system/extras/su/su.cpp
index 1a1ab6bf40..bb09ade29c 100644
--- a/android/system/extras/su/su.cpp
+++ b/android/system/extras/su/su.cpp
@@ -80,8 +80,10 @@ void extract_uidgids(const char* uidgids, uid_t* uid, gid_t* gid, gid_t* gids, i
 }
 
 int main(int argc, char** argv) {
-    uid_t current_uid = getuid();
-    if (current_uid != AID_ROOT && current_uid != AID_SHELL) error(1, 0, "not allowed");
+    //delete by lixiaogang start
+    //uid_t current_uid = getuid();
+    //if (current_uid != AID_ROOT && current_uid != AID_SHELL) error(1, 0, "not allowed");
+    //delete by lixiaogang end
 
     // Handle -h and --help.
     ++argv;
diff --git a/android/vendor/wif/wif.mk b/android/vendor/wif/wif.mk
index e1dd4cc4b7..ae3077a3ba 100644
--- a/android/vendor/wif/wif.mk
+++ b/android/vendor/wif/wif.mk
@@ -15,5 +15,7 @@ PRODUCT_PACKAGES += \
 
 PRODUCT_PACKAGES += dhcptool
 
+PRODUCT_PACKAGES += su
+

```


