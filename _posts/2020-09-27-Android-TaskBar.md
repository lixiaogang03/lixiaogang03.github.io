---
layout:     post
title:      Android TaskBar
subtitle:   PC-style productivity for Android
date:       2020-09-27
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - taskbar
---

[Taskbar-github](https://github.com/farmerbb/Taskbar)

## 效果图

![taskbar_1](/images/taskbar_1.png)

![taskbar_2](/images/taskbar_2.png)

## MainActivity

```java

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        proceedWithAppLaunch(savedInstanceState);

    }

    private void proceedWithAppLaunch(Bundle savedInstanceState) {

        --------------------------------------------------------

            setContentView(R.layout.tb_main);

        --------------------------------------------------------

                        startTaskbarService();

        --------------------------------------------------------

    }

    private void startTaskbarService() {

        startService(new Intent(this, TaskbarService.class));
        startService(new Intent(this, StartMenuService.class));
        startService(new Intent(this, DashboardService.class));

    }

}

```

## TaskbarService

```java

public class TaskbarService extends UIHostService {

    @Override
    public UIController newController() {
        return new TaskbarController(this);
    }

}

```

## UIHostService

```java

public abstract class UIHostService extends Service implements UIHost {

    private UIController controller;
    private WindowManager windowManager;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        controller = newController();
        controller.onCreateHost(this);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        controller.onRecreateHost(this);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        controller.onDestroyHost(this);
    }

    @Override
    public void addView(View view, ViewParams params) {
        windowManager.addView(view, params.toWindowManagerParams());
    }

    @Override
    public void removeView(View view) {
        windowManager.removeView(view);
    }

    @Override
    public void terminate() {
        stopSelf();
    }

    public abstract UIController newController();

}

```

## TaskbarController

```java

public class TaskbarController extends UIController {

    private void drawTaskbar(UIHost host) {

        ----------------------------------------------------------------------

        layoutId = getTaskbarLayoutId(taskbarPosition);

        ---------------------------------------------------------------------

        layout = (LinearLayout) LayoutInflater.from(U.wrapContext(context)).inflate(layoutId, null);

        ---------------------------------------------------------------------

        host.addView(layout, params);

    }


    int getTaskbarLayoutId(String taskbarPosition) {
        int layoutId = R.layout.tb_taskbar_left;
    }

}

```

## StartMenuService

```java

public class StartMenuService extends UIHostService {

    @Override
    public UIController newController() {
        return new StartMenuController(this);
    }

}

```

## StartMenuController

```java

public class StartMenuController extends UIController {

    @Override
    public void onCreateHost(UIHost host) {
        init(context, host, () -> drawStartMenu(host));
    }

    private void drawStartMenu(UIHost host) {

        layoutId = getStartMenuLayoutId(taskbarPosition);

        layout = (StartMenuLayout) LayoutInflater.from(U.wrapContext(context)).inflate(layoutId, null);

        host.addView(layout, params);

    }

    int getStartMenuLayoutId(String taskbarPosition) {
                return R.layout.tb_start_menu_left;
    }

}

```

