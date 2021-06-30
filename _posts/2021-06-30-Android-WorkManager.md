---
layout:     post
title:      Android WorkManager
subtitle:   Android Jetpack
date:       2021-06-30
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

[使用 WorkManager 调度任务-Google](https://developer.android.google.cn/topic/libraries/architecture/workmanager?hl=zh-cn)

## 概念

WorkManager 是一个 API，可供您轻松调度那些即使在退出应用或重启设备后仍应运行的可延期异步任务。WorkManager API 是一个适合用来替换先前的 Android 后台调度 API（包括 FirebaseJobDispatcher、GcmNetworkManager 和 JobScheduler）的组件，我们也建议您这样做。WorkManager 在其现代、一致的 API 中整合了其前身的功能，该 API 支持 API 级别 14，在开发时即考虑到了对电池续航的影响。

## 原理

在后台，WorkManager 根据以下条件使用底层作业来调度服务：

![overview-criteria](/images/jetpack/overview-criteria.png)

## build.gradle

```gradle

dependencies {
    def work_version = "2.5.0"

    // (Java only)
    implementation "androidx.work:work-runtime:$work_version"

    // Kotlin + coroutines
    implementation "androidx.work:work-runtime-ktx:$work_version"

    // optional - RxJava2 support
    implementation "androidx.work:work-rxjava2:$work_version"

    // optional - GCMNetworkManager support
    implementation "androidx.work:work-gcm:$work_version"

    // optional - Test helpers
    androidTestImplementation "androidx.work:work-testing:$work_version"

    // optional - Multiprocess support
    implementation "androidx.work:work-multiprocess:$work_version"
}

```

## AndroidManifest.xml

```xml

        <provider
            android:name="androidx.work.impl.WorkManagerInitializer"
            android:authorities="${applicationId}.workmanager-init"
            tools:node="remove"
            android:exported="false" />

```

## Application

```java
    @Override
    public void onCreate() {
        super.onCreate();

        Configuration configuration = new Configuration.Builder()
                .setExecutor(Executors.newFixedThreadPool(8))
                .build();
        WorkManager.initialize(this, configuration);

    }

```

## Worker

```java

public class UploadWorker extends Worker {
   public UploadWorker(
       @NonNull Context context,
       @NonNull WorkerParameters params) {
       super(context, params);
   }

   @Override
   public Result doWork() {

     // Do the work here--in this case, upload the images.
     uploadImages();

     // Indicate whether the work finished successfully with the Result

     // Result.success()：工作成功完成。
     // Result.failure()：工作失败。
     // Result.retry()：工作失败，应根据其重试政策在其他时间尝试。

     return Result.success();
   }
}

```

## WorkRequest

```java

        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();
        OneTimeWorkRequest httpWorkRequest = new OneTimeWorkRequest.Builder(HttpWorker.class)
                .setConstraints(constraints)
                .setInitialDelay(2, TimeUnit.SECONDS)
                .build();

```

## 将 WorkRequest 提交给系统

```java

WorkManager
    .getInstance(myContext)
    .enqueue(uploadWorkRequest);

```




