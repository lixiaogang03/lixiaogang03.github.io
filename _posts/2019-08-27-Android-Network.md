---
layout:     post
title:      Android Network
subtitle:   Android 网络管理架构
date:       2019-08-27
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - Android
    - Network
---

[Android Net架构-CSDN](https://blog.csdn.net/qq_14978113/article/details/79069002)

[深入理解android网络架构--CSDN](https://blog.csdn.net/qq_14978113/article/details/89182253)

## 架构

![android_network](/images/android_network.png)

![android_netd](/images/android_netd.png)

## ConnectivityService

ConnectivityService（简称CS）是Android系统中的网络连接大管家，所有类型（如WiFi、Telephony、Ethernet等）的网络都需要注册关联到CS并提供链路请求接口。CS主要提供了以下几个方面的功能：

1. 网络有效性检测（NetworkMonitor）
2. 网络评分与选择（NetworkFactory、NetworkAgent、NetworkAgentInfo）
3. 网口、路由、DNS等参数配置（netd）
4. 向系统及三方提供网络申请接口（ConnectivityManager）

### dumpsys connectivity

```txt

NetworkFactories for: WIFI_UT Ethernet TelephonyNetworkFactory[0] PhoneSwitcherNetworkRequstListener WIFI

Active default network: 101

Current Networks:
  NetworkAgentInfo{ ni{[type: MOBILE[LTE], state: CONNECTED/CONNECTED, reason: connected, extra: cmnet, failover: false, available: true, roaming: false, metered: true]}  network{101}  nethandle{433808132830}  lp{{InterfaceName: rmnet_data0 LinkAddresses: [10.187.29.73/30,]  Routes: [0.0.0.0/0 -> 10.187.29.74 rmnet_data0,] DnsAddresses: [211.136.17.107,211.136.20.203,] Domains: null MTU: 1500 TcpBufferSizes: 2097152,4194304,8388608,262144,524288,1048576}}  nc{[ Transports: CELLULAR Capabilities: SUPL&INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&VALIDATED&FOREGROUND LinkUpBandwidth>=51200Kbps LinkDnBandwidth>=102400Kbps Specifier: <1>]}  Score{50}  everValidated{true}  lastValidated{true}  created{true} lingering{false} explicitlySelected{false} acceptUnvalidated{false} everCaptivePortalDetected{false} lastCaptivePortalDetected{false} }
    Requests: REQUEST:1 LISTEN:4 BACKGROUND_REQUEST:0 total:5
      NetworkRequest [ REQUEST id=1, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
      NetworkRequest [ LISTEN id=3, [] ]
      NetworkRequest [ LISTEN id=4, [ Transports: CELLULAR|WIFI Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
      NetworkRequest [ LISTEN id=6, [ Transports: CELLULAR Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
      NetworkRequest [ LISTEN id=7, [] ]
    Lingered:

Metered Interfaces:
  rmnet_data0

Restrict background: false

Status for known UIDs:
  UID=10008 rules=1 (ALLOW_METERED)
  UID=10027 rules=1 (ALLOW_METERED)
  
Network Requests:
  uid/pid:1000/1911 NetworkRequest [ LISTEN id=5, [ Transports: WIFI Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  uid/pid:10033/1679 NetworkRequest [ LISTEN id=7, [] ]
  uid/pid:1000/1378 NetworkRequest [ LISTEN id=4, [ Transports: CELLULAR|WIFI Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  uid/pid:1000/1378 NetworkRequest [ LISTEN id=3, [] ]
  uid/pid:1000/1378 NetworkRequest [ REQUEST id=1, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  uid/pid:1000/1911 NetworkRequest [ LISTEN id=6, [ Transports: CELLULAR Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  
mLegacyTypeTracker:
  Supported types: 0 1 2 3 4 5 7 10 11 12 15 17
  Current state:
    0 NetworkAgentInfo [MOBILE (LTE) - 101] CONNECTED/CONNECTED

mNetTransitionWakeLock: currently not held, last requested for NetworkAgentInfo [MOBILE (LTE) - 100]

Tethering:
  mUpstreamIfaceTypes: MOBILE WIFI MOBILE_HIPRI BLUETOOTH
  Tether state:

Packet keepalives:

Bad Wi-Fi avoidance: unrestricted


mValidationLogs (most recent first):
101 - cmnet
  08-28 13:48:51.362 - PROBE_DNS connect.rom.miui.com 101ms OK 111.13.213.168,39.156.81.215
  08-28 13:48:51.488 - PROBE_HTTP http://connect.rom.miui.com/generate_204 time=122ms ret=204 request={User-Agent=[Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36]} headers={null=[HTTP/1.1 204 No Content], Connection=[close], Date=[Wed, 28 Aug 2019 05:48:52 GMT], X-Android-Received-Millis=[1566971331486], X-Android-Response-Source=[NETWORK 204], X-Android-Selected-Protocol=[http/1.1], X-Android-Sent-Millis=[1566971331426]}
100 - cmnet
  08-28 13:48:48.042 - PROBE_DNS connect.rom.miui.com 27ms FAIL
  08-28 13:48:48.075 - PROBE_HTTP http://connect.rom.miui.com/generate_204 Probably not a portal: exception java.net.UnknownHostException: Unable to resolve host "connect.rom.miui.com": No address associated with hostname
  08-28 13:48:48.081 - trying to use fallback URL
  08-28 13:48:48.090 - PROBE_FALLBACK http://developers.google.cn/generate_204 Probably not a portal: exception java.net.UnknownHostException: Unable to resolve host "developers.google.cn": No address associated with hostname
  08-28 13:48:48.090 - trying to use fallback URL
  08-28 13:48:48.096 - PROBE_FALLBACK http://www.google.com/gen_204 Probably not a portal: exception java.net.UnknownHostException: Unable to resolve host "www.google.com": No address associated with hostname

mNetworkRequestInfoLogs (most recent first):
  08-28 13:48:03.261 - REGISTER uid/pid:10033/1679 NetworkRequest [ LISTEN id=7, [] ]
  08-28 13:48:03.095 - REGISTER uid/pid:1000/1911 NetworkRequest [ LISTEN id=6, [ Transports: CELLULAR Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  08-28 13:48:03.095 - REGISTER uid/pid:1000/1911 NetworkRequest [ LISTEN id=5, [ Transports: WIFI Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  08-28 13:48:02.400 - REGISTER uid/pid:1000/1378 NetworkRequest [ LISTEN id=4, [ Transports: CELLULAR|WIFI Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN] ]
  08-28 13:47:59.797 - REGISTER uid/pid:1000/1378 NetworkRequest [ LISTEN id=3, [] ]
  08-28 13:47:59.157 - REGISTER uid/pid:1000/1378 NetworkRequest [ REQUEST id=1, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN] ]

mNetworkInfoBlockingLogs (most recent first):

```

## NetworkFactory

系统中的网络工厂，也是CS向链路网络请求的统一接口。Android系统启动之初，数据和WiFi就通过WifiNetworkFactory和TelephonyNetworkFactory将自己注册到CS中，方便CS迅速响应网络请求。

NetworkFactory继承自Handler，并通过AsyncChannel（对Messenger的一种包装，维护了连接的状态，本质上使用Messenger）建立了CS和WifiStateMachine之间的单向通信：

```java

/**
 * A NetworkFactory is an entity that creates NetworkAgent objects.
 * The bearers register with ConnectivityService using {@link #register} and
 * their factory will start receiving scored NetworkRequests.  NetworkRequests
 * can be filtered 3 ways: by NetworkCapabilities, by score and more complexly by
 * overridden function.  All of these can be dynamic - changing NetworkCapabilities
 * or score forces re-evaluation of all current requests.
 *
 * If any requests pass the filter some overrideable functions will be called.
 * If the bearer only cares about very simple start/stopNetwork callbacks, those
 * functions can be overridden.  If the bearer needs more interaction, it can
 * override addNetworkRequest and removeNetworkRequest which will give it each
 * request that passes their current filters.
 * @hide
 **/
public class NetworkFactory extends Handler {

    public void register() {
        if (DBG) log("Registering NetworkFactory");
        if (mMessenger == null) {
            // 创建以自己为Handler的Messenger并传递给CS
            // 之后CS就能够使用Messenger通过Binder的形式与WifiStateMachine线程通信
            mMessenger = new Messenger(this);
            ConnectivityManager.from(mContext).registerNetworkFactory(mMessenger, LOG_TAG);
        }
    }

}

```

CS通过NetworkFactory和WifiStateMachine单向通信：

![network_factory](/images/network_factory.png)

## NetworkAgent

链路网络的代理，是CS和链路网络管理者（如WifiStateMachine）之间的信使，在L2连接成功后创建。通过NetworkAgent，WifiStateMachine可以向CS：

1. 更新网络状态 NetworkInfo（断开、连接中、已连接等）
2. 更新链路配置 LinkProperties（本机网口、IP、DNS、路由信息等）
3. 更新网络能力 NetworkCapabilities（信号强度、是否收费等）

CS可以向WifiStateMachine：

1. 更新网络有效性（即NetworkMonitor的网络检测结果）
2. 禁止自动连接
3. 由于网络不可上网等原因主动断开网络

因此，NetworkAgent提供了CS和WifiStateMachine之间双向通信的能力。原理类似NetworkFactory，也是使用了AsyncChannel和Messenger。

CS和WifiStateMachine通过NetworkAgent进行双向通信：

![network_agent](/images/network_agent.png)

