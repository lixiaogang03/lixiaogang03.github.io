---
layout:     post
title:      VSIM Debug
subtitle:   VSIM 常见问题调试
date:       2019-10-10
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - eSIM
    - debug
---

## Modem 日志抓取

### 高通 QXDM


### MTK mtklog

**打开 mtklog**

1. *#*#364633#*#*
2. adb shell am start -n com.mediatek.mtklogger/.MainActivity

**modem log查看工具ELT**

```txt

├── file_tree.txt
└── MDLog1_2019_0919_161556
    ├── DbgInfo_LR12A.R2.MP_HQ6739_65_BD2_N1_MOLY_LR12A_R2_MP_V5_23_P5_2019_06_03_17_58_1_ulwctg_n
    ├── file_tree.txt
    ├── MDDB_InfoCustomAppSrcP_MT6739_S00_MOLY_LR12A_R2_MP_V5_23_P5_1_ulwctg_n.EDB
    ├── MDDB.META_MT6739_S00_MOLY_LR12A_R2_MP_V5_23_P5_1_ulwctg_n.EDB
    ├── MDDB.META.ODB_MT6739_S00_MOLY_LR12A_R2_MP_V5_23_P5_1_ulwctg_n.XML.GZ
    ├── MDLog1_2019_0919_161556.muxz
    ├── mdm_layout_desc_1_ulwctg_n.dat
    └── version_info.txt

```

![mtk_elt](/images/mtk_elt.png)

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

### v2-pro 驻网失败

**com.android.phone**

```txt

USER      PID   PPID  VSIZE  RSS   WCHAN            PC  NAME
radio     1627  501   1012844 30296 SyS_epoll_ b17ef438 S com.android.phone
radio     1632  1627  1012844 30296 futex_wait b17be6bc S Jit thread pool
radio     1635  1627  1012844 30296 do_sigtime b17ef7a4 S Signal Catcher
radio     1636  1627  1012844 30296 poll_sched b17ef67c S JDWP
radio     1637  1627  1012844 30296 futex_wait b17be6bc S ReferenceQueueD
radio     1638  1627  1012844 30296 futex_wait b17be6bc S FinalizerDaemon
radio     1639  1627  1012844 30296 futex_wait b17be6bc S FinalizerWatchd
radio     1640  1627  1012844 30296 futex_wait b17be6bc S HeapTaskDaemon
radio     1641  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_1
radio     1642  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_2
radio     1705  1627  1012844 30296 futex_wait b17be6bc S pool-1-thread-1
radio     1712  1627  1012844 30296 SyS_epoll_ b17ef438 S RILSender0
radio     1715  1627  1012844 30296 unix_strea b17f0730 S RILReceiver0
radio     1731  1627  1012844 30296 SyS_epoll_ b17ef438 S IccPbHandlerLoa
radio     1732  1627  1012844 30296 SyS_epoll_ b17ef438 S GsmCellBroadcas
radio     1733  1627  1012844 30296 SyS_epoll_ b17ef438 S GsmInboundSmsHa
radio     1734  1627  1012844 30296 SyS_epoll_ b17ef438 S CellBroadcastHa
radio     1735  1627  1012844 30296 SyS_epoll_ b17ef438 S CdmaInboundSmsH
radio     1738  1627  1012844 30296 SyS_epoll_ b17ef438 S CdmaServiceCate
radio     1740  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_3
radio     1742  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_4
radio     1763  1627  1012844 30296 SyS_epoll_ b17ef438 S DcHandlerThread
radio     1807  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_5
radio     2882  1627  1012844 30296 SyS_epoll_ b17ef438 S ervice.Executor
radio     2883  1627  1012844 30296 SyS_epoll_ b17ef438 S ConnectivityThr
radio     3297  1627  1012844 30296 SyS_epoll_ b17ef438 S Cat Telephony s
radio     3298  1627  1012844 30296 SyS_epoll_ b17ef438 S RilMessageDecod
radio     3299  1627  1012844 30296 SyS_epoll_ b17ef438 S Cat Icon Loader
radio     3343  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_6
radio     3344  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_7
radio     3345  1627  1012844 30296 binder_thr b17ef57c S Binder:1627_8

```

**rild**

