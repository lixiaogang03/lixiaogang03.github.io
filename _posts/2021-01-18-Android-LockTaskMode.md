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

## App 代码

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

## DevicePolicyManagerService

**data/system/device_policies.xml**

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

**DevicePolicyManager**

<lock-task-features value="16" />

```java

public class DevicePolicyManager {

    /**
     * Disable all configurable SystemUI features during LockTask mode. This includes,
     * <ul>
     *     <li>system info area in the status bar (connectivity icons, clock, etc.)
     *     <li>notifications (including alerts, icons, and the notification shade)
     *     <li>Home button
     *     <li>Recents button and UI
     *     <li>global actions menu (i.e. power button menu)
     *     <li>keyguard
     * </ul>
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_NONE = 0;

    /**
     * Enable the system info area in the status bar during LockTask mode. The system info area
     * usually occupies the right side of the status bar (although this can differ across OEMs). It
     * includes all system information indicators, such as date and time, connectivity, battery,
     * vibration mode, etc.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_SYSTEM_INFO = 1;        // 状态栏显示 1

    /**
     * Enable notifications during LockTask mode. This includes notification icons on the status
     * bar, heads-up notifications, and the expandable notification shade. Note that the Quick
     * Settings panel remains disabled. This feature flag can only be used in combination with
     * {@link #LOCK_TASK_FEATURE_HOME}. {@link #setLockTaskFeatures(ComponentName, int)}
     * throws an {@link IllegalArgumentException} if this feature flag is defined without
     * {@link #LOCK_TASK_FEATURE_HOME}.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_NOTIFICATIONS = 1 << 1;  // 通知显示 2

    /**
     * Enable the Home button during LockTask mode. Note that if a custom launcher is used, it has
     * to be registered as the default launcher with
     * {@link #addPersistentPreferredActivity(ComponentName, IntentFilter, ComponentName)}, and its
     * package needs to be whitelisted for LockTask with
     * {@link #setLockTaskPackages(ComponentName, String[])}.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_HOME = 1 << 2;           // Home按钮 4

    /**
     * Enable the Overview button and the Overview screen during LockTask mode. This feature flag
     * can only be used in combination with {@link #LOCK_TASK_FEATURE_HOME}, and
     * {@link #setLockTaskFeatures(ComponentName, int)} will throw an
     * {@link IllegalArgumentException} if this feature flag is defined without
     * {@link #LOCK_TASK_FEATURE_HOME}.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_OVERVIEW = 1 << 3;       // 8

    /**
     * Enable the global actions dialog during LockTask mode. This is the dialog that shows up when
     * the user long-presses the power button, for example. Note that the user may not be able to
     * power off the device if this flag is not set.
     *
     * <p>This flag is enabled by default until {@link #setLockTaskFeatures(ComponentName, int)} is
     * called for the first time.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_GLOBAL_ACTIONS = 1 << 4;  // 16

    /**
     * Enable the keyguard during LockTask mode. Note that if the keyguard is already disabled with
     * {@link #setKeyguardDisabled(ComponentName, boolean)}, setting this flag will have no effect.
     * If this flag is not set, the keyguard will not be shown even if the user has a lock screen
     * credential.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_KEYGUARD = 1 << 5;        // 32

    /**
     * Enable blocking of non-whitelisted activities from being started into a locked task.
     *
     * @see #setLockTaskFeatures(ComponentName, int)
     */
    public static final int LOCK_TASK_FEATURE_BLOCK_ACTIVITY_START_IN_TASK = 1 << 6;   // 64

    /**
     * Flags supplied to {@link #setLockTaskFeatures(ComponentName, int)}.
     *
     * @hide
     */
    @Retention(RetentionPolicy.SOURCE)
    @IntDef(flag = true, prefix = { "LOCK_TASK_FEATURE_" }, value = {
            LOCK_TASK_FEATURE_NONE,
            LOCK_TASK_FEATURE_SYSTEM_INFO,
            LOCK_TASK_FEATURE_NOTIFICATIONS,
            LOCK_TASK_FEATURE_HOME,
            LOCK_TASK_FEATURE_OVERVIEW,
            LOCK_TASK_FEATURE_GLOBAL_ACTIONS,
            LOCK_TASK_FEATURE_KEYGUARD,
            LOCK_TASK_FEATURE_BLOCK_ACTIVITY_START_IN_TASK
    })
    public @interface LockTaskFeature {}

}

```

