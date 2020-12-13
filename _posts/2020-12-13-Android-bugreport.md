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

adb bugreport E:\

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

