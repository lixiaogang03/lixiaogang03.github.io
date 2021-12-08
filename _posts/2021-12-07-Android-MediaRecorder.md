---
layout:     post
title:      Android MediaRecorder
subtitle:   Android 4.4 Media
date:       2021-12-07
author:     LXG
header-img: img/post-bg-ioses.jpg
catalog: true
tags:
    - media
    - android
---

[media-AOSP](https://source.android.google.cn/devices/media)

[Android MediaRecorder框架简洁梳理-简书](https://www.jianshu.com/p/a00953130b41)

## 架构

![ape_fwk_media](/images/media/ape_fwk_media.png)

## Camera2 app 4.4

```java

public class VideoModule implements CameraModule {

    private MediaRecorder mMediaRecorder;

    private CamcorderProfile mProfile;

    private void startVideoRecording() {
        initializeRecorder();

        mMediaRecorder.start(); // Recording is now started
    }


    private void initializeRecorder() {
        mMediaRecorder = new MediaRecorder();
        mMediaRecorder.setCamera(mCameraDevice.getCamera());
        mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
        mMediaRecorder.setProfile(mProfile);
        mMediaRecorder.setMaxDuration(mMaxVideoDurationInMs);
        mMediaRecorder.setOutputFile(mVideoFileDescriptor.getFileDescriptor());
        mMediaRecorder.setMaxFileSize(maxFileSize);
        mMediaRecorder.setOrientationHint(rotation);
        mMediaRecorder.prepare();

    }

}

```

## MediaRecorder

```java

public class MediaRecorder {
    static {
        System.loadLibrary("media_jni");
        native_init();
    }

    public MediaRecorder() {

        Looper looper;
        if ((looper = Looper.myLooper()) != null) {
            mEventHandler = new EventHandler(this, looper);
        } else if ((looper = Looper.getMainLooper()) != null) {
            mEventHandler = new EventHandler(this, looper);
        } else {
            mEventHandler = null;
        }

        String packageName = ActivityThread.currentPackageName();
        /* Native setup requires a weak reference to our object.
         * It's easier to create it here than in C++.
         */
        native_setup(new WeakReference<MediaRecorder>(this), packageName);
    }

    public native void setCamera(Camera c);

    public native void setAudioSource(int audio_source)
            throws IllegalStateException;

    public native void setVideoSource(int video_source)
            throws IllegalStateException;

    public void setProfile(CamcorderProfile profile) {
        setOutputFormat(profile.fileFormat);
        setVideoFrameRate(profile.videoFrameRate);
        setVideoSize(profile.videoFrameWidth, profile.videoFrameHeight);
        setVideoEncodingBitRate(profile.videoBitRate);
        setVideoEncoder(profile.videoCodec);
        if (profile.quality >= CamcorderProfile.QUALITY_TIME_LAPSE_LOW &&
             profile.quality <= CamcorderProfile.QUALITY_TIME_LAPSE_QVGA) {
            // Nothing needs to be done. Call to setCaptureRate() enables
            // time lapse video recording.
        } else {
            setAudioEncodingBitRate(profile.audioBitRate);
            setAudioChannels(profile.audioChannels);
            setAudioSamplingRate(profile.audioSampleRate);
            setAudioEncoder(profile.audioCodec);
        }
    }

    public void setOutputFile(FileDescriptor fd) throws IllegalStateException
    {
        mPath = null;
        mFd = fd;
    }

    public void prepare() throws IllegalStateException, IOException
    {
        if (mPath != null) {
            FileOutputStream fos = new FileOutputStream(mPath);
            try {
                _setOutputFile(fos.getFD(), 0, 0);
            } finally {
                fos.close();
            }
        } else if (mFd != null) {
            _setOutputFile(mFd, 0, 0);
        } else {
            throw new IOException("No valid output file");
        }

        _prepare();
    }

    // native implementation
    private native void _setOutputFile(FileDescriptor fd, long offset, long length)
        throws IllegalStateException, IOException;
    private native void _prepare() throws IllegalStateException, IOException;

    public native void start() throws IllegalStateException;

    public native void stop() throws IllegalStateException;

    public void reset() {
        native_reset();

        // make sure none of the listeners get called anymore
        mEventHandler.removeCallbacksAndMessages(null);
    }

    private native void native_reset();

    public native void release();

    private static native final void native_init();

    private native final void native_setup(Object mediarecorder_this,
            String clientName) throws IllegalStateException;

    private native final void native_finalize();

}

```

## JNI

frameworks/base/media/jni/android_media_MediaRecorder.cpp

libmedia_jni.so

```cpp

static void
android_media_MediaRecorder_native_setup(JNIEnv *env, jobject thiz, jobject weak_this,
                                         jstring packageName)
{

    // create new listener and give it to MediaRecorder
    sp<JNIMediaRecorderListener> listener = new JNIMediaRecorderListener(env, thiz, weak_this);
    mr->setListener(listener);

   // Convert client name jstring to String16
    const char16_t *rawClientName = env->GetStringChars(packageName, NULL);
    jsize rawClientNameLen = env->GetStringLength(packageName);
    String16 clientName(rawClientName, rawClientNameLen);
    env->ReleaseStringChars(packageName, rawClientName);

    // pass client package name for permissions tracking
    mr->setClientName(clientName);

    setMediaRecorder(env, thiz, mr);
}

static void android_media_MediaRecorder_setCamera(JNIEnv* env, jobject thiz, jobject camera)
{

    sp<Camera> c = get_native_camera(env, camera, NULL);
    sp<MediaRecorder> mr = getMediaRecorder(env, thiz);
    process_media_recorder_call(env, mr->setCamera(c->remote(), c->getRecordingProxy()),
            "java/lang/RuntimeException", "setCamera failed.");
}

static sp<MediaRecorder> getMediaRecorder(JNIEnv* env, jobject thiz)
{
    Mutex::Autolock l(sLock);
    MediaRecorder* const p = (MediaRecorder*)env->GetIntField(thiz, fields.context);
    return sp<MediaRecorder>(p);
}

static sp<MediaRecorder> setMediaRecorder(JNIEnv* env, jobject thiz, const sp<MediaRecorder>& recorder)
{
    Mutex::Autolock l(sLock);
    sp<MediaRecorder> old = (MediaRecorder*)env->GetIntField(thiz, fields.context);
    if (recorder.get()) {
        recorder->incStrong(thiz);
    }
    if (old != 0) {
        old->decStrong(thiz);
    }
    env->SetIntField(thiz, fields.context, (int)recorder.get());
    return old;
}


```

## mediarecorder.cpp

libmedia.so

frameworks/av/include/media/mediarecorder.h

**mediarecorder.h**

```cpp

class MediaRecorder : public BnMediaRecorderClient,
                      public virtual IMediaDeathNotifier
{
public:
    MediaRecorder();
    ~MediaRecorder();

    void        died();
    status_t    initCheck();
    status_t    setCamera(const sp<ICamera>& camera, const sp<ICameraRecordingProxy>& proxy);
    status_t    setPreviewSurface(const sp<IGraphicBufferProducer>& surface);
    status_t    setVideoSource(int vs);
    status_t    setAudioSource(int as);
    status_t    setOutputFormat(int of);
    status_t    setVideoEncoder(int ve);
    status_t    setAudioEncoder(int ae);
    status_t    setOutputFile(const char* path);
    status_t    setOutputFile(int fd, int64_t offset, int64_t length);
    status_t    setVideoSize(int width, int height);
    status_t    setVideoFrameRate(int frames_per_second);
    status_t    setParameters(const String8& params);
    status_t    setListener(const sp<MediaRecorderListener>& listener);
    status_t    setClientName(const String16& clientName);
    status_t    prepare();
    status_t    getMaxAmplitude(int* max);
    status_t    start();
    status_t    stop();
    status_t    reset();
    status_t    init();
    status_t    close();
    status_t    release();
    void        notify(int msg, int ext1, int ext2);
    sp<IGraphicBufferProducer>     querySurfaceMediaSourceFromMediaServer();
    status_t queueBuffer(int index, int addr_y, int addr_c, int64_t timestamp);
    sp<IMemory> getOneBsFrame(int mode);

private:
    void                    doCleanUp();
    status_t                doReset();

    sp<IMediaRecorder>          mMediaRecorder;
    sp<MediaRecorderListener>   mListener;

    // Reference to IGraphicBufferProducer
    // for encoding GL Frames. That is useful only when the
    // video source is set to VIDEO_SOURCE_GRALLOC_BUFFER
    sp<IGraphicBufferProducer>  mSurfaceMediaSource;

    media_recorder_states       mCurrentState;
    bool                        mIsAudioSourceSet;
    bool                        mIsVideoSourceSet;
    bool                        mIsAudioEncoderSet;
    bool                        mIsVideoEncoderSet;
    bool                        mIsOutputFileSet;
    Mutex                       mLock;
    Mutex                       mNotifyLock;
};

```

**mediarecorder.cpp**

frameworks/av/media/libmedia/mediarecorder.cpp

```cpp

MediaRecorder::MediaRecorder() : mSurfaceMediaSource(NULL)
{
    ALOGV("constructor");

    const sp<IMediaPlayerService>& service(getMediaPlayerService());
    if (service != NULL) {
        mMediaRecorder = service->createMediaRecorder();
    }
    if (mMediaRecorder != NULL) {
        mCurrentState = MEDIA_RECORDER_IDLE;
    }


    doCleanUp();
}

status_t MediaRecorder::setCamera(const sp<ICamera>& camera, const sp<ICameraRecordingProxy>& proxy)
{
    ALOGV("setCamera(%p,%p)", camera.get(), proxy.get());
    if (mMediaRecorder == NULL) {
        ALOGE("media recorder is not initialized yet");
        return INVALID_OPERATION;
    }
    if (!(mCurrentState & MEDIA_RECORDER_IDLE)) {
        ALOGE("setCamera called in an invalid state(%d)", mCurrentState);
        return INVALID_OPERATION;
    }

    status_t ret = mMediaRecorder->setCamera(camera, proxy);
    if (OK != ret) {
        ALOGV("setCamera failed: %d", ret);
        mCurrentState = MEDIA_RECORDER_ERROR;
        return ret;
    }
    return ret;
}

```

**IMediaDeathNotifier.cpp**

frameworks/av/media/libmedia/IMediaDeathNotifier.cpp

```cpp

sp<IMediaPlayerService> IMediaDeathNotifier::sMediaPlayerService;

// establish binder interface to MediaPlayerService
/*static*/const sp<IMediaPlayerService>&
IMediaDeathNotifier::getMediaPlayerService()
{
    ALOGV("getMediaPlayerService");
    Mutex::Autolock _l(sServiceLock);
    if (sMediaPlayerService == 0) {
        sp<IServiceManager> sm = defaultServiceManager();
        sp<IBinder> binder;
        do {
            binder = sm->getService(String16("media.player"));
            if (binder != 0) {
                break;
            }
            ALOGW("Media player service not published, waiting...");
            usleep(500000); // 0.5 s
        } while (true);

        if (sDeathNotifier == NULL) {
            sDeathNotifier = new DeathNotifier();
        }
        binder->linkToDeath(sDeathNotifier);
        sMediaPlayerService = interface_cast<IMediaPlayerService>(binder);
    }
    ALOGE_IF(sMediaPlayerService == 0, "no media player service!?");
    return sMediaPlayerService;
}

```

## main_mediaserver

system/bin/mediaserver

frameworks/av/media/mediaserver/main_mediaserver.cpp

```cpp

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

```

libmediaplayerservice.so

frameworks/av/media/libmediaplayerservice/MediaPlayerService.cpp

```cpp

void MediaPlayerService::instantiate() {
    defaultServiceManager()->addService(
            String16("media.player"), new MediaPlayerService());
}


sp<IMediaRecorder> MediaPlayerService::createMediaRecorder()
{
    pid_t pid = IPCThreadState::self()->getCallingPid();
    sp<MediaRecorderClient> recorder = new MediaRecorderClient(this, pid);
    wp<MediaRecorderClient> w = recorder;
    Mutex::Autolock lock(mLock);
    mMediaRecorderClients.add(w);
    ALOGV("Create new media recorder client from pid %d", pid);
    return recorder;
}

```

frameworks/av/media/libmediaplayerservice/MediaRecorderClient.cpp

```cpp

MediaRecorderClient::MediaRecorderClient(const sp<MediaPlayerService>& service, pid_t pid)
{
    ALOGV("Client constructor");
    mPid = pid;
    mRecorder = new StagefrightRecorder;
    mMediaPlayerService = service;
}

status_t MediaRecorderClient::setCamera(const sp<ICamera>& camera,
                                        const sp<ICameraRecordingProxy>& proxy)
{
    ALOGV("setCamera");
    Mutex::Autolock lock(mLock);
    if (mRecorder == NULL) {
        ALOGE("recorder is not initialized");
        return NO_INIT;
    }
    return mRecorder->setCamera(camera, proxy);
}


status_t MediaRecorderClient::prepare()
{
    ALOGV("prepare");
    return mRecorder->prepare();
}


```

frameworks/av/media/libmediaplayerservice/StagefrightRecorder.cpp

```cpp

status_t StagefrightRecorder::init() {
    ALOGV("init");

    mpCedarXRecorder = new CedarXRecorder();

    return OK;
}

status_t StagefrightRecorder::setCamera(const sp<ICamera> &camera,
                                        const sp<ICameraRecordingProxy> &proxy) {
    ALOGV("setCamera");
    if (camera == 0) {
        ALOGE("camera is NULL");
        return BAD_VALUE;
    }
    if (proxy == 0) {
        ALOGE("camera proxy is NULL");
        return BAD_VALUE;
    }

    mCamera = camera;
    mCameraProxy = proxy;
    return OK;
}

status_t StagefrightRecorder::prepare() {

        if (mVideoSource <= VIDEO_SOURCE_CAMERA) {
            mpCedarXRecorder->setPreviewSurface(mPreviewSurface);

            // Get UID here for permission checking
            mClientUid = IPCThreadState::self()->getCallingUid();

	    error = mpCedarXRecorder->setCamera(mCamera, mCameraProxy);
        }

        --------------------------------------------------------------------

        error = mpCedarXRecorder->prepare();
        if (error != OK)
        {
            goto ERROR;
        }

}

```

**全志A33**

frameworks/av/media/CedarX-Projects/CedarXAndroid/IceCreamSandwich/CedarXRecorder.cpp

```cpp

status_t CedarXRecorder::prepare() 
{
	LOGV("prepare");

	// CedarX Create
	CDXRecorder_Create((void**)&mCdxRecorder);

}


status_t CedarXRecorder::start() 
{
	LOGV("start");
    switch (mOutputFormat) {
        case OUTPUT_FORMAT_DEFAULT:
        case OUTPUT_FORMAT_THREE_GPP:
        case OUTPUT_FORMAT_MPEG_4:
            status = startMPEG4Recording();
            break;
    }

}

status_t StagefrightRecorder::startMPEG4Recording() {
    int32_t totalBitRate;
    status_t err = setupMPEG4Recording(
            mOutputFd, mVideoWidth, mVideoHeight,
            mVideoBitRate, &totalBitRate, &mWriter);
    if (err != OK) {
        return err;
    }

    int64_t startTimeUs = systemTime() / 1000;
    sp<MetaData> meta = new MetaData;
    setupMPEG4MetaData(startTimeUs, totalBitRate, &meta);

    err = mWriter->start(meta.get());
    if (err != OK) {
        return err;
    }

    return OK;
}


status_t StagefrightRecorder::setupMPEG4Recording(
        int outputFd,
        int32_t videoWidth, int32_t videoHeight,
        int32_t videoBitRate,
        int32_t *totalBitRate,
        sp<MediaWriter> *mediaWriter) {

    sp<MediaWriter> writer = new MPEG4Writer(outputFd);

    if (mVideoSource < VIDEO_SOURCE_LIST_END) {
        sp<MediaSource> mediaSource;
        err = setupMediaSource(&mediaSource);
        if (err != OK) {
            return err;
        }

        sp<MediaSource> encoder;
        err = setupVideoEncoder(mediaSource, videoBitRate, &encoder);
        if (err != OK) {
            return err;
        }

        writer->addSource(encoder);
    }

}

```

frameworks/av/media/libstagefright/MPEG4Writer.cpp

libstagefright.so

```cpp

status_t MPEG4Writer::start(MetaData *param) {

}

```

## UML

### MeidaRecorder init

![set_camera](/images/media/set_camera)

### MeidaRecorder prepare

![media_prepare](/images/media/media_prepare.webp)

![media_prepare_2](/images/media/media_prepare_2.webp)

### MeidaRecorder start

![media_start](images/media/media_start.webp)














