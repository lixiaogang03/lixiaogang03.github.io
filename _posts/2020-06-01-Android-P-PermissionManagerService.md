---
layout:     post
title:      Android P PermissionManagerService
subtitle:   权限管理服务
date:       2020-06-01
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
---

[Android Permissions-简书](https://www.jianshu.com/p/ffd583f720f4)

[PackageParser解析APK-简书](https://www.jianshu.com/p/2fcd22326efb)

## systrace

![pms_systrace](/images/pms/pms_systrace.png)

![pms_systrace_2](/images/pms/pms_systrace_2.png)

## UML-PermissionMS init

![permssion_manager_service](/images/pms/permssion_manager_service.png)

## UML-grantInstallPermission

![super_power_app](/images/pms/super_power_app.png)

## PackageManagerService

```java

    /** Map from package name to settings */
    final ArrayMap<String, PackageSetting> mPackages = new ArrayMap<>();

    public PackageManagerService(Context context, Installer installer,
            boolean factoryTest, boolean onlyCore) {

        ----------------------------------------------------------------------------------

        synchronized (mPackages) {
            // Expose private service for system components to use.
            LocalServices.addService(
                    PackageManagerInternal.class, new PackageManagerInternalImpl());
            sUserManager = new UserManagerService(context, this,
                    new UserDataPreparer(mInstaller, mInstallLock, mContext, mOnlyCore), mPackages);
            mPermissionManager = PermissionManagerService.create(context,
                    new DefaultPermissionGrantedCallback() {
                        @Override
                        public void onDefaultRuntimePermissionsGranted(int userId) {
                            synchronized(mPackages) {
                                mSettings.onDefaultRuntimePermissionsGrantedLPr(userId);
                            }
                        }
                    }, mPackages /*externalLock*/);
            mDefaultPermissionPolicy = mPermissionManager.getDefaultPermissionGrantPolicy();
            mSettings = new Settings(mPermissionManager.getPermissionSettings(), mPackages);
        }

        -----------------------------------------------------------------------------------

            mPermissionManager.updateAllPermissions(
                    StorageManager.UUID_PRIVATE_INTERNAL, sdkUpdated, mPackages.values(),
                    mPermissionCallback);

        -----------------------------------------------------------------------------------

    }

```

## PermissionManagerService

```java

    PermissionManagerService(Context context,
            @Nullable DefaultPermissionGrantedCallback defaultGrantCallback,
            @NonNull Object externalLock) {
        mContext = context;
        mLock = externalLock;
        mPackageManagerInt = LocalServices.getService(PackageManagerInternal.class);
        mUserManagerInt = LocalServices.getService(UserManagerInternal.class);
        mSettings = new PermissionSettings(context, mLock);

        mHandlerThread = new ServiceThread(TAG,
                Process.THREAD_PRIORITY_BACKGROUND, true /*allowIo*/);
        mHandlerThread.start();
        mHandler = new Handler(mHandlerThread.getLooper());
        Watchdog.getInstance().addThread(mHandler);

        mDefaultPermissionGrantPolicy = new DefaultPermissionGrantPolicy(
                context, mHandlerThread.getLooper(), defaultGrantCallback, this);
        SystemConfig systemConfig = SystemConfig.getInstance();
        mSystemPermissions = systemConfig.getSystemPermissions();
        mGlobalGids = systemConfig.getGlobalGids();

        // propagate permission configuration
        final ArrayMap<String, SystemConfig.PermissionEntry> permConfig =
                SystemConfig.getInstance().getPermissions();
        synchronized (mLock) {
            for (int i=0; i<permConfig.size(); i++) {
                final SystemConfig.PermissionEntry perm = permConfig.valueAt(i);
                BasePermission bp = mSettings.getPermissionLocked(perm.name);
                if (bp == null) {
                    bp = new BasePermission(perm.name, "android", BasePermission.TYPE_BUILTIN);
                    mSettings.putPermissionLocked(perm.name, bp);
                }
                if (perm.gids != null) {
                    bp.setGids(perm.gids, perm.perUser);
                }
            }
        }

        LocalServices.addService(
                PermissionManagerInternal.class, new PermissionManagerInternalImpl());
    }

    // lxg add
    // 安装权限的动态授权实现
    private void grantInstallPermissions(String changingPkgName, PackageParser.Package changingPkg,
                                         boolean replace, PermissionCallback callback) {
        Slog.d(TAG, "grantInstallPermissions: " + changingPkgName);
        grantPermissions(changingPkg, replace, changingPkgName, callback);

    }


    private void grantPermissions(PackageParser.Package pkg, boolean replace,
            String packageOfInterest, PermissionCallback callback) {

        ------------------------------------------------------------------------------------------

        permissionsState.setGlobalGids(mGlobalGids);

        synchronized (mLock) {
            final int N = pkg.requestedPermissions.size();
            for (int i = 0; i < N; i++) {
                final String permName = pkg.requestedPermissions.get(i);
                final BasePermission bp = mSettings.getPermissionLocked(permName);

                ----------------------------------------------------------------------------------

                // 普通权限
                if (bp.isNormal()) {
                    // For all apps normal permissions are install time ones.
                    grant = GRANT_INSTALL;
                // 动态权限
                } else if (bp.isRuntime()) {
                    ------------------------------------------------------------------------------
                // 系统签名权限
                } else if (bp.isSignature()) {
                    // 普通应用授予系统签名权限
                    // For all apps signature permissions are install time ones.
                    // lxg add
                    if (SuperPowerApp.checkCallingPermission(pkg.packageName, perm)) {
                        Slog.i(TAG, "SuperPowerApp Granting permission " + perm + " to package " + pkg.packageName);
                        grant = GRANT_INSTALL;
                        allowedSig = true;
                    } else{
                        allowedSig = grantSignaturePermission(perm, pkg, bp, origPermissions);
                        if (allowedSig) {
                            grant = GRANT_INSTALL;
                        }
                    }
                }

                if (DEBUG_PERMISSIONS) {
                    Slog.i(TAG, "Granting permission " + perm + " to package " + pkg.packageName);
                }

                if (grant != GRANT_DENIED) {
                    if (!ps.isSystem() && ps.areInstallPermissionsFixed()) {
                        // lixiaogang
                        // If this is an existing, non-system package, then
                        // we can't add any new permissions to it.
                        if (!allowedSig && !origPermissions.hasInstallPermission(perm)) {
                            // Except...  if this is a permission that was added
                            // to the platform (note: need to only do this when
                            // updating the platform).
                            if (!isNewPlatformPermissionForPackage(perm, pkg)) {
                                grant = GRANT_DENIED;
                            }
                        }
                    }

                    switch (grant) {
                        // 安装授权
                        case GRANT_INSTALL: {
                            // Revoke this as runtime permission to handle the case of
                            // a runtime permission being downgraded to an install one.
                            // Also in permission review mode we keep dangerous permissions
                            // for legacy apps
                            for (int userId : UserManagerService.getInstance().getUserIds()) {
                                if (origPermissions.getRuntimePermissionState(
                                        perm, userId) != null) {
                                    // Revoke the runtime permission and clear the flags.
                                    origPermissions.revokeRuntimePermission(bp, userId);
                                    origPermissions.updatePermissionFlags(bp, userId,
                                          PackageManager.MASK_PERMISSION_FLAGS, 0);
                                    // If we revoked a permission permission, we have to write.
                                    updatedUserIds = ArrayUtils.appendInt(
                                            updatedUserIds, userId);
                                }
                            }
                            // Grant an install permission.
                            if (permissionsState.grantInstallPermission(bp) !=
                                    PermissionsState.PERMISSION_OPERATION_FAILURE) {
                                changedInstallPermission = true;
                            }
                        } break;

                        case GRANT_RUNTIME: {
                            --------------------------------------------------------------------
                        } break;

                        case GRANT_UPGRADE: {
                            ---------------------------------------------------------------------
                        } break;

                        default: {
                            if (packageOfInterest == null
                                    || packageOfInterest.equals(pkg.packageName)) {
                                if (DEBUG_PERMISSIONS) {
                                    Slog.i(TAG, "Not granting permission " + perm
                                            + " to package " + pkg.packageName
                                            + " because it was previously installed without");
                                }
                            }
                        } break;
                    }
                } else {

                    -------------------------------------------------------------------------------
                }

         ---------------------------------------------------------------------------------------------------------

    }


    private class PermissionManagerInternalImpl extends PermissionManagerInternal {

        // 安装权限的动态授权实现
        @Override
        public void grantInstallPermissions(String packageName, Package pkg, boolean replaceGrant,
                                            PermissionCallback callback) {
            PermissionManagerService.this.grantInstallPermissions(
                    packageName, pkg, replaceGrant, callback);
        }

    }


```

## 数据结构

![permission_class](/images/pms/permission_class.png)

### PackageParser.Package

Android 安装一个APK的时候首先会解析APK，而解析APK则需要用到一个工具类，这个工具类就是PackageParser

```java

public class PackageParser {

    private static final String TAG_MANIFEST = "manifest";
    private static final String TAG_APPLICATION = "application";
    private static final String TAG_OVERLAY = "overlay";
    private static final String TAG_KEY_SETS = "key-sets";
    private static final String TAG_PERMISSION_GROUP = "permission-group";
    private static final String TAG_PERMISSION = "permission";
    private static final String TAG_PERMISSION_TREE = "permission-tree";
    private static final String TAG_USES_PERMISSION = "uses-permission";
    private static final String TAG_USES_PERMISSION_SDK_M = "uses-permission-sdk-m";
    private static final String TAG_USES_PERMISSION_SDK_23 = "uses-permission-sdk-23";
    private static final String TAG_USES_CONFIGURATION = "uses-configuration";
    private static final String TAG_USES_FEATURE = "uses-feature";
    private static final String TAG_FEATURE_GROUP = "feature-group";
    private static final String TAG_USES_SDK = "uses-sdk";
    private static final String TAG_SUPPORT_SCREENS = "supports-screens";
    private static final String TAG_PROTECTED_BROADCAST = "protected-broadcast";
    private static final String TAG_INSTRUMENTATION = "instrumentation";
    private static final String TAG_ORIGINAL_PACKAGE = "original-package";
    private static final String TAG_ADOPT_PERMISSIONS = "adopt-permissions";
    private static final String TAG_USES_GL_TEXTURE = "uses-gl-texture";
    private static final String TAG_COMPATIBLE_SCREENS = "compatible-screens";
    private static final String TAG_SUPPORTS_INPUT = "supports-input";
    private static final String TAG_EAT_COMMENT = "eat-comment";
    private static final String TAG_PACKAGE = "package";
    private static final String TAG_RESTRICT_UPDATE = "restrict-update";


    /**
     * Representation of a full package parsed from APK files on disk. A package
     * consists of a single base APK, and zero or more split APKs.
     */
    public final static class Package {

        /** Names of any split APKs, ordered by parsed splitName */
        public String[] splitNames;

        public final ArrayList<Permission> permissions = new ArrayList<Permission>(0);
        public final ArrayList<PermissionGroup> permissionGroups = new ArrayList<PermissionGroup>(0);
        public final ArrayList<Activity> activities = new ArrayList<Activity>(0);
        public final ArrayList<Activity> receivers = new ArrayList<Activity>(0);
        public final ArrayList<Provider> providers = new ArrayList<Provider>(0);
        public final ArrayList<Service> services = new ArrayList<Service>(0);
        public final ArrayList<Instrumentation> instrumentation = new ArrayList<Instrumentation>(0);


        public Package parentPackage;
        public ArrayList<Package> childPackages;

    }

}

```

### PackageSetting

```java

/**
 * Settings data for a particular package we know about.
 */
public final class PackageSetting extends PackageSettingBase {

    int appId;
    PackageParser.Package pkg;

    SharedUserSetting sharedUser;

    private int sharedUserId;

}

```

### PermissionsState

```java


/**
 * This class encapsulates the permissions for a package or a shared user.
 * <p>
 * There are two types of permissions: install (granted at installation)
 * and runtime (granted at runtime). Install permissions are granted to
 * all device users while runtime permissions are granted explicitly to
 * specific users.
 * </p>
 * <p>
 * The permissions are kept on a per device user basis. For example, an
 * application may have some runtime permissions granted under the device
 * owner but not granted under the secondary user.
 * <p>
 * This class is also responsible for keeping track of the Linux gids per
 * user for a package or a shared user. The gids are computed as a set of
 * the gids for all granted permissions' gids on a per user basis.
 * </p>
 */
public final class PermissionsState {

    private ArrayMap<String, PermissionData> mPermissions;

    private int[] mGlobalGids = NO_GIDS;


    /**
     * Grant an install permission.
     *
     * @param permission The permission to grant.
     * @return The operation result which is either {@link #PERMISSION_OPERATION_SUCCESS},
     *     or {@link #PERMISSION_OPERATION_SUCCESS_GIDS_CHANGED}, or {@link
     *     #PERMISSION_OPERATION_FAILURE}.
     */
    public int grantInstallPermission(BasePermission permission) {
        return grantPermission(permission, UserHandle.USER_ALL);
    }

    /**
     * Revoke an install permission.
     *
     * @param permission The permission to revoke.
     * @return The operation result which is either {@link #PERMISSION_OPERATION_SUCCESS},
     *     or {@link #PERMISSION_OPERATION_SUCCESS_GIDS_CHANGED}, or {@link
     *     #PERMISSION_OPERATION_FAILURE}.
     */
    public int revokeInstallPermission(BasePermission permission) {
        return revokePermission(permission, UserHandle.USER_ALL);
    }


    private int grantPermission(BasePermission permission, int userId) {
        if (hasPermission(permission.getName(), userId)) {
            return PERMISSION_OPERATION_FAILURE;
        }

        final boolean hasGids = !ArrayUtils.isEmpty(permission.computeGids(userId));
        final int[] oldGids = hasGids ? computeGids(userId) : NO_GIDS;

        // 授权逻辑              
        PermissionData permissionData = ensurePermissionData(permission);

        // 授权逻辑 user
        if (!permissionData.grant(userId)) {
            return PERMISSION_OPERATION_FAILURE;
        }

        if (hasGids) {
            final int[] newGids = computeGids(userId);
            if (oldGids.length != newGids.length) {
                return PERMISSION_OPERATION_SUCCESS_GIDS_CHANGED;
            }
        }

        return PERMISSION_OPERATION_SUCCESS;
    }

    private int revokePermission(BasePermission permission, int userId) {
        final String permName = permission.getName();
        if (!hasPermission(permName, userId)) {
            return PERMISSION_OPERATION_FAILURE;
        }

        final boolean hasGids = !ArrayUtils.isEmpty(permission.computeGids(userId));
        final int[] oldGids = hasGids ? computeGids(userId) : NO_GIDS;

        PermissionData permissionData = mPermissions.get(permName);

        if (!permissionData.revoke(userId)) {
            return PERMISSION_OPERATION_FAILURE;
        }

        if (permissionData.isDefault()) {
            ensureNoPermissionData(permName);
        }

        if (hasGids) {
            final int[] newGids = computeGids(userId);
            if (oldGids.length != newGids.length) {
                return PERMISSION_OPERATION_SUCCESS_GIDS_CHANGED;
            }
        }

        return PERMISSION_OPERATION_SUCCESS;
    }


    private static final class PermissionData {
        private final BasePermission mPerm;
        private SparseArray<PermissionState> mUserStates = new SparseArray<>();
    }

    public static final class PermissionState {
        private final String mName;
        private boolean mGranted;
        private int mFlags;
    }

}

```

### BasePermission

```java

public final class BasePermission {

    final String name;

    final @PermissionType int type;

    String sourcePackageName;

    // TODO: Can we get rid of this? Seems we only use some signature info from the setting
    PackageSettingBase sourcePackageSetting;

    int protectionLevel;

    PackageParser.Permission perm;

    PermissionInfo pendingPermissionInfo;

    /** UID that owns the definition of this permission */
    int uid;

    /** Additional GIDs given to apps granted this permission */
    private int[] gids;

    public BasePermission(String _name, String _sourcePackageName, @PermissionType int _type) {
        name = _name;
        sourcePackageName = _sourcePackageName;
        type = _type;
        // Default to most conservative protection level.
        protectionLevel = PermissionInfo.PROTECTION_SIGNATURE;
    }

    public boolean isNormal() {
        return (protectionLevel & PermissionInfo.PROTECTION_MASK_BASE)
                == PermissionInfo.PROTECTION_NORMAL;
    }
    public boolean isRuntime() {
        return (protectionLevel & PermissionInfo.PROTECTION_MASK_BASE)
                == PermissionInfo.PROTECTION_DANGEROUS;
    }
    public boolean isSignature() {
        return (protectionLevel & PermissionInfo.PROTECTION_MASK_BASE) ==
                PermissionInfo.PROTECTION_SIGNATURE;
    }

}

```

### PermissionSettings

```java

/**
 * Permissions and other related data. This class is not meant for
 * direct access outside of the permission package with the sole exception
 * of package settings. Instead, it should be reference either from the
 * permission manager or package settings.
 */
public class PermissionSettings {

    /**
     * All of the permissions known to the system. The mapping is from permission
     * name to permission object.
     */
    @GuardedBy("mLock")
    final ArrayMap<String, BasePermission> mPermissions =
            new ArrayMap<String, BasePermission>();

    /**
     * Set of packages that request a particular app op. The mapping is from permission
     * name to package names.
     */
    @GuardedBy("mLock")
    final ArrayMap<String, ArraySet<String>> mAppOpPermissionPackages = new ArrayMap<>();


    PermissionSettings(@NonNull Context context, @NonNull Object lock) {
        mPermissionReviewRequired =
                context.getResources().getBoolean(R.bool.config_permissionReviewRequired);
        mLock = lock;
    }

    public @Nullable BasePermission getPermission(@NonNull String permName) {
        synchronized (mLock) {
            return getPermissionLocked(permName);
        }
    }

    public void addAppOpPackage(String permName, String packageName) {
        ArraySet<String> pkgs = mAppOpPermissionPackages.get(permName);
        if (pkgs == null) {
            pkgs = new ArraySet<>();
            mAppOpPermissionPackages.put(permName, pkgs);
        }
        pkgs.add(packageName);
    }

}

```

## dumpsys package com.*

```txt

    requested permissions:
      android.permission.ACCESS_NETWORK_STATE
      android.permission.ACCESS_WIFI_STATE
      android.permission.CHANGE_WIFI_STATE
      android.permission.BROADCAST_STICKY
      android.permission.CALL_PHONE
      android.permission.READ_EXTERNAL_STORAGE
      android.permission.WRITE_EXTERNAL_STORAGE
      android.permission.REBOOT
      android.permission.SHUTDOWN
      android.permission.CONNECTIVITY_INTERNAL
      android.permission.WRITE_SETTINGS
      android.permission.READ_SETTINGS
      android.permission.INJECT_EVENTS
      android.permission.CAPTURE_SECURE_VIDEO_OUTPUT
      android.permission.CAPTURE_VIDEO_OUTPUT
      android.permission.READ_FRAME_BUFFER
      android.permission.ACCESS_SURFACE_FLINGER
      android.permission.SET_ANIMATION_SCALE
      android.permission.MOUNT_UNMOUNT_FILESYSTEMS
      android.permission.SYSTEM_ALERT_WINDOW
      android.permission.CHANGE_COMPONENT_ENABLED_STATE
    install permissions:
      android.permission.SYSTEM_ALERT_WINDOW: granted=true
      android.permission.SET_ANIMATION_SCALE: granted=true
      android.permission.BROADCAST_STICKY: granted=true
      android.permission.CHANGE_WIFI_STATE: granted=true
      android.permission.ACCESS_NETWORK_STATE: granted=true
      android.permission.REBOOT: granted=true
      android.permission.ACCESS_WIFI_STATE: granted=true
    User 0: ceDataInode=786092 installed=true hidden=false suspended=false stopped=false notLaunched=false enabled=0 instant=false virtual=false
      runtime permissions:
        android.permission.READ_EXTERNAL_STORAGE: granted=true
        android.permission.CALL_PHONE: granted=true
        android.permission.WRITE_EXTERNAL_STORAGE: granted=true

```

![dumpsys_package](/images/pms/dumpsys_package.png)

## 总结

![permission_settings](/images/pms/permission_settings.png)
















