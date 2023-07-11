---
layout:     post
title:      Android SystemUI
subtitle:   Android 7.1(N)
date:       2023-07-11
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - systemui
---

## 下拉栏

[systemui_qspanel](/images/systemui/systemui_qspanel.png)

## 架构图

![systemui_arch](/images/systemui/systemui_arch.png)

## SystemServer

```java

public final class SystemServer {

    private void startOtherServices() {

        mActivityManagerService.systemReady(new Runnable() {
            @Override
            public void run() {
                Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartSystemUI");
                try {
                    startSystemUi(context);
                } catch (Throwable e) {
                    reportWtf("starting System UI", e);
                }
                Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
            }
        }
    }

    static final void startSystemUi(Context context) {
        Intent intent = new Intent();
        intent.setComponent(new ComponentName("com.android.systemui",
                    "com.android.systemui.SystemUIService"));
        intent.addFlags(Intent.FLAG_DEBUG_TRIAGED_MISSING);
        //Slog.d(TAG, "Starting service: " + intent);
        context.startServiceAsUser(intent, UserHandle.SYSTEM);
    }
}

```

## SystemUIService

```java

public class SystemUIService extends Service {

    @Override
    public void onCreate() {
        super.onCreate();
        ((SystemUIApplication) getApplication()).startServicesIfNeeded();
    }
}

```

## SystemUIApplication

```java

public class SystemUIApplication extends Application {

    private static final String TAG = "SystemUIService";
    private static final boolean DEBUG = false;

    /**
     * The classes of the stuff to start.
     */
    private final Class<?>[] SERVICES = new Class[] {
            com.android.systemui.tuner.TunerService.class,
            com.android.systemui.keyguard.KeyguardViewMediator.class,
            com.android.systemui.recents.Recents.class,
            com.android.systemui.volume.VolumeUI.class,
            Divider.class,
            com.android.systemui.statusbar.SystemBars.class,
            com.android.systemui.usb.StorageNotification.class,
            com.android.systemui.power.PowerUI.class,
            com.android.systemui.media.RingtonePlayer.class,
            com.android.systemui.keyboard.KeyboardUI.class,
            com.android.systemui.tv.pip.PipUI.class,
            com.android.systemui.shortcut.ShortcutKeyDispatcher.class,
            com.android.systemui.VendorServices.class
    };

    public void startServicesIfNeeded() {
        startServicesIfNeeded(SERVICES);
    }

}

```

## SystemBars

状态栏和导航栏

```java

public class SystemBars extends SystemUI implements ServiceMonitor.Callbacks {

    @Override
    public void onNoService() {
        if (DEBUG) Log.d(TAG, "onNoService");

        // <string name="config_statusBarComponent" translatable="false">com.android.systemui.statusbar.phone.PhoneStatusBar</string>
        createStatusBarFromConfig();  // fallback to using an in-process implementation
    }

}

```

## PhoneStatusBar

public class PhoneStatusBar extends BaseStatusBar {

    @Override
    public void start() {

        super.start(); // calls createAndAddWindows()

        addNavigationBar();

    }

    @Override
    public void createAndAddWindows() {
        addStatusBarWindow();
    }

    private void addStatusBarWindow() {
        makeStatusBarView();
    }

    // ================================================================================
    // Constructing the view
    // ================================================================================
    protected PhoneStatusBarView makeStatusBarView() {

        inflateStatusBarWindow(context);


        // Set up the quick settings tile panel
        AutoReinflateContainer container = (AutoReinflateContainer) mStatusBarWindow.findViewById(
                R.id.qs_auto_reinflate_container);
        if (container != null) {
            final QSTileHost qsh = SystemUIFactory.getInstance().createQSTileHost(mContext, this,
                    mBluetoothController, mLocationController, mRotationLockController,
                    mNetworkController, mZenModeController, mHotspotController,
                    mCastController, mFlashlightController,
                    mUserSwitcherController, mUserInfoController, mKeyguardMonitor,
                    mSecurityController, mBatteryController, mIconController,
                    mNextAlarmController);
            mBrightnessMirrorController = new BrightnessMirrorController(mStatusBarWindow);
            container.addInflateListener(new InflateListener() {
                @Override
                public void onInflated(View v) {
                    QSContainer qsContainer = (QSContainer) v.findViewById(
                            R.id.quick_settings_container);
                    qsContainer.setHost(qsh);
                    mQSPanel = qsContainer.getQsPanel();
                    mQSPanel.setBrightnessMirror(mBrightnessMirrorController);
                    mKeyguardStatusBar.setQSPanel(mQSPanel);
                    mHeader = qsContainer.getHeader();
                    initSignalCluster(mHeader);
                    mHeader.setActivityStarter(PhoneStatusBar.this);
                }
            });
        }
    }

    protected void inflateStatusBarWindow(Context context) {
        mStatusBarWindow = (StatusBarWindowView) View.inflate(context,
                R.layout.super_status_bar, null);
    }

}

## QSPanel

```java

public class QSPanel extends LinearLayout implements Tunable, Callback {

    protected final View mBrightnessView;

    private BrightnessController mBrightnessController;

    public QSPanel(Context context, AttributeSet attrs) {
        super(context, attrs);

        mBrightnessView = LayoutInflater.from(context).inflate(
                R.layout.quick_settings_brightness_dialog, this, false);
        addView(mBrightnessView);

        mBrightnessController = new BrightnessController(getContext(),
                (ImageView) findViewById(R.id.brightness_icon),
                (ToggleSlider) findViewById(R.id.brightness_slider));

    }

}

```

























