---
layout:     post
title:      Android 11 Permission
subtitle:   PermissionPolicyService
date:       2020-10-13
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
---

## 类图

![android_r_permission_2](/images/android/android_r/android_r_permission_2.png)

## 时序图

![android_r_permission_1](/images/android/android_r/android_r_permission_1.png)

## SystemServer

```java

        // Permission policy service
        t.traceBegin("StartPermissionPolicyService");
        mSystemServiceManager.startService(PermissionPolicyService.class);
        t.traceEnd();

        t.traceBegin("MakePackageManagerServiceReady");
        mPackageManagerService.systemReady();
        t.traceEnd();

```

## PermissionPolicyService

```java

/**
 * This is a permission policy that governs over all permission mechanism
 * such as permissions, app ops, etc. For example, the policy ensures that
 * permission state and app ops is synchronized for cases where there is a
 * dependency between permission state (permissions or permission flags)
 * and app ops - and vise versa.
 */
public final class PermissionPolicyService extends SystemService {


    public PermissionPolicyService(@NonNull Context context) {
        super(context);

        LocalServices.addService(PermissionPolicyInternal.class, new Internal());
    }

}

```

## adb shell dumpsys permissionmgr

```txt

# com.android.permissioncontroller.PermissionControllerProto$PermissionControllerDumpProto@f1b0b224
auto_revoke {
  teamfood_settings {
  }
  users {
    packages {
      first_install_time: 1230768000000
      groups {
        group_name: "android.permission-group.STORAGE"
        is_any_granted_including_appop: false
        is_auto_revoked: false
        is_fixed: false
        is_granted_by_default: false
        is_granted_by_role: false
        is_user_sensitive: true
      }
      groups {
        group_name: "android.permission-group.CONTACTS"
        is_any_granted_including_appop: false
        is_auto_revoked: false
        is_fixed: false
        is_granted_by_default: false
        is_granted_by_role: false
        is_user_sensitive: true
      }
      groups {
        group_name: "android.permission-group.CAMERA"
        is_any_granted_including_appop: false
        is_auto_revoked: false
        is_fixed: false
        is_granted_by_default: false
        is_granted_by_role: false
        is_user_sensitive: true
      }
      groups {
        group_name: "android.permission-group.LOCATION"
        is_any_granted_including_appop: false
        is_auto_revoked: false
        is_fixed: false
        is_granted_by_default: false
        is_granted_by_role: false
        is_user_sensitive: true
      }
      groups {
        group_name: "android.permission-group.MICROPHONE"
        is_any_granted_including_appop: false
        is_auto_revoked: false
        is_fixed: false
        is_granted_by_default: false
        is_granted_by_role: false
        is_user_sensitive: true
      }
      groups {
        group_name: "android.permission-group.PHONE"
        is_any_granted_including_appop: false
        is_auto_revoked: false
        is_fixed: false
        is_granted_by_default: false
        is_granted_by_role: false
        is_user_sensitive: true
      }
      last_time_visible: 0
      package_name: "com.google.android.youtube"
      uid: 10131
    }
    user_id: 0
  }
}
logs: "1602489236550 AutoRevokePermissions:i scheduleAutoRevokePermissions with frequency 1296000000ms and threshold 7776000000ms "
logs: "1602489236552 AutoRevokePermissions:i user 0 is a profile owner. Running Auto Revoke. "
logs: "1602489236561 AutoRevokePermissions:i onStartJob "

```

## PermissionManagerService

