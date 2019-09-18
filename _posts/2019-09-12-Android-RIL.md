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

由于 Android 开发者使用的 Modem 是不一样的，各种指令格式，初始化序列都可能不一样，GSM 和 CDMA 就差别更大了，所以为了消除这些差别，Android 设计者将ril做了一个抽象，使用一个虚拟电话的概念。

这个虚拟电话对象就是GSMPhone(CDMAPhone), Phone 对象所提供的功能协议，以及要求下层的支撑环境都有一个统一的描述，这个底层描述的实现就是靠RIL来完成适配

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
2. HAL 层中的 C++ 程序，简称 RILC(rild)

![android_ril](/images/android_ril.gif)

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

### CommandsInterface.java

```java

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

```

### BaseCommands.java

```java

public abstract class BaseCommands implements CommandsInterface {

    // RegistrantList 注册的消息列表
    protected RegistrantList mCallStateRegistrants = new RegistrantList();

    protected RegistrantList mDataNetworkStateRegistrants = new RegistrantList();

    protected RegistrantList mSignalInfoRegistrants = new RegistrantList();
}

```

### RIL.Java--RILRequest

```java

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

```

### RIL.Java

```java

public final class RIL extends BaseCommands implements CommandsInterface {

    HandlerThread mSenderThread;
    RILSender mSender;

    Thread mReceiverThread;
    RILReceiver mReceiver;

    // 请求消息对象列表
    // RILJ 发起请求消息时，将 RILRequest 请求对象保存在 mRequestsList 列表中;
    // RILC 处理完成返回消息后，将此消息从 mRequestsList 列表移除，
    // 这说明正常情况下 Request 和 Response处于一一对应的关系
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

    // RILC 返回的消息处理
    private void processResponse (Parcel p) {
        int type;

        type = p.readInt();

        if (type == RESPONSE_UNSOLICITED || type == RESPONSE_UNSOLICITED_ACK_EXP) {
            // 处理 Modem 主动上报的消息
            processUnsolicited (p, type);
        } else if (type == RESPONSE_SOLICITED || type == RESPONSE_SOLICITED_ACK_EXP) {
            // 处理 RILJ 请求返回的消息
            RILRequest rr = processSolicited (p, type);
            if (rr != null) {
                if (type == RESPONSE_SOLICITED) {
                    decrementWakeLock(rr);
                }
                rr.release();
                return;
            }
        } else if (type == RESPONSE_SOLICITED_ACK) {
            int serial;
            serial = p.readInt();

            RILRequest rr;
            synchronized (mRequestList) {
                rr = mRequestList.get(serial);
            }
            if (rr == null) {
                Rlog.w(RILJ_LOG_TAG, "Unexpected solicited ack response! sn: " + serial);
            } else {
                decrementWakeLock(rr);
                if (RILJ_LOGD) {
                    riljLog(rr.serialString() + " Ack < " + requestToString(rr.mRequest));
                }
            }
        }
    }

    // 处理 Modem 主动上报的消息
    private void processUnsolicited(Parcel p, int type) {
        int response;
        Object ret;

        response = p.readInt();

        // 组装返回对象ret
        try {
            switch (response) {
                case RIL_UNSOL_RESPONSE_RADIO_STATE_CHANGED:
                    ret = responseVoid(p);
                    break;
                case RIL_UNSOL_RESPONSE_CALL_STATE_CHANGED:
                    ret = responseVoid(p);
                    break;
                -----------------------------------------------
            }
        } catch (Throwable tr) {
            Rlog.e(RILJ_LOG_TAG, "Exception processing unsol response: " + response +
                    "Exception:" + tr.toString());
            return;
        }

        // 发送出 Registant消息通知
        switch (response) {
            case RIL_UNSOL_RESPONSE_RADIO_STATE_CHANGED:
                /* has bonus radio state int */
                RadioState newState = getRadioStateFromInt(p.readInt());
                if (RILJ_LOGD) unsljLogMore(response, newState.toString());

                switchToRadioState(newState);
                break;
                -------------------------------------------------------------------------
            case RIL_UNSOL_SIGNAL_STRENGTH:
                // Note this is set to "verbose" because it happens
                // frequently
                if (RILJ_LOGV) unsljLogvRet(response, ret);

                // 发出消息通知，此通知是 ServiceStaterTracker接收和处理的
                if (mSignalStrengthRegistrant != null) {
                    mSignalStrengthRegistrant.notifyRegistrant(
                            new AsyncResult(null, ret, null));
                }
                break;
        }

    }

    // 处理客户端向 RILC 请求返回的消息
    private RILRequest processSolicited(Parcel p, int type) {
        int serial, error;
        boolean found = false;

        serial = p.readInt();
        error = p.readInt();

        RILRequest rr;

        // 从 mRequestList中找到消息，并从列表移除，从而保证请求消息和返回消息的一一对应关系
        rr = findAndRemoveRequestFromList(serial);

        if (rr == null) {
            Rlog.w(RILJ_LOG_TAG, "Unexpected solicited response! sn: "
                    + serial + " error: " + error);
            return null;
        }
        ----------------------------------------------------------------------
        if (error == 0 || p.dataAvail() > 0) {
            // either command succeeds or command fails but with data payload
            try {
                switch (rr.mRequest) {
                    case RIL_REQUEST_GET_SIM_STATUS:
                        ret = responseIccCardStatus(p);
                        break;
                    case RIL_REQUEST_DIAL:
                        ret = responseVoid(p);
                        break;
                    case RIL_REQUEST_GET_IMSI:
                        ret = responseString(p);
                        break;
                    ---------------------------------------------------------------
            } catch (Throwable tr) {
                // Exceptions here usually mean invalid RIL responses

                Rlog.w(RILJ_LOG_TAG, rr.serialString() + "< "
                        + requestToString(rr.mRequest)
                        + " exception, possible invalid RIL response", tr);

                if (rr.mResult != null) {
                    AsyncResult.forMessage(rr.mResult, null, tr);
                    rr.mResult.sendToTarget();
                }
                return rr;
            }
        }
        ---------------------------------------------------------------------------
        if (error == 0) {

            if (RILJ_LOGD) riljLog(rr.serialString() + "< " + requestToString(rr.mRequest)
                    + " " + retToString(rr.mRequest, ret));

            if (rr.mResult != null) {
                // 发出消息通知，完成请求消息的回调操作
                AsyncResult.forMessage(rr.mResult, ret, null);
                rr.mResult.sendToTarget();
            }
        }
        -----------------------------------------------------------------------------
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

### RIL Receiver

**接收步骤**

1. 分析接收到的Parcel，根据类型不同进行处理
2. 根据数据中的Token（mSerail),反查mRequest,找到对应的请求信息
3. 将是数据转换成结果数据
4. 将结果放在RequestMessage中发回到请求的发起者

![android_ril_reciever](/images/android_ril_reciever.gif)

### RIL Sender

**发送步骤**

1. 生成RILRequest，此时将生成m_Serial（请求的Token)并将请求号，数据，及其Result Message 对象填入到RILRequest中
2. 使用send将RILRequest打包到EVENT_SEND消息中发送到到RIL Sender Handler
3. RilSender 接收到EVENT_SEND消息，将RILRequest通过套接口发送到RILD，同时将RILRequest保存在mRequest中以便应答消息的返回

![android_ril_sender](/images/android_ril_sender.gif)

### RIL 数据流

![android_ril_data](/images/android_ril_data.gif)

### RILJ 运行机制

![android_ril_java](/images/android_ril_java.gif)

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

## RILC

### 代码仓库

```txt

