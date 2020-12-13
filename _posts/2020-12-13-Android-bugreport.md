---
layout:     post
title:      Android bugreport
subtitle:   adb bugreport
date:       2020-12-13
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - bugreport
---

[获取并阅读错误报告-Google](https://developer.android.google.cn/studio/debug/bug-report?hl=zh-cn)

[bugreport源码篇-Gityuan](http://gityuan.com/2016/06/10/bugreport/)

## 通过设备获取bugreport

![device_bugreport](/images/device_bugreport.png)

## 通过命令获取bugreport

```txt

debug$ adb bugreport bugreport.zip
/data/user_de/0/com.android.shell/files/bugreports/bugrep...le pulled, 0 skipped. 29.6 MB/s (8659982 bytes in 0.279s)
Bug report copied to bugreport.zip

```

## ChkBugReport

[BugReport分析利器-ChkBugReport-简书](https://www.jianshu.com/p/9c4a8642ccbf)

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

```txt

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





