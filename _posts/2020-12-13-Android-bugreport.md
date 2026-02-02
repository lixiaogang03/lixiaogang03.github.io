---
layout:     post
title:      Android bugreport
subtitle:   adb bugreport
date:       2020-12-13
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - Android
---

[获取并阅读错误报告-Google](https://developer.android.google.cn/studio/debug/bug-report?hl=zh-cn)

[bugreport源码篇-Gityuan](http://gityuan.com/2016/06/10/bugreport/)

## 通过设备获取bugreport

![device_bugreport](/images/android/bugreport/device_bugreport.png)

## 通过命令获取bugreport

```txt

debug$ adb bugreport bugreport.zip
/data/user_de/0/com.android.shell/files/bugreports/bugrep...le pulled, 0 skipped. 29.6 MB/s (8659982 bytes in 0.279s)
Bug report copied to bugreport.zip

```

## ChkBugReport

[BugReport分析利器-ChkBugReport-简书](https://www.jianshu.com/p/9c4a8642ccbf)

## UML

![settings_bugreport](/images/android/bugreport/settings_bugreport.png)

## 源码

### Settings

```java

public class BugreportPreference extends CustomDialogPreferenceCompat {

    @Override
    protected void onClick(DialogInterface dialog, int which) {
        if (which == DialogInterface.BUTTON_POSITIVE) {

            final Context context = getContext();
            if (mFullTitle.isChecked()) {
                Log.v(TAG, "Taking full bugreport right away");
                FeatureFactory.getFactory(context).getMetricsFeatureProvider().action(context,
                        SettingsEnums.ACTION_BUGREPORT_FROM_SETTINGS_FULL);
                try {
                    ActivityManager.getService().requestFullBugReport();        // 完整报告
                } catch (RemoteException e) {
                    Log.e(TAG, "error taking bugreport (bugreportType=Full)", e);
                }
            } else {
                Log.v(TAG, "Taking interactive bugreport right away");
                FeatureFactory.getFactory(context).getMetricsFeatureProvider().action(context,
                        SettingsEnums.ACTION_BUGREPORT_FROM_SETTINGS_INTERACTIVE);
                try {
                    ActivityManager.getService().requestInteractiveBugReport(); // 互动式报告
                } catch (RemoteException e) {
                    Log.e(TAG, "error taking bugreport (bugreportType=Interactive)", e);
                }
            }
        }
    }

}

```

### AMS

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    private static final String INTENT_BUGREPORT_REQUESTED =
            "com.android.internal.intent.action.BUGREPORT_REQUESTED";
    private static final String SHELL_APP_PACKAGE = "com.android.shell";

    /**
     * Takes a bugreport using bug report API ({@code BugreportManager}) with no pre-set
     * title and description
     */
    @Override
    public void requestBugReport(@BugreportParams.BugreportMode int bugreportType) {
        requestBugReportWithDescription(null, null, bugreportType);
    }

    /**
     * Takes a bugreport using bug report API ({@code BugreportManager}) which gets
     * triggered by sending a broadcast to Shell.
     */
    @Override
    public void requestBugReportWithDescription(@Nullable String shareTitle,
            @Nullable String shareDescription, int bugreportType) {
        String type = null;
        switch (bugreportType) {
            case BugreportParams.BUGREPORT_MODE_FULL:             // 完整错误报告
                type = "bugreportfull";
                break;
            case BugreportParams.BUGREPORT_MODE_INTERACTIVE:      // 交互式错误报告
                type = "bugreportplus";
                break;
            case BugreportParams.BUGREPORT_MODE_REMOTE:           // 远程错误报告
                type = "bugreportremote";
                break;
            case BugreportParams.BUGREPORT_MODE_WEAR:             // 穿戴设备
                type = "bugreportwear";
                break;
            case BugreportParams.BUGREPORT_MODE_TELEPHONY:        // 电话相关报告
                type = "bugreporttelephony";
                break;
            case BugreportParams.BUGREPORT_MODE_WIFI:             // Wifi相关的错误报告
                type = "bugreportwifi";
                break;
            default:
                throw new IllegalArgumentException(
                    "Provided bugreport type is not correct, value: "
                        + bugreportType);
        }
        // Always log caller, even if it does not have permission to dump.
        Slog.i(TAG, type + " requested by UID " + Binder.getCallingUid());
        enforceCallingPermission(android.Manifest.permission.DUMP, "requestBugReport");

        if (!TextUtils.isEmpty(shareTitle)) {
            if (shareTitle.length() > MAX_BUGREPORT_TITLE_SIZE) {
                String errorStr = "shareTitle should be less than "
                        + MAX_BUGREPORT_TITLE_SIZE + " characters";
                throw new IllegalArgumentException(errorStr);
            }
            if (!TextUtils.isEmpty(shareDescription)) {
                if (shareDescription.length() > MAX_BUGREPORT_DESCRIPTION_SIZE) {
                    String errorStr = "shareDescription should be less than "
                            + MAX_BUGREPORT_DESCRIPTION_SIZE + " characters";
                    throw new IllegalArgumentException(errorStr);
                }
            }
            Slog.d(TAG, "Bugreport notification title " + shareTitle
                    + " description " + shareDescription);
        }
        // Create intent to trigger Bugreport API via Shell
        Intent triggerShellBugreport = new Intent();
        triggerShellBugreport.setAction(INTENT_BUGREPORT_REQUESTED);
        triggerShellBugreport.setPackage(SHELL_APP_PACKAGE);
        triggerShellBugreport.putExtra(EXTRA_BUGREPORT_TYPE, bugreportType);
        triggerShellBugreport.addFlags(Intent.FLAG_RECEIVER_FOREGROUND);
        triggerShellBugreport.addFlags(Intent.FLAG_RECEIVER_INCLUDE_BACKGROUND);
        if (shareTitle != null) {
            triggerShellBugreport.putExtra(EXTRA_TITLE, shareTitle);
        }
        if (shareDescription != null) {
            triggerShellBugreport.putExtra(EXTRA_DESCRIPTION, shareDescription);
        }
        final long identity = Binder.clearCallingIdentity();
        try {
            // Send broadcast to shell to trigger bugreport using Bugreport API
            mContext.sendBroadcast(triggerShellBugreport);                       // 发送广播给com.android.shell进程
        } finally {
            Binder.restoreCallingIdentity(identity);
        }
    }

    /**
     * Takes a telephony bugreport with title and description
     */
    @Override
    public void requestTelephonyBugReport(String shareTitle, String shareDescription) {
        requestBugReportWithDescription(shareTitle, shareDescription,
                BugreportParams.BUGREPORT_MODE_TELEPHONY);
    }

    /**
     * Takes a minimal bugreport of Wifi-related state with pre-set title and description
     */
    @Override
    public void requestWifiBugReport(String shareTitle, String shareDescription) {
        requestBugReportWithDescription(shareTitle, shareDescription,
                BugreportParams.BUGREPORT_MODE_WIFI);
    }

    /**
     * Takes an interactive bugreport with a progress notification
     */
    @Override
    public void requestInteractiveBugReport() {
        requestBugReportWithDescription(null, null, BugreportParams.BUGREPORT_MODE_INTERACTIVE);
    }

    /**
     * Takes an interactive bugreport with a progress notification. Also, shows the given title and
     * description on the final share notification
     */
    @Override
    public void requestInteractiveBugReportWithDescription(String shareTitle,
            String shareDescription) {
        requestBugReportWithDescription(shareTitle, shareDescription,
                BugreportParams.BUGREPORT_MODE_INTERACTIVE);
    }

    /**
     * Takes a bugreport with minimal user interference
     */
    @Override
    public void requestFullBugReport() {
        requestBugReportWithDescription(null, null,  BugreportParams.BUGREPORT_MODE_FULL);
    }

    /**
     * Takes a bugreport remotely
     */
    @Override
    public void requestRemoteBugReport() {
        requestBugReportWithDescription(null, null, BugreportParams.BUGREPORT_MODE_REMOTE);
    }

}

```

### Shell

**AndroidManifest.xml**

```xml

        <receiver
            android:name=".BugreportRequestedReceiver"
            android:permission="android.permission.TRIGGER_SHELL_BUGREPORT">
            <intent-filter>
                <action android:name="com.android.internal.intent.action.BUGREPORT_REQUESTED" />
            </intent-filter>
        </receiver>


```

**BugreportRequestedReceiver.java**

```java

public class BugreportRequestedReceiver extends BroadcastReceiver {
    private static final String TAG = "BugreportRequestedReceiver";

    @Override
    @RequiresPermission(android.Manifest.permission.TRIGGER_SHELL_BUGREPORT)
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "onReceive(): " + dumpIntent(intent));

        // Delegate intent handling to service.
        Intent serviceIntent = new Intent(context, BugreportProgressService.class);
        Log.d(TAG, "onReceive() ACTION: " + serviceIntent.getAction());
        serviceIntent.setAction(intent.getAction());
        serviceIntent.putExtra(EXTRA_ORIGINAL_INTENT, intent);
        context.startService(serviceIntent);
    }
}

```

**BugreportProgressService.java**

```java

public class BugreportProgressService extends Service {


    @Override
    public void onCreate() {
        mContext = getApplicationContext();
        mMainThreadHandler = new Handler(Looper.getMainLooper());
        mServiceHandler = new ServiceHandler("BugreportProgressServiceMainThread");
        mScreenshotHandler = new ScreenshotHandler("BugreportProgressServiceScreenshotThread");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.v(TAG, "onStartCommand(): " + dumpIntent(intent));
        if (intent != null) {
            if (!intent.hasExtra(EXTRA_ORIGINAL_INTENT) && !intent.hasExtra(EXTRA_ID)) {
                return START_NOT_STICKY;
            }
            // Handle it in a separate thread.
            final Message msg = mServiceHandler.obtainMessage();
            msg.what = MSG_SERVICE_COMMAND;
            msg.obj = intent;
            mServiceHandler.sendMessage(msg);
        }

        // If service is killed it cannot be recreated because it would not know which
        // dumpstate IDs it would have to watch.
        return START_NOT_STICKY;
    }

    private final class ServiceHandler extends Handler {

        @Override
        public void handleMessage(Message msg) {

            switch (action) {
                case INTENT_BUGREPORT_REQUESTED:
                    startBugreportAPI(intent);
                    break;
            }

        }

    }

