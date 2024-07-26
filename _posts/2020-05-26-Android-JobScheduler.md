---
layout:     post
title:      Android JobScheduler
subtitle:   Android 定时任务
date:       2020-05-26
author:     LXG
header-img: img/post-bg-iWatch.jpg
catalog: true
tags:
    - android
---

[JobScheduler-Google](https://developer.android.google.cn/reference/android/app/job/JobScheduler?hl=zh-cn)

[应用电耗管理-AOSP](https://source.android.google.cn/devices/tech/power/app_mgmt?hl=zh-tw)

[Android 保活措施-掘金](https://juejin.im/post/5df24da36fb9a0165c711807)

[](http://gityuan.com/2017/03/10/job_scheduler_service/)

## 应用

### AndroidManifest.xml

```xml

        <service
            android:name=".antirush.ScheduleService"
            android:permission="android.permission.BIND_JOB_SERVICE" />

```

### ScheduleService

```java

public class ScheduleService extends JobService {
    private static final String TAG = "ScheduleService";

    @Override
    public boolean onStartJob(JobParameters params) {
        Log.d(TAG, "onStartJob");

        //这个返回值是有讲究的
        //true表示Service的工作在一个独立线程中执行，工作完成之后需要调用jobFinish方法通知JobScheduler工作完成
        //false表示Service的工作已经完成，JobScheduler收到通知之后会释放资源
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        Log.d(TAG, "onStopJob");

        //true表示需要进行重试
        //false表示不再进行重试，Job将会被丢弃
        return false;
    }

}

```

### JobScheduler

```java

    private static final int JOB_ID = 1024;

    private void startJobServiceForKeepAlive(Context context) {
        JobScheduler jobScheduler = (JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (jobScheduler == null) {
            return;
        }

        JobInfo jobInfo =new JobInfo.Builder(JOB_ID, new ComponentName(context, ScheduleService.class))
                .setBackoffCriteria(1000,JobInfo.BACKOFF_POLICY_LINEAR) //重试机制
                .setMinimumLatency(1000)                                //设置延迟时间
                .setOverrideDeadline(10000)                             //设置最后期限，如果达到该时间点，Job还没被执行，那么会强制执行一次
                .setPeriodic(2000)                                      //每隔2s执行一次，跟上面两个会冲突
                .setPersisted(true)                                     //持久化，就算手机关机，启动之后也可以恢复Job，需要RECEIVE_BOOT_COMPLETED权限
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED) //设置Job依赖的网络类型
                .setRequiresCharging(false)                             //是否要求设备处于充电状态
                .setRequiresDeviceIdle(false)                           //是否要求设备处于空闲状态
                .build()

        JobInfo jobInfo = builder.build();
        int schedule = jobScheduler.schedule(jobInfo);
        if (schedule <= 0) {
            Log.w(TAG, "schedule error");
        }
    }

    /**
     * 正常服务停止时取消JobService
     */
    private void cancelJobService(Context context) {
        JobScheduler jobScheduler = (JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (jobScheduler == null) {
            return;
        }
        jobScheduler.cancel(JOB_ID);
    }


```

## Framework

[理解JobScheduler机制-Gityuan](http://gityuan.com/2017/03/10/job_scheduler_service/)

[任务调度JobScheduler源码剖析-简书](https://www.jianshu.com/p/34c7d7529d9cc)

### 源码

[JobSchedulerService.java](http://androidxref.com/9.0.0_r3/xref/frameworks/base/services/core/java/com/android/server/job/)

### UML-schedule

![job_scheduler_schedule](/images/android/job/job_scheduler_schedule.jpg)

### UML-cancel

![job_scheduler_cancel](/images/android/job/job_scheduler_cancel.jpg)

### 策略实现

```java

    public JobSchedulerService(Context context) {
        super(context);

        // Create the controllers.
        mControllers = new ArrayList<StateController>();
        mControllers.add(new ConnectivityController(this));            // 注册监听网络连接状态的广播
        mControllers.add(new TimeController(this));                    // 用来控制截止时间和延迟时间对Job的约束，仅对设置了setOverrideDeadline()和setMinimumLatency()的Job有效
        mControllers.add(new IdleController(this));                    // 注册监听屏幕亮/灭,dream进入/退出,状态改变的广播
        mBatteryController = new BatteryController(this);              // 用来控制充电状态和低电量模式对Job的约束，仅仅对设置过setRequiresBatteryNotLow(true)或setRequiresCharging(true)的Job有效
        mControllers.add(mBatteryController);
        mStorageController = new StorageController(this);              // 用来控制存储空间对Job的约束，仅仅对设置过setRequiresStorageNotLow(true)的Job有效
        mControllers.add(mStorageController);                          // 其内部也是通过广播的形式获取设备是否处于低存储状态
        mControllers.add(new BackgroundJobsController(this));          // BackgroundJobsController用来控制Job后台的运行。由于AppStandby机制，当应用处于后台时，会进行一些功能的限制
        mControllers.add(new ContentObserverController(this));         // ContentObserverController用来监测content URIS对Job的约束，
                                                                       // 仅仅对设置过addTriggerContentUri(Uri)的Job有效，当该URI发生变化后，将运行Job
        mDeviceIdleJobsController = new DeviceIdleJobsController(this);    // DeviceIdleJobsController用来控制Job对Doze的依赖条件，或者也可以说Doze对Job的限制
        mControllers.add(mDeviceIdleJobsController);

    }

```

![state_controller](/images/android/job/state_controller.jpg)

图片来自Gityuan

## 持久化

**/data/system/job/jobs.xml**

```txt

    <job jobid="1024" package="com.sunmi.toolbox" class="com.sunmi.toolbox.antirush.ScheduleService" sourcePackageName="com.sunmi.toolbox" sourceUserId="0" uid="10080" priority="0" flags="0" lastSuccessfulRunTime="0" lastFailedRunTime="0">
        <constraints net-capabilities="94208" net-unwanted-capabilities="0" net-transport-types="0" />
        <periodic period="900000" flex="300000" deadline="1590569023038" delay="1590568723038" />
        <extras />
    </job>

```

## dumpsys jobscheduler package

```txt

  JOB #u0a80/1024: e61d7bf com.sunmi.toolbox/.antirush.ScheduleService
    u0a80 tag=*job*/com.sunmi.toolbox/.antirush.ScheduleService
    Source: uid=u0a80 user=0 pkg=com.sunmi.toolbox
    JobInfo:
      Service: com.sunmi.toolbox/.antirush.ScheduleService
      PERIODIC: interval=+15m0s0ms flex=+5m0s0ms
      PERSISTED
      Requires: charging=false batteryNotLow=false deviceIdle=false
      Network type: NetworkRequest [ NONE id=0, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&VALIDATED Unwanted:  Uid: 10080] ]
      Backoff: policy=1 initial=+30s0ms
      Has early constraint
      Has late constraint
    Required constraints: TIMING_DELAY DEADLINE CONNECTIVITY [0xd0000000]
    Satisfied constraints: CONNECTIVITY DEVICE_NOT_DOZING BACKGROUND_NOT_RESTRICTED [0x12400000]
    Unsatisfied constraints: TIMING_DELAY DEADLINE [0xc0000000]
    Tracking: CONNECTIVITY TIME
    Network: 100
    Standby bucket: ACTIVE
    Enqueue time: -1m42s81ms
    Run time: earliest=+13m17s891ms, latest=+18m17s891ms
    Last successful run: 2020-05-27 15:27:42
    Last run heartbeat: 0
    Ready: false (job=false user=true !pending=true !active=true !backingup=true comp=true)

```

## 总结

[Android P JobScheduler服务源码解析-简书](https://www.jianshu.com/p/3f9bdd69776f)

![job_scheduler_arch](/images/android/job/job_scheduler_arch.webp)



