---
layout:     post
title:      Android DevicePolicyManager
subtitle:   DevicePolicyManagerService
date:       2020-05-20
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - Android
---

[DevicePolicyManager-Google](https://developer.android.google.cn/reference/android/app/admin/DevicePolicyManager?hl=zh-cn)

[Employing Managed Profiles-AOSP](https://source.android.google.cn/devices/tech/admin/managed-profiles?hl=en)

[面向企业应用的 Android 新功能](https://developer.android.google.cn/work/versions?hl=zh-cn)

[enterprise-samples-google](https://github.com/android/enterprise-samples)

## DeviceOwner

[DeviceOwner VS DeviceAdmin](https://github.com/codeteenager/DeviceManager)

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

![device_owner_settings](/images/android/device_owner_settings.png)

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

## IDevicePolicyManager

```java

interface IDevicePolicyManager {

    // 设置密码质量
    void setPasswordQuality(in ComponentName who, int quality, boolean parent);

    // 设置密码长度
    void setPasswordMinimumLength(in ComponentName who, int length, boolean parent);

    // 设置密码大小写，字母，数字，符号
    void setPasswordMinimumUpperCase(in ComponentName who, int length, boolean parent);
    void setPasswordMinimumLowerCase(in ComponentName who, int length, boolean parent);
    void setPasswordMinimumLetters(in ComponentName who, int length, boolean parent);
    void setPasswordMinimumNumeric(in ComponentName who, int length, boolean parent);
    void setPasswordMinimumSymbols(in ComponentName who, int length, boolean parent);
    void setPasswordMinimumNonLetter(in ComponentName who, int length, boolean parent);

    PasswordMetrics getPasswordMinimumMetrics(int userHandle);

    void setPasswordHistoryLength(in ComponentName who, int length, boolean parent);
    void setPasswordExpirationTimeout(in ComponentName who, long expiration, boolean parent);
    long getPasswordExpiration(in ComponentName who, int userHandle, boolean parent);

    boolean isActivePasswordSufficient(int userHandle, boolean parent);
    boolean isProfileActivePasswordSufficientForParent(int userHandle);
    boolean isPasswordSufficientAfterProfileUnification(int userHandle, int profileUser);
    int getPasswordComplexity(boolean parent);
    boolean isUsingUnifiedPassword(in ComponentName admin);
    int getCurrentFailedPasswordAttempts(int userHandle, boolean parent);
    int getProfileWithMinimumFailedPasswordsForWipe(int userHandle, boolean parent);

    void setMaximumFailedPasswordsForWipe(in ComponentName admin, int num, boolean parent);

    // 重置密码
    boolean resetPassword(String password, int flags);

    // 设置设备可以使用的时间
    void setMaximumTimeToLock(in ComponentName who, long timeMs, boolean parent);
    long getMaximumTimeToLock(in ComponentName who, int userHandle, boolean parent);

    // 设置超时时间，超时后需要身份验证才能继续使用
    void setRequiredStrongAuthTimeout(in ComponentName who, long timeMs, boolean parent);
    long getRequiredStrongAuthTimeout(in ComponentName who, int userId, boolean parent);

    // 立即锁定
    void lockNow(int flags, boolean parent);

    // 清除数据
    void wipeDataWithReason(int flags, String wipeReasonForUser, boolean parent);

    // 设置恢复出厂设置的保护策略
    void setFactoryResetProtectionPolicy(in ComponentName who, in FactoryResetProtectionPolicy policy);
    FactoryResetProtectionPolicy getFactoryResetProtectionPolicy(in ComponentName who);
    boolean isFactoryResetProtectionPolicySupported();

    // 设置全局代理
    ComponentName setGlobalProxy(in ComponentName admin, String proxySpec, String exclusionList);
    ComponentName getGlobalProxyAdmin(int userHandle);
    void setRecommendedGlobalProxy(in ComponentName admin, in ProxyInfo proxyInfo);

    // 设置存储加密
    int setStorageEncryption(in ComponentName who, boolean encrypt);
    boolean getStorageEncryption(in ComponentName who, int userHandle);
    int getStorageEncryptionStatus(in String callerPackage, int userHandle);

    // 请求bugreport
    boolean requestBugreport(in ComponentName who);

    // 禁止使用摄像头
    void setCameraDisabled(in ComponentName who, boolean disabled, boolean parent);
    boolean getCameraDisabled(in ComponentName who, int userHandle, boolean parent);

    // 禁止使用屏幕截图
    void setScreenCaptureDisabled(in ComponentName who, boolean disabled, boolean parent);
    boolean getScreenCaptureDisabled(in ComponentName who, int userHandle, boolean parent);

    // 禁止在锁屏上显示指定内容
    void setKeyguardDisabledFeatures(in ComponentName who, int which, boolean parent);
    int getKeyguardDisabledFeatures(in ComponentName who, int userHandle, boolean parent);

    // 激活设备管理器
    void setActiveAdmin(in ComponentName policyReceiver, boolean refreshing, int userHandle);
    boolean isAdminActive(in ComponentName policyReceiver, int userHandle);
    List<ComponentName> getActiveAdmins(int userHandle);

    @UnsupportedAppUsage
    // 应用是否可以被卸载
    boolean packageHasActiveAdmins(String packageName, int userHandle);

    void getRemoveWarning(in ComponentName policyReceiver, in RemoteCallback result, int userHandle);

    // 移除激活的设备管理器
    void removeActiveAdmin(in ComponentName policyReceiver, int userHandle);
    void forceRemoveActiveAdmin(in ComponentName policyReceiver, int userHandle);

    // 检查是否已向管理员授予策略
    boolean hasGrantedPolicy(in ComponentName policyReceiver, int usesPolicy, int userHandle);

    // 报告密码变更
    void reportPasswordChanged(int userId);
    // 报告错误的密码尝试
    void reportFailedPasswordAttempt(int userHandle);
    // 报告成功的密码尝试
    void reportSuccessfulPasswordAttempt(int userHandle);
    // 报告失败的生物密码尝试
    void reportFailedBiometricAttempt(int userHandle);
    void reportSuccessfulBiometricAttempt(int userHandle);

    // 报告锁屏解锁
    void reportKeyguardDismissed(int userHandle);
    // 报告锁屏锁定
    void reportKeyguardSecured(int userHandle);

    // 设置设备拥有者
    boolean setDeviceOwner(in ComponentName who, String ownerName, int userId);
    ComponentName getDeviceOwnerComponent(boolean callingUserOnly);
    boolean hasDeviceOwner();
    String getDeviceOwnerName();
    // 清除设备owner
    void clearDeviceOwner(String packageName);
    int getDeviceOwnerUserId();

    // 设置配置信息拥有者
    boolean setProfileOwner(in ComponentName who, String ownerName, int userHandle);
    ComponentName getProfileOwnerAsUser(int userHandle);
    ComponentName getProfileOwner(int userHandle);
    ComponentName getProfileOwnerOrDeviceOwnerSupervisionComponent(in UserHandle userHandle);
    String getProfileOwnerName(int userHandle);

    // 启用配置
    void setProfileEnabled(in ComponentName who);
    void setProfileName(in ComponentName who, String profileName);
    void clearProfileOwner(in ComponentName who);

    // 是否开机向导已经完成
    boolean hasUserSetupCompleted();

    // 设备是否已经配置为具有托管配置文件的组织专用设备
    boolean isOrganizationOwnedDeviceWithManagedProfile();

    // 是否有读取设备标识符的权限
    boolean checkDeviceIdentifierAccess(in String packageName, int pid, int uid);

    // 设置在锁屏上显示的设备所有者信息
    void setDeviceOwnerLockScreenInfo(in ComponentName who, CharSequence deviceOwnerInfo);
    CharSequence getDeviceOwnerLockScreenInfo();

    // 禁用某个软件包
    String[] setPackagesSuspended(in ComponentName admin, in String callerPackage, in String[] packageNames, boolean suspended);
    boolean isPackageSuspended(in ComponentName admin, in String callerPackage, String packageName);

    // 安装CA证书
    boolean installCaCert(in ComponentName admin, String callerPackage, in byte[] certBuffer);
    void uninstallCaCerts(in ComponentName admin, String callerPackage, in String[] aliases);
    void enforceCanManageCaCerts(in ComponentName admin, in String callerPackage);
    boolean approveCaCert(in String alias, int userHandle, boolean approval);
    boolean isCaCertApproved(in String alias, int userHandle);

    
    boolean installKeyPair(in ComponentName who, in String callerPackage, in byte[] privKeyBuffer,
            in byte[] certBuffer, in byte[] certChainBuffer, String alias, boolean requestAccess,
            boolean isUserSelectable);
    boolean removeKeyPair(in ComponentName who, in String callerPackage, String alias);
    boolean generateKeyPair(in ComponentName who, in String callerPackage, in String algorithm,
            in ParcelableKeyGenParameterSpec keySpec,
            in int idAttestationFlags, out KeymasterCertificateChain attestationChain);
    boolean setKeyPairCertificate(in ComponentName who, in String callerPackage, in String alias,
            in byte[] certBuffer, in byte[] certChainBuffer, boolean isUserSelectable);
    void choosePrivateKeyAlias(int uid, in Uri uri, in String alias, IBinder aliasCallback);

    // 向其他应用授予特权API的访问权限
    void setDelegatedScopes(in ComponentName who, in String delegatePackage, in List<String> scopes);

    // 获取向某个应用授权的访问权限列表
    List<String> getDelegatedScopes(in ComponentName who, String delegatePackage);

    // 获取已经授予某个权限的应用列表
    List<String> getDelegatePackages(in ComponentName who, String scope);

    // 将需要签名权限授予三方应用
    void setCertInstallerPackage(in ComponentName who, String installerPackage);
    String getCertInstallerPackage(in ComponentName who);

    // 指定一组在VPN时能够直接访问网络的应用程序
    boolean setAlwaysOnVpnPackage(in ComponentName who, String vpnPackage, boolean lockdown, in List<String> lockdownWhitelist);
    String getAlwaysOnVpnPackage(in ComponentName who);
    String getAlwaysOnVpnPackageForUser(int userHandle);
    boolean isAlwaysOnVpnLockdownEnabled(in ComponentName who);
    boolean isAlwaysOnVpnLockdownEnabledForUser(int userHandle);
    List<String> getAlwaysOnVpnLockdownWhitelist(in ComponentName who);

    // 设置默认首选项（默认桌面，电话，短信等）    
    void addPersistentPreferredActivity(in ComponentName admin, in IntentFilter filter, in ComponentName activity);
    void clearPackagePersistentPreferredActivities(in ComponentName admin, String packageName);

    // 设置默认短信
    void setDefaultSmsApplication(in ComponentName admin, String packageName, boolean parent);

    // 给应用程序设置权限
    void setApplicationRestrictions(in ComponentName who, in String callerPackage, in String packageName, in Bundle settings);
    Bundle getApplicationRestrictions(in ComponentName who, in String callerPackage, in String packageName);
    
    // 给应用授予管理软件包的权限
    boolean setApplicationRestrictionsManagingPackage(in ComponentName admin, in String packageName);
    String getApplicationRestrictionsManagingPackage(in ComponentName admin);
    boolean isCallerApplicationRestrictionsManagingPackage(in String callerPackage);

    // 给Provider设置权限
    void setRestrictionsProvider(in ComponentName who, in ComponentName provider);
    ComponentName getRestrictionsProvider(int userHandle);

    // 给用户设置权限
    void setUserRestriction(in ComponentName who, in String key, boolean enable, boolean parent);
    Bundle getUserRestrictions(in ComponentName who, boolean parent);

    void addCrossProfileIntentFilter(in ComponentName admin, in IntentFilter filter, int flags);
    void clearCrossProfileIntentFilters(in ComponentName admin);

    // 无障碍服务
    boolean setPermittedAccessibilityServices(in ComponentName admin,in List packageList);
    List getPermittedAccessibilityServices(in ComponentName admin);
    List getPermittedAccessibilityServicesForUser(int userId);
    boolean isAccessibilityServicePermittedByAdmin(in ComponentName admin, String packageName, int userId);

    // 设置被允许的输入法
    boolean setPermittedInputMethods(in ComponentName admin,in List packageList);
    List getPermittedInputMethods(in ComponentName admin);
    List getPermittedInputMethodsForCurrentUser();
    boolean isInputMethodPermittedByAdmin(in ComponentName admin, String packageName, int userId);

    // 设置被允许的通知监听
    boolean setPermittedCrossProfileNotificationListeners(in ComponentName admin, in List<String> packageList);
    List<String> getPermittedCrossProfileNotificationListeners(in ComponentName admin);
    boolean isNotificationListenerServicePermitted(in String packageName, int userId);

    // Called by any app to display a support dialog when a feature was disabled by an admin.
    // This returns an intent that can be used with {@link Context#startActivity(Intent)} to display the dialog. 
    // It will tell the user that the feature indicated by {@code restriction}was disabled by an admin, and include a link for more information.
    Intent createAdminSupportIntent(in String restriction);

    // 隐藏某个应用，将保留数据setApplicationHiddenSettingAsUser
    boolean setApplicationHidden(in ComponentName admin, in String callerPackage, in String packageName, boolean hidden, boolean parent);
    boolean isApplicationHidden(in ComponentName admin, in String callerPackage, in String packageName, boolean parent);

    // 创建和管理用户
    UserHandle createAndManageUser(in ComponentName who, in String name, in ComponentName profileOwner, in PersistableBundle adminExtras, in int flags);
    boolean removeUser(in ComponentName who, in UserHandle userHandle);
    boolean switchUser(in ComponentName who, in UserHandle userHandle);
    int startUserInBackground(in ComponentName who, in UserHandle userHandle);
    int stopUser(in ComponentName who, in UserHandle userHandle);
    int logoutUser(in ComponentName who);
    List<UserHandle> getSecondaryUsers(in ComponentName who);

    // 启用系统应用
    void enableSystemApp(in ComponentName admin, in String callerPackage, in String packageName);
    int enableSystemAppWithIntent(in ComponentName admin, in String callerPackage, in Intent intent);
    
    // 安装已经存在的包
    boolean installExistingPackage(in ComponentName admin, in String callerPackage, in String packageName);

    // 禁用账户管理
    void setAccountManagementDisabled(in ComponentName who, in String accountType, in boolean disabled, in boolean parent);
    String[] getAccountTypesWithManagementDisabled();
    String[] getAccountTypesWithManagementDisabledAsUser(int userId, in boolean parent);

    void setSecondaryLockscreenEnabled(in ComponentName who, boolean enabled);
    boolean isSecondaryLockscreenEnabled(in UserHandle userHandle);

    // 设置可以进入任务锁定的包
    void setLockTaskPackages(in ComponentName who, in String[] packages);
    String[] getLockTaskPackages(in ComponentName who);
    boolean isLockTaskPermitted(in String pkg);

    void setLockTaskFeatures(in ComponentName who, int flags);
    int getLockTaskFeatures(in ComponentName who);

    // 设置系统数据库
    void setGlobalSetting(in ComponentName who, in String setting, in String value);
    void setSystemSetting(in ComponentName who, in String setting, in String value);
    void setSecureSetting(in ComponentName who, in String setting, in String value);

    // 锁定网络配置
    void setConfiguredNetworksLockdownState(in ComponentName who, boolean lockdown);
    boolean hasLockdownAdminConfiguredNetworks(in ComponentName who);

    // 启用位置信息
    void setLocationEnabled(in ComponentName who, boolean locationEnabled);

    // 设置时间和时区
    boolean setTime(in ComponentName who, long millis);
    boolean setTimeZone(in ComponentName who, String timeZone);

    // 设置静音模式
    void setMasterVolumeMuted(in ComponentName admin, boolean on);
    boolean isMasterVolumeMuted(in ComponentName admin);

    void notifyLockTaskModeChanged(boolean isEnabled, String pkg, int userId);

    // 设置是否允许卸载软件包
    void setUninstallBlocked(in ComponentName admin, in String callerPackage, in String packageName, boolean uninstallBlocked);
    boolean isUninstallBlocked(in ComponentName admin, in String packageName);

    void setCrossProfileCallerIdDisabled(in ComponentName who, boolean disabled);
    boolean getCrossProfileCallerIdDisabled(in ComponentName who);
    boolean getCrossProfileCallerIdDisabledForUser(int userId);
    void setCrossProfileContactsSearchDisabled(in ComponentName who, boolean disabled);
    boolean getCrossProfileContactsSearchDisabled(in ComponentName who);
    boolean getCrossProfileContactsSearchDisabledForUser(int userId);
    void startManagedQuickContact(String lookupKey, long contactId, boolean isContactIdIgnored, long directoryId, in Intent originalIntent);

    void setBluetoothContactSharingDisabled(in ComponentName who, boolean disabled);
    boolean getBluetoothContactSharingDisabled(in ComponentName who);
    boolean getBluetoothContactSharingDisabledForUser(int userId);

    void setTrustAgentConfiguration(in ComponentName admin, in ComponentName agent,
            in PersistableBundle args, boolean parent);
    List<PersistableBundle> getTrustAgentConfiguration(in ComponentName admin,
            in ComponentName agent, int userId, boolean parent);

    boolean addCrossProfileWidgetProvider(in ComponentName admin, String packageName);
    boolean removeCrossProfileWidgetProvider(in ComponentName admin, String packageName);
    List<String> getCrossProfileWidgetProviders(in ComponentName admin);

    void setAutoTimeRequired(in ComponentName who, boolean required);
    boolean getAutoTimeRequired();

    void setAutoTimeEnabled(in ComponentName who, boolean enabled);
    boolean getAutoTimeEnabled(in ComponentName who);

    void setAutoTimeZoneEnabled(in ComponentName who, boolean enabled);
    boolean getAutoTimeZoneEnabled(in ComponentName who);

    void setForceEphemeralUsers(in ComponentName who, boolean forceEpehemeralUsers);
    boolean getForceEphemeralUsers(in ComponentName who);

    boolean isRemovingAdmin(in ComponentName adminReceiver, int userHandle);

    void setUserIcon(in ComponentName admin, in Bitmap icon);

    void setSystemUpdatePolicy(in ComponentName who, in SystemUpdatePolicy policy);
    SystemUpdatePolicy getSystemUpdatePolicy();
    void clearSystemUpdatePolicyFreezePeriodRecord();

    // 禁用锁屏状态栏
    boolean setKeyguardDisabled(in ComponentName admin, boolean disabled);
    boolean setStatusBarDisabled(in ComponentName who, boolean disabled);
    boolean getDoNotAskCredentialsOnBoot();

    void notifyPendingSystemUpdate(in SystemUpdateInfo info);
    SystemUpdateInfo getPendingSystemUpdate(in ComponentName admin);

    void setPermissionPolicy(in ComponentName admin, in String callerPackage, int policy);
    int  getPermissionPolicy(in ComponentName admin);
    void setPermissionGrantState(in ComponentName admin, in String callerPackage, String packageName,
            String permission, int grantState, in RemoteCallback resultReceiver);
    int getPermissionGrantState(in ComponentName admin, in String callerPackage, String packageName, String permission);
    boolean isProvisioningAllowed(String action, String packageName);
    int checkProvisioningPreCondition(String action, String packageName);
    void setKeepUninstalledPackages(in ComponentName admin, in String callerPackage, in List<String> packageList);
    List<String> getKeepUninstalledPackages(in ComponentName admin, in String callerPackage);
    boolean isManagedProfile(in ComponentName admin);
    boolean isSystemOnlyUser(in ComponentName admin);
    
    // 获取MAC地址
    String getWifiMacAddress(in ComponentName admin);
    // 重启设备
    void reboot(in ComponentName admin);

    void setShortSupportMessage(in ComponentName admin, in CharSequence message);
    CharSequence getShortSupportMessage(in ComponentName admin);
    void setLongSupportMessage(in ComponentName admin, in CharSequence message);
    CharSequence getLongSupportMessage(in ComponentName admin);

    CharSequence getShortSupportMessageForUser(in ComponentName admin, int userHandle);
    CharSequence getLongSupportMessageForUser(in ComponentName admin, int userHandle);

    boolean isSeparateProfileChallengeAllowed(int userHandle);

    void setOrganizationColor(in ComponentName admin, in int color);
    void setOrganizationColorForUser(in int color, in int userId);
    int getOrganizationColor(in ComponentName admin);
    int getOrganizationColorForUser(int userHandle);

    void setOrganizationName(in ComponentName admin, in CharSequence title);
    CharSequence getOrganizationName(in ComponentName admin);
    CharSequence getDeviceOwnerOrganizationName();
    CharSequence getOrganizationNameForUser(int userHandle);

    int getUserProvisioningState();
    void setUserProvisioningState(int state, int userHandle);

    void setAffiliationIds(in ComponentName admin, in List<String> ids);
    List<String> getAffiliationIds(in ComponentName admin);
    boolean isAffiliatedUser();

    void setSecurityLoggingEnabled(in ComponentName admin, boolean enabled);
    boolean isSecurityLoggingEnabled(in ComponentName admin);
    ParceledListSlice retrieveSecurityLogs(in ComponentName admin);
    ParceledListSlice retrievePreRebootSecurityLogs(in ComponentName admin);
    long forceNetworkLogs();
    long forceSecurityLogs();

    boolean isUninstallInQueue(String packageName);
    void uninstallPackageWithActiveAdmins(String packageName);

    boolean isDeviceProvisioned();
    boolean isDeviceProvisioningConfigApplied();
    void setDeviceProvisioningConfigApplied();

    void forceUpdateUserSetupComplete();

    // 启用备份服务
    void setBackupServiceEnabled(in ComponentName admin, boolean enabled);
    boolean isBackupServiceEnabled(in ComponentName admin);

    void setNetworkLoggingEnabled(in ComponentName admin, in String packageName, boolean enabled);
    boolean isNetworkLoggingEnabled(in ComponentName admin, in String packageName);
    List<NetworkEvent> retrieveNetworkLogs(in ComponentName admin, in String packageName, long batchToken);

    boolean bindDeviceAdminServiceAsUser(in ComponentName admin,
        IApplicationThread caller, IBinder token, in Intent service,
        IServiceConnection connection, int flags, int targetUserId);
    List<UserHandle> getBindDeviceAdminTargetUsers(in ComponentName admin);
    boolean isEphemeralUser(in ComponentName admin);

    long getLastSecurityLogRetrievalTime();
    long getLastBugReportRequestTime();
    long getLastNetworkLogRetrievalTime();

    boolean setResetPasswordToken(in ComponentName admin, in byte[] token);
    boolean clearResetPasswordToken(in ComponentName admin);
    boolean isResetPasswordTokenActive(in ComponentName admin);
    boolean resetPasswordWithToken(in ComponentName admin, String password, in byte[] token, int flags);

    boolean isCurrentInputMethodSetByOwner();
    StringParceledListSlice getOwnerInstalledCaCerts(in UserHandle user);

    // 清除用户数据
    void clearApplicationUserData(in ComponentName admin, in String packageName, in IPackageDataObserver callback);

    void setLogoutEnabled(in ComponentName admin, boolean enabled);
    boolean isLogoutEnabled();

    List<String> getDisallowedSystemApps(in ComponentName admin, int userId, String provisioningAction);

    void transferOwnership(in ComponentName admin, in ComponentName target, in PersistableBundle bundle);
    PersistableBundle getTransferOwnershipBundle();

    void setStartUserSessionMessage(in ComponentName admin, in CharSequence startUserSessionMessage);
    void setEndUserSessionMessage(in ComponentName admin, in CharSequence endUserSessionMessage);
    CharSequence getStartUserSessionMessage(in ComponentName admin);
    CharSequence getEndUserSessionMessage(in ComponentName admin);

    List<String> setMeteredDataDisabledPackages(in ComponentName admin, in List<String> packageNames);
    List<String> getMeteredDataDisabledPackages(in ComponentName admin);

    int addOverrideApn(in ComponentName admin, in ApnSetting apnSetting);
    boolean updateOverrideApn(in ComponentName admin, int apnId, in ApnSetting apnSetting);
    boolean removeOverrideApn(in ComponentName admin, int apnId);
    List<ApnSetting> getOverrideApns(in ComponentName admin);
    void setOverrideApnsEnabled(in ComponentName admin, boolean enabled);
    boolean isOverrideApnEnabled(in ComponentName admin);

    boolean isMeteredDataDisabledPackageForUser(in ComponentName admin, String packageName, int userId);

    int setGlobalPrivateDns(in ComponentName admin, int mode, in String privateDnsHost);
    int getGlobalPrivateDnsMode(in ComponentName admin);
    String getGlobalPrivateDnsHost(in ComponentName admin);

    void markProfileOwnerOnOrganizationOwnedDevice(in ComponentName who, int userId);

    void installUpdateFromFile(in ComponentName admin, in ParcelFileDescriptor updateFileDescriptor, in StartInstallingUpdateCallback listener);

    void setCrossProfileCalendarPackages(in ComponentName admin, in List<String> packageNames);
    List<String> getCrossProfileCalendarPackages(in ComponentName admin);
    boolean isPackageAllowedToAccessCalendarForUser(String packageName, int userHandle);
    List<String> getCrossProfileCalendarPackagesForUser(int userHandle);

    void setCrossProfilePackages(in ComponentName admin, in List<String> packageNames);
    List<String> getCrossProfilePackages(in ComponentName admin);

    List<String> getAllCrossProfilePackages();
    List<String> getDefaultCrossProfilePackages();

    boolean isManagedKiosk();
    boolean isUnattendedManagedKiosk();

    boolean startViewCalendarEventInManagedProfile(String packageName, long eventId, long start, long end, boolean allDay, int flags);

    boolean setKeyGrantForApp(in ComponentName admin, String callerPackage, String alias, String packageName, boolean hasGrant);

    void setUserControlDisabledPackages(in ComponentName admin, in List<String> packages);

    List<String> getUserControlDisabledPackages(in ComponentName admin);

    void setCommonCriteriaModeEnabled(in ComponentName admin, boolean enabled);
    boolean isCommonCriteriaModeEnabled(in ComponentName admin);

    int getPersonalAppsSuspendedReasons(in ComponentName admin);
    void setPersonalAppsSuspended(in ComponentName admin, boolean suspended);

    long getManagedProfileMaximumTimeOff(in ComponentName admin);
    void setManagedProfileMaximumTimeOff(in ComponentName admin, long timeoutMs);
    boolean canProfileOwnerResetPasswordWhenLocked(in int userId);
}

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




