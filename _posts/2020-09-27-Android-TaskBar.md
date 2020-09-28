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

    private LinearLayout taskbar;

    private void drawTaskbar(UIHost host) {

        ----------------------------------------------------------------------

        layoutId = getTaskbarLayoutId(taskbarPosition);

        ---------------------------------------------------------------------

        layout = (LinearLayout) LayoutInflater.from(U.wrapContext(context)).inflate(layoutId, null);
        taskbar = layout.findViewById(R.id.taskbar);

        ---------------------------------------------------------------------

        startRefreshingRecents();

        host.addView(layout, params);

    }


    int getTaskbarLayoutId(String taskbarPosition) {
        int layoutId = R.layout.tb_taskbar_left;
    }

    // 获取最近启动的应用列表
    private void startRefreshingRecents() {

            updateRecentApps(true);

    }


    private void updateRecentApps(final boolean firstRefresh) {

        ---------------------------------------------------------

                        taskbar.removeAllViews();
                        for(int i = 0; i < entries.size(); i++) {
                            taskbar.addView(getView(entries, i));
                        }

        ---------------------------------------------------------
    }

    private View getView(List<AppEntry> list, int position) {
        View convertView = View.inflate(context, R.layout.tb_icon, null);

        ----------------------------------------------------------------

        FrameLayout layout = convertView.findViewById(R.id.entry);
        layout.setOnClickListener(view -> U.launchApp(
                context,
                entry,
                null,
                true,
                false,
                view
        ));

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

    private StartMenuLayout layout;
    private GridView startMenu;

    @Override
    public void onCreateHost(UIHost host) {
        init(context, host, () -> drawStartMenu(host));
    }

    private void drawStartMenu(UIHost host) {

        layoutId = getStartMenuLayoutId(taskbarPosition);

        layout = (StartMenuLayout) LayoutInflater.from(U.wrapContext(context)).inflate(layoutId, null);


        startMenu = layout.findViewById(R.id.start_menu);

            startMenu.setOnItemClickListener((viewParent, view, position, id) -> {
                hideStartMenu(true);

                AppEntry entry = (AppEntry) viewParent.getAdapter().getItem(position);

                // 启动应用
                U.launchApp(context, entry, null, false, false, view);
            });

        host.addView(layout, params);

    }

    int getStartMenuLayoutId(String taskbarPosition) {
                return R.layout.tb_start_menu_left;
    }

}

```

## 启动参数

```java

public class U {

    private static void launchApp(final Context context,
                                  final AppEntry entry,                 // 应用信息
                                  final String windowSize,              // 窗口大小
                                  final boolean launchedFromTaskbar,    // 是否从任务栏启动
                                  final boolean isPersistentShortcut,
                                  final boolean openInNewWindow,        // 是否在新的窗口打开
                                  final ShortcutInfo shortcut,
                                  final View view,
                                  final Runnable onError) {
        launchApp(context, launchedFromTaskbar, isPersistentShortcut, () ->
                continueLaunchingApp(context, entry, windowSize, openInNewWindow, shortcut, view, onError)
        );
    }


    private static void continueLaunchingApp(Context context,
                                             AppEntry entry,
                                             String windowSize,
                                             boolean openInNewWindow,
                                             ShortcutInfo shortcut,
                                             View view,
                                             Runnable onError) {

        Intent intent = new Intent();
        intent.setComponent(ComponentName.unflattenFromString(entry.getComponentName()));
        intent.setAction(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

        // 关闭动画
        intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);

        -------------------------------------------------------------------------------------------

        // 获取启动参数
        // android.activity.windowingMode=5 (freeform)
        // android:activity.launchBounds=Rect(600, 36 - 1200, 1280)
        Bundle bundle = getActivityOptionsBundle(context, type, windowSize, view, entry.getPackageName());

        prepareToStartActivity(context, realOpenInNewWindow, () -> {
                        context.startActivity(intent, bundle);
        });

        if(shouldCollapse(context, true)) {
            sendBroadcast(context, ACTION_HIDE_TASKBAR);
        } else {
            sendBroadcast(context, ACTION_HIDE_START_MENU);
        }
    }

}

```

## 主界面-AboutFragment

```java

public class AboutFragment extends SettingsFragment {

    @Override
    public boolean onPreferenceClick(final Preference p) {
        final SharedPreferences pref = U.getSharedPreferences(getActivity());

        switch(p.getKey()) {
            case PREF_PREF_SCREEN_GENERAL:
                navigateTo(new GeneralFragment());          // 常规设置
                break;
            case PREF_PREF_SCREEN_APPEARANCE:               // 外观
                navigateTo(new AppearanceFragment());
                break;
            case PREF_PREF_SCREEN_RECENT_APPS:              // 最近应用
                navigateTo(new RecentAppsFragment());
                break;
            case PREF_PREF_SCREEN_FREEFORM:
                navigateTo(new FreeformModeFragment());     // 自由模式
                break;
            case PREF_PREF_SCREEN_DESKTOP_MODE:
                navigateTo(new DesktopModeFragment());      // 桌面模式
                break;
            case PREF_PREF_SCREEN_ADVANCED:
                navigateTo(new AdvancedFragment());         // 高级功能
                break;
        }

        return super.onPreferenceClick(p);
    }

}

```








