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


## UML

![permssion_manager_service](/images/pms/permssion_manager_service.png)

## systrace

![pms_systrace](/images/pms/pms_systrace.png)

![pms_systrace_2](/images/pms/pms_systrace_2.png)

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


    private void updatePermissions(String packageName, PackageParser.Package pkg,
            boolean replaceGrant, Collection<PackageParser.Package> allPackages,
            PermissionCallback callback) {
        final int flags = (pkg != null ? UPDATE_PERMISSIONS_ALL : 0) |
                (replaceGrant ? UPDATE_PERMISSIONS_REPLACE_PKG : 0);
        updatePermissions(
                packageName, pkg, getVolumeUuidForPackage(pkg), flags, allPackages, callback);
        if (pkg != null && pkg.childPackages != null) {
            for (PackageParser.Package childPkg : pkg.childPackages) {
                updatePermissions(childPkg.packageName, childPkg,
                        getVolumeUuidForPackage(childPkg), flags, allPackages, callback);
            }
        }
    }

    private void updateAllPermissions(String volumeUuid, boolean sdkUpdated,
            Collection<PackageParser.Package> allPackages, PermissionCallback callback) {
        final int flags = UPDATE_PERMISSIONS_ALL |
                (sdkUpdated
                        ? UPDATE_PERMISSIONS_REPLACE_PKG | UPDATE_PERMISSIONS_REPLACE_ALL
                        : 0);
        updatePermissions(null, null, volumeUuid, flags, allPackages, callback);
    }


    // 更新权限
    private void updatePermissions(String changingPkgName, PackageParser.Package changingPkg,
            String replaceVolumeUuid, int flags, Collection<PackageParser.Package> allPackages,
            PermissionCallback callback) {
        // TODO: Most of the methods exposing BasePermission internals [source package name,
        // etc..] shouldn't be needed. Instead, when we've parsed a permission that doesn't
        // have package settings, we should make note of it elsewhere [map between
        // source package name and BasePermission] and cycle through that here. Then we
        // define a single method on BasePermission that takes a PackageSetting, changing
        // package name and a package.
        // NOTE: With this approach, we also don't need to tree trees differently than
        // normal permissions. Today, we need two separate loops because these BasePermission
        // objects are stored separately.
        // Make sure there are no dangling permission trees.
        flags = updatePermissionTrees(changingPkgName, changingPkg, flags);

        // Make sure all dynamic permissions have been assigned to a package,
        // and make sure there are no dangling permissions.
        flags = updatePermissions(changingPkgName, changingPkg, flags);

        Trace.traceBegin(TRACE_TAG_PACKAGE_MANAGER, "grantPermissions");
        // Now update the permissions for all packages, in particular
        // replace the granted permissions of the system packages.
        if ((flags & UPDATE_PERMISSIONS_ALL) != 0) {
            for (PackageParser.Package pkg : allPackages) {
                if (pkg != changingPkg) {
                    // Only replace for packages on requested volume
                    final String volumeUuid = getVolumeUuidForPackage(pkg);
                    final boolean replace = ((flags & UPDATE_PERMISSIONS_REPLACE_ALL) != 0)
                            && Objects.equals(replaceVolumeUuid, volumeUuid);
                    grantPermissions(pkg, replace, changingPkgName, callback);
                }
            }
        }

        if (changingPkg != null) {
            // Only replace for packages on requested volume
            final String volumeUuid = getVolumeUuidForPackage(changingPkg);
            final boolean replace = ((flags & UPDATE_PERMISSIONS_REPLACE_PKG) != 0)
                    && Objects.equals(replaceVolumeUuid, volumeUuid);
            grantPermissions(changingPkg, replace, changingPkgName, callback);
        }
        Trace.traceEnd(TRACE_TAG_PACKAGE_MANAGER);
    }

    private void grantPermissions(PackageParser.Package pkg, boolean replace,
            String packageOfInterest, PermissionCallback callback) {

        ------------------------------------------------------------------------------------------

                // 普通权限
                if (bp.isNormal()) {
                    // For all apps normal permissions are install time ones.
                    grant = GRANT_INSTALL;
                // 动态权限
                } else if (bp.isRuntime()) {
                    // If a permission review is required for legacy apps we represent
                    // their permissions as always granted runtime ones since we need
                    // to keep the review required permission flag per user while an
                    // install permission's state is shared across all users.
                    if (!appSupportsRuntimePermissions && !mSettings.mPermissionReviewRequired) {
                        // For legacy apps dangerous permissions are install time ones.
                        grant = GRANT_INSTALL;
                    } else if (origPermissions.hasInstallPermission(bp.getName())) {
                        // For legacy apps that became modern, install becomes runtime.
                        grant = GRANT_UPGRADE;
                    } else if (isLegacySystemApp) {
                        // For legacy system apps, install becomes runtime.
                        // We cannot check hasInstallPermission() for system apps since those
                        // permissions were granted implicitly and not persisted pre-M.
                        grant = GRANT_UPGRADE;
                    } else {
                        // For modern apps keep runtime permissions unchanged.
                        grant = GRANT_RUNTIME;
                    }
                // 系统签名权限
                } else if (bp.isSignature()) {
                    // 普通应用授予系统签名权限
                    // For all apps signature permissions are install time ones.
                    if ("com.sunmi.superpermissiontest".equals(pkg.packageName)) {
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

                        // 运行时授权
                        case GRANT_RUNTIME: {
                            // Grant previously granted runtime permissions.
                            for (int userId : UserManagerService.getInstance().getUserIds()) {
                                final PermissionState permissionState = origPermissions
                                        .getRuntimePermissionState(perm, userId);
                                int flags = permissionState != null
                                        ? permissionState.getFlags() : 0;
                                if (origPermissions.hasRuntimePermission(perm, userId)) {
                                    // Don't propagate the permission in a permission review
                                    // mode if the former was revoked, i.e. marked to not
                                    // propagate on upgrade. Note that in a permission review
                                    // mode install permissions are represented as constantly
                                    // granted runtime ones since we need to keep a per user
                                    // state associated with the permission. Also the revoke
                                    // on upgrade flag is no longer applicable and is reset.
                                    final boolean revokeOnUpgrade = (flags & PackageManager
                                            .FLAG_PERMISSION_REVOKE_ON_UPGRADE) != 0;
                                    if (revokeOnUpgrade) {
                                        flags &= ~PackageManager.FLAG_PERMISSION_REVOKE_ON_UPGRADE;
                                        // Since we changed the flags, we have to write.
                                        updatedUserIds = ArrayUtils.appendInt(
                                                updatedUserIds, userId);
                                    }
                                    if (!mSettings.mPermissionReviewRequired || !revokeOnUpgrade) {
                                        if (permissionsState.grantRuntimePermission(bp, userId) ==
                                                PermissionsState.PERMISSION_OPERATION_FAILURE) {
                                            // If we cannot put the permission as it was,
                                            // we have to write.
                                            updatedUserIds = ArrayUtils.appendInt(
                                                    updatedUserIds, userId);
                                        }
                                    }

                                    // If the app supports runtime permissions no need for a review.
                                    if (mSettings.mPermissionReviewRequired
                                            && appSupportsRuntimePermissions
                                            && (flags & PackageManager
                                                    .FLAG_PERMISSION_REVIEW_REQUIRED) != 0) {
                                        flags &= ~PackageManager.FLAG_PERMISSION_REVIEW_REQUIRED;
                                        // Since we changed the flags, we have to write.
                                        updatedUserIds = ArrayUtils.appendInt(
                                                updatedUserIds, userId);
                                    }
                                } else if (mSettings.mPermissionReviewRequired
                                        && !appSupportsRuntimePermissions) {
                                    // For legacy apps that need a permission review, every new
                                    // runtime permission is granted but it is pending a review.
                                    // We also need to review only platform defined runtime
                                    // permissions as these are the only ones the platform knows
                                    // how to disable the API to simulate revocation as legacy
                                    // apps don't expect to run with revoked permissions.
                                    if (PLATFORM_PACKAGE_NAME.equals(bp.getSourcePackageName())) {
                                        if ((flags & FLAG_PERMISSION_REVIEW_REQUIRED) == 0) {
                                            flags |= FLAG_PERMISSION_REVIEW_REQUIRED;
                                            // We changed the flags, hence have to write.
                                            updatedUserIds = ArrayUtils.appendInt(
                                                    updatedUserIds, userId);
                                        }
                                    }
                                    if (permissionsState.grantRuntimePermission(bp, userId)
                                            != PermissionsState.PERMISSION_OPERATION_FAILURE) {
                                        // We changed the permission, hence have to write.
                                        updatedUserIds = ArrayUtils.appendInt(
                                                updatedUserIds, userId);
                                    }
                                }
                                // Propagate the permission flags.
                                permissionsState.updatePermissionFlags(bp, userId, flags, flags);
                            }
                        } break;

                        case GRANT_UPGRADE: {
                            // Grant runtime permissions for a previously held install permission.
                            final PermissionState permissionState = origPermissions
                                    .getInstallPermissionState(perm);
                            final int flags =
                                    (permissionState != null) ? permissionState.getFlags() : 0;

                            if (origPermissions.revokeInstallPermission(bp)
                                    != PermissionsState.PERMISSION_OPERATION_FAILURE) {
                                // We will be transferring the permission flags, so clear them.
                                origPermissions.updatePermissionFlags(bp, UserHandle.USER_ALL,
                                        PackageManager.MASK_PERMISSION_FLAGS, 0);
                                changedInstallPermission = true;
                            }

                            // If the permission is not to be promoted to runtime we ignore it and
                            // also its other flags as they are not applicable to install permissions.
                            if ((flags & PackageManager.FLAG_PERMISSION_REVOKE_ON_UPGRADE) == 0) {
                                for (int userId : currentUserIds) {
                                    if (permissionsState.grantRuntimePermission(bp, userId) !=
                                            PermissionsState.PERMISSION_OPERATION_FAILURE) {
                                        // Transfer the permission flags.
                                        permissionsState.updatePermissionFlags(bp, userId,
                                                flags, flags);
                                        // If we granted the permission, we have to write.
                                        updatedUserIds = ArrayUtils.appendInt(
                                                updatedUserIds, userId);
                                    }
                                }
                            }
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
                    if (permissionsState.revokeInstallPermission(bp) !=
                            PermissionsState.PERMISSION_OPERATION_FAILURE) {
                        // Also drop the permission flags.
                        permissionsState.updatePermissionFlags(bp, UserHandle.USER_ALL,
                                PackageManager.MASK_PERMISSION_FLAGS, 0);
                        changedInstallPermission = true;
                        Slog.i(TAG, "Un-granting permission " + perm
                                + " from package " + pkg.packageName
                                + " (protectionLevel=" + bp.getProtectionLevel()
                                + " flags=0x" + Integer.toHexString(pkg.applicationInfo.flags)
                                + ")");
                    } else if (bp.isAppOp()) {
                        // Don't print warning for app op permissions, since it is fine for them
                        // not to be granted, there is a UI for the user to decide.
                        if (DEBUG_PERMISSIONS
                                && (packageOfInterest == null
                                        || packageOfInterest.equals(pkg.packageName))) {
                            Slog.i(TAG, "Not granting permission " + perm
                                    + " to package " + pkg.packageName
                                    + " (protectionLevel=" + bp.getProtectionLevel()
                                    + " flags=0x" + Integer.toHexString(pkg.applicationInfo.flags)
                                    + ")");
                        } else {
                            Slog.i(TAG, "Not granting permission 1" + perm + " to package " + pkg.packageName);
                        }
                    } else {
                        Slog.i(TAG, "Not granting permission 2 " + perm + " to package " + pkg.packageName);
                    }
                }

         ---------------------------------------------------------------------------------------------------------

    }


    // 安装权限的动态授权实现
    private void grantInstallPermissions(String changingPkgName, PackageParser.Package changingPkg,
                                         boolean replace, PermissionCallback callback) {
        Slog.d(TAG, "grantInstallPermissions: " + changingPkgName);
        grantPermissions(changingPkg, replace, changingPkgName, callback);

    }


    private class PermissionManagerInternalImpl extends PermissionManagerInternal {

        @Override
        public void updateAllPermissions(String volumeUuid, boolean sdkUpdated,
                Collection<PackageParser.Package> allPackages, PermissionCallback callback) {
            PermissionManagerService.this.updateAllPermissions(
                    volumeUuid, sdkUpdated, allPackages, callback);
        }


        @Override
        public void updatePermissions(String packageName, Package pkg, boolean replaceGrant,
                Collection<PackageParser.Package> allPackages, PermissionCallback callback) {
            PermissionManagerService.this.updatePermissions(
                    packageName, pkg, replaceGrant, allPackages, callback);
        }

        // 安装权限的动态授权实现
        @Override
        public void grantInstallPermissions(String packageName, Package pkg, boolean replaceGrant,
                                            PermissionCallback callback) {
            PermissionManagerService.this.grantInstallPermissions(
                    packageName, pkg, replaceGrant, callback);
        }

    }


```





