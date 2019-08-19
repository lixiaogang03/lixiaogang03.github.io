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

![TelephonyRegistry](/images/phone_architecture.png)

### SIM Info

> /data/user_de/0/com.android.providers.telephony/databases/telephony.db

![SIM_INFO](/images/sim_info.png)

### SubscriptionInfo.java

```java

//frameworks/base/telephony/java/android/telephony/SubscriptionInfo.java

public class SubscriptionInfo implements Parcelable {

     @Override
        public void writeToParcel(Parcel dest, int flags) {
            dest.writeInt(mId);   //数据库id，递增主键，每一个iccid的卡会占用1个id
            dest.writeString(mIccId);  //sim卡的iccid，每张sim卡是唯一的
            dest.writeInt(mSimSlotIndex);  //sim卡插入卡槽值，0是卡1，1是卡2，没有插入则是-1
            dest.writeCharSequence(mDisplayName); //sim卡名称，用户可以自定义
            dest.writeCharSequence(mCarrierName); //运营商名称
            dest.writeInt(mNameSource);  //名称来源，是用户设置或者是从sim卡读取（一般就是运营商名称）等
            dest.writeInt(mIconTint);   //sim卡图标染色值，tint的概念可以百度google
            dest.writeString(mNumber);  //sim卡关联号码
            dest.writeInt(mDataRoaming);  //sim卡是否启用数据漫游
            dest.writeInt(mMcc);    //mcc,移动国家码，3位数字，中国是460
            dest.writeInt(mMnc);    //mnc，移动网络码，2位数字，如00,01等，表示运营商
            dest.writeString(mCountryIso); //国家iso代码 
            mIconBitmap.writeToParcel(dest, flags);  //sim卡图标
        }
        ......
}

```
