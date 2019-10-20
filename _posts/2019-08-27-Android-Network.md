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

![android_network](/images/network/android_network.png)

![android_netd](/images/netd/android_netd.png)

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

![network_factory](/images/network/network_factory.png)

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

![network_agent](/images/network/network_agent.png)

## NetworkMonitor

在链路网络注册到CS，并且所有网络配置信息都已经向netd完成了配置，此时就会开始进行网络诊断，具体诊断的任务交给NetworkMonitor。

NetworkMonitor也是一个状态机，包含以下几种基本状态：

![network_monitor](/images/network/network_monitor.png)

State	                  |                      Description
:-:                       |                         :-:
DefaultState	          |         初始状态。接收CS网络诊断命令消息后触发诊断；接收用户登录网络消息
MaybeNotifyState	      |         通知用户登录。接收诊断后发送的"CMD_LAUNCH_CAPTIVE_PORTAL_APP"消息，startActivity显示登录页面
EvaluatingState	          |         诊断状态。进入时发送"CMD_REEVALUATE"消息，接收 “CMD_REEVALUATE” 消息并执行网络诊断过程
CaptivePortalState	      |         登录状态。进入时发送"CMD_LAUNCH_CAPTIVE_PORTAL_APP"消息显示登录页面，发送10分钟延迟的"CMD_CAPTIVE_PORTAL_RECHECK"消息进行再次诊断
ValidatedState	          |         已验证状态。进入时发送"EVENT_NETWORK_TESTED"通知CS网络诊断完成
EvaluatingPrivateDnsState |       	私密DNS验证状态。Android Pie验证私密DNS推出。

## NetworkPolicyManagerService

NetworkPolicyManagerService（简称NPMS）是Android系统的网络策略管理者。NPMS会监听网络属性变化（是否收费，metered）、应用前后台、系统电量状态（省电模式）、设备休眠状态（Doze），在这些状态发生改变时，为不同名单内的网络消费者配置不同的网络策略。

网络策略的基本目的：

1. 在收费网络的情况下省流量
2. 最大可能性的省电
3. 防止危险流量进入

网络策略中几个重要的名单：

NameList	                |                       Description
:-:                         |                         :-:
mUidFirewallStandbyRules	|         黑名单，针对前后台应用。此名单中的APP默认REJECT，可配置ALLOW。
mUidFirewallDozableRules	|         白名单，针对Doze。此名单中的APP在Doze情况下默认ALLOW。
mUidFirewallPowerSaveRules	|         白名单，针对省电模式（由Battery服务提供）。此名单中的APP在省电模式下默认ALLOW，但在Doze情况下仍然REJECT。

NPMS对网络策略进行统一管理和记录，并配合netd和iptables/ip6tables工具，达到网络限制的目的。

### dumpsys netpolicy

```txt
System ready: true
Restrict background: false
Restrict power: false
Device idle: false
Network policies:
  NetworkPolicy[NetworkTemplate: matchRule=MOBILE_ALL, subscriberId=460110..., matchSubscriberIds=[460110...]]: cycleDay=1, cycleTimezone=Asia/Shanghai, warningBytes=2147483648, limitBytes=-1, lastWarningSnooze=-1, lastLimitSnooze=-1, metered=true, inferred=false
  NetworkPolicy[NetworkTemplate: matchRule=MOBILE_ALL, matchSubscriberIds=[null]]: cycleDay=27, cycleTimezone=Asia/Shanghai, warningBytes=2147483648, limitBytes=-1, lastWarningSnooze=-1, lastLimitSnooze=-1, metered=true, inferred=true
  NetworkPolicy[NetworkTemplate: matchRule=MOBILE_ALL, subscriberId=460040..., matchSubscriberIds=[460040...]]: cycleDay=27, cycleTimezone=Asia/Shanghai, warningBytes=2147483648, limitBytes=-1, lastWarningSnooze=-1, lastLimitSnooze=-1, metered=true, inferred=true
Metered ifaces: {rmnet_data0}
Policy for UIDs:
Power save whitelist (except idle) app ids:
  UID=10008: true
  UID=10027: true
Power save whitelist app ids:
  UID=10008: true
  UID=10027: true
Restrict background whitelist uids:
  UID=10008
  UID=10027
Default restrict background whitelist uids:
  UID=10008
  UID=10027
Status for all known UIDs:
  UID=1001 state=0 (fg) rules=0 (NONE)
  ....................................
Status for just UIDs with rules:
  UID=10008 rules=1 (ALLOW_METERED)
  UID=10027 rules=1 (ALLOW_METERED)

```

## NetworkManagementService

Android SystemServer不具备直接配置和操作网络的能力，所有的网络参数（网口、IP、DNS、Router等）配置，网络策略执行都需要通过netd这个native进程来实际执行或者传递给Kernel来执行。

而NetworkManagementService（简称NMS）就是SystemServer中其他服务连接netd的桥梁。

