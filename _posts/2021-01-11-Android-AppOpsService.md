---
layout:     post
title:      Android AppOpsService
subtitle:   Application Operations Service
date:       2021-01-11
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - permission
---

[Android原生权限管理AppOps-简书](https://www.jianshu.com/p/a26f0dd024a6)

[App Ops](https://appops.rikka.app/zh-hans/guide/)

## 简介

在 Android 系统中存在一个叫做 "appops" 的系统服务，该服务定义了一系列的“应用操作”(application operation, op)。其中部分“应用操作”与“权限”对应（如 OP_CAMERA 与“相机权限”），其余则对应单独的功能（如 OP_READ_CLIPBOARD 与读取剪贴板，但并不存在“读取剪贴板权限”）。

原生 Android 系统使用 appops 来追踪权限使用，appops 也部分被用于权限控制。每个应用都有自己的 "appops" 设置，当应用需要执行某些操作时，系统在检查权限的同时也会检查 "appops" 设置。如果没有授予权限，应用在执行操作时将会收到错误。但不同的是，如果 "appops" 设为ignore，应用不会收到错误只会收到空白数据。

## 架构

![app_ops_service](/images/appops/app_ops_service.png)

## AppOpsManager

```java

@SystemService(Context.APP_OPS_SERVICE)
public class AppOpsManager {

    /**
     * Result from {@link #checkOp}, {@link #noteOp}, {@link #startOp}: the given caller is
     * allowed to perform the given operation.
     */
    public static final int MODE_ALLOWED = 0;

    /**
     * Result from {@link #checkOp}, {@link #noteOp}, {@link #startOp}: the given caller is
     * not allowed to perform the given operation, and this attempt should
     * <em>silently fail</em> (it should not cause the app to crash).
     */
    public static final int MODE_IGNORED = 1;

    /**
     * Result from {@link #checkOpNoThrow}, {@link #noteOpNoThrow}, {@link #startOpNoThrow}: the
     * given caller is not allowed to perform the given operation, and this attempt should
     * cause it to have a fatal error, typically a {@link SecurityException}.
     */
    public static final int MODE_ERRORED = 2;

    /**
     * Result from {@link #checkOp}, {@link #noteOp}, {@link #startOp}: the given caller should
     * use its default security check.  This mode is not normally used; it should only be used
     * with appop permissions, and callers must explicitly check for it and deal with it.
     */
    public static final int MODE_DEFAULT = 3;
    
        /**
     * Special mode that means "allow only when app is in foreground."  This is <b>not</b>
     * returned from {@link #unsafeCheckOp}, {@link #noteOp}, {@link #startOp}.  Rather,
     * {@link #unsafeCheckOp} will always return {@link #MODE_ALLOWED} (because it is always
     * possible for it to be ultimately allowed, depending on the app's background state),
     * and {@link #noteOp} and {@link #startOp} will return {@link #MODE_ALLOWED} when the app
     * being checked is currently in the foreground, otherwise {@link #MODE_IGNORED}.
     *
     * <p>The only place you will this normally see this value is through
     * {@link #unsafeCheckOpRaw}, which returns the actual raw mode of the op.  Note that because
     * you can't know the current state of the app being checked (and it can change at any
     * point), you can only treat the result here as an indication that it will vary between
     * {@link #MODE_ALLOWED} and {@link #MODE_IGNORED} depending on changes in the background
     * state of the app.  You thus must always use {@link #noteOp} or {@link #startOp} to do
     * the actual check for access to the op.</p>
     */
    public static final int MODE_FOREGROUND = 4;
    
        /**
     * This optionally maps a permission to an operation.  If there
     * is no permission associated with an operation, it is null.
     */
    @UnsupportedAppUsage
    private static String[] sOpPerms = new String[] {
            android.Manifest.permission.ACCESS_COARSE_LOCATION,
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            null,
            android.Manifest.permission.VIBRATE,
            android.Manifest.permission.READ_CONTACTS,
            android.Manifest.permission.WRITE_CONTACTS,
            android.Manifest.permission.READ_CALL_LOG,
            android.Manifest.permission.WRITE_CALL_LOG,
            android.Manifest.permission.READ_CALENDAR,
            android.Manifest.permission.WRITE_CALENDAR,
            android.Manifest.permission.ACCESS_WIFI_STATE,
            null, // no permission required for notifications
            null, // neighboring cells shares the coarse location perm
            android.Manifest.permission.CALL_PHONE,
            android.Manifest.permission.READ_SMS,
            null, // no permission required for writing sms
            android.Manifest.permission.RECEIVE_SMS,
            android.Manifest.permission.RECEIVE_EMERGENCY_BROADCAST,
            android.Manifest.permission.RECEIVE_MMS,
            android.Manifest.permission.RECEIVE_WAP_PUSH,
            android.Manifest.permission.SEND_SMS,
            android.Manifest.permission.READ_SMS,
            null, // no permission required for writing icc sms
            android.Manifest.permission.WRITE_SETTINGS,
            android.Manifest.permission.SYSTEM_ALERT_WINDOW,
            android.Manifest.permission.ACCESS_NOTIFICATIONS,
            android.Manifest.permission.CAMERA,
            android.Manifest.permission.RECORD_AUDIO,
            null, // no permission for playing audio
            null, // no permission for reading clipboard
            null, // no permission for writing clipboard
            null, // no permission for taking media buttons
            null, // no permission for taking audio focus
            null, // no permission for changing master volume
            null, // no permission for changing voice volume
            null, // no permission for changing ring volume
            null, // no permission for changing media volume
            null, // no permission for changing alarm volume
            null, // no permission for changing notification volume
            null, // no permission for changing bluetooth volume
            android.Manifest.permission.WAKE_LOCK,
            null, // no permission for generic location monitoring
            null, // no permission for high power location monitoring
            android.Manifest.permission.PACKAGE_USAGE_STATS,
            null, // no permission for muting/unmuting microphone
            null, // no permission for displaying toasts
            null, // no permission for projecting media
            null, // no permission for activating vpn
            null, // no permission for supporting wallpaper
            null, // no permission for receiving assist structure
            null, // no permission for receiving assist screenshot
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.ADD_VOICEMAIL,
            Manifest.permission.USE_SIP,
            Manifest.permission.PROCESS_OUTGOING_CALLS,
            Manifest.permission.USE_FINGERPRINT,
            Manifest.permission.BODY_SENSORS,
            Manifest.permission.READ_CELL_BROADCASTS,
            null,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            null, // no permission for turning the screen on
            Manifest.permission.GET_ACCOUNTS,
            null, // no permission for running in background
            null, // no permission for changing accessibility volume
            Manifest.permission.READ_PHONE_NUMBERS,
            Manifest.permission.REQUEST_INSTALL_PACKAGES,
            null, // no permission for entering picture-in-picture on hide
            Manifest.permission.INSTANT_APP_FOREGROUND_SERVICE,
            Manifest.permission.ANSWER_PHONE_CALLS,
            null, // no permission for OP_RUN_ANY_IN_BACKGROUND
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.REQUEST_DELETE_PACKAGES,
            Manifest.permission.BIND_ACCESSIBILITY_SERVICE,
            Manifest.permission.ACCEPT_HANDOVER,
            Manifest.permission.MANAGE_IPSEC_TUNNELS,
            Manifest.permission.FOREGROUND_SERVICE,
            null, // no permission for OP_BLUETOOTH_SCAN
            Manifest.permission.USE_BIOMETRIC,
            Manifest.permission.ACTIVITY_RECOGNITION,
            Manifest.permission.SMS_FINANCIAL_TRANSACTIONS,
            null,
            null, // no permission for OP_WRITE_MEDIA_AUDIO
            null,
            null, // no permission for OP_WRITE_MEDIA_VIDEO
            null,
            null, // no permission for OP_WRITE_MEDIA_IMAGES
            null, // no permission for OP_LEGACY_STORAGE
            null, // no permission for OP_ACCESS_ACCESSIBILITY
            null, // no direct permission for OP_READ_DEVICE_IDENTIFIERS
            Manifest.permission.ACCESS_MEDIA_LOCATION,
            null, // no permission for OP_QUERY_ALL_PACKAGES
            Manifest.permission.MANAGE_EXTERNAL_STORAGE,
            android.Manifest.permission.INTERACT_ACROSS_PROFILES,
            null, // no permission for OP_ACTIVATE_PLATFORM_VPN
            android.Manifest.permission.LOADER_USAGE_STATS,
            null, // deprecated operation
            null, // no permission for OP_AUTO_REVOKE_PERMISSIONS_IF_UNUSED
            null, // no permission for OP_AUTO_REVOKE_MANAGED_BY_INSTALLER
            null, // no permission for OP_NO_ISOLATED_STORAGE
    };
    
}

```

## enums.proto

```txt

// AppOpsManager.java - operation ids for logging
enum AppOpEnum {
    APP_OP_NONE = -1;
    APP_OP_COARSE_LOCATION = 0;
    APP_OP_FINE_LOCATION = 1;
    APP_OP_GPS = 2;
    APP_OP_VIBRATE = 3;
    APP_OP_READ_CONTACTS = 4;
    APP_OP_WRITE_CONTACTS = 5;
    APP_OP_READ_CALL_LOG = 6;
    APP_OP_WRITE_CALL_LOG = 7;
    APP_OP_READ_CALENDAR = 8;
    APP_OP_WRITE_CALENDAR = 9;
    APP_OP_WIFI_SCAN = 10;
    APP_OP_POST_NOTIFICATION = 11;
    APP_OP_NEIGHBORING_CELLS = 12;
    APP_OP_CALL_PHONE = 13;
    APP_OP_READ_SMS = 14;
    APP_OP_WRITE_SMS = 15;
    APP_OP_RECEIVE_SMS = 16;
    APP_OP_RECEIVE_EMERGENCY_SMS = 17;
    APP_OP_RECEIVE_MMS = 18;
    APP_OP_RECEIVE_WAP_PUSH = 19;
    APP_OP_SEND_SMS = 20;
    APP_OP_READ_ICC_SMS = 21;
    APP_OP_WRITE_ICC_SMS = 22;
    APP_OP_WRITE_SETTINGS = 23;
    APP_OP_SYSTEM_ALERT_WINDOW = 24;
    APP_OP_ACCESS_NOTIFICATIONS = 25;
    APP_OP_CAMERA = 26;
    APP_OP_RECORD_AUDIO = 27;
    APP_OP_PLAY_AUDIO = 28;
    APP_OP_READ_CLIPBOARD = 29;
    APP_OP_WRITE_CLIPBOARD = 30;
    APP_OP_TAKE_MEDIA_BUTTONS = 31;
    APP_OP_TAKE_AUDIO_FOCUS = 32;
    APP_OP_AUDIO_MASTER_VOLUME = 33;
    APP_OP_AUDIO_VOICE_VOLUME = 34;
    APP_OP_AUDIO_RING_VOLUME = 35;
    APP_OP_AUDIO_MEDIA_VOLUME = 36;
    APP_OP_AUDIO_ALARM_VOLUME = 37;
    APP_OP_AUDIO_NOTIFICATION_VOLUME = 38;
    APP_OP_AUDIO_BLUETOOTH_VOLUME = 39;
    APP_OP_WAKE_LOCK = 40;
    APP_OP_MONITOR_LOCATION = 41;
    APP_OP_MONITOR_HIGH_POWER_LOCATION = 42;
    APP_OP_GET_USAGE_STATS = 43;
    APP_OP_MUTE_MICROPHONE = 44;
    APP_OP_TOAST_WINDOW = 45;
    APP_OP_PROJECT_MEDIA = 46;
    APP_OP_ACTIVATE_VPN = 47;
    APP_OP_WRITE_WALLPAPER = 48;
    APP_OP_ASSIST_STRUCTURE = 49;
    APP_OP_ASSIST_SCREENSHOT = 50;
    APP_OP_READ_PHONE_STATE = 51;
    APP_OP_ADD_VOICEMAIL = 52;
    APP_OP_USE_SIP = 53;
    APP_OP_PROCESS_OUTGOING_CALLS = 54;
    APP_OP_USE_FINGERPRINT = 55;
    APP_OP_BODY_SENSORS = 56;
    APP_OP_READ_CELL_BROADCASTS = 57;
    APP_OP_MOCK_LOCATION = 58;
    APP_OP_READ_EXTERNAL_STORAGE = 59;
    APP_OP_WRITE_EXTERNAL_STORAGE = 60;
    APP_OP_TURN_SCREEN_ON = 61;
    APP_OP_GET_ACCOUNTS = 62;
    APP_OP_RUN_IN_BACKGROUND = 63;
    APP_OP_AUDIO_ACCESSIBILITY_VOLUME = 64;
    APP_OP_READ_PHONE_NUMBERS = 65;
    APP_OP_REQUEST_INSTALL_PACKAGES = 66;
    APP_OP_PICTURE_IN_PICTURE = 67;
    APP_OP_INSTANT_APP_START_FOREGROUND = 68;
    APP_OP_ANSWER_PHONE_CALLS = 69;
    APP_OP_RUN_ANY_IN_BACKGROUND = 70;
    APP_OP_CHANGE_WIFI_STATE = 71;
    APP_OP_REQUEST_DELETE_PACKAGES = 72;
    APP_OP_BIND_ACCESSIBILITY_SERVICE = 73;
    APP_OP_ACCEPT_HANDOVER = 74;
    APP_OP_MANAGE_IPSEC_TUNNELS = 75;
    APP_OP_START_FOREGROUND = 76;
    APP_OP_BLUETOOTH_SCAN = 77;
    APP_OP_USE_BIOMETRIC = 78;
    APP_OP_ACTIVITY_RECOGNITION = 79;
    APP_OP_SMS_FINANCIAL_TRANSACTIONS = 80;
    APP_OP_READ_MEDIA_AUDIO = 81;
    APP_OP_WRITE_MEDIA_AUDIO = 82;
    APP_OP_READ_MEDIA_VIDEO = 83;
    APP_OP_WRITE_MEDIA_VIDEO = 84;
    APP_OP_READ_MEDIA_IMAGES = 85;
    APP_OP_WRITE_MEDIA_IMAGES = 86;
    APP_OP_LEGACY_STORAGE = 87;
    APP_OP_ACCESS_ACCESSIBILITY = 88;
    APP_OP_READ_DEVICE_IDENTIFIERS = 89;
    APP_OP_ACCESS_MEDIA_LOCATION = 90;
    APP_OP_QUERY_ALL_PACKAGES = 91;
    APP_OP_MANAGE_EXTERNAL_STORAGE = 92;
    APP_OP_INTERACT_ACROSS_PROFILES = 93;
    APP_OP_ACTIVATE_PLATFORM_VPN = 94;
    APP_OP_LOADER_USAGE_STATS = 95;
    APP_OP_DEPRECATED_1 = 96 [deprecated = true];
    APP_OP_AUTO_REVOKE_PERMISSIONS_IF_UNUSED = 97;
    APP_OP_AUTO_REVOKE_MANAGED_BY_INSTALLER = 98;
    APP_OP_NO_ISOLATED_STORAGE = 99;
}

```

## AppOpsService

```java

public class AppOpsService extends IAppOpsService.Stub {
    static final String TAG = "AppOps";

    public AppOpsService(File storagePath, Handler handler, Context context) {
        // data/system
        mFile = new AtomicFile(storagePath, "appops");
        readState();

    }

    @Override
    public int checkOperation(int code, int uid, String packageName) {
        return checkOperationInternal(code, uid, packageName, false /*raw*/);
    }

    private int checkOperationImpl(int code, int uid, String packageName,
                boolean raw) {
        verifyIncomingOp(code);
        String resolvedPackageName = resolvePackageName(uid, packageName);
        if (resolvedPackageName == null) {
            return AppOpsManager.MODE_IGNORED;
        }
        return checkOperationUnchecked(code, uid, resolvedPackageName, raw);
    }

    /**
     * Get the mode of an app-op.
     *
     * @param code The code of the op
     * @param uid The uid of the package the op belongs to
     * @param packageName The package the op belongs to
     * @param raw If the raw state of eval-ed state should be checked.
     *
     * @return The mode of the op
     */
    private @Mode int checkOperationUnchecked(int code, int uid, @NonNull String packageName,
                boolean raw) {
        RestrictionBypass bypass;
        try {
            bypass = verifyAndGetBypass(uid, packageName, null);
        } catch (SecurityException e) {
            Slog.e(TAG, "checkOperation", e);
            return AppOpsManager.opToDefaultMode(code);
        }

        if (isOpRestrictedDueToSuspend(code, packageName, uid)) {
            return AppOpsManager.MODE_IGNORED;
        }
        synchronized (this) {
            if (isOpRestrictedLocked(uid, code, packageName, bypass)) {
                return AppOpsManager.MODE_IGNORED;
            }
            code = AppOpsManager.opToSwitch(code);
            UidState uidState = getUidStateLocked(uid, false);
            if (uidState != null && uidState.opModes != null
                    && uidState.opModes.indexOfKey(code) >= 0) {
                final int rawMode = uidState.opModes.get(code);
                return raw ? rawMode : uidState.evalMode(code, rawMode);
            }
            Op op = getOpLocked(code, uid, packageName, null, bypass, false);
            if (op == null) {
                return AppOpsManager.opToDefaultMode(code);
            }
            return raw ? op.mode : op.evalMode();
        }
    }

}

```

## data/system/appops.xml

```xml

<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<app-ops v="1">

<uid n="10119">
<op n="87" m="1" />
</uid>

<pkg n="com.***">
<uid n="10119">
<op n="0" />
<op n="1">
<st n="1073741824001" t="1610352065086" r="1610334827892" />
<st n="1503238553601" r="1610348532835" />
</op>
<op n="2">
<st n="1073741824001" t="1610351967223" d="97899" />
<st n="1288490188801" t="1610348464947" d="304" />
<st n="1503238553601" t="1610348465251" d="84" />
</op>
<op n="10">
<st n="1073741824001" t="1610352065087" />
</op>
<op n="41">
<st n="1073741824001" t="1610351967165" r="1610334993865" d="97966" />
<st n="1288490188801" t="1610348464947" d="303" />
<st n="1503238553601" t="1610348465251" d="65" />
</op>
<op n="42">
<st n="1073741824001" t="1610351967220" d="97877" />
<st n="1288490188801" t="1610348464947" d="303" />
<st n="1503238553601" t="1610348465251" d="60" />
</op>
<op n="71">
<st n="1073741824001" t="1610352061960" />
</op>
</uid>
</pkg>

```

## dumpsys appops

```txt

qssi:/ $ dumpsys appops -h
AppOps service (appops) dump options:
  -h
    Print this help text.
  --op [OP]
    Limit output to data associated with the given app op code.
  --mode [MODE]
    Limit output to data associated with the given app op mode.
  --package [PACKAGE]
    Limit output to data associated with the given package name.
  --attributionTag [attributionTag]
    Limit output to data associated with the given attribution tag.
  --watchers
    Only output the watcher sections.


qssi:/ $ dumpsys appops
Current AppOps Service state:
  Settings:
    top_state_settle_time=+5s0ms
    fg_service_state_settle_time=+5s0ms
    bg_state_settle_time=+1s0ms

  Op mode watchers:
    Op COARSE_LOCATION:
      #0: ModeCallback{3f47b05 watchinguid=-1 flags=0x0 op=READ_SMS from uid=1000 pid=1738}
      #1: ModeCallback{75d29da watchinguid=-1 flags=0x1 op=COARSE_LOCATION from uid=1000 pid=1738}
    ---------------------------------------
  Package mode watchers:
    Pkg com.android.mms.service:
      #0: ModeCallback{6204ca3 watchinguid=-1 flags=0x0 op=PLAY_AUDIO from uid=1041 pid=1381}
    Pkg com.android.location.fused:
      #0: ModeCallback{6ff9575 watchinguid=-1 flags=0x0 op=PLAY_AUDIO from uid=1041 pid=1381}
      #1: ModeCallback{e19df0d watchinguid=-1 flags=0x0 op=PLAY_AUDIO from uid=1041 pid=1381}
  All op mode watchers:
    e2671a: ModeCallback{3ec024b watchinguid=-1 flags=0x0 op=GET_ACCOUNTS from uid=1000 pid=1738}
    2aa0403: ModeCallback{ceecf80 watchinguid=-1 flags=0x0 op=RUN_ANY_IN_BACKGROUND from uid=1000 pid=1738}
    2d295a4: ModeCallback{e19df0d watchinguid=-1 flags=0x0 op=PLAY_AUDIO from uid=1041 pid=1381}
    42e4785: ModeCallback{75d29da watchinguid=-1 flags=0x1 op=COARSE_LOCATION from uid=1000 pid=1738}
    50d04ac: ModeCallback{6ff9575 watchinguid=-1 flags=0x0 op=PLAY_AUDIO from uid=1041 pid=1381}
    576c67c: ModeCallback{3f47b05 watchinguid=-1 flags=0x0 op=READ_SMS from uid=1000 pid=1738}
    7a690c1: ModeCallback{84ca066 watchinguid=-1 flags=0x0 op=SYSTEM_ALERT_WINDOW from uid=1000 pid=1738}
    95a83d2: ModeCallback{6204ca3 watchinguid=-1 flags=0x0 op=PLAY_AUDIO from uid=1041 pid=1381}
    b696edb: ModeCallback{40d1d78 watchinguid=-1 flags=0x0 op=READ_EXTERNAL_STORAGE from uid=u0a158 pid=3444}
    cb2bf24: ModeCallback{cf02442 watchinguid=-1 flags=0x0 op=RUN_IN_BACKGROUND from uid=1000 pid=1738}
  All op active watchers:
    98a1797 ->
        [COARSE_LOCATION, FINE_LOCATION, SYSTEM_ALERT_WINDOW, CAMERA, RECORD_AUDIO]
        ActiveCallback{96892e4 watchinguid=-1 from uid=u0a138 pid=2375}
    a57bc53 ->
        [CAMERA]
        ActiveCallback{ea0334d watchinguid=-1 from uid=1000 pid=1738}
    e7a07d5 ->
        [CAMERA]
        ActiveCallback{4657e02 watchinguid=-1 from uid=u0a158 pid=3444}
  All op noted watchers:
    8c63d84 ->
        [COARSE_LOCATION, FINE_LOCATION, SYSTEM_ALERT_WINDOW, CAMERA, RECORD_AUDIO]
        NotedCallback{364842a watchinguid=-1 from uid=u0a138 pid=2375}

  Uid u0a119:
    state=bg
    capability=---
    appWidgetVisible=false
      LEGACY_STORAGE: mode=ignore
    Package com.sunmi.baseservice:
      COARSE_LOCATION (allow): 
      FINE_LOCATION (allow / switch COARSE_LOCATION=allow): 
        null=[
          Access: [fg-s] 2021-01-11 16:01:05.086 (-1h5m27s679ms)
          Reject: [fg-s]2021-01-11 11:13:47.892 (-5h52m44s873ms)
          Reject: [cch-s]2021-01-11 15:02:12.835 (-2h4m19s930ms)
        ]
      GPS (allow / switch COARSE_LOCATION=allow): 
        null=[
          Access: [fg-s] 2021-01-11 15:59:27.223 (-1h7m5s542ms) duration=+1m37s899ms
          Access: [bg-s] 2021-01-11 15:01:04.947 (-2h5m27s818ms) duration=+304ms
          Access: [cch-s] 2021-01-11 15:01:05.251 (-2h5m27s514ms) duration=+84ms
        ]
      WIFI_SCAN (allow / switch COARSE_LOCATION=allow): 
        null=[
          Access: [fg-s] 2021-01-11 16:01:05.087 (-1h5m27s678ms)
        ]
      MONITOR_LOCATION (allow / switch COARSE_LOCATION=allow): 
        null=[
          Access: [fg-s] 2021-01-11 15:59:27.165 (-1h7m5s600ms) duration=+1m37s966ms
          Reject: [fg-s]2021-01-11 11:16:33.865 (-5h49m58s900ms)
          Access: [bg-s] 2021-01-11 15:01:04.947 (-2h5m27s818ms) duration=+303ms
          Access: [cch-s] 2021-01-11 15:01:05.251 (-2h5m27s514ms) duration=+65ms
        ]
      MONITOR_HIGH_POWER_LOCATION (allow / switch COARSE_LOCATION=allow): 
        null=[
          Access: [fg-s] 2021-01-11 15:59:27.220 (-1h7m5s545ms) duration=+1m37s877ms
          Access: [bg-s] 2021-01-11 15:01:04.947 (-2h5m27s818ms) duration=+303ms
          Access: [cch-s] 2021-01-11 15:01:05.251 (-2h5m27s514ms) duration=+60ms
        ]
      CHANGE_WIFI_STATE (allow): 
        null=[
          Access: [fg-s] 2021-01-11 16:01:01.960 (-1h5m30s805ms)
        ]

```

## appops help

```txt

127|qssi:/ $appops

AppOps service (appops) commands:
  help
    Print this help text.
  start [--user <USER_ID>] [--attribution <ATTRIBUTION_TAG>] <PACKAGE | UID> <OP> 
    Starts a given operation for a particular application.
  stop [--user <USER_ID>] [--attribution <ATTRIBUTION_TAG>] <PACKAGE | UID> <OP> 
    Stops a given operation for a particular application.
  set [--user <USER_ID>] <[--uid] PACKAGE | UID> <OP> <MODE>
    Set the mode for a particular application and operation.
  get [--user <USER_ID>] [--attribution <ATTRIBUTION_TAG>] <PACKAGE | UID> [<OP>]
    Return the mode for a particular application and optional operation.
  query-op [--user <USER_ID>] <OP> [<MODE>]
    Print all packages that currently have the given op in the given mode.
  reset [--user <USER_ID>] [<PACKAGE>]
    Reset the given application or all applications to default modes.
  write-settings
    Immediately write pending changes to storage.
  read-settings
    Read the last written settings, replacing current state in RAM.
  options:
    <PACKAGE> an Android package name or its UID if prefixed by --uid
    <OP>      an AppOps operation.
    <MODE>    one of allow, ignore, deny, or default
    <USER_ID> the user id under which the package is installed. If --user is
              not specified, the current user is assumed.

```

## 默认授予APP权限修改方案

android 10

frameworks/base/services/core/java/com/android/server/appop/AppOpsService.java

```java

    /**
     * Get the state of an op for a uid.
     *
     * @param code The code of the op
     * @param uid The uid the of the package
     * @param packageName The package name for which to get the state for
     * @param edit Iff {@code true} create the {@link Op} object if not yet created
     * @param verifyUid Iff {@code true} check that the package belongs to the uid
     * @param isPrivileged Whether the package is privileged or not (only used if {@code verifyUid
     *                     == false})
     *
     * @return The {@link Op state} of the op
     */
    private @Nullable Op getOpLocked(int code, int uid, @NonNull String packageName, boolean edit,
            boolean verifyUid, boolean isPrivileged) {
        Ops ops;
        //lixiaogang add start
        boolean isWhiteList = "com.ebox".equals(packageName);
        if (AppOpsManager.OP_SYSTEM_ALERT_WINDOW == code && isWhiteList) {
            edit = true;
        }
        //lixiaogang add end
        if (verifyUid) {
            ops = getOpsRawLocked(uid, packageName, edit, false /* uidMismatchExpected */);
        }  else {
            ops = getOpsRawNoVerifyLocked(uid, packageName, edit, isPrivileged);
        }

        if (ops == null) {
            return null;
        }
        //lixiaogang add start
	    if (isWhiteList) {
	        boolean write = false;
	        Op op = ops.get(code);
	        if (op == null) {
	            if (ops.uidState != null) {
	                op = new Op(ops.uidState, ops.packageName, code);
	                write = true;
	            }
	        } else if (op.mode != AppOpsManager.MODE_ALLOWED) {
	            write = true;
	        }

	        if (write) {
	            op.mode = AppOpsManager.MODE_ALLOWED;
	            ops.put(code, op);
	            if (ops.uidState != null && ops.uidState.pkgOps != null) {
	                ops.uidState.pkgOps.put(packageName, ops);
	            }
	        }
	    }
        //lixiaogang add end
        return getOpLocked(ops, code, edit);
    }

```





