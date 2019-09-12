---
layout:     post
title:      Android TelephonyManager
subtitle:   eSIM
date:       2019-08-06
author:     LXG
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - TelephonyManager
    - Android
    - eSIM
---

[TelephonyManager-developer](https://developer.android.google.cn/reference/android/telephony/TelephonyManager)


## 架构图

![TelephonyRegistry](/images/phone_architecture.png)

## TelephonyTesgistry

TelephonyTesgistry 实现手机无线电信息集中管理和通知，通过回调或广播的形式通知应用等如下信息：

1. 手机无线电信号状态
2. 手机无线电信号强度
3. 手机通话状态
4. 基站位置
5. 数据连接状态
6. 基站信息
7. 基站变化
8. 呼叫转移变化
9. OTASP变化
10. 等等


## dumpsys telephony.registry

![TelephonyRegistry](/images/telephony_registry.png)


```java

class TelephonyRegistry extends ITelephonyRegistry.Stub {


    @Override
    public void dump(FileDescriptor fd, PrintWriter pw, String[] args) {
        if (mContext.checkCallingOrSelfPermission(android.Manifest.permission.DUMP)
                != PackageManager.PERMISSION_GRANTED) {
            pw.println("Permission Denial: can't dump telephony.registry from from pid="
                    + Binder.getCallingPid() + ", uid=" + Binder.getCallingUid());
            return;
        }
        synchronized (mRecords) {
            final int recordCount = mRecords.size();
            pw.println("last known state:");
            for (int i = 0; i < TelephonyManager.getDefault().getPhoneCount(); i++) {
                pw.println("  Phone Id=" + i);
                pw.println("  mCallState=" + mCallState[i]);
                pw.println("  mCallIncomingNumber=" + mCallIncomingNumber[i]);
                pw.println("  mServiceState=" + mServiceState[i]);
                pw.println("  mSignalStrength=" + mSignalStrength[i]);
                pw.println("  mMessageWaiting=" + mMessageWaiting[i]);
                pw.println("  mCallForwarding=" + mCallForwarding[i]);
                pw.println("  mDataActivity=" + mDataActivity[i]);
                pw.println("  mDataConnectionState=" + mDataConnectionState[i]);
                pw.println("  mDataConnectionPossible=" + mDataConnectionPossible[i]);
                pw.println("  mDataConnectionReason=" + mDataConnectionReason[i]);
                pw.println("  mDataConnectionApn=" + mDataConnectionApn[i]);
                pw.println("  mDataConnectionLinkProperties=" + mDataConnectionLinkProperties[i]);
                pw.println("  mDataConnectionNetworkCapabilities=" +
                        mDataConnectionNetworkCapabilities[i]);
                pw.println("  mCellLocation=" + mCellLocation[i]);
                pw.println("  mCellInfo=" + mCellInfo.get(i));
            }
            pw.println("registrations: count=" + recordCount);
            for (Record r : mRecords) {
                pw.println("  " + r);
            }
        }
    }

}

```

## ServiceState

```java

/**
 * Contains phone state and service related information.
 *
 * The following phone information is included in returned ServiceState:
 *
 * <ul>
 *   <li>Service state: IN_SERVICE, OUT_OF_SERVICE, EMERGENCY_ONLY, POWER_OFF
 *   <li>Roaming indicator
 *   <li>Operator name, short name and numeric id
 *   <li>Network selection mode
 * </ul>
 */
public class ServiceState implements Parcelable {

    /**
     * Normal operation condition, the phone is registered
     * with an operator either in home network or in roaming.
     */
    public static final int STATE_IN_SERVICE = 0;

    /**
     * Phone is not registered with any operator, the phone
     * can be currently searching a new operator to register to, or not
     * searching to registration at all, or registration is denied, or radio
     * signal is not available.
     */
    public static final int STATE_OUT_OF_SERVICE = 1;

    /**
     * The phone is registered and locked.  Only emergency numbers are allowed. {@more}
     */
    public static final int STATE_EMERGENCY_ONLY = 2;

    /**
     * Radio of telephony is explicitly powered off.
     */
    public static final int STATE_POWER_OFF = 3;

    /**
     * Get current registered data network operator name in long alphanumeric format.
     * @return long name of voice operator
     * @hide
     */
    public String getDataOperatorAlphaLong() {
        return mDataOperatorAlphaLong;
    }

    /**
     * Get current registered operator name in long alphanumeric format.
     *
     * In GSM/UMTS, long format can be up to 16 characters long.
     * In CDMA, returns the ERI text, if set. Otherwise, returns the ONS.
     *
     * @return long name of operator, null if unregistered or unknown
     */
    public String getOperatorAlphaLong() {
        return mVoiceOperatorAlphaLong;
    }

    @Override
    public String toString() {
        String radioTechnology = rilRadioTechnologyToString(mRilVoiceRadioTechnology);
        String dataRadioTechnology = rilRadioTechnologyToString(mRilDataRadioTechnology);

        return (mVoiceRegState                                                          // 语音注册状态
                + " " + mDataRegState                                                   // 数据注册状态
                + " "
                + "voice " + getRoamingLogString(mVoiceRoamingType)                     // 语音漫游类型
                + " "
                + "data " + getRoamingLogString(mDataRoamingType)                       // 数据漫游类型
                + " " + mVoiceOperatorAlphaLong                                         // 语音服务运营商
                + " " + mVoiceOperatorAlphaShort
                + " " + mVoiceOperatorNumeric                                           // 46000 中国移动(GSM), 46001 中国联通(GSM), 46003 中国电信(CDMA)
                + " " + mDataOperatorAlphaLong                                          // 数据服务运营商
                + " " + mDataOperatorAlphaShort
                + " " + mDataOperatorNumeric
                + " " + (mIsManualNetworkSelection ? "(manual)" : "")
                + " " + radioTechnology                                                  // 无线通信技术类型
                + " " + dataRadioTechnology                                              // 数据无线通信技术类型                                           
                + " " + (mCssIndicator ? "CSS supported" : "CSS not supported")
                + " " + mNetworkId
                + " " + mSystemId
                + " RoamInd=" + mCdmaRoamingIndicator
                + " DefRoamInd=" + mCdmaDefaultRoamingIndicator
                + " EmergOnly=" + mIsEmergencyOnly                                       // 拨打紧急电话
                + " IsDataRoamingFromRegistration=" + mIsDataRoamingFromRegistration
                + " IsUsingCarrierAggregation=" + mIsUsingCarrierAggregation
                + " mRilImsRadioTechnology=" + mRilImsRadioTechnology);
    }

}

```

### ServiceState toString

```txt

    0                    // 语音注册状态  STATE_IN_SERVICE
    0                    // 数据注册状态  STATE_IN_SERVICE
    voice home           // 语音漫游类型  home
    data home            // 数据漫游类型  home
    树米eSIM              // 语音服务运行商
    树米eSIM
    46000                // 46000 中国移动(GSM), 46001 中国联通(GSM), 46003 中国电信(CDMA)
    树米eSIM
    树米eSIM
    46000
    LTE LTE              // 无线通信技术类型
    CSS not supported
    -1
    -1 
    RoamInd=-1 DefRoamInd=-1
    EmergOnly=false
    IsDataRoamingFromRegistration=false
    IsUsingCarrierAggregation=false
    mRilImsRadioTechnology=0

```txt

## ServiceStateTracker

ServiceStateTracker主要处理一些与网络相关的状态和数据，它通过注册监听RIL层来获取网络状态的变化，注册监听UiccController 来获取SIM卡的变化情况及SIM卡数据，之后通知其他类网络状态的变更情况。
这部分网络状态主要包括：

1. CS，PS域的注册情况
2. 漫游情况
3. 运营商名字
4. 网络模式
5. 信号格变化
6. 时区，注册小区的情况

```java

package com.android.internal.telephony;

/**
 * {@hide}
 */
public class ServiceStateTracker extends Handler {

    private CommandsInterface mCi;           // RIL 对象

    protected UiccController mUiccController;

    public ServiceState mSS;                 // 当前ServiceState对象

    protected ServiceState mNewSS;           // 最新ServiceState对象

    private SignalStrength mSignalStrength;  // 手机无线网络信号量

    protected GsmCdmaPhone mPhone;           // Phone对象

    public CellLocation mCellLoc;            // 当前小区信息

    private CellLocation mNewCellLoc;        // 最新小区信息


    /** GSM events */
    // 无线通信模块状态变化
    protected static final int EVENT_RADIO_STATE_CHANGED               = 1;
    // 无线网络状态变化
    protected static final int EVENT_NETWORK_STATE_CHANGED             = 2;
    protected static final int EVENT_GET_SIGNAL_STRENGTH               = 3;
    protected static final int EVENT_POLL_STATE_REGISTRATION           = 4;
    protected static final int EVENT_POLL_STATE_GPRS                   = 5;
    protected static final int EVENT_POLL_STATE_OPERATOR               = 6;
    protected static final int EVENT_POLL_SIGNAL_STRENGTH              = 10;
    protected static final int EVENT_NITZ_TIME                         = 11;
    // 无线网络信号状态变化
    protected static final int EVENT_SIGNAL_STRENGTH_UPDATE            = 12;

    // 无线通信模块Modem或Radio的开启状态
    protected static final int EVENT_RADIO_AVAILABLE                   = 13;
    protected static final int EVENT_POLL_STATE_NETWORK_SELECTION_MODE = 14;
    protected static final int EVENT_GET_LOC_DONE                      = 15;
    protected static final int EVENT_SIM_RECORDS_LOADED                = 16;
    // SIM卡准备完毕
    protected static final int EVENT_SIM_READY                         = 17;
    protected static final int EVENT_LOCATION_UPDATES_ENABLED          = 18;
    protected static final int EVENT_GET_PREFERRED_NETWORK_TYPE        = 19;
    protected static final int EVENT_SET_PREFERRED_NETWORK_TYPE        = 20;
    protected static final int EVENT_RESET_PREFERRED_NETWORK_TYPE      = 21;
    protected static final int EVENT_CHECK_REPORT_GPRS                 = 22;
    protected static final int EVENT_RESTRICTED_STATE_CHANGED          = 23;

    /** CDMA events */
    protected static final int EVENT_RUIM_READY                        = 26;
    protected static final int EVENT_RUIM_RECORDS_LOADED               = 27;
    protected static final int EVENT_POLL_STATE_CDMA_SUBSCRIPTION      = 34;
    protected static final int EVENT_NV_READY                          = 35;
    protected static final int EVENT_ERI_FILE_LOADED                   = 36;
    protected static final int EVENT_OTA_PROVISION_STATUS_CHANGE       = 37;
    protected static final int EVENT_SET_RADIO_POWER_OFF               = 38;
    protected static final int EVENT_CDMA_SUBSCRIPTION_SOURCE_CHANGED  = 39;
    protected static final int EVENT_CDMA_PRL_VERSION_CHANGED          = 40;

    protected static final int EVENT_RADIO_ON                          = 41;
    public    static final int EVENT_ICC_CHANGED                       = 42;
    protected static final int EVENT_GET_CELL_INFO_LIST                = 43;
    protected static final int EVENT_UNSOL_CELL_INFO_LIST              = 44;
    protected static final int EVENT_CHANGE_IMS_STATE                  = 45;
    protected static final int EVENT_IMS_STATE_CHANGED                 = 46;
    protected static final int EVENT_IMS_STATE_DONE                    = 47;
    protected static final int EVENT_IMS_CAPABILITY_CHANGED            = 48;
    protected static final int EVENT_ALL_DATA_DISCONNECTED             = 49;
    protected static final int EVENT_PHONE_TYPE_SWITCHED               = 50;
    protected static final int EVENT_RADIO_POWER_OFF_DONE              = 51;

    public ServiceStateTracker(GsmCdmaPhone phone, CommandsInterface ci) {

        mUiccController.registerForIccChanged(this, EVENT_ICC_CHANGED, null);
        mCi.setOnSignalStrengthUpdate(this, EVENT_SIGNAL_STRENGTH_UPDATE, null);
        mCi.registerForCellInfoList(this, EVENT_UNSOL_CELL_INFO_LIST, null);

        mCi.registerForImsNetworkStateChanged(this, EVENT_IMS_STATE_CHANGED, null);
        mCi.registerForRadioStateChanged(this, EVENT_RADIO_STATE_CHANGED, null);
        mCi.registerForVoiceNetworkStateChanged(this, EVENT_NETWORK_STATE_CHANGED, null);
        mCi.setOnNITZTime(this, EVENT_NITZ_TIME, null);

        updatePhoneType();

    }

    // 接收和处理RIL对象发出的消息
    @Override
    public void handleMessage(Message msg) {


    }

    // 处理RIL对象返回的查询服务信息结果
    protected void handlePollStateResult(int what, AsyncResult ar) {}


    // 查询完整的服务信息
    public void pollState() {
        pollState(false);
    }

    // 根据pollState的查询结果，完成mSS对象的更新，并发出服务信息变化对应的通知
    private void pollStateDone() {
        mIsModemTriggeredPollingPending = false;
        if (mPhone.isPhoneTypeGsm()) {
            pollStateDoneGsm();
        } else if (mPhone.isPhoneTypeCdma()) {
            pollStateDoneCdma();
        } else {
            pollStateDoneCdmaLte();
        }
    }

    // 更新电信运营商名称
    protected void updateSpnDisplay() {}

    // 获取接入电信网络的无线信号量
    private void queueNextSignalStrengthPoll() {}

    // 打开和关闭Radio无线通信模块
    public void setRadioPower(boolean power) {}

    // 允许更新小区信息
    public void enableLocationUpdates() {}

}

```

## ServiceStateTracker初始化

```java

/**
 * Top-level Application class for the Phone app.
 */
public class PhoneApp extends Application {

    @Override
    public void onCreate() {
        if (UserHandle.myUserId() == 0) {
            // We are running as the primary user, so should bring up the
            // global phone state.
            mPhoneGlobals = new PhoneGlobals(this);
            mPhoneGlobals.onCreate();

            mTelephonyGlobals = new TelephonyGlobals(this);
            mTelephonyGlobals.onCreate();
        }
    }

}

package com.android.phone;

/**
 * Global state for the telephony subsystem when running in the primary
 * phone process.
 */
public class PhoneGlobals extends ContextWrapper {
    public static final String LOG_TAG = "PhoneApp";


    public void onCreate() {
        ------------------------------------------------
            // Initialize the telephony framework
            PhoneFactory.makeDefaultPhones(this);
        ------------------------------------------------
    }

}

// PhoneApp
package com.android.phone;

public class PhoneFactory {

    public static void makeDefaultPhone(Context context) {
        --------------------------------------------------
                for (int i = 0; i < numPhones; i++) {
                    Phone phone = null;
                    int phoneType = TelephonyManager.getPhoneType(networkModes[i]);
                    if (phoneType == PhoneConstants.PHONE_TYPE_GSM) {
                        // 1
                        phone = telephonyComponentFactory.makePhone(context,
                                sCommandsInterfaces[i], sPhoneNotifier, i,
                                PhoneConstants.PHONE_TYPE_GSM,
                                telephonyComponentFactory);
                    } else if (phoneType == PhoneConstants.PHONE_TYPE_CDMA) {
                        phone = telephonyComponentFactory.makePhone(context,
                                sCommandsInterfaces[i], sPhoneNotifier, i,
                                PhoneConstants.PHONE_TYPE_CDMA_LTE,
                                telephonyComponentFactory);
                    }
                    Rlog.i(LOG_TAG, "Creating Phone with type = " + phoneType + " sub = " + i);

                    sPhones[i] = phone;
                }
        ---------------------------------------------------
    }

}

package com.android.internal.telephony;

public class GsmCdmaPhone extends Phone {

    public GsmCdmaPhone(Context context, CommandsInterface ci, PhoneNotifier notifier,
                        boolean unitTestMode, int phoneId, int precisePhoneType,
                        TelephonyComponentFactory telephonyComponentFactory) {
        super(precisePhoneType == PhoneConstants.PHONE_TYPE_GSM ? "GSM" : "CDMA",
                notifier, context, ci, unitTestMode, phoneId, telephonyComponentFactory);
        --------------------------------------------------------------------------------
        // 4
        mSST = mTelephonyComponentFactory.makeServiceStateTracker(this, this.mCi);
        --------------------------------------------------------------------------------
    }

}

public class TelephonyComponentFactory {

    // 2
    public Phone makePhone(Context context, CommandsInterface ci, PhoneNotifier notifier,
            int phoneId, int precisePhoneType,
            TelephonyComponentFactory telephonyComponentFactory) {
        Rlog.d(LOG_TAG, "makePhone");
        Phone phone = null;
        if (precisePhoneType == PhoneConstants.PHONE_TYPE_GSM) {
            // 3
            phone = new GsmCdmaPhone(context,
                ci, notifier, phoneId,
                PhoneConstants.PHONE_TYPE_GSM,
                telephonyComponentFactory);
        } else if (precisePhoneType == PhoneConstants.PHONE_TYPE_CDMA) {
                phone = new GsmCdmaPhone(context,
                ci, notifier, phoneId,
                PhoneConstants.PHONE_TYPE_CDMA_LTE,
                telephonyComponentFactory);
        }
        return phone;
    }

    // 5
    public ServiceStateTracker makeServiceStateTracker(GsmCdmaPhone phone, CommandsInterface ci) {
        Rlog.d(LOG_TAG, "makeServiceStateTracker");
        return new ServiceStateTracker(phone, ci);
    }

}

```