```java

/**
 * Manages all permissions and handles permissions related tasks.
 */
public class PermissionManagerService extends IPermissionManager.Stub {

    public static PermissionManagerServiceInternal create(Context context,
            @NonNull Object externalLock) {
        final PermissionManagerServiceInternal permMgrInt =
                LocalServices.getService(PermissionManagerServiceInternal.class);
        if (permMgrInt != null) {
            return permMgrInt;
        }
        PermissionManagerService permissionService =
                (PermissionManagerService) ServiceManager.getService("permissionmgr");
        if (permissionService == null) {
            permissionService =
                    new PermissionManagerService(context, externalLock);
            ServiceManager.addService("permissionmgr", permissionService);
        }
        return LocalServices.getService(PermissionManagerServiceInternal.class);
    }


    @Override
    public void dump(FileDescriptor fd, PrintWriter pw, String[] args) {
        if (!DumpUtils.checkDumpPermission(mContext, TAG, pw)) {
            return;
        }

        mContext.getSystemService(PermissionControllerManager.class).dump(fd, args);
    }

}

```

## PermissionControllerManager

```java

public final class PermissionControllerManager {


    public PermissionControllerManager(@NonNull Context context, @NonNull Handler handler) {
        synchronized (sLock) {
            Pair<Integer, Thread> key = new Pair<>(context.getUserId(),
                    handler.getLooper().getThread());
            ServiceConnector<IPermissionController> remoteService = sRemoteServices.get(key);
            if (remoteService == null) {
                Intent intent = new Intent(SERVICE_INTERFACE);
                intent.setPackage(context.getPackageManager().getPermissionControllerPackageName());
                ResolveInfo serviceInfo = context.getPackageManager().resolveService(intent, 0);
                remoteService = new ServiceConnector.Impl<IPermissionController>(
                        ActivityThread.currentApplication() /* context */,
                        new Intent(SERVICE_INTERFACE)
                                .setComponent(serviceInfo.getComponentInfo().getComponentName()),
                        0 /* bindingFlags */, context.getUserId(),
                        IPermissionController.Stub::asInterface) {

                    @Override
                    protected Handler getJobHandler() {
                        return handler;
                    }

                    @Override
                    protected long getRequestTimeoutMs() {
                        return REQUEST_TIMEOUT_MILLIS;
                    }

                    @Override
                    protected long getAutoDisconnectTimeoutMs() {
                        return UNBIND_TIMEOUT_MILLIS;
                    }
                };
                sRemoteServices.put(key, remoteService);
            }

            mRemoteService = remoteService;
        }

        mContext = context;
        mHandler = handler;
    }

    /**
     * Dump permission controller state.
     *
     * @hide
     */
    public void dump(@NonNull FileDescriptor fd, @Nullable String[] args) {
        try {
            mRemoteService.post(service -> service.asBinder().dump(fd, args))
                    .get(REQUEST_TIMEOUT_MILLIS, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            Log.e(TAG, "Could not get dump", e);
        }
    }

}

```

## PermissionControllerService

```java

public abstract class PermissionControllerService extends Service {

}


// packages/apps/PermissionController/src/com/android/permissioncontroller/permission/service/PermissionControllerServiceImpl.java

public final class PermissionControllerServiceImpl extends PermissionControllerLifecycleService {

    @Override
    public void dump(FileDescriptor fd, PrintWriter writer, String[] args) {
        PermissionControllerDumpProto dump;
        try {
            dump = BuildersKt.runBlocking(
                    GlobalScope.INSTANCE.getCoroutineContext(),
                    (coroutineScope, continuation) -> mServiceModel.onDump(continuation));
        } catch (Exception e) {
            Log.e(LOG_TAG, "Cannot produce dump", e);
            return;
        }

        if (ArrayUtils.contains(args, "--proto")) {
            try (OutputStream out = new FileOutputStream(fd)) {
                dump.writeTo(out);
            } catch (IOException e) {
                Log.e(LOG_TAG, "Cannot write dump", e);
            }
        } else {
            writer.println(dump.toString());
            writer.flush();
        }
    }
}

```

## SystemServiceRegistry

