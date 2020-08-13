---
layout:     post
title:      Android AMS WMS Debug
subtitle:   dumpsys
date:       2020-08-13
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - debug
---

## dumpsys activity -h

```txt

Activity manager dump options:
  [-a] [-c] [-p PACKAGE] [-h] [WHAT] ...
  WHAT may be one of:
    a[ctivities]: activity stack state
    r[recents]: recent activities state
    b[roadcasts] [PACKAGE_NAME] [history [-s]]: broadcast state
    broadcast-stats [PACKAGE_NAME]: aggregated broadcast statistics
    i[ntents] [PACKAGE_NAME]: pending intent state
    p[rocesses] [PACKAGE_NAME]: process state
    o[om]: out of memory management
    perm[issions]: URI permission grant state
    prov[iders] [COMP_SPEC ...]: content provider state
    provider [COMP_SPEC]: provider client-side state
    s[ervices] [COMP_SPEC ...]: service state
    as[sociations]: tracked app associations
    settings: currently applied config settings
    service [COMP_SPEC]: service client-side state
    package [PACKAGE_NAME]: all state related to given package
    all: dump all activities
    top: dump the top activity
  WHAT may also be a COMP_SPEC to dump activities.
  COMP_SPEC may be a component name (com.foo/.myApp),
    a partial substring in a component name, a
    hex object identifier.
  -a: include all available server state.
  -c: include client state.
  -p: limit output to given package.
  --checkin: output checkin format, resetting data.
  --C: output checkin format, not resetting data.
  --proto: output dump in protocol buffer format.
  --autofill: dump just the autofill-related state of an activity

```

## dumpsys window -h

```txt

Window manager dump options:
  [-a] [-h] [cmd] ...
  cmd may be one of:
    l[astanr]: last ANR information
    p[policy]: policy state
    a[animator]: animator state
    s[essions]: active sessions
    surfaces: active surfaces (debugging enabled only)
    d[isplays]: active display contents
    t[okens]: token list
    w[indows]: window list
  cmd may also be a NAME to dump windows.  NAME may
    be a partial substring in a window name, a
    Window hex object identifier, or
    "all" for all windows, or
    "visible" for the visible windows.
    "visible-apps" for the visible app windows.
  -a: include all available server state.
  --proto: output dump in protocol buffer format.

```

## dumpsys activity a

```txt

ACTIVITY MANAGER ACTIVITIES (dumpsys activity activities)
// ActivityDisplay
Display #0 (activities from top to bottom):

  // ActivityStack
  Stack #3: type=standard mode=fullscreen  -------------------------------------StackId
  isSleeping=false
  mBounds=Rect(0, 0 - 0, 0)-----------------------------Stack Bounds
    Task id #5    ----------------------------------------------------------Task id
    mBounds=Rect(0, 0 - 0, 0)---------------------------------------------------------------Task Bounds
    mMinWidth=-1
    mMinHeight=-1
    mLastNonFullscreenBounds=null
    * TaskRecord{73545e7 #5 A=com.android.settings.root U=0 StackId=3 sz=1}
      userId=0 effectiveUid=1000 mCallingUid=u0a39 mUserSetupComplete=true mCallingPackage=com.android.launcher3
      affinity=com.android.settings.root
      intent={act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] flg=0x10200000 cmp=com.android.settings/.Settings}
      origActivity=com.android.settings/.Settings
      realActivity=com.android.settings/.Settings
      autoRemoveRecents=false isPersistable=true numFullscreen=1 activityType=1
      rootWasReset=true mNeverRelinquishIdentity=true mReuseTask=false mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE
      Activities=[ActivityRecord{d784835 u0 com.android.settings/.Settings t5}]
      askedCompatMode=false inRecents=true isAvailable=true
      mRootProcess=ProcessRecord{53fe8a0 15906:com.android.settings/1000}
      stackId=3
      hasBeenVisible=true mResizeMode=RESIZE_MODE_RESIZEABLE_VIA_SDK_VERSION mSupportsPictureInPicture=false isResizeable=true lastActiveTime=253262918 (inactive for 1720s)
      * Hist #0: ActivityRecord{d784835 u0 com.android.settings/.Settings t5}
          packageName=com.android.settings processName=com.android.settings
          launchedFromUid=10039 launchedFromPackage=com.android.launcher3 userId=0
          app=ProcessRecord{53fe8a0 15906:com.android.settings/1000}
          Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] flg=0x10200000 cmp=com.android.settings/.Settings bnds=[1091,125][1353,258] }
          frontOfTask=true task=TaskRecord{73545e7 #5 A=com.android.settings.root U=0 StackId=3 sz=1}
          taskAffinity=com.android.settings.root
          realActivity=com.android.settings/.Settings
          baseDir=/system/priv-app/Settings/Settings.apk
          dataDir=/data/user_de/0/com.android.settings
          -------------------------------------------------------------
          stateNotNeeded=false componentSpecified=true mActivityType=standard
          compat={230dpi always-compat} labelRes=0x7f120b7a icon=0x7f08011f theme=0x7f1301dd
          mLastReportedConfigurations:
           mGlobalConfig={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
                   mBounds=Rect(0, 0 - 1920, 1011)
                   mAppBounds=Rect(0, 0 - 1920, 1011)
                   mWindowingMode=fullscreen
                   mActivityType=undefined
                   } s.7}
           mOverrideConfig={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
                   mBounds=Rect(0, 0 - 1920, 1011)
                   mAppBounds=Rect(0, 0 - 1920, 1011)
                   mWindowingMode=fullscreen
                   mActivityType=standard}
                   s.7}
          CurrentConfiguration={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
                   mBounds=Rect(0, 0 - 1920, 1011)
                   mAppBounds=Rect(0, 0 - 1920, 1011)
                   mWindowingMode=fullscreen
                   mActivityType=standard}
                   s.7}
          taskDescription: label="null" icon=null iconResource=0 iconFilename=/data/system_ce/0/recent_images/5_activity_icon_5688605638.png primaryColor=fff5f5f5
           backgroundColor=fffafafa
           statusBarColor=ffe0e0e0
           navigationBarColor=ffffffff
          launchFailed=false launchCount=1 lastLaunchTime=-28m40s816ms
          haveState=false icicle=null
          state=RESUMED stopped=false delayedResume=false finishing=false
          keysPaused=false inHistory=true visible=true sleeping=false idle=true mStartingWindowState=STARTING_WINDOW_SHOWN
          fullscreen=true noDisplay=false immersive=false launchMode=2
          frozenBeforeDestroy=false forceNewConfig=false
          mActivityType=standard
          waitingVisible=false nowVisible=true lastVisibleTime=-28m40s308ms
          resizeMode=RESIZE_MODE_RESIZEABLE_VIA_SDK_VERSION
          mLastReportedMultiWindowMode=false mLastReportedPictureInPictureMode=false

    Running activities (most recent first):
      TaskRecord{73545e7 #5 A=com.android.settings.root U=0 StackId=3 sz=1}
        Run #0: ActivityRecord{d784835 u0 com.android.settings/.Settings t5}

    mResumedActivity: ActivityRecord{d784835 u0 com.android.settings/.Settings t5}

  Stack #0: type=home mode=fullscreen  --------------------------------------------------HomeStack
  isSleeping=false
  mBounds=Rect(0, 0 - 0, 0)

    Task id #2
    mBounds=Rect(0, 0 - 0, 0)
    mMinWidth=-1
    mMinHeight=-1
    mLastNonFullscreenBounds=null
    * TaskRecord{ec6153e #2 I=com.android.launcher3/.Launcher U=0 StackId=0 sz=1}
      userId=0 effectiveUid=u0a39 mCallingUid=1000 mUserSetupComplete=true mCallingPackage=android
      intent={act=android.intent.action.MAIN cat=[android.intent.category.HOME] flg=0x10000100 cmp=com.android.launcher3/.Launcher}
      realActivity=com.android.launcher3/.Launcher
      autoRemoveRecents=false isPersistable=true numFullscreen=1 activityType=2
      rootWasReset=false mNeverRelinquishIdentity=true mReuseTask=false mLockTaskAuth=LOCK_TASK_AUTH_PINNABLE
      Activities=[ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}]
      askedCompatMode=false inRecents=true isAvailable=true
      mRootProcess=ProcessRecord{e7b8086 2463:com.android.launcher3/u0a39}
      stackId=0
      hasBeenVisible=true mResizeMode=RESIZE_MODE_RESIZEABLE mSupportsPictureInPicture=false isResizeable=true lastActiveTime=253262790 (inactive for 1720s)
      * Hist #0: ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}
          packageName=com.android.launcher3 processName=com.android.launcher3
          launchedFromUid=0 launchedFromPackage=null userId=0
          app=ProcessRecord{e7b8086 2463:com.android.launcher3/u0a39}
          Intent { act=android.intent.action.MAIN cat=[android.intent.category.HOME] flg=0x10000100 cmp=com.android.launcher3/.Launcher }
          frontOfTask=true task=TaskRecord{ec6153e #2 I=com.android.launcher3/.Launcher U=0 StackId=0 sz=1}
          taskAffinity=null
          realActivity=com.android.launcher3/.Launcher
          baseDir=/system/priv-app/Launcher3QuickStep/Launcher3QuickStep.apk
          dataDir=/data/user/0/com.android.launcher3
          stateNotNeeded=true componentSpecified=false mActivityType=home
          compat={230dpi always-compat} labelRes=0x7f110035 icon=0x7f08001b theme=0x7f120002
          mLastReportedConfigurations:
           mGlobalConfig={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
                  mBounds=Rect(0, 0 - 1920, 1011) mAppBounds=Rect(0, 0 - 1920, 1011) mWindowingMode=fullscreen mActivityType=undefined} s.7}
           mOverrideConfig={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
                  mBounds=Rect(0, 0 - 1920, 1011) mAppBounds=Rect(0, 0 - 1920, 1011) mWindowingMode=fullscreen mActivityType=home} s.7}
          CurrentConfiguration={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
                  mBounds=Rect(0, 0 - 1920, 1011) mAppBounds=Rect(0, 0 - 1920, 1011) mWindowingMode=fullscreen mActivityType=home} s.7}
          OverrideConfiguration={0.0 ?mcc?mnc ?localeList ?layoutDir ?swdp ?wdp ?hdp ?density ?lsize ?long ?ldr ?wideColorGamut ?orien ?uimode ?night ?touch ?keyb/?/? ?nav/? winConfig={
                  mBounds=Rect(0, 0 - 0, 0) mAppBounds=null mWindowingMode=undefined mActivityType=home}}
          taskDescription: label="null" icon=null iconResource=0 iconFilename=null primaryColor=fff5f5f5
           backgroundColor=fffafafa
           statusBarColor=0
           navigationBarColor=0
          launchFailed=false launchCount=0 lastLaunchTime=-2d22h48m49s780ms
          haveState=true icicle=Bundle[mParcelledData.dataSize=2416]
          state=STOPPED stopped=true delayedResume=false finishing=false
          keysPaused=false inHistory=true visible=false sleeping=false idle=true mStartingWindowState=STARTING_WINDOW_NOT_SHOWN
          fullscreen=true noDisplay=false immersive=false launchMode=2
          frozenBeforeDestroy=false forceNewConfig=false
          mActivityType=home
          waitingVisible=false nowVisible=false lastVisibleTime=-35m12s837ms
          resizeMode=RESIZE_MODE_RESIZEABLE
          mLastReportedMultiWindowMode=false mLastReportedPictureInPictureMode=false

    Running activities (most recent first):
      TaskRecord{ec6153e #2 I=com.android.launcher3/.Launcher U=0 StackId=0 sz=1}
        Run #0: ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}

    mLastPausedActivity: ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}

// 副屏显示
Display #1 (activities from top to bottom):

  ResumedActivity: ActivityRecord{d784835 u0 com.android.settings/.Settings t5}


  mFocusedStack=ActivityStack{4a55594 stackId=3 type=standard mode=fullscreen visible=true translucent=false, 1 tasks} mLastFocusedStack=ActivityStack{4a55594 stackId=3 type=standard mode=fullscreen visible=true translucent=false, 1 tasks}
  mCurTaskIdForUser={0=5}
  mUserStackInFront={}
  displayId=1 stacks=0
  displayId=0 stacks=2
   mHomeStack=ActivityStack{ed516bb stackId=0 type=home mode=fullscreen visible=false translucent=true, 1 tasks}
  isHomeRecentsComponent=true  KeyguardController:
    mKeyguardShowing=false
    mAodShowing=false
    mKeyguardGoingAway=false
    mOccluded=false
    mDismissingKeyguardActivity=null
    mDismissalRequested=false
    mVisibilityTransactionDepth=0
  LockTaskController
    mLockTaskModeState=NONE
    mLockTaskModeTasks=
    mLockTaskPackages (userId:packages)=
      u0:[]

```

