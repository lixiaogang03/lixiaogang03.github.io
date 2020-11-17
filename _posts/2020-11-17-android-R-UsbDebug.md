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

## 效果图

![usb_debug_1](/images/usb/usb_debug_1.png)

![usb_debug_3](/images/usb/usb_debug_3.png)

![usb_debug_4](/images/usb/usb_debug_4.png)


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

    @Override
    protected int getPreferenceScreenResId() {
        return R.xml.adb_wireless_settings;
    }

```

**AdbDeviceNamePreferenceController.java**

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

**AdbIpAddressPreferenceController.java**

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