```java

public final class SystemServiceRegistry {

    /**
     * Official published name of the (internal) permission controller service.
     *
     * @see #getSystemService(String)
     * @hide
     */
    public static final String PERMISSION_CONTROLLER_SERVICE = "permission_controller";

    static {

        registerService(Context.PERMISSION_CONTROLLER_SERVICE, PermissionControllerManager.class,
                new CachedServiceFetcher<PermissionControllerManager>() {
                    @Override
                    public PermissionControllerManager createService(ContextImpl ctx) {
                        return new PermissionControllerManager(ctx.getOuterContext(),
                                ctx.getMainThreadHandler());
                    }});

    }

    /**
     * Statically registers a system service with the context.
     * This method must be called during static initialization only.
     */
    private static <T> void registerService(@NonNull String serviceName,
            @NonNull Class<T> serviceClass, @NonNull ServiceFetcher<T> serviceFetcher) {
        SYSTEM_SERVICE_NAMES.put(serviceClass, serviceName);
        SYSTEM_SERVICE_FETCHERS.put(serviceName, serviceFetcher);
        SYSTEM_SERVICE_CLASS_NAMES.put(serviceName, serviceClass.getSimpleName());
    }

}

```

## android 11 权限校验变更

### ContextImpl

```java

class ContextImpl extends Context {

    @Override
    public int checkPermission(String permission, int pid, int uid) {
        if (permission == null) {
            throw new IllegalArgumentException("permission is null");
        }
        return PermissionManager.checkPermission(permission, pid, uid);
    }

}

```

### PermissionManager

```java

public final class PermissionManager {

    /** @hide */
    private static final PropertyInvalidatedCache<PermissionQuery, Integer> sPermissionCache =
            new PropertyInvalidatedCache<PermissionQuery, Integer>(
                    16, CACHE_KEY_PACKAGE_INFO) {
                @Override
                protected Integer recompute(PermissionQuery query) {
                    return checkPermissionUncached(query.permission, query.pid, query.uid);
                }
            };

    /** @hide */
    public static int checkPermission(@Nullable String permission, int pid, int uid) {
        return sPermissionCache.query(new PermissionQuery(permission, pid, uid));
    }


    private static final class PermissionQuery {
        final String permission;
        final int pid;
        final int uid;

        PermissionQuery(@Nullable String permission, int pid, int uid) {
            this.permission = permission;
            this.pid = pid;
            this.uid = uid;
        }
    }

    /* @hide */
    private static int checkPermissionUncached(@Nullable String permission, int pid, int uid) {
        final IActivityManager am = ActivityManager.getService();
        if (am == null) {
            // Well this is super awkward; we somehow don't have an active ActivityManager
            // instance. If we're testing a root or system UID, then they totally have whatever
            // permission this is.
            final int appId = UserHandle.getAppId(uid);
            if (appId == Process.ROOT_UID || appId == Process.SYSTEM_UID) {
                Slog.w(TAG, "Missing ActivityManager; assuming " + uid + " holds " + permission);
                return PackageManager.PERMISSION_GRANTED;
            }
            Slog.w(TAG, "Missing ActivityManager; assuming " + uid + " does not hold "
                    + permission);
            return PackageManager.PERMISSION_DENIED;
        }
        try {
            return am.checkPermission(permission, pid, uid);
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }

}

```

### PropertyInvalidatedCache

```java

public abstract class PropertyInvalidatedCache<Query, Result> {

    private final LinkedHashMap<Query, Result> mCache;

    /**
     * Get a value from the cache or recompute it.
     */
    public Result query(Query query) {

        ------------------------------------------------------------------------------

        for (;;) {

            --------------------------------------------------------------------------

            final Result result = recompute(query);
            synchronized (mLock) {
                // If someone else invalidated the cache while we did the recomputation, don't
                // update the cache with a potentially stale result.
                if (mLastSeenNonce == currentNonce && result != null) {
                    mCache.put(query, result);
                }
                mMisses++;
            }
            return maybeCheckConsistency(query, result);
        }
    }

}

```