## 代码

### ActivityManagerService

```java

public class ActivityManagerService extends IActivityManager.Stub
        implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

    @Override
    protected void dump(FileDescriptor fd, PrintWriter pw, String[] args) {
        PriorityDump.dump(mPriorityDumper, fd, pw, args);
    }

    /**
     * Wrapper function to print out debug data filtered by specified arguments.
    */
    private void doDump(FileDescriptor fd, PrintWriter pw, String[] args, boolean useProto) {
            if ("activities".equals(cmd) || "a".equals(cmd)) {
                synchronized (this) {
                    dumpActivitiesLocked(fd, pw, args, opti, true, dumpClient, dumpPackage);
                }
            }
    }

    void dumpActivitiesLocked(FileDescriptor fd, PrintWriter pw, String[] args,
            int opti, boolean dumpAll, boolean dumpClient, String dumpPackage) {
        dumpActivitiesLocked(fd, pw, args, opti, dumpAll, dumpClient, dumpPackage,
                "ACTIVITY MANAGER ACTIVITIES (dumpsys activity activities)");
    }

    void dumpActivitiesLocked(FileDescriptor fd, PrintWriter pw, String[] args,
            int opti, boolean dumpAll, boolean dumpClient, String dumpPackage, String header) {
        pw.println(header);

        boolean printedAnything = mStackSupervisor.dumpActivitiesLocked(fd, pw, dumpAll, dumpClient,
                dumpPackage);
        boolean needSep = printedAnything;

        boolean printed = ActivityStackSupervisor.printThisActivity(pw,
                mStackSupervisor.getResumedActivityLocked(),
                dumpPackage, needSep, "  ResumedActivity: ");
        if (printed) {
            printedAnything = true;
            needSep = false;
        }

        if (dumpPackage == null) {
            if (needSep) {
                pw.println();
            }
            printedAnything = true;
            mStackSupervisor.dump(pw, "  ");
        }

        if (!printedAnything) {
            pw.println("  (nothing)");
        }
    }

}

```

### ActivityStackSupervisor

```java

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener,
        RecentTasks.Callbacks {

    boolean dumpActivitiesLocked(FileDescriptor fd, PrintWriter pw, boolean dumpAll,
            boolean dumpClient, String dumpPackage) {
        boolean printed = false;
        boolean needSep = false;
        //------------------------------------mActivityDisplays------------------------------
        for (int displayNdx = 0; displayNdx < mActivityDisplays.size(); ++displayNdx) {
            ActivityDisplay activityDisplay = mActivityDisplays.valueAt(displayNdx);
            pw.print("Display #"); pw.print(activityDisplay.mDisplayId);
                    pw.println(" (activities from top to bottom):");
            final ActivityDisplay display = mActivityDisplays.valueAt(displayNdx);
            // -------------------------------------ActivityStack----------------------------------
            for (int stackNdx = display.getChildCount() - 1; stackNdx >= 0; --stackNdx) {
                final ActivityStack stack = display.getChildAt(stackNdx);
                pw.println();
                pw.println("  Stack #" + stack.mStackId
                        + ": type=" + activityTypeToString(stack.getActivityType())
                        + " mode=" + windowingModeToString(stack.getWindowingMode()));
                pw.println("  isSleeping=" + stack.shouldSleepActivities());
                pw.println("  mBounds=" + stack.getOverrideBounds());

                printed |= stack.dumpActivitiesLocked(fd, pw, dumpAll, dumpClient, dumpPackage,
                        needSep);

                //-------------------------------mLRUActivities--------------------------------------
                printed |= dumpHistoryList(fd, pw, stack.mLRUActivities, "    ", "Run", false,
                        !dumpAll, false, dumpPackage, true,
                        "    Running activities (most recent first):", null);

                needSep = printed;

                //-------------------------------mPausingActivity------------------------------------
                boolean pr = printThisActivity(pw, stack.mPausingActivity, dumpPackage, needSep,
                        "    mPausingActivity: ");
                if (pr) {
                    printed = true;
                    needSep = false;
                }

                //-------------------------------getResumedActivity-----------------------------------
                pr = printThisActivity(pw, stack.getResumedActivity(), dumpPackage, needSep,
                        "    mResumedActivity: ");
                if (pr) {
                    printed = true;
                    needSep = false;
                }
                if (dumpAll) {
                    pr = printThisActivity(pw, stack.mLastPausedActivity, dumpPackage, needSep,
                            "    mLastPausedActivity: ");
                    if (pr) {
                        printed = true;
                        needSep = true;
                    }
                    printed |= printThisActivity(pw, stack.mLastNoHistoryActivity, dumpPackage,
                            needSep, "    mLastNoHistoryActivity: ");
                }
                needSep = printed;
            }
        }

        printed |= dumpHistoryList(fd, pw, mFinishingActivities, "  ", "Fin", false, !dumpAll,
                false, dumpPackage, true, "  Activities waiting to finish:", null);
        printed |= dumpHistoryList(fd, pw, mStoppingActivities, "  ", "Stop", false, !dumpAll,
                false, dumpPackage, true, "  Activities waiting to stop:", null);
        printed |= dumpHistoryList(fd, pw, mActivitiesWaitingForVisibleActivity, "  ", "Wait",
                false, !dumpAll, false, dumpPackage, true,
                "  Activities waiting for another to become visible:", null);
        printed |= dumpHistoryList(fd, pw, mGoingToSleepActivities, "  ", "Sleep", false, !dumpAll,
                false, dumpPackage, true, "  Activities waiting to sleep:", null);

        return printed;
    }

}

```

### ActivityStack

```java

class ActivityStack<T extends StackWindowController> extends ConfigurationContainer
        implements StackWindowListener {

    boolean dumpActivitiesLocked(FileDescriptor fd, PrintWriter pw, boolean dumpAll,
            boolean dumpClient, String dumpPackage, boolean needSep) {

        if (mTaskHistory.isEmpty()) {
            return false;
        }
        final String prefix = "    ";
        //---------------------------------mTaskHistory-------------------------------
        for (int taskNdx = mTaskHistory.size() - 1; taskNdx >= 0; --taskNdx) {
            final TaskRecord task = mTaskHistory.get(taskNdx);
            if (needSep) {
                pw.println("");
            }
            pw.println(prefix + "Task id #" + task.taskId);
            pw.println(prefix + "mBounds=" + task.getOverrideBounds());
            pw.println(prefix + "mMinWidth=" + task.mMinWidth);
            pw.println(prefix + "mMinHeight=" + task.mMinHeight);
            pw.println(prefix + "mLastNonFullscreenBounds=" + task.mLastNonFullscreenBounds);
            pw.println(prefix + "* " + task);

            //----------------------------TaskRecord-----------------------------------
            task.dump(pw, prefix + "  ");

            //-----------------------------ActivityRecord-----------------------------------
            ActivityStackSupervisor.dumpHistoryList(fd, pw, mTaskHistory.get(taskNdx).mActivities,
                    prefix, "Hist", true, !dumpAll, dumpClient, dumpPackage, false, null, task);
        }
        return true;
    }
}

```

### TaskRecord

```java

class TaskRecord extends ConfigurationContainer implements TaskWindowContainerListener {

    void dump(PrintWriter pw, String prefix) {
        pw.print(prefix); pw.print("userId="); pw.print(userId);
                pw.print(" effectiveUid="); UserHandle.formatUid(pw, effectiveUid);
                pw.print(" mCallingUid="); UserHandle.formatUid(pw, mCallingUid);
                pw.print(" mUserSetupComplete="); pw.print(mUserSetupComplete);
                pw.print(" mCallingPackage="); pw.println(mCallingPackage);
        if (affinity != null || rootAffinity != null) {
            pw.print(prefix); pw.print("affinity="); pw.print(affinity);
            if (affinity == null || !affinity.equals(rootAffinity)) {
                pw.print(" root="); pw.println(rootAffinity);
            } else {
                pw.println();
            }
        }
        if (voiceSession != null || voiceInteractor != null) {
            pw.print(prefix); pw.print("VOICE: session=0x");
            pw.print(Integer.toHexString(System.identityHashCode(voiceSession)));
            pw.print(" interactor=0x");
            pw.println(Integer.toHexString(System.identityHashCode(voiceInteractor)));
        }
        if (intent != null) {
            StringBuilder sb = new StringBuilder(128);
            sb.append(prefix); sb.append("intent={");
            intent.toShortString(sb, false, true, false, true);
            sb.append('}');
            pw.println(sb.toString());
        }
        if (affinityIntent != null) {
            StringBuilder sb = new StringBuilder(128);
            sb.append(prefix); sb.append("affinityIntent={");
            affinityIntent.toShortString(sb, false, true, false, true);
            sb.append('}');
            pw.println(sb.toString());
        }
        if (origActivity != null) {
            pw.print(prefix); pw.print("origActivity=");
            pw.println(origActivity.flattenToShortString());
        }
        if (realActivity != null) {
            pw.print(prefix); pw.print("realActivity=");
            pw.println(realActivity.flattenToShortString());
        }
        if (autoRemoveRecents || isPersistable || !isActivityTypeStandard() || numFullscreen != 0) {
            pw.print(prefix); pw.print("autoRemoveRecents="); pw.print(autoRemoveRecents);
                    pw.print(" isPersistable="); pw.print(isPersistable);
                    pw.print(" numFullscreen="); pw.print(numFullscreen);
                    pw.print(" activityType="); pw.println(getActivityType());
        }
        if (rootWasReset || mNeverRelinquishIdentity || mReuseTask
                || mLockTaskAuth != LOCK_TASK_AUTH_PINNABLE) {
            pw.print(prefix); pw.print("rootWasReset="); pw.print(rootWasReset);
                    pw.print(" mNeverRelinquishIdentity="); pw.print(mNeverRelinquishIdentity);
                    pw.print(" mReuseTask="); pw.print(mReuseTask);
                    pw.print(" mLockTaskAuth="); pw.println(lockTaskAuthToString());
        }
        if (mAffiliatedTaskId != taskId || mPrevAffiliateTaskId != INVALID_TASK_ID
                || mPrevAffiliate != null || mNextAffiliateTaskId != INVALID_TASK_ID
                || mNextAffiliate != null) {
            pw.print(prefix); pw.print("affiliation="); pw.print(mAffiliatedTaskId);
                    pw.print(" prevAffiliation="); pw.print(mPrevAffiliateTaskId);
                    pw.print(" (");
                    if (mPrevAffiliate == null) {
                        pw.print("null");
                    } else {
                        pw.print(Integer.toHexString(System.identityHashCode(mPrevAffiliate)));
                    }
                    pw.print(") nextAffiliation="); pw.print(mNextAffiliateTaskId);
                    pw.print(" (");
                    if (mNextAffiliate == null) {
                        pw.print("null");
                    } else {
                        pw.print(Integer.toHexString(System.identityHashCode(mNextAffiliate)));
                    }
                    pw.println(")");
        }

        pw.print(prefix); pw.print("Activities="); pw.println(mActivities);
        if (!askedCompatMode || !inRecents || !isAvailable) {
            pw.print(prefix); pw.print("askedCompatMode="); pw.print(askedCompatMode);
                    pw.print(" inRecents="); pw.print(inRecents);
                    pw.print(" isAvailable="); pw.println(isAvailable);
        }
        if (lastDescription != null) {
            pw.print(prefix); pw.print("lastDescription="); pw.println(lastDescription);
        }
        if (mRootProcess != null) {
            pw.print(prefix); pw.print("mRootProcess="); pw.println(mRootProcess);
        }
        pw.print(prefix); pw.print("stackId="); pw.println(getStackId());
        pw.print(prefix + "hasBeenVisible=" + hasBeenVisible);
                pw.print(" mResizeMode=" + ActivityInfo.resizeModeToString(mResizeMode));
                pw.print(" mSupportsPictureInPicture=" + mSupportsPictureInPicture);
                pw.print(" isResizeable=" + isResizeable());
                pw.print(" lastActiveTime=" + lastActiveTime);
                pw.println(" (inactive for " + (getInactiveDuration() / 1000) + "s)");
    }

}

```