```txt

USER      PID   PPID  VSIZE  RSS   WCHAN            PC  NAME
radio     547   1     77620  2580  hrtimer_na b624c4d4 S /system/bin/rild
radio     736   547   77620  2580  poll_sched b624b67c S rild
radio     738   547   77620  2580  diagchar_r b624c640 S rild
radio     868   547   77620  2580  binder_thr b624b57c S Binder:547_1
radio     869   547   77620  2580  poll_sched b624b67c S rild
radio     870   547   77620  2580  binder_thr b624b57c S Binder:547_2
radio     882   547   77620  2580  inotify_re b624c640 S rild
radio     884   547   77620  2580  poll_sched b624b67c S rild
radio     885   547   77620  2580  unix_strea b624c6e0 S rild
radio     886   547   77620  2580  __skb_recv b624b398 S rild
radio     890   547   77620  2580  __skb_recv b624b398 S rild
radio     893   547   77620  2580  __skb_recv b624b398 S rild
radio     894   547   77620  2580  futex_wait b621a6bc S rild
radio     895   547   77620  2580  poll_sched b624b67c S rild
radio     897   547   77620  2580  poll_sched b624b624 S rild
radio     957   547   77620  2580  poll_sched b624b624 S rild
radio     959   547   77620  2580  poll_sched b624b624 S rild
radio     960   547   77620  2580  poll_sched b624b624 S rild
radio     961   547   77620  2580  poll_sched b624b624 S rild
radio     962   547   77620  2580  poll_sched b624b624 S rild
radio     963   547   77620  2580  poll_sched b624b624 S rild
radio     966   547   77620  2580  poll_sched b624b624 S rild
radio     967   547   77620  2580  poll_sched b624b624 S rild
radio     969   547   77620  2580  poll_sched b624b624 S rild
radio     971   547   77620  2580  __skb_recv b624b398 S rild
radio     972   547   77620  2580  poll_sched b624b624 S rild
radio     977   547   77620  2580  poll_sched b624b624 S rild
radio     978   547   77620  2580  poll_sched b624b624 S rild
radio     980   547   77620  2580  futex_wait b621a6bc S rild
radio     981   547   77620  2580  futex_wait b621a6bc S rild
radio     982   547   77620  2580  poll_sched b624b624 S rild
radio     983   547   77620  2580  poll_sched b624b67c S rild
radio     985   547   77620  2580  poll_sched b624b624 S rild
radio     986   547   77620  2580  poll_sched b624b624 S rild
radio     987   547   77620  2580  poll_sched b624b624 S rild
radio     996   547   77620  2580  futex_wait b621a6bc S rild
radio     997   547   77620  2580  poll_sched b624b624 S rild
radio     1000  547   77620  2580  unix_strea b624c6e0 S rild
radio     1001  547   77620  2580  poll_sched b624b624 S rild
radio     1002  547   77620  2580  poll_sched b624b624 S rild

```