### ActivityManagerService

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    @Override
    public int checkPermission(String permission, int pid, int uid) {
        if (permission == null) {
            return PackageManager.PERMISSION_DENIED;
        }
        return checkComponentPermission(permission, pid, uid, -1, true);
    }

    public static int checkComponentPermission(String permission, int pid, int uid,
            int owningUid, boolean exported) {
        if (pid == MY_PID) {
            return PackageManager.PERMISSION_GRANTED;
        }
        // If there is an explicit permission being checked, and this is coming from a process
        // that has been denied access to that permission, then just deny.  Ultimately this may
        // not be quite right -- it means that even if the caller would have access for another
        // reason (such as being the owner of the component it is trying to access), it would still
        // fail.  This also means the system and root uids would be able to deny themselves
        // access to permissions, which...  well okay. ¯\_(ツ)_/¯
        if (permission != null) {
            synchronized (sActiveProcessInfoSelfLocked) {
                ProcessInfo procInfo = sActiveProcessInfoSelfLocked.get(pid);
                if (procInfo != null && procInfo.deniedPermissions != null
                        && procInfo.deniedPermissions.contains(permission)) {
                    return PackageManager.PERMISSION_DENIED;
                }
            }
        }
        return ActivityManager.checkComponentPermission(permission, uid,
                owningUid, exported);
    }

}

```

### ActivityManager

```java

public class ActivityManager {

    /** @hide */
    @UnsupportedAppUsage
    public static int checkComponentPermission(String permission, int uid,
            int owningUid, boolean exported) {

        -------------------------------------------------------------------

        try {
            return AppGlobals.getPackageManager()
                    .checkUidPermission(permission, uid);
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }

}

```

### PackageManagerService

```java

public class PackageManagerService extends IPackageManager.Stub
        implements PackageSender {


    // NOTE: Can't remove without a major refactor. Keep around for now.
    @Override
    public int checkUidPermission(String permName, int uid) {
        try {
            // Because this is accessed via the package manager service AIDL,
            // go through the permission manager service AIDL
            return mPermissionManagerService.checkUidPermission(permName, uid);
        } catch (RemoteException ignore) { }
        return PackageManager.PERMISSION_DENIED;
    }

}

```

### PermissionManagerService

```java

public class PermissionManagerService extends IPermissionManager.Stub {

    @Override
    public int checkUidPermission(String permName, int uid) {
        // Not using Objects.requireNonNull() here for compatibility reasons.
        if (permName == null) {
            return PackageManager.PERMISSION_DENIED;
        }
        final int userId = UserHandle.getUserId(uid);
        if (!mUserManagerInt.exists(userId)) {
            return PackageManager.PERMISSION_DENIED;
        }

        final CheckPermissionDelegate checkPermissionDelegate;
        synchronized (mLock) {
            checkPermissionDelegate = mCheckPermissionDelegate;
        }
        if (checkPermissionDelegate == null)  {
            return checkUidPermissionImpl(permName, uid);
        }
        return checkPermissionDelegate.checkUidPermission(permName, uid,
                this::checkUidPermissionImpl);
    }

}

```

## PMS 数据结构

[Android包管理总结](https://www.jianshu.com/p/f47e45602ad2)

![pms_permission](/images/android/android_r/pms_permission.png)

### Settings

```java

public final class Settings {
    private static final String TAG = "PackageSettings";

    private final File mSettingsFilename;             // data/system/packages.xml
    private final File mBackupSettingsFilename;
    private final File mPackageListFilename;
    private final File mStoppedPackagesFilename;
    private final File mBackupStoppedPackagesFilename;
    /** The top level directory in configfs for sdcardfs to push the package->uid,userId mappings */
    private final File mKernelMappingFilename;

    /** Map from package name to settings */
    final ArrayMap<String, PackageSetting> mPackages = new ArrayMap<>();  // 所有应用的配置信息