### ActivityRecord

```java

final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    void dump(PrintWriter pw, String prefix) {
        final long now = SystemClock.uptimeMillis();
        pw.print(prefix); pw.print("packageName="); pw.print(packageName);
                pw.print(" processName="); pw.println(processName);
        pw.print(prefix); pw.print("launchedFromUid="); pw.print(launchedFromUid);
                pw.print(" launchedFromPackage="); pw.print(launchedFromPackage);
                pw.print(" userId="); pw.println(userId);
        pw.print(prefix); pw.print("app="); pw.println(app);
        pw.print(prefix); pw.println(intent.toInsecureStringWithClip());
        pw.print(prefix); pw.print("frontOfTask="); pw.print(frontOfTask);
                pw.print(" task="); pw.println(task);
        pw.print(prefix); pw.print("taskAffinity="); pw.println(taskAffinity);
        pw.print(prefix); pw.print("realActivity=");
                pw.println(realActivity.flattenToShortString());
        if (appInfo != null) {
            pw.print(prefix); pw.print("baseDir="); pw.println(appInfo.sourceDir);
            if (!Objects.equals(appInfo.sourceDir, appInfo.publicSourceDir)) {
                pw.print(prefix); pw.print("resDir="); pw.println(appInfo.publicSourceDir);
            }
            pw.print(prefix); pw.print("dataDir="); pw.println(appInfo.dataDir);
            if (appInfo.splitSourceDirs != null) {
                pw.print(prefix); pw.print("splitDir=");
                        pw.println(Arrays.toString(appInfo.splitSourceDirs));
            }
        }
        pw.print(prefix); pw.print("stateNotNeeded="); pw.print(stateNotNeeded);
                pw.print(" componentSpecified="); pw.print(componentSpecified);
                pw.print(" mActivityType="); pw.println(
                        activityTypeToString(getActivityType()));
        if (rootVoiceInteraction) {
            pw.print(prefix); pw.print("rootVoiceInteraction="); pw.println(rootVoiceInteraction);
        }
        pw.print(prefix); pw.print("compat="); pw.print(compat);
                pw.print(" labelRes=0x"); pw.print(Integer.toHexString(labelRes));
                pw.print(" icon=0x"); pw.print(Integer.toHexString(icon));
                pw.print(" theme=0x"); pw.println(Integer.toHexString(theme));

        //---------------------------------------mLastReportedConfigurations-------------------------
        pw.println(prefix + "mLastReportedConfigurations:");
        mLastReportedConfiguration.dump(pw, prefix + " ");

        //---------------------------------------CurrentConfiguration--------------------------------
        pw.print(prefix); pw.print("CurrentConfiguration="); pw.println(getConfiguration());

        //---------------------------------------OverrideConfiguration--------------------------------
        if (!getOverrideConfiguration().equals(EMPTY)) {
            pw.println(prefix + "OverrideConfiguration=" + getOverrideConfiguration());
        }
        if (!matchParentBounds()) {
            pw.println(prefix + "bounds=" + getBounds());
        }
        if (resultTo != null || resultWho != null) {
            pw.print(prefix); pw.print("resultTo="); pw.print(resultTo);
                    pw.print(" resultWho="); pw.print(resultWho);
                    pw.print(" resultCode="); pw.println(requestCode);
        }
        if (taskDescription != null) {
            final String iconFilename = taskDescription.getIconFilename();
            if (iconFilename != null || taskDescription.getLabel() != null ||
                    taskDescription.getPrimaryColor() != 0) {
                pw.print(prefix); pw.print("taskDescription:");
                        pw.print(" label=\""); pw.print(taskDescription.getLabel());
                                pw.print("\"");
                        pw.print(" icon="); pw.print(taskDescription.getInMemoryIcon() != null
                                ? taskDescription.getInMemoryIcon().getByteCount() + " bytes"
                                : "null");
                        pw.print(" iconResource="); pw.print(taskDescription.getIconResource());
                        pw.print(" iconFilename="); pw.print(taskDescription.getIconFilename());
                        pw.print(" primaryColor=");
                        pw.println(Integer.toHexString(taskDescription.getPrimaryColor()));
                        pw.print(prefix + " backgroundColor=");
                        pw.println(Integer.toHexString(taskDescription.getBackgroundColor()));
                        pw.print(prefix + " statusBarColor=");
                        pw.println(Integer.toHexString(taskDescription.getStatusBarColor()));
                        pw.print(prefix + " navigationBarColor=");
                        pw.println(Integer.toHexString(taskDescription.getNavigationBarColor()));
            }
        }
        if (results != null) {
            pw.print(prefix); pw.print("results="); pw.println(results);
        }
        if (pendingResults != null && pendingResults.size() > 0) {
            pw.print(prefix); pw.println("Pending Results:");
            for (WeakReference<PendingIntentRecord> wpir : pendingResults) {
                PendingIntentRecord pir = wpir != null ? wpir.get() : null;
                pw.print(prefix); pw.print("  - ");
                if (pir == null) {
                    pw.println("null");
                } else {
                    pw.println(pir);
                    pir.dump(pw, prefix + "    ");
                }
            }
        }
        if (newIntents != null && newIntents.size() > 0) {
            pw.print(prefix); pw.println("Pending New Intents:");
            for (int i=0; i<newIntents.size(); i++) {
                Intent intent = newIntents.get(i);
                pw.print(prefix); pw.print("  - ");
                if (intent == null) {
                    pw.println("null");
                } else {
                    pw.println(intent.toShortString(false, true, false, true));
                }
            }
        }
        if (pendingOptions != null) {
            pw.print(prefix); pw.print("pendingOptions="); pw.println(pendingOptions);
        }
        if (appTimeTracker != null) {
            appTimeTracker.dumpWithHeader(pw, prefix, false);
        }
        if (uriPermissions != null) {
            uriPermissions.dump(pw, prefix);
        }
        pw.print(prefix); pw.print("launchFailed="); pw.print(launchFailed);
                pw.print(" launchCount="); pw.print(launchCount);
                pw.print(" lastLaunchTime=");
                if (lastLaunchTime == 0) pw.print("0");
                else TimeUtils.formatDuration(lastLaunchTime, now, pw);
                pw.println();
        pw.print(prefix); pw.print("haveState="); pw.print(haveState);
                pw.print(" icicle="); pw.println(icicle);
        pw.print(prefix); pw.print("state="); pw.print(mState);
                pw.print(" stopped="); pw.print(stopped);
                pw.print(" delayedResume="); pw.print(delayedResume);
                pw.print(" finishing="); pw.println(finishing);
        pw.print(prefix); pw.print("keysPaused="); pw.print(keysPaused);
                pw.print(" inHistory="); pw.print(inHistory);
                pw.print(" visible="); pw.print(visible);
                pw.print(" sleeping="); pw.print(sleeping);
                pw.print(" idle="); pw.print(idle);
                pw.print(" mStartingWindowState=");
                pw.println(startingWindowStateToString(mStartingWindowState));
        pw.print(prefix); pw.print("fullscreen="); pw.print(fullscreen);
                pw.print(" noDisplay="); pw.print(noDisplay);
                pw.print(" immersive="); pw.print(immersive);
                pw.print(" launchMode="); pw.println(launchMode);
        pw.print(prefix); pw.print("frozenBeforeDestroy="); pw.print(frozenBeforeDestroy);
                pw.print(" forceNewConfig="); pw.println(forceNewConfig);
        pw.print(prefix); pw.print("mActivityType=");
                pw.println(activityTypeToString(getActivityType()));
        if (requestedVrComponent != null) {
            pw.print(prefix);
            pw.print("requestedVrComponent=");
            pw.println(requestedVrComponent);
        }
        final boolean waitingVisible =
                mStackSupervisor.mActivitiesWaitingForVisibleActivity.contains(this);
        if (lastVisibleTime != 0 || waitingVisible || nowVisible) {
            pw.print(prefix); pw.print("waitingVisible="); pw.print(waitingVisible);
                    pw.print(" nowVisible="); pw.print(nowVisible);
                    pw.print(" lastVisibleTime=");
                    if (lastVisibleTime == 0) pw.print("0");
                    else TimeUtils.formatDuration(lastVisibleTime, now, pw);
                    pw.println();
        }
        if (mDeferHidingClient) {
            pw.println(prefix + "mDeferHidingClient=" + mDeferHidingClient);
        }
        if (deferRelaunchUntilPaused || configChangeFlags != 0) {
            pw.print(prefix); pw.print("deferRelaunchUntilPaused="); pw.print(deferRelaunchUntilPaused);
                    pw.print(" configChangeFlags=");
                    pw.println(Integer.toHexString(configChangeFlags));
        }
        if (connections != null) {
            pw.print(prefix); pw.print("connections="); pw.println(connections);
        }
        if (info != null) {
            pw.println(prefix + "resizeMode=" + ActivityInfo.resizeModeToString(info.resizeMode));
            pw.println(prefix + "mLastReportedMultiWindowMode=" + mLastReportedMultiWindowMode
                    + " mLastReportedPictureInPictureMode=" + mLastReportedPictureInPictureMode);
            if (info.supportsPictureInPicture()) {
                pw.println(prefix + "supportsPictureInPicture=" + info.supportsPictureInPicture());
                pw.println(prefix + "supportsEnterPipOnTaskSwitch: "
                        + supportsEnterPipOnTaskSwitch);
            }
            if (info.maxAspectRatio != 0) {
                pw.println(prefix + "maxAspectRatio=" + info.maxAspectRatio);
            }
        }
    }

}

```

## dumpsys window

