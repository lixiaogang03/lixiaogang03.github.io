---
layout:     post
title:      Android NITZ NTP
subtitle:   自动更新时间
date:       2022-01-05
author:     LXG
header-img: img/post-bg-iWatch.jpg
catalog: true
tags:
    - Android
---

[Android 7.1.1时间更新NITZ和NTP详解](https://blog.csdn.net/yin1031468524/article/details/65447849?utm_source=tuicool)

## NITZ

Network Identity and Time Zone（网络标识和时区），是一种用于自动配置本地的时间和日期的机制，需要运营商支持，可从运营商获取时间和时区具体信息

![nitz](/images/hardware/time/nitz.png)

```java

public class ServiceStateTracker extends Handler {

    protected static final int EVENT_NITZ_TIME                         = 11;

    @Override
    public void handleMessage(Message msg) {
        AsyncResult ar;
        switch (msg.what) {
            case EVENT_NITZ_TIME:
                ar = (AsyncResult) msg.obj;

                String nitzString = (String)((Object[])ar.result)[0];
                long nitzReceiveTime = ((Long)((Object[])ar.result)[1]).longValue();

                setTimeFromNITZString(nitzString, nitzReceiveTime);
                break;
        }

    }


    /**
     * nitzReceiveTime is time_t that the NITZ time was posted
     */
    private void setTimeFromNITZString (String nitz, long nitzReceiveTime) {
        // "yy/mm/dd,hh:mm:ss(+/-)tz"
        // tz is in number of quarter-hours

        long start = SystemClock.elapsedRealtime();
        if (DBG) {
            log("NITZ: " + nitz + "," + nitzReceiveTime +
                " start=" + start + " delay=" + (start - nitzReceiveTime));
        }

        ---------------------------------------------------------------

    }

}

```

## NTP

Network Time Protocol（网络时间协议），用来同步网络中各个计算机的时间的协议。在手机中，NTP更新时间的方式是通过GPRS或wifi向特定服务器获取时间信息(不包含时区信息)

![ntp](/images/hardware/time/ntp.png)

```java

public class NetworkTimeUpdateService extends Binder {

    public NetworkTimeUpdateService(Context context) {
        mContext = context;
        mTime = NtpTrustedTime.getInstance(context);
        mAlarmManager = (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
        Intent pollIntent = new Intent(ACTION_POLL, null);
        mPendingPollIntent = PendingIntent.getBroadcast(mContext, POLL_REQUEST, pollIntent, 0);

        mPollingIntervalMs = mContext.getResources().getInteger(
                com.android.internal.R.integer.config_ntpPollingInterval);
        mPollingIntervalShorterMs = mContext.getResources().getInteger(
                com.android.internal.R.integer.config_ntpPollingIntervalShorter);
        mTryAgainTimesMax = mContext.getResources().getInteger(
                com.android.internal.R.integer.config_ntpRetry);
        mTimeErrorThresholdMs = mContext.getResources().getInteger(
                com.android.internal.R.integer.config_ntpThreshold);

        mWakeLock = ((PowerManager) context.getSystemService(Context.POWER_SERVICE)).newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK, TAG);
    }


    /** Handler to do the network accesses on */
    private class MyHandler extends Handler {

        public MyHandler(Looper l) {
            super(l);
        }

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case EVENT_AUTO_TIME_CHANGED:
                case EVENT_POLL_NETWORK_TIME:
                case EVENT_NETWORK_CHANGED:
                    onPollNetworkTime(msg.what);
                    break;
            }
        }
    }


    private void onPollNetworkTime(int event) {
        //Log.d(TAG, "onPollNetworkTime: " + event);
        logEventToString(event);
        // If Automatic time is not set, don't bother.
        if (!isAutomaticTimeRequested()) return;
        mWakeLock.acquire();
        try {
            onPollNetworkTimeUnderWakeLock(event);
        } finally {
            mWakeLock.release();
        }
    }

    private void onPollNetworkTimeUnderWakeLock(int event) {
        final long refTime = SystemClock.elapsedRealtime();
        // If NITZ time was received less than mPollingIntervalMs time ago,
        // no need to sync to NTP.
        // NITZ > NTP
        if (mNitzTimeSetTime != NOT_SET && refTime - mNitzTimeSetTime < mPollingIntervalMs) {
            resetAlarm(mPollingIntervalMs);
            return;
        }
        final long currentTime = System.currentTimeMillis();
        if (DBG) Log.d(TAG, "System time = " + stampToDateMillis(currentTime));
        // Get the NTP time
        if (mLastNtpFetchTime == NOT_SET || refTime >= mLastNtpFetchTime + mPollingIntervalMs
                || event == EVENT_AUTO_TIME_CHANGED) {
            if (DBG) Log.d(TAG, "Before Ntp fetch");

            // force refresh NTP cache when outdated
            if (mTime.getCacheAge() >= mPollingIntervalMs) {
                mTime.forceRefresh();
            }

            // only update when NTP time is fresh
            if (mTime.getCacheAge() < mPollingIntervalMs) {
                final long ntp = mTime.currentTimeMillis();
                mTryAgainCounter = 0;
                // If the clock is more than N seconds off or this is the first time it's been
                // fetched since boot, set the current time.
                if (Math.abs(ntp - currentTime) > mTimeErrorThresholdMs
                        || mLastNtpFetchTime == NOT_SET) {
                    // Set the system time
                    if (DBG && mLastNtpFetchTime == NOT_SET
                            && Math.abs(ntp - currentTime) <= mTimeErrorThresholdMs) {
                        Log.d(TAG, "For initial setup, rtc = " + currentTime);
                    }
                    if (DBG) Log.d(TAG, "Ntp time to be set = " + ntp);
                    // Make sure we don't overflow, since it's going to be converted to an int
                    if (ntp / 1000 < Integer.MAX_VALUE) {
                        SystemClock.setCurrentTimeMillis(ntp);
                    }
                } else {
                    if (DBG) Log.d(TAG, "Ntp time is close enough = " + ntp);
                }
                mLastNtpFetchTime = SystemClock.elapsedRealtime();
            } else {
                // Try again shortly
                mTryAgainCounter++;
                if (mTryAgainTimesMax < 0 || mTryAgainCounter <= mTryAgainTimesMax) {
                    resetAlarm(mPollingIntervalShorterMs);
                } else {
                    // Try much later
                    mTryAgainCounter = 0;
                    resetAlarm(mPollingIntervalMs);
                }
                return;
            }
        }
        resetAlarm(mPollingIntervalMs);
    }

}

```

## NTP 重试机制

frameworks/base/core/java/android/util/NtpTrustedTime.java

```java

public class NtpTrustedTime implements TrustedTime {


    private final String[] ntpServerHost = new String[] {
        "ntp.aliyun.com", // aliyun
        "ntp2.aliyun.com",
        "ntp.tencent.com", // 腾讯云公共 NTP 服务器
        "ntp2.tencent.com",
        "ntp.ntsc.ac.cn", // 国家授时中心 NTP 服务器
        "cn.ntp.org.cn",  // 中国 NTP 快速授时服务
        "cn.pool.ntp.org", // 国际 NTP 快速授时服务
        "2.pool.ntp.org",  // 国际 NTP 快速授时服务
    };

    @UnsupportedAppUsage(maxTargetSdk = Build.VERSION_CODES.R, trackingBug = 170729553)
    public boolean forceRefresh() {
        synchronized (this) {
            NtpConnectionInfo connectionInfo = getNtpConnectionInfo();
            if (connectionInfo == null) {
                // missing server config, so no trusted time available
                if (LOGD) Log.d(TAG, "forceRefresh: invalid server config");
                return false;
            }

            ConnectivityManager connectivityManager = mConnectivityManagerSupplier.get();
            if (connectivityManager == null) {
                if (LOGD) Log.d(TAG, "forceRefresh: no ConnectivityManager");
                return false;
            }
            final Network network = connectivityManager.getActiveNetwork();
            final NetworkInfo ni = connectivityManager.getNetworkInfo(network);
            if (ni == null || !ni.isConnected()) {
                if (LOGD) Log.d(TAG, "forceRefresh: no connectivity");
                return false;
            }

            if (LOGD) Log.d(TAG, "forceRefresh() from cache miss");
            final SntpClient client = new SntpClient();
            final String serverName = connectionInfo.getServer();
            final int timeoutMillis = connectionInfo.getTimeoutMillis();
            if (client.requestTime(serverName, timeoutMillis, network)) {
                long ntpCertainty = client.getRoundTripTime() / 2;
                mTimeResult = new TimeResult(
                        client.getNtpTime(), client.getNtpTimeReference(), ntpCertainty);
                return true;
            } else {
                return false;
            }
        }
    }
    
    @GuardedBy("this")
    private NtpConnectionInfo getNtpConnectionInfo() {
        final ContentResolver resolver = mContext.getContentResolver();

        final Resources res = mContext.getResources();

        //modify by lixiaogang start
        //final String defaultServer = res.getString(
        //        com.android.internal.R.string.config_ntpServer);
        Random random = new Random();
        int index = random.nextInt(ntpServerHost.length);
        String defaultServer = ntpServerHost[index];
        Log.d(TAG, "Request the NTP address " + defaultServer);
        //modify by lixiaogang end

        final int defaultTimeoutMillis = res.getInteger(
                com.android.internal.R.integer.config_ntpTimeout);

        final String secureServer = Settings.Global.getString(
                resolver, Settings.Global.NTP_SERVER);
        final int timeoutMillis = Settings.Global.getInt(
                resolver, Settings.Global.NTP_TIMEOUT, defaultTimeoutMillis);

        final String server = secureServer != null ? secureServer : defaultServer;
        return TextUtils.isEmpty(server) ? null : new NtpConnectionInfo(server, timeoutMillis);
    }

}

```

frameworks/base/core/res/res/values/config.xml

```xml

    <string translatable="false" name="config_ntpServer">ntp.aliyun.com</string>
    <integer name="config_ntpPollingInterval">86400000</integer>
    <integer name="config_ntpPollingIntervalShorter">8000</integer>
    <integer name="config_ntpRetry">3</integer>
    <integer name="config_ntpThreshold">5000</integer>
    <integer name="config_ntpTimeout">5000</integer>

```

## 总结

NITZ的优先级要高于NTP的优先级，当NITZ更新系统时间后，NTP即使触发更新条件，也会检查NITZ更新时间距今是否超过864000000毫秒 (10天，config_ntpPollingInterval)，若不满10天，则重设Alarm并取消此次NTP更新请求

NITZ主要依赖于运营商上报，NTP则主要依赖于网络环境，NITZ通过被动接收获取时间，NTP通过访问NtpServer获取网络时间，最后都是通过调用SystemClock.setCurrentTimeMillis更新手机时间

