---
layout:     post
title:      Android RIL
subtitle:   RILJ, RILC, RILD
date:       2019-09-12
author:     LXG
header-img: img/post-bg-iWatch.jpg
catalog: true
tags:
    - android
    - telephony
    - ril
---

## 背景

```java

// 电话状态跟踪
public abstract class CallTracker extends Handler

// 无线服务状态跟踪
public class ServiceStateTracker extends Handler

// 数据连接状态跟踪
public class DcTracker extends Handler;

```

以上三个 Tracker 对象负责与 RIL 类的 Java 对象进行交互，而这些交互在 RIL 层中的处理是与 Modem 基于串口连接的AT命令的发送和执行，最终完成语音通话、网络服务状态和网络数据连接的控制和管理

## 框架

RIL(Radio Interface Layer) 无线通信接口层， 在 Android 源码中分为两大部分

1. Framework 层的 Java 部分，简称 RILJ
2. HAL 层中的 C++ 程序，简称 RILC

![android_ril](/images/android_ril.png)

RILJ 与 RILC 之间通过 rild 端口的 Socket 连接进行 RIL 消息的交互和处理

RILC 与 Modem 之间通过 AT 命令的发送和执行，完成 Modem 的操作控制和查询请求以及 Modem 主动上报的消息处理

## RIL消息

### Solicited消息

**终端主动请求消息: Dial 拨号、Answer 接听电话、Hangup 挂断电话**

```java

public interface RILConstants {

    -----------------------------------------
    int RIL_REQUEST_GET_SIM_STATUS = 1;
    -----------------------------------------
    int RIL_REQUEST_DIAL = 10;
    int RIL_REQUEST_GET_IMSI = 11;
    int RIL_REQUEST_HANGUP = 12;
    -----------------------------------------
    int RIL_REQUEST_GET_IMEI = 38;
    -----------------------------------------
    int RIL_REQUEST_UPDATE_ADN_RECORD = 141;
    -----------------------------------------

    int RIL_RESPONSE_ACKNOWLEDGEMENT = 800;

}

```
### Unsolicited消息

**Modem 硬件主动上报的消息: 来电、接通电话、接收短信、基站信息等消息**

```java

public interface RILConstants {

    int RIL_UNSOL_RESPONSE_BASE = 1000;
    int RIL_UNSOL_RESPONSE_RADIO_STATE_CHANGED = 1000;
    int RIL_UNSOL_RESPONSE_CALL_STATE_CHANGED = 1001;
    int RIL_UNSOL_RESPONSE_VOICE_NETWORK_STATE_CHANGED = 1002;
    int RIL_UNSOL_RESPONSE_NEW_SMS = 1003;
    int RIL_UNSOL_RESPONSE_NEW_SMS_STATUS_REPORT = 1004;
    int RIL_UNSOL_RESPONSE_NEW_SMS_ON_SIM = 1005;

    ----------------------------------------------------------

    int RIL_UNSOL_RESPONSE_ADN_INIT_DONE = 1047;
    int RIL_UNSOL_RESPONSE_ADN_RECORDS = 1048;

}

```

## RILJ

### 核心类

