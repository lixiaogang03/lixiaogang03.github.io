---
layout:     post
title:      OkDownload
subtitle:   https://github.com/lingochamp/okdownload
date:       2021-06-07
author:     LXG
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - android
---

[okdownload-github](https://github.com/lingochamp/okdownload)

[白乾涛的博客](https://www.cnblogs.com/baiqiantao/p/10679677.html)

## gradle

```gradle

    implementation 'com.squareup.okhttp3:okhttp:3.12.1'

    // core
    implementation 'com.liulishuo.okdownload:okdownload:1.0.7'
    // provide sqlite to store breakpoints
    implementation 'com.liulishuo.okdownload:sqlite:1.0.7'
    // provide okhttp to connect to backend
    implementation 'com.liulishuo.okdownload:okhttp:1.0.7'

```

## download

```java

    public static void download(String url) {
        Util.enableConsoleLog();
        DownloadTask task = new DownloadTask.Builder(url,
                new File(Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "Download" + File.separator)) //设置下载地址和下载目录，这两个是必须的参数
                .setFilename("update.zip")                      // 设置下载文件名，没提供的话先看 response header ，再看 url path(即启用下面那项配置)
                .setFilenameFromResponse(false)                 // 是否使用 response header or url path 作为文件名，此时会忽略指定的文件名，默认false
                .setPassIfAlreadyCompleted(true)                // 如果文件已经下载完成，再次下载时，是否忽略下载，默认为true(忽略)，设为false会从头下载
                .setConnectionCount(1)                          // 需要用几个线程来下载文件，默认根据文件大小确定；如果文件已经 split block，则设置后无效
                .setPreAllocateLength(false)                    // 在获取资源长度后，设置是否需要为文件预分配长度，默认false
                .setMinIntervalMillisCallbackProcess(100)       // 通知调用者的频率，避免anr，默认3000
                .setWifiRequired(false)                         // 是否只允许wifi下载，默认为false
                .setAutoCallbackToUIThread(true)                // 是否在主线程通知调用者，默认为true
                //.setHeaderMapFields(new HashMap<String, List<String>>())   // 设置请求头
                //.addHeader(String key, String value)                      // 追加请求头
                .setPriority(0)                                             // 设置优先级，默认值是0，值越大下载优先级越高
                .setReadBufferSize(4096)                                    // 设置读取缓存区大小，默认4096
                .setFlushBufferSize(16384)                                  // 设置写入缓存区大小，默认16384
                .setSyncBufferSize(65536)                                   // 写入到文件的缓冲区大小，默认65536
                .setSyncBufferIntervalMillis(2000)                          // 写入文件的最小时间间隔，默认2000
                .build();

        task.enqueue(new DownloadListener() {
            @Override
            public void taskStart(@NonNull DownloadTask task) {
                Log.d(TAG, "taskStart");
            }

            @Override
            public void connectTrialStart(@NonNull DownloadTask task, @NonNull Map<String, List<String>> requestHeaderFields) {
                Log.d(TAG, "connectTrialStart");
            }

            @Override
            public void connectTrialEnd(@NonNull DownloadTask task, int responseCode, @NonNull Map<String, List<String>> responseHeaderFields) {
                Log.d(TAG, "connectTrialEnd");
            }

            @Override
            public void downloadFromBeginning(@NonNull DownloadTask task, @NonNull BreakpointInfo info, @NonNull ResumeFailedCause cause) {
                Log.d(TAG, "downloadFromBeginning");
            }

            @Override
            public void downloadFromBreakpoint(@NonNull DownloadTask task, @NonNull BreakpointInfo info) {
                Log.d(TAG, "downloadFromBreakpoint");
            }

            @Override
            public void connectStart(@NonNull DownloadTask task, int blockIndex, @NonNull Map<String, List<String>> requestHeaderFields) {
                Log.d(TAG, "connectStart");
            }

            @Override
            public void connectEnd(@NonNull DownloadTask task, int blockIndex, int responseCode, @NonNull Map<String, List<String>> responseHeaderFields) {
                Log.d(TAG, "connectEnd");
            }

            @Override
            public void fetchStart(@NonNull DownloadTask task, int blockIndex, long contentLength) {
                Log.d(TAG, "fetchStart");
            }

            @Override
            public void fetchProgress(@NonNull DownloadTask task, int blockIndex, long increaseBytes) {
                Log.d(TAG, "fetchProgress");
            }

            @Override
            public void fetchEnd(@NonNull DownloadTask task, int blockIndex, long contentLength) {
                Log.d(TAG, "fetchEnd");
            }

            @Override
            public void taskEnd(@NonNull DownloadTask task, @NonNull EndCause cause, @Nullable Exception realCause) {
                Log.d(TAG, "taskEnd");
            }
        });
    }

```

## 下载进度监听

![okdownload_listener](/images/http/okdownload_listener.png)

## 文档

[Simple Use Guideline](https://github.com/lingochamp/okdownload/wiki/Simple-Use-Guideline)

[Advanced Use Guideline]()

## 总体流程

![okdownload](/images/http/okdownload.png)



