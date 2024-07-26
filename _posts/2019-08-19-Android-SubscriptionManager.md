---
layout:     post
title:      Android SubscriptionManager
subtitle:   SubscriptionManager is the application interface to SubscriptionController and provides information about the current Telephony Subscriptions.
date:       2019-08-19
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
    - SubscriptionManager
---

[SubscriptionController-简书](https://www.jianshu.com/p/02f0f9b03415)

[UICC-简书](https://www.jianshu.com/p/25f9e0f32b4c)

### 架构图

![TelephonyRegistry](/images/android/telephony/phone_architecture.png)

### SIM Info

> /data/user_de/0/com.android.providers.telephony/databases/telephony.db

![SIM_INFO](/images/android/telephony/sim_info.png)

### SubscriptionInfo.java

SIM卡的信息就是SubscriptionInfo(Subscription Information)，比如iccid、MNC、MCC等，多张SIM卡就有多个SubscriptionInfo

```java

//frameworks/base/telephony/java/android/telephony/SubscriptionInfo.java

public class SubscriptionInfo implements Parcelable {

     @Override
        public void writeToParcel(Parcel dest, int flags) {
            dest.writeInt(mId);                         //数据库id，递增主键，每一个iccid的卡会占用1个id
            dest.writeString(mIccId);                   //sim卡的iccid，每张sim卡是唯一的
            dest.writeInt(mSimSlotIndex);               //sim卡插入卡槽值，0是卡1，1是卡2，没有插入则是-1
            dest.writeCharSequence(mDisplayName);       //sim卡名称，用户可以自定义
            dest.writeCharSequence(mCarrierName);       //运营商名称
            dest.writeInt(mNameSource);                 //名称来源，是用户设置或者是从sim卡读取（一般就是运营商名称）等
            dest.writeInt(mIconTint);                   //sim卡图标染色值，tint的概念可以百度google
            dest.writeString(mNumber);                  //sim卡关联号码
            dest.writeInt(mDataRoaming);                //sim卡是否启用数据漫游
            dest.writeInt(mMcc);                        //mcc,移动国家码，3位数字，中国是460
            dest.writeInt(mMnc);                        //mnc，移动网络码，2位数字，如00,01等，表示运营商
            dest.writeString(mCountryIso);              //国家iso代码
            mIconBitmap.writeToParcel(dest, flags);     //sim卡图标
        }
        ......
}

```

```txt

++++++++++++++++++++++++++++++++
 AllSubInfoList:
  {id=1, iccId=898602 simSlotIndex=-1 displayName=树米eSIM carrierName=只能拨打紧急呼救电话 nameSource=0 iconTint=-16746133 dataRoaming=0 iconBitmap=android.graphics.Bitmap@a8d2cfe mcc 460 mnc 4}
  {id=2, iccId=89860318740211132823 simSlotIndex=-1 displayName=中国电信 carrierName=CHN-CT nameSource=0 iconTint=-16746133 dataRoaming=0 iconBitmap=android.graphics.Bitmap@c45bc5f mcc 460 mnc 11}
++++++++++++++++++++++++++++++++

```

### subid

**slotid**或者**phoneid**是指卡槽，双卡机器的卡槽1值为0，卡槽2值为1，依次类推

**subid**：SubscriptionId(Subscription Identifier)。subid是数据库telephony.db的表siminfo的主键递增项，其中telephony.db在"/data/user_de/0/com.android.providers.telephony/databases"下


### SubscriptionManager

```java

//frameworks/base/telephony/java/android/telephony/SubscriptionManager.java

/**
 * SubscriptionManager is the application interface to SubscriptionController
 * and provides information about the current Telephony Subscriptions.
 * * <p>
 * You do not instantiate this class directly; instead, you retrieve
 * a reference to an instance through {@link #from}.
 * <p>
 * All SDK public methods require android.Manifest.permission.READ_PHONE_STATE.
 */
public class SubscriptionManager {


    /**
     * Get an instance of the SubscriptionManager from the Context.
     * This invokes {@link android.content.Context#getSystemService
     * Context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE)}.
     *
     * @param context to use.
     * @return SubscriptionManager instance
     */
    public static SubscriptionManager from(Context context) {
        return (SubscriptionManager) context.getSystemService(
                Context.TELEPHONY_SUBSCRIPTION_SERVICE);
    }


    public List<SubscriptionInfo> getActiveSubscriptionInfoList() {
        List<SubscriptionInfo> result = null;

        try {
            ISub iSub = ISub.Stub.asInterface(ServiceManager.getService("isub"));
            if (iSub != null) {
                result = iSub.getActiveSubscriptionInfoList(mContext.getOpPackageName());
            }
        } catch (RemoteException ex) {
            // ignore it
        }
        return result;
    }

}

```

### SubscriptionController---dumpsys isub

SubscriptionController 即SIM卡信息控制器，用Subscription的描述方式来自3GPP协议，SIM卡可被描述为Subscriber
SubscriptionController 作为控制器，所以它所担负的责任是 SIM 卡信息的中转和管理工作

```java

// frameworks/opt/telephony/src/java/com/android/internal/telephony/SubscriptionController.java

/**
 *
 * SubscriptionController to provide an inter-process communication to
 * access Sms in Icc.
 *
 */
public class SubscriptionController extends ISub.Stub {

    @Override
    public void dump(FileDescriptor fd, PrintWriter pw, String[] args) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.DUMP,
                "Requires DUMP");
        final long token = Binder.clearCallingIdentity();
        try {
            pw.println("SubscriptionController:");
            pw.println(" defaultSubId=" + getDefaultSubId());
            pw.println(" defaultDataSubId=" + getDefaultDataSubId());
            pw.println(" defaultVoiceSubId=" + getDefaultVoiceSubId());
            pw.println(" defaultSmsSubId=" + getDefaultSmsSubId());

            pw.println(" defaultDataPhoneId=" + SubscriptionManager
                    .from(mContext).getDefaultDataPhoneId());
            pw.println(" defaultVoicePhoneId=" + SubscriptionManager.getDefaultVoicePhoneId());
            pw.println(" defaultSmsPhoneId=" + SubscriptionManager
                    .from(mContext).getDefaultSmsPhoneId());
            pw.flush();

            for (Entry<Integer, Integer> entry : sSlotIdxToSubId.entrySet()) {
                pw.println(" sSlotIdxToSubId[" + entry.getKey() + "]: subId=" + entry.getValue());
            }
            pw.flush();
            pw.println("++++++++++++++++++++++++++++++++");

            List<SubscriptionInfo> sirl = getActiveSubscriptionInfoList(
                    mContext.getOpPackageName());
            if (sirl != null) {
                pw.println(" ActiveSubInfoList:");
                for (SubscriptionInfo entry : sirl) {
                    pw.println("  " + entry.toString());
                }
            } else {
                pw.println(" ActiveSubInfoList: is null");
            }
            pw.flush();
            pw.println("++++++++++++++++++++++++++++++++");

            sirl = getAllSubInfoList(mContext.getOpPackageName());
            if (sirl != null) {
                pw.println(" AllSubInfoList:");
                for (SubscriptionInfo entry : sirl) {
                    pw.println("  " + entry.toString());
                }
            } else {
                pw.println(" AllSubInfoList: is null");
            }
            pw.flush();
            pw.println("++++++++++++++++++++++++++++++++");

            mLocalLog.dump(fd, pw, args);
            pw.flush();
            pw.println("++++++++++++++++++++++++++++++++");
            pw.flush();
        } finally {
            Binder.restoreCallingIdentity(token);
        }
    }

}

```

### 新SIM卡插入

当有一张新的SIM卡插入到手机，手机检测到有SIM卡插入，就会发起SIM卡数据的查询，UiccController将查询得到的数据，传递到SubscriptionController

![SIM_INFO](/images/android/telephony/sim_update.png)

### ICCID IMSI

IMSI：国际移动用户识别码，是区别移动用户的标识，储存在SIM卡中，可用于区别移动用户的有效信息，通过IMSI可反查运营商、归属地、手机号码等信息，在接入网络时会到运营商服务器中进行验证。
格式：15位0-9的数字
ICCID：SIM卡卡号，是卡的标识，不作接入网络的鉴权认证，可在SIM卡卡后查询到。
格式：大多为19或20位0-9的数字，亦存在6位/12位的情况

08-19 16:32:34.158  1811  1811 D SIMRecords: [SIMRecords] iccid: 898602b82[RhoJ8pQ8XHgBIyMLaFh7JyZ0ARk]

08-19 17:04:10.952  2012  2012 D SIMRecords: [SIMRecords] iccid: 89860447161890301251

```java

public abstract class IccRecords extends Handler implements IccConstants {

    /**
     * Returns the ICC ID stripped at the first hex character. Some SIMs have ICC IDs
     * containing hex digits; {@link #getFullIccId()} should be used to get the full ID including
     * hex digits.
     * @return ICC ID without hex digits
     */
    public String getIccId() {
        return mIccId;
    }

    /**
     * Returns the full ICC ID including hex digits.
     * @return full ICC ID including hex digits
     */
    public String getFullIccId() {
        return mFullIccId;
    }

}

```

### UICC

UICC，全称 Universal Integrated Circuit Card，译作通用集成电路卡，主要用于

1. 存储用户信息
2. 鉴权密钥
3. 短消
4. 付费方式
5. 联系人等信息

在UICC中可以包括多种逻辑模块，如：

1. 用户标识模块（Subscriber Identity Module，SIM）
2. 通用用户标识模块（Universal Subscriber Identity Module，USIM）
3. IP多媒体业务标识模块（IP Multi Media Service Identity Module，ISIM）
4. 智能IC卡模块（Removable User Identity Module，RUIM（UIM））
5. 特殊RUIM（CSIM）

以上模块，实际上是网络升级换代所对应的产物。SIM用于GSM网络系统中，俗称2G网络。USIM也叫升级版SIM，多用于3G网络系统中。ISIM则是4G时代的产物。RUIM、CSIM是CDMA网络系统中的技术。








