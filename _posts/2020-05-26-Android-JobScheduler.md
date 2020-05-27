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