```java

// CommandsInterface.java

public interface CommandsInterface {

    // Radio 无线通信模块的状态
    enum RadioState {
        RADIO_OFF,         /* Radio explicitly powered off (eg CFUN=0) */
        RADIO_UNAVAILABLE, /* Radio unavailable (eg, resetting or not booted) */
        RADIO_ON;          /* Radio is on */

        public boolean isOn() /* and available...*/ {
            return this == RADIO_ON;
        }

        public boolean isAvailable() {
            return this != RADIO_UNAVAILABLE;
        }
    }

}


// BaseCommands.java

public abstract class BaseCommands implements CommandsInterface {

    // RegistrantList 注册的消息列表
    protected RegistrantList mCallStateRegistrants = new RegistrantList();

    protected RegistrantList mDataNetworkStateRegistrants = new RegistrantList();

    protected RegistrantList mSignalInfoRegistrants = new RegistrantList();
}


// RIL.Java

// 请求消息体
class RILRequest {

    static AtomicInteger sNextSerial = new AtomicInteger(0);  // 下一个 RILRequest 对象编号

    private static Object sPoolSync = new Object();  // 用于同步访问

    private static RILRequest sPool = null; // 保存下一个处理的 RILRequest 对象

    private static int sPoolSize = 0;

    private static final int MAX_POOL_SIZE = 4;  // 缓存池大小

    int mSerial;  // 当前请求编号

    int mRequest; // RIL 请求类型

    Message mResult; // 保存 RIL 请求的Message对象

    RILRequest mNext;  // 下一个 RILRequest 处理对象

    /**
     * Retrieves a new RILRequest instance from the pool.
     *
     * @param request RIL_REQUEST_*
     * @param result sent when operation completes
     * @return a RILRequest instance from the pool.
     */
    static RILRequest obtain(int request, Message result) {
        RILRequest rr = null;

        synchronized(sPoolSync) {
            if (sPool != null) {
                rr = sPool;
                sPool = rr.mNext;
                rr.mNext = null;
                sPoolSize--;
            }
        }

        if (rr == null) {
            rr = new RILRequest();
        }

        rr.mSerial = sNextSerial.getAndIncrement();

        rr.mRequest = request;
        rr.mResult = result;
        rr.mParcel = Parcel.obtain();

        rr.mWakeLockType = RIL.INVALID_WAKELOCK;
        rr.mStartTimeMs = SystemClock.elapsedRealtime();
        if (result != null && result.getTarget() == null) {
            throw new NullPointerException("Message target must not be null");
        }

        // first elements in any RIL Parcel
        rr.mParcel.writeInt(request);
        rr.mParcel.writeInt(rr.mSerial);

        return rr;
    }

    // RIL 请求返回异常或者失败的处理
    void onError(int error, Object ret) {
        CommandException ex;

        ex = CommandException.fromRilErrno(error);

        if (RIL.RILJ_LOGD) Rlog.d(LOG_TAG, serialString() + "< "
            + RIL.requestToString(mRequest)
            + " error: " + ex + " ret=" + RIL.retToString(mRequest, ret));

        if (mResult != null) {
            AsyncResult.forMessage(mResult, ret, ex);
            mResult.sendToTarget();
        }

        if (mParcel != null) {
            mParcel.recycle();
            mParcel = null;
        }
    }

}

public final class RIL extends BaseCommands implements CommandsInterface {

    HandlerThread mSenderThread;
    RILSender mSender;

    Thread mReceiverThread;
    RILReceiver mReceiver;

    // 请求消息对象列表
    SparseArray<RILRequest> mRequestList = new SparseArray<RILRequest>();

    // 向RILC发出请求消息
    class RILSender extends Handler implements Runnable {

        @Override
        public void handleMessage(Message msg) {
            RILRequest rr = (RILRequest)(msg.obj);
            RILRequest req = null;

            switch (msg.what) {
                case EVENT_SEND:
                case EVENT_SEND_ACK:
                        LocalSocket s;

                        s = mSocket;
                        ---------------------------------------------
                        // 向 Socket 写入请求消息
                        s.getOutputStream().write(dataLength);
                        s.getOutputStream().write(data);
                        ---------------------------------------------
                     break;
            }
        }

    }

    // 接收RILC发出的消息
    class RILReceiver implements Runnable {

        // 循环监听mSocket上报的消息
        @Override
        public void run() {
            ------------------------------------------------------------------
                for (;;) {
                    ----------------------------------------------------------
                    s = new LocalSocket();
                    l = new LocalSocketAddress(rilSocket,
                            LocalSocketAddress.Namespace.RESERVED);
                    s.connect(l);
                    ----------------------------------------------------------


                    InputStream is = mSocket.getInputStream();

                    for (;;) {
                        Parcel p;

                        length = readRilMessage(is, buffer);

                        p = Parcel.obtain();
                        p.unmarshall(buffer, 0, length);
                        p.setDataPosition(0);

                        //Rlog.v(RILJ_LOG_TAG, "Read packet: " + length + " bytes");

                        processResponse(p);  // 处理 RILC 上报的消息
                        p.recycle();

                    }

                }
            --------------------------------------------------------------------
        }

    }

    // 向 RILC 发送请求消息
    private void send(RILRequest rr) {
        Message msg;

        if (mSocket == null) {
            rr.onError(RADIO_NOT_AVAILABLE, null);
            rr.release();
            return;
        }

        msg = mSender.obtainMessage(EVENT_SEND, rr);
        acquireWakeLock(rr, FOR_WAKELOCK);
        msg.sendToTarget();
    }

    @Override
    public void getIMEI(Message result) {
        RILRequest rr = RILRequest.obtain(RIL_REQUEST_GET_IMEI, result);

        if (RILJ_LOGD) riljLog(rr.serialString() + "> " + requestToString(rr.mRequest));

        send(rr);
    }

    @Override
    public void getSignalStrength (Message result) {
        RILRequest rr
                = RILRequest.obtain(RIL_REQUEST_SIGNAL_STRENGTH, result);

        if (RILJ_LOGD) riljLog(rr.serialString() + "> " + requestToString(rr.mRequest));

        send(rr);
    }


    // 打开移动数据链接
    @Override
    public void setupDataCall(int radioTechnology, int profile, String apn,
            String user, String password, int authType, String protocol,
            Message result) {
        RILRequest rr
                = RILRequest.obtain(RIL_REQUEST_SETUP_DATA_CALL, result);

        rr.mParcel.writeInt(7);

        rr.mParcel.writeString(Integer.toString(radioTechnology + 2));
        rr.mParcel.writeString(Integer.toString(profile));
        rr.mParcel.writeString(apn);
        rr.mParcel.writeString(user);
        rr.mParcel.writeString(password);
        rr.mParcel.writeString(Integer.toString(authType));
        rr.mParcel.writeString(protocol);

        if (RILJ_LOGD) riljLog(rr.serialString() + "> "
                + requestToString(rr.mRequest) + " " + radioTechnology + " "
                + profile + " " + apn + " " + user + " "
                + password + " " + authType + " " + protocol);

        mMetrics.writeRilSetupDataCall(mInstanceId, rr.mSerial,
                radioTechnology, profile, apn, authType, protocol);

        send(rr);
    }

}

```

