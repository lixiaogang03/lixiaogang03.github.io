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


## systrace

![pms_systrace](/images/pms/pms_systrace.png)

![pms_systrace_2](/images/pms/pms_systrace_2.png)

## UML-PermissionMS init

![permssion_manager_service](/images/pms/permssion_manager_service.png)

## UML-grantInstallPermission

![super_power_app](/images/pms/super_power_app.png)

## PackageManagerService

```java

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





