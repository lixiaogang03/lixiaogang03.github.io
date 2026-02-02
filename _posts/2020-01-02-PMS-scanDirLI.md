---
layout:     post
title:      PMS scanDirLI
subtitle:   Android启动时的包扫描过程
date:       2020-01-02
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - Android
---

[APK安装流程详解-简书](https://www.jianshu.com/p/f47e45602ad2)

![pms_scan](/images/android/pms/pms_scan.png)

## 卸载系统应用

**adb shell pm uninstall -k --user 0 PACKAGE**

frameworks/base/cmds/pm

### Android.mk

```makefile

LOCAL_PATH:= $(call my-dir)
include $(CLEAR_VARS)

LOCAL_SRC_FILES := $(call all-subdir-java-files)
LOCAL_MODULE := pm
include $(BUILD_JAVA_LIBRARY)


include $(CLEAR_VARS)
ALL_PREBUILT += $(TARGET_OUT)/bin/pm
$(TARGET_OUT)/bin/pm : $(LOCAL_PATH)/pm | $(ACP)
	$(transform-prebuilt-to-target)


```

### pm

system/bin/pm

```sh

# Script to start "pm" on the device, which has a very rudimentary
# shell.
#
base=/system
export CLASSPATH=$base/framework/pm.jar
exec app_process $base/bin com.android.commands.pm.Pm "$@"

```

### Pm.java

```java

public final class Pm {
    private static final String TAG = "Pm";

    public static void main(String[] args) {
        int exitCode = 1;
        try {
            exitCode = new Pm().run(args);
        } catch (Exception e) {
            Log.e(TAG, "Error", e);
            System.err.println("Error: " + e);
            if (e instanceof RemoteException) {
                System.err.println(PM_NOT_RUNNING_ERR);
            }
        }
        System.exit(exitCode);
    }

}

```

### PMS.java

```java

    private boolean deletePackageLIF(String packageName, UserHandle user,
            boolean deleteCodeAndResources, int[] allUserHandles, int flags,
            PackageRemovedInfo outInfo, boolean writeSettings,
            PackageParser.Package replacingPackage) {

        -----------------------------------------------------------------

        // 卸载单个用户的系统应用
        if (((!isSystemApp(ps) || (flags&PackageManager.DELETE_SYSTEM_APP) != 0) && user != null
                && user.getIdentifier() != UserHandle.USER_ALL)) {

            // The caller is asking that the package only be deleted for a single
            // user.  To do this, we just mark its uninstalled state and delete
            // its data. If this is a system app, we only allow this to happen if
            // they have set the special DELETE_SYSTEM_APP which requests different
            // semantics than normal for uninstalling system apps.
            markPackageUninstalledForUserLPw(ps, user);

            if (!isSystemApp(ps)) {

                ----------------------------------------------------------

            } else {

                // This is a system app, so we assume that the
                // other users still have this package installed, so all
                // we need to do is clear this user's data and save that
                // it is uninstalled.
                if (DEBUG_REMOVE) Slog.d(TAG, "Deleting system app");
                if (!clearPackageStateForUserLIF(ps, user.getIdentifier(), outInfo)) {
                    return false;
                }
                scheduleWritePackageRestrictionsLocked(user);
                return true;

            }

        }

        ----------------------------------------------------------------------

   }

```

### pm uninstall

![pm_uninstall](/images/android/pms/pm_uninstall.png)


## 系统应用扫描

**PMS.java**

```java

    private void scanDirLI(File dir, final int parseFlags, int scanFlags, long currentTime) {

        final File[] files = dir.listFiles();
        if (ArrayUtils.isEmpty(files)) {
            Log.d(TAG, "No files in app dir " + dir);
            return;
        }
        if (DEBUG_PACKAGE_SCANNING) {
            Log.d(TAG, "Scanning app dir " + dir + " scanFlags=" + scanFlags
                    + " flags=0x" + Integer.toHexString(parseFlags));
        }

        Log.d(TAG, "start scanDirLI:"+dir);

        for (File file : files) {
            // add by LXG
            if (file.getName() != null && file.getName().startsWith("APKNAME")) {
                Slog.d("LXG", "NO: " + file.getName());
                continue;
            }
        }

    }

```