```txt

----------------------LAST ANR----------------------------------

WINDOW MANAGER LAST ANR (dumpsys window lastanr)
  <no ANR has occurred since boot>

----------------------POLICY STATE----------------------------------

WINDOW MANAGER POLICY STATE (dumpsys window policy)
    mSafeMode=false mSystemReady=true mSystemBooted=true
    mLidState=LID_ABSENT mLidOpenRotation=-1
    mCameraLensCoverState=CAMERA_LENS_COVER_ABSENT mHdmiPlugged=false
    mLastSystemUiFlags=0xa018 mResettingSystemUiFlags=0x0 mForceClearedSystemUiFlags=0x0
    mWakeGestureEnabledSetting=true
    mSupportAutoRotation=true mOrientationSensorEnabled=false
    mUiMode=UI_MODE_TYPE_NORMAL mDockMode=EXTRA_DOCK_STATE_UNDOCKED
    mEnableCarDockHomeCapture=true mCarDockRotation=-1 mDeskDockRotation=-1
    mUserRotationMode=USER_ROTATION_LOCKED mUserRotation=ROTATION_0 mAllowAllRotations=unknown
    mCurrentAppOrientation=SCREEN_ORIENTATION_UNSPECIFIED
    mCarDockEnablesAccelerometer=true mDeskDockEnablesAccelerometer=true
    mLidKeyboardAccessibility=0 mLidNavigationAccessibility=0 mLidControlsScreenLock=false
    mLidControlsSleep=false
    mLongPressOnBackBehavior=LONG_PRESS_BACK_NOTHING
    mLongPressOnHomeBehavior=LONG_PRESS_HOME_NOTHING
    mDoubleTapOnHomeBehavior=DOUBLE_TAP_HOME_NOTHING
    mShortPressOnPowerBehavior=SHORT_PRESS_POWER_GO_TO_SLEEP
    mLongPressOnPowerBehavior=LONG_PRESS_POWER_GLOBAL_ACTIONS
    mVeryLongPressOnPowerBehavior=VERY_LONG_PRESS_POWER_NOTHING
    mDoublePressOnPowerBehavior=MULTI_PRESS_POWER_NOTHING
    mTriplePressOnPowerBehavior=MULTI_PRESS_POWER_NOTHING
    mShortPressOnSleepBehavior=SHORT_PRESS_SLEEP_GO_TO_SLEEP
    mShortPressOnWindowBehavior=SHORT_PRESS_WINDOW_PICTURE_IN_PICTURE
    mAllowStartActivityForLongPressOnPowerDuringSetup=false
    mHasSoftInput=true mDismissImeOnBackKeyPressed=false
    mIncallPowerBehavior=sleep mIncallBackBehavior=<nothing> mEndcallBehavior=sleep
    mHomePressed=false
    mAwake=truemScreenOnEarly=true mScreenOnFully=true
    mKeyguardDrawComplete=true mWindowManagerDrawComplete=true
    mDockLayer=268435456 mStatusBarLayer=0
    mShowingDream=false mDreamingLockscreen=false mDreamingSleepToken=null
    mStatusBar=Window{78e4362 u0 StatusBar} isStatusBarKeyguard=false
    mNavigationBar=Window{efb8e08 u0 NavigationBar}
    mFocusedWindow=Window{fdec1cd u0 com.android.settings/com.android.settings.Settings}
    mFocusedApp=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}
    mTopFullscreenOpaqueWindowState=Window{fdec1cd u0 com.android.settings/com.android.settings.Settings}
    mTopFullscreenOpaqueOrDimmingWindowState=Window{fdec1cd u0 com.android.settings/com.android.settings.Settings}
    mTopIsFullscreen=false mKeyguardOccluded=false
    mKeyguardOccludedChanged=false mPendingKeyguardOccluded=false
    mForceStatusBar=false mForceStatusBarFromKeyguard=false
    mAllowLockscreenWhenOn=false mLockScreenTimeout=2147483647 mLockScreenTimerActive=false
    mLandscapeRotation=ROTATION_0 mSeascapeRotation=ROTATION_180
    mPortraitRotation=ROTATION_0 mUpsideDownRotation=ROTATION_90
    mDemoHdmiRotation=ROTATION_0 mDemoHdmiRotationLock=false
    mUndockedHdmiRotation=-1
    mKeyMapping.size=0
    BarController.StatusBar
      mState=WINDOW_STATE_SHOWING
      mTransientBar=TRANSIENT_BAR_NONE
      mContentFrame=Rect(0, 0 - 1920, 35)
    BarController.NavigationBar
      mState=WINDOW_STATE_SHOWING
      mTransientBar=TRANSIENT_BAR_NONE
      mContentFrame=Rect(0, 1011 - 1920, 1080)
    PolicyControl.sImmersiveStatusFilter=null
    PolicyControl.sImmersiveNavigationFilter=null
    PolicyControl.sImmersivePreconfirmationsFilter=null
    WakeGestureListener
      mTriggerRequested=false
      mSensor=null
    WindowOrientationListener
      mEnabled=false
      mCurrentRotation=ROTATION_0
      mSensorType=null
      mSensor=null
      mRate=2
    KeyguardServiceDelegate
      showing=false
      showingAndNotOccluded=true
      inputRestricted=false
      occluded=false
      secure=false
      dreaming=false
      systemIsReady=true
      deviceHasKeyguard=true
      enabled=true
      offReason=0
      currentUser=-10000
      bootCompleted=true
      screenState=SCREEN_STATE_ON
      interactiveState=INTERACTIVE_STATE_WAKING
      KeyguardStateMonitor
        mIsShowing=false
        mSimSecure=false
        mInputRestricted=false
        mTrusted=false
        mCurrentUserId=0
    Looper state:
      Looper (android.ui, tid 19) {d921be2}
        (Total messages: 0, polling=true, quitting=false)

---------------------------------ANIMATOR STATE---------------------------------------------

WINDOW MANAGER ANIMATOR STATE (dumpsys window animator)
    DisplayContentsAnimator #0:
      Window #0: WindowStateAnimator{e80eb73 com.android.systemui.ImageWallpaper}
      Window #1: WindowStateAnimator{8ee095c com.android.launcher3/com.android.launcher3.Launcher}
      Window #2: WindowStateAnimator{59a1f2 com.android.settings/com.android.settings.Settings}
      Window #3: WindowStateAnimator{d5c3465 DockedStackDivider}
      Window #4: WindowStateAnimator{357453a AssistPreviewPanel}
      Window #5: WindowStateAnimator{81c55eb StatusBar}
      Window #6: WindowStateAnimator{5005f48 NavigationBar}

    DisplayContentsAnimator #1:


    mBulkUpdateParams=0x8 ORIENTATION_CHANGE_COMPLETE

---------------------------------SESSIONS---------------------------------------------

WINDOW MANAGER SESSIONS (dumpsys window sessions)
  Session Session{4384d1e 1509:1000}:
    mNumWindow=0 mCanAddInternalSystemWindow=true mAppOverlaySurfaces=[] mAlertWindowSurfaces=[] mClientDead=false mSurfaceSession=android.view.SurfaceSession@7e0b1e1
    mPackageName=com.android.settings
  Session Session{5231741 2463:u0a10039}:
    mNumWindow=1 mCanAddInternalSystemWindow=false mAppOverlaySurfaces=[] mAlertWindowSurfaces=[] mClientDead=false mSurfaceSession=android.view.SurfaceSession@5e47b06
    mPackageName=com.android.launcher3
  Session Session{8f8b4f6 15906:1000}:
    mNumWindow=1 mCanAddInternalSystemWindow=true mAppOverlaySurfaces=[] mAlertWindowSurfaces=[] mClientDead=false mSurfaceSession=android.view.SurfaceSession@8ade043
    mPackageName=com.android.settings
  Session Session{905daea 1794:u0a10038}:
    mNumWindow=5 mCanAddInternalSystemWindow=true mAppOverlaySurfaces=[] mAlertWindowSurfaces=[] mClientDead=false mSurfaceSession=android.view.SurfaceSession@dd58b1d
    mPackageName=com.android.systemui

------------------------------------DISPLAY CONTENTS-------------------------------------------

WINDOW MANAGER DISPLAY CONTENTS (dumpsys window displays)

--------------------------------------------副屏---------------------------------------------

  Display: mDisplayId=1
    init=1024x600 177dpi cur=1024x600 app=1024x600 rng=600x600-1024x1024
    deferred=false mLayoutNeeded=false mTouchExcludeRegion=SkRegion()

  mLayoutSeq=6

  Application tokens in top down Z order:



  DockedStackDividerController
    mLastVisibility=false
    mMinimizedDock=false
    mAdjustedForIme=false
    mAdjustedForDivider=false

  PinnedStackController
    defaultBounds=[731,359][1007,514]
    movementBounds=[17,52][1007,514]
    mIsImeShowing=false
    mImeHeight=0
    mIsShelfShowing=false
    mShelfHeight=0
    mReentrySnapFraction=-1.0
    mIsMinimized=false
    mActions=[]
   mDisplayInfo=DisplayInfo{"HDMI Screen", uniqueId "local:1", app 1024 x 600, real 1024 x 600, largest app 1024 x 1024, smallest app 600 x 600, mode 2, defaultMode 2, modes [{id=2, width=1024, height=600, fps=60.000004}], colorMode 0, supportedColorModes [0], hdrCapabilities android.view.Display$HdrCapabilities@40f16308, rotation 0, density 177 (177.0 x 177.0) dpi, layerStack 1, appVsyncOff 1000000, presDeadline 16666666, type HDMI, state ON, FLAG_SECURE, FLAG_SUPPORTS_PROTECTED_BUFFERS, FLAG_PRESENTATION, removeMode 0}

  DisplayFrames w=1024 h=600 r=0
    mStable=[0,0][1024,600]
    mStableFullscreen=[0,0][1024,600]
    mDock=[0,0][1024,600]
    mCurrent=[0,0][1024,600]
    mSystem=[0,0][1024,600]
    mContent=[0,0][1024,600]
    mVoiceContent=[0,0][1024,600]
    mOverscan=[0,0][1024,600]
    mRestrictedOverscan=[0,0][1024,600]
    mRestricted=[0,0][1024,600]
    mUnrestricted=[0,0][1024,600]
    mDisplayInfoOverscan=[0,0][0,0]
    mRotatedDisplayInfoOverscan=[0,0][0,0]
    mDisplayCutout=com.android.server.wm.utils.WmDisplayCutout@3c1

--------------------------------------------主屏---------------------------------------------

  Display: mDisplayId=0
    init=1920x1080 230dpi cur=1920x1080 app=1920x1011 rng=1080x976-1920x1920
    deferred=false mLayoutNeeded=false mTouchExcludeRegion=SkRegion((0,0,1920,1080))

  mLayoutSeq=440

  Application tokens in top down Z order:
    mStackId=3
    mDeferRemoval=false
    mBounds=[0,0][1920,1080]--------------------------------------TaskStack
      taskId=5
        mBounds=[0,0][1920,1080]-------------------------------------------Task
        mdr=false
        appTokens=[AppWindowToken{12b963b token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}}]
        mTempInsetBounds=[0,0][0,0]
          Activity #0 AppWindowToken{12b963b token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}}
            windows=[Window{fdec1cd u0 com.android.settings/com.android.settings.Settings}]
            windowType=2 hidden=false hasVisible=true
            app=true mVoiceInteraction=false
            task={taskId=5 appTokens=[AppWindowToken{12b963b token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}}] mdr=false}
             mFillsParent=true mOrientation=-1
            hiddenRequested=false mClientHidden=false reportedDrawn=true reportedVisible=true
            mNumInterestingWindows=1 mNumDrawnWindows=1 inPendingTransaction=false allDrawn=true lastAllDrawn=true)
            startingData=null removed=false firstWindowDrawn=true mIsExiting=false
            controller=AppWindowContainerController{ token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}} mContainer=AppWindowToken{12b963b token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}} mListener=ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}
    mStackId=0
    mDeferRemoval=false
    mBounds=[0,0][1920,1080]
      taskId=2
        mBounds=[0,0][1920,1080]
        mdr=false
        appTokens=[AppWindowToken{cb4bc98 token=Token{2bd967b ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}}}]
        mTempInsetBounds=[0,0][0,0]
          Activity #0 AppWindowToken{cb4bc98 token=Token{2bd967b ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}}}
            windows=[Window{6a06e2a u0 com.android.launcher3/com.android.launcher3.Launcher}]
            windowType=2 hidden=true hasVisible=true
            app=true mVoiceInteraction=false
            task={taskId=2 appTokens=[AppWindowToken{cb4bc98 token=Token{2bd967b ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}}}] mdr=false}
             mFillsParent=true mOrientation=-1
            hiddenRequested=true mClientHidden=true reportedDrawn=false reportedVisible=false
            mAppStopped=true
            mNumInterestingWindows=1 mNumDrawnWindows=1 inPendingTransaction=false allDrawn=true lastAllDrawn=true)
            startingData=null removed=false firstWindowDrawn=true mIsExiting=false
            controller=AppWindowContainerController{ token=Token{2bd967b ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}} mContainer=AppWindowToken{cb4bc98 token=Token{2bd967b ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}}} mListener=ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}}


  homeStack=Stack=0

  DockedStackDividerController----------------------------
    mLastVisibility=false
    mMinimizedDock=false
    mAdjustedForIme=false
    mAdjustedForDivider=false

  PinnedStackController
    defaultBounds=[1456,740][1897,988]
    movementBounds=[23,58][1897,988]
    mIsImeShowing=false
    mImeHeight=0
    mIsShelfShowing=false
    mShelfHeight=130
    mReentrySnapFraction=-1.0
    mIsMinimized=false
    mActions=[]
   mDisplayInfo=DisplayInfo{"Built-in Screen", uniqueId "local:0", app 1920 x 1011, real 1920 x 1080, largest app 1920 x 1920, smallest app 1080 x 976, mode 1, defaultMode 1, modes [{id=1, width=1920, height=1080, fps=60.000004}], colorMode 0, supportedColorModes [0], hdrCapabilities android.view.Display$HdrCapabilities@40f16308, rotation 0, density 230 (320.842 x 318.976) dpi, layerStack 0, appVsyncOff 1000000, presDeadline 16666666, type BUILT_IN, state ON, FLAG_SECURE, FLAG_SUPPORTS_PROTECTED_BUFFERS, removeMode 0}

  DisplayFrames w=1920 h=1080 r=0
    mStable=[0,35][1920,1011]
    mStableFullscreen=[0,0][1920,1011]
    mDock=[0,35][1920,1011]
    mCurrent=[0,35][1920,1011]
    mSystem=[0,0][1920,1080]
    mContent=[0,35][1920,1011]
    mVoiceContent=[0,35][1920,1011]
    mOverscan=[0,0][1920,1080]
    mRestrictedOverscan=[0,0][1920,1011]
    mRestricted=[0,0][1920,1011]
    mUnrestricted=[0,0][1920,1080]
    mDisplayInfoOverscan=[0,0][0,0]
    mRotatedDisplayInfoOverscan=[0,0][0,0]
    mDisplayCutout=com.android.server.wm.utils.WmDisplayCutout@3c1

---------------------------------------------------WINDOW MANAGER TOKENS--------------------------------------

WINDOW MANAGER TOKENS (dumpsys window tokens)
  All tokens:
  Display #0
  AppWindowToken{cb4bc98 token=Token{2bd967b ActivityRecord{349ee0a u0 com.android.launcher3/.Launcher t2}}}
  WindowToken{d5007f8 android.os.Binder@693735b}
  WindowToken{2ceb304 android.os.BinderProxy@c3cf317}
  WindowToken{4e007ab android.os.BinderProxy@477a5fa}
  WallpaperWindowToken{c76f335 token=android.os.Binder@ff4416c}
  WindowToken{d45322d android.os.BinderProxy@658c144}
  WindowToken{f4c6cd4 android.os.BinderProxy@ab93227}
  AppWindowToken{12b963b token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}}

--------------------------------------------------WINDOW MANAGER WINDOWS----------------------------------

WINDOW MANAGER WINDOWS (dumpsys window windows)
------------------------------------导航栏窗口------------------------------------------------------
  Window #0 Window{efb8e08 u0 NavigationBar}:
    mDisplayId=0 stackId=0 mSession=Session{905daea 1794:u0a10038} mClient=android.os.BinderProxy@2b2a025
    mOwnerUid=10038 mShowToOwnerOnly=false package=com.android.systemui appop=NONE
    mAttrs={(0,0)(fillxfill) sim={adjust=pan} ty=NAVIGATION_BAR fmt=TRANSLUCENT
      fl=NOT_FOCUSABLE NOT_TOUCH_MODAL TOUCHABLE_WHEN_WAKING WATCH_OUTSIDE_TOUCH SPLIT_TOUCH HARDWARE_ACCELERATED FLAG_SLIPPERY}
    Requested w=1920 h=69 mLayoutSeq=440
    mHasSurface=true isReadyForDisplay()=true mWindowRemovalAllowed=false
    WindowStateAnimator{5005f48 NavigationBar}:
      Surface: shown=true layer=0 alpha=1.0 rect=(0.0,0.0) 1920 x 69 transform=(1.0, 0.0, 1.0, 0.0)
    mLastFreezeDuration=+739ms
    isOnScreen=true
    isVisible=true
----------------------------------状态栏窗口-------------------------------------------------
  Window #1 Window{78e4362 u0 StatusBar}:
    mDisplayId=0 stackId=0 mSession=Session{905daea 1794:u0a10038} mClient=android.os.BinderProxy@9095257
    mOwnerUid=10038 mShowToOwnerOnly=false package=com.android.systemui appop=NONE
    mAttrs={(0,0)(fillx35) gr=TOP CENTER_VERTICAL sim={adjust=resize} layoutInDisplayCutoutMode=always ty=STATUS_BAR fmt=TRANSLUCENT
      fl=NOT_FOCUSABLE TOUCHABLE_WHEN_WAKING WATCH_OUTSIDE_TOUCH SPLIT_TOUCH HARDWARE_ACCELERATED DRAWS_SYSTEM_BAR_BACKGROUNDS}
    Requested w=1920 h=35 mLayoutSeq=440
    mHasSurface=true isReadyForDisplay()=true mWindowRemovalAllowed=false
    WindowStateAnimator{81c55eb StatusBar}:
      Surface: shown=true layer=0 alpha=1.0 rect=(0.0,0.0) 1920 x 35 transform=(1.0, 0.0, 1.0, 0.0)
    mLastFreezeDuration=+742ms
    isOnScreen=true
    isVisible=true
-------------------------------------AssistPreviewPanel-------------------------------------------------------
  Window #2 Window{cab1e7d u0 AssistPreviewPanel}:
    mDisplayId=0 stackId=0 mSession=Session{905daea 1794:u0a10038} mClient=android.os.BinderProxy@8c13ce6
    mOwnerUid=10038 mShowToOwnerOnly=true package=com.android.systemui appop=NONE
    mAttrs={(0,0)(fillx359) gr=BOTTOM START CENTER sim={state=unchanged adjust=nothing} ty=VOICE_INTERACTION_STARTING fmt=TRANSLUCENT
      fl=NOT_FOCUSABLE NOT_TOUCHABLE LAYOUT_IN_SCREEN HARDWARE_ACCELERATED
      vsysui=LAYOUT_STABLE LAYOUT_HIDE_NAVIGATION LAYOUT_FULLSCREEN}
    Requested w=0 h=0 mLayoutSeq=133
    mHasSurface=false isReadyForDisplay()=false mWindowRemovalAllowed=false
    WindowStateAnimator{357453a AssistPreviewPanel}:
      mShownAlpha=0.0 mAlpha=1.0 mLastAlpha=0.0
    isOnScreen=false
    isVisible=false
---------------------------------------程序抽屉---------------------------------------------------
  Window #3 Window{5a5a0ed u0 DockedStackDivider}:
    mDisplayId=0 stackId=0 mSession=Session{905daea 1794:u0a10038} mClient=android.os.BinderProxy@148ab96
    mOwnerUid=10038 mShowToOwnerOnly=false package=com.android.systemui appop=NONE
    mAttrs={(0,0)(69xfill) sim={adjust=pan} layoutInDisplayCutoutMode=always ty=DOCK_DIVIDER fmt=TRANSLUCENT
      fl=NOT_FOCUSABLE NOT_TOUCH_MODAL WATCH_OUTSIDE_TOUCH SPLIT_TOUCH HARDWARE_ACCELERATED FLAG_SLIPPERY
      pfl=NO_MOVE_ANIMATION
      vsysui=LAYOUT_STABLE LAYOUT_HIDE_NAVIGATION LAYOUT_FULLSCREEN}
    Requested w=69 h=976 mLayoutSeq=440
    mPolicyVisibility=false mPolicyVisibilityAfterAnim=false mAppOpVisibility=true parentHidden=false mPermanentlyHidden=false mHiddenWhileSuspended=false mForceHideNonSystemOverlayWindow=false
    mHasSurface=false isReadyForDisplay()=false mWindowRemovalAllowed=false
    WindowStateAnimator{d5c3465 DockedStackDivider}:
      mShownAlpha=0.0 mAlpha=1.0 mLastAlpha=0.0
    isOnScreen=false
    isVisible=false
--------------------------------------------------------Settings-------------------------------------------
  Window #4 Window{fdec1cd u0 com.android.settings/com.android.settings.Settings}:
    mDisplayId=0 stackId=3 mSession=Session{8f8b4f6 15906:1000} mClient=android.os.BinderProxy@e664b64
    mOwnerUid=1000 mShowToOwnerOnly=true package=com.android.settings appop=NONE
    mAttrs={(0,0)(fillxfill) sim={adjust=resize forwardNavigation} ty=BASE_APPLICATION wanim=0x10302f8
      fl=LAYOUT_IN_SCREEN LAYOUT_INSET_DECOR SPLIT_TOUCH HARDWARE_ACCELERATED DRAWS_SYSTEM_BAR_BACKGROUNDS
      pfl=FORCE_DRAW_STATUS_BAR_BACKGROUND
      vsysui=LIGHT_STATUS_BAR LIGHT_NAVIGATION_BAR}
    Requested w=1920 h=1080 mLayoutSeq=440
    mHasSurface=true isReadyForDisplay()=true mWindowRemovalAllowed=false
    WindowStateAnimator{59a1f2 com.android.settings/com.android.settings.Settings}:
      Surface: shown=true layer=0 alpha=1.0 rect=(0.0,0.0) 1920 x 1080 transform=(1.0, 0.0, 1.0, 0.0)
    isOnScreen=true
    isVisible=true

--------------------------------------------------------Launcher-------------------------------------------

  Window #5 Window{6a06e2a u0 com.android.launcher3/com.android.launcher3.Launcher}:
    mDisplayId=0 stackId=0 mSession=Session{5231741 2463:u0a10039} mClient=android.os.BinderProxy@73dab15
    mOwnerUid=10039 mShowToOwnerOnly=true package=com.android.launcher3 appop=NONE
    mAttrs={(0,0)(fillxfill) sim={adjust=pan} ty=BASE_APPLICATION fmt=TRANSPARENT wanim=0x10302f8
      fl=LAYOUT_IN_SCREEN LAYOUT_INSET_DECOR SHOW_WALLPAPER SPLIT_TOUCH HARDWARE_ACCELERATED DRAWS_SYSTEM_BAR_BACKGROUNDS
      pfl=FORCE_DRAW_STATUS_BAR_BACKGROUND
      vsysui=LAYOUT_STABLE LAYOUT_HIDE_NAVIGATION LAYOUT_FULLSCREEN LIGHT_STATUS_BAR LIGHT_NAVIGATION_BAR}
    Requested w=1920 h=1080 mLayoutSeq=427
    mHasSurface=false isReadyForDisplay()=false mWindowRemovalAllowed=false
    WindowStateAnimator{8ee095c com.android.launcher3/com.android.launcher3.Launcher}:
    mWallpaperX=0.0 mWallpaperY=0.5
    mWallpaperXStep=0.33333334 mWallpaperYStep=1.0
    isOnScreen=false
    isVisible=false

----------------------------------------------------------壁纸----------------------------------------------

  Window #6 Window{567452a u0 com.android.systemui.ImageWallpaper}:
    mDisplayId=0 stackId=0 mSession=Session{905daea 1794:u0a10038} mClient=android.os.BinderProxy@20d7e15
    mOwnerUid=10038 mShowToOwnerOnly=true package=com.android.systemui appop=NONE
    mAttrs={(0,0)(1920x1080) gr=TOP START CENTER layoutInDisplayCutoutMode=always ty=WALLPAPER fmt=RGBX_8888 wanim=0x1030308
      fl=NOT_FOCUSABLE NOT_TOUCHABLE LAYOUT_IN_SCREEN LAYOUT_NO_LIMITS LAYOUT_INSET_DECOR}
    Requested w=1920 h=1080 mLayoutSeq=434
    mIsImWindow=false mIsWallpaper=true mIsFloatingLayer=true mWallpaperVisible=false
    mHasSurface=true isReadyForDisplay()=false mWindowRemovalAllowed=false
    WindowStateAnimator{e80eb73 com.android.systemui.ImageWallpaper}:
      Surface: shown=false layer=0 alpha=1.0 rect=(0.0,0.0) 1920 x 1080 transform=(1.0, 0.0, 1.0, 0.0)
    mLastFreezeDuration=+1s4ms
    mWallpaperX=0.0 mWallpaperY=0.5
    mWallpaperXStep=0.33333334 mWallpaperYStep=1.0
    isOnScreen=true
    isVisible=false

----------------------------------------------------------mGlobalConfiguration------------------------------------

  mGlobalConfiguration={1.0 ?mcc?mnc [zh_CN_#Hans,en_US] ldltr sw751dp w1335dp h678dp 230dpi lrg long land finger -keyb/v/h -nav/h winConfig={
         mBounds=Rect(0, 0 - 1920, 1011)
         mAppBounds=Rect(0, 0 - 1920, 1011)
         mWindowingMode=fullscreen
         mActivityType=undefined} s.7}
  mHasPermanentDpad=false
  mCurrentFocus=Window{fdec1cd u0 com.android.settings/com.android.settings.Settings}
  mFocusedApp=AppWindowToken{12b963b token=Token{3514ca ActivityRecord{d784835 u0 com.android.settings/.Settings t5}}}
  mInTouchMode=true
  mLastDisplayFreezeDuration=+748ms due to Window{78e4362 u0 StatusBar}
  mLastWakeLockHoldingWindow=null mLastWakeLockObscuringWindow=Window{e73184c u0 com.android.settings/com.android.settings.Settings}
  InputConsumers:
    name=pip_input_consumer pid=1794 user=UserHandle{0}
  SnapshotCache

```