    private void startBugreportAPI(Intent intent) {
        BugreportInfo info = new BugreportInfo(mContext, baseName, name,
                shareTitle, shareDescription, bugreportType, mBugreportsDir);
        ParcelFileDescriptor bugreportFd = info.getBugreportFd();

        mBugreportManager = (BugreportManager) mContext.getSystemService(
                Context.BUGREPORT_SERVICE);
        final Executor executor = ActivityThread.currentActivityThread().getExecutor();

        Log.i(TAG, "bugreport type = " + bugreportType
                + " bugreport file fd: " + bugreportFd
                + " screenshot file fd: " + screenshotFd);

        BugreportCallbackImpl bugreportCallback = new BugreportCallbackImpl(info);
        try {
            synchronized (mLock) {
                mBugreportManager.startBugreport(bugreportFd, screenshotFd,
                        new BugreportParams(bugreportType), executor, bugreportCallback);
                bugreportCallback.trackInfoWithIdLocked();
            }
        } catch (RuntimeException e) {
            Log.i(TAG, "Error in generating bugreports: ", e);
            // The binder call didn't go through successfully, so need to close the fds.
            // If the calls went through API takes ownership.
            FileUtils.closeQuietly(bugreportFd);
            if (screenshotFd != null) {
                FileUtils.closeQuietly(screenshotFd);
            }
        }
    }

}

```

### BugreportManagerService.java

```java

public final class BugreportManager {

    private final IDumpstate mBinder;

    public BugreportManager(@NonNull Context context, IDumpstate binder) {
        mContext = context;
        mBinder = binder;
    }

    @RequiresPermission(android.Manifest.permission.DUMP)
    public void startBugreport(@NonNull ParcelFileDescriptor bugreportFd,
            @Nullable ParcelFileDescriptor screenshotFd,
            @NonNull BugreportParams params,
            @NonNull @CallbackExecutor Executor executor,
            @NonNull BugreportCallback callback) {
        try {
            Preconditions.checkNotNull(bugreportFd);
            Preconditions.checkNotNull(params);
            Preconditions.checkNotNull(executor);
            Preconditions.checkNotNull(callback);

            boolean isScreenshotRequested = screenshotFd != null;
            if (screenshotFd == null) {
                // Binder needs a valid File Descriptor to be passed
                screenshotFd = ParcelFileDescriptor.open(new File("/dev/null"),
                        ParcelFileDescriptor.MODE_READ_ONLY);
            }
            DumpstateListener dsListener = new DumpstateListener(executor, callback,
                    isScreenshotRequested);
            // Note: mBinder can get callingUid from the binder transaction.
            mBinder.startBugreport(-1 /* callingUid */,
                    mContext.getOpPackageName(),
                    bugreportFd.getFileDescriptor(),
                    screenshotFd.getFileDescriptor(),
                    params.getMode(), dsListener, isScreenshotRequested);
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        } catch (FileNotFoundException e) {
            Log.wtf(TAG, "Not able to find /dev/null file: ", e);
        } finally {
            // We can close the file descriptors here because binder would have duped them.
            IoUtils.closeQuietly(bugreportFd);
            if (screenshotFd != null) {
                IoUtils.closeQuietly(screenshotFd);
            }
        }
    }

}

// 系统服务
public class BugreportManagerService extends SystemService {
    private static final String TAG = "BugreportManagerService";

    private BugreportManagerServiceImpl mService;

    public BugreportManagerService(Context context) {
        super(context);
    }

    @Override
    public void onStart() {
        mService = new BugreportManagerServiceImpl(getContext());
        publishBinderService(Context.BUGREPORT_SERVICE, mService);   // bugreport service
    }
}

class BugreportManagerServiceImpl extends IDumpstate.Stub {

    @Override
    @RequiresPermission(android.Manifest.permission.DUMP)
    public void startBugreport(int callingUidUnused, String callingPackage,
            FileDescriptor bugreportFd, FileDescriptor screenshotFd,
            int bugreportMode, IDumpstateListener listener, boolean isScreenshotRequested) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.DUMP, "startBugreport");
        Objects.requireNonNull(callingPackage);
        Objects.requireNonNull(bugreportFd);
        Objects.requireNonNull(listener);
        validateBugreportMode(bugreportMode);
        final long identity = Binder.clearCallingIdentity();
        try {
            ensureIsPrimaryUser();
        } finally {
            Binder.restoreCallingIdentity(identity);
        }

        int callingUid = Binder.getCallingUid();
        mAppOps.checkPackage(callingUid, callingPackage);

        if (!mBugreportWhitelistedPackages.contains(callingPackage)) {
            throw new SecurityException(
                    callingPackage + " is not whitelisted to use Bugreport API");
        }
        synchronized (mLock) {
            startBugreportLocked(callingUid, callingPackage, bugreportFd, screenshotFd,
                    bugreportMode, listener, isScreenshotRequested);
        }
    }

    @GuardedBy("mLock")
    private void startBugreportLocked(int callingUid, String callingPackage,
            FileDescriptor bugreportFd, FileDescriptor screenshotFd,
            int bugreportMode, IDumpstateListener listener, boolean isScreenshotRequested) {
        if (isDumpstateBinderServiceRunningLocked()) {
            Slog.w(TAG, "'dumpstate' is already running. Cannot start a new bugreport"
                    + " while another one is currently in progress.");
            reportError(listener,
                    IDumpstateListener.BUGREPORT_ERROR_ANOTHER_REPORT_IN_PROGRESS);
            return;
        }

        IDumpstate ds = startAndGetDumpstateBinderServiceLocked();
        if (ds == null) {
            Slog.w(TAG, "Unable to get bugreport service");
            reportError(listener, IDumpstateListener.BUGREPORT_ERROR_RUNTIME_ERROR);
            return;
        }

        // Wrap the listener so we can intercept binder events directly.
        IDumpstateListener myListener = new DumpstateListener(listener, ds);
        try {
            ds.startBugreport(callingUid, callingPackage,
                    bugreportFd, screenshotFd, bugreportMode, myListener, isScreenshotRequested);
        } catch (RemoteException e) {
            // bugreportd service is already started now. We need to kill it to manage the
            // lifecycle correctly. If we don't subsequent callers will get
            // BUGREPORT_ERROR_ANOTHER_REPORT_IN_PROGRESS error.
            // Note that listener will be notified by the death recipient below.
            cancelBugreport();
        }
    }


                                                                                                                                                                      
    // root          12488      1 12403708  6692 0                   0 S dumpstate
    @GuardedBy("mLock")
    private IDumpstate startAndGetDumpstateBinderServiceLocked() {
        // Start bugreport service.
        SystemProperties.set("ctl.start", BUGREPORT_SERVICE);   // bugreportd process

        IDumpstate ds = null;
        boolean timedOut = false;
        int totalTimeWaitedMillis = 0;
        int seedWaitTimeMillis = 500;
        while (!timedOut) {
            ds = getDumpstateBinderServiceLocked();
            if (ds != null) {
                Slog.i(TAG, "Got bugreport service handle.");
                break;
            }
            SystemClock.sleep(seedWaitTimeMillis);
            Slog.i(TAG,
                    "Waiting to get dumpstate service handle (" + totalTimeWaitedMillis + "ms)");
            totalTimeWaitedMillis += seedWaitTimeMillis;
            seedWaitTimeMillis *= 2;
            timedOut = totalTimeWaitedMillis > DEFAULT_BUGREPORT_SERVICE_TIMEOUT_MILLIS;
        }
        if (timedOut) {
            Slog.w(TAG,
                    "Timed out waiting to get dumpstate service handle ("
                    + totalTimeWaitedMillis + "ms)");
        }
        return ds;
    }
    
    @GuardedBy("mLock")
    @Nullable
    private IDumpstate getDumpstateBinderServiceLocked() {
        // Note that the binder service on the native side is "dumpstate".
        return IDumpstate.Stub.asInterface(ServiceManager.getService("dumpstate"));
    }

}

```

### adb bugreport

命令执行入口 frameworks/native/cmds/bugreport/bugreport.cpp

```cpp

#include <cutils/properties.h>
#include <cutils/sockets.h>

// This program will trigger the dumpstate service to start a call to
// dumpstate, then connect to the dumpstate local client to read the
// output. All of the dumpstate output is written to stdout, including
// any errors encountered while reading/writing the output.
int main() {

  fprintf(stderr, "=============================================================================\n");
  fprintf(stderr, "WARNING: flat bugreports are deprecated, use adb bugreport <zip_file> instead\n");
  fprintf(stderr, "=============================================================================\n\n\n");

  // Start the dumpstate service.
  // 启动dumpstate服务
  property_set("ctl.start", "dumpstate");

  // Socket will not be available until service starts.
  int s = -1;
  for (int i = 0; i < 20; i++) {
    // socket 连接
    s = socket_local_client("dumpstate", ANDROID_SOCKET_NAMESPACE_RESERVED,
                            SOCK_STREAM);
    if (s >= 0)
      break;
    // Try again in 1 second.
    sleep(1);
  }

  if (s == -1) {
    printf("Failed to connect to dumpstate service: %s\n", strerror(errno));
    return 1;
  }

  // 当3分钟没有数据可读，则超时停止并退出
  // Set a timeout so that if nothing is read in 3 minutes, we'll stop
  // reading and quit. No timeout in dumpstate is longer than 60 seconds,
  // so this gives lots of leeway in case of unforeseen time outs.
  struct timeval tv;
  tv.tv_sec = 3 * 60;
  tv.tv_usec = 0;
  if (setsockopt(s, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv)) == -1) {
    printf("WARNING: Cannot set socket timeout: %s\n", strerror(errno));
  }

  while (1) {
    char buffer[65536];
    ssize_t bytes_read = TEMP_FAILURE_RETRY(read(s, buffer, sizeof(buffer)));
    if (bytes_read == 0) {
      break;
    } else if (bytes_read == -1) {
      // EAGAIN really means time out, so change the errno.
      // EAGAIN 意味着timeout, Bugreport读异常终止
      if (errno == EAGAIN) {
        errno = ETIMEDOUT;
      }
      printf("\nBugreport read terminated abnormally (%s).\n", strerror(errno));
      break;
    }

    ssize_t bytes_to_send = bytes_read;
    ssize_t bytes_written;
    // 不断循环将读取到的数据输出到stdout
    do {
      bytes_written = TEMP_FAILURE_RETRY(write(STDOUT_FILENO,
                                               buffer + bytes_read - bytes_to_send,
                                               bytes_to_send));
      if (bytes_written == -1) {
        printf("Failed to write data to stdout: read %zd, trying to send %zd (%s)\n",
               bytes_read, bytes_to_send, strerror(errno));
        return 1;
      }
      bytes_to_send -= bytes_written;
    } while (bytes_written != 0 && bytes_to_send > 0);
  }

  close(s);
  return 0;
}