**DevicePolicyManagerService**

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

## ActivityTaskManagerService

![lock_task_controller](/images/ams/lock_task_controller.png)

**Activity**

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

**ActivityTaskManagerService**

```java

/**
 * System service for managing activities and their containers (task, stacks, displays,... ).
 *
 * {@hide}
 */
public class ActivityTaskManagerService extends IActivityTaskManager.Stub {

    private LockTaskController mLockTaskController;

    public void initialize(IntentFirewall intentFirewall, PendingIntentController intentController,
            Looper looper) {

        mLockTaskController = new LockTaskController(mContext, mStackSupervisor, mH);

    }

    public void setWindowManager(WindowManagerService wm) {
        synchronized (mGlobalLock) {
            mLockTaskController.setWindowManager(wm);
        }
    }

    LockTaskController getLockTaskController() {
        return mLockTaskController;
    }

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

**ActivityManager**

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

**Task**

```java

class Task extends WindowContainer<WindowContainer> {

    /** Can't be put in lockTask mode. */
    // 无法设置为locktask Mode
    final static int LOCK_TASK_AUTH_DONT_LOCK = 0;

    /** Can enter app pinning with user approval. Can never start over existing lockTask task. */
    // 屏幕固定
    final static int LOCK_TASK_AUTH_PINNABLE = 1;

    // 可以从locktask跳转出来
    /** Starts in LOCK_TASK_MODE_LOCKED automatically. Can start over existing lockTask task. */
    final static int LOCK_TASK_AUTH_LAUNCHABLE = 2;

    // 可以从locktask跳转出来
    /** Can enter lockTask without user approval. Can start over existing lockTask task. */
    final static int LOCK_TASK_AUTH_WHITELISTED = 3;

    // 可以从locktask跳转出来
    /** Priv-app that starts in LOCK_TASK_MODE_LOCKED automatically. Can start over existing
     * lockTask task. */
    final static int LOCK_TASK_AUTH_LAUNCHABLE_PRIV = 4;

    int mLockTaskAuth = LOCK_TASK_AUTH_PINNABLE;

    int mLockTaskUid = -1;  // The uid of the application that called startLockTask().

}