NMS和netd之间通信的方式有两种：Binder 和 Socket。为什么不全使用Binder？原因在于Android老版本上像 vold、netd 这种native进程和SystemServer通信的方式都是使用的Socket，目前高版本上也在慢慢的Binder化，提升调用速度。

SystemServer和netd之间的数据流向图：

![network_manager_service](/images/network/network_manager_service.png)

### dumpsys network_management

```txt

NetworkManagementService NativeDaemonConnector Log:
08-28 13:48:47.875 - RCV <- {200 30 MTU changed}
08-28 13:48:47.876 - SND -> {31 network route add 100 rmnet_data0 0.0.0.0/0 10.156.246.136}
08-28 13:48:47.880 - RCV <- {200 31 success}
08-28 13:48:47.893 - SND -> {32 bandwidth gettetherstats}
08-28 13:48:47.896 - RCV <- {200 32 Tethering stats list completed}
08-28 13:48:47.912 - RCV <- {600 Iface linkstate rmnet_data0 down}
08-28 13:48:47.922 - RCV <- {616 Route removed fe80::/64 dev rmnet_data0}
08-28 13:48:47.922 - RCV <- {614 Address removed fe80::c980:eef2:32dd:10c1/64 rmnet_data0 128 253}
08-28 13:48:47.973 - SND -> {33 bandwidth gettetherstats}
08-28 13:48:47.977 - RCV <- {200 33 Tethering stats list completed}
08-28 13:48:48.006 - SND -> {34 idletimer add rmnet_data0 10 0}
08-28 13:48:48.035 - RCV <- {614 Address removed 10.156.246.135/28 rmnet_data0 128 0}
08-28 13:48:48.294 - RCV <- {200 34 Add success}
08-28 13:48:48.295 - SND -> {35 network default set 100}
08-28 13:48:48.297 - RCV <- {200 35 success}
08-28 13:48:48.348 - SND -> {36 bandwidth gettetherstats}
08-28 13:48:48.349 - RCV <- {200 36 Tethering stats list completed}
08-28 13:48:48.402 - SND -> {37 idletimer remove rmnet_data0 10 0}
08-28 13:48:48.723 - RCV <- {200 37 Remove success}
08-28 13:48:48.728 - SND -> {38 network destroy 100}
08-28 13:48:48.795 - SND -> {39 bandwidth setglobalalert 2097152}
08-28 13:48:49.546 - RCV <- {200 38 success}
.................................................................

Pending requests:

Bandwidth control enabled: true
mMobileActivityFromRadio=false mLastPowerStateFromRadio=1
mNetworkActive=false
Active quota ifaces: {rmnet_data0=9223372036854775807}
Active alert ifaces: {}
Data saver mode: false
UID bandwith control blacklist rule: []
UID bandwith control whitelist rule: [10008,10027]
UID firewall  rule: []
UID firewall standby chain enabled: false
UID firewall standby rule: []
UID firewall dozable chain enabled: false
UID firewall dozable rule: []
UID firewall powersave chain enabled: false
UID firewall powersave rule: []
Idle timers:
  rmnet_data0:
    timeout=10 type=0 networkCount=1
Firewall enabled: false
Netd service status: alive

```

## netd

为了保障各个功能的正常运行，Android系统中有非常多的守护进程（Daemon）。为了保证系统起来后各项功能都已经ready，这些daemon进程跟随系统的启动而启动，而且一般比system_server进程先启动。如存储相关的vold、电话相关的rild、以及网络相关netd等, netd进程由init进程启动

```txt

$ ps |grep -E "netd|vold|rild|system_server"
root      364   1     44036  3272  hrtimer_na 00000000 S /system/bin/vold
root      761   1     24736  2776  binder_thr 00000000 S /system/bin/netd
radio     762   1     84876  14388 hrtimer_na 00000000 S /system/bin/rild
system    1378  692   1808024 114108 SyS_epoll_ 00000000 S system_server

```

netd作为Android系统的网络守护者，主要有以下方面的职能：

1. 处理接收来自Kernel的UEvent消息（包含网络接口、带宽、路由等信息），并传递给Framework
2. 提供防火墙设置、网络地址转换（NAT）、带宽控制、网络设备绑定（Tether）等接口
3. 管理和缓存DNS信息，为系统和应用提供域名解析服务

## wpa_supplicant

与netd一样，也是Android系统的一个daemon进程，与netd不同的是，它只有在WiFi开启的情况下才会启动，在WiFi关闭的时候会随之关闭。wpa_supplicant向Framework提供了WiFi配置、连接、断开等接口。

wpa_supplicant比Android的历史要早，在很多其他平台上也被广泛利用，他增加了对更多RFC协议的支持，这也是Google最初选择它的原因。但从Android近几个版本来看，Google还是希望弱化wpa_supplicant，并将其功能迁移至Framework或者其他daemon进程中。Android 8.0发生的几个改变：

与system_server的通信从原来的Socket通信改成了HIDL，提高了速度、便于system分区自升级
扫描的功能迁移到了system/wificond中，弱化wpa_supplicant

wpa_supplicant和Framework通信：

![wpa_supplicant](/images/network/wpa_supplicant.png)