```

### dumpstate

真正执行命令的进程 frameworks/native/cmds/dumpstate/

```txt

android/frameworks/native/cmds/dumpstate$ tree
.
├── Android.bp
├── Android.mk
├── AndroidTest.xml
├── binder
│   └── android
│       └── os
│           ├── IDumpstate.aidl
│           ├── IDumpstateListener.aidl
│           └── IDumpstateToken.aidl
├── bugreport-format.md
├── dumpstate.cpp
├── dumpstate.h
├── DumpstateInternal.cpp
├── DumpstateInternal.h
├── dumpstate.rc
├── DumpstateSectionReporter.cpp
├── DumpstateSectionReporter.h
├── DumpstateService.cpp
├── DumpstateService.h
├── DumpstateUtil.cpp
├── DumpstateUtil.h
├── main.cpp
├── README.md

```

**Android.mk**

```bp

cc_library_shared {
    name: "libdumpstateaidl",
    defaults: ["dumpstate_cflag_defaults"],
    shared_libs: [
        "libbinder",
        "libutils",
    ],
    aidl: {
        local_include_dirs: ["binder"],
        export_aidl_headers: true,
    },
    srcs: [
        ":dumpstate_aidl",
    ],
    export_include_dirs: ["binder"],
}

filegroup {
    name: "dumpstate_aidl",
    srcs: [
        "binder/android/os/IDumpstateListener.aidl",
        "binder/android/os/IDumpstate.aidl",
    ],
    path: "binder",
}

cc_binary {
    name: "dumpstate",
    defaults: ["dumpstate_defaults"],
    srcs: [
        "dumpstate.cpp",
        "main.cpp",
    ],
    required: [
        "atrace",
        "df",
        "getprop",
        "ip",
        "iptables",
        "ip6tables",
        "kill",
        "librank",
        "logcat",
        "lpdump",
        "lpdumpd",
        "lsmod",
        "lsof",
        "netstat",
        "printenv",
        "procrank",
        "screencap",
        "showmap",
        "ss",
        "storaged",
        "top",
        "uptime",
        "vdc",
        "vril-dump",
    ],
    init_rc: ["dumpstate.rc"],
}

```

**dumpstate.rc**

```rc

on boot
    # Allow bugreports access to eMMC 5.0 stats
    chown root mount /sys/kernel/debug/mmc0/mmc0:0001/ext_csd
    chmod 0440 /sys/kernel/debug/mmc0/mmc0:0001/ext_csd

service dumpstate /system/bin/dumpstate -s
    class main
    socket dumpstate stream 0660 shell log
    disabled
    oneshot

# dumpstatez generates a zipped bugreport but also uses a socket to print the file location once
# it is finished.
service dumpstatez /system/bin/dumpstate -S -d -z
    socket dumpstate stream 0660 shell log
    class main
    disabled
    oneshot

# bugreportd starts dumpstate binder service and makes it wait for a listener to connect.
service bugreportd /system/bin/dumpstate -w
    class main
    disabled
    oneshot

```

**dumpstate_aidl**

```java

package android.os;

import android.os.IDumpstateListener;

/**
  * Binder interface for the currently running dumpstate process.
  * {@hide}
  */
interface IDumpstate {

    // NOTE: If you add to or change these modes, please also change the corresponding enums
    // in system server, in BugreportParams.java.

    // These modes encapsulate a set of run time options for generating bugreports.
    // Takes a bugreport without user interference.
    const int BUGREPORT_MODE_FULL = 0;

    // Interactive bugreport, i.e. triggered by the user.
    const int BUGREPORT_MODE_INTERACTIVE = 1;

    // Remote bugreport triggered by DevicePolicyManager, for e.g.
    const int BUGREPORT_MODE_REMOTE = 2;

    // Bugreport triggered on a wear device.
    const int BUGREPORT_MODE_WEAR = 3;

    // Bugreport limited to only telephony info.
    const int BUGREPORT_MODE_TELEPHONY = 4;

    // Bugreport limited to only wifi info.
    const int BUGREPORT_MODE_WIFI = 5;

    // Default mode.
    const int BUGREPORT_MODE_DEFAULT = 6;

    /*
     * Starts a bugreport in the background.
     *
     *<p>Shows the user a dialog to get consent for sharing the bugreport with the calling
     * application. If they deny {@link IDumpstateListener#onError} will be called. If they
     * consent and bugreport generation is successful artifacts will be copied to the given fds and
     * {@link IDumpstateListener#onFinished} will be called. If there
     * are errors in bugreport generation {@link IDumpstateListener#onError} will be called.
     *
     * @param callingUid UID of the original application that requested the report.
     * @param callingPackage package of the original application that requested the report.
     * @param bugreportFd the file to which the zipped bugreport should be written
     * @param screenshotFd the file to which screenshot should be written
     * @param bugreportMode the mode that specifies other run time options; must be one of above
     * @param listener callback for updates; optional
     * @param isScreenshotRequested indicates screenshot is requested or not
     */
    void startBugreport(int callingUid, @utf8InCpp String callingPackage,
                        FileDescriptor bugreportFd, FileDescriptor screenshotFd,
                        int bugreportMode, IDumpstateListener listener,
                        boolean isScreenshotRequested);

    /*
     * Cancels the bugreport currently in progress.
     */
    void cancelBugreport();
}

/**
  * Listener for dumpstate events.
  *
  * <p>When bugreport creation is complete one of {@code onError} or {@code onFinished} is called.
  *
  * <p>These methods are synchronous by design in order to make dumpstate's lifecycle simpler
  * to handle.
  *
  * {@hide}
  */
interface IDumpstateListener {
    /**
     * Called when there is a progress update.
     *
     * @param progress the progress in [0, 100]
     */
    oneway void onProgress(int progress);

    // NOTE: If you add to or change these error codes, please also change the corresponding enums
    // in system server, in BugreportManager.java.

    /* Options specified are invalid or incompatible */
    const int BUGREPORT_ERROR_INVALID_INPUT = 1;

    /* Bugreport encountered a runtime error */
    const int BUGREPORT_ERROR_RUNTIME_ERROR = 2;

    /* User denied consent to share the bugreport with the specified app */
    const int BUGREPORT_ERROR_USER_DENIED_CONSENT = 3;

    /* The request to get user consent timed out */
    const int BUGREPORT_ERROR_USER_CONSENT_TIMED_OUT = 4;

    /* There is currently a bugreport running. The caller should try again later. */
    const int BUGREPORT_ERROR_ANOTHER_REPORT_IN_PROGRESS = 5;

    /**
     * Called on an error condition with one of the error codes listed above.
     * This is not an asynchronous method since it can race with dumpstate exiting, thus triggering
     * death recipient.
     */
    void onError(int errorCode);

    /**
     * Called when taking bugreport finishes successfully.
     */
    oneway void onFinished();

    /**
     * Called when screenshot is taken.
     */
    oneway void onScreenshotTaken(boolean success);

    /**
     * Called when ui intensive bugreport dumps are finished.
     */
    oneway void onUiIntensiveBugreportDumpsFinished(String callingPackage);
}

```

**main.cpp**

```cpp

int main(int argc, char* argv[]) {
    if (ShouldStartServiceAndWait(argc, argv)) {
        int ret;
        if ((ret = android::os::DumpstateService::Start()) != android::OK) {
            MYLOGE("Unable to start 'dumpstate' service: %d", ret);
            exit(1);
        }
        MYLOGI("'dumpstate' service started and will wait for a call to startBugreport()");

        // Waits forever for an incoming connection.
        // TODO(b/111441001): should this time out?
        android::IPCThreadState::self()->joinThreadPool();
        return 0;
    } else {
        return run_main(argc, argv);
    }
}

```

**DumpstateService.cpp**

```cpp

struct DumpstateInfo {
  public:
    Dumpstate* ds = nullptr;
    int32_t calling_uid = -1;
    std::string calling_package;
};

// Creates a bugreport and exits, thus preserving the oneshot nature of the service.
// Note: takes ownership of data.
[[noreturn]] static void* dumpstate_thread_main(void* data) {
    std::unique_ptr<DumpstateInfo> ds_info(static_cast<DumpstateInfo*>(data));
    ds_info->ds->Run(ds_info->calling_uid, ds_info->calling_package);   // 进入dumpstate.cpp
    MYLOGD("Finished taking a bugreport. Exiting.\n");
    exit(0);
}

DumpstateService::DumpstateService() : ds_(nullptr) {
}

char const* DumpstateService::getServiceName() {
    return "dumpstate";
}

status_t DumpstateService::Start() {
    IPCThreadState::self()->disableBackgroundScheduling(true);
    status_t ret = BinderService<DumpstateService>::publish();
    if (ret != android::OK) {
        return ret;
    }
    sp<ProcessState> ps(ProcessState::self());
    ps->startThreadPool();
    ps->giveThreadPoolName();
    return android::OK;
}

binder::Status DumpstateService::startBugreport(int32_t calling_uid,
                                                const std::string& calling_package,
                                                android::base::unique_fd bugreport_fd,
                                                android::base::unique_fd screenshot_fd,
                                                int bugreport_mode,
                                                const sp<IDumpstateListener>& listener,
                                                bool is_screenshot_requested) {
    MYLOGI("startBugreport() with mode: %d\n", bugreport_mode);

    // Ensure there is only one bugreport in progress at a time.
    std::lock_guard<std::mutex> lock(lock_);
    if (ds_ != nullptr) {
        MYLOGE("Error! There is already a bugreport in progress. Returning.");
        if (listener != nullptr) {
            listener->onError(IDumpstateListener::BUGREPORT_ERROR_ANOTHER_REPORT_IN_PROGRESS);
        }
        return exception(binder::Status::EX_SERVICE_SPECIFIC,
                         "There is already a bugreport in progress");
    }

    // From here on, all conditions that indicate we are done with this incoming request should
    // result in exiting the service to free it up for next invocation.
    if (listener == nullptr) {
        MYLOGE("Invalid input: no listener");
        exit(0);
    }

    if (bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_FULL &&
        bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_INTERACTIVE &&
        bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_REMOTE &&
        bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_WEAR &&
        bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_TELEPHONY &&
        bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_WIFI &&
        bugreport_mode != Dumpstate::BugreportMode::BUGREPORT_DEFAULT) {
        MYLOGE("Invalid input: bad bugreport mode: %d", bugreport_mode);
        signalErrorAndExit(listener, IDumpstateListener::BUGREPORT_ERROR_INVALID_INPUT);
    }

    std::unique_ptr<Dumpstate::DumpOptions> options = std::make_unique<Dumpstate::DumpOptions>();
    options->Initialize(static_cast<Dumpstate::BugreportMode>(bugreport_mode), bugreport_fd,
                        screenshot_fd, is_screenshot_requested);

    if (bugreport_fd.get() == -1 || (options->do_screenshot && screenshot_fd.get() == -1)) {
        MYLOGE("Invalid filedescriptor");
        signalErrorAndExit(listener, IDumpstateListener::BUGREPORT_ERROR_INVALID_INPUT);
    }


    ds_ = &(Dumpstate::GetInstance());
    ds_->SetOptions(std::move(options));
    ds_->listener_ = listener;

    DumpstateInfo* ds_info = new DumpstateInfo();
    ds_info->ds = ds_;
    ds_info->calling_uid = calling_uid;
    ds_info->calling_package = calling_package;

    pthread_t thread;
    // Initialize dumpstate
    ds_->Initialize();
    status_t err = pthread_create(&thread, nullptr, dumpstate_thread_main, ds_info); // 开始执行dumpstate指令
    if (err != 0) {
        delete ds_info;
        ds_info = nullptr;
        MYLOGE("Could not create a thread");
        signalErrorAndExit(listener, IDumpstateListener::BUGREPORT_ERROR_RUNTIME_ERROR);
    }
    return binder::Status::ok();
}