## 代码

### WindowManagerService

```java

public class WindowManagerService extends IWindowManager.Stub
        implements Watchdog.Monitor, WindowManagerPolicy.WindowManagerFuncs {

    final WindowManagerPolicy mPolicy;

    final ArraySet<Session> mSessions = new ArraySet<>();

    final WindowAnimator mAnimator;

    // The root of the device window hierarchy.
    RootWindowContainer mRoot;

    private void dumpPolicyLocked(PrintWriter pw, String[] args, boolean dumpAll) {
        pw.println("WINDOW MANAGER POLICY STATE (dumpsys window policy)");
        mPolicy.dump("    ", pw, args);
    }

    private void dumpAnimatorLocked(PrintWriter pw, String[] args, boolean dumpAll) {
        pw.println("WINDOW MANAGER ANIMATOR STATE (dumpsys window animator)");
        mAnimator.dumpLocked(pw, "    ", dumpAll);
    }

    private void dumpTokensLocked(PrintWriter pw, boolean dumpAll) {
        pw.println("WINDOW MANAGER TOKENS (dumpsys window tokens)");
        mRoot.dumpTokens(pw, dumpAll);
        if (!mOpeningApps.isEmpty() || !mClosingApps.isEmpty()) {
            pw.println();
            if (mOpeningApps.size() > 0) {
                pw.print("  mOpeningApps="); pw.println(mOpeningApps);
            }
            if (mClosingApps.size() > 0) {
                pw.print("  mClosingApps="); pw.println(mClosingApps);
            }
        }
    }

    private void dumpSessionsLocked(PrintWriter pw, boolean dumpAll) {
        pw.println("WINDOW MANAGER SESSIONS (dumpsys window sessions)");
        for (int i=0; i<mSessions.size(); i++) {
            Session s = mSessions.valueAt(i);
            pw.print("  Session "); pw.print(s); pw.println(':');
            s.dump(pw, "    ");
        }
    }

    private void dumpWindowsLocked(PrintWriter pw, boolean dumpAll,
            ArrayList<WindowState> windows) {
        pw.println("WINDOW MANAGER WINDOWS (dumpsys window windows)");
        dumpWindowsNoHeaderLocked(pw, dumpAll, windows);
    }

    private void dumpWindowsNoHeaderLocked(PrintWriter pw, boolean dumpAll,
            ArrayList<WindowState> windows) {

        mRoot.dumpWindowsNoHeader(pw, dumpAll, windows);

        if (!mHidingNonSystemOverlayWindows.isEmpty()) {
            pw.println();
            pw.println("  Hiding System Alert Windows:");
            for (int i = mHidingNonSystemOverlayWindows.size() - 1; i >= 0; i--) {
                final WindowState w = mHidingNonSystemOverlayWindows.get(i);
                pw.print("  #"); pw.print(i); pw.print(' ');
                pw.print(w);
                if (dumpAll) {
                    pw.println(":");
                    w.dump(pw, "    ", true);
                } else {
                    pw.println();
                }
            }
        }
        if (mPendingRemove.size() > 0) {
            pw.println();
            pw.println("  Remove pending for:");
            for (int i=mPendingRemove.size()-1; i>=0; i--) {
                WindowState w = mPendingRemove.get(i);
                if (windows == null || windows.contains(w)) {
                    pw.print("  Remove #"); pw.print(i); pw.print(' ');
                            pw.print(w);
                    if (dumpAll) {
                        pw.println(":");
                        w.dump(pw, "    ", true);
                    } else {
                        pw.println();
                    }
                }
            }
        }
        if (mForceRemoves != null && mForceRemoves.size() > 0) {
            pw.println();
            pw.println("  Windows force removing:");
            for (int i=mForceRemoves.size()-1; i>=0; i--) {
                WindowState w = mForceRemoves.get(i);
                pw.print("  Removing #"); pw.print(i); pw.print(' ');
                        pw.print(w);
                if (dumpAll) {
                    pw.println(":");
                    w.dump(pw, "    ", true);
                } else {
                    pw.println();
                }
            }
        }
        if (mDestroySurface.size() > 0) {
            pw.println();
            pw.println("  Windows waiting to destroy their surface:");
            for (int i=mDestroySurface.size()-1; i>=0; i--) {
                WindowState w = mDestroySurface.get(i);
                if (windows == null || windows.contains(w)) {
                    pw.print("  Destroy #"); pw.print(i); pw.print(' ');
                            pw.print(w);
                    if (dumpAll) {
                        pw.println(":");
                        w.dump(pw, "    ", true);
                    } else {
                        pw.println();
                    }
                }
            }
        }
        if (mLosingFocus.size() > 0) {
            pw.println();
            pw.println("  Windows losing focus:");
            for (int i=mLosingFocus.size()-1; i>=0; i--) {
                WindowState w = mLosingFocus.get(i);
                if (windows == null || windows.contains(w)) {
                    pw.print("  Losing #"); pw.print(i); pw.print(' ');
                            pw.print(w);
                    if (dumpAll) {
                        pw.println(":");
                        w.dump(pw, "    ", true);
                    } else {
                        pw.println();
                    }
                }
            }
        }
        if (mResizingWindows.size() > 0) {
            pw.println();
            pw.println("  Windows waiting to resize:");
            for (int i=mResizingWindows.size()-1; i>=0; i--) {
                WindowState w = mResizingWindows.get(i);
                if (windows == null || windows.contains(w)) {
                    pw.print("  Resizing #"); pw.print(i); pw.print(' ');
                            pw.print(w);
                    if (dumpAll) {
                        pw.println(":");
                        w.dump(pw, "    ", true);
                    } else {
                        pw.println();
                    }
                }
            }
        }
        if (mWaitingForDrawn.size() > 0) {
            pw.println();
            pw.println("  Clients waiting for these windows to be drawn:");
            for (int i=mWaitingForDrawn.size()-1; i>=0; i--) {
                WindowState win = mWaitingForDrawn.get(i);
                pw.print("  Waiting #"); pw.print(i); pw.print(' '); pw.print(win);
            }
        }
        pw.println();
        pw.print("  mGlobalConfiguration="); pw.println(mRoot.getConfiguration());
        pw.print("  mHasPermanentDpad="); pw.println(mHasPermanentDpad);
        pw.print("  mCurrentFocus="); pw.println(mCurrentFocus);
        if (mLastFocus != mCurrentFocus) {
            pw.print("  mLastFocus="); pw.println(mLastFocus);
        }
        pw.print("  mFocusedApp="); pw.println(mFocusedApp);
        if (mInputMethodTarget != null) {
            pw.print("  mInputMethodTarget="); pw.println(mInputMethodTarget);
        }
        pw.print("  mInTouchMode="); pw.println(mInTouchMode);
        pw.print("  mLastDisplayFreezeDuration=");
                TimeUtils.formatDuration(mLastDisplayFreezeDuration, pw);
                if ( mLastFinishedFreezeSource != null) {
                    pw.print(" due to ");
                    pw.print(mLastFinishedFreezeSource);
                }
                pw.println();
        pw.print("  mLastWakeLockHoldingWindow=");pw.print(mLastWakeLockHoldingWindow);
                pw.print(" mLastWakeLockObscuringWindow="); pw.print(mLastWakeLockObscuringWindow);
                pw.println();

        mInputMonitor.dump(pw, "  ");
        mUnknownAppVisibilityController.dump(pw, "  ");
        mTaskSnapshotController.dump(pw, "  ");

        if (dumpAll) {
            pw.print("  mSystemDecorLayer="); pw.print(mSystemDecorLayer);
                    pw.print(" mScreenRect="); pw.println(mScreenRect.toShortString());
            if (mLastStatusBarVisibility != 0) {
                pw.print("  mLastStatusBarVisibility=0x");
                        pw.println(Integer.toHexString(mLastStatusBarVisibility));
            }
            if (mInputMethodWindow != null) {
                pw.print("  mInputMethodWindow="); pw.println(mInputMethodWindow);
            }
            mWindowPlacerLocked.dump(pw, "  ");
            mRoot.mWallpaperController.dump(pw, "  ");
            pw.print("  mSystemBooted="); pw.print(mSystemBooted);
                    pw.print(" mDisplayEnabled="); pw.println(mDisplayEnabled);

            mRoot.dumpLayoutNeededDisplayIds(pw);

            pw.print("  mTransactionSequence="); pw.println(mTransactionSequence);
            pw.print("  mDisplayFrozen="); pw.print(mDisplayFrozen);
                    pw.print(" windows="); pw.print(mWindowsFreezingScreen);
                    pw.print(" client="); pw.print(mClientFreezingScreen);
                    pw.print(" apps="); pw.print(mAppsFreezingScreen);
                    pw.print(" waitingForConfig="); pw.println(mWaitingForConfig);
            final DisplayContent defaultDisplayContent = getDefaultDisplayContentLocked();
            pw.print("  mRotation="); pw.print(defaultDisplayContent.getRotation());
                    pw.print(" mAltOrientation=");
                            pw.println(defaultDisplayContent.getAltOrientation());
            pw.print("  mLastWindowForcedOrientation=");
                    pw.print(defaultDisplayContent.getLastWindowForcedOrientation());
                    pw.print(" mLastOrientation=");
                            pw.println(defaultDisplayContent.getLastOrientation());
            pw.print("  mDeferredRotationPauseCount="); pw.println(mDeferredRotationPauseCount);
            pw.print("  Animation settings: disabled="); pw.print(mAnimationsDisabled);
                    pw.print(" window="); pw.print(mWindowAnimationScaleSetting);
                    pw.print(" transition="); pw.print(mTransitionAnimationScaleSetting);
                    pw.print(" animator="); pw.println(mAnimatorDurationScaleSetting);
            pw.print("  mSkipAppTransitionAnimation=");pw.println(mSkipAppTransitionAnimation);
            pw.println("  mLayoutToAnim:");
            mAppTransition.dump(pw, "    ");
            if (mRecentsAnimationController != null) {
                pw.print("  mRecentsAnimationController="); pw.println(mRecentsAnimationController);
                mRecentsAnimationController.dump(pw, "    ");
            }
        }
    }

    private boolean dumpWindows(PrintWriter pw, String name, String[] args, int opti,
            boolean dumpAll) {
        final ArrayList<WindowState> windows = new ArrayList();
        if ("apps".equals(name) || "visible".equals(name) || "visible-apps".equals(name)) {
            final boolean appsOnly = name.contains("apps");
            final boolean visibleOnly = name.contains("visible");
            synchronized(mWindowMap) {
                if (appsOnly) {
                    mRoot.dumpDisplayContents(pw);
                }

                mRoot.forAllWindows((w) -> {
                    if ((!visibleOnly || w.mWinAnimator.getShown())
                            && (!appsOnly || w.mAppToken != null)) {
                        windows.add(w);
                    }
                }, true /* traverseTopToBottom */);
            }
        } else {
            synchronized(mWindowMap) {
                mRoot.getWindowsByName(windows, name);
            }
        }

        if (windows.size() <= 0) {
            return false;
        }

        synchronized(mWindowMap) {
            dumpWindowsLocked(pw, dumpAll, windows);
        }
        return true;
    }
}

```

