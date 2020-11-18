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

# adb connect ipaddr:port

failed to connect to '10.10.162.71:40473': Connection refused

```

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





