---
layout:     post
title:      Android Camera2 App
subtitle:   android 4.4 camera
date:       2021-12-04
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - camera
---

## Camera2 App

**CameraActivity**

```java

public class CameraActivity extends Activity {

    // PhotoModule
    private CameraModule mCurrentModule;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);

        LayoutInflater inflater = getLayoutInflater();
        View rootLayout = inflater.inflate(R.layout.camera, null, false);
        mCameraModuleRootView = rootLayout.findViewById(R.id.camera_app_root);


        mCurrentModule.init(this, mCameraModuleRootView);

    }


    @Override
    public void onResume() {

        mCurrentModule.onResumeBeforeSuper();
        super.onResume();
        mCurrentModule.onResumeAfterSuper();

    }

}

```

**PhotoModule**


```java

public class PhotoModule implements CameraModule {

    // copied from Camera hierarchy
    private CameraActivity mActivity;

    private CameraProxy mCameraDevice;

    private int mCameraId;

    private Parameters mParameters;

    private PhotoUI mUI;


    @Override
    public void init(CameraActivity activity, View parent) {
        mActivity = activity;
        mUI = new PhotoUI(activity, this, parent);

        mCameraId = getPreferredCameraId(mPreferences);



    }

    @Override
    public void onResumeAfterSuper() {

            onResumeTasks();

    }

    private void onResumeTasks() {

        if (!prepareCamera()) {
            // Camera failure.
            return;
        }

    }

    private boolean prepareCamera() {

        Log.v(TAG, "Open camera device.");
        mCameraDevice = CameraUtil.openCamera(
                mActivity, mCameraId, mHandler,
                mActivity.getCameraOpenErrorCallback());

        if (mCameraDevice == null) {
            Log.e(TAG, "Failed to open camera:" + mCameraId);
            return false;
        }
        mParameters = mCameraDevice.getParameters();

        setCameraParameters(UPDATE_PARAM_ALL);

        startPreview();

    }

    // We separate the parameters into several subsets, so we can update only
    // the subsets actually need updating. The PREFERENCE set needs extra
    // locking because the preference can be changed from GLThread as well.
    private void setCameraParameters(int updateSet) {

        mCameraDevice.setParameters(mParameters);

    }


    @Override
    public void onPreviewUIReady() {
        startPreview();
    }



    /** This can run on a background thread, post any view updates to MainHandler. */
    private void startPreview() {

         // Any decisions we make based on the surface texture state
         // need to be protected.
        SurfaceTexture st = mUI.getSurfaceTexture();
        if (st == null) {
            Log.w(TAG, "startPreview: surfaceTexture is not ready.");
            return;
        }

        setCameraParameters(UPDATE_PARAM_ALL);
        // Let UI set its expected aspect ratio
        mCameraDevice.setPreviewTexture(st);

        Log.v(TAG, "startPreview");
        mCameraDevice.startPreview();

    }

}

```

**PhotoUI**

```java

public class PhotoUI implements TextureView.SurfaceTextureListener {

    private PhotoController mController;

    private SurfaceTexture mSurfaceTexture;

    private TextureView mTextureView;

    public PhotoUI(CameraActivity activity, PhotoController controller, View parent) {
        mController = controller;

        mActivity.getLayoutInflater().inflate(R.layout.photo_module,
                (ViewGroup) mRootView, true);

        // display the view
        mTextureView = (TextureView) mRootView.findViewById(R.id.preview_content);
        mTextureView.setSurfaceTextureListener(this);

    }

    @Override
    public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
            Log.v(TAG, "SurfaceTexture ready.");
            mSurfaceTexture = surface;
            mController.onPreviewUIReady();
    }

}

```

**CameraHolder**

```java

public class CameraHolder {

    private CameraProxy mCameraDevice;

    public synchronized CameraProxy open(int cameraId)
            throws CameraHardwareException {

                    mCameraDevice = CameraManager.instance().cameraOpen(cameraId);
    }

}

```

**CameraManager**

```java

public class CameraManager {

    private Handler mCameraHandler;
    private CameraProxy mCameraProxy;
    private android.hardware.Camera mCamera;

    private CameraManager() {
        HandlerThread ht = new HandlerThread("Camera Handler Thread");
        ht.start();
        mCameraHandler = new CameraHandler(ht.getLooper());
    }

    // Open camera synchronously. This method is invoked in the context of a
    // background thread.
    CameraProxy cameraOpen(int cameraId) {
        // Cannot open camera in mCameraHandler, otherwise all camera events
        // will be routed to mCameraHandler looper, which in turn will call
        // event handler like Camera.onFaceDetection, which in turn will modify
        // UI and cause exception like this:
        // CalledFromWrongThreadException: Only the original thread that created
        // a view hierarchy can touch its views.
        mCamera = android.hardware.Camera.open(cameraId);
        if (mCamera != null) {
            mCameraProxy = new CameraProxy();
            return mCameraProxy;
        } else {
            return null;
        }
    }

    private class CameraHandler extends Handler {

        @Override
        public void handleMessage(final Message msg) {

                switch (msg.what) {
                    case SET_PARAMETERS:
                        mCamera.setParameters((Parameters) msg.obj);
                        break;
                    case SET_PREVIEW_TEXTURE_ASYNC:
                        setPreviewTexture(msg.obj);
                        return;  // no need to call mSig.open()
                    case START_PREVIEW_ASYNC:
                        mCamera.startPreview();
                        return;  // no need to call mSig.open()
                }
        }

    }

    public class CameraProxy {

        public void setParameters(Parameters params) {
            mSig.close();
            mCameraHandler.obtainMessage(SET_PARAMETERS, params).sendToTarget();
            mSig.block();
        }

        public void startPreviewAsync() {
            mCameraHandler.sendEmptyMessage(START_PREVIEW_ASYNC);
        }
    }

}

```