### PhoneWindowManager

```java

public class PhoneWindowManager implements WindowManagerPolicy {

    @Override
    public void dump(String prefix, PrintWriter pw, String[] args) {
        pw.print(prefix); pw.print("mSafeMode="); pw.print(mSafeMode);
                pw.print(" mSystemReady="); pw.print(mSystemReady);
                pw.print(" mSystemBooted="); pw.println(mSystemBooted);
        pw.print(prefix); pw.print("mLidState=");
                pw.print(WindowManagerFuncs.lidStateToString(mLidState));
                pw.print(" mLidOpenRotation=");
                pw.println(Surface.rotationToString(mLidOpenRotation));
        pw.print(prefix); pw.print("mCameraLensCoverState=");
                pw.print(WindowManagerFuncs.cameraLensStateToString(mCameraLensCoverState));
                pw.print(" mHdmiPlugged="); pw.println(mHdmiPlugged);
        if (mLastSystemUiFlags != 0 || mResettingSystemUiFlags != 0
                || mForceClearedSystemUiFlags != 0) {
            pw.print(prefix); pw.print("mLastSystemUiFlags=0x");
                    pw.print(Integer.toHexString(mLastSystemUiFlags));
                    pw.print(" mResettingSystemUiFlags=0x");
                    pw.print(Integer.toHexString(mResettingSystemUiFlags));
                    pw.print(" mForceClearedSystemUiFlags=0x");
                    pw.println(Integer.toHexString(mForceClearedSystemUiFlags));
        }
        if (mLastFocusNeedsMenu) {
            pw.print(prefix); pw.print("mLastFocusNeedsMenu=");
                    pw.println(mLastFocusNeedsMenu);
        }
        pw.print(prefix); pw.print("mWakeGestureEnabledSetting=");
                pw.println(mWakeGestureEnabledSetting);

        pw.print(prefix);
                pw.print("mSupportAutoRotation="); pw.print(mSupportAutoRotation);
                pw.print(" mOrientationSensorEnabled="); pw.println(mOrientationSensorEnabled);
        pw.print(prefix); pw.print("mUiMode="); pw.print(Configuration.uiModeToString(mUiMode));
                pw.print(" mDockMode="); pw.println(Intent.dockStateToString(mDockMode));
        pw.print(prefix); pw.print("mEnableCarDockHomeCapture=");
                pw.print(mEnableCarDockHomeCapture);
                pw.print(" mCarDockRotation=");
                pw.print(Surface.rotationToString(mCarDockRotation));
                pw.print(" mDeskDockRotation=");
                pw.println(Surface.rotationToString(mDeskDockRotation));
        pw.print(prefix); pw.print("mUserRotationMode=");
                pw.print(WindowManagerPolicy.userRotationModeToString(mUserRotationMode));
                pw.print(" mUserRotation="); pw.print(Surface.rotationToString(mUserRotation));
                pw.print(" mAllowAllRotations=");
                pw.println(allowAllRotationsToString(mAllowAllRotations));
        pw.print(prefix); pw.print("mCurrentAppOrientation=");
                pw.println(ActivityInfo.screenOrientationToString(mCurrentAppOrientation));
        pw.print(prefix); pw.print("mCarDockEnablesAccelerometer=");
                pw.print(mCarDockEnablesAccelerometer);
                pw.print(" mDeskDockEnablesAccelerometer=");
                pw.println(mDeskDockEnablesAccelerometer);
        pw.print(prefix); pw.print("mLidKeyboardAccessibility=");
                pw.print(mLidKeyboardAccessibility);
                pw.print(" mLidNavigationAccessibility="); pw.print(mLidNavigationAccessibility);
                pw.print(" mLidControlsScreenLock="); pw.println(mLidControlsScreenLock);
        pw.print(prefix); pw.print("mLidControlsSleep="); pw.println(mLidControlsSleep);
        pw.print(prefix);
                pw.print("mLongPressOnBackBehavior=");
                pw.println(longPressOnBackBehaviorToString(mLongPressOnBackBehavior));
        pw.print(prefix);
                pw.print("mLongPressOnHomeBehavior=");
                pw.println(longPressOnHomeBehaviorToString(mLongPressOnHomeBehavior));
        pw.print(prefix);
                pw.print("mDoubleTapOnHomeBehavior=");
                pw.println(doubleTapOnHomeBehaviorToString(mDoubleTapOnHomeBehavior));
        pw.print(prefix);
                pw.print("mShortPressOnPowerBehavior=");
                pw.println(shortPressOnPowerBehaviorToString(mShortPressOnPowerBehavior));
        pw.print(prefix);
                pw.print("mLongPressOnPowerBehavior=");
                pw.println(longPressOnPowerBehaviorToString(mLongPressOnPowerBehavior));
        pw.print(prefix);
                pw.print("mVeryLongPressOnPowerBehavior=");
                pw.println(veryLongPressOnPowerBehaviorToString(mVeryLongPressOnPowerBehavior));
        pw.print(prefix);
                pw.print("mDoublePressOnPowerBehavior=");
                pw.println(multiPressOnPowerBehaviorToString(mDoublePressOnPowerBehavior));
        pw.print(prefix);
                pw.print("mTriplePressOnPowerBehavior=");
                pw.println(multiPressOnPowerBehaviorToString(mTriplePressOnPowerBehavior));
        pw.print(prefix);
                pw.print("mShortPressOnSleepBehavior=");
                pw.println(shortPressOnSleepBehaviorToString(mShortPressOnSleepBehavior));
        pw.print(prefix);
                pw.print("mShortPressOnWindowBehavior=");
                pw.println(shortPressOnWindowBehaviorToString(mShortPressOnWindowBehavior));
        pw.print(prefix);
                pw.print("mAllowStartActivityForLongPressOnPowerDuringSetup=");
                pw.println(mAllowStartActivityForLongPressOnPowerDuringSetup);
        pw.print(prefix);
                pw.print("mHasSoftInput="); pw.print(mHasSoftInput);
                pw.print(" mDismissImeOnBackKeyPressed="); pw.println(mDismissImeOnBackKeyPressed);
        pw.print(prefix);
                pw.print("mIncallPowerBehavior=");
                pw.print(incallPowerBehaviorToString(mIncallPowerBehavior));
                pw.print(" mIncallBackBehavior=");
                pw.print(incallBackBehaviorToString(mIncallBackBehavior));
                pw.print(" mEndcallBehavior=");
                pw.println(endcallBehaviorToString(mEndcallBehavior));
        pw.print(prefix); pw.print("mHomePressed="); pw.println(mHomePressed);
        pw.print(prefix);
                pw.print("mAwake="); pw.print(mAwake);
                pw.print("mScreenOnEarly="); pw.print(mScreenOnEarly);
                pw.print(" mScreenOnFully="); pw.println(mScreenOnFully);
        pw.print(prefix); pw.print("mKeyguardDrawComplete="); pw.print(mKeyguardDrawComplete);
                pw.print(" mWindowManagerDrawComplete="); pw.println(mWindowManagerDrawComplete);
        pw.print(prefix); pw.print("mDockLayer="); pw.print(mDockLayer);
                pw.print(" mStatusBarLayer="); pw.println(mStatusBarLayer);
        pw.print(prefix); pw.print("mShowingDream="); pw.print(mShowingDream);
                pw.print(" mDreamingLockscreen="); pw.print(mDreamingLockscreen);
                pw.print(" mDreamingSleepToken="); pw.println(mDreamingSleepToken);
        if (mLastInputMethodWindow != null) {
            pw.print(prefix); pw.print("mLastInputMethodWindow=");
                    pw.println(mLastInputMethodWindow);
        }
        if (mLastInputMethodTargetWindow != null) {
            pw.print(prefix); pw.print("mLastInputMethodTargetWindow=");
                    pw.println(mLastInputMethodTargetWindow);
        }
        //---------------------------------------状态栏------------------------------------
        if (mStatusBar != null) {
            pw.print(prefix); pw.print("mStatusBar=");
                    pw.print(mStatusBar); pw.print(" isStatusBarKeyguard=");
                    pw.println(isStatusBarKeyguard());
        }
        if (mNavigationBar != null) {
            pw.print(prefix); pw.print("mNavigationBar=");
                    pw.println(mNavigationBar);
        }
        if (mFocusedWindow != null) {
            pw.print(prefix); pw.print("mFocusedWindow=");
                    pw.println(mFocusedWindow);
        }
        if (mFocusedApp != null) {
            pw.print(prefix); pw.print("mFocusedApp=");
                    pw.println(mFocusedApp);
        }
        //-------------------------------------------------------------------------------
        if (mTopFullscreenOpaqueWindowState != null) {
            pw.print(prefix); pw.print("mTopFullscreenOpaqueWindowState=");
                    pw.println(mTopFullscreenOpaqueWindowState);
        }
        if (mTopFullscreenOpaqueOrDimmingWindowState != null) {
            pw.print(prefix); pw.print("mTopFullscreenOpaqueOrDimmingWindowState=");
                    pw.println(mTopFullscreenOpaqueOrDimmingWindowState);
        }
        if (mForcingShowNavBar) {
            pw.print(prefix); pw.print("mForcingShowNavBar=");
                    pw.println(mForcingShowNavBar); pw.print( "mForcingShowNavBarLayer=");
                    pw.println(mForcingShowNavBarLayer);
        }
        pw.print(prefix); pw.print("mTopIsFullscreen="); pw.print(mTopIsFullscreen);
                pw.print(" mKeyguardOccluded="); pw.println(mKeyguardOccluded);
        pw.print(prefix);
                pw.print("mKeyguardOccludedChanged="); pw.print(mKeyguardOccludedChanged);
                pw.print(" mPendingKeyguardOccluded="); pw.println(mPendingKeyguardOccluded);
        pw.print(prefix); pw.print("mForceStatusBar="); pw.print(mForceStatusBar);
                pw.print(" mForceStatusBarFromKeyguard=");
                pw.println(mForceStatusBarFromKeyguard);
        pw.print(prefix); pw.print("mAllowLockscreenWhenOn="); pw.print(mAllowLockscreenWhenOn);
                pw.print(" mLockScreenTimeout="); pw.print(mLockScreenTimeout);
                pw.print(" mLockScreenTimerActive="); pw.println(mLockScreenTimerActive);
        pw.print(prefix); pw.print("mLandscapeRotation=");
                pw.print(Surface.rotationToString(mLandscapeRotation));
                pw.print(" mSeascapeRotation=");
                pw.println(Surface.rotationToString(mSeascapeRotation));
        pw.print(prefix); pw.print("mPortraitRotation=");
                pw.print(Surface.rotationToString(mPortraitRotation));
                pw.print(" mUpsideDownRotation=");
                pw.println(Surface.rotationToString(mUpsideDownRotation));
        pw.print(prefix); pw.print("mDemoHdmiRotation=");
                pw.print(Surface.rotationToString(mDemoHdmiRotation));
                pw.print(" mDemoHdmiRotationLock="); pw.println(mDemoHdmiRotationLock);
        pw.print(prefix); pw.print("mUndockedHdmiRotation=");
                pw.println(Surface.rotationToString(mUndockedHdmiRotation));
        if (mHasFeatureLeanback) {
            pw.print(prefix);
            pw.print("mAccessibilityTvKey1Pressed="); pw.println(mAccessibilityTvKey1Pressed);
            pw.print(prefix);
            pw.print("mAccessibilityTvKey2Pressed="); pw.println(mAccessibilityTvKey2Pressed);
            pw.print(prefix);
            pw.print("mAccessibilityTvScheduled="); pw.println(mAccessibilityTvScheduled);
        }

        mGlobalKeyManager.dump(prefix, pw);
        mStatusBarController.dump(pw, prefix);
        mNavigationBarController.dump(pw, prefix);
        PolicyControl.dump(prefix, pw);

        if (mWakeGestureListener != null) {
            mWakeGestureListener.dump(pw, prefix);
        }
        if (mOrientationListener != null) {
            mOrientationListener.dump(pw, prefix);
        }
        if (mBurnInProtectionHelper != null) {
            mBurnInProtectionHelper.dump(prefix, pw);
        }
        if (mKeyguardDelegate != null) {
            mKeyguardDelegate.dump(prefix, pw);
        }

        pw.print(prefix); pw.println("Looper state:");
        mHandler.getLooper().dump(new PrintWriterPrinter(pw), prefix + "  ");
    }

}

```