```

**Dumpstate.cpp**

```cpp

// TODO: temporary variables and functions used during C++ refactoring
static Dumpstate& ds = Dumpstate::GetInstance();
static int RunCommand(const std::string& title, const std::vector<std::string>& full_command,
                      const CommandOptions& options = CommandOptions::DEFAULT,
                      bool verbose_duration = false) {
    return ds.RunCommand(title, full_command, options, verbose_duration);
}

Dumpstate::RunStatus Dumpstate::Run(int32_t calling_uid, const std::string& calling_package) {
    Dumpstate::RunStatus status = RunInternal(calling_uid, calling_package);
    // 给客户端的回调
    if (listener_ != nullptr) {
        switch (status) {
            case Dumpstate::RunStatus::OK:
                listener_->onFinished();
                break;
            case Dumpstate::RunStatus::HELP:
                break;
            case Dumpstate::RunStatus::INVALID_INPUT:
                listener_->onError(IDumpstateListener::BUGREPORT_ERROR_INVALID_INPUT);
                break;
            case Dumpstate::RunStatus::ERROR:
                listener_->onError(IDumpstateListener::BUGREPORT_ERROR_RUNTIME_ERROR);
                break;
            case Dumpstate::RunStatus::USER_CONSENT_DENIED:
                listener_->onError(IDumpstateListener::BUGREPORT_ERROR_USER_DENIED_CONSENT);
                break;
            case Dumpstate::RunStatus::USER_CONSENT_TIMED_OUT:
                listener_->onError(IDumpstateListener::BUGREPORT_ERROR_USER_CONSENT_TIMED_OUT);
                break;
        }
    }
    return status;
}


Dumpstate::RunStatus Dumpstate::RunInternal(int32_t calling_uid,
                                            const std::string& calling_package) {
    LogDumpOptions(*options_);
    if (!options_->ValidateOptions()) {
        MYLOGE("Invalid options specified\n");
        return RunStatus::INVALID_INPUT;
    }
    /* set as high priority, and protect from OOM killer */
    setpriority(PRIO_PROCESS, 0, -20);

    FILE* oom_adj = fopen("/proc/self/oom_score_adj", "we");
    if (oom_adj) {
        fputs("-1000", oom_adj);
        fclose(oom_adj);
    } else {
        /* fallback to kernels <= 2.6.35 */
        oom_adj = fopen("/proc/self/oom_adj", "we");
        if (oom_adj) {
            fputs("-17", oom_adj);
            fclose(oom_adj);
        }
    }

    if (version_ == VERSION_DEFAULT) {
        version_ = VERSION_CURRENT;
    }

    if (version_ != VERSION_CURRENT && version_ != VERSION_SPLIT_ANR) {
        MYLOGE("invalid version requested ('%s'); suppported values are: ('%s', '%s', '%s')\n",
               version_.c_str(), VERSION_DEFAULT.c_str(), VERSION_CURRENT.c_str(),
               VERSION_SPLIT_ANR.c_str());
        return RunStatus::INVALID_INPUT;
    }

    if (options_->show_header_only) {
        PrintHeader();
        return RunStatus::OK;
    }

    MYLOGD("dumpstate calling_uid = %d ; calling package = %s \n",
            calling_uid, calling_package.c_str());

    // Redirect output if needed
    bool is_redirecting = options_->OutputToFile();

    // TODO: temporarily set progress until it's part of the Dumpstate constructor
    std::string stats_path =
        is_redirecting
            ? android::base::StringPrintf("%s/dumpstate-stats.txt", bugreport_internal_dir_.c_str())
            : "";
    progress_.reset(new Progress(stats_path));

    if (acquire_wake_lock(PARTIAL_WAKE_LOCK, WAKE_LOCK_NAME) < 0) {
        MYLOGE("Failed to acquire wake lock: %s\n", strerror(errno));
    } else {
        // Wake lock will be released automatically on process death
        MYLOGD("Wake lock acquired.\n");
    }

    register_sig_handler();

    // TODO(b/111441001): maybe skip if already started?
    if (options_->do_start_service) {
        MYLOGI("Starting 'dumpstate' service\n");
        android::status_t ret;
        if ((ret = android::os::DumpstateService::Start()) != android::OK) {
            MYLOGE("Unable to start DumpstateService: %d\n", ret);
        }
    }

    if (PropertiesHelper::IsDryRun()) {
        MYLOGI("Running on dry-run mode (to disable it, call 'setprop dumpstate.dry_run false')\n");
    }

    MYLOGI("dumpstate info: id=%d, args='%s', bugreport_mode= %s bugreport format version: %s\n",
           id_, options_->args.c_str(), options_->bugreport_mode.c_str(), version_.c_str());

    do_early_screenshot_ = options_->do_progress_updates;

    // If we are going to use a socket, do it as early as possible
    // to avoid timeouts from bugreport.
    if (options_->use_socket) {
        if (!redirect_to_socket(stdout, "dumpstate")) {
            return ERROR;
        }
    }

    if (options_->use_control_socket) {
        MYLOGD("Opening control socket\n");
        control_socket_fd_ = open_socket("dumpstate");
        if (control_socket_fd_ == -1) {
            return ERROR;
        }
        options_->do_progress_updates = 1;
    }

    if (is_redirecting) {
        PrepareToWriteToFile();

        if (options_->do_progress_updates) {
            // clang-format off
            std::vector<std::string> am_args = {
                 "--receiver-permission", "android.permission.DUMP",
            };
            // clang-format on
            // Send STARTED broadcast for apps that listen to bugreport generation events
            SendBroadcast("com.android.internal.intent.action.BUGREPORT_STARTED", am_args);
            if (options_->use_control_socket) {
                dprintf(control_socket_fd_, "BEGIN:%s\n", path_.c_str());
            }
        }
    }

    /* read /proc/cmdline before dropping root */
    FILE *cmdline = fopen("/proc/cmdline", "re");
    if (cmdline) {
        fgets(cmdline_buf, sizeof(cmdline_buf), cmdline);
        fclose(cmdline);
    }

    if (options_->do_vibrate) {
        Vibrate(150);
    }

    if (options_->do_zip_file && zip_file != nullptr) {
        if (chown(path_.c_str(), AID_SHELL, AID_SHELL)) {
            MYLOGE("Unable to change ownership of zip file %s: %s\n", path_.c_str(),
                   strerror(errno));
        }
    }

    int dup_stdout_fd;
    int dup_stderr_fd;
    if (is_redirecting) {
        // Redirect stderr to log_path_ for debugging.
        TEMP_FAILURE_RETRY(dup_stderr_fd = dup(fileno(stderr)));
        if (!redirect_to_file(stderr, const_cast<char*>(log_path_.c_str()))) {
            return ERROR;
        }
        if (chown(log_path_.c_str(), AID_SHELL, AID_SHELL)) {
            MYLOGE("Unable to change ownership of dumpstate log file %s: %s\n", log_path_.c_str(),
                   strerror(errno));
        }

        // Redirect stdout to tmp_path_. This is the main bugreport entry and will be
        // moved into zip file later, if zipping.
        TEMP_FAILURE_RETRY(dup_stdout_fd = dup(fileno(stdout)));
        // TODO: why not write to a file instead of stdout to overcome this problem?
        /* TODO: rather than generating a text file now and zipping it later,
           it would be more efficient to redirect stdout to the zip entry
           directly, but the libziparchive doesn't support that option yet. */
        if (!redirect_to_file(stdout, const_cast<char*>(tmp_path_.c_str()))) {
            return ERROR;
        }
        if (chown(tmp_path_.c_str(), AID_SHELL, AID_SHELL)) {
            MYLOGE("Unable to change ownership of temporary bugreport file %s: %s\n",
                   tmp_path_.c_str(), strerror(errno));
        }
    }

    // Don't buffer stdout
    setvbuf(stdout, nullptr, _IONBF, 0);

    // NOTE: there should be no stdout output until now, otherwise it would break the header.
    // In particular, DurationReport objects should be created passing 'title, NULL', so their
    // duration is logged into MYLOG instead.
    PrintHeader();

    // TODO(b/158737089) reduce code repetition in if branches
    if (options_->telephony_only) {
        MaybeTakeEarlyScreenshot();
        onUiIntensiveBugreportDumpsFinished(calling_uid, calling_package);
        MaybeCheckUserConsent(calling_uid, calling_package);
        DumpstateTelephonyOnly(calling_package);
        DumpstateBoard();
    } else if (options_->wifi_only) {
        MaybeTakeEarlyScreenshot();
        onUiIntensiveBugreportDumpsFinished(calling_uid, calling_package);
        MaybeCheckUserConsent(calling_uid, calling_package);
        DumpstateWifiOnly();
    } else if (options_->limited_only) {
        MaybeTakeEarlyScreenshot();
        onUiIntensiveBugreportDumpsFinished(calling_uid, calling_package);
        MaybeCheckUserConsent(calling_uid, calling_package);
        DumpstateLimitedOnly();
    } else {
        // 首先调用dumpsys 以保留系统状态
        // Invoke critical dumpsys first to preserve system state, before doing anything else.
        RunDumpsysCritical();

        // Take screenshot and get consent only after critical dumpsys has finished.
        MaybeTakeEarlyScreenshot();
        onUiIntensiveBugreportDumpsFinished(calling_uid, calling_package);
        MaybeCheckUserConsent(calling_uid, calling_package);

        // 获取默认bugreport默认case
        // Dump state for the default case. This also drops root.
        RunStatus s = DumpstateDefaultAfterCritical();
        if (s != RunStatus::OK) {
            if (s == RunStatus::USER_CONSENT_DENIED) {
                HandleUserConsentDenied();
            }
            return s;
        }
    }

    /* close output if needed */
    if (is_redirecting) {
        TEMP_FAILURE_RETRY(dup2(dup_stdout_fd, fileno(stdout)));
    }

    // Zip the (now complete) .tmp file within the internal directory.
    if (options_->OutputToFile()) {
        FinalizeFile();
    }

    // Share the final file with the caller if the user has consented or Shell is the caller.
    Dumpstate::RunStatus status = Dumpstate::RunStatus::OK;
    if (CalledByApi()) {
        status = CopyBugreportIfUserConsented(calling_uid);
        if (status != Dumpstate::RunStatus::OK &&
            status != Dumpstate::RunStatus::USER_CONSENT_TIMED_OUT) {
            // Do an early return if there were errors. We make an exception for consent
            // timing out because it's possible the user got distracted. In this case the
            // bugreport is not shared but made available for manual retrieval.
            MYLOGI("User denied consent. Returning\n");
            return status;
        }
        if (status == Dumpstate::RunStatus::USER_CONSENT_TIMED_OUT) {
            MYLOGI(
                "Did not receive user consent yet."
                " Will not copy the bugreport artifacts to caller.\n");
            const String16 incidentcompanion("incidentcompanion");
            sp<android::IBinder> ics(defaultServiceManager()->getService(incidentcompanion));
            if (ics != nullptr) {
                MYLOGD("Canceling user consent request via incidentcompanion service\n");
                android::interface_cast<android::os::IIncidentCompanion>(ics)->cancelAuthorization(
                        consent_callback_.get());
            } else {
                MYLOGD("Unable to cancel user consent; incidentcompanion service unavailable\n");
            }
        }
    }

    /* vibrate a few but shortly times to let user know it's finished */
    if (options_->do_vibrate) {
        for (int i = 0; i < 3; i++) {
            Vibrate(75);
            usleep((75 + 50) * 1000);
        }
    }

    MYLOGD("Final progress: %d/%d (estimated %d)\n", progress_->Get(), progress_->GetMax(),
           progress_->GetInitialMax());
    progress_->Save();
    MYLOGI("done (id %d)\n", id_);

    if (is_redirecting) {
        TEMP_FAILURE_RETRY(dup2(dup_stderr_fd, fileno(stderr)));
    }

    if (options_->use_control_socket && control_socket_fd_ != -1) {
        MYLOGD("Closing control socket\n");
        close(control_socket_fd_);
    }

    tombstone_data_.clear();
    anr_data_.clear();

    return (consent_callback_ != nullptr &&
            consent_callback_->getResult() == UserConsentResult::UNAVAILABLE)
               ? USER_CONSENT_TIMED_OUT
               : RunStatus::OK;
}