    Settings(File dataDir, PermissionSettings permission,
            Object lock) {
        mLock = lock;
        mPermissions = permission;
        mRuntimePermissionsPersistence = new RuntimePermissionPersistence(mLock);

        mSystemDir = new File(dataDir, "system");
        mSystemDir.mkdirs();
        FileUtils.setPermissions(mSystemDir.toString(),
                FileUtils.S_IRWXU|FileUtils.S_IRWXG
                |FileUtils.S_IROTH|FileUtils.S_IXOTH,
                -1, -1);
        mSettingsFilename = new File(mSystemDir, "packages.xml");                           // data/system/packages.xml
        mBackupSettingsFilename = new File(mSystemDir, "packages-backup.xml");
        mPackageListFilename = new File(mSystemDir, "packages.list");
        FileUtils.setPermissions(mPackageListFilename, 0640, SYSTEM_UID, PACKAGE_INFO_GID);

        final File kernelDir = new File("/config/sdcardfs");
        mKernelMappingFilename = kernelDir.exists() ? kernelDir : null;

        // Deprecated: Needed for migration
        mStoppedPackagesFilename = new File(mSystemDir, "packages-stopped.xml");
        mBackupStoppedPackagesFilename = new File(mSystemDir, "packages-stopped-backup.xml");
    }
}

```

### PackageSetting

```java

public class PackageSetting extends PackageSettingBase {

    int appId;

    @Nullable
    public AndroidPackage pkg;
    /**
     * WARNING. The object reference is important. We perform integer equality and NOT
     * object equality to check whether shared user settings are the same.
     */
    SharedUserSetting sharedUser;
    /**
     * Temporary holding space for the shared user ID. While parsing package settings, the
     * shared users tag may come after the packages. In this case, we must delay linking the
     * shared user setting with the package setting. The shared user ID lets us link the
     * two objects.
     */
    private int sharedUserId;

    @VisibleForTesting(visibility = VisibleForTesting.Visibility.PACKAGE)
    public PackageSetting(String name, String realName, File codePath, File resourcePath,
            String legacyNativeLibraryPathString, String primaryCpuAbiString,
            String secondaryCpuAbiString, String cpuAbiOverrideString,
            long pVersionCode, int pkgFlags, int privateFlags,
            int sharedUserId, String[] usesStaticLibraries,
            long[] usesStaticLibrariesVersions, Map<String, ArraySet<String>> mimeGroups) {
        super(name, realName, codePath, resourcePath, legacyNativeLibraryPathString,
                primaryCpuAbiString, secondaryCpuAbiString, cpuAbiOverrideString,
                pVersionCode, pkgFlags, privateFlags,
                usesStaticLibraries, usesStaticLibrariesVersions);
        this.sharedUserId = sharedUserId;
        copyMimeGroups(mimeGroups);
    }

    public boolean isPrivileged() {
        return (pkgPrivateFlags & ApplicationInfo.PRIVATE_FLAG_PRIVILEGED) != 0;
    }

    public boolean isSystem() {
        return (pkgFlags & ApplicationInfo.FLAG_SYSTEM) != 0;
    }

    @Override
    public PermissionsState getPermissionsState() {
        return (sharedUser != null)
                ? sharedUser.getPermissionsState()
                : super.getPermissionsState();
    }

}

```

### PermissionsState

```java

public final class PermissionsState {

    @GuardedBy("mLock")
    private ArrayMap<String, PermissionData> mPermissions;


    // 授权动作在此类中实现
    private static final class PermissionData {

        private final BasePermission mPerm;

        // 多用户权限使用
        @GuardedBy("mLock")
        private SparseArray<PermissionState> mUserStates = new SparseArray<>();


        public boolean isGranted(int userId) {}

        public boolean grant(int userId) {}

        public boolean revoke(int userId) {}

        public PermissionState getPermissionState(int userId) {}

    }

