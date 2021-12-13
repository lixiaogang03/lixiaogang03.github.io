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

[camera-AOSP](https://source.android.google.cn/devices/camera)

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

    private final class PostViewPictureCallback
            implements CameraPictureCallback {
        @Override
        public void onPictureTaken(byte [] data, CameraProxy camera) {
            mPostViewPictureCallbackTime = System.currentTimeMillis();
            Log.v(TAG, "mShutterToPostViewCallbackTime = "
                    + (mPostViewPictureCallbackTime - mShutterCallbackTime)
                    + "ms");
        }
    }

    private final class RawPictureCallback
            implements CameraPictureCallback {
        @Override
        public void onPictureTaken(byte [] rawData, CameraProxy camera) {
            mRawPictureCallbackTime = System.currentTimeMillis();
            Log.v(TAG, "mShutterToRawCallbackTime = "
                    + (mRawPictureCallbackTime - mShutterCallbackTime) + "ms");
        }
    }

    private final class JpegPictureCallback
            implements CameraPictureCallback {

        @Override
        public void onPictureTaken(final byte [] jpegData, CameraProxy camera) {

        }

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


    private static class PreviewCallbackForward implements PreviewCallback {

        private final Handler mHandler;
        private final CameraPreviewDataCallback mCallback;
        private final CameraProxy mCamera;

        /**
         * Returns a new instance of {@link PreviewCallbackForward}.
         *
         * @param handler The handler in which the callback will be invoked in.
         * @param camera  The {@link CameraProxy} which the callback is from.
         * @param cb      The callback to be invoked.
         * @return        The instance of the {@link PreviewCallbackForward},
         *                or null if any parameters is null.
         */
        public static PreviewCallbackForward getNewInstance(
                Handler handler, CameraProxy camera, CameraPreviewDataCallback cb) {
            if (handler == null || camera == null || cb == null) return null;
            return new PreviewCallbackForward(handler, camera, cb);
        }

        private PreviewCallbackForward(
                Handler h, CameraProxy camera, CameraPreviewDataCallback cb) {
            mHandler = h;
            mCamera = camera;
            mCallback = cb;
        }

        @Override
        public void onPreviewFrame(
                final byte[] data, android.hardware.Camera camera) {
            mHandler.post(new Runnable() {
                @Override
                public void run() {
                    mCallback.onPreviewFrame(data, mCamera);
                }
            });
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

## Framework

**Camera**

frameworks/base/core/java/android/hardware/Camera.java

```java

public class Camera {

    public static Camera open(int cameraId) {
        return new Camera(cameraId);
    }

    Camera(int cameraId) {
        mShutterCallback = null;
        mRawImageCallback = null;
        mJpegCallback = null;
        mPreviewCallback = null;
        mPostviewCallback = null;
        mUsingPreviewAllocation = false;
        mZoomListener = null;

        Looper looper;
        if ((looper = Looper.myLooper()) != null) {
            mEventHandler = new EventHandler(this, looper);
        } else if ((looper = Looper.getMainLooper()) != null) {
            mEventHandler = new EventHandler(this, looper);
        } else {
            mEventHandler = null;
        }

        String packageName = ActivityThread.currentPackageName();

        native_setup(new WeakReference<Camera>(this), cameraId, packageName);
    }

    private native final void native_setup(Object camera_this, int cameraId,
                                           String packageName);

    private native static void _getCameraInfo(int cameraId, CameraInfo cameraInfo);

    public native final void setPreviewTexture(SurfaceTexture surfaceTexture) throws IOException;

    public native final void startPreview();


    public interface PreviewCallback
    {
        /**
         * Called as preview frames are displayed.  This callback is invoked
         * on the event thread {@link #open(int)} was called from.
         *
         * <p>If using the {@link android.graphics.ImageFormat#YV12} format,
         * refer to the equations in {@link Camera.Parameters#setPreviewFormat}
         * for the arrangement of the pixel data in the preview callback
         * buffers.
         *
         * @param data the contents of the preview frame in the format defined
         *  by {@link android.graphics.ImageFormat}, which can be queried
         *  with {@link android.hardware.Camera.Parameters#getPreviewFormat()}.
         *  If {@link android.hardware.Camera.Parameters#setPreviewFormat(int)}
         *             is never called, the default will be the YCbCr_420_SP
         *             (NV21) format.
         * @param camera the Camera service object.
         */
        void onPreviewFrame(byte[] data, Camera camera);
    };

    public final void takePicture(ShutterCallback shutter, PictureCallback raw,
            PictureCallback postview, PictureCallback jpeg) {
        mShutterCallback = shutter;
        mRawImageCallback = raw;
        mPostviewCallback = postview;
        mJpegCallback = jpeg;

        // If callback is not set, do not send me callbacks.
        int msgType = 0;
        if (mShutterCallback != null) {
            msgType |= CAMERA_MSG_SHUTTER;
        }
        if (mRawImageCallback != null) {
            msgType |= CAMERA_MSG_RAW_IMAGE;
        }
        if (mPostviewCallback != null) {
            msgType |= CAMERA_MSG_POSTVIEW_FRAME;
        }
        if (mJpegCallback != null) {
            msgType |= CAMERA_MSG_COMPRESSED_IMAGE;
        }

        native_takePicture(msgType);
        mFaceDetectionRunning = false;
    }

    /**
     * Callback interface used to supply image data from a photo capture.
     *
     * @see #takePicture(ShutterCallback, PictureCallback, PictureCallback, PictureCallback)
     */
    public interface PictureCallback {
        /**
         * Called when image data is available after a picture is taken.
         * The format of the data depends on the context of the callback
         * and {@link Camera.Parameters} settings.
         *
         * @param data   a byte array of the picture data
         * @param camera the Camera service object
         */
        void onPictureTaken(byte[] data, Camera camera);
    };

}

```

**android_hardware_Camera.cpp**

frameworks/base/core/jni/android_hardware_Camera.cpp

system/lib/libandroid_runtime.so

```cpp

// connect to camera service
static void android_hardware_Camera_native_setup(JNIEnv *env, jobject thiz,
    jobject weak_this, jint cameraId, jstring clientPackageName)
{

    sp<Camera> camera = Camera::connect(cameraId, clientName,
            Camera::USE_CALLING_UID);

    sp<JNICameraContext> context = new JNICameraContext(env, weak_this, clazz, camera);

}


static void android_hardware_Camera_setPreviewTexture(JNIEnv *env,
        jobject thiz, jobject jSurfaceTexture)
{
    ALOGV("setPreviewTexture");
    sp<Camera> camera = get_native_camera(env, thiz, NULL);
    if (camera == 0) return;

    sp<IGraphicBufferProducer> producer = NULL;
    if (jSurfaceTexture != NULL) {
        producer = SurfaceTexture_getProducer(env, jSurfaceTexture);
        if (producer == NULL) {
            jniThrowException(env, "java/lang/IllegalArgumentException",
                    "SurfaceTexture already released in setPreviewTexture");
            return;
        }

    }

    if (camera->setPreviewTarget(producer) != NO_ERROR) {
        jniThrowException(env, "java/io/IOException",
                "setPreviewTexture failed");
    }
}

static void android_hardware_Camera_startPreview(JNIEnv *env, jobject thiz)
{
    ALOGV("startPreview");
    sp<Camera> camera = get_native_camera(env, thiz, NULL);
    if (camera == 0) return;

    if (camera->startPreview() != NO_ERROR) {
        jniThrowRuntimeException(env, "startPreview failed");
        return;
    }
}

```

**Camera.cpp**

frameworks/av/camera/Camera.cpp

system/lib/libcamera_client.so

```cpp

namespace android {

Camera::Camera(int cameraId)
    : CameraBase(cameraId)
{
}

CameraTraits<Camera>::TCamConnectService CameraTraits<Camera>::fnConnectService =
        &ICameraService::connect;

sp<Camera> Camera::connect(int cameraId, const String16& clientPackageName,
        int clientUid)
{
    return CameraBaseT::connect(cameraId, clientPackageName, clientUid);
}

// pass the buffered IGraphicBufferProducer to the camera service
status_t Camera::setPreviewTarget(const sp<IGraphicBufferProducer>& bufferProducer)
{
    ALOGV("setPreviewTarget(%p)", bufferProducer.get());
    sp <ICamera> c = mCamera;
    if (c == 0) return NO_INIT;
    ALOGD_IF(bufferProducer == 0, "app passed NULL surface");
    return c->setPreviewTarget(bufferProducer);
}

// start preview mode
status_t Camera::startPreview()
{
    ALOGV("startPreview");
    sp <ICamera> c = mCamera;
    if (c == 0) return NO_INIT;
    return c->startPreview();
}

}

```

**CameraBase.cpp**

frameworks/av/camera/CameraBase.cpp

```cpp

// establish binder interface to camera service
template <typename TCam, typename TCamTraits>
const sp<ICameraService>& CameraBase<TCam, TCamTraits>::getCameraService()
{
    Mutex::Autolock _l(gLock);
    if (gCameraService.get() == 0) {
        sp<IServiceManager> sm = defaultServiceManager();
        sp<IBinder> binder;
        do {
            binder = sm->getService(String16(kCameraServiceName));
            if (binder != 0) {
                break;
            }
            ALOGW("CameraService not published, waiting...");
            usleep(kCameraServicePollDelay);
        } while(true);
        if (gDeathNotifier == NULL) {
            gDeathNotifier = new DeathNotifier();
        }
        binder->linkToDeath(gDeathNotifier);
        gCameraService = interface_cast<ICameraService>(binder);
    }
    ALOGE_IF(gCameraService == 0, "no CameraService!?");
    return gCameraService;
}

template <typename TCam, typename TCamTraits>
sp<TCam> CameraBase<TCam, TCamTraits>::connect(int cameraId,
                                               const String16& clientPackageName,
                                               int clientUid)
{

    sp<TCam> c = new TCam(cameraId);
    const sp<ICameraService>& cs = getCameraService();

    //ICameraService::connect
    if (cs != 0) {
        TCamConnectService fnConnectService = TCamTraits::fnConnectService;
        // Binder call media.server
        status = (cs.get()->*fnConnectService)(cl, cameraId, clientPackageName, clientUid,
                                             /*out*/ c->mCamera);
    }

    return c;  // return Camera object
}

```

## mediaserver

/system/bin/mediaserver

frameworks/av/media/mediaserver/main_mediaserver.cpp

**main_mediaserver.cpp**

```cpp

int main(int argc, char** argv)
{

        sp<ProcessState> proc(ProcessState::self());
        sp<IServiceManager> sm = defaultServiceManager();
        ALOGI("ServiceManager: %p", sm.get());
        AudioFlinger::instantiate();
        MediaPlayerService::instantiate();
        CameraService::instantiate();
        AudioPolicyService::instantiate();
        registerExtensions();
        ProcessState::self()->startThreadPool();
        IPCThreadState::self()->joinThreadPool();

}

```

**BinderService.h**

frameworks/native/include/binder/BinderService.h

```cpp

class BinderService
{
public:
    static status_t publish(bool allowIsolated = false) {
        sp<IServiceManager> sm(defaultServiceManager());
        return sm->addService(
                String16(SERVICE::getServiceName()),
                new SERVICE(), allowIsolated);
    }

    static void instantiate() { publish(); }

}

```

**CameraService.cpp**

frameworks/av/services/camera/libcameraservice/CameraService.cpp

system/lib/libcameraservice

```cpp

CameraService::CameraService()
    :mSoundRef(0), mModule(0)
{
    ALOGI("CameraService started (pid=%d)", getpid());
    gCameraService = this;

    for (size_t i = 0; i < MAX_CAMERAS; ++i) {
        mStatusList[i] = ICameraServiceListener::STATUS_PRESENT;
    }

    this->camera_device_status_change = android::camera_device_status_change;
}

void CameraService::onFirstRef()
{
    LOG1("CameraService::onFirstRef");

    BnCameraService::onFirstRef();

    if (hw_get_module(CAMERA_HARDWARE_MODULE_ID,
                (const hw_module_t **)&mModule) < 0) {
        ALOGE("Could not load camera HAL module");
        mNumberOfCameras = 0;
    }
    else {
        ALOGI("Loaded \"%s\" camera module", mModule->common.name);

        // 这个函数很重要，对于framework层来说只是拿到了camera的个数，但对于HAL层和drivers层来说camera的上电和初始化流程都是从这里开始
        mNumberOfCameras = mModule->get_number_of_cameras();
        if (mNumberOfCameras > MAX_CAMERAS) {
            ALOGE("Number of cameras(%d) > MAX_CAMERAS(%d).",
                    mNumberOfCameras, MAX_CAMERAS);
            mNumberOfCameras = MAX_CAMERAS;
        }
        for (int i = 0; i < mNumberOfCameras; i++) {
            setCameraFree(i);
        }

        if (mModule->common.module_api_version >=
                CAMERA_MODULE_API_VERSION_2_1) {
            mModule->set_callbacks(this);
        }

        CameraDeviceFactory::registerService(this);
    }

}

```

## HAL-A33-4.4

运行在/system/bin/mediaserver进程

**HALCameraFactory.cpp**

device/softwinner/polaris-common/hardware/camera/HALCameraFactory.cpp

system/lib/hw/camera.polaris.so

```cpp

HALCameraFactory::HALCameraFactory()
        : mHardwareCameras(NULL),
          mAttachedCamerasNum(0),
          mRemovableCamerasNum(0),
          mConstructedOK(false)
{

	LOGD("camera hal version: %s", CAMERA_HAL_VERSION);

        /* Create the cameras */
	for (int id = 0; id < MAX_NUM_OF_CAMERAS; id++)
	{
		// camera config information
		mCameraConfig[id] = new CCameraConfig(id);
		if(mCameraConfig[id] == 0)
		{
			LOGW("create CCameraConfig failed");
		}
		else
		{
			mCameraConfig[id]->initParameters();
			mCameraConfig[id]->dumpParameters();
		}
	
		mHardwareCameras[id] = new CameraHardware(&HAL_MODULE_INFO_SYM.common, mCameraConfig[id])

	    }
	}

}

int HALCameraFactory::getCameraHardwareNum()
{

}

int HALCameraFactory::get_number_of_cameras(void)
{
    return gEmulatedCameraFactory.getCameraHardwareNum();
}

/* Entry point for camera HAL API. */
struct hw_module_methods_t HALCameraFactory::mCameraModuleMethods = {
    open: HALCameraFactory::device_open
};

camera_module_t HAL_MODULE_INFO_SYM = {
    common: {
         tag:           		HARDWARE_MODULE_TAG,
		 module_api_version:	CAMERA_DEVICE_API_VERSION_1_0,
		 hal_api_version:	 	HARDWARE_HAL_API_VERSION,
         id:            		CAMERA_HARDWARE_MODULE_ID,
         name:          		"V4L2Camera Module",
         author:        		"XSJ",
         methods:       		&android::HALCameraFactory::mCameraModuleMethods,
         dso:           		NULL,
         reserved:      		{0},
    },
    get_number_of_cameras:  	android::HALCameraFactory::get_number_of_cameras,
    get_camera_info:        	android::HALCameraFactory::get_camera_info,
};

```

**CCameraConfig.h**

./device/softwinner/astar-dvk3/configs/camera.cfg

./device/softwinner/polaris-common/hardware/camera/CCameraConfig.h

```cpp

#define CAMERA_KEY_CONFIG_PATH	"/system/etc/camera.cfg"

```

**CameraHardware2.cpp**

./device/softwinner/polaris-common/hardware/camera/CameraHardware2.cpp


```cpp

CameraHardware::CameraHardware(struct hw_module_t* module, CCameraConfig* pCameraCfg)
        : mPreviewWindow(),
          mCallbackNotifier(),
          mCameraConfig(pCameraCfg),
          mIsCameraIdle(true),
          mFirstSetParameters(true),
          mFullSizeWidth(0),
          mFullSizeHeight(0),
          mCaptureWidth(0),
          mCaptureHeight(0),
          mVideoCaptureWidth(0),
          mVideoCaptureHeight(0),
          mUseHwEncoder(false),
          mFaceDetection(NULL),
          mFocusStatus(FOCUS_STATUS_IDLE),
          mIsSingleFocus(false),
          mOriention(0),
          mAutoFocusThreadExit(true),
          mIsImageCaptureIntent(false),
          mIsSupportFocus(false),
          mIsSupportEffect(false),
          mIsSupportFlash(false),
          mIsSupportScene(false),
          mIsSupportWhiteBlance(false),
          mIsSupportExposure(false),
          mZoomRatio(100)
{
	// instance V4L2CameraDevice object
	mV4L2CameraDevice = new V4L2CameraDevice(this, &mPreviewWindow, &mCallbackNotifier);
	if (mV4L2CameraDevice == NULL)
	{
		LOGE("Failed to create V4L2Camera instance");
		return ;
	}
}

```

**V4L2CameraDevice2.cpp**

```cpp

V4L2CameraDevice::V4L2CameraDevice(CameraHardware* camera_hal,
								   PreviewWindow * preview_window, 
    							   CallbackNotifier * cb)
    : mCameraHardware(camera_hal),
      mPreviewWindow(preview_window),
      mCallbackNotifier(cb),
      mCameraDeviceState(STATE_CONSTRUCTED),
      mCaptureThreadState(CAPTURE_STATE_NULL),
      mCameraFd(0),
      mIsUsbCamera(false),
      mTakePictureState(TAKE_PICTURE_NULL),
      mIsPicCopy(false),
      mFrameWidth(0),
      mFrameHeight(0),
      mThumbWidth(0),
      mThumbHeight(0),
      mCurFrameTimestamp(0),
      mBufferCnt(NB_BUFFER),
      mUseHwEncoder(false),
	  mNewZoom(0),
	  mLastZoom(-1),
	  mMaxZoom(0xffffffff),
	  mCaptureFormat(V4L2_PIX_FMT_NV21),
	  mVideoFormat(V4L2_PIX_FMT_NV21)
#ifdef USE_MP_CONVERT
	  ,mG2DHandle(0)
#endif
	  ,mCurrentV4l2buf(NULL)
	  ,mCanBeDisconnected(false)
	  ,mContinuousPictureStarted(false)
	  ,mContinuousPictureCnt(0)
	  ,mContinuousPictureMax(0)
	  ,mContinuousPictureStartTime(0)
	  ,mContinuousPictureLast(0)
	  ,mContinuousPictureAfter(0)
	  ,mFaceDectectLast(0)
	  ,mFaceDectectAfter(0)
	  ,mVideoHint(false)
	  ,mIsThumbUsedForVideo(false)
	  ,mVideoWidth(640)
	  ,mVideoHeight(480)
	  ,mFrameRate(30)
{
	LOGV("V4L2CameraDevice construct");
	memset(&mMapMem,0,sizeof(mMapMem));
	memset(&mVideoBuffer,0,sizeof(mVideoBuffer));

	memset(&mHalCameraInfo, 0, sizeof(mHalCameraInfo));
	memset(&mRectCrop, 0, sizeof(Rect));

	// init preview buffer queue
	OSAL_QueueCreate(&mQueueBufferPreview, NB_BUFFER);
	OSAL_QueueCreate(&mQueueBufferPicture, 2);
	
	pthread_mutex_init(&mConnectMutex, NULL);
	pthread_cond_init(&mConnectCond, NULL);

	// init capture thread
	mCaptureThread = new DoCaptureThread(this);
	pthread_mutex_init(&mCaptureMutex, NULL);
	pthread_cond_init(&mCaptureCond, NULL);
	mCaptureThreadState = CAPTURE_STATE_PAUSED;
	mCaptureThread->startThread();

	// init preview thread
	mPreviewThread = new DoPreviewThread(this);
	pthread_mutex_init(&mPreviewMutex, NULL);
	pthread_cond_init(&mPreviewCond, NULL);
	mPreviewThread->startThread();

	// init picture thread
	mPictureThread = new DoPictureThread(this);
	pthread_mutex_init(&mPictureMutex, NULL);
	pthread_cond_init(&mPictureCond, NULL);
	mPictureThread->startThread();
	
	// init continuous picture thread
	mContinuousPictureThread = new DoContinuousPictureThread(this);
	pthread_mutex_init(&mContinuousPictureMutex, NULL);
	pthread_cond_init(&mContinuousPictureCond, NULL);
	mContinuousPictureThread->startThread();

}

bool V4L2CameraDevice::previewThread()
{
	V4L2BUF_t * pbuf = (V4L2BUF_t *)OSAL_Dequeue(&mQueueBufferPreview);
	if (pbuf == NULL)
	{
		// LOGV("picture queue no buffer, sleep...");
		pthread_mutex_lock(&mPreviewMutex);
		pthread_cond_wait(&mPreviewCond, &mPreviewMutex);
		pthread_mutex_unlock(&mPreviewMutex);
		return true;
	}

	Mutex::Autolock locker(&mObjectLock);
	if (mMapMem.mem[pbuf->index] == NULL
		|| pbuf->addrPhyY == 0)
	{
		LOGV("preview buffer have been released...");
		return true;
	}

	// callback
	mCallbackNotifier->onNextFrameAvailable((void*)pbuf, mUseHwEncoder);

	// preview
	mPreviewWindow->onNextFrameAvailable((void*)pbuf);

	// LOGD("preview id : %d", pbuf->index);

	releasePreviewFrame(pbuf->index);

	return true;
}

// singal picture
bool V4L2CameraDevice::pictureThread()
{
	V4L2BUF_t * pbuf = (V4L2BUF_t *)OSAL_Dequeue(&mQueueBufferPicture);
	if (pbuf == NULL)
	{
		LOGV("picture queue no buffer, sleep...");
		pthread_mutex_lock(&mPictureMutex);
		pthread_cond_wait(&mPictureCond, &mPictureMutex);
		pthread_mutex_unlock(&mPictureMutex);
		return true;
	}

	DBG_TIME_BEGIN("taking picture", 0);

	// notify picture cb
	mCameraHardware->notifyPictureMsg((void*)pbuf);

	DBG_TIME_DIFF("notifyPictureMsg");

	mCallbackNotifier->takePicture((void*)pbuf);
	
	char str[128];
	sprintf(str, "hw picture size: %dx%d", pbuf->width, pbuf->height);
	DBG_TIME_DIFF(str);
	
	if (!mIsPicCopy)
	{
		releasePreviewFrame(pbuf->index);
	}

	DBG_TIME_END("Take picture", 0);

	return true;
}

```

## HAL-RK3288-7.1

[RK3399-camera](https://wiki.t-firefly.com/zh_CN/Firefly-RK3399/driver_camera.html)

hardware/rockchip/camera/CameraHal/CameraHal_Module.cpp

hardware/rockchip/camera/Config/cam_board_rk3288.xml 文件用于配置dvp mipi接口的sensor

```cpp

#define CAMERAS_SUPPORT_MAX             8

rk_cam_info_t gCamInfos[CAMERAS_SUPPORT_MAX];

camera_module_t HAL_MODULE_INFO_SYM = {
    common: {
         tag: HARDWARE_MODULE_TAG,
         version_major: ((CONFIG_CAMERAHAL_VERSION&0xffff00)>>16),
         version_minor: CONFIG_CAMERAHAL_VERSION&0xff,
         id: CAMERA_HARDWARE_MODULE_ID,
         name: CAMERA_MODULE_NAME,
         author: "RockChip",
         methods: &camera_module_methods,
         dso: NULL, /* remove compilation warnings */
         reserved: {0}, /* remove compilation warnings */
    },
    get_number_of_cameras: camera_get_number_of_cameras,
    get_camera_info: camera_get_camera_info,
    set_callbacks:NULL,
    get_vendor_tag_ops:NULL,
#if (defined(ANDROID_5_X) || defined(ANDROID_6_X) || defined(ANDROID_7_X))
    open_legacy:NULL,
#endif
#if (defined(ANDROID_6_X) || defined(ANDROID_7_X))
    set_torch_mode:NULL,
    init:NULL,
#endif
    reserved: {0}
};

int camera_device_open(const hw_module_t* module, const char* name,
                hw_device_t** device)
{

        camera = new android::CameraHal(cameraid);

}


int camera_get_number_of_cameras(void)
{

    profiles = camera_board_profiles::getInstance();
    nCamDev = profiles->mDevieVector.size();
    LOGE("board profiles cam num %d\n", nCamDev);

    if(cam_cnt<CAMERAS_SUPPORT_MAX){
        for (i=0; i<10; i++) {
            cam_path[0] = 0x00;
			unsigned int pix_format_tmp = V4L2_PIX_FMT_NV12;
            strcat(cam_path, CAMERA_DEVICE_NAME);
            sprintf(cam_num, "%d", i);
            strcat(cam_path,cam_num);
            fd = open(cam_path, O_RDONLY);
            if (fd < 0) {
                LOGE("Open %s failed! strr: %s",cam_path,strerror(errno));
                continue;
            } 
            LOGD("Open %s success!",cam_path);
            memset(&capability, 0, sizeof(struct v4l2_capability));

        }
    }

}

int camera_set_preview_window(struct camera_device * device,
        struct preview_stream_ops *window)
{
    int rv = -EINVAL;
    rk_camera_device_t* rk_dev = NULL;

    LOGV("%s", __FUNCTION__);

    if(!device)
        return rv;

    rk_dev = (rk_camera_device_t*) device;

    rv = gCameraHals[rk_dev->cameraid]->setPreviewWindow(window);

    return rv;
}

```

hardware/rockchip/camera/CameraHal/CameraHal.cpp

```cpp

extern rk_cam_info_t gCamInfos[CAMERAS_SUPPORT_MAX];

CameraHal::CameraHal(int cameraId)
          :commandThreadCommandQ("commandCmdQ")
{

	    if((strcmp(gCamInfos[cameraId].driver,"uvcvideo") == 0)) {
	        LOGD("it is a uvc camera!");
	        mCameraAdapter = new CameraUSBAdapter(cameraId);
	    }

}

```

hardware/rockchip/camera/CameraHal/CameraUSBAdapter.cpp

```cpp

void CameraUSBAdapter::initDefaultParameters(int camFd)
{

    /*preview format setting*/
    params.set(CameraParameters::KEY_SUPPORTED_PREVIEW_FORMATS, "yuv420sp,yuv420p");
    params.set(CameraParameters::KEY_VIDEO_FRAME_FORMAT,CameraParameters::PIXEL_FORMAT_YUV420SP);
    params.setPreviewFormat(CameraParameters::PIXEL_FORMAT_YUV420SP);
    params.set(CameraParameters::KEY_VIDEO_FRAME_FORMAT,CameraParameters::PIXEL_FORMAT_YUV420SP);

    /*picture format setting*/
    params.set(CameraParameters::KEY_SUPPORTED_PICTURE_FORMATS, CameraParameters::PIXEL_FORMAT_JPEG);
    params.setPictureFormat(CameraParameters::PIXEL_FORMAT_JPEG);
}

```



