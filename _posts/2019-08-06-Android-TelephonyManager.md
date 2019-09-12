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


## ServiceState

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