```txt
// 开始搜网
09-19 13:57:36.686  1627  3345 D RILJ    : [4221]> QUERY_AVAILABLE_NETWORKS  [SUB0]

// RILReceiver0
09-19 13:57:36.707  1627  1715 D RILJ    : [4221] Ack < QUERY_AVAILABLE_NETWORKS  [SUB0]
09-19 13:57:38.236  1627  1715 D RILJ    : Response received for [4221] QUERY_AVAILABLE_NETWORKS  Sending ack to ril.cpp [SUB0]
09-19 13:57:38.236  1627  1715 D RILJ    : [4221]< QUERY_AVAILABLE_NETWORKS  [OperatorInfo CHINA MOBILE/CMCC/46000/UNKNOWN] [SUB0]

// com.android.phone 主线程
09-19 13:57:38.241  1627  1627 D RILJ    : [4223]> SET_NETWORK_SELECTION_MANUAL 46000 [SUB0]

// rild
09-19 13:57:38.897   547   869 I RILQ    : (0/547):RIL[0][event] qcril_qmi_nas_reset_data_snapshot_cache_and_timer: Resetting snapshot timer

// 收到 Modem 主动上报的消息 UNSOL_RESPONSE_VOICE_NETWORK_STATE_CHANGED
09-19 13:57:38.914  1627  1715 D RILJ    : Unsol response received for UNSOL_RESPONSE_VOICE_NETWORK_STATE_CHANGED Sending ack to ril.cpp [SUB0]
09-19 13:57:38.914  1627  1715 D RILJ    : [UNSL]< UNSOL_RESPONSE_VOICE_NETWORK_STATE_CHANGED [SUB0]
09-19 13:57:38.914  1627  1627 D RILJ    : [4225]> OPERATOR [SUB0]
09-19 13:57:38.916  1627  1627 D RILJ    : [4226]> DATA_REGISTRATION_STATE [SUB0]
09-19 13:57:38.917  1627  1627 D RILJ    : [4227]> VOICE_REGISTRATION_STATE [SUB0]

// rild
09-19 13:57:38.919   547   869 I RILQ    : (0/547):RIL[0][event] qcril_qmi_nas_reset_data_snapshot_cache_and_timer: Resetting snapshot timer

// com.android.phone
09-19 13:57:38.919  1627  1627 D RILJ    : [4228]> QUERY_NETWORK_SELECTION_MODE [SUB0]

// RILReceiver0: 运营商注册失败
09-19 13:57:38.934  1627  1715 D RILJ    : [4225]< OPERATOR {null, null, null} [SUB0]

// rild
09-19 13:57:38.937   547  5170 I RILQ    : (0/547):RIL[0][cmd-20(480)] qcril_qmi_nas_reset_data_snapshot_cache_and_timer: Resetting snapshot timer
09-19 13:57:38.945   547  5169 I RILQ    : (0/547):RIL[0][cmd-21(960)] qcril_qmi_nas_reset_data_snapshot_cache_and_timer: Resetting snapshot timer

// RILReceiver0
09-19 13:57:38.945  1627  1715 D RILJ    : [4228]< QUERY_NETWORK_SELECTION_MODE {1} [SUB0]
09-19 13:57:38.945  1627  1627 D SST     : EVENT_POLL_STATE_NETWORK_SELECTION_MODE
09-19 13:57:38.946  1627  1627 D GsmCdmaPhone: [GsmCdmaPhone] isManualNetSelAllowed in mode = 11
09-19 13:57:38.946  1627  1627 D GsmCdmaPhone: [GsmCdmaPhone] isManualNetSelAllowedInGlobal in current carrier is false
09-19 13:57:38.946  1627  1627 D GsmCdmaPhone: [GsmCdmaPhone] Manual selection is supported in mode = 11
09-19 13:57:38.950  1627  1715 D RILJ    : [4227]< VOICE_REGISTRATION_STATE {2, null, null, 0, null, null, null, 0, null, null, null, null, null, 0, null} [SUB0]
09-19 13:57:38.955  1627  1715 D RILJ    : [4226]< DATA_REGISTRATION_STATE {3, null, null, null, 15, 20, null, 379, 25678371, null, null} [SUB0]
09-19 13:57:38.955  1627  1627 D SST     : handlPollStateResultMessage: GsmSST setDataRegState=1 regState=3 dataRadioTechnology=0

// rild
09-19 13:57:38.956   547   869 I RILQ    : (0/547):RIL[0][event] qcril_qmi_nas_reset_data_snapshot_cache_and_timer: Resetting snapshot timer

09-19 13:57:38.959  1627  1627 D SST     : Poll ServiceState done:  oldSS=[1 1 voice home data home null null null null null null (manual) Unknown Unknown CSS not supported -1 -1 RoamInd=-1 DefRoamInd=-1 EmergOnly=false IsDataRoamingFromRegistration=false IsUsingCarrierAggregation=false mRilImsRadioTechnology=0] newSS=[1 1 voice home data home null null null null null null (manual) Unknown Unknown CSS not supported -1 -1 RoamInd=-1 DefRoamInd=-1 EmergOnly=false IsDataRoamingFromRegistration=false IsUsingCarrierAggregation=false mRilImsRadioTechnology=0] oldMaxDataCalls=20 mNewMaxDataCalls=20 oldReasonDataDenied=15 mNewReasonDataDenied=15

09-19 13:57:38.967   547   869 I RILQ    : (0/547):RIL[0][event] qcril_qmi_nas_reset_data_snapshot_cache_and_timer: Resetting snapshot timer

09-19 13:57:38.984  1627  1715 D RILJ    : Unsol response received for UNSOL_RESPONSE_VOICE_NETWORK_STATE_CHANGED Sending ack to ril.cpp [SUB0]

```

### vsim.log

```txt

09-19 15:07:28.875  3176  3191 D VSIM_PROTOCOL: onCommandReceiver in
09-19 15:07:28.875  3176  3191 D VSIM_PROTOCOL: data by tunnel req: 80F2000C00
09-19 15:07:28.875  3176  3191 D VSIM_PROTOCOL: dataFromTunnel, semaphore.acquire wait
09-19 15:07:28.875  3176  3191 D VSIM_PROTOCOL: dataFromTunnel, semaphore.acquire acquire
09-19 15:07:28.875  3176  3191 D VSIM_PROTOCOL: call vsim apdu command in
09-19 15:07:28.876  3176  3191 D VSIM_PROTOCOL: call vsim apdu command out
09-19 15:07:28.876  3176  3191 D VSIM_PROTOCOL: dataFromTunnel, semaphore.acquire release
09-19 15:07:28.876  3176  3191 D VSIM_PROTOCOL: data by tunnel ack: 9000
09-19 15:07:28.876  3176  3191 D VSIM_PROTOCOL: mPlatform.onResponse(commandTunnelResponse) in
09-19 15:07:28.877  3176  3191 D VSIM_PROTOCOL: mPlatform.onResponse(commandTunnelResponse) out
09-19 15:07:28.877  3176  3191 D VSIM_PROTOCOL: onCommandReceiver out

```