### RILJ 运行机制

![android_ril_java](/images/android_ril_java.png)

**CallTracker 通话状态跟踪**

```java

public abstract class CallTracker extends Handler {

    // RIL.java 对象
    public CommandsInterface mCi;

}

public class GsmCdmaCallTracker extends CallTracker {

    // 拨号
    public synchronized Connection dial(String dialString, int clirMode, UUSInfo uusInfo,
                                        Bundle intentExtras)

                    mCi.dial(mPendingMO.getAddress(), clirMode, uusInfo, obtainCompleteMessage());

    }

}

```

**ServiceStateTracker SIM卡注册的网络服务跟踪**

```java

public class ServiceStateTracker extends Handler {

    // RIL.java 对象
    public CommandsInterface mCi;

    @Override
    public void handleMessage(Message msg) {

            case EVENT_POLL_SIGNAL_STRENGTH:
                mCi.getSignalStrength(obtainMessage(EVENT_GET_SIGNAL_STRENGTH));

    }

}

```

**DcTracker 网络数据链接状态跟踪**

```java

public class DcTracker extends Handler {

    @Override
    public void handleMessage (Message msg) {

            case DctConstants.CMD_SET_USER_DATA_ENABLE: {
                final boolean enabled = (msg.arg1 == DctConstants.ENABLED) ? true : false;
                if (DBG) log("CMD_SET_USER_DATA_ENABLE enabled=" + enabled);
                onSetUserDataEnabled(enabled);
                break;

    }

    // 打开或者关闭移动数据链接
    public void setDataEnabled(boolean enable) {
        Message msg = obtainMessage(DctConstants.CMD_SET_USER_DATA_ENABLE);
        msg.arg1 = enable ? 1 : 0;
        if (DBG) log("setDataEnabled: sendMessage: enable=" + enable);
        sendMessage(msg);
    }

}

public class DataConnection extends StateMachine {

    private class DcInactiveState extends State {

        @Override
        public boolean processMessage(Message msg) {

                case EVENT_CONNECT:
                    if (DBG) log("DcInactiveState: mag.what=EVENT_CONNECT");
                    ConnectionParams cp = (ConnectionParams) msg.obj;
                    if (initConnection(cp)) {
                        onConnect(mConnectionParams);
                        transitionTo(mActivatingState);
                    } else {
                        if (DBG) {
                            log("DcInactiveState: msg.what=EVENT_CONNECT initConnection failed");
                        }
                        notifyConnectCompleted(cp, DcFailCause.UNACCEPTABLE_NETWORK_PARAMETER,
                                false);
                    }
                    retVal = HANDLED;
                    break;

        }

    }


    /**
     * Begin setting up a data connection, calls setupDataCall
     * and the ConnectionParams will be returned with the
     * EVENT_SETUP_DATA_CONNECTION_DONE AsyncResul.userObj.
     *
     * @param cp is the connection parameters
     */
    private void onConnect(ConnectionParams cp) {

        mPhone.mCi.setupDataCall(
                cp.mRilRat,
                cp.mProfileId,
                mApnSetting.apn, mApnSetting.user, mApnSetting.password,
                authType,
                protocol, msg);

    }

}

```