    public static final class PermissionState {
        private final String mName;
        private boolean mGranted;
        private int mFlags;
    }

}

```

## 调试 dumpsys package

```txt

generic_x86_arm:/ $ dumpsys package -h
Package manager dump options:
  [-h] [-f] [--checkin] [--all-components] [cmd] ...
    --checkin: dump for a checkin
    -f: print details of intent filters
    -h: print this help
    --all-components: include all component names in package dump
  cmd may be one of:
    apex: list active APEXes and APEX session state
    l[ibraries]: list known shared libraries
    f[eatures]: list device features
    k[eysets]: print known keysets
    r[esolvers] [activity|service|receiver|content]: dump intent resolvers
    perm[issions]: dump permissions
    permission [name ...]: dump declaration and use of given permission
    pref[erred]: print preferred package settings
    preferred-xml [--full]: print preferred package settings as xml
    prov[iders]: dump content providers
    p[ackages]: dump installed packages
    q[ueries]: dump app queryability calculations
    s[hared-users]: dump shared user IDs
    m[essages]: print collected runtime messages
    v[erifiers]: print package verifier info
    d[omain-preferred-apps]: print domains preferred apps
    i[ntent-filter-verifiers]|ifv: print intent filter verifier info
    version: print database version info
    write: write current settings now
    installs: details about install sessions
    check-permission <permission> <package> [<user>]: does pkg hold perm?
    dexopt: dump dexopt state
    compiler-stats: dump compiler statistics
    service-permissions: dump permissions required by services
    <package.name>: info about given package

```

## dumpsys package packagename

```txt

generic_x86_arm:/ $ dumpsys package com.sunmi.displaydemo
Activity Resolver Table:
  Non-Data Actions:
      android.intent.action.MAIN:
        65c8be5 com.sunmi.displaydemo/.MainActivity filter 2586ba
          Action: "android.intent.action.MAIN"
          Category: "android.intent.category.LAUNCHER"

Key Set Manager:
  [com.sunmi.displaydemo]
      Signing KeySets: 33

Packages:
  Package [com.sunmi.displaydemo] (368e481):
    userId=10152
    pkg=Package{60ec926 com.sunmi.displaydemo}
    codePath=/data/app/~~DBqq7mV3srVVGpM_fd20wQ==/com.sunmi.displaydemo-cTBH9g95Necb_htjCdQlOg==
    resourcePath=/data/app/~~DBqq7mV3srVVGpM_fd20wQ==/com.sunmi.displaydemo-cTBH9g95Necb_htjCdQlOg==
    legacyNativeLibraryDir=/data/app/~~DBqq7mV3srVVGpM_fd20wQ==/com.sunmi.displaydemo-cTBH9g95Necb_htjCdQlOg==/lib
    primaryCpuAbi=null
    secondaryCpuAbi=null
    versionCode=1 minSdk=29 targetSdk=30
    versionName=1.0
    splits=[base]
    apkSigningVersion=2
    applicationInfo=ApplicationInfo{60ec926 com.sunmi.displaydemo}
    flags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA TEST_ONLY ALLOW_BACKUP ]
    privateFlags=[ PRIVATE_FLAG_ACTIVITIES_RESIZE_MODE_RESIZEABLE_VIA_SDK_VERSION ALLOW_AUDIO_PLAYBACK_CAPTURE PRIVATE_FLAG_ALLOW_NATIVE_HEAP_POINTER_TAGGING ]
    forceQueryable=false
    queriesPackages=[]
    dataDir=/data/user/0/com.sunmi.displaydemo
    supportsScreens=[small, medium, large, xlarge, resizeable, anyDensity]
    timeStamp=2020-10-13 09:51:33
    firstInstallTime=2020-10-13 09:51:33
    lastUpdateTime=2020-10-13 09:51:33
    signatures=PackageSignatures{ef96967 version:2, signatures:[acbaf040], past signatures:[]}
    installPermissionsFixed=true
    pkgFlags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA TEST_ONLY ALLOW_BACKUP ]
    requested permissions:
      android.permission.CAMERA
      android.permission.ACCESS_BACKGROUND_LOCATION: restricted=true
      android.permission.ACCESS_COARSE_LOCATION
      android.permission.ACCESS_FINE_LOCATION
    User 0: ceDataInode=131478 installed=true hidden=false suspended=false distractionFlags=0 stopped=false notLaunched=false enabled=0 instant=false virtual=false
      runtime permissions:
        android.permission.ACCESS_FINE_LOCATION: granted=false, flags=[ USER_SENSITIVE_WHEN_GRANTED|USER_SENSITIVE_WHEN_DENIED|ONE_TIME]
        android.permission.ACCESS_COARSE_LOCATION: granted=false, flags=[ USER_SENSITIVE_WHEN_GRANTED|USER_SENSITIVE_WHEN_DENIED|ONE_TIME]
        android.permission.CAMERA: granted=false, flags=[ USER_SENSITIVE_WHEN_GRANTED|USER_SENSITIVE_WHEN_DENIED|ONE_TIME]
        android.permission.ACCESS_BACKGROUND_LOCATION: granted=false, flags=[ USER_SET|USER_SENSITIVE_WHEN_GRANTED|USER_SENSITIVE_WHEN_DENIED|RESTRICTION_INSTALLER_EXEMPT]

