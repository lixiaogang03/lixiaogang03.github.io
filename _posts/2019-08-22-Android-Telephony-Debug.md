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

