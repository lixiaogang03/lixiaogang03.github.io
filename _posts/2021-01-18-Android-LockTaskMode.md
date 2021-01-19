---
layout:     post
title:      Android Lock Task Mode
subtitle:   锁定任务模式
date:       2021-01-18
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - android
---

[lock-task-mode-Google](https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode)

[KioskMode-Android-Github](https://github.com/derohimat/KioskMode-Android)

## DeviceOwner

adb shell dpm set-device-owner net.derohimat.kioskmodesample/.AdminReceiver

## App

```java

public class BaseActivity extends AppCompatActivity {

    protected void setUpAdmin() {
        if (true) {
            ComponentName deviceAdmin = new ComponentName(this, AdminReceiver.class);
            mDpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
            if (!mDpm.isAdminActive(deviceAdmin)) {
                Log.e("Kiosk Mode Error", getString(R.string.not_device_admin));
            }

            if (mDpm.isDeviceOwnerApp(getPackageName())) {
                mDpm.setLockTaskPackages(deviceAdmin, new String[]{getPackageName()});
            } else {
                Log.e("Kiosk Mode Error", getString(R.string.not_device_owner));
            }

            enableKioskMode(true);
        }

        mDecorView = getWindow().getDecorView();
        hideSystemUI();
    }

    protected void enableKioskMode(boolean enabled) {
        try {
            if (enabled) {
                if (mDpm.isLockTaskPermitted(this.getPackageName())) {
                    startLockTask();
                } else {
                    Log.e("Kiosk Mode Error", getString(R.string.kiosk_not_permitted));
                }
            } else {
                stopLockTask();
            }
        } catch (Exception e) {
            Log.e("Kiosk Mode Error", e.getMessage());
        }
    }

    protected void hideSystemUI() {
        mDecorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION // hide nav bar
                        | View.SYSTEM_UI_FLAG_FULLSCREEN // hide status bar
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

}

```

## data/system/device_policies.xml

```txt

1|qssi:/ # cat data/system/device_policies.xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<policies setup-complete="true" provisioning-state="3">
<admin name="com.***.remotecontrol.pro/com.***.remotecontrol.receiver.MyAdminReceiver">
<policies flags="991" />
<strong-auth-unlock-timeout value="0" />
<cross-profile-calendar-packages />
<cross-profile-packages />
</admin>
<admin name="net.derohimat.kioskmodesample/net.derohimat.kioskmodesample.AdminReceiver">
<policies flags="0" />
<strong-auth-unlock-timeout value="0" />
<test-only-admin value="true" />
<cross-profile-calendar-packages />
<cross-profile-packages />
</admin>
<lock-task-component name="net.derohimat.kioskmodesample" />
<lock-task-component name="com.sunmi.superpermissiontest" />
<lock-task-component name="com.android.settings" />
<lock-task-features value="16" />
</policies>

```

## DevicePolicyManagerService

```java

public class DevicePolicyManagerService extends BaseIDevicePolicyManager {

    /**
     * Sets which packages may enter lock task mode.
     * <p>
     * Any packages that share uid with an allowed package will also be allowed to activate lock
     * task. From {@link android.os.Build.VERSION_CODES#M} removing packages from the lock task
     * package list results in locked tasks belonging to those packages to be finished.
     * <p>
     * This function can only be called by the device owner, a profile owner of an affiliated user
     * or profile, or the profile owner when no device owner is set. See {@link #isAffiliatedUser}.
     * Any package set via this method will be cleared if the user becomes unaffiliated.
     *
     * @param packages The list of packages allowed to enter lock task mode
     * @param admin Which {@link DeviceAdminReceiver} this request is associated with.
     * @throws SecurityException if {@code admin} is not the device owner, the profile owner of an
     * affiliated user or profile, or the profile owner when no device owner is set.
     * @see #isAffiliatedUser
     * @see Activity#startLockTask()
     * @see DeviceAdminReceiver#onLockTaskModeEntering(Context, Intent, String)
     * @see DeviceAdminReceiver#onLockTaskModeExiting(Context, Intent)
     * @see UserManager#DISALLOW_CREATE_WINDOWS
     */
    @Override
    public void setLockTaskPackages(ComponentName who, String[] packages)
            throws SecurityException {
        Objects.requireNonNull(who, "ComponentName is null");
        Objects.requireNonNull(packages, "packages is null");

        synchronized (getLockObject()) {
            enforceCanCallLockTaskLocked(who);
            final int userHandle = mInjector.userHandleGetCallingUserId();
            setLockTaskPackagesLocked(userHandle, new ArrayList<>(Arrays.asList(packages)));
        }
    }

    private void setLockTaskPackagesLocked(int userHandle, List<String> packages) {
        DevicePolicyData policy = getUserData(userHandle);
        policy.mLockTaskPackages = packages;

        // Store the settings persistently.
        saveSettingsLocked(userHandle);
        updateLockTaskPackagesLocked(packages, userHandle);
    }

    /**
     * This function lets the caller know whether the given component is allowed to start the
     * lock task mode.
     * @param pkg The package to check
     */
    @Override
    public boolean isLockTaskPermitted(String pkg) {
        final int userHandle = mInjector.userHandleGetCallingUserId();
        synchronized (getLockObject()) {
            return getUserData(userHandle).mLockTaskPackages.contains(pkg);
        }
    }

    public static class DevicePolicyData {

        // This is the list of component allowed to start lock task mode.
        List<String> mLockTaskPackages = new ArrayList<>();

    }

}

```

## Activity

```java

    /**
     * Request to put this activity in a mode where the user is locked to a restricted set of
     * applications.
     *
     * <p>If {@link DevicePolicyManager#isLockTaskPermitted(String)} returns {@code true}
     * for this component, the current task will be launched directly into LockTask mode. Only apps
     * whitelisted by {@link DevicePolicyManager#setLockTaskPackages(ComponentName, String[])} can
     * be launched while LockTask mode is active. The user will not be able to leave this mode
     * until this activity calls {@link #stopLockTask()}. Calling this method while the device is
     * already in LockTask mode has no effect.
     *
     * <p>Otherwise, the current task will be launched into screen pinning mode. In this case, the
     * system will prompt the user with a dialog requesting permission to use this mode.
     * The user can exit at any time through instructions shown on the request dialog. Calling
     * {@link #stopLockTask()} will also terminate this mode.
     *
     * <p><strong>Note:</strong> this method can only be called when the activity is foreground.
     * That is, between {@link #onResume()} and {@link #onPause()}.
     *
     * @see #stopLockTask()
     * @see android.R.attr#lockTaskMode
     */
    public void startLockTask() {
        try {
            ActivityTaskManager.getService().startLockTaskModeByToken(mToken);
        } catch (RemoteException e) {
        }
    }

    /**
     * Stop the current task from being locked.
     *
     * <p>Called to end the LockTask or screen pinning mode started by {@link #startLockTask()}.
     * This can only be called by activities that have called {@link #startLockTask()} previously.
     *
     * <p><strong>Note:</strong> If the device is in LockTask mode that is not initially started
     * by this activity, then calling this method will not terminate the LockTask mode, but only
     * finish its own task. The device will remain in LockTask mode, until the activity which
     * started the LockTask mode calls this method, or until its whitelist authorization is revoked
     * by {@link DevicePolicyManager#setLockTaskPackages(ComponentName, String[])}.
     *
     * @see #startLockTask()
     * @see android.R.attr#lockTaskMode
     * @see ActivityManager#getLockTaskModeState()
     */
    public void stopLockTask() {
        try {
            ActivityTaskManager.getService().stopLockTaskModeByToken(mToken);
        } catch (RemoteException e) {
        }
    }

```

## ActivityTaskManagerService

```java

/**
 * System service for managing activities and their containers (task, stacks, displays,... ).
 *
 * {@hide}
 */
public class ActivityTaskManagerService extends IActivityTaskManager.Stub {

    @Override
    public void startLockTaskModeByToken(IBinder token) {
        synchronized (mGlobalLock) {
            final ActivityRecord r = ActivityRecord.forTokenLocked(token);
            if (r == null) {
                return;
            }
            startLockTaskModeLocked(r.getTask(), false /* isSystemCaller */);
        }
    }

    @Override
    public void startSystemLockTaskMode(int taskId) {
        mAmInternal.enforceCallingPermission(MANAGE_ACTIVITY_STACKS, "startSystemLockTaskMode");
        // This makes inner call to look as if it was initiated by system.
        long ident = Binder.clearCallingIdentity();
        try {
            synchronized (mGlobalLock) {
                final Task task = mRootWindowContainer.anyTaskForId(taskId,
                        MATCH_TASK_IN_STACKS_ONLY);
                if (task == null) {
                    return;
                }

                // When starting lock task mode the stack must be in front and focused
                task.getStack().moveToFront("startSystemLockTaskMode");
                startLockTaskModeLocked(task, true /* isSystemCaller */);
            }
        } finally {
            Binder.restoreCallingIdentity(ident);
        }
    }

    private void startLockTaskModeLocked(@Nullable Task task, boolean isSystemCaller) {
        if (DEBUG_LOCKTASK) Slog.w(TAG_LOCKTASK, "startLockTaskModeLocked: " + task);
        if (task == null || task.mLockTaskAuth == LOCK_TASK_AUTH_DONT_LOCK) {
            return;
        }

        final ActivityStack stack = mRootWindowContainer.getTopDisplayFocusedStack();
        if (stack == null || task != stack.getTopMostTask()) {
            throw new IllegalArgumentException("Invalid task, not in foreground");
        }

        // {@code isSystemCaller} is used to distinguish whether this request is initiated by the
        // system or a specific app.
        // * System-initiated requests will only start the pinned mode (screen pinning)
        // * App-initiated requests
        //   - will put the device in fully locked mode (LockTask), if the app is whitelisted
        //   - will start the pinned mode, otherwise
        final int callingUid = Binder.getCallingUid();
        long ident = Binder.clearCallingIdentity();
        try {
            // When a task is locked, dismiss the pinned stack if it exists
            mRootWindowContainer.removeStacksInWindowingModes(WINDOWING_MODE_PINNED);

            getLockTaskController().startLockTaskMode(task, isSystemCaller, callingUid);
        } finally {
            Binder.restoreCallingIdentity(ident);
        }
    }

}

```

## ActivityManager

```java

public class ActivityManager {

    /**
     * Lock task mode is not active.
     */
    public static final int LOCK_TASK_MODE_NONE = 0;

    /**
     * Full lock task mode is active.
     */
    public static final int LOCK_TASK_MODE_LOCKED = 1;      // 任务锁定

    /**
     * App pinning mode is active.
     */
    public static final int LOCK_TASK_MODE_PINNED = 2;      // 屏幕固定

}

```

## LockTaskController

```java

/**
 * Helper class that deals with all things related to task locking. This includes the screen pinning
 * mode that can be launched via System UI as well as the fully locked mode that can be achieved
 * on fully managed devices.
 *
 * Note: All methods in this class should only be called with the ActivityTaskManagerService lock
 * held.
 *
 * @see Activity#startLockTask()
 * @see Activity#stopLockTask()
 */
public class LockTaskController {

    /**
     * Method to start lock task mode on a given task.
     *
     * @param task the task that should be locked.
     * @param isSystemCaller indicates whether this request was initiated by the system via
     *                       {@link ActivityTaskManagerService#startSystemLockTaskMode(int)}. If
     *                       {@code true}, this intends to start pinned mode; otherwise, we look
     *                       at the calling task's mLockTaskAuth to decide which mode to start.
     * @param callingUid the caller that requested the launch of lock task mode.
     */
    void startLockTaskMode(@NonNull Task task, boolean isSystemCaller, int callingUid) {
        if (!isSystemCaller) {
            task.mLockTaskUid = callingUid;
            if (task.mLockTaskAuth == LOCK_TASK_AUTH_PINNABLE) {
                // startLockTask() called by app, but app is not part of lock task whitelist. Show
                // app pinning request. We will come back here with isSystemCaller true.
                if (DEBUG_LOCKTASK) Slog.w(TAG_LOCKTASK, "Mode default, asking user");
                StatusBarManagerInternal statusBarManager = LocalServices.getService(
                        StatusBarManagerInternal.class);
                if (statusBarManager != null) {
                    statusBarManager.showScreenPinningRequest(task.mTaskId);
                }
                return;
            }
        }

        // System can only initiate screen pinning, not full lock task mode
        if (DEBUG_LOCKTASK) Slog.w(TAG_LOCKTASK,
                isSystemCaller ? "Locking pinned" : "Locking fully");
        setLockTaskMode(task, isSystemCaller ? LOCK_TASK_MODE_PINNED : LOCK_TASK_MODE_LOCKED,
                "startLockTask", true);
    }

}

```

## 跳转拦截日志

```txt

// BACK 按键
2021-01-19 15:43:30.184 1725-3229/system_process I/ActivityTaskManager: Not finishing task in lock task mode

// HOME 按键
2021-01-19 15:43:40.834 1725-1948/system_process I/ActivityTaskManager: START u0 {act=android.intent.action.MAIN cat=[android.intent.category.HOME] flg=0x10000100 cmp=com.android.launcher3/.uioverrides.QuickstepLauncher (has extras)} from uid 0
2021-01-19 15:43:40.837 1725-1948/system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag falsestateINITIALIZING
2021-01-19 15:43:40.839 1725-1948/system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag truestateINITIALIZING
2021-01-19 15:43:40.843 1725-1948/system_process E/ActivityTaskManager: Attempted Lock Task Mode violation mStartActivity=ActivityRecord{6b12f3a u0 com.android.launcher3/.uioverrides.QuickstepLauncher

// RECENT 按键
2021-01-19 15:44:36.328 1725-2128/system_process I/ActivityTaskManager: START u0 {act=android.intent.action.MAIN cat=[android.intent.category.HOME] flg=0x10000000 pkg=com.android.launcher3 cmp=com.android.launcher3/.uioverrides.QuickstepLauncher (has extras)} from uid 10131
2021-01-19 15:44:36.331 1725-2128/system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag falsestateINITIALIZING
2021-01-19 15:44:36.333 1725-2128/system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag truestateINITIALIZING
2021-01-19 15:44:36.337 1725-2128/system_process E/ActivityTaskManager: Attempted Lock Task Mode violation mStartActivity=ActivityRecord{f5ac1f4 u0 com.android.launcher3/.uioverrides.QuickstepLauncher

// 应用内界面跳转
2021-01-19 15:46:25.125 1725-2128/system_process W/ActivityTaskManager_LockTask: Locking fully
2021-01-19 15:46:25.125 1725-2128/system_process W/ActivityTaskManager_LockTask: setLockTaskMode: Locking to Task{93f4523 #129 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=129 sz=2} Callers=com.android.server.wm.LockTaskController.startLockTaskMode:574 com.android.server.wm.ActivityStackSupervisor.realStartActivityLocked:839 com.android.server.wm.ActivityStackSupervisor.startSpecificActivity:1020 com.android.server.wm.ActivityStack.resumeTopActivityInnerLocked:2018

// 应用外界面跳转(跳转到设置)
2021-01-19 15:47:25.222 1725-2448/system_process I/ActivityTaskManager: START u0 {act=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS flg=0x10008000 cmp=com.android.settings/.Settings$HighPowerApplicationsActivity} from uid 10170
2021-01-19 15:47:25.245 1725-2448/system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=0} mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
2021-01-19 15:47:25.249 1725-2448/system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=1} mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
2021-01-19 15:47:25.277 1725-2860/system_process W/ActivityTaskManager_LockTask: Locking fully
2021-01-19 15:47:25.277 1725-2860/system_process W/ActivityTaskManager_LockTask: setLockTaskMode: Locking to Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=1} Callers=com.android.server.wm.LockTaskController.startLockTaskMode:574 com.android.server.wm.ActivityStackSupervisor.realStartActivityLocked:839 com.android.server.wm.ActivityStackSupervisor.startSpecificActivity:1020 com.android.server.wm.ActivityStack.resumeTopActivityInnerLocked:2018
// 从设置界面返回
2021-01-19 15:48:33.914 1725-2128/system_process D/ActivityTaskManager_LockTask: removeLockedTask: removed Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=1}

// 跳转到界面选择界面
2021-01-19 15:49:35.344 1725-2127/system_process I/ActivityTaskManager: START u0 {act=android.intent.action.CHOOSER cmp=android/com.android.internal.app.ChooserActivity (has extras)} from uid 10170
2021-01-19 15:49:35.368 1725-2127/system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{93f4523 #129 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=129 sz=2} mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
2021-01-19 15:49:35.531 1725-2127/system_process W/ActivityTaskManager_LockTask: Locking fully
2021-01-19 15:49:35.531 1725-2127/system_process W/ActivityTaskManager_LockTask: setLockTaskMode: Locking to Task{93f4523 #129 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=129 sz=2} Callers=com.android.server.wm.LockTaskController.startLockTaskMode:574 com.android.server.wm.ActivityStackSupervisor.realStartActivityLocked:839 com.android.server.wm.RootWindowContainer.startActivityForAttachedApplicationIfNeeded:1965 com.android.server.wm.RootWindowContainer.lambda$5fbF65VSmaJkPHxEhceOGTat7JE:0

// 从界面选择跳转到短信
2021-01-19 15:52:32.850 1725-7320/system_process I/ActivityTaskManager: START u0 {act=android.intent.action.SEND typ=text/plain flg=0xb080001 cmp=com.android.mms/.ui.ComposeMessageActivity clip={text/plain {...}} (has extras)} from uid 10170
2021-01-19 15:52:32.869 1725-7320/system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{794d482 #132 visible=false type=standard mode=fullscreen translucent=true A=10119:android.task.mms U=0 StackId=132 sz=0} mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE
2021-01-19 15:52:32.872 1725-7320/system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{794d482 #132 visible=false type=standard mode=fullscreen translucent=true A=10119:android.task.mms U=0 StackId=132 sz=1} mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE
2021-01-19 15:52:32.873 1725-7320/system_process E/ActivityTaskManager: Attempted Lock Task Mode violation mStartActivity=ActivityRecord{1aa4793 u0 com.android.mms/.ui.ComposeMessageActivity t132}

```


