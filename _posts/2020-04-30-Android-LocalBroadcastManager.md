---
layout:     post
title:      Android LocalBroadcastManager
subtitle:   Activity 与 Service 通信
date:       2020-04-30
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - Android
---

[LocalBroadcastManager-Android](https://developer.android.google.cn/jetpack/androidx/releases/localbroadcastmanager?hl=zh-cn)

[CountDownTimer-Android](https://developer.android.google.cn/reference/android/os/CountDownTimer?hl=en)

## Activity 与 Service 通信方式

1. Acitivity 将实例传入 Service, 同时利用回调更新UI
2. Service 持有 Activity的Handler 对象
3. 利用系统的 LocalBroadcastManager, Service send message, Activity receive message
4. 开源组件 (EventBus, otto)

## LocalBroadcastManager 优点

与系统广播的区别:

1. 范围上：LocalBroadcastManager为本地广播，只能接受自身App发送的广播，只能用于应用内之间的通信，范围相对较小；而系统的BraoadCastRecever可以实现跨进程通讯，范围更大。
2. 效率上：LocalBroadcastManager通信核心是Handler，所以只能用于应用内通信，安全和效率都很高；而系统的BraoadCastRecever通信核心是Binder机制，实现跨进程通信，范围更广，导致运行效率稍微逊一点。
3. 安全上：LocalBroadcastManager由于核心是Handler，而且只能动态注册，只能用于app内通信，安全上更加的有保障；而系统的BraoadCastRecever容易被利用，安全上相对较弱一点。

## 原理图

[LocalBroadcastManager-androidxref](http://androidxref.com/7.1.2_r36/xref/frameworks/support/core-utils/java/android/support/v4/content/LocalBroadcastManager.java)

![local_broadcast_manager](/images/android/local_broadcast_manager.png)

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

## 注意

最新的Android SDK此接口已经废弃, 推荐LiveData, 可参考[Jetpack之LiveData](https://juejin.im/post/5d7ef1eff265da03b76b518d)