$ tree hardware/ril/

hardware/ril/
├── CleanSpec.mk                   // 编译文件
├── include                        // 头文件
│   ├── libril
│   │   └── ril_ex.h
│   └── telephony
│       ├── librilutils.h
│       ├── record_stream.h
│       ├── ril_cdma_sms.h
│       ├── ril.h
│       ├── ril_msim.h
│       └── ril_nv_items.h
├── libril                         // LibRIL Runtime 运行环境目录
│   ├── Android.mk
│   ├── MODULE_LICENSE_APACHE2
│   ├── NOTICE
│   ├── ril_commands.h            // RILJ 请求消息类型
│   ├── ril.cpp
│   ├── ril_event.cpp
│   ├── ril_event.h
│   ├── RilSapSocket.cpp
│   ├── RilSapSocket.h
│   ├── RilSocket.cpp
│   ├── RilSocket.h
│   ├── rilSocketQueue.h
│   └── ril_unsol_commands.h      // Modem 主动上报消息类型
├── librilutils
│   ├── Android.mk
│   ├── librilutils.c
│   ├── proto
│   │   ├── sap-api.options
│   │   └── sap-api.proto
│   └── record_stream.c
├── reference-ril                   // RIL Stub实现源码目录
│   ├── Android.mk
│   ├── atchannel.c
│   ├── atchannel.h
│   ├── at_tok.c
│   ├── at_tok.h
│   ├── misc.c
│   ├── misc.h
│   ├── MODULE_LICENSE_APACHE2
│   ├── NOTICE
│   ├── reference-ril.c
│   └── ril.h -> ../include/telephony/ril.h
└── rild                                        // rild守护进程目录
    ├── Android.mk                              // system/bin/rild
    ├── MODULE_LICENSE_APACHE2
    ├── NOTICE
    ├── radiooptions.c
    ├── rild.c
    └── rild.rc

