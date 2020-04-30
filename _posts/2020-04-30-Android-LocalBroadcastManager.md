---
layout:     post
title:      Android LocalBroadcastManager
subtitle:   Activity 与 Service 通信
date:       2020-04-30
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
---

[LocalBroadcastManager-Android](https://developer.android.google.cn/jetpack/androidx/releases/localbroadcastmanager?hl=zh-cn)

[CountDownTimer-Android](https://developer.android.google.cn/reference/android/os/CountDownTimer?hl=en)

## Activity 与 Service 通信方式、

1. Acitivity 将实例传入 Service, 同时利用回调更新UI
2. Service 持有 Activity的Handler 对象
3. 利用系统的 LocalBroadcastManager, Service send message, Activity receive message
4. 开源组件 (EventBus, otto)

## LocalBroadcastManager 优点

1. 只能传输在App内部，不会被其他App接收，确保数据安全
2. 接收不到其他App广播，免干扰
3. 比BrocastReceiver更加高效

## 原理图

[LocalBroadcastManager-androidxref](http://androidxref.com/7.1.2_r36/xref/frameworks/support/core-utils/java/android/support/v4/content/LocalBroadcastManager.java)

![local_broadcast_manager](/images/local_broadcast_manager.png)

## 应用

### Activity

```java

public class MainActivity extends Activity {

    private LocalBroadcastManager localBroadcastManager;

    private BroadcastReceiver uiRefreshReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            // fresh ui
        }

    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        localBroadcastManager = LocalBroadcastManager.getInstance(this);

    }

    @Override
    protected void onResume() {
        super.onResume();

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(ActionConstants.ACTION_PROCESS_PROGRESS);
        intentFilter.addAction(ActionConstants.ACTION_PROCESS_STOP);
        intentFilter.addAction(ActionConstants.ACTION_PROCESS_RELEASE);

        localBroadcastManager.registerReceiver(uiRefreshReceiver, intentFilter);

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        localBroadcastManager.unregisterReceiver(uiRefreshReceiver);
    }

}

```

### Service

```java

public class LogService extends Service {

 
    // 倒计时
    private LogCountDownTimer mCountDownTimer;


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        mCountDownTimer = new LogCountDownTimer(this, 60 * 1000); // 1分钟倒计时
        mCountDownTimer.start();

    }

    private void cancelCountDownTimer() {
        if (mCountDownTimer != null) {
            mCountDownTimer.cancel();
            mCountDownTimer = null;
        }
    }

}


public class LogCountDownTimer extends CountDownTimer {

    private static final String TAG = "LogCountDownTimer";

    private static final long COUNT_DOWN_INTERVAL = 1000;

    private Context context;

    public LogCountDownTimer(long millisInFuture, long countDownInterval) {
        super(millisInFuture, countDownInterval);
    }

    public LogCountDownTimer(Context context, long millisInFuture) {
        super(millisInFuture, COUNT_DOWN_INTERVAL);
        this.context = context;
    }

    @Override
    public void onTick(long millisUntilFinished) {
        long secondsCountdown = millisUntilFinished / COUNT_DOWN_INTERVAL;

        Intent intent = new Intent(ActionConstants.ACTION_PROCESS_PROGRESS);
        intent.putExtra(ActionConstants.KEY_SECONDS_COUNTDOWN, secondsCountdown);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    @Override
    public void onFinish() {
        Intent intent = new Intent(ActionConstants.ACTION_PROCESS_STOP);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

```

