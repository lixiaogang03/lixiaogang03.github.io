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

[Employing Managed Profiles-AOSP](https://source.android.google.cn/devices/tech/admin/managed-profiles?hl=en)

[面向企业应用的 Android 新功能](https://developer.android.google.cn/work/versions?hl=zh-cn)

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

![device_owner_settings](/images/device_owner_settings.png)

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

## Profile Owner

ProfileOwner 译为配置文件所有者，在Android5.0系统推出。ProfileOwner涵盖了所有DeviceAdmin用户的管理能力。Google为了细化行业领域的管理而推出了这一组API，也被称为Android for work,旨在让用户在体验上可以轻松的兼顾生活和工作，可以将你的个人信息和工作信息等进行分类，随时查看

具体功能如下

1. 隐藏应用，可停用制定应用并且不再界面显示，除非调用相应API恢复可用，否则该应用永远无法运行。可以用来开发应用黑白名单功能。
2. 禁止卸载应用，被设置为禁止卸载的应用将成为受保护应用，无法被用户卸载，除非取消保护。
3. 复用系统APP
4. 修改系统设置
5. 调节静音
6. 修改用户图标
7. 修改权限申请的策略
8. 限制指定应用的某些功能
9. 允许辅助服务
10. 允许输入法服务
11. 禁止截图
12. 禁止蓝牙访问联系人

### MainActivity

```java

    public void setProfileOwner() {
        if (mDPM != null) {
            try {
                if (mDPM.isAdminActive(mAdminCN)) {
                    if (mDPM.isProfileOwnerApp(getPackageName())) {
                        Toast.makeText(this, "配置管理已经激活", Toast.LENGTH_SHORT).show();
                    } else {
                        mDPM.setProfileOwner(mAdminCN, DEVICE_POLICY_TEST, UserHandle.myUserId());
                    }
                } else {
                    Toast.makeText(this, "请先激活设备管理器", Toast.LENGTH_SHORT).show();
                }
            } catch (SecurityException | IllegalArgumentException e) {
                e.printStackTrace();
            }
        }
    }

    public void clearProfileOwner() {
        if (mDPM != null) {
            try {
                if (mDPM.isProfileOwnerApp(getPackageName())) {
                    mDPM.clearProfileOwner(mAdminCN);
                } else {
                    Toast.makeText(this, "配置管理已经清除", Toast.LENGTH_SHORT).show();
                }
            } catch (SecurityException | IllegalArgumentException e) {
                e.printStackTrace();
            }
        }
    }

```

## DevicePolicyManager

```java

@SystemService(Context.DEVICE_POLICY_SERVICE)
@RequiresFeature(PackageManager.FEATURE_DEVICE_ADMIN)
public class DevicePolicyManager {

    /**
     * Return a list of all currently active device administrators' component
     * names.  If there are no administrators {@code null} may be
     * returned.
     */
    public @Nullable List<ComponentName> getActiveAdmins() {
        throwIfParentInstance("getActiveAdmins");
        return getActiveAdminsAsUser(myUserId());
    }

    /**
     * Returns the device owner package name, only if it's running on the calling user.
     *
     * <p>Bundled components should use {@code getDeviceOwnerComponentOnCallingUser()} for clarity.
     *
     * @hide
     */
    @SystemApi
    @RequiresPermission(android.Manifest.permission.MANAGE_USERS)
    public @Nullable String getDeviceOwner() {
        throwIfParentInstance("getDeviceOwner");
        final ComponentName name = getDeviceOwnerComponentOnCallingUser();
        return name != null ? name.getPackageName() : null;
    }

    @SystemApi
    @RequiresPermission(android.Manifest.permission.MANAGE_USERS)
    public boolean isManagedKiosk() {
        throwIfParentInstance("isManagedKiosk");
        if (mService != null) {
            try {
                return mService.isManagedKiosk();
            } catch (RemoteException e) {
                throw e.rethrowFromSystemServer();
            }
        }
        return false;
    }

    /**
     * @hide
     */
    @UnsupportedAppUsage
    public void setActiveAdmin(@NonNull ComponentName policyReceiver, boolean refreshing) {
        setActiveAdmin(policyReceiver, refreshing, myUserId());
    }

    /**
     * @hide
     * Sets the given package as the device owner.
     * Same as {@link #setDeviceOwner(ComponentName, String)} but without setting a device owner name.
     * @param who the component name to be registered as device owner.
     * @return whether the package was successfully registered as the device owner.
     * @throws IllegalArgumentException if the package name is null or invalid
     * @throws IllegalStateException If the preconditions mentioned are not met.
     */
    public boolean setDeviceOwner(ComponentName who) {
        return setDeviceOwner(who, null);
    }

    public boolean setProfileOwner(@NonNull ComponentName admin, @Deprecated String ownerName,
            int userHandle) throws IllegalArgumentException {
        if (mService != null) {
            try {
                if (ownerName == null) {
                    ownerName = "";
                }
                return mService.setProfileOwner(admin, ownerName, userHandle);
            } catch (RemoteException re) {
                throw re.rethrowFromSystemServer();
            }
        }
        return false;
    }


}

```

## data/system/device_policies.xml

```xml

<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<policies setup-complete="true" provisioning-state="3">
    <admin name="com.example.android.deviceowner/com.example.android.deviceowner.DeviceOwnerReceiver">
        <policies flags="479" />
        <strong-auth-unlock-timeout value="0" />
        <cross-profile-calendar-packages />
        <cross-profile-packages />
    </admin>
    <lock-task-features value="16" />
</policies>

```

## data/system/device_owner_2.xml

```xml

<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<root>
    <device-owner package="com.example.android.deviceowner"
        name=""
        component="com.example.android.deviceowner/com.example.android.deviceowner.DeviceOwnerReceiver"
        userRestrictionsMigrated="true"
        isPoOrganizationOwnedDevice="true" />
    <device-owner-context userId="0" />
</root>

```

## DevicePolicyManagerService

```java

public class DevicePolicyManagerService extends BaseIDevicePolicyManager {

    /**
     * Instantiates the service.
     */
    public DevicePolicyManagerService(Context context) {
        this(new Injector(context));
    }

    @VisibleForTesting
    DevicePolicyManagerService(Injector injector) {
        mInjector = injector;
        mContext = Objects.requireNonNull(injector.mContext);
        mHandler = new Handler(Objects.requireNonNull(injector.getMyLooper()));

        mConstantsObserver = new DevicePolicyConstantsObserver(mHandler);
        mConstantsObserver.register();
        mConstants = loadConstants();

        mOwners = Objects.requireNonNull(injector.newOwners());

        mUserManager = Objects.requireNonNull(injector.getUserManager());
        mUserManagerInternal = Objects.requireNonNull(injector.getUserManagerInternal());
        mUsageStatsManagerInternal = Objects.requireNonNull(
                injector.getUsageStatsManagerInternal());
        mIPackageManager = Objects.requireNonNull(injector.getIPackageManager());
        mIPlatformCompat = Objects.requireNonNull(injector.getIPlatformCompat());
        mIPermissionManager = Objects.requireNonNull(injector.getIPermissionManager());
        mTelephonyManager = Objects.requireNonNull(injector.getTelephonyManager());

        mLocalService = new LocalService();
        mLockPatternUtils = injector.newLockPatternUtils();
        mLockSettingsInternal = injector.getLockSettingsInternal();
        // TODO: why does SecurityLogMonitor need to be created even when mHasFeature == false?
        mSecurityLogMonitor = new SecurityLogMonitor(this);

        mHasFeature = mInjector.hasFeature();
        mIsWatch = mInjector.getPackageManager()
                .hasSystemFeature(PackageManager.FEATURE_WATCH);
        mHasTelephonyFeature = mInjector.getPackageManager()
                .hasSystemFeature(PackageManager.FEATURE_TELEPHONY);
        mBackgroundHandler = BackgroundThread.getHandler();

        // Needed when mHasFeature == false, because it controls the certificate warning text.
        mCertificateMonitor = new CertificateMonitor(this, mInjector, mBackgroundHandler);

        mDeviceAdminServiceController = new DeviceAdminServiceController(this, mConstants);

        mOverlayPackagesProvider = new OverlayPackagesProvider(mContext);

        mTransferOwnershipMetadataManager = mInjector.newTransferOwnershipMetadataManager();

        if (!mHasFeature) {
            // Skip the rest of the initialization
            mSetupContentObserver = null;
            return;
        }

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_BOOT_COMPLETED);
        filter.addAction(ACTION_EXPIRED_PASSWORD_NOTIFICATION);
        filter.addAction(ACTION_TURN_PROFILE_ON_NOTIFICATION);
        filter.addAction(ACTION_PROFILE_OFF_DEADLINE);
        filter.addAction(Intent.ACTION_USER_ADDED);
        filter.addAction(Intent.ACTION_USER_REMOVED);
        filter.addAction(Intent.ACTION_USER_STARTED);
        filter.addAction(Intent.ACTION_USER_STOPPED);
        filter.addAction(Intent.ACTION_USER_SWITCHED);
        filter.addAction(Intent.ACTION_USER_UNLOCKED);
        filter.addAction(Intent.ACTION_MANAGED_PROFILE_UNAVAILABLE);
        filter.setPriority(IntentFilter.SYSTEM_HIGH_PRIORITY);
        mContext.registerReceiverAsUser(mReceiver, UserHandle.ALL, filter, null, mHandler);
        filter = new IntentFilter();
        filter.addAction(Intent.ACTION_PACKAGE_CHANGED);
        filter.addAction(Intent.ACTION_PACKAGE_REMOVED);
        filter.addAction(Intent.ACTION_EXTERNAL_APPLICATIONS_UNAVAILABLE);
        filter.addAction(Intent.ACTION_PACKAGE_ADDED);
        filter.addDataScheme("package");
        mContext.registerReceiverAsUser(mReceiver, UserHandle.ALL, filter, null, mHandler);
        filter = new IntentFilter();
        filter.addAction(Intent.ACTION_MANAGED_PROFILE_ADDED);
        filter.addAction(Intent.ACTION_TIME_CHANGED);
        filter.addAction(Intent.ACTION_DATE_CHANGED);
        mContext.registerReceiverAsUser(mReceiver, UserHandle.ALL, filter, null, mHandler);

        LocalServices.addService(DevicePolicyManagerInternal.class, mLocalService);

        mSetupContentObserver = new SetupContentObserver(mHandler);

        mUserManagerInternal.addUserRestrictionsListener(new RestrictionsListener(mContext));

        loadOwners();
    }

}

```

## dumpsys device_policy

```txt

qssi:/ $ dumpsys device_policy
Current Device Policy Manager state:
  Device Owner: 
    admin=ComponentInfo{com.example.android.deviceowner/com.example.android.deviceowner.DeviceOwnerReceiver}
    name=
    package=com.example.android.deviceowner
    isOrganizationOwnedDevice=true
    User ID: 0
  
  
  
  Enabled Device Admins (User 0, provisioningState: 3):
    com.example.android.deviceowner/.DeviceOwnerReceiver:
      uid=10163
      testOnlyAdmin=false
      policies:
        wipe-data
        reset-password
        limit-password
        watch-login
        force-lock
        expire-password
        encrypted-storage
        disable-camera
      passwordQuality=0x0
      minimumPasswordLength=0
      passwordHistoryLength=0
      minimumPasswordUpperCase=0
      minimumPasswordLowerCase=0
      minimumPasswordLetters=1
      minimumPasswordNumeric=1
      minimumPasswordSymbols=1
      minimumPasswordNonLetter=0
      maximumTimeToUnlock=0
      strongAuthUnlockTimeout=0
      maximumFailedPasswordsForWipe=0
      specifiesGlobalProxy=false
      passwordExpirationTimeout=0
      passwordExpirationDate=0
      encryptionRequested=false
      disableCamera=false
      disableCallerId=false
      disableContactsSearch=false
      disableBluetoothContactSharing=true
      disableScreenCapture=false
      requireAutoTime=false
      forceEphemeralUsers=false
      isNetworkLoggingEnabled=false
      disabledKeyguardFeatures=0
      crossProfileWidgetProviders=null
      organizationColor=-16746133
      userRestrictions:
        none
      defaultEnabledRestrictionsAlreadySet={}
      isParent=false
      mCrossProfileCalendarPackages=[]
      mCrossProfilePackages=[]
      mSuspendPersonalApps=false
      mProfileMaximumTimeOffMillis=0
      mProfileOffDeadline=0
      mAlwaysOnVpnPackage=null
      mAlwaysOnVpnLockdown=false
      mCommonCriteriaMode=false
  
    mPasswordOwner=-1
    mUserControlDisabledPackages=[]
    mAppsSuspended=false
  
  Constants:
    DAS_DIED_SERVICE_RECONNECT_BACKOFF_SEC: 3600
    DAS_DIED_SERVICE_RECONNECT_BACKOFF_INCREASE: 2.0
    DAS_DIED_SERVICE_RECONNECT_MAX_BACKOFF_SEC: 86400
    DAS_DIED_SERVICE_STABLE_CONNECTION_THRESHOLD_SEC: 120
  
  Stats:
    LockGuard.guard(): count=846, total=5.6ms, avg=0.007ms, max calls/s=96 max dur/s=0.5ms max time=0.1ms
  
  Encryption Status: per-user
  
  Device policy cache:
    Screen capture disabled: {0=false}
    Password quality: {0=0}
  
  Device state cache:
    Device provisioned: true

```

## dpm

adb shell dpm set-device-owner com.sscience.deviceowner/.MyDeviceAdminReceiver

```txt

qssi:/ $ dpm
usage: dpm [subcommand] [options]
usage: dpm set-active-admin [ --user <USER_ID> | current ] <COMPONENT>
usage: dpm set-device-owner [ --user <USER_ID> | current *EXPERIMENTAL* ] [ --name <NAME> ] <COMPONENT>
usage: dpm set-profile-owner [ --user <USER_ID> | current ] [ --name <NAME> ] <COMPONENT>
usage: dpm remove-active-admin [ --user <USER_ID> | current ] [ --name <NAME> ] <COMPONENT>

dpm set-active-admin: Sets the given component as active admin for an existing user.

dpm set-device-owner: Sets the given component as active admin, and its package as device owner.

dpm set-profile-owner: Sets the given component as active admin and profile owner for an existing user.

dpm remove-active-admin: Disables an active admin, the admin must have declared android:testOnly in the application in its manifest. This will also remove device and profile owners.

dpm clear-freeze-period-record: clears framework-maintained record of past freeze periods that the device went through. For use during feature development to prevent triggering restriction on setting freeze periods.

dpm force-network-logs: makes all network logs available to the DPC and triggers DeviceAdminReceiver.onNetworkLogsAvailable() if needed.

dpm force-security-logs: makes all security logs available to the DPC and triggers DeviceAdminReceiver.onSecurityLogsAvailable() if needed.
usage: dpm mark-profile-owner-on-organization-owned-device: [ --user <USER_ID> | current ] <COMPONENT>

```