```

### Linux HAL-硬件抽象层

**Windows HAL** : 位于驱动程序和硬件设备之间，更换硬件设备无需更换驱动程序

**Linux HAL** : 位于操作系统核心层和驱动程序之上，是一个运行在 User Space 用户空间的服务程序(Daemon process), 为上层应用提供统一的接口，硬件更换时需要更新设备驱动

![linux_hal](/images/linux_hal.png)

### Android HAL

**旧结构** ：应用或者框架通过 *.so 动态链接库的调用而达到对硬件驱动的访问

![android_hal](/images/android_hal.png)

**新结构** ：HAL Stub 是一种 Proxy 代理概念，虽然 Stub 仍然以 *.so 的形式存在，但是具体实现已经隐藏了起来

* Stub 向 HAL 提供 operation 方法
* Runtime(Daemon process) 通过 Stub 提供的 *.so 获取它的 operation 方法，并设置 Callback
* 应用通过 Runtime 调用 Stub 的 operation 方法，并通过 Callback 返回执行结果

![android_hal_2](/images/android_hal_2.png)

### 拨打电话数据流

下面的数据流传递描述图表描述了RIL-JAVA层发出一个电话指令的5 步曲

![android_rild](/images/android_rild.gif)

### RILD 运行框架

![android_rild_2](/images/android_rild_2.gif)

## 代码

### rild.rc

```rc

service ril-daemon /system/bin/rild
    class main
    socket rild stream 660 root radio
    socket sap_uim_socket1 stream 660 bluetooth bluetooth
    socket rild-debug stream 660 radio system
    user root
    group radio cache inet misc audio log readproc wakelock qcom_diag

```

### rild.c

```c

static struct RIL_Env s_rilEnv = {
    RIL_onRequestComplete,
    RIL_onUnsolicitedResponse,
    RIL_requestTimedCallback,
    RIL_onRequestAck
};

int main(int argc, char **argv) {

    ----------------------------------------------------------------------

    RIL_startEventLoop();  // 开始循环监听Socket事件

    // 获取 reference-ril.so 动态链接库，获取指向 RIL_init 函数的指针 rilInit
    rilInit =
        (const RIL_RadioFunctions *(*)(const struct RIL_Env *, int, char **))
        dlsym(dlHandle, "RIL_Init");
    -----------------------------------------------------------------------
   
    // 获取 reference-ril.so 动态链接库的 rilInit 函数，传递 s_rilEnv 给 reference-ril.so 返回 funcs
    funcs = rilInit(&s_rilEnv, argc, rilArgv);
    RLOGD("RIL_Init rilInit completed");

    // 调用 libril.so 的 RIL_register 函数， 将 funcs 传递给 libril.so
    // RIL_register 实际就是初始化监听 socket 所需的参数，然后开始监听 socket 是否有数据到来
    RIL_register(funcs);

    RLOGD("RIL_Init RIL_register completed");

    if (rilUimInit) {
        RLOGD("RIL_register_socket started");
        RIL_register_socket(rilUimInit, RIL_SAP_SOCKET, argc, rilArgv);
    }

    RLOGD("RIL_register_socket completed");

done:

    RLOGD("RIL_Init starting sleep loop");
    while (true) {
        sleep(UINT32_MAX);  // 初始化完成后进入睡眠状态
    }

}

