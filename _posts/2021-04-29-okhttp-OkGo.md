---
layout:     post
title:      okhttp-OkGo
subtitle:   https://github.com/jeasonlzy/okhttp-OkGo
date:       2021-04-29
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - okgo
---

[okhttp-OkGo-github](https://github.com/jeasonlzy/okhttp-OkGo)

## wiki

[okgo-wiki](https://github.com/jeasonlzy/okhttp-OkGo/wiki)

## gradle

```gradle

dependencies {

    implementation 'com.lzy.net:okgo:3.0.4'
}

```

## Application

```java

    /**
     * https://github.com/jeasonlzy/okhttp-OkGo/wiki/Init
     */
    private void okGoInit() {
        OkHttpClient.Builder builder = new OkHttpClient.Builder();

        // log config
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor("OkGo");
        loggingInterceptor.setPrintLevel(HttpLoggingInterceptor.Level.BODY);
        loggingInterceptor.setColorLevel(Level.INFO);
        builder.addInterceptor(loggingInterceptor);

        // global timeout
        builder.readTimeout(OkGo.DEFAULT_MILLISECONDS, TimeUnit.MILLISECONDS);
        builder.writeTimeout(OkGo.DEFAULT_MILLISECONDS, TimeUnit.MILLISECONDS);
        builder.connectTimeout(OkGo.DEFAULT_MILLISECONDS, TimeUnit.MILLISECONDS);

        // trust all
        HttpsUtils.SSLParams sslParams = HttpsUtils.getSslSocketFactory();
        builder.sslSocketFactory(sslParams.sSLSocketFactory, sslParams.trustManager);

        OkGo.getInstance().init(this)
                .setOkHttpClient(builder.build())
                .setCacheMode(CacheMode.NO_CACHE)
                .setCacheTime(CacheEntity.CACHE_NEVER_EXPIRE)
                .setRetryCount(3);

    }

```

## post

```java

public class RequestUtils {

    /**
     * 设备注册
     */
    public static void registerDevice(HttpCallback callback) {
        RequestOption requestParam = new RequestOption();
        requestParam.url = ApiConstants.API_REGISTER_DEVICE;
        requestParam.params.put("device_id", DEVICE_ID);
        requestParam.params.put("sdk_version", String.valueOf(Build.VERSION.SDK_INT));
        requestParam.params.put("os_version", Build.VERSION.RELEASE);
        postWithCallback(requestParam, callback);
    }

    /**
     * post request with callback
     */
    public static void postWithCallback(RequestOption requestParam, HttpCallback callback) {
        OkGo.<String>post(requestParam.url)
                .headers("Content-Type", "application/x-www-form-urlencoded")
                .params(requestParam.params, true)
                .execute(new StringCallback() {
                    @Override
                    public void onSuccess(Response<String> response) {
                        String body = response.body();
                        callback.onSuccess(body);
                    }

                    @Override
                    public void onError(Response<String> response) {
                        super.onError(response);
                        callback.onError(response.body());
                    }

                    @Override
                    public void onStart(Request<String, ? extends Request> request) {
                        super.onStart(request);
                    }

                    @Override
                    public void onFinish() {
                        super.onFinish();
                    }
                });
    }

}

```

## Download

```java

    public static void downloadWithCallback(String url, Object tag, String destFileDir,
                                            String destFileName, final DownloadCallback callback) {
        Log.i(TAG, "download start: " + destFileName);
        OkGo.<File>get(url).tag(tag).execute(new FileCallback(destFileDir, destFileName) {

            @Override
            public void onSuccess(Response<File> response) {
                callback.onSuccess(response.body());
            }

            @Override
            public void onError(Response<File> response) {
                super.onError(response);
                callback.onFail(response.message());
            }

            @Override
            public void downloadProgress(Progress progress) {
                super.downloadProgress(progress);
                if (DEBUG) Log.i(TAG, "download start: " + progress.currentSize);
            }
        });

    }

```

## OkDownload

```gradle

    implementation 'com.lzy.net:okgo:3.0.4'
    implementation 'com.lzy.net:okserver:2.0.5'

```

**缺点**

1. 下载大文件时会内存溢出
2. 不支持多线程下载

## 初始化

```java

    public static void okDownloadInit() {
        OkDownload okDownload = OkDownload.getInstance();
        okDownload.setFolder(Environment.getExternalStorageDirectory().getAbsolutePath()
                + File.separator + "Download" + File.separator);
        okDownload.getThreadPool().setCorePoolSize(3);
        okDownload.addOnAllTaskEndListener(new XExecutor.OnAllTaskEndListener() {
            @Override
            public void onAllTaskEnd() {
                Log.w(TAG, "onAllTaskEnd");
            }
        });
    }


    public static void download(String tag, String url) {
        Log.d(TAG, "download " + tag + ", " + url);
        GetRequest<File> request = OkGo.get(url);
        DownloadTask task = OkDownload.request(tag, request);
        task.register(new DownloadListener(tag) {
            @Override
            public void onStart(Progress progress) {
                Log.d(TAG, "onStart");
            }

            @Override
            public void onProgress(Progress progress) {
                Log.d(TAG, "onProgress: " + progress.currentSize + "---" + progress.totalSize);
            }

            @Override
            public void onError(Progress progress) {
                Log.e(TAG, "onError" + progress.exception);
            }

            @Override
            public void onFinish(File file, Progress progress) {
                Log.d(TAG, "onFinish: " + file.getAbsolutePath());
            }

            @Override
            public void onRemove(Progress progress) {
                Log.e(TAG, "onRemove" + progress.toString());
            }
        }).save();
        task.fileName("update.zip"); //设置下载的文件名
        task.start();

        task.restart(); //重新下载
        task.pause(); //暂停下载
        task.remove(); //删除下载，只删除记录，不删除文件
        task.remove(true); //删除下载，同时删除记录和文件
    }

```




