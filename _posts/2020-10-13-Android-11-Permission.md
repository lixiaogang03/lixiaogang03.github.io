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