Queries:
  system apps queryable: false
  queries via package name:
  queries via intent:
  queryable via interaction:
    User 0:
      [com.android.localtransport,com.android.location.fused,com.android.wallpaperbackup,com.android.settings,com.android.keychain,com.android.providers.settings,com.android.inputdevices,com.android.server.telecom,android,com.android.dynsystem,com.android.emulator.multidisplay]:
        com.sunmi.displaydemo
      com.google.android.inputmethod.latin:
        com.sunmi.displaydemo
      com.google.android.permissioncontroller:
        com.sunmi.displaydemo

Package Changes:
  Sequence number=479
  User 0:
    seq=0, package=com.google.android.permissioncontroller
    seq=1, package=com.android.systemui
    seq=4, package=com.google.android.cellbroadcastreceiver
    seq=114, package=com.google.android.dialer
    seq=116, package=com.google.android.sdksetup
    seq=117, package=com.google.android.inputmethod.latin
    seq=124, package=com.google.android.youtube
    seq=139, package=com.google.android.music
    seq=276, package=com.google.android.partnersetup
    seq=380, package=com.google.android.gsf
    seq=386, package=com.google.android.calendar
    seq=388, package=com.android.camera2
    seq=389, package=com.google.android.apps.docs
    seq=413, package=com.android.nfc
    seq=417, package=com.android.stk
    seq=419, package=com.android.traceur
    seq=420, package=com.google.android.apps.maps
    seq=430, package=com.google.android.apps.photos
    seq=432, package=com.android.vending
    seq=447, package=com.google.android.apps.enterprise.dmagent
    seq=455, package=com.google.android.projection.gearhead
    seq=456, package=com.google.android.setupwizard
    seq=461, package=com.google.android.videos
    seq=462, package=com.google.android.apps.messaging
    seq=471, package=com.android.settings
    seq=472, package=com.google.android.gm
    seq=473, package=com.google.android.gms
    seq=474, package=com.google.android.googlequicksearchbox
    seq=478, package=com.sunmi.displaydemo


Dexopt state:
  [com.sunmi.displaydemo]
    path: /data/app/~~DBqq7mV3srVVGpM_fd20wQ==/com.sunmi.displaydemo-cTBH9g95Necb_htjCdQlOg==/base.apk
      x86: [status=run-from-apk] [reason=unknown]


Compiler stats:
  [com.sunmi.displaydemo]
    (No recorded stats)

APEX session state:

Active APEX packages:


Inactive APEX packages:


Factory APEX packages:

```