/*
 * Dumps state for the default case; drops root after it's no longer necessary.
 *
 * Returns RunStatus::OK if everything went fine.
 * Returns RunStatus::ERROR if there was an error.
 * Returns RunStatus::USER_DENIED_CONSENT if user explicitly denied consent to sharing the bugreport
 * with the caller.
 */
Dumpstate::RunStatus Dumpstate::DumpstateDefaultAfterCritical() {
    // Capture first logcat early on; useful to take a snapshot before dumpstate logs take over the
    // buffer.
    // 抓取日志
    DoLogcat();
    // Capture timestamp after first logcat to use in next logcat
    time_t logcat_ts = time(nullptr);

    /* collect stack traces from Dalvik and native processes (needs root) */
    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(ds.DumpTraces, &dump_traces_path);

    /* Run some operations that require root. */
    ds.tombstone_data_ = GetDumpFds(TOMBSTONE_DIR, TOMBSTONE_FILE_PREFIX, !ds.IsZipping());
    ds.anr_data_ = GetDumpFds(ANR_DIR, ANR_FILE_PREFIX, !ds.IsZipping());

    ds.AddDir(RECOVERY_DIR, true);
    ds.AddDir(RECOVERY_DATA_DIR, true);
    ds.AddDir(UPDATE_ENGINE_LOG_DIR, true);
    ds.AddDir(LOGPERSIST_DATA_DIR, false);
    if (!PropertiesHelper::IsUserBuild()) {
        ds.AddDir(PROFILE_DATA_DIR_CUR, true);
        ds.AddDir(PROFILE_DATA_DIR_REF, true);
        ds.AddZipEntry(ZIP_ROOT_DIR + PACKAGE_DEX_USE_LIST, PACKAGE_DEX_USE_LIST);
    }
    ds.AddDir(PREREBOOT_DATA_DIR, false);
    add_mountinfo();
    DumpIpTablesAsRoot();
    DumpDynamicPartitionInfo();
    ds.AddDir(OTA_METADATA_DIR, true);

    // Capture any IPSec policies in play. No keys are exposed here.
    RunCommand("IP XFRM POLICY", {"ip", "xfrm", "policy"}, CommandOptions::WithTimeout(10).Build());

    // Dump IPsec stats. No keys are exposed here.
    DumpFile("XFRM STATS", XFRM_STAT_PROC_FILE);

    // Run ss as root so we can see socket marks.
    RunCommand("DETAILED SOCKET STATE", {"ss", "-eionptu"}, CommandOptions::WithTimeout(10).Build());

    // Run iotop as root to show top 100 IO threads
    RunCommand("IOTOP", {"iotop", "-n", "1", "-m", "100"});

    // Gather shared memory buffer info if the product implements it
    struct stat st;
    if (!stat("/product/bin/dmabuf_dump", &st)) {
        RunCommand("Dmabuf dump", {"/product/bin/dmabuf_dump"});
    }

    DumpFile("PSI cpu", "/proc/pressure/cpu");
    DumpFile("PSI memory", "/proc/pressure/memory");
    DumpFile("PSI io", "/proc/pressure/io");

    if (!DropRootUser()) {
        return Dumpstate::RunStatus::ERROR;
    }

    RETURN_IF_USER_DENIED_CONSENT();
    Dumpstate::RunStatus status = dumpstate();
    // Capture logcat since the last time we did it.
    DoSystemLogcat(logcat_ts);
    return status;
}


