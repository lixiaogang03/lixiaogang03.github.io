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

[SurfaceView, TextureView, SurfaceTexture等的区别](https://juejin.cn/post/6844903878450741262)

## TextureView SurfaceTexture

![surface_texture](/images/camera/surface_texture.png)

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

public class PhotoModule implements CameraModule, FocusOverlayManager.Listener {

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


    @Override
    public void onShutterButtonClick() {

            mFocusManager.doSnap();
    }

    @Override
    public boolean capture() {

        mCameraDevice.takePicture(mHandler,
                new ShutterCallback(!animateBefore),
                mRawPictureCallback, mPostViewPictureCallback,
                new JpegPictureCallback(loc));

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

    public synchronized CameraProxy open(
            Handler handler, int cameraId,
            CameraManager.CameraOpenErrorCallback cb) {

            Log.v(TAG, "open camera " + cameraId);
                mCameraDevice = CameraManagerFactory
                        .getAndroidCameraManager().cameraOpen(handler, cameraId, cb);
    }

}

```

**AndroidCameraManagerImpl**

```java

class AndroidCameraManagerImpl implements CameraManager {

    /* Messages used in CameraHandler. */
    // Camera initialization/finalization
    private static final int OPEN_CAMERA = 1;
    private static final int RELEASE =     2;
    private static final int RECONNECT =   3;
    private static final int UNLOCK =      4;
    private static final int LOCK =        5;
    // Preview
    private static final int SET_PREVIEW_TEXTURE_ASYNC =        101;
    private static final int START_PREVIEW_ASYNC =              102;
    private static final int STOP_PREVIEW =                     103;
    private static final int SET_PREVIEW_CALLBACK_WITH_BUFFER = 104;
    private static final int ADD_CALLBACK_BUFFER =              105;
    private static final int SET_PREVIEW_DISPLAY_ASYNC =        106;
    private static final int SET_PREVIEW_CALLBACK =             107;
    // Parameters
    private static final int SET_PARAMETERS =     201;
    private static final int GET_PARAMETERS =     202;
    private static final int REFRESH_PARAMETERS = 203;
    // Focus, Zoom
    private static final int AUTO_FOCUS =                   301;
    private static final int CANCEL_AUTO_FOCUS =            302;
    private static final int SET_AUTO_FOCUS_MOVE_CALLBACK = 303;
    private static final int SET_ZOOM_CHANGE_LISTENER =     304;
    // Face detection
    private static final int SET_FACE_DETECTION_LISTENER = 461;
    private static final int START_FACE_DETECTION =        462;
    private static final int STOP_FACE_DETECTION =         463;
    private static final int SET_ERROR_CALLBACK =          464;
    // Presentation
    private static final int ENABLE_SHUTTER_SOUND =    501;
    private static final int SET_DISPLAY_ORIENTATION = 502;

    private CameraHandler mCameraHandler;
    private android.hardware.Camera mCamera;

    // Used to retain a copy of Parameters for setting parameters.
    private Parameters mParamsToSet;

    AndroidCameraManagerImpl() {
        HandlerThread ht = new HandlerThread("Camera Handler Thread");
        ht.start();
        mCameraHandler = new CameraHandler(ht.getLooper());
    }

    private class CameraHandler extends Handler {

        public void requestTakePicture(
                final ShutterCallback shutter,
                final PictureCallback raw,
                final PictureCallback postView,
                final PictureCallback jpeg) {
            post(new Runnable() {
                @Override
                public void run() {
                    try {
                        mCamera.takePicture(shutter, raw, postView, jpeg);
                    } catch (RuntimeException e) {
                        // TODO: output camera state and focus state for debugging.
                        Log.e(TAG, "take picture failed.");
                        throw e;
                    }
                }
            });
        }


        @Override
        public void handleMessage(final Message msg) {
                switch (msg.what) {
                    case OPEN_CAMERA:
                        mCamera = android.hardware.Camera.open(msg.arg1);
                        return;
                    case START_PREVIEW_ASYNC:
                        mCamera.startPreview();
                        return;
                }
        }
    }

    public class AndroidCameraProxyImpl implements CameraManager.CameraProxy {


        @Override
        public void setPreviewTexture(SurfaceTexture surfaceTexture) {
            mCameraHandler.obtainMessage(SET_PREVIEW_TEXTURE_ASYNC, surfaceTexture).sendToTarget();
        }

        @Override
        public void startPreview() {
            mCameraHandler.sendEmptyMessage(START_PREVIEW_ASYNC);
        }

        @Override
        public void takePicture(
                Handler handler,
                CameraShutterCallback shutter,
                CameraPictureCallback raw,
                CameraPictureCallback post,
                CameraPictureCallback jpeg) {
            mCameraHandler.requestTakePicture(
                    ShutterCallbackForward.getNewInstance(handler, this, shutter),
                    PictureCallbackForward.getNewInstance(handler, this, raw),
                    PictureCallbackForward.getNewInstance(handler, this, post),
                    PictureCallbackForward.getNewInstance(handler, this, jpeg));
        }

    }

}

```

**FocusOverlayManager**

```java

public class FocusOverlayManager {

    public void doSnap() {

            capture();

    }

    private void capture() {
        if (mListener.capture()) {
            mState = STATE_IDLE;
            mHandler.removeMessages(RESET_TOUCH_FOCUS);
        }
    }

}

```



