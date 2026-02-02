---
layout:     post
title:      Android Telephony Debug
subtitle:   eSIM debug
date:       2019-08-22
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - Android
---

[adb_command](https://github.com/mzlogin/awesome-adb/blob/master/README.md)

## 概念

### MCC

**Mobile Country Code：移动国家代码**

由3位数字组成，唯一地识别移动用户所属的国家。MCC由国际电联(ITU)统一分配和管理，一旦分配就不可更改。所以一个MCC只能对应一个国家，但是一个国家可以被分配多个MCC。比如美国的MCC有310，311和316，中国的MCC只有460

### MNC

**Mobile Network Code：移动网络代码**

共2位，中国移动TD系统使用00，中国联通GSM系统使用01，中国移动GSM系统使用02，中国电信CDMA系统使用03。它与MCC合起来唯一标识一个移动网络提供者，比如中国移动46002。

Tips：MCC+MNC就可以唯一确定一个移动网络运营商。比如中国移动为46000

### IMSI

**International mobile subscriber identity：国际移动用户识别码**

国际上为唯一识别一个移动用户所分配的号码，存于SIM卡中。IMSI共有15位，其结构如下：MCC+MNC+MSIN（MNC+MSIN=NMSI），一个典型的IMSI号码为460030912121001。所以MCC和MNC可以通过截取IMSI的前3位和次2次来获取。

### IMEI

**IMEI(International Mobile Equipment Identity)是国际移动设备识别码**

是由15位数字组成的"电子串号"，它与每台移动电话机一一对应，而且该码是全世界唯一的，存于设备中。每一只移动电话机在组装完成后都将被赋予一个全球唯一的一组号码，这个号码从生产到交付使用都将被制造生产的厂商所记录。从这个定义上看，无论是单卡手机还是双卡手机，都应该只有一个IMEI号，但是移动设备开发规范里面明确定义，IMEI和IMSI存在一一对应的关系，所以双卡手机会有两个IMEI号。一个IMEI对应两个IMSI （SIM卡）的情况是规范里没有定义的，所以两个IMEI相对安全一些。如果两个IMSI（SIM卡）对应同一个IMEI，相当于有一个是不合法的。有些地方，比如印度什么的，检查IMEI号，两个卡用同一个IMEI号就会出现问题。所以支持双卡的手机有两个IMEI号。

### ICCID

SIM卡卡号，是卡的标识，不作接入网络的鉴权认证，可在SIM卡卡后查询到



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

### dumpsys netpolicy

```txt

System ready: true
Restrict background: false
Restrict power: false
Device idle: false
Network policies:
  NetworkPolicy[NetworkTemplate: matchRule=MOBILE_ALL, subscriberId=460040..., matchSubscriberIds=[460040...]]: cycleDay=22, cycleTimezone=Asia/Shanghai, warningBytes=2147483648, limitBytes=-1, lastWarningSnooze=-1, lastLimitSnooze=-1, metered=true, inferred=true
  NetworkPolicy[NetworkTemplate: matchRule=MOBILE_ALL, subscriberId=460040..., matchSubscriberIds=[460040...]]: cycleDay=22, cycleTimezone=Asia/Shanghai, warningBytes=2147483648, limitBytes=5368709120, lastWarningSnooze=-1, lastLimitSnooze=-1, metered=true, inferred=false
Metered ifaces: {ccmni0}
Policy for UIDs:
  UID=10063 policy=REJECT_METERED_BACKGROUND
  UID=10080 policy=REJECT_METERED_BACKGROUND
Power save whitelist (except idle) app ids:
  UID=10008: true
  UID=10021: true
Power save whitelist app ids:
  UID=10008: true
  UID=10021: true
Restrict background whitelist uids:
  UID=10008
  UID=10021
Default restrict background whitelist uids:
  UID=10008
  UID=10021
Status for all known UIDs:
  UID=1001 state=0 (fg) rules=0 (NONE)
  UID=10006 state=6 (bg) rules=0 (NONE)
  UID=10008 state=16 (bg) rules=0 (NONE)
  UID=10011 state=3 (fg svc) rules=0 (NONE)
  UID=10019 state=0 (fg) rules=0 (NONE)
  UID=10020 state=0 (fg) rules=0 (NONE)
  UID=10021 state=0 (fg) rules=1 (ALLOW_METERED)
  UID=10051 state=10 (bg) rules=0 (NONE)
  UID=10053 state=0 (fg) rules=0 (NONE)
  UID=10054 state=10 (bg) rules=0 (NONE)
  UID=10056 state=12 (bg) rules=0 (NONE)
  UID=10057 state=10 (bg) rules=0 (NONE)
  UID=10058 state=10 (bg) rules=0 (NONE)
  UID=10059 state=10 (bg) rules=0 (NONE)
  UID=10061 state=6 (bg) rules=0 (NONE)
  UID=10063 state=10 (bg) rules=4 (REJECT_METERED)
  UID=10066 state=10 (bg) rules=0 (NONE)
  UID=10067 state=7 (bg) rules=0 (NONE)
  UID=10078 state=16 (bg) rules=64 (REJECT_ALL)
  UID=10079 state=16 (bg) rules=64 (REJECT_ALL)
  UID=10080 state=16 (bg) rules=4 (REJECT_METERED)
Status for just UIDs with rules:
  UID=10021 rules=1 (ALLOW_METERED)
  UID=10063 rules=4 (REJECT_METERED)
  UID=10078 rules=64 (REJECT_ALL)
  UID=10079 rules=64 (REJECT_ALL)
  UID=10080 rules=4 (REJECT_METERED)

```

### cmd netpolicy

```txt

Network policy manager (netpolicy) commands:
  help
    Print this help text.

  add restrict-background-whitelist UID
    Adds a UID to the whitelist for restrict background usage.
  add restrict-background-blacklist UID
    Adds a UID to the blacklist for restrict background usage.
  get restrict-background
    Gets the global restrict background usage status.
  list wifi-networks [BOOLEAN]
    Lists all saved wifi networks and whether they are metered or not.
    If a boolean argument is passed, filters just the metered (or unmetered)
    networks.
  list restrict-background-whitelist
    Lists UIDs that are whitelisted for restrict background usage.
  list restrict-background-blacklist
    Lists UIDs that are blacklisted for restrict background usage.
  remove restrict-background-whitelist UID
    Removes a UID from the whitelist for restrict background usage.
  remove restrict-background-blacklist UID
    Removes a UID from the blacklist for restrict background usage.
  set metered-network ID BOOLEAN
    Toggles whether the given wi-fi network is metered.
  set restrict-background BOOLEAN
    Sets the global restrict background usage status.

```

### dumpsys network_management

```txt

NetworkManagementService NativeDaemonConnector Log:
08-22 19:00:26.199 - SND -> {53 bandwidth setglobalalert 2097152}
08-22 19:00:26.204 - RCV <- {200 53 Bandwidth command succeeeded}
08-22 19:00:26.204 - RMV <- {200 53 Bandwidth command succeeeded}
08-22 19:00:36.089 - RCV <- {613 IfaceClass idle 0 1891045252533}
08-22 19:01:43.440 - RCV <- {613 IfaceClass active 0 1958396019384 10066}
08-22 19:01:53.489 - RCV <- {613 IfaceClass idle 0 1968445164769}
08-22 19:03:02.889 - RCV <- {613 IfaceClass active 0 2037844982619 10066}
08-22 19:03:13.089 - RCV <- {613 IfaceClass idle 0 2048045143927}
08-22 19:04:15.298 - RCV <- {613 IfaceClass active 0 2110251846777 10066}
08-22 19:04:25.489 - RCV <- {613 IfaceClass idle 0 2120445168932}
08-22 19:04:33.802 - RCV <- {613 IfaceClass active 0 2128757286548 10066}
08-22 19:04:53.032 - RCV <- {613 IfaceClass idle 0 2147988346780}
08-22 19:04:55.549 - RCV <- {613 IfaceClass active 0 2150505004318 10051}
08-22 19:06:27.369 - SND -> {54 network permission user set SYSTEM 10081}
08-22 19:06:27.370 - RCV <- {200 54 success}
08-22 19:06:27.371 - RMV <- {200 54 success}
08-22 19:06:27.672 - SND -> {55 bandwidth gettetherstats}

Pending requests:

Bandwidth control enabled: true
mMobileActivityFromRadio=true mLastPowerStateFromRadio=1
mNetworkActive=false
Active quota ifaces: {ccmni0=5362625187}
Active alert ifaces: {}
Data saver mode: false
UID bandwith control blacklist rule: [10063,10080]
UID bandwith control whitelist rule: [10008,10021]
UID firewall  rule: []
UID firewall standby chain enabled: false
UID firewall standby rule: []
UID firewall dozable chain enabled: false
UID firewall dozable rule: []
UID firewall powersave chain enabled: false
UID firewall powersave rule: []
Idle timers:
  ccmni0:
    timeout=10 type=0 networkCount=1
Firewall enabled: false
Netd service status: alive

```