```

rild.c 中的 main 函数负责启动 rild，其中最关键的就是将 LibRIL 和 Reference-RIL 之间建立一种相互调用的能力

* LibRIL 中有指向 Reference-RIL 中 **funcs** 结构体的指针
* Reference-RIL中有指向 LibRIL 中 **s_rilEnv** 结构体的指针

![android_rild_start](/images/android_rild_start.png)

### LibRIL

**ril.cpp**

```cpp

extern "C" void
RIL_startEventLoop(void) {
    /* spin up eventLoop thread and wait for it to get started */
    s_started = 0;
    pthread_mutex_lock(&s_startupMutex);

    pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);

    // 创建基于eventLoop函数调用的子线程
    int result = pthread_create(&s_tid_dispatch, &attr, eventLoop, NULL);
    if (result != 0) {
        RLOGE("Failed to create dispatch thread: %s", strerror(result));
        goto done;
    }

    while (s_started == 0) {
        pthread_cond_wait(&s_startupCond, &s_startupMutex);
    }

done:
    pthread_mutex_unlock(&s_startupMutex);
}

static void *
eventLoop(void *param) {
    int ret;
    int filedes[2];

    ril_event_init();

    pthread_mutex_lock(&s_startupMutex);

    s_started = 1;
    pthread_cond_broadcast(&s_startupCond);

    pthread_mutex_unlock(&s_startupMutex);

    ret = pipe(filedes);  // 创建通信管道, 用于事件的发送和接收

    if (ret < 0) {
        RLOGE("Error in pipe() errno:%d", errno);
        return NULL;
    }

    s_fdWakeupRead = filedes[0];  // 管道的读端
    s_fdWakeupWrite = filedes[1]; // 管道的写端

    fcntl(s_fdWakeupRead, F_SETFL, O_NONBLOCK);

    // 创建一个ril_event：s_wakeupfd_event
    ril_event_set (&s_wakeupfd_event, s_fdWakeupRead, true,
                processWakeupCallback, NULL);

    // 将创建出的ril_event加入到event队列中
    rilEventAddWakeup (&s_wakeupfd_event);

    // Only returns on error
    ril_event_loop();  // 开始循环监听ril_event事件
    RLOGE ("error in event_loop_base errno:%d", errno);
    // kill self to restart on error
    kill(0, SIGKILL);

    return NULL;
}

```

**ril_event.cpp**

```cpp

void ril_event_loop()
{
    int n;
    fd_set rfds;
    struct timeval tv;
    struct timeval * ptv;


    for (;;) {

        // make local copy of read fd_set
        memcpy(&rfds, &readFds, sizeof(fd_set));
        if (-1 == calcNextTimeout(&tv)) {
            // no pending timers; block indefinitely
            dlog("~~~~ no timers; blocking indefinitely ~~~~");
            ptv = NULL;
        } else {
            dlog("~~~~ blocking for %ds + %dus ~~~~", (int)tv.tv_sec, (int)tv.tv_usec);
            ptv = &tv;
        }
        printReadies(&rfds);
        n = select(nfds, &rfds, NULL, NULL, ptv);
        printReadies(&rfds);
        dlog("~~~~ %d events fired ~~~~", n);
        if (n < 0) {
            if (errno == EINTR) continue;

            RLOGE("ril_event: select error (%d)", errno);
            // bail?
            return;
        }

        // Check for timeouts
        processTimeouts();
        // Check for read-ready
        processReadReadies(&rfds, n);
        // Fire away
        firePending();
    }
}

```

**ril_event.h**

```h
// Max number of fd's we watch at any one time.  Increase if necessary.
#define MAX_FD_EVENTS 8

typedef void (*ril_event_cb)(int fd, short events, void *userdata);

struct ril_event {
    struct ril_event *next;
    struct ril_event *prev;

    int fd;
    int index;
    bool persist;
    struct timeval timeout;
    ril_event_cb func;    // 事件执行函数
    void *param;
};

// Initialize internal data structs
void ril_event_init();

// Initialize an event
void ril_event_set(struct ril_event * ev, int fd, bool persist, ril_event_cb func, void * param);

// Add event to watch list
void ril_event_add(struct ril_event * ev);

// Add timer event
void ril_timer_add(struct ril_event * ev, struct timeval * tv);

// Remove event from watch list
void ril_event_del(struct ril_event * ev);

// Event loop
void ril_event_loop();

```

![android_rild_starteventloop](/images/android_rild_starteventloop.png)















