---
layout:     post
title:      Android WMS
subtitle:   WindowManagerService
date:       2020-07-31
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

## Activity Window View

```java

public class Activity extends ContextThemeWrapper
        implements LayoutInflater.Factory2,
        Window.Callback, KeyEvent.Callback,
        OnCreateContextMenuListener, ComponentCallbacks2,
        Window.OnWindowDismissedCallback, WindowControllerCallback,
        AutofillManager.AutofillClient {


    private IBinder mToken;


    private Window mWindow;

    final void attach(Context context, ActivityThread aThread,
            Instrumentation instr, IBinder token, int ident,
            Application application, Intent intent, ActivityInfo info,
            CharSequence title, Activity parent, String id,
            NonConfigurationInstances lastNonConfigurationInstances,
            Configuration config, String referrer, IVoiceInteractor voiceInteractor,
            Window window, ActivityConfigCallback activityConfigCallback) {
        attachBaseContext(context);

        mWindow = new PhoneWindow(this, window, activityConfigCallback);

        mToken = token;

    }

}

```

![activity_window](/images/wms/activity_window.png)

## WindowManager WindowManagerImpl WindowManagerGlobal

![view_root_impl](/images/wms/view_root_impl.png)

下图引用自[窗口管理-简书](https://www.jianshu.com/p/3b5b6f2469d8)

![window_global](/images/wms/window_global.png)

## AMS App WMS Token

![apptoken](/images/wms/apptoken.png)

[AMS_WMS_APP 中Token惟一性-简书](https://www.jianshu.com/p/5e2efbaa2949)

## Window 加载视图过程

[Window加载视图过程-简书](https://www.jianshu.com/p/b3a1ea7923e7)

![start_activity_gityuan](/images/wms/start_activity_gityuan.webp)

![wms_add_view](/images/wms/wms_add_view.png)

## Input ViewRootImpl

[ViewRootImpl接收事件-简书](https://www.jianshu.com/p/4b4ce5f30ab6)

![input_viewrootimpl](/images/input_manager/input_viewrootimpl.png)

## InputChannel

### 数据结构

![input_channel](/images/input_manager/input_channel.png)

### 事件处理

![input_handle](/images/input_manager/input_handle.png)




