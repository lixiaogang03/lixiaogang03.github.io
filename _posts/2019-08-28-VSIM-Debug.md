---
layout:     post
title:      VSIM Debug
subtitle:   VSIM 常见问题调试
date:       2019-08-28
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - eSIM
    - debug
---

## 注册网络失败

### dumpsys phone

```txt

V2_PRO:/ $ dumpsys phone
******* OmtpVvm *******
======= Configs =======
  OmtpVvmCarrierConfigHelper [subId: 1, carrierConfig: false, telephonyConfig: false, type: null, destinationNumber: null, applicationPort: 0, sslPort: 0, isEnabledByDefault: false, isCellularDataRequired: false, isPrefetchEnabled: true, isLegacyModeEnabled: false]
======== Logs =========
  08-28 15:04:28.721 - VvmSimChangeReceiver: Sim removed, removing inactive accounts
  08-28 15:04:39.183 - VvmBootCompletedRcvr: processing subId list
  08-28 15:04:39.188 - VvmBootCompletedRcvr: phone account ComponentInfo{com.android.phone/com.android.services.telephony.TelephonyConnectionService}, [e0184adedf913b076626646d3f52c3b49c39ad6d], UserHandle{0} has invalid subId -1
  08-28 15:04:52.314 - VvmSimChangeReceiver: Sim removed, removing inactive accounts
  08-28 15:04:53.001 - VvmSimChangeReceiver: Empty MCCMNC, possible modem crash. Ignoring carrier config changed event
  08-28 15:04:54.885 - VvmSimChangeReceiver: Empty MCCMNC, possible modem crash. Ignoring carrier config changed event
  08-28 15:04:57.839 - VvmSimChangeReceiver: Carrier config changed
  08-28 15:04:57.857 - VvmSimChangeReceiver: visual voicemail not supported for carrier 46004 on subId 1

```

### dumpsys telephony.registry

```txt

V2_PRO:/ $ dumpsys telephony.registry
last known state:
  Phone Id=0
  mCallState=0
  mCallIncomingNumber=
  mServiceState=1 1 voice home data home null null null null null null  Unknown Unknown CSS not supported -1 -1 RoamInd=-1 DefRoamInd=-1 EmergOnly=false IsDataRoamingFromRegistration=false IsUsingCarrierAggregation=false mRilImsRadioTechnology=0
  mSignalStrength=SignalStrength: 99 0 -120 -160 -120 -1 -1 99 2147483647 2147483647 2147483647 2147483647 2147483647 gsm|lte
  mMessageWaiting=false
  mCallForwarding=false
  mDataActivity=0
  mDataConnectionState=-1
  mDataConnectionPossible=false
  mDataConnectionReason=dataEnabled
  mDataConnectionApn=
  mDataConnectionLinkProperties=null
  mDataConnectionNetworkCapabilities=null
  mCellLocation=Bundle[{cid=-1, lac=-1, psc=-1}]
  mCellInfo=null

```

### dumpsys isub

```txt

V2_PRO:/ $ dumpsys isub
SubscriptionController:
 defaultSubId=1
 defaultDataSubId=1
 defaultVoiceSubId=1
 defaultSmsSubId=1
 defaultDataPhoneId=0
 defaultVoicePhoneId=0
 defaultSmsPhoneId=0
 sSlotIdxToSubId[0]: subId=1
++++++++++++++++++++++++++++++++
 ActiveSubInfoList:
  {id=1, iccId=898602 simSlotIndex=0 displayName=树米eSIM carrierName=没有服务 — 树米eSIM nameSource=0 iconTint=-16746133 dataRoaming=0 iconBitmap=android.graphics.Bitmap@3df6eb4 mcc 460 mnc 4}
++++++++++++++++++++++++++++++++
 AllSubInfoList:
  {id=1, iccId=898602 simSlotIndex=0 displayName=树米eSIM carrierName=没有服务 — 树米eSIM nameSource=0 iconTint=-16746133 dataRoaming=0 iconBitmap=android.graphics.Bitmap@900c652 mcc 460 mnc 4}
++++++++++++++++++++++++++++++++
0: 08-28 15:04:27 pid=1646 tid=1646 [SubscriptionController] init by Context
1: 08-28 15:04:27 pid=1646 tid=1723 [getActiveSubInfoList] Sub Controller not ready
2: 08-28 15:04:27 pid=1646 tid=1657 [getPhoneId]- no sims, returning default phoneId=0

```