### RootWindowContainer

```java

class RootWindowContainer extends WindowContainer<DisplayContent> {

    void dumpTokens(PrintWriter pw, boolean dumpAll) {
        pw.println("  All tokens:");
        for (int i = mChildren.size() - 1; i >= 0; --i) {
            mChildren.get(i).dumpTokens(pw, dumpAll);
        }
    }

    void dumpWindowsNoHeader(PrintWriter pw, boolean dumpAll, ArrayList<WindowState> windows) {
        final int[] index = new int[1];
        forAllWindows((w) -> {
            if (windows == null || windows.contains(w)) {
                pw.println("  Window #" + index[0] + " " + w + ":");
                w.dump(pw, "    ", dumpAll || windows != null);
                index[0] = index[0] + 1;
            }
        }, true /* traverseTopToBottom */);
    }

}

```

### WindowState

```java

/** A window in the window manager. */
class WindowState extends WindowContainer<WindowState> implements WindowManagerPolicy.WindowState {

    @Override
    void dump(PrintWriter pw, String prefix, boolean dumpAll) {
        final TaskStack stack = getStack();
        pw.print(prefix); pw.print("mDisplayId="); pw.print(getDisplayId());
                if (stack != null) {
                    pw.print(" stackId="); pw.print(stack.mStackId);
                }
                pw.print(" mSession="); pw.print(mSession);
                pw.print(" mClient="); pw.println(mClient.asBinder());
        pw.print(prefix); pw.print("mOwnerUid="); pw.print(mOwnerUid);
                pw.print(" mShowToOwnerOnly="); pw.print(mShowToOwnerOnly);
                pw.print(" package="); pw.print(mAttrs.packageName);
                pw.print(" appop="); pw.println(AppOpsManager.opToName(mAppOp));
        pw.print(prefix); pw.print("mAttrs="); pw.println(mAttrs.toString(prefix));
        pw.print(prefix); pw.print("Requested w="); pw.print(mRequestedWidth);
                pw.print(" h="); pw.print(mRequestedHeight);
                pw.print(" mLayoutSeq="); pw.println(mLayoutSeq);
        if (mRequestedWidth != mLastRequestedWidth || mRequestedHeight != mLastRequestedHeight) {
            pw.print(prefix); pw.print("LastRequested w="); pw.print(mLastRequestedWidth);
                    pw.print(" h="); pw.println(mLastRequestedHeight);
        }
        if (mIsChildWindow || mLayoutAttached) {
            pw.print(prefix); pw.print("mParentWindow="); pw.print(getParentWindow());
                    pw.print(" mLayoutAttached="); pw.println(mLayoutAttached);
        }
        if (mIsImWindow || mIsWallpaper || mIsFloatingLayer) {
            pw.print(prefix); pw.print("mIsImWindow="); pw.print(mIsImWindow);
                    pw.print(" mIsWallpaper="); pw.print(mIsWallpaper);
                    pw.print(" mIsFloatingLayer="); pw.print(mIsFloatingLayer);
                    pw.print(" mWallpaperVisible="); pw.println(mWallpaperVisible);
        }
        if (dumpAll) {
            pw.print(prefix); pw.print("mBaseLayer="); pw.print(mBaseLayer);
                    pw.print(" mSubLayer="); pw.print(mSubLayer);
                    pw.print(" mAnimLayer="); pw.print(mLayer); pw.print("+");
                    pw.print("="); pw.print(mWinAnimator.mAnimLayer);
                    pw.print(" mLastLayer="); pw.println(mWinAnimator.mLastLayer);
        }
        if (dumpAll) {
            pw.print(prefix); pw.print("mToken="); pw.println(mToken);
            if (mAppToken != null) {
                pw.print(prefix); pw.print("mAppToken="); pw.println(mAppToken);
                pw.print(prefix); pw.print(" isAnimatingWithSavedSurface()=");
                pw.print(" mAppDied=");pw.print(mAppDied);
                pw.print(prefix); pw.print("drawnStateEvaluated=");
                        pw.print(getDrawnStateEvaluated());
                pw.print(prefix); pw.print("mightAffectAllDrawn=");
                        pw.println(mightAffectAllDrawn());
            }
            pw.print(prefix); pw.print("mViewVisibility=0x");
            pw.print(Integer.toHexString(mViewVisibility));
            pw.print(" mHaveFrame="); pw.print(mHaveFrame);
            pw.print(" mObscured="); pw.println(mObscured);
            pw.print(prefix); pw.print("mSeq="); pw.print(mSeq);
            pw.print(" mSystemUiVisibility=0x");
            pw.println(Integer.toHexString(mSystemUiVisibility));
        }
        if (!mPolicyVisibility || !mPolicyVisibilityAfterAnim || !mAppOpVisibility
                || isParentWindowHidden()|| mPermanentlyHidden || mForceHideNonSystemOverlayWindow
                || mHiddenWhileSuspended) {
            pw.print(prefix); pw.print("mPolicyVisibility=");
                    pw.print(mPolicyVisibility);
                    pw.print(" mPolicyVisibilityAfterAnim=");
                    pw.print(mPolicyVisibilityAfterAnim);
                    pw.print(" mAppOpVisibility=");
                    pw.print(mAppOpVisibility);
                    pw.print(" parentHidden="); pw.print(isParentWindowHidden());
                    pw.print(" mPermanentlyHidden="); pw.print(mPermanentlyHidden);
                    pw.print(" mHiddenWhileSuspended="); pw.print(mHiddenWhileSuspended);
                    pw.print(" mForceHideNonSystemOverlayWindow="); pw.println(
                    mForceHideNonSystemOverlayWindow);
        }
        if (!mRelayoutCalled || mLayoutNeeded) {
            pw.print(prefix); pw.print("mRelayoutCalled="); pw.print(mRelayoutCalled);
                    pw.print(" mLayoutNeeded="); pw.println(mLayoutNeeded);
        }
        if (dumpAll) {
            pw.print(prefix); pw.print("mGivenContentInsets=");
                    mGivenContentInsets.printShortString(pw);
                    pw.print(" mGivenVisibleInsets=");
                    mGivenVisibleInsets.printShortString(pw);
                    pw.println();
            if (mTouchableInsets != 0 || mGivenInsetsPending) {
                pw.print(prefix); pw.print("mTouchableInsets="); pw.print(mTouchableInsets);
                        pw.print(" mGivenInsetsPending="); pw.println(mGivenInsetsPending);
                Region region = new Region();
                getTouchableRegion(region);
                pw.print(prefix); pw.print("touchable region="); pw.println(region);
            }
            pw.print(prefix); pw.print("mFullConfiguration="); pw.println(getConfiguration());
            pw.print(prefix); pw.print("mLastReportedConfiguration=");
                    pw.println(getLastReportedConfiguration());
        }
        pw.print(prefix); pw.print("mHasSurface="); pw.print(mHasSurface);
                pw.print(" isReadyForDisplay()="); pw.print(isReadyForDisplay());
                pw.print(" mWindowRemovalAllowed="); pw.println(mWindowRemovalAllowed);
        if (dumpAll) {
            pw.print(prefix); pw.print("mFrame="); mFrame.printShortString(pw);
                    pw.print(" last="); mLastFrame.printShortString(pw);
                    pw.println();
        }
        if (mEnforceSizeCompat) {
            pw.print(prefix); pw.print("mCompatFrame="); mCompatFrame.printShortString(pw);
                    pw.println();
        }
        if (dumpAll) {
            pw.print(prefix); pw.print("Frames: containing=");
                    mContainingFrame.printShortString(pw);
                    pw.print(" parent="); mParentFrame.printShortString(pw);
                    pw.println();
            pw.print(prefix); pw.print("    display="); mDisplayFrame.printShortString(pw);
                    pw.print(" overscan="); mOverscanFrame.printShortString(pw);
                    pw.println();
            pw.print(prefix); pw.print("    content="); mContentFrame.printShortString(pw);
                    pw.print(" visible="); mVisibleFrame.printShortString(pw);
                    pw.println();
            pw.print(prefix); pw.print("    decor="); mDecorFrame.printShortString(pw);
                    pw.println();
            pw.print(prefix); pw.print("    outset="); mOutsetFrame.printShortString(pw);
                    pw.println();
            pw.print(prefix); pw.print("Cur insets: overscan=");
                    mOverscanInsets.printShortString(pw);
                    pw.print(" content="); mContentInsets.printShortString(pw);
                    pw.print(" visible="); mVisibleInsets.printShortString(pw);
                    pw.print(" stable="); mStableInsets.printShortString(pw);
                    pw.print(" surface="); mAttrs.surfaceInsets.printShortString(pw);
                    pw.print(" outsets="); mOutsets.printShortString(pw);
            pw.print(" cutout=" + mDisplayCutout.getDisplayCutout());
                    pw.println();
            pw.print(prefix); pw.print("Lst insets: overscan=");
                    mLastOverscanInsets.printShortString(pw);
                    pw.print(" content="); mLastContentInsets.printShortString(pw);
                    pw.print(" visible="); mLastVisibleInsets.printShortString(pw);
                    pw.print(" stable="); mLastStableInsets.printShortString(pw);
                    pw.print(" physical="); mLastOutsets.printShortString(pw);
                    pw.print(" outset="); mLastOutsets.printShortString(pw);
                    pw.print(" cutout=" + mLastDisplayCutout);
                    pw.println();
        }
        super.dump(pw, prefix, dumpAll);
        pw.print(prefix); pw.print(mWinAnimator); pw.println(":");
        mWinAnimator.dump(pw, prefix + "  ", dumpAll);
        if (mAnimatingExit || mRemoveOnExit || mDestroying || mRemoved) {
            pw.print(prefix); pw.print("mAnimatingExit="); pw.print(mAnimatingExit);
                    pw.print(" mRemoveOnExit="); pw.print(mRemoveOnExit);
                    pw.print(" mDestroying="); pw.print(mDestroying);
                    pw.print(" mRemoved="); pw.println(mRemoved);
        }
        if (getOrientationChanging() || mAppFreezing || mReportOrientationChanged) {
            pw.print(prefix); pw.print("mOrientationChanging=");
                    pw.print(mOrientationChanging);
                    pw.print(" configOrientationChanging=");
                    pw.print(getLastReportedConfiguration().orientation
                            != getConfiguration().orientation);
                    pw.print(" mAppFreezing="); pw.print(mAppFreezing);
                    pw.print(" mReportOrientationChanged="); pw.println(mReportOrientationChanged);
        }
        if (mLastFreezeDuration != 0) {
            pw.print(prefix); pw.print("mLastFreezeDuration=");
                    TimeUtils.formatDuration(mLastFreezeDuration, pw); pw.println();
        }
        if (mForceSeamlesslyRotate) {
            pw.print(prefix); pw.print("forceSeamlesslyRotate: pending=");
            if (mPendingForcedSeamlessRotate != null) {
                mPendingForcedSeamlessRotate.dump(pw);
            } else {
                pw.print("null");
            }
            pw.print(" finishedFrameNumber="); pw.print(mFinishForcedSeamlessRotateFrameNumber);
            pw.println();
        }
        if (mHScale != 1 || mVScale != 1) {
            pw.print(prefix); pw.print("mHScale="); pw.print(mHScale);
                    pw.print(" mVScale="); pw.println(mVScale);
        }
        if (mWallpaperX != -1 || mWallpaperY != -1) {
            pw.print(prefix); pw.print("mWallpaperX="); pw.print(mWallpaperX);
                    pw.print(" mWallpaperY="); pw.println(mWallpaperY);
        }
        if (mWallpaperXStep != -1 || mWallpaperYStep != -1) {
            pw.print(prefix); pw.print("mWallpaperXStep="); pw.print(mWallpaperXStep);
                    pw.print(" mWallpaperYStep="); pw.println(mWallpaperYStep);
        }
        if (mWallpaperDisplayOffsetX != Integer.MIN_VALUE
                || mWallpaperDisplayOffsetY != Integer.MIN_VALUE) {
            pw.print(prefix); pw.print("mWallpaperDisplayOffsetX=");
                    pw.print(mWallpaperDisplayOffsetX);
                    pw.print(" mWallpaperDisplayOffsetY=");
                    pw.println(mWallpaperDisplayOffsetY);
        }
        if (mDrawLock != null) {
            pw.print(prefix); pw.println("mDrawLock=" + mDrawLock);
        }
        if (isDragResizing()) {
            pw.print(prefix); pw.println("isDragResizing=" + isDragResizing());
        }
        if (computeDragResizing()) {
            pw.print(prefix); pw.println("computeDragResizing=" + computeDragResizing());
        }
        pw.print(prefix); pw.println("isOnScreen=" + isOnScreen());
        pw.print(prefix); pw.println("isVisible=" + isVisible());
    }
}

```


