---
layout:     post
title:      Android Freeform Mode
subtitle:   类似于 Windows 的窗口模式
date:       2020-07-29
author:     LXG
header-img: img/post-bg-e2e-ux.jpg
catalog: true
tags:
    - wms
---

[WindowManagerService架构剖析-简书](https://www.jianshu.com/p/6e575d9160f2)

## AMS

![ams_activity_stack](/images/ams/ams_activity_stack.png)

![ams_data_structure](/images/ams/ams_data_structure.webp)

## WMS

![wms_data_structure](/images/wms/wms_data_structure.webp)

## Token

![window_token](/images/wms/window_token.webp)

[AMS_WMS_APP 中Token惟一性-简书](https://www.jianshu.com/p/5e2efbaa2949)

![wms_token_2](/images/wms/wms_token_2.webp)

### appToken 

```java

/**
 * An entry in the history stack, representing an activity.
 */
final class ActivityRecord extends ConfigurationContainer implements AppWindowContainerListener {

    final IApplicationToken.Stub appToken; // window manager token

    ActivityRecord(ActivityManagerService _service, ProcessRecord _caller, int _launchedFromPid,
            int _launchedFromUid, String _launchedFromPackage, Intent _intent, String _resolvedType,
            ActivityInfo aInfo, Configuration _configuration,
            ActivityRecord _resultTo, String _resultWho, int _reqCode,
            boolean _componentSpecified, boolean _rootVoiceInteraction,
            ActivityStackSupervisor supervisor, ActivityOptions options,
            ActivityRecord sourceRecord) {

        appToken = new Token(this);

    }

    static class Token extends IApplicationToken.Stub {
        private final WeakReference<ActivityRecord> weakActivity;

        Token(ActivityRecord activity) {
            weakActivity = new WeakReference<>(activity);
        }

        private static ActivityRecord tokenToActivityRecordLocked(Token token) {
            if (token == null) {
                return null;
            }
            ActivityRecord r = token.weakActivity.get();
            if (r == null || r.getStack() == null) {
                return null;
            }
            return r;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder(128);
            sb.append("Token{");
            sb.append(Integer.toHexString(System.identityHashCode(this)));
            sb.append(' ');
            sb.append(weakActivity.get());
            sb.append('}');
            return sb.toString();
        }
    }


    void createWindowContainer() {

        // 将token传递到WMS中
        mWindowContainerController = new AppWindowContainerController(taskController, appToken,
                this, Integer.MAX_VALUE /* add on top */, info.screenOrientation, fullscreen,
                (info.flags & FLAG_SHOW_FOR_ALL_USERS) != 0, info.configChanges,
                task.voiceSession != null, mLaunchTaskBehind, isAlwaysFocusable(),
                appInfo.targetSdkVersion, mRotationAnimationHint,
                ActivityManagerService.getInputDispatchingTimeoutLocked(this) * 1000000L,
                getOverrideConfiguration(), mBounds);

    }

}


public class AppWindowContainerController
        extends WindowContainerController<AppWindowToken, AppWindowContainerListener> {

    private final IApplicationToken mToken;

    public AppWindowContainerController(TaskWindowContainerController taskController,
            IApplicationToken token, AppWindowContainerListener listener, int index,
            int requestedOrientation, boolean fullscreen, boolean showForAllUsers, int configChanges,
            boolean voiceInteraction, boolean launchTaskBehind, boolean alwaysFocusable,
            int targetSdkVersion, int rotationAnimationHint, long inputDispatchingTimeoutNanos,
            WindowManagerService service, Configuration overrideConfig, Rect bounds) {

        mToken = token;

        synchronized(mWindowMap) {
            AppWindowToken atoken = mRoot.getAppWindowToken(mToken.asBinder());

            atoken = createAppWindow(mService, token, voiceInteraction, task.getDisplayContent(),
                    inputDispatchingTimeoutNanos, fullscreen, showForAllUsers, targetSdkVersion,
                    requestedOrientation, rotationAnimationHint, configChanges, launchTaskBehind,
                    alwaysFocusable, this, overrideConfig, bounds);

        }
    }


    AppWindowToken createAppWindow(WindowManagerService service, IApplicationToken token,
            boolean voiceInteraction, DisplayContent dc, long inputDispatchingTimeoutNanos,
            boolean fullscreen, boolean showForAllUsers, int targetSdk, int orientation,
            int rotationAnimationHint, int configChanges, boolean launchTaskBehind,
            boolean alwaysFocusable, AppWindowContainerController controller,
            Configuration overrideConfig, Rect bounds) {
        return new AppWindowToken(service, token, voiceInteraction, dc,
                inputDispatchingTimeoutNanos, fullscreen, showForAllUsers, targetSdk, orientation,
                rotationAnimationHint, configChanges, launchTaskBehind, alwaysFocusable,
                controller, overrideConfig, bounds);
    }


}


class AppWindowToken extends WindowToken implements WindowManagerService.AppFreezeListener {

    // Non-null only for application tokens.
    final IApplicationToken appToken;

    AppWindowToken(WindowManagerService service, IApplicationToken token, boolean voiceInteraction,
            DisplayContent dc, boolean fillsParent, Configuration overrideConfig, Rect bounds) {
        super(service, token != null ? token.asBinder() : null, TYPE_APPLICATION, true, dc,
                false /* ownerCanManageAppTokens */);
        appToken = token;

    }

}

class WindowToken extends WindowContainer<WindowState> {

    // The actual token.
    final IBinder token;


    WindowToken(WindowManagerService service, IBinder _token, int type, boolean persistOnEmpty,
            DisplayContent dc, boolean ownerCanManageAppTokens) {

        token = _token;

    }
}

public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener {

    final boolean realStartActivityLocked(ActivityRecord r, ProcessRecord app,
            boolean andResume, boolean checkConfig) throws RemoteException {

                app.thread.scheduleLaunchActivity(new Intent(r.intent), r.appToken,
                        System.identityHashCode(r), r.info,
                        // TODO: Have this take the merged configuration instead of separate global
                        // and override configs.
                        mergedConfiguration.getGlobalConfiguration(),
                        mergedConfiguration.getOverrideConfiguration(), r.compat,
                        r.launchedFromPackage, task.voiceInteractor, app.repProcState, r.icicle,
                        r.persistentState, results, newIntents, !andResume,
                        mService.isNextTransitionForward(), profilerInfo);

    }

}


public final class ActivityThread {

   private class ApplicationThread extends IApplicationThread.Stub {


        // we use token to identify this activity without having to send the
        // activity itself back to the activity manager. (matters more with ipc)
        @Override
        public final void scheduleLaunchActivity(Intent intent, IBinder token, int ident,
                ActivityInfo info, Configuration curConfig, Configuration overrideConfig,
                CompatibilityInfo compatInfo, String referrer, IVoiceInteractor voiceInteractor,
                int procState, Bundle state, PersistableBundle persistentState,
                List<ResultInfo> pendingResults, List<ReferrerIntent> pendingNewIntents,
                boolean notResumed, boolean isForward, ProfilerInfo profilerInfo) {

            ActivityClientRecord r = new ActivityClientRecord();

            r.token = token;

        }

   }

}


```


## AMS vs WMS

[Android之AMS和WMS数据对应关系(基于Android9.0)-简书](https://www.jianshu.com/p/c14b1a5a3a84)

![ams_wms](/images/ams/ams_wms.webp)



