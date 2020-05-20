---
layout:     post
title:      Android DevicePolicyManager
subtitle:   DevicePolicyManagerService
date:       2020-05-20
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - android
---

[DevicePolicyManager-Google](https://developer.android.google.cn/reference/android/app/admin/DevicePolicyManager?hl=zh-cn)

## DeviceOwner

DeviceOwner, 设备所有者，Android5.0引入。同样的，DeviceOwner涵盖了所有DeviceAdmin用户的管理能力，是一类特殊的设备管理员，具有在设备上创建和移除辅助用户以及配置全局设置的额外能力。
DeviceOwner完善了行业用户的MDM(Mobile Device Manager)行业管理能力，主要能力如下：

1. 设置网络时间同步, 设置后无法从Settings取消
2. 用户管理, 创建用户、删除用户等
3. 管理账号系统
4. 清除锁屏
5. 设置Http代理
6. 禁止状态栏
7. 通知等待更新
8. 禁用相机
9. 隐藏应用
10. 禁止卸载应用
11. 复用系统APP
12. 获取wifi地址
13. 重启系统

### device_admin.xml

```xml

<?xml version="1.0" encoding="utf-8"?>
<device-admin>
    <uses-policies>
        <!-- 限制密码类型 -->
        <limit-password />
        <!-- 监控登录尝试 -->
        <watch-login />
        <!-- 重置密码 -->
        <reset-password />
        <!--锁屏 -->
        <force-lock />
        <!-- 恢复出厂设置 -->
        <wipe-data />
        <!--禁用相机-->
        <disable-camera />
        <disable-keyguard-features />
        <set-global-proxy />
        <!-- 设置锁屏密码的有效期 -->
        <expire-password />
    </uses-policies>
</device-admin>

```

### AndroidManifest.xml

```xml

        <receiver
            android:name=".DPMTestReceiver"
            android:description="@string/app_name"
            android:label="@string/app_name"
            android:permission="android.permission.BIND_DEVICE_ADMIN">
            <meta-data
                android:name="android.app.device_admin"
                android:resource="@xml/device_admin" />
            <intent-filter>
                <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
            </intent-filter>
        </receiver>

```

### DPMTestReceiver

```java

public class DPMTestReceiver extends DeviceAdminReceiver {
    private static final String TAG = "DPMTestReceiver";

    @Override
    public void onEnabled(Context context, Intent intent) {
        Log.d(TAG, "onEnabled: " + intent);
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        Log.d(TAG, "onDisabled: " + intent);
    }
}

```

### MainActivity

```java

public class MainActivity extends Activity {

    private static final String TAG = "LXG";

    private DevicePolicyManager mDPM;
    private ComponentName mCN;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mDPM = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
        mCN = new ComponentName(this, DPMTestReceiver.class);

        mLockedTaskPackages.add("com.android.settings");
    }


    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.active_device_owner:
                enableDeviceManager();
                break;
            case R.id.remove_device_owner:
                disableDeviceManager();
                break;
            default:
        }
    }

    /**
     * 激活设备管理器
     */
    public void enableDeviceManager() {
        if (!mDPM.isAdminActive(mCN)) {
            Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);

            intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, mCN);
            intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "请求激活");
            startActivity(intent);
        } else {
            Toast.makeText(this, "设备已经激活,请勿重复激活", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * 取消激活设备管理器
     */
    public void disableDeviceManager() {
        mDPM.removeActiveAdmin(mCN);
    }

    public void wipeData(int flags) {
        if (mDPM != null) {
            try {
                mDPM.wipeData(flags);
            } catch (SecurityException | IllegalArgumentException e) {
                e.printStackTrace();
            }
        }
    }

}

```