```

**LockTaskController**

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
system_process I/ActivityTaskManager: Not finishing task in lock task mode

// HOME 按键
system_process I/ActivityTaskManager: START u0 {act=android.intent.action.MAIN cat=[android.intent.category.HOME] flg=0x10000100 cmp=com.android.launcher3/.uioverrides.QuickstepLauncher (has extras)} from uid 0
system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag falsestateINITIALIZING
system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag truestateINITIALIZING
system_process E/ActivityTaskManager: Attempted Lock Task Mode violation mStartActivity=ActivityRecord{6b12f3a u0 com.android.launcher3/.uioverrides.QuickstepLauncher

// RECENT 按键
system_process I/ActivityTaskManager: START u0 {act=android.intent.action.MAIN cat=[android.intent.category.HOME] flg=0x10000000 pkg=com.android.launcher3 cmp=com.android.launcher3/.uioverrides.QuickstepLauncher (has extras)} from uid 10131
system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag falsestateINITIALIZING
system_process V/ActivityTaskManager: Calling mServicetracker.OnActivityStateChange with flag truestateINITIALIZING
system_process E/ActivityTaskManager: Attempted Lock Task Mode violation mStartActivity=ActivityRecord{f5ac1f4 u0 com.android.launcher3/.uioverrides.QuickstepLauncher

// 应用内界面跳转
system_process W/ActivityTaskManager_LockTask: Locking fully
system_process W/ActivityTaskManager_LockTask: setLockTaskMode: Locking to Task{93f4523 #129 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=129 sz=2} Callers=com.android.server.wm.LockTaskController.startLockTaskMode:574 com.android.server.wm.ActivityStackSupervisor.realStartActivityLocked:839 com.android.server.wm.ActivityStackSupervisor.startSpecificActivity:1020 com.android.server.wm.ActivityStack.resumeTopActivityInnerLocked:2018

// 应用外界面跳转(跳转到设置)
system_process I/ActivityTaskManager: START u0 {act=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS flg=0x10008000 cmp=com.android.settings/.Settings$HighPowerApplicationsActivity} from uid 10170
system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=0} mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=1} mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
system_process W/ActivityTaskManager_LockTask: Locking fully
system_process W/ActivityTaskManager_LockTask: setLockTaskMode: Locking to Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=1} Callers=com.android.server.wm.LockTaskController.startLockTaskMode:574 com.android.server.wm.ActivityStackSupervisor.realStartActivityLocked:839 com.android.server.wm.ActivityStackSupervisor.startSpecificActivity:1020 com.android.server.wm.ActivityStack.resumeTopActivityInnerLocked:2018
// 从设置界面返回
system_process D/ActivityTaskManager_LockTask: removeLockedTask: removed Task{6d5c429 #131 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=131 sz=1}

// 跳转到界面选择界面
system_process I/ActivityTaskManager: START u0 {act=android.intent.action.CHOOSER cmp=android/com.android.internal.app.ChooserActivity (has extras)} from uid 10170
system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{93f4523 #129 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=129 sz=2} mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
system_process W/ActivityTaskManager_LockTask: Locking fully
system_process W/ActivityTaskManager_LockTask: setLockTaskMode: Locking to Task{93f4523 #129 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=129 sz=2} Callers=com.android.server.wm.LockTaskController.startLockTaskMode:574 com.android.server.wm.ActivityStackSupervisor.realStartActivityLocked:839 com.android.server.wm.RootWindowContainer.startActivityForAttachedApplicationIfNeeded:1965 com.android.server.wm.RootWindowContainer.lambda$5fbF65VSmaJkPHxEhceOGTat7JE:0

// 从界面选择跳转到短信
system_process I/ActivityTaskManager: START u0 {act=android.intent.action.SEND typ=text/plain flg=0xb080001 cmp=com.android.mms/.ui.ComposeMessageActivity clip={text/plain {...}} (has extras)} from uid 10170
system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{794d482 #132 visible=false type=standard mode=fullscreen translucent=true A=10119:android.task.mms U=0 StackId=132 sz=0} mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE
system_process D/ActivityTaskManager_LockTask: setLockTaskAuth: task=Task{794d482 #132 visible=false type=standard mode=fullscreen translucent=true A=10119:android.task.mms U=0 StackId=132 sz=1} mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE
system_process E/ActivityTaskManager: Attempted Lock Task Mode violation mStartActivity=ActivityRecord{1aa4793 u0 com.android.mms/.ui.ComposeMessageActivity t132}

```

## dumpsys activity a

```txt

    * Task{1c1537b #158 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=158 sz=1}
        mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
    * Task{c8d5883 #155 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=155 sz=1}
        mLockTaskAuth=LOCK_TASK_AUTH_WHITELISTED
    * Task{ef1f483 #153 visible=true type=home mode=fullscreen translucent=true I=com.android.launcher3/.uioverrides.QuickstepLauncher U=0 StackId=1 sz=1}
        mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE

  LockTaskController:
    mLockTaskModeState=LOCKED
    mLockTaskModeTasks=
      #0 Task{c8d5883 #155 visible=false type=standard mode=fullscreen translucent=true A=10170:com.sunmi.superpermissiontest U=0 StackId=155 sz=1}
      #1 Task{1c1537b #158 visible=false type=standard mode=fullscreen translucent=true A=1000:com.android.settings U=0 StackId=158 sz=1}
    mLockTaskPackages (userId:packages)=
      u0:[net.derohimat.kioskmodesample, com.sunmi.superpermissiontest, com.android.settings]

```


