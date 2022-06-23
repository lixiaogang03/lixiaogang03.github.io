---
layout:     post
title:      Android Root su
subtitle:   App run su command rk3288 android 7
date:       2022-06-23
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - root
---

## build

**Android.mk**

LOCAL_MODULE_TAGS := optional

**device.mk**

PRODUCT_PACKAGES += su

## system/extras/su/su.c

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

## system/core/libcutils/fs_config.c

//    { 04750, AID_ROOT,      AID_SHELL,     0, "system/xbin/su" },
    { 06755, AID_ROOT,      AID_SHELL,     CAP_MASK_LONG(CAP_SETUID) | CAP_MASK_LONG(CAP_SETGID), "system/xbin/su" },


## frameworks/base/cmds/app_process/app_main.cpp

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

## frameworks/base/core/jni/com_android_internal_os_Zygote.cpp

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



