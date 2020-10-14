---
layout:     post
title:      Android 11 Permission
subtitle:   PermissionPolicyService
date:       2020-10-13
author:     LXG
header-img: img/home-bg-geek.jpg
catalog: true
tags:
    - android
---

## 类图

![android_r_permission_2](/images/android_r/android_r_permission_2.png)

## 时序图

![android_r_permission_1](/images/android_r/android_r_permission_1.png)

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






