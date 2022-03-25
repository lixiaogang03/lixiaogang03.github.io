---
layout:     post
title:      Android Virtual Camera
subtitle:   虚拟相机
date:       2022-03-25
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - camera
---

[android_virtual_cam-github](https://github.com/w2016561536/android_virtual_cam)

## Xposed

```txt

2022-03-25 14:58:23.771 4267-4267/? D/Xposed-HookMain: handleLoadPackage: com.android.camera2
    java.lang.Throwable
        at com.example.vcam.HookMain.handleLoadPackage(HookMain.java:101)
        at de.robv.android.xposed.IXposedHookLoadPackage$Wrapper.handleLoadPackage(IXposedHookLoadPackage.java:34)
        at de.robv.android.xposed.callbacks.XC_LoadPackage.call(XC_LoadPackage.java:61)
        at de.robv.android.xposed.callbacks.XCallback.callAll(XCallback.java:106)
        at de.robv.android.xposed.XposedInit$2.beforeHookedMethod(XposedInit.java:134)
        at de.robv.android.xposed.XposedBridge.handleHookedMethod(XposedBridge.java:340)
        at android.app.ActivityThread.handleBindApplication(<Xposed>)
        at android.app.ActivityThread.-wrap2(ActivityThread.java)
        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1551)
        at android.os.Handler.dispatchMessage(Handler.java:102)
        at android.os.Looper.loop(Looper.java:154)
        at android.app.ActivityThread.main(ActivityThread.java:6141)
        at java.lang.reflect.Method.invoke(Native Method)
        at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:912)
        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:802)
        at de.robv.android.xposed.XposedBridge.main(XposedBridge.java:107)

```

## 原生camera打开日志

```txt

2022-03-25 15:41:04.240 2075-2075/com.android.camera2 I/Xposed: android.app.Instrumentation-----callApplicationOnCreate
2022-03-25 15:41:05.157 2075-2102/com.android.camera2 I/Xposed: android.hardware.Camera-----setPreviewTexture
2022-03-25 15:41:05.161 2075-2102/com.android.camera2 I/Xposed: 【VCAM】创建预览
2022-03-25 15:41:05.164 2075-2102/com.android.camera2 I/Xposed: android.hardware.Camera-----startPreview
2022-03-25 15:41:05.169 2075-2102/com.android.camera2 I/Xposed: 【VCAM】开始预览
2022-03-25 15:41:11.839 2075-2102/com.android.camera2 I/Xposed: android.hardware.Camera-----takePicture
2022-03-25 15:41:11.839 2075-2102/com.android.camera2 I/Xposed: 【VCAM】4参数拍照
2022-03-25 15:41:11.839 2075-2102/com.android.camera2 I/Xposed: 【VCAM】发现拍照YUV:com.android.ex.camera2.portability.AndroidCameraAgentImpl$PictureCallbackForward@c8ac70
2022-03-25 15:41:11.840 2075-2102/com.android.camera2 I/art: Starting a blocking GC Xposed
2022-03-25 15:41:11.841 2075-2102/com.android.camera2 I/Xposed: 【VCAM】第二个jpeg:com.android.ex.camera2.portability.AndroidCameraAgentImpl$AndroidCameraProxyImpl$7@89bbbe9
2022-03-25 15:41:11.842 2075-2102/com.android.camera2 I/art: Starting a blocking GC Xposed
2022-03-25 15:41:11.964 2075-2102/com.android.camera2 I/Xposed: 【VCAM】YUV拍照回调初始化：宽：640高：480对应的类：android.hardware.Camera@6b2da5
2022-03-25 15:41:12.063 2075-2102/com.android.camera2 I/Xposed: 【VCAM】JPEG拍照回调初始化：宽：640高：480对应的类：android.hardware.Camera@6b2da5
2022-03-25 15:41:12.183 2075-2102/com.android.camera2 I/Xposed: android.hardware.Camera-----setPreviewTexture
2022-03-25 15:41:12.185 2075-2102/com.android.camera2 I/Xposed: 【VCAM】发现重复android.hardware.Camera@6b2da5
2022-03-25 15:41:12.186 2075-2102/com.android.camera2 I/Xposed: android.hardware.Camera-----startPreview
2022-03-25 15:41:12.189 2075-2102/com.android.camera2 I/Xposed: 【VCAM】开始预览

```

## HookMain

```java

public class HookMain implements IXposedHookLoadPackage {
    public static final String TAG = "Xposed-HookMain";

    public static Surface mSurface;
    public static SurfaceTexture mSurfacetexture;
    public static MediaPlayer mMediaPlayer;
    public static SurfaceTexture fake_SurfaceTexture;
    public static Camera origin_preview_camera;

    public static Camera camera_onPreviewFrame;
    public static Camera start_preview_camera;

    public void handleLoadPackage(final XC_LoadPackage.LoadPackageParam lpparam) throws Exception {

        XposedHelpers.findAndHookMethod("android.hardware.Camera", lpparam.classLoader, "setPreviewTexture", SurfaceTexture.class, new XC_MethodHook() {
            @Override
            protected void beforeHookedMethod(MethodHookParam param) {

                File file = new File(video_path + "virtual.mp4");
                if (file.exists()) {
                    if (param.args[0].equals(c1_fake_texture)) {
                        return;
                    }
                    if (origin_preview_camera != null && origin_preview_camera.equals(param.thisObject)) {
                        param.args[0] = fake_SurfaceTexture;
                        XposedBridge.log("【VCAM】发现重复" + origin_preview_camera.toString());
                        return;
                    } else {
                        XposedBridge.log("【VCAM】创建预览");
                    }

                    origin_preview_camera = (Camera) param.thisObject;
                    mSurfacetexture = (SurfaceTexture) param.args[0];
                    if (fake_SurfaceTexture == null) {
                        fake_SurfaceTexture = new SurfaceTexture(10);
                    } else {
                        fake_SurfaceTexture.release();
                        fake_SurfaceTexture = new SurfaceTexture(10);
                    }
                    param.args[0] = fake_SurfaceTexture;

                }
            }


        XposedHelpers.findAndHookMethod("android.hardware.Camera", lpparam.classLoader, "startPreview", new XC_MethodHook() {
            @Override
            protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                XposedBridge.log("【VCAM】开始预览");
                start_preview_camera = (Camera) param.thisObject;

                // 预览实际上是一个播放视频的过程
                if (mSurfacetexture != null) {
                    if (mSurface == null) {
                        mSurface = new Surface(mSurfacetexture);
                    } else {
                        mSurface.release();
                        mSurface = new Surface(mSurfacetexture);
                    }

                    if (mMediaPlayer == null) {
                        mMediaPlayer = new MediaPlayer();
                    } else {
                        mMediaPlayer.release();
                        mMediaPlayer = new MediaPlayer();
                    }

                    mMediaPlayer.setSurface(mSurface);

                    File sfile = new File(Environment.getExternalStorageDirectory().getPath() + "/DCIM/Camera1/" + "no-silent.jpg");
                    if (!(sfile.exists() && (!is_someone_playing))) {
                        mMediaPlayer.setVolume(0, 0);
                        is_someone_playing = false;
                    } else {
                        is_someone_playing = true;
                    }
                    mMediaPlayer.setLooping(true);

                    mMediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                        @Override
                        public void onPrepared(MediaPlayer mp) {
                            mMediaPlayer.start();
                        }
                    });

                    try {
                        mMediaPlayer.setDataSource(video_path + "virtual.mp4");
                        mMediaPlayer.prepare();
                    } catch (IOException e) {
                        XposedBridge.log("【VCAM】" + e.toString());
                    }
                }

            }

    }

}

```



