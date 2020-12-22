---
layout:     post
title:      Android R UsbDebug
subtitle:   Usb调试变更
date:       2020-11-17
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

[android 11 无线调试-Google](https://developer.android.google.cn/studio/command-line/adb?hl=zh-cn)

## 调试菜单

![usb_debug_1](/images/usb/usb_debug_1.png)

## 调试命令

```txt

# adb pair ipaddr:port

Enter pairing code: 863900
Successfully paired to 10.10.162.71:40473 [guid=adb-1faa4c6c-9wDPhJ]

$ adb connect 10.10.162.71:42491
connected to 10.10.162.71:42491

```

## 开机初始化流程

![adb_service_init](/images/adb/adb_service_init.png)

## Settings

### 开发者选项

**development_settings.xml**

```xml

<PreferenceScreen xmlns:android="http://schemas.android.com/apk/res/android"
                  xmlns:settings="http://schemas.android.com/apk/res-auto"
                  android:key="development_prefs_screen"
                  android:title="@string/development_settings_title">

        <SwitchPreference
            android:key="enable_adb"
            android:title="@string/enable_adb"
            android:summary="@string/enable_adb_summary" />

        <Preference android:key="clear_adb_keys"
                    android:title="@string/clear_adb_keys" />

        <com.android.settings.widget.MasterSwitchPreference
            android:fragment="com.android.settings.development.WirelessDebuggingFragment"
            android:key="toggle_adb_wireless"
            android:title="@string/enable_adb_wireless"
            android:summary="@string/enable_adb_wireless_summary"
            settings:keywords="@string/keywords_adb_wireless" />

        <SwitchPreference
            android:key="adb_authorization_timeout"
            android:title="@string/adb_authorization_timeout_title"
            android:summary="@string/adb_authorization_timeout_summary" />

</PreferenceScreen>

```

### USB调试

**AdbPreferenceController.java**

```java

    public void onAdbDialogConfirmed() {
        writeAdbSetting(true);
    }

    protected void writeAdbSetting(boolean enabled) {
        Settings.Global.putInt(mContext.getContentResolver(),
                Settings.Global.ADB_ENABLED, enabled ? ADB_SETTING_ON : ADB_SETTING_OFF);
        notifyStateChanged();
    }

```

**SystemUI---UsbDebuggingActivity**

![usb_debug_fingerprint](/images/usb/usb_debug_fingerprint.png)

```java

public class UsbDebuggingActivity extends AlertActivity
                                  implements DialogInterface.OnClickListener {


    /**
     * Notifies the ADB service as to whether the current ADB request should be allowed, and if
     * subsequent requests from this key should be allowed without user consent.
     *
     * @param allow whether the connection should be allowed
     * @param alwaysAllow whether subsequent requests from this key should be allowed without user
     *                    consent
     */
    private void notifyService(boolean allow, boolean alwaysAllow) {
        try {
            IBinder b = ServiceManager.getService(ADB_SERVICE);
            IAdbManager service = IAdbManager.Stub.asInterface(b);
            if (allow) {
                service.allowDebugging(alwaysAllow, mKey);
            } else {
                service.denyDebugging();
            }
            mServiceNotified = true;
        } catch (Exception e) {
            Log.e(TAG, "Unable to notify Usb service", e);
        }
    }

}

```

### 撤消 USB 调试授权

**ClearAdbKeysPreferenceController.java**

```java

    private final IAdbManager mAdbManager;

    public ClearAdbKeysPreferenceController(Context context,
            DevelopmentSettingsDashboardFragment fragment) {
        super(context);

        mAdbManager = IAdbManager.Stub.asInterface(ServiceManager.getService(Context.ADB_SERVICE));
    }

    public void onClearAdbKeysConfirmed() {
        try {
            mAdbManager.clearDebuggingKeys();
        } catch (RemoteException e) {
            Log.e(TAG, "Unable to clear adb keys", e);
        }
    }

```

### 无线调试

![usb_debug_wifi](/images/usb/usb_debug_wifi.png)

**SystemUI---WifiDebuggingActivity.java**

```java

public class WifiDebuggingActivity extends AlertActivity
                                  implements DialogInterface.OnClickListener {

    @Override
    public void onClick(DialogInterface dialog, int which) {
        mClicked = true;
        boolean allow = (which == AlertDialog.BUTTON_POSITIVE);
        boolean alwaysAllow = allow && mAlwaysAllow.isChecked();
        try {
            IBinder b = ServiceManager.getService(ADB_SERVICE);
            IAdbManager service = IAdbManager.Stub.asInterface(b);
            if (allow) {
                service.allowWirelessDebugging(alwaysAllow, mBssid);
            } else {
                service.denyWirelessDebugging();
            }
        } catch (Exception e) {
            Log.e(TAG, "Unable to notify Adb service", e);
        }
        finish();
    }

}

```


**WirelessDebuggingPreferenceController.java**

```java

    private final IAdbManager mAdbManager;

    public WirelessDebuggingPreferenceController(Context context, Lifecycle lifecycle) {

        mAdbManager = IAdbManager.Stub.asInterface(ServiceManager.getService(Context.ADB_SERVICE));

    }

    @Override
    public boolean isAvailable() {
        try {
            return mAdbManager.isAdbWifiSupported();
        } catch (RemoteException e) {
            Log.e(TAG, "Unable to check if adb wifi is supported.", e);
        }

        return false;
    }

    @Override
    public boolean onPreferenceChange(Preference preference, Object newValue) {

            Settings.Global.putInt(mContext.getContentResolver(),
                Settings.Global.ADB_WIFI_ENABLED,
                enabled ? AdbPreferenceController.ADB_SETTING_ON
                : AdbPreferenceController.ADB_SETTING_OFF);

    }

```

![usb_debug_2](/images/usb/usb_debug_2.png)

**adb_wireless_settings.xml**

```xml

<PreferenceScreen
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:settings="http://schemas.android.com/apk/res-auto"
        android:title="@string/adb_wireless_settings">

    <PreferenceCategory
        android:layout="@layout/preference_category_no_label">
        <!-- ADB device name -->
        <Preference
            android:key="adb_device_name_pref"
            android:title="@string/my_device_info_device_name_preference_title"
            android:summary="@string/summary_placeholder"
            android:selectable="false"
            settings:controller="com.android.settings.development.AdbDeviceNamePreferenceController"
            settings:enableCopying="true"/>

        <!-- IP address & port -->
        <Preference
            android:key="adb_ip_addr_pref"
            android:title="@string/adb_wireless_ip_addr_preference_title"
            android:summary="@string/summary_placeholder"
            android:selectable="false"/>
    </PreferenceCategory>

    <!-- Pairing methods category -->
    <PreferenceCategory
        android:key="adb_pairing_methods_category"
        android:layout="@layout/preference_category_no_label">
        <!-- qrcode scanner -->
        <Preference
            android:key="adb_pair_method_qrcode_pref"
            android:icon="@drawable/ic_scan_24dp"
            android:title="@string/adb_pair_method_qrcode_title"
            android:summary="@string/adb_pair_method_qrcode_summary"
            settings:controller="com.android.settings.development.AdbQrCodePreferenceController"/>
        <Preference
            android:key="adb_pair_method_code_pref"
            android:title="@string/adb_pair_method_code_title"
            android:summary="@string/adb_pair_method_code_summary"/>
    </PreferenceCategory>

    <!-- Paired devices list -->
    <PreferenceCategory
        android:key="adb_paired_devices_category"
        android:title="@string/adb_paired_devices_title"/>

    <!-- Off message: Shown only in the off state -->
    <PreferenceCategory
        android:key="adb_wireless_footer_category"
        android:layout="@layout/preference_category_no_label"
        settings:allowDividerAbove="false"/>

</PreferenceScreen>

```

**WirelessDebuggingFragment.java**

```java

    private AdbWirelessDialog mPairingCodeDialog;

    private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (AdbManager.WIRELESS_DEBUG_PAIRED_DEVICES_ACTION.equals(action)) {
                Map<String, PairDevice> newPairedDevicesList =
                        (HashMap<String, PairDevice>) intent.getSerializableExtra(
                            AdbManager.WIRELESS_DEVICES_EXTRA);
            } else if (AdbManager.WIRELESS_DEBUG_STATE_CHANGED_ACTION.equals(action)) {
                int status = intent.getIntExtra(AdbManager.WIRELESS_STATUS_EXTRA,
                        AdbManager.WIRELESS_STATUS_DISCONNECTED);
                if (status == AdbManager.WIRELESS_STATUS_CONNECTED
                        || status == AdbManager.WIRELESS_STATUS_DISCONNECTED) {

                }
            } else if (AdbManager.WIRELESS_DEBUG_PAIRING_RESULT_ACTION.equals(action)) {
                Integer res = intent.getIntExtra(
                        AdbManager.WIRELESS_STATUS_EXTRA,
                        AdbManager.WIRELESS_STATUS_FAIL);

                if (res.equals(AdbManager.WIRELESS_STATUS_PAIRING_CODE)) {

                } else if (res.equals(AdbManager.WIRELESS_STATUS_SUCCESS)) {

                } else if (res.equals(AdbManager.WIRELESS_STATUS_FAIL)) {

                } else if (res.equals(AdbManager.WIRELESS_STATUS_CONNECTED)) {

                }
            }
        }
    };

    class PairingCodeDialogListener implements AdbWirelessDialog.AdbWirelessDialogListener {
        @Override
        public void onDismiss() {
            Log.i(TAG, "onDismiss");
            mPairingCodeDialog = null;
            try {
                mAdbManager.disablePairing();
            } catch (RemoteException e) {
                Log.e(TAG, "Unable to cancel pairing");
            }
        }
    }

    @Override
    protected int getPreferenceScreenResId() {
        return R.xml.adb_wireless_settings;
    }

    @Override
    public Dialog onCreateDialog(int dialogId) {
        Dialog d = AdbWirelessDialog.createModal(getActivity(),
                dialogId == AdbWirelessDialogUiBase.MODE_PAIRING
                    ? mPairingCodeDialogListener : null, dialogId);
        if (dialogId == AdbWirelessDialogUiBase.MODE_PAIRING) {
            mPairingCodeDialog = (AdbWirelessDialog) d;
            try {
                mAdbManager.enablePairingByPairingCode();
            } catch (RemoteException e) {
                Log.e(TAG, "Unable to enable pairing");
                mPairingCodeDialog = null;
                d = AdbWirelessDialog.createModal(getActivity(), null,
                        AdbWirelessDialogUiBase.MODE_PAIRING_FAILED);
            }
        }
        if (d != null) {
            return d;
        }
        return super.onCreateDialog(dialogId);
    }

```

**设备名称---AdbDeviceNamePreferenceController.java**

```java

    @Override
    public void displayPreference(PreferenceScreen screen) {
        super.displayPreference(screen);

        // Keep device name in sync with Settings > About phone > Device name
        mDeviceName = Settings.Global.getString(mContext.getContentResolver(),
                Settings.Global.DEVICE_NAME);
        if (mDeviceName == null) {
            mDeviceName = Build.MODEL;
        }
    }

```

**IP地址和端口---AdbIpAddressPreferenceController.java**

```java

    private IAdbManager mAdbManager;

    public AdbIpAddressPreferenceController(Context context, Lifecycle lifecycle) {
        super(context, lifecycle);
        mCM = context.getSystemService(ConnectivityManager.class);
        mAdbManager = IAdbManager.Stub.asInterface(ServiceManager.getService(
                Context.ADB_SERVICE));
    }

    protected int getPort() {
        try {
            return mAdbManager.getAdbWirelessPort();
        } catch (RemoteException e) {
            Log.e(TAG, "Unable to get the adbwifi port");
        }
        return 0;
    }

    public String getIpv4Address() {
        return getDefaultIpAddresses(mCM);
    }

```

**二维码配对---AdbQrCodePreferenceController.java**

```java

    @Override
    public boolean handlePreferenceTreeClick(Preference preference) {
        if (!TextUtils.equals(preference.getKey(), getPreferenceKey())) {
            return false;
        }

        new SubSettingLauncher(preference.getContext())
                .setDestination(AdbQrcodeScannerFragment.class.getName())
                .setSourceMetricsCategory(SettingsEnums.SETTINGS_ADB_WIRELESS)
                .setResultListener(mParentFragment,
                    WirelessDebuggingFragment.PAIRING_DEVICE_REQUEST)
                .launch();
        return true;
    }

```

**配对码配对---AdbWirelessDialog.java**

![usb_debug_3](/images/usb/usb_debug_3.png)

```java

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        mView = getLayoutInflater().inflate(R.layout.adb_wireless_dialog, null);
        setView(mView);
        mController = new AdbWirelessDialogController(this, mView, mMode);
        super.onCreate(savedInstanceState);
    }

```

**已经配对的设备**

![usb_debug_4](/images/usb/usb_debug_4.png)

```java

    private void launchPairedDeviceDetailsFragment(AdbPairedDevicePreference p) {
        // For sending to the device details fragment.
        p.savePairedDeviceToExtras(p.getExtras());
        new SubSettingLauncher(getContext())
                .setTitleRes(R.string.adb_wireless_device_details_title)
                .setDestination(AdbDeviceDetailsFragment.class.getName())
                .setArguments(p.getExtras())
                .setSourceMetricsCategory(getMetricsCategory())
                .setResultListener(this, PAIRED_DEVICE_REQUEST)
                .launch();
    }

```

### 停用adb授权超时功能

**WirelessDebuggingPreferenceController.java**

```java

    private void writeSetting(boolean isEnabled) {
        long authTimeout = 0;
        if (!isEnabled) {
            authTimeout = Settings.Global.DEFAULT_ADB_ALLOWED_CONNECTION_TIME;
        }
        Settings.Global.putLong(mContext.getContentResolver(),
                Settings.Global.ADB_ALLOWED_CONNECTION_TIME,
                authTimeout);
    }

```

## 调试服务

**IAdbManager.aidl**

```java

interface IAdbManager {
    /**
     * Allow ADB debugging from the attached host. If {@code alwaysAllow} is
     * {@code true}, add {@code publicKey} to list of host keys that the
     * user has approved.
     *
     * @param alwaysAllow if true, add permanently to list of allowed keys
     * @param publicKey RSA key in mincrypt format and Base64-encoded
     */
    void allowDebugging(boolean alwaysAllow, String publicKey);

    /**
     * Deny ADB debugging from the attached host.
     */
    void denyDebugging();

    /**
     * Clear all public keys installed for secure ADB debugging.
     */
    void clearDebuggingKeys();

    /**
     * Allow ADB wireless debugging on the connected network. If {@code alwaysAllow}
     * is {@code true}, add {@code bssid} to list of networks that the user has
     * approved.
     *
     * @param alwaysAllow if true, add permanently to list of allowed networks
     * @param bssid BSSID of the network
     */
    void allowWirelessDebugging(boolean alwaysAllow, String bssid);

    /**
     * Deny ADB wireless debugging on the connected network.
     */
    void denyWirelessDebugging();

    /**
     * Returns a Map<String, PairDevice> with the key fingerprint mapped to the device information.
     */
    Map getPairedDevices();

    /**
     * Unpair the device identified by the key fingerprint it uses.
     *
     * @param fingerprint fingerprint of the key the device is using.
     */
    void unpairDevice(String fingerprint);

    /**
     * Enables pairing by pairing code. The result of the enable will be sent via intent action
     * {@link android.debug.AdbManager#WIRELESS_DEBUG_ENABLE_DISCOVER_ACTION}. Furthermore, the
     * pairing code will also be sent in the intent as an extra
     * @{link android.debug.AdbManager#WIRELESS_PAIRING_CODE_EXTRA}. Note that only one
     * pairing method can be enabled at a time, either by pairing code, or by QR code.
     */
    void enablePairingByPairingCode();

    /**
     * Enables pairing by QR code. The result of the enable will be sent via intent action
     * {@link android.debug.AdbManager#WIRELESS_DEBUG_ENABLE_DISCOVER_ACTION}. Note that only one
     * pairing method can be enabled at a time, either by pairing code, or by QR code.
     *
     * @param serviceName The MDNS service name parsed from the QR code.
     * @param password The password parsed from the QR code.
     */
    void enablePairingByQrCode(String serviceName, String password);

    /**
     * Returns the network port that adb wireless server is running on.
     */
    int getAdbWirelessPort();

    /**
     * Disables pairing.
     */
    void disablePairing();

    /**
     * Returns true if device supports secure Adb over Wi-Fi.
     */
    boolean isAdbWifiSupported();

    /**
     * Returns true if device supports secure Adb over Wi-Fi and device pairing by
     * QR code.
     */
    boolean isAdbWifiQrSupported();
}

```

**AdbService**

```java

/**
 * The Android Debug Bridge (ADB) service. This controls the availability of ADB and authorization
 * of devices allowed to connect to ADB.
 */
public class AdbService extends IAdbManager.Stub {
    /**
     * Adb native daemon.
     */
    static final String ADBD = "adbd";

    /**
     * Command to start native service.
     */
    static final String CTL_START = "ctl.start";

    /**
     * Command to start native service.
     */
    static final String CTL_STOP = "ctl.stop";

    /**
     * The persistent property which stores whether adb is enabled or not.
     * May also contain vendor-specific default functions for testing purposes.
     */
    private static final String USB_PERSISTENT_CONFIG_PROPERTY = "persist.sys.usb.config";
    private static final String WIFI_PERSISTENT_CONFIG_PROPERTY = "persist.adb.tls_server.enable";

    private AdbDebuggingManager mDebuggingManager;

    private AdbService(Context context) {
        mContext = context;
        mContentResolver = context.getContentResolver();
        mDebuggingManager = new AdbDebuggingManager(context);

        initAdbState();
        LocalServices.addService(AdbManagerInternal.class, new AdbManagerInternalImpl());
    }

    private void initAdbState() {
        try {
            /*
             * Use the normal bootmode persistent prop to maintain state of adb across
             * all boot modes.
             */
            mIsAdbUsbEnabled = containsFunction(
                    SystemProperties.get(USB_PERSISTENT_CONFIG_PROPERTY, ""),
                    UsbManager.USB_FUNCTION_ADB);
            mIsAdbWifiEnabled = "1".equals(
                    SystemProperties.get(WIFI_PERSISTENT_CONFIG_PROPERTY, "0"));

            // register observer to listen for settings changes
            mObserver = new AdbSettingsObserver();
            mContentResolver.registerContentObserver(
                    Settings.Global.getUriFor(Settings.Global.ADB_ENABLED),
                    false, mObserver);
            mContentResolver.registerContentObserver(
                    Settings.Global.getUriFor(Settings.Global.ADB_WIFI_ENABLED),
                    false, mObserver);
        } catch (Exception e) {
            Slog.e(TAG, "Error in initAdbState", e);
        }
    }

    // 调试开关监听
    private class AdbSettingsObserver extends ContentObserver {
        private final Uri mAdbUsbUri = Settings.Global.getUriFor(Settings.Global.ADB_ENABLED);
        private final Uri mAdbWifiUri = Settings.Global.getUriFor(Settings.Global.ADB_WIFI_ENABLED);

        AdbSettingsObserver() {
            super(null);
        }

        @Override
        public void onChange(boolean selfChange, @NonNull Uri uri, @UserIdInt int userId) {
            if (mAdbUsbUri.equals(uri)) {
                boolean shouldEnable = (Settings.Global.getInt(mContentResolver,
                        Settings.Global.ADB_ENABLED, 0) > 0);
                FgThread.getHandler().sendMessage(obtainMessage(
                        AdbService::setAdbEnabled, AdbService.this, shouldEnable,
                            AdbTransportType.USB));
            } else if (mAdbWifiUri.equals(uri)) {
                boolean shouldEnable = (Settings.Global.getInt(mContentResolver,
                        Settings.Global.ADB_WIFI_ENABLED, 0) > 0);
                FgThread.getHandler().sendMessage(obtainMessage(
                        AdbService::setAdbEnabled, AdbService.this, shouldEnable,
                            AdbTransportType.WIFI));
            }
        }
    }

    // 开启调试
    private void setAdbEnabled(boolean enable, byte transportType) {
        if (DEBUG) {
            Slog.d(TAG, "setAdbEnabled(" + enable + "), mIsAdbUsbEnabled=" + mIsAdbUsbEnabled
                    + ", mIsAdbWifiEnabled=" + mIsAdbWifiEnabled + ", transportType="
                        + transportType);
        }

        if (transportType == AdbTransportType.USB && enable != mIsAdbUsbEnabled) {
            mIsAdbUsbEnabled = enable;
        } else if (transportType == AdbTransportType.WIFI && enable != mIsAdbWifiEnabled) {
            mIsAdbWifiEnabled = enable;
            if (mIsAdbWifiEnabled) {
                if (!AdbProperties.secure().orElse(false) && mDebuggingManager == null) {
                    // Start adbd. If this is secure adb, then we defer enabling adb over WiFi.
                    SystemProperties.set(WIFI_PERSISTENT_CONFIG_PROPERTY, "1");
                    mConnectionPortPoller =
                            new AdbDebuggingManager.AdbConnectionPortPoller(mPortListener);
                    mConnectionPortPoller.start();
                }
            } else {
                // Stop adb over WiFi.
                SystemProperties.set(WIFI_PERSISTENT_CONFIG_PROPERTY, "0");
                if (mConnectionPortPoller != null) {
                    mConnectionPortPoller.cancelAndWait();
                    mConnectionPortPoller = null;
                }
            }
        } else {
            // No change
            return;
        }

        if (enable) {
            startAdbd();
        } else {
            stopAdbd();
        }

        for (IAdbTransport transport : mTransports.values()) {
            try {
                transport.onAdbEnabled(enable, transportType);
            } catch (RemoteException e) {
                Slog.w(TAG, "Unable to send onAdbEnabled to transport " + transport.toString());
            }
        }

        if (mDebuggingManager != null) {
            mDebuggingManager.setAdbEnabled(enable, transportType);
        }
    }

    private void startAdbd() {
        SystemProperties.set(CTL_START, ADBD);
    }

    private void stopAdbd() {
        if (!mIsAdbUsbEnabled && !mIsAdbWifiEnabled) {
            SystemProperties.set(CTL_STOP, ADBD);
        }
    }

    @Override
    public void allowDebugging(boolean alwaysAllow, @NonNull String publicKey) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        Preconditions.checkStringNotEmpty(publicKey);
        if (mDebuggingManager != null) {
            mDebuggingManager.allowDebugging(alwaysAllow, publicKey);
        }
    }

    @Override
    public void denyDebugging() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            mDebuggingManager.denyDebugging();
        }
    }

    @Override
    public void clearDebuggingKeys() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            mDebuggingManager.clearDebuggingKeys();
        } else {
            throw new RuntimeException("Cannot clear ADB debugging keys, "
                    + "AdbDebuggingManager not enabled");
        }
    }

    /**
     * @return true if the device supports secure ADB over Wi-Fi.
     * @hide
     */
    @Override
    public boolean isAdbWifiSupported() {
        mContext.enforceCallingPermission(
                android.Manifest.permission.MANAGE_DEBUGGING, "AdbService");
        return mContext.getPackageManager().hasSystemFeature(PackageManager.FEATURE_WIFI);
    }

    /**
     * @return true if the device supports secure ADB over Wi-Fi and device pairing by
     * QR code.
     * @hide
     */
    @Override
    public boolean isAdbWifiQrSupported() {
        mContext.enforceCallingPermission(
                android.Manifest.permission.MANAGE_DEBUGGING, "AdbService");
        return isAdbWifiSupported() && mContext.getPackageManager().hasSystemFeature(
                PackageManager.FEATURE_CAMERA_ANY);
    }

    @Override
    public void allowWirelessDebugging(boolean alwaysAllow, @NonNull String bssid) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        Preconditions.checkStringNotEmpty(bssid);
        if (mDebuggingManager != null) {
            mDebuggingManager.allowWirelessDebugging(alwaysAllow, bssid);
        }
    }

    @Override
    public void denyWirelessDebugging() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            mDebuggingManager.denyWirelessDebugging();
        }
    }

    @Override
    public Map<String, PairDevice> getPairedDevices() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            return mDebuggingManager.getPairedDevices();
        }
        return null;
    }

    @Override
    public void unpairDevice(@NonNull String fingerprint) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        Preconditions.checkStringNotEmpty(fingerprint);
        if (mDebuggingManager != null) {
            mDebuggingManager.unpairDevice(fingerprint);
        }
    }

    @Override
    public void enablePairingByPairingCode() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            mDebuggingManager.enablePairingByPairingCode();
        }
    }

    @Override
    public void enablePairingByQrCode(@NonNull String serviceName, @NonNull String password) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        Preconditions.checkStringNotEmpty(serviceName);
        Preconditions.checkStringNotEmpty(password);
        if (mDebuggingManager != null) {
            mDebuggingManager.enablePairingByQrCode(serviceName, password);
        }
    }

    @Override
    public void disablePairing() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            mDebuggingManager.disablePairing();
        }
    }

    @Override
    public int getAdbWirelessPort() {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.MANAGE_DEBUGGING, null);
        if (mDebuggingManager != null) {
            return mDebuggingManager.getAdbWirelessPort();
        }
        // If ro.adb.secure=0
        return mConnectionPort.get();
    }

}

```

**AdbDebuggingManager**

```java

public class AdbDebuggingManager {

    public void setAdbEnabled(boolean enabled, byte transportType) {
        if (transportType == AdbTransportType.USB) {
            mHandler.sendEmptyMessage(enabled ? AdbDebuggingHandler.MESSAGE_ADB_ENABLED
                                              : AdbDebuggingHandler.MESSAGE_ADB_DISABLED);
        } else if (transportType == AdbTransportType.WIFI) {
            mHandler.sendEmptyMessage(enabled ? AdbDebuggingHandler.MSG_ADBDWIFI_ENABLE
                                              : AdbDebuggingHandler.MSG_ADBDWIFI_DISABLE);
        } else {
            throw new IllegalArgumentException(
                    "setAdbEnabled called with unimplemented transport type=" + transportType);
        }
    }

    class AdbDebuggingHandler extends Handler {
        static final int MESSAGE_ADB_ENABLED = 1;
        static final int MESSAGE_ADB_DISABLED = 2;
        static final int MESSAGE_ADB_ALLOW = 3;
        static final int MESSAGE_ADB_DENY = 4;
        static final int MESSAGE_ADB_CONFIRM = 5;
        static final int MESSAGE_ADB_CLEAR = 6;
        static final int MESSAGE_ADB_DISCONNECT = 7;
        static final int MESSAGE_ADB_PERSIST_KEYSTORE = 8;
        static final int MESSAGE_ADB_UPDATE_KEYSTORE = 9;
        static final int MESSAGE_ADB_CONNECTED_KEY = 10;

        // === Messages from the UI ==============
        // UI asks adbd to enable adbdwifi
        static final int MSG_ADBDWIFI_ENABLE = 11;
        // UI asks adbd to disable adbdwifi
        static final int MSG_ADBDWIFI_DISABLE = 12;
        // Cancel pairing
        static final int MSG_PAIRING_CANCEL = 14;
        // Enable pairing by pairing code
        static final int MSG_PAIR_PAIRING_CODE = 15;
        // Enable pairing by QR code
        static final int MSG_PAIR_QR_CODE = 16;
        // UI asks to unpair (forget) a device.
        static final int MSG_REQ_UNPAIR = 17;
        // User allows debugging on the current network
        static final int MSG_ADBWIFI_ALLOW = 18;
        // User denies debugging on the current network
        static final int MSG_ADBWIFI_DENY = 19;

        // === Messages from the PairingThread ===========
        // Result of the pairing
        static final int MSG_RESPONSE_PAIRING_RESULT = 20;
        // The port opened for pairing
        static final int MSG_RESPONSE_PAIRING_PORT = 21;

        // === Messages from adbd ================
        // Notifies us a wifi device connected.
        static final int MSG_WIFI_DEVICE_CONNECTED = 22;
        // Notifies us a wifi device disconnected.
        static final int MSG_WIFI_DEVICE_DISCONNECTED = 23;
        // Notifies us the TLS server is connected and listening
        static final int MSG_SERVER_CONNECTED = 24;
        // Notifies us the TLS server is disconnected
        static final int MSG_SERVER_DISCONNECTED = 25;
        // Notification when adbd socket successfully connects.
        static final int MSG_ADBD_SOCKET_CONNECTED = 26;
        // Notification when adbd socket is disconnected.
        static final int MSG_ADBD_SOCKET_DISCONNECTED = 27;

        // === Messages we can send to adbd ===========
        static final String MSG_DISCONNECT_DEVICE = "DD";
        static final String MSG_DISABLE_ADBDWIFI = "DA";

        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MESSAGE_ADB_ENABLED:
                    if (mAdbUsbEnabled) {
                        break;
                    }
                    startAdbDebuggingThread();
                    mAdbUsbEnabled = true;
                    break;
                case MSG_ADBDWIFI_ENABLE: {
                    if (mAdbWifiEnabled) {
                        break;
                    }

                    AdbConnectionInfo currentInfo = getCurrentWifiApInfo();
                    if (currentInfo == null) {
                        Settings.Global.putInt(mContentResolver,
                                Settings.Global.ADB_WIFI_ENABLED, 0);
                        break;
                    }

                    if (!verifyWifiNetwork(currentInfo.getBSSID(),
                            currentInfo.getSSID())) {
                        // This means that the network is not in the list of trusted networks.
                        // We'll give user a prompt on whether to allow wireless debugging on
                        // the current wifi network.
                        Settings.Global.putInt(mContentResolver,
                                Settings.Global.ADB_WIFI_ENABLED, 0);
                        break;
                    }

                    setAdbConnectionInfo(currentInfo);
                    IntentFilter intentFilter =
                            new IntentFilter(WifiManager.WIFI_STATE_CHANGED_ACTION);
                    intentFilter.addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION);
                    mContext.registerReceiver(mBroadcastReceiver, intentFilter);

                    SystemProperties.set(WIFI_PERSISTENT_CONFIG_PROPERTY, "1");
                    mConnectionPortPoller =
                            new AdbDebuggingManager.AdbConnectionPortPoller(mPortListener);
                    mConnectionPortPoller.start();

                    startAdbDebuggingThread();
                    mAdbWifiEnabled = true;

                    if (DEBUG) Slog.i(TAG, "adb start wireless adb");
                    break;
                    }
                }
        }

        private void startAdbDebuggingThread() {
            ++mAdbEnabledRefCount;
            if (DEBUG) Slog.i(TAG, "startAdbDebuggingThread ref=" + mAdbEnabledRefCount);
            if (mAdbEnabledRefCount > 1) {
                return;
            }

            registerForAuthTimeChanges();
            mThread = new AdbDebuggingThread();
            mThread.start();

            mAdbKeyStore.updateKeyStore();
            scheduleJobToUpdateAdbKeyStore();
        }

    }

    // 与adbd进程进行通讯
    class AdbDebuggingThread extends Thread {

        @Override
        public void run() {
            if (DEBUG) Slog.d(TAG, "Entering thread");
            while (true) {
                synchronized (this) {
                    if (mStopped) {
                        if (DEBUG) Slog.d(TAG, "Exiting thread");
                        return;
                    }
                    try {
                        openSocketLocked();
                    } catch (Exception e) {
                        /* Don't loop too fast if adbd dies, before init restarts it */
                        SystemClock.sleep(1000);
                    }
                }
                try {
                    listenToSocket();
                } catch (Exception e) {
                    /* Don't loop too fast if adbd dies, before init restarts it */
                    SystemClock.sleep(1000);
                }
            }
        }

        private void openSocketLocked() throws IOException {
            try {
                LocalSocketAddress address = new LocalSocketAddress(ADBD_SOCKET,
                        LocalSocketAddress.Namespace.RESERVED);
                mInputStream = null;

                if (DEBUG) Slog.d(TAG, "Creating socket");
                mSocket = new LocalSocket(LocalSocket.SOCKET_SEQPACKET);
                mSocket.connect(address);

                mOutputStream = mSocket.getOutputStream();
                mInputStream = mSocket.getInputStream();
                mHandler.sendEmptyMessage(AdbDebuggingHandler.MSG_ADBD_SOCKET_CONNECTED);
            } catch (IOException ioe) {
                Slog.e(TAG, "Caught an exception opening the socket: " + ioe);
                closeSocketLocked();
                throw ioe;
            }
        }
    }

}

```

## dumpsys adb

```txt

$ adb devices
List of devices attached
1faa4c6c	device
10.10.162.71:42491	device

$ dumpsys adb
ADB MANAGER STATE (dumpsys adb):
{
  debugging_manager={
    connected_to_adb=true
    user_keys=QAAAAIFpKkR/KRDM04Q8mvugciY4O9rfbvRzmNXpidTdGFoREvrdb83KQWhUQPLlH4oZ5C8co/RDGEM/uiHqpHdMSA7j042Hl6x/yboggvhHBLiSFEhT1iiQDbWhPB2BSDwellhGs8eOpD99mTv9vgemBmXXvDLAnOeoAP4rvX939XCETilHy3Zzzf/bpLEfq4BZkio4+bHzzN7qxOxliwLlxFGXPOr/XnUvSq6DpAaX9LG8il4I5ipFxKH0myprcWuw+lu1cnswbSgDzcvKSWW2bzia8Vc5mEwmL7B/04WNRtx50QuvtmDWFmrya/NQ9JqzmdjLw2Op2t8N6WA/aXUA5duwzf3KDclaoTSXOBzr89J0Z1ne1+DG4drJx4Yh1moQ00Ibfru4K3OY29OjFJkOdyK5CK0WdVmD9MDIOIr9CVp0Unu1WIshcmECthVfmXSq8PdYWuG1338LA00fiDE2ahfoLVdxu4UH4XujJ8Nrw8Z5fyobQx/fqzGFoayvZfWdQIrhjz3Bv2XPNexh25Rk5B4FbpRJ4c0QUFoH8QwzP9ZW90fGXLjJ/Ew/p3lupjp2rhYBJTLhXLwYmaMtDO4zz3cXU/ZIn+TIBJDmr45um/1/4A+cwlhdnCtV3sKFVx3Zj1bZnYu6LvZkTHO7pm1TkZoRxRIiJJixUyyDWo0CNxa/fTQaMAEAAQA= lxg@lxg

    keystore=<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
    <keyStore version="1">
    <adbKey key="QAAAAIFpKkR/KRDM04Q8mvugciY4O9rfbvRzmNXpidTdGFoREvrdb83KQWhUQPLlH4oZ5C8co/RDGEM/uiHqpHdMSA7j042Hl6x/yboggvhHBLiSFEhT1iiQDbWhPB2BSDwellhGs8eOpD99mTv9vgemBmXXvDLAnOeoAP4rvX939XCETilHy3Zzzf/bpLEfq4BZkio4+bHzzN7qxOxliwLlxFGXPOr/XnUvSq6DpAaX9LG8il4I5ipFxKH0myprcWuw+lu1cnswbSgDzcvKSWW2bzia8Vc5mEwmL7B/04WNRtx50QuvtmDWFmrya/NQ9JqzmdjLw2Op2t8N6WA/aXUA5duwzf3KDclaoTSXOBzr89J0Z1ne1+DG4drJx4Yh1moQ00Ibfru4K3OY29OjFJkOdyK5CK0WdVmD9MDIOIr9CVp0Unu1WIshcmECthVfmXSq8PdYWuG1338LA00fiDE2ahfoLVdxu4UH4XujJ8Nrw8Z5fyobQx/fqzGFoayvZfWdQIrhjz3Bv2XPNexh25Rk5B4FbpRJ4c0QUFoH8QwzP9ZW90fGXLjJ/Ew/p3lupjp2rhYBJTLhXLwYmaMtDO4zz3cXU/ZIn+TIBJDmr45um/1/4A+cwlhdnCtV3sKFVx3Zj1bZnYu6LvZkTHO7pm1TkZoRxRIiJJixUyyDWo0CNxa/fTQaMAEAAQA= lxg@lxg" lastConnection="1605679423157" />
    <wifiAP bssid="f8:e7:1e:0d:70:fc" />
    </keyStore>

  }
}

```