// Dumps various things. Returns early with status USER_CONSENT_DENIED if user denies consent
// via the consent they are shown. Ignores other errors that occur while running various
// commands. The consent checking is currently done around long running tasks, which happen to
// be distributed fairly evenly throughout the function.
static Dumpstate::RunStatus dumpstate() {
    DurationReporter duration_reporter("DUMPSTATE");

    // Dump various things. Note that anything that takes "long" (i.e. several seconds) should
    // check intermittently (if it's intrerruptable like a foreach on pids) and/or should be wrapped
    // in a consent check (via RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK).
    dump_dev_files("TRUSTY VERSION", "/sys/bus/platform/drivers/trusty", "trusty_version");
    RunCommand("UPTIME", {"uptime"});
    DumpBlockStatFiles();
    DumpFile("MEMORY INFO", "/proc/meminfo");
    RunCommand("CPU INFO", {"top", "-b", "-n", "1", "-H", "-s", "6", "-o",
                            "pid,tid,user,pr,ni,%cpu,s,virt,res,pcy,cmd,name"});

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(RunCommand, "PROCRANK", {"procrank"}, AS_ROOT_20);

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(DumpVisibleWindowViews);

    DumpFile("VIRTUAL MEMORY STATS", "/proc/vmstat");
    DumpFile("VMALLOC INFO", "/proc/vmallocinfo");
    DumpFile("SLAB INFO", "/proc/slabinfo");
    DumpFile("ZONEINFO", "/proc/zoneinfo");
    DumpFile("PAGETYPEINFO", "/proc/pagetypeinfo");
    DumpFile("BUDDYINFO", "/proc/buddyinfo");
    DumpExternalFragmentationInfo();

    DumpFile("KERNEL WAKE SOURCES", "/d/wakeup_sources");
    DumpFile("KERNEL CPUFREQ", "/sys/devices/system/cpu/cpu0/cpufreq/stats/time_in_state");

    RunCommand("PROCESSES AND THREADS",
               {"ps", "-A", "-T", "-Z", "-O", "pri,nice,rtprio,sched,pcy,time"});

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(RunCommand, "LIBRANK", {"librank"},
                                         CommandOptions::AS_ROOT);

    DumpHals();

    RunCommand("PRINTENV", {"printenv"});
    RunCommand("NETSTAT", {"netstat", "-nW"});
    struct stat s;
    if (stat("/proc/modules", &s) != 0) {
        MYLOGD("Skipping 'lsmod' because /proc/modules does not exist\n");
    } else {
        RunCommand("LSMOD", {"lsmod"});
    }

    if (__android_logger_property_get_bool(
            "ro.logd.kernel", BOOL_DEFAULT_TRUE | BOOL_DEFAULT_FLAG_ENG | BOOL_DEFAULT_FLAG_SVELTE)) {
        DoKernelLogcat();
    } else {
        do_dmesg();
    }

    RunCommand("LIST OF OPEN FILES", {"lsof"}, CommandOptions::AS_ROOT);

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(for_each_pid, do_showmap, "SMAPS OF ALL PROCESSES");

    for_each_tid(show_wchan, "BLOCKED PROCESS WAIT-CHANNELS");
    for_each_pid(show_showtime, "PROCESS TIMES (pid cmd user system iowait+percentage)");

    /* Dump Bluetooth HCI logs */
    ds.AddDir("/data/misc/bluetooth/logs", true);

    if (ds.options_->do_screenshot && !ds.do_early_screenshot_) {
        MYLOGI("taking late screenshot\n");
        ds.TakeScreenshot();
    }

    AddAnrTraceFiles();

    // NOTE: tombstones are always added as separate entries in the zip archive
    // and are not interspersed with the main report.
    const bool tombstones_dumped = AddDumps(ds.tombstone_data_.begin(), ds.tombstone_data_.end(),
                                            "TOMBSTONE", true /* add_to_zip */);
    if (!tombstones_dumped) {
        printf("*** NO TOMBSTONES to dump in %s\n\n", TOMBSTONE_DIR.c_str());
    }

    DumpPacketStats();

    RunDumpsys("EBPF MAP STATS", {"netd", "trafficcontroller"});

    DoKmsg();

    DumpIpAddrAndRules();

    dump_route_tables();

    RunCommand("ARP CACHE", {"ip", "-4", "neigh", "show"});
    RunCommand("IPv6 ND CACHE", {"ip", "-6", "neigh", "show"});
    RunCommand("MULTICAST ADDRESSES", {"ip", "maddr"});

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(RunDumpsysHigh);

    RunCommand("SYSTEM PROPERTIES", {"getprop"});

    RunCommand("STORAGED IO INFO", {"storaged", "-u", "-p"});

    RunCommand("FILESYSTEMS & FREE SPACE", {"df"});

    /* Binder state is expensive to look at as it uses a lot of memory. */
    std::string binder_logs_dir = access("/dev/binderfs/binder_logs", R_OK) ?
            "/sys/kernel/debug/binder" : "/dev/binderfs/binder_logs";

    DumpFile("BINDER FAILED TRANSACTION LOG", binder_logs_dir + "/failed_transaction_log");
    DumpFile("BINDER TRANSACTION LOG", binder_logs_dir + "/transaction_log");
    DumpFile("BINDER TRANSACTIONS", binder_logs_dir + "/transactions");
    DumpFile("BINDER STATS", binder_logs_dir + "/stats");
    DumpFile("BINDER STATE", binder_logs_dir + "/state");

    /* Add window and surface trace files. */
    if (!PropertiesHelper::IsUserBuild()) {
        ds.AddDir(WMTRACE_DATA_DIR, false);
    }

    ds.AddDir(SNAPSHOTCTL_LOG_DIR, false);

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(ds.DumpstateBoard);

    /* Migrate the ril_dumpstate to a device specific dumpstate? */
    int rilDumpstateTimeout = android::base::GetIntProperty("ril.dumpstate.timeout", 0);
    if (rilDumpstateTimeout > 0) {
        // su does not exist on user builds, so try running without it.
        // This way any implementations of vril-dump that do not require
        // root can run on user builds.
        CommandOptions::CommandOptionsBuilder options =
            CommandOptions::WithTimeout(rilDumpstateTimeout);
        if (!PropertiesHelper::IsUserBuild()) {
            options.AsRoot();
        }
        RunCommand("DUMP VENDOR RIL LOGS", {"vril-dump"}, options.Build());
    }

    printf("========================================================\n");
    printf("== Android Framework Services\n");
    printf("========================================================\n");

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(RunDumpsysNormal);

    printf("========================================================\n");
    printf("== Checkins\n");
    printf("========================================================\n");

    RunDumpsys("CHECKIN BATTERYSTATS", {"batterystats", "-c"});

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(RunDumpsys, "CHECKIN MEMINFO", {"meminfo", "--checkin"});

    RunDumpsys("CHECKIN NETSTATS", {"netstats", "--checkin"});
    RunDumpsys("CHECKIN PROCSTATS", {"procstats", "-c"});
    RunDumpsys("CHECKIN USAGESTATS", {"usagestats", "-c"});
    RunDumpsys("CHECKIN PACKAGE", {"package", "--checkin"});

    printf("========================================================\n");
    printf("== Running Application Activities\n");
    printf("========================================================\n");

    // The following dumpsys internally collects output from running apps, so it can take a long
    // time. So let's extend the timeout.

    const CommandOptions DUMPSYS_COMPONENTS_OPTIONS = CommandOptions::WithTimeout(60).Build();

    RunDumpsys("APP ACTIVITIES", {"activity", "-v", "all"}, DUMPSYS_COMPONENTS_OPTIONS);

    printf("========================================================\n");
    printf("== Running Application Services (platform)\n");
    printf("========================================================\n");

    RunDumpsys("APP SERVICES PLATFORM", {"activity", "service", "all-platform-non-critical"},
            DUMPSYS_COMPONENTS_OPTIONS);

    printf("========================================================\n");
    printf("== Running Application Services (non-platform)\n");
    printf("========================================================\n");

    RunDumpsys("APP SERVICES NON-PLATFORM", {"activity", "service", "all-non-platform"},
            DUMPSYS_COMPONENTS_OPTIONS);

    printf("========================================================\n");
    printf("== Running Application Providers (platform)\n");
    printf("========================================================\n");

    RunDumpsys("APP PROVIDERS PLATFORM", {"activity", "provider", "all-platform"},
            DUMPSYS_COMPONENTS_OPTIONS);

    printf("========================================================\n");
    printf("== Running Application Providers (non-platform)\n");
    printf("========================================================\n");

    RunDumpsys("APP PROVIDERS NON-PLATFORM", {"activity", "provider", "all-non-platform"},
            DUMPSYS_COMPONENTS_OPTIONS);

    printf("========================================================\n");
    printf("== Dropbox crashes\n");
    printf("========================================================\n");

    RunDumpsys("DROPBOX SYSTEM SERVER CRASHES", {"dropbox", "-p", "system_server_crash"});
    RunDumpsys("DROPBOX SYSTEM APP CRASHES", {"dropbox", "-p", "system_app_crash"});

    printf("========================================================\n");
    printf("== Final progress (pid %d): %d/%d (estimated %d)\n", ds.pid_, ds.progress_->Get(),
           ds.progress_->GetMax(), ds.progress_->GetInitialMax());
    printf("========================================================\n");
    printf("== dumpstate: done (id %d)\n", ds.id_);
    printf("========================================================\n");

    printf("========================================================\n");
    printf("== Obtaining statsd metadata\n");
    printf("========================================================\n");
    // This differs from the usual dumpsys stats, which is the stats report data.
    RunDumpsys("STATSDSTATS", {"stats", "--metadata"});

    // Add linker configuration directory
    ds.AddDir(LINKERCONFIG_DIR, true);

    RUN_SLOW_FUNCTION_WITH_CONSENT_CHECK(DumpIncidentReport);

    return Dumpstate::RunStatus::OK;
}

```

## bugreport.zip

生成报告路径： /data/user_de/0/com.android.shell/files/bugreports/

```txt

bugreport$ tree -L 2
.
├── bugreport-qssi-RKQ1.200903.002-2020-12-13-14-28-06.txt
├── dumpstate_log.txt
├── FS
│   ├── data
│   ├── linkerconfig
│   └── proc
├── lshal-debug
│   ├── android.hardware.audio.effect@6.0::IEffectsFactory_default.txt
│   ├── android.hardware.bluetooth@1.0::IBluetoothHci_default.txt
│   ├── android.hardware.drm@1.3::IDrmFactory_clearkey.txt
│   ├── android.hardware.health@2.1::IHealth_default.txt
│   ├── android.hardware.media.c2@1.1::IComponentStore_software.txt
│   ├── android.hardware.sensors@2.0::ISensors_default.txt
│   └── android.hardware.wifi@1.4::IWifi_default.txt
├── main_entry.txt
├── proto
│   ├── activity_CRITICAL.proto
│   ├── activity.proto
│   ├── incident_report.proto
│   ├── SurfaceFlinger_CRITICAL.proto
│   └── window_CRITICAL.proto
├── version.txt
├── visible_windows
│   ├── 6ab5864 StatusBar
│   └── d2fcfdc com.android.settings
└── visible_windows.zip

```

## 交互式生成错误报告

```txt

