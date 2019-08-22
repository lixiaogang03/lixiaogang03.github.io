---
layout:     post
title:      Android Telephony Debug
subtitle:   eSIM debug
date:       2019-08-22
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - debug
---

[adb_command](https://github.com/mzlogin/awesome-adb/blob/master/README.md)

## dumpsys

### dumpsys isub

```txt

SubscriptionController:
 defaultSubId=2147483643
 defaultDataSubId=2
 defaultVoiceSubId=2147483643
 defaultSmsSubId=2
 defaultDataPhoneId=0
 defaultVoicePhoneId=0
 defaultSmsPhoneId=0
++++++++++++++++++++++++++++++++
 ActiveSubInfoList: is null
++++++++++++++++++++++++++++++++
 AllSubInfoList:
  {id=1, iccId=898602 simSlotIndex=-1 displayName=树米eSIM carrierName=只能拨打紧急呼救电话 nameSource=0 iconTint=-16746133 dataRoaming=0 iconBitmap=android.graphics.Bitmap@a8d2cfe mcc 460 mnc 4}
  {id=2, iccId=89860318740211132823 simSlotIndex=-1 displayName=中国电信 carrierName=CHN-CT nameSource=0 iconTint=-16746133 dataRoaming=0 iconBitmap=android.graphics.Bitmap@c45bc5f mcc 460 mnc 11}
++++++++++++++++++++++++++++++++
0: 01-02 21:48:19 pid=1880 tid=1880 [SubscriptionController] init by Context
1: 01-02 21:48:19 pid=1880 tid=1900 [getPhoneId]- no sims, returning default phoneId=0
2: 01-02 21:48:19 pid=1880 tid=1903 [getActiveSubInfoList] Sub Controller not ready
3: 01-02 21:48:19 pid=1880 tid=1903 [getPhoneId]- no sims, returning default phoneId=0
4: 01-02 21:48:19 pid=1880 tid=1903 [getPhoneId]- no sims, returning default phoneId=0
5: 01-02 21:48:19 pid=1880 tid=1900 [getPhoneId]- no sims, returning default phoneId=0
6: 01-02 21:48:19 pid=1880 tid=1880 [getPhoneId] asked for default subId=2147483643
7: 01-02 21:48:20 pid=1880 tid=1880 [getPhoneId]- no sims, returning default phoneId=0
8: 01-02 21:48:20 pid=1880 tid=1880 [getPhoneId] asked for default subId=2147483643
9: 01-02 21:48:21 pid=1880 tid=1900 [getPhoneId]- no sims, returning default phoneId=0

```

### dumpsys telephony.registry

```txt

last known state:
  Phone Id=0
  mCallState=0
  mCallIncomingNumber=
  mServiceState=0 0 voice home data home 树米eSIM 树米eSIM 46000 树米eSIM 树米eSIM 46000  LTE LTE CSS not supported -1 -1 RoamInd=-1 DefRoamInd=-1 EmergOnly=false IsDataRoamingFromRegistration=false IsUsingCarrierAggregation=false mRilImsRadioTechnology=0
  mSignalStrength=SignalStrength: 99 0 -120 -160 -120 -1 -1 26 -87 -7 262 2147483647 2147483647 gsm|lte
  mMessageWaiting=false
  mCallForwarding=false
  mDataActivity=0
  mDataConnectionState=0
  mDataConnectionPossible=true
  mDataConnectionReason=nwTypeChanged
  mDataConnectionApn=
  mDataConnectionLinkProperties=null
  mDataConnectionNetworkCapabilities=null
  mCellLocation=Bundle[mParcelledData.dataSize=64]
  mCellInfo=null
registrations: count=28
  {callingPackage=com.android.systemui binder=android.os.BinderProxy@22c266e callback=null onSubscriptionsChangedListenererCallback=com.android.internal.telephony.IOnSubscriptionsChangedListener$Stub$Proxy@796110f callerUserId=0 subId=-1 phoneId=-1 events=0 canReadPhoneState=true}
  {callingPackage=android binder=android.telephony.SubscriptionManager$OnSubscriptionsChangedListener$2@4b2059c callback=null onSubscriptionsChangedListenererCallback=android.telephony.SubscriptionManager$OnSubscriptionsChangedListener$2@4b2059c callerUserId=0 subId=-1 phoneId=-1 events=0 canReadPhoneState=true}
  {callingPackage=android binder=android.telephony.SubscriptionManager$OnSubscriptionsChangedListener$2@2a1ba5 callback=null onSubscriptionsChangedListenererCallback=android.telephony.SubscriptionManager$OnSubscriptionsChangedListener$2@2a1ba5 callerUserId=0 subId=-1 phoneId=-1 events=0 canReadPhoneState=true}
  {callingPackage=com.quicinc.cne.CNEService binder=android.os.BinderProxy@cf83b7a callback=null onSubscriptionsChangedListenererCallback=com.android.internal.telephony.IOnSubscriptionsChangedListener$Stub$Proxy@22caf2b callerUserId=0 subId=-1 phoneId=-1 events=0 canReadPhoneState=true}

```

### dumpsys netstats

1. set=DEFAULT 表示前台的网络使用, set=BACKGROUND 表示后台的网络使用. set=ALL 意味着前台和后台都有
2. brxBytes 和 rxPackets 表示接收到的字节和数据包的数量.
3. txBytes 和 txPackets 表示发送的字节和数据包的数量.

```txt

Active interfaces:
  iface=ccmni0 ident=[{type=MOBILE, subType=COMBINED, subscriberId=460040..., metered=true}]
Active UID interfaces:
  iface=ccmni0 ident=[{type=MOBILE, subType=COMBINED, subscriberId=460040..., metered=true}]
Dev stats:
  Pending bytes: 1636215
  History since boot:
  ident=[{type=MOBILE, subType=COMBINED, subscriberId=460040..., metered=true}] uid=-1 set=ALL tag=0x0
    NetworkStatsHistory: bucketDuration=3600
      st=1566468000 rb=3960169 rp=3941 tb=660653 tp=2820 op=0
      st=1566471600 rb=1283266 rp=1249 tb=236203 tp=797 op=0
Xt stats:
  Pending bytes: 1612775
  History since boot:
  ident=[{type=MOBILE, subType=COMBINED, subscriberId=460040..., metered=true}] uid=-1 set=ALL tag=0x0
    NetworkStatsHistory: bucketDuration=3600
      st=1566468000 rb=3890874 rp=2215 tb=660653 tp=2820 op=0
      st=1566471600 rb=1260377 rp=677 tb=236203 tp=797 op=0

```