--------- beginning of main
12-13 15:59:10.127 11924 11924 I dumpstate: 'dumpstate' service started and will wait for a call to startBugreport()
12-13 15:59:10.579 11924 11925 I dumpstate: startBugreport() with mode: 1
12-13 15:59:10.598 11924 11927 I dumpstate: do_zip_file: 1 do_vibrate: 1 use_socket: 0 use_control_socket: 0 do_screenshot: 0 is_remote_mode: 0 show_header_only: 0 do_start_service: 1 telephony_only: 0 wifi_only: 0 do_progress_updates: 1 fd: 9 bugreport_mode: BUGREPORT_INTERACTIVE dumpstate_hal_mode: INTERACTIVE limited_only: 0 args: 
12-13 15:59:10.603 11924 11927 D dumpstate: dumpstate calling_uid = 2000 ; calling package = com.android.shell 
12-13 15:59:10.604 11924 11927 D dumpstate: Loading stats from /bugreports/dumpstate-stats.txt
12-13 15:59:10.605 11924 11927 I dumpstate: Average max progress: 8016 in 3 runs; estimated max: 8016
12-13 15:59:10.615 11924 11927 D dumpstate: Wake lock acquired.
12-13 15:59:10.616 11924 11927 I dumpstate: Starting 'dumpstate' service
12-13 15:59:10.619 11924 11927 I dumpstate: dumpstate info: id=4, args='', bugreport_mode= BUGREPORT_INTERACTIVE bugreport format version: 2.0
12-13 15:59:10.625 11924 11927 D dumpstate: Bugreport dir: [[fd:9]] Base name: [bugreport-qssi-RKQ1.200903.002] Suffix: [2020-12-13-15-59-10] Log path: [/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10-dumpstate_log-11924.txt] Temporary path: [/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10.tmp] Screenshot path: []
12-13 15:59:10.625 11924 11927 D dumpstate: Creating initial .zip file (/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10-zip.tmp)
12-13 15:59:10.629 11924 11927 D dumpstate: Adding zip text entry version.txt
12-13 15:59:10.632 11924 11927 I dumpstate: Sending broadcast: '/system/bin/cmd activity broadcast --user 0 --receiver-foreground --receiver-include-background -a com.android.internal.intent.action.BUGREPORT_STARTED --receiver-permission android.permission.DUMP'
12-13 15:59:10.752 11924 11927 D dumpstate: Setting progress: 20/8016 (0%)
12-13 15:59:10.754 11924 11927 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 150 dumpstate'
12-13 15:59:10.882 11924 11927 D dumpstate: Setting progress: 30/8016 (0%)
12-13 15:59:10.893 11924 11927 D dumpstate: Module metadata package name: com.android.modulemetadata
12-13 15:59:17.440 11924 11927 D dumpstate: Setting progress: 80/8016 (0%)
12-13 15:59:17.442 11924 11927 D dumpstate: Duration of 'SYSTEM LOG': 6.00s
12-13 15:59:17.921 11924 11927 D dumpstate: Duration of 'EVENT LOG': 0.48s
12-13 15:59:18.028 11924 11927 D dumpstate: Duration of 'STATS LOG': 0.11s
12-13 15:59:18.278 11924 11927 D dumpstate: Duration of 'RADIO LOG': 0.25s
12-13 15:59:18.474 11924 11927 E dumpstate: *** command 'logcat -L -b all -v threadtime -v printable -v uid -d *:v' failed: exit code 1
12-13 15:59:18.559 11924 11927 I dumpstate: libdebuggerd_client: started dumping process 544
12-13 15:59:18.795 11924 11927 I dumpstate: libdebuggerd_client: done dumping process 544
.................................................................................................
12-13 15:59:41.066 11924 11927 I dumpstate: libdebuggerd_client: started dumping process 16448
12-13 15:59:41.236 11924 11927 I dumpstate: libdebuggerd_client: done dumping process 16448
12-13 15:59:41.252 11924 11927 I dumpstate: libdebuggerd_client: started dumping process 19886
12-13 15:59:41.449 11924 11927 I dumpstate: libdebuggerd_client: done dumping process 19886
12-13 15:59:41.461 11924 11927 I dumpstate: libdebuggerd_client: started dumping process 20036
12-13 15:59:41.665 11924 11927 I dumpstate: libdebuggerd_client: done dumping process 20036
12-13 15:59:41.668 11924 11927 D dumpstate: Duration of 'DUMP TRACES': 23.19s
12-13 15:59:41.687 11924 11927 D dumpstate: Adding dir /cache/recovery (recursive: 1)
12-13 15:59:41.688 11924 11927 D dumpstate: Adding dir /data/misc/recovery (recursive: 1)
12-13 15:59:41.693 11924 11927 D dumpstate: Adding dir /data/misc/update_engine_log (recursive: 1)
12-13 15:59:41.699 11924 11927 D dumpstate: Adding dir /data/misc/logd (recursive: 0)
12-13 15:59:41.700 11924 11927 D dumpstate: Adding dir /data/misc/profiles/cur (recursive: 1)
12-13 15:59:41.778 11924 11927 D dumpstate: Adding dir /data/misc/profiles/ref (recursive: 1)
12-13 15:59:41.807 11924 11927 D dumpstate: Adding dir /data/misc/prereboot (recursive: 0)
12-13 15:59:42.201 11924 11927 D dumpstate: MOUNT INFO: 53 entries added to zip file
12-13 15:59:44.086 11924 11927 D dumpstate: Duration of 'LPDUMP': 1.16s
12-13 15:59:45.213 11924 11927 D dumpstate: Duration of 'DEVICE-MAPPER': 1.13s
12-13 15:59:45.214 11924 11927 D dumpstate: Adding dir /metadata/ota (recursive: 1)
12-13 15:59:46.367 11924 11927 D dumpstate: Duration of 'DETAILED SOCKET STATE': 1.08s
12-13 15:59:48.462 11924 11927 D dumpstate: Duration of 'IOTOP': 2.09s
12-13 15:59:54.327 11924 11927 D dumpstate: Duration of 'CPU INFO': 5.48s
12-13 16:00:14.338 11924 11927 E dumpstate: *** command '/system/xbin/su root procrank' timed out after 20.009s (killing pid 12241)
12-13 16:00:17.971 11924 11927 D dumpstate: Duration of 'PROCRANK': 23.64s
12-13 16:00:21.380 11924 11927 D dumpstate: Duration of 'PROCESSES AND THREADS': 2.94s
12-13 16:00:31.391 11924 11927 E dumpstate: *** command '/system/xbin/su root librank' timed out after 10.009s (killing pid 12363)
12-13 16:00:41.393 11924 11927 E dumpstate: could not kill command '/system/xbin/su root librank' (pid 12363) even with SIGKILL.
12-13 16:00:41.394 11924 11927 D dumpstate: Duration of 'LIBRANK': 20.01s
12-13 16:00:45.850 11924 11927 E dumpstate: *** command '/system/xbin/su root lshal -lVSietrpc --types=b,c,l,z' timed out after 4.442s (killing pid 12455)
12-13 16:00:45.907 11924 11927 D dumpstate: Duration of 'HARDWARE HALS': 4.51s
12-13 16:01:27.746 11924 11927 D dumpstate: Duration of 'DUMP HALS': 46.35s
12-13 16:01:34.299 11924 11927 D dumpstate: Duration of 'LIST OF OPEN FILES': 5.93s
12-13 16:01:36.769 11924 11927 D dumpstate: Setting progress: 805/8016 (10%)
12-13 16:01:45.735 11924 11927 D dumpstate: Setting progress: 1605/8016 (20%)
12-13 16:01:54.484 11924 11927 D dumpstate: Setting progress: 2405/8016 (30%)
12-13 16:02:03.818 11924 11927 D dumpstate: Setting progress: 3215/8016 (40%)
12-13 16:02:13.306 11924 11927 D dumpstate: Setting progress: 4015/8016 (50%)
12-13 16:02:22.923 11924 11927 D dumpstate: Setting progress: 4815/8016 (60%)
12-13 16:02:32.876 11924 11927 D dumpstate: Setting progress: 5615/8016 (70%)
12-13 16:02:44.813 11924 11927 D dumpstate: Setting progress: 6415/8016 (80%)
12-13 16:02:50.879 11924 11927 D dumpstate: Duration of 'for_each_pid(SMAPS OF ALL PROCESSES)': 76.58s
12-13 16:02:51.936 11924 11927 D dumpstate: Duration of 'for_each_tid(BLOCKED PROCESS WAIT-CHANNELS)': 1.06s
12-13 16:02:52.133 11924 11927 D dumpstate: Adding dir /data/misc/bluetooth/logs (recursive: 1)
12-13 16:02:52.133 11924 11927 D dumpstate: AddAnrTraceDir(): dump_traces_file=/data/anr/dumptrace_qAMyGl, anr_traces_dir=/data/anr
12-13 16:02:52.133 11924 11927 D dumpstate: Dumping current ANR traces (/data/anr/dumptrace_qAMyGl) to the main bugreport entry
12-13 16:02:52.159 11924 11927 W dumpstate: Error unlinking temporary trace path /data/anr/dumptrace_qAMyGl: Permission denied
12-13 16:02:55.100 11924 11927 D dumpstate: Duration of 'DUMP ROUTE TABLES': 1.55s
12-13 16:02:55.401 11924 11927 D dumpstate: Setting progress: 7215/8016 (90%)
12-13 16:03:08.992 11924 11927 D dumpstate: Duration of 'DUMPSYS HIGH': 13.59s
12-13 16:03:09.585 11924 11927 D dumpstate: Adding dir /data/misc/wmtrace (recursive: 0)
12-13 16:03:09.586 11924 11927 D dumpstate: Adding dir /data/misc/snapshotctl_log (recursive: 0)
12-13 16:03:09.590 11924 11927 E dumpstate: No IDumpstateDevice implementation
12-13 16:03:09.590 11924 11927 E dumpstate: Failed to unlink file (/data/user_de/0/com.android.shell/files/bugreports/dumpstate_board.bin): No such file or directory
12-13 16:03:09.590 11924 11927 E dumpstate: Failed to unlink file (/data/user_de/0/com.android.shell/files/bugreports/dumpstate_board.txt): No such file or directory
12-13 16:03:09.978 11924 11924 W Binder:11924_3: type=1400 audit(0.0:561): avc: denied { use } for path="pipe:[1255084]" dev="pipefs" ino=1255084 scontext=u:r:hal_power_default:s0 tcontext=u:r:dumpstate:s0 tclass=fd permissive=0
12-13 16:03:18.518 11924 11924 W Binder:11924_3: type=1400 audit(0.0:562): avc: denied { use } for path="pipe:[1258953]" dev="pipefs" ino=1258953 scontext=u:r:system_suspend:s0 tcontext=u:r:dumpstate:s0 tclass=fd permissive=0
12-13 16:03:19.853 11924 11927 D dumpstate: Duration of 'DUMPSYS': 10.26s
12-13 16:03:29.073 11924 11927 D dumpstate: Duration of 'CHECKIN MEMINFO': 8.70s
12-13 16:03:35.362 11924 11927 D dumpstate: Duration of 'APP SERVICES PLATFORM': 5.56s
12-13 16:03:36.374 11924 11927 D dumpstate: Duration of 'APP PROVIDERS PLATFORM': 0.68s
12-13 16:03:36.821 11924 11927 D dumpstate: Adding dir /linkerconfig (recursive: 1)
12-13 16:04:13.545 11924 11927 D dumpstate: Duration of 'INCIDENT REPORT': 36.70s
12-13 16:04:13.546 11924 11927 D dumpstate: Duration of 'DUMPSTATE': 265.07s
12-13 16:04:14.279 11924 11927 D dumpstate: Duration of 'SYSTEM LOG': 0.73s
12-13 16:04:14.280 11924 11927 D dumpstate: Adding main entry (bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10.txt) from /data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10.tmp to .zip bugreport
12-13 16:04:14.280 11924 11927 D dumpstate: dumpstate id 4 finished around 2020/12/13 16:04:14 (304 s)
12-13 16:04:18.108 11924 11927 D dumpstate: Adding zip text entry main_entry.txt
12-13 16:04:18.110 11924 11927 D dumpstate: Removing temporary file /data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10.tmp
12-13 16:04:18.141 11924 11927 D dumpstate: Going to copy file (/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-15-59-10-zip.tmp) to 9
12-13 16:04:18.229 11924 11927 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 75 dumpstate'
12-13 16:04:18.469 11924 11927 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 75 dumpstate'
12-13 16:04:18.712 11924 11927 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 75 dumpstate'
12-13 16:04:18.970 11924 11927 D dumpstate: Final progress: 7920/8016 (estimated 8016)
12-13 16:04:18.972 11924 11927 I dumpstate: Saving stats (total=31968, runs=4, average=7992) on /bugreports/dumpstate-stats.txt
12-13 16:04:18.976 11924 11927 I dumpstate: done (id 4)
12-13 16:04:19.024 11924 11927 D dumpstate: Finished taking a bugreport. Exiting.

```

## 生成完整报告

```txt

--------- beginning of main
12-13 16:09:42.064 17920 17920 I dumpstate: 'dumpstate' service started and will wait for a call to startBugreport()
12-13 16:09:42.515 17920 17922 I dumpstate: startBugreport() with mode: 0
12-13 16:09:42.538 17920 17923 I dumpstate: do_zip_file: 1 do_vibrate: 1 use_socket: 0 use_control_socket: 0 do_screenshot: 1 is_remote_mode: 0 show_header_only: 0 do_start_service: 0 telephony_only: 0 wifi_only: 0 do_progress_updates: 0 fd: 9 bugreport_mode: BUGREPORT_FULL dumpstate_hal_mode: FULL limited_only: 0 args: 
12-13 16:09:42.542 17920 17923 D dumpstate: dumpstate calling_uid = 2000 ; calling package = com.android.shell 
12-13 16:09:42.542 17920 17923 D dumpstate: Loading stats from /bugreports/dumpstate-stats.txt
12-13 16:09:42.543 17920 17923 I dumpstate: Average max progress: 7992 in 4 runs; estimated max: 7992
12-13 16:09:42.557 17920 17923 D dumpstate: Wake lock acquired.
12-13 16:09:42.558 17920 17923 I dumpstate: dumpstate info: id=5, args='', bugreport_mode= BUGREPORT_FULL bugreport format version: 2.0
12-13 16:09:42.563 17920 17923 D dumpstate: Bugreport dir: [[fd:9]] Base name: [bugreport-qssi-RKQ1.200903.002] Suffix: [2020-12-13-16-09-42] Log path: [/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42-dumpstate_log-17920.txt] Temporary path: [/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42.tmp] Screenshot path: [/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42-png.tmp]
12-13 16:09:42.563 17920 17923 D dumpstate: Creating initial .zip file (/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42-zip.tmp)
12-13 16:09:42.566 17920 17923 D dumpstate: Adding zip text entry version.txt
12-13 16:09:42.570 17920 17923 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 150 dumpstate'
12-13 16:09:42.681 17920 17923 D dumpstate: Module metadata package name: com.android.modulemetadata
12-13 16:09:43.435 17920 17923 D dumpstate: Duration of 'DUMPSYS CRITICAL': 0.68s
12-13 16:09:46.286 17920 17923 D dumpstate: Duration of 'SYSTEM LOG': 2.80s
12-13 16:09:46.757 17920 17923 D dumpstate: Duration of 'EVENT LOG': 0.47s
12-13 16:09:46.851 17920 17923 D dumpstate: Duration of 'STATS LOG': 0.09s
12-13 16:09:47.150 17920 17923 D dumpstate: Duration of 'RADIO LOG': 0.30s
12-13 16:09:47.387 17920 17923 E dumpstate: *** command 'logcat -L -b all -v threadtime -v printable -v uid -d *:v' failed: exit code 1
12-13 16:09:47.496 17920 17923 I dumpstate: libdebuggerd_client: started dumping process 544
12-13 16:09:47.714 17920 17923 I dumpstate: libdebuggerd_client: done dumping process 544
....................................................................................................................
12-13 16:10:14.869 17920 17923 I dumpstate: libdebuggerd_client: started dumping process 20036
12-13 16:10:15.046 17920 17923 I dumpstate: libdebuggerd_client: done dumping process 20036
12-13 16:10:15.049 17920 17923 D dumpstate: Duration of 'DUMP TRACES': 27.66s
12-13 16:10:15.071 17920 17923 D dumpstate: Adding dir /cache/recovery (recursive: 1)
12-13 16:10:15.073 17920 17923 D dumpstate: Adding dir /data/misc/recovery (recursive: 1)
12-13 16:10:15.080 17920 17923 D dumpstate: Adding dir /data/misc/update_engine_log (recursive: 1)
12-13 16:10:15.083 17920 17923 D dumpstate: Adding dir /data/misc/logd (recursive: 0)
12-13 16:10:15.084 17920 17923 D dumpstate: Adding dir /data/misc/profiles/cur (recursive: 1)
12-13 16:10:15.168 17920 17923 D dumpstate: Adding dir /data/misc/profiles/ref (recursive: 1)
12-13 16:10:15.199 17920 17923 D dumpstate: Adding dir /data/misc/prereboot (recursive: 0)
12-13 16:10:15.553 17920 17923 D dumpstate: MOUNT INFO: 52 entries added to zip file
12-13 16:10:17.303 17920 17923 D dumpstate: Duration of 'LPDUMP': 1.16s
12-13 16:10:18.463 17920 17923 D dumpstate: Duration of 'DEVICE-MAPPER': 1.16s
12-13 16:10:18.463 17920 17923 D dumpstate: Adding dir /metadata/ota (recursive: 1)
12-13 16:10:19.624 17920 17923 D dumpstate: Duration of 'DETAILED SOCKET STATE': 1.08s
12-13 16:10:21.604 17920 17923 D dumpstate: Duration of 'IOTOP': 1.98s
12-13 16:10:26.764 17920 17923 D dumpstate: Duration of 'CPU INFO': 4.84s
12-13 16:10:46.775 17920 17923 E dumpstate: *** command '/system/xbin/su root procrank' timed out after 20.009s (killing pid 18252)
12-13 16:10:49.948 17920 17923 D dumpstate: Duration of 'PROCRANK': 23.18s
12-13 16:10:52.788 17920 17923 D dumpstate: Duration of 'PROCESSES AND THREADS': 2.34s
12-13 16:11:02.800 17920 17923 E dumpstate: *** command '/system/xbin/su root librank' timed out after 10.009s (killing pid 18389)
12-13 16:11:12.805 17920 17923 E dumpstate: could not kill command '/system/xbin/su root librank' (pid 18389) even with SIGKILL.
12-13 16:11:12.808 17920 17923 D dumpstate: Duration of 'LIBRANK': 20.02s
12-13 16:11:16.811 17920 17923 E dumpstate: *** command '/system/xbin/su root lshal -lVSietrpc --types=b,c,l,z' timed out after 3.971s (killing pid 18476)
12-13 16:11:17.345 17920 17923 D dumpstate: Duration of 'HARDWARE HALS': 4.54s
12-13 16:12:00.612 17920 17923 D dumpstate: Duration of 'DUMP HALS': 47.80s
12-13 16:12:06.605 17920 17923 D dumpstate: Duration of 'LIST OF OPEN FILES': 5.35s
12-13 16:13:25.766 17920 17923 D dumpstate: Duration of 'for_each_pid(SMAPS OF ALL PROCESSES)': 79.16s
12-13 16:13:26.659 17920 17923 D dumpstate: Duration of 'for_each_tid(BLOCKED PROCESS WAIT-CHANNELS)': 0.89s
12-13 16:13:26.855 17920 17923 D dumpstate: Adding dir /data/misc/bluetooth/logs (recursive: 1)
12-13 16:13:26.855 17920 17923 I dumpstate: taking late screenshot
12-13 16:13:27.670 17920 17923 D dumpstate: Screenshot saved on /data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42-png.tmp
12-13 16:13:27.671 17920 17923 D dumpstate: AddAnrTraceDir(): dump_traces_file=/data/anr/dumptrace_2oVVjc, anr_traces_dir=/data/anr
12-13 16:13:27.671 17920 17923 D dumpstate: Dumping current ANR traces (/data/anr/dumptrace_2oVVjc) to the main bugreport entry
12-13 16:13:27.685 17920 17923 W dumpstate: Error unlinking temporary trace path /data/anr/dumptrace_2oVVjc: Permission denied
12-13 16:13:30.940 17920 17923 D dumpstate: Duration of 'DUMP ROUTE TABLES': 1.80s
12-13 16:13:44.155 17920 17923 D dumpstate: Duration of 'DUMPSYS HIGH': 12.92s
12-13 16:13:44.765 17920 17923 D dumpstate: Adding dir /data/misc/wmtrace (recursive: 0)
12-13 16:13:44.765 17920 17923 D dumpstate: Adding dir /data/misc/snapshotctl_log (recursive: 0)
12-13 16:13:44.771 17920 17923 E dumpstate: No IDumpstateDevice implementation
12-13 16:13:44.772 17920 17923 E dumpstate: Failed to unlink file (/data/user_de/0/com.android.shell/files/bugreports/dumpstate_board.bin): No such file or directory
12-13 16:13:44.772 17920 17923 E dumpstate: Failed to unlink file (/data/user_de/0/com.android.shell/files/bugreports/dumpstate_board.txt): No such file or directory
12-13 16:13:45.358 17920 17920 W Binder:17920_3: type=1400 audit(0.0:574): avc: denied { use } for path="pipe:[1386776]" dev="pipefs" ino=1386776 scontext=u:r:hal_power_default:s0 tcontext=u:r:dumpstate:s0 tclass=fd permissive=0
12-13 16:13:54.268 17920 17920 W Binder:17920_3: type=1400 audit(0.0:575): avc: denied { use } for path="pipe:[1374086]" dev="pipefs" ino=1374086 scontext=u:r:system_suspend:s0 tcontext=u:r:dumpstate:s0 tclass=fd permissive=0
12-13 16:13:55.715 17920 17923 D dumpstate: Duration of 'DUMPSYS': 10.94s
12-13 16:14:04.611 17920 17923 D dumpstate: Duration of 'CHECKIN MEMINFO': 8.25s
12-13 16:14:11.429 17920 17923 D dumpstate: Duration of 'APP SERVICES PLATFORM': 6.13s
12-13 16:14:12.331 17920 17923 D dumpstate: Duration of 'APP PROVIDERS PLATFORM': 0.54s
12-13 16:14:12.844 17920 17923 D dumpstate: Adding dir /linkerconfig (recursive: 1)
12-13 16:14:52.943 17920 17923 D dumpstate: Duration of 'INCIDENT REPORT': 40.07s
12-13 16:14:52.943 17920 17923 D dumpstate: Duration of 'DUMPSTATE': 271.33s
12-13 16:14:53.739 17920 17923 D dumpstate: Duration of 'SYSTEM LOG': 0.80s
12-13 16:14:53.739 17920 17923 D dumpstate: Adding main entry (bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42.txt) from /data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42.tmp to .zip bugreport
12-13 16:14:53.739 17920 17923 D dumpstate: dumpstate id 5 finished around 2020/12/13 16:14:53 (311 s)
12-13 16:14:57.497 17920 17923 D dumpstate: Adding zip text entry main_entry.txt
12-13 16:14:57.499 17920 17923 D dumpstate: Removing temporary file /data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42.tmp
12-13 16:14:57.530 17920 17923 D dumpstate: Going to copy file (/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42-zip.tmp) to 9
12-13 16:14:57.616 17920 17923 D dumpstate: Going to copy file (/data/user_de/0/com.android.shell/files/bugreports/bugreport-qssi-RKQ1.200903.002-2020-12-13-16-09-42-png.tmp) to 10
12-13 16:14:57.618 17920 17923 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 75 dumpstate'
12-13 16:14:57.827 17920 17923 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 75 dumpstate'
12-13 16:14:58.042 17920 17923 I dumpstate: Vibrate: 'cmd vibrator vibrate -f 75 dumpstate'
12-13 16:14:58.326 17920 17923 D dumpstate: Final progress: 7980/7992 (estimated 7992)
12-13 16:14:58.328 17920 17923 I dumpstate: Saving stats (total=39948, runs=5, average=7989) on /bugreports/dumpstate-stats.txt
12-13 16:14:58.331 17920 17923 I dumpstate: done (id 5)
12-13 16:14:58.369 17920 17923 D dumpstate: Finished taking a bugreport. Exiting.

```



