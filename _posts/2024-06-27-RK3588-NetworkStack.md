---
layout:     post
title:      RK3588 NetworkStack
subtitle:   android 12
date:       2024-06-27
author:     LXG
header-img: img/post-bg-android2.jpg
catalog: true
tags:
    - android
---

[网络堆栈-AOSP](https://source.android.com/docs/core/architecture/modular-system/networking?hl=zh-cn)

[Connectivity Diagnostics API](https://source.android.com/docs/core/connect/connectivity-diagnostics-api?hl=zh-cn)

[DNS 解析器-AOSP](https://source.android.com/docs/core/ota/modular-system/dns-resolver?hl=zh-cn)

## 简介

网络堆栈是一个可更新的 Mainline 模块，可以确保 Android 能够适应不断完善的网络标准，并支持与新实现进行互操作。例如，通过对强制门户检测和登录代码的更新，Android 能够及时了解不断变化的强制门户模型；通过对 APF 的更新，Android 能够在新型数据包变得常见的同时节省 Wi-Fi 耗电量。

* APF: Android平台防火墙（Android Platform Firewall）。Android平台防火墙是Android系统中的一个组件，用于管理网络流量和安全策略
* Captive Portal: 是一种网络访问控制技术，其作用主要是在用户尝试连接到一个网络时，引导用户进行认证、接受服务条款或进行其他类型的授权操作
* IP 服务: IpClient（以前称为 IpManager）是一个负责 IP 层配置和维护的组件
* NetworkMonitor: 会在连接到新网络或出现网络故障时、检测强制门户时以及验证网络时测试互联网可达性

## 代码库

```txt

rk3588_android_12/packages/modules/NetworkStack/src$ tree
.
├── android
│   └── net
│       ├── apf                         // （IPv6地址位过滤器）的过滤器实现，用于Android设备上的IPv6数据包过滤和管理
│       │   ├── ApfFilter.java
│       │   └── ApfGenerator.java
│       ├── captiveportal               // Captive Portal API探测结果，用于处理Captive Portal检测过程中的API调用结果
│       │   └── CapportApiProbeResult.java
│       ├── dhcp
│       │   ├── DhcpAckPacket.java
│       │   ├── DhcpClient.java         // DHCP客户端的实现，用于向DHCP服务器请求IP地址和配置信息
│       │   ├── DhcpDeclinePacket.java
│       │   ├── DhcpDiscoverPacket.java
│       │   ├── DhcpInformPacket.java
│       │   ├── DhcpLease.java
│       │   ├── DhcpLeaseRepository.java
│       │   ├── DhcpNakPacket.java
│       │   ├── DhcpOfferPacket.java
│       │   ├── DhcpPacket.java
│       │   ├── DhcpPacketListener.java
│       │   ├── DhcpReleasePacket.java
│       │   ├── DhcpRequestPacket.java
│       │   ├── DhcpResultsParcelableUtil.java
│       │   ├── DhcpServer.java       // DHCP服务器的实现，负责向DHCP客户端分配IP地址和配置信息
│       │   └── DhcpServingParams.java
│       ├── ip
│       │   ├── ConnectivityPacketTracker.java // 连通性数据包跟踪器，用于跟踪和分析网络连接过程中的数据包
│       │   ├── IpClient.java                  // IP客户端的实现，用于管理Android设备上的IP配置和连接
│       │   ├── IpClientLinkObserver.java
│       │   └── IpReachabilityMonitor.java     // IP可达性监视器，用于监控和管理设备的IP地址可达性状态
│       ├── NetworkStackIpMemoryStore.java
│       └── util
│           ├── ConnectivityPacketSummary.java
│           ├── DataStallUtils.java            //  数据堵塞（Data Stall）工具类，用于检测和处理网络连接中可能出现的数据堵塞问题
│           ├── HostnameTransliterator.java
│           ├── NetworkStackUtils.java
│           └── Stopwatch.java
└── com
    └── android
        ├── networkstack
        │   ├── arp
        │   │   └── ArpPacket.java
        │   ├── metrics                        // 各种网络堆栈相关的指标和统计信息，包括数据堵塞检测、IP配置指标、网络异常检测
        │   │   ├── DataStallDetectionStats.java
        │   │   ├── DataStallStatsUtils.java
        │   │   ├── IpProvisioningMetrics.java
        │   │   ├── NetworkQuirkMetrics.java
        │   │   ├── NetworkValidationMetrics.java
        │   │   └── stats.proto
        │   ├── netlink                        // Netlink套接字相关的定义和处理，主要用于与内核通信
        │   │   ├── TcpInfo.java
        │   │   └── TcpSocketTracker.java
        │   ├── NetworkStackNotifier.java
        │   ├── packets
        │   │   └── NeighborAdvertisement.java  // 邻居通告包的定义和处理
        │   └── util
        │       └── DnsUtils.java
        └── server
            ├── connectivity
            │   ├── ipmemorystore // IP内存存储相关的实现，包括数据库操作、服务实现和相关的工具类
            │   │   ├── IpMemoryStoreDatabase.java
            │   │   ├── IpMemoryStoreService.java
            │   │   ├── RegularMaintenanceJobService.java
            │   │   ├── RelevanceUtils.java
            │   │   ├── StatusAndCount.java
            │   │   └── Utils.java
            │   └── NetworkMonitor.java   // 网络监视器，用于监控设备的网络连接状态和性能
            ├── NetworkObserver.java      // 网络观察者，用于观察和监听设备的网络连接和状态变化
            ├── NetworkObserverRegistry.java
            ├── NetworkStackService.java  // 网络堆栈服务，提供网络相关功能和服务
            ├── TestNetworkStackService.java
            └── util
                └── PermissionUtil.java

```

## RK3588 以太网无法上网日志分析

```txt

06-26 05:00:40.718   610  1053 D UpstreamNetworkMonitor: Lost default Internet network: 100
06-26 05:00:40.821   610  1500 D NetworkMonitor/101: Validation disabled.
06-26 05:00:40.861   610   711 D ConnectivityService: Sending CONNECTED broadcast for type 9 [101 ETHERNET] isDefaultNetwork=true
06-26 05:00:40.864   610   711 D ConnectivityService: [101 ETHERNET] validation passed
06-26 05:00:40.866   610   711 D ConnectivityService: Setting DNS servers for network 101 to [/8.8.8.8, /114.114.114.114]
06-26 05:00:41.843   610  1217 D ConnectivityService: requestNetwork for uid/pid:1000/610 asUid: 10003 activeRequest: null callbackRequest: 34 [NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10003 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
06-26 05:00:41.843   610   711 D ConnectivityService: NetReassign [35 : null → 101]
06-26 05:00:41.844   610   750 D Ethernet: got request NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10003 RequestorUid: 1000 RequestorPkg: android] ]
06-26 05:00:41.844   610   750 D EthernetNetworkFactory: acceptRequest, request: NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10003 RequestorUid: 1000 RequestorPkg: android] ]
06-26 05:00:41.844   610   750 I EthernetNetworkFactory: networkForRequest, request: NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10003 RequestorUid: 1000 RequestorPkg: android] ], network: NetworkInterfaceState{ refCount: 0, iface: eth1, up: true, hwAddress: 3a:97:4c:27:bb:ee, networkCapabilities: [ Transports: ETHERNET Capabilities: NOT_METERED&INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_ROAMING&NOT_CONGESTED&NOT_SUSPENDED&NOT_VCN_MANAGED LinkUpBandwidth>=100000Kbps LinkDnBandwidth>=100000Kbps], networkAgent: com.android.server.ethernet.EthernetNetworkFactory$NetworkInterfaceState$1@2e10b0d, score: 70, ipClient: android.net.ip.IIpClient$Stub$Proxy@43ddac2,linkProperties: {InterfaceName: eth1 LinkAddresses: [ fe80::58a0:dafa:e8ed:3363/64,192.168.1.81/24 ] DnsAddresses: [ /8.8.8.8,/114.114.114.114 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ 192.168.1.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.1.1 eth1 mtu 0 ]}}
06-26 05:00:43.085   419  1497 W resolv  : SSL_connect ssl error =5, mark 0xf0065: No route to host
06-26 05:00:43.085   419  1498 W resolv  : SSL_connect ssl error =5, mark 0xf0065: No route to host
06-26 05:00:43.085   419  1497 W resolv  : TLS Handshake failed
06-26 05:00:43.085   419  1498 W resolv  : TLS Handshake failed
06-26 05:00:43.085   419  1497 W resolv  : query failed
06-26 05:00:43.085   419  1498 W resolv  : query failed
06-26 05:00:43.085   419  1497 W resolv  : validateDnsTlsServer returned 0 for 8.8.8.8
06-26 05:00:43.085   419  1498 W resolv  : validateDnsTlsServer returned 0 for 114.114.114.114
06-26 05:00:43.085   610  1488 W IpClient.eth1: [IpReachabilityMonitor] WARN ALERT neighbor went from: null to: NeighborEvent{@15250,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]}
06-26 05:00:43.085   419  1497 W resolv  : Validation failed
06-26 05:00:43.085   610  1488 W IpReachabilityMonitor: FAILURE: LOST_PROVISIONING, NeighborEvent{@15250,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]}
06-26 05:00:43.085   419  1498 W resolv  : Validation failed
06-26 05:00:45.405   610  1488 W IpClient.eth1: [IpReachabilityMonitor] WARN ALERT neighbor went from: NeighborEvent{@15250,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]} to: NeighborEvent{@17570,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]}
06-26 05:00:45.405   610  1488 W IpReachabilityMonitor: FAILURE: LOST_PROVISIONING, NeighborEvent{@17570,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]}
06-26 05:01:23.976   610  1491 D NetworkMonitor/101: isDataStall: result=1, tcp packets received=0, latest tcp fail rate=-1, consecutive dns timeout count=5
06-26 05:01:23.976   610  1491 D NetworkMonitor/101: Suspecting data stall, reevaluate
06-26 05:01:23.976   610  1910 D NetworkMonitor/101: Validation disabled.
06-26 05:01:23.977   610   711 D ConnectivityService: [101 ETHERNET] validation passed

```

## 代码

网络连接成功后有个叫做data stall的检测机制来持续检测网络可达性，判定标准为是否可以正常收包或者包失败率大于80%或者在30min内dns连续失败5次，即判定断网，通报给ConnectivityService。

06-26 05:01:23.976   610  1491 D NetworkMonitor/101: isDataStall: result=1, tcp packets received=0, latest tcp fail rate=-1, consecutive dns timeout count=5

**NetworkMonitor.java**

```java

public class NetworkMonitor extends StateMachine {

    /**
     * ConnectivityService notifies NetworkMonitor of DNS query responses event.
     * arg1 = returncode in OnDnsEvent which indicates the response code for the DNS query.
     */
    private static final int EVENT_DNS_NOTIFICATION = 17;

    /**
     * Send a notification to NetworkMonitor indicating that there was a DNS query response event.
     * @param returnCode the DNS return code of the response.
     */
    public void notifyDnsResponse(int returnCode) {
        sendMessage(EVENT_DNS_NOTIFICATION, returnCode);
    }

    private class ValidatedState extends State {
        @Override
        public boolean processMessage(Message message) {
            switch (message.what) {
                case EVENT_DNS_NOTIFICATION:
                    final DnsStallDetector dsd = getDnsStallDetector();
                    if (dsd == null) break;

                    dsd.accumulateConsecutiveDnsTimeoutCount(message.arg1);
                    if (evaluateDataStall()) {
                        transitionTo(mEvaluatingState);
                    }
                    break;
            }
        }
    }

    @VisibleForTesting
    protected boolean isDataStall() {
        if (!isValidationRequired()) {
            return false;
        }

        int typeToCollect = 0;
        final int notStall = -1;
        final StringJoiner msg = (DBG || VDBG_STALL || DDBG_STALL) ? new StringJoiner(", ") : null;
        // Reevaluation will generate traffic. Thus, set a minimal reevaluation timer to limit the
        // possible traffic cost in metered network.
        final long currentTime = SystemClock.elapsedRealtime();
        if (!mNetworkCapabilities.hasCapability(NET_CAPABILITY_NOT_METERED)
                && (currentTime - getLastProbeTime() < mDataStallMinEvaluateTime)) {
            if (DDBG_STALL) {
                Log.d(TAG, "isDataStall: false, currentTime=" + currentTime
                        + ", lastProbeTime=" + getLastProbeTime()
                        + ", MinEvaluateTime=" + mDataStallMinEvaluateTime);
            }
            return false;
        }
        // Check TCP signal. Suspect it may be a data stall if :
        // 1. TCP connection fail rate(lost+retrans) is higher than threshold.
        // 2. Accumulate enough packets count.
        final TcpSocketTracker tst = getTcpSocketTracker();
        if (dataStallEvaluateTypeEnabled(DATA_STALL_EVALUATION_TYPE_TCP) && tst != null) {
            // 如果最近接收的 TCP 包数量大于0，则不是数据堵塞
            if (tst.getLatestReceivedCount() > 0) {
                typeToCollect = notStall;
            } else if (tst.isDataStallSuspected()) {
                typeToCollect |= DATA_STALL_EVALUATION_TYPE_TCP;
            }
            if (DBG || VDBG_STALL || DDBG_STALL) {
                msg.add("tcp packets received=" + tst.getLatestReceivedCount())
                    .add("latest tcp fail rate=" + tst.getLatestPacketFailPercentage());
            }
        }

        // Check dns signal. Suspect it may be a data stall if both :
        // 1. The number of consecutive DNS query timeouts >= mConsecutiveDnsTimeoutThreshold.
        // 2. Those consecutive DNS queries happened in the last mValidDataStallDnsTimeThreshold ms.
        final DnsStallDetector dsd = getDnsStallDetector();
        if ((typeToCollect != notStall) && (dsd != null)
                && dataStallEvaluateTypeEnabled(DATA_STALL_EVALUATION_TYPE_DNS)) {
            if (dsd.isDataStallSuspected(
                    mConsecutiveDnsTimeoutThreshold, mDataStallValidDnsTimeThreshold)) {
                // 如果 DNS 数据堵塞检测器检测到数据堵塞，则标记为 DNS 数据堵塞
                typeToCollect |= DATA_STALL_EVALUATION_TYPE_DNS;
                logNetworkEvent(NetworkEvent.NETWORK_CONSECUTIVE_DNS_TIMEOUT_FOUND);
            }
            if (DBG || VDBG_STALL || DDBG_STALL) {
                msg.add("consecutive dns timeout count=" + dsd.getConsecutiveTimeoutCount());
            }
        }

        // 如果typeToCollect大于0，则表示发现了数据堵塞情况
        if (typeToCollect > 0) {
            mDataStallTypeToCollect = typeToCollect;
            final DataStallReportParcelable p = new DataStallReportParcelable();
            int detectionMethod = 0;
            p.timestampMillis = SystemClock.elapsedRealtime();
            if (isDataStallTypeDetected(typeToCollect, DATA_STALL_EVALUATION_TYPE_DNS)) {
                detectionMethod |= DETECTION_METHOD_DNS_EVENTS;
                p.dnsConsecutiveTimeouts = mDnsStallDetector.getConsecutiveTimeoutCount();
            }

            if (isDataStallTypeDetected(typeToCollect, DATA_STALL_EVALUATION_TYPE_TCP)) {
                detectionMethod |= DETECTION_METHOD_TCP_METRICS;
                p.tcpPacketFailRate = tst.getLatestPacketFailPercentage();
                p.tcpMetricsCollectionPeriodMillis = getTcpPollingInterval();
            }
            p.detectionMethod = detectionMethod;
            notifyDataStallSuspected(p);
        }

        // log only data stall suspected.
        if ((DBG && (typeToCollect > 0)) || VDBG_STALL || DDBG_STALL) {
            log("isDataStall: result=" + typeToCollect + ", " + msg);
        }

        return typeToCollect > 0;
    }

    /*
     * DnsStallDetector 类用于检测连续的 DNS 查询超时事件，并根据设定的阈值和有效时间来判断是否存在数据堵塞的可能性。
     * 它通过记录和分析 DNS 查询结果来提供数据堵塞检测的功能，帮助系统在网络连接异常时及时做出响应。
     */
    @VisibleForTesting
    protected class DnsStallDetector {
        private int mConsecutiveTimeoutCount = 0;
        private int mSize;
        final DnsResult[] mDnsEvents;
        final RingBufferIndices mResultIndices;

        DnsStallDetector(int size) {
            mSize = Math.max(DEFAULT_DNS_LOG_SIZE, size);
            mDnsEvents = new DnsResult[mSize];
            mResultIndices = new RingBufferIndices(mSize);
        }

        @VisibleForTesting
        protected void accumulateConsecutiveDnsTimeoutCount(int code) {
            final DnsResult result = new DnsResult(code);
            mDnsEvents[mResultIndices.add()] = result;
            if (result.isTimeout()) {
                mConsecutiveTimeoutCount++;
            } else {
                // Keep the event in mDnsEvents without clearing it so that there are logs to do the
                // simulation and analysis.
                mConsecutiveTimeoutCount = 0;
            }
        }

        private boolean isDataStallSuspected(int timeoutCountThreshold, int validTime) {
            if (timeoutCountThreshold <= 0) {
                Log.wtf(TAG, "Timeout count threshold should be larger than 0.");
                return false;
            }

            // Check if the consecutive timeout count reach the threshold or not.
            if (mConsecutiveTimeoutCount < timeoutCountThreshold) {
                return false;
            }

            // Check if the target dns event index is valid or not.
            final int firstConsecutiveTimeoutIndex =
                    mResultIndices.indexOf(mResultIndices.size() - timeoutCountThreshold);

            // If the dns timeout events happened long time ago, the events are meaningless for
            // data stall evaluation. Thus, check if the first consecutive timeout dns event
            // considered in the evaluation happened in defined threshold time.
            final long now = SystemClock.elapsedRealtime();
            final long firstTimeoutTime = now - mDnsEvents[firstConsecutiveTimeoutIndex].mTimeStamp;
            if (DDBG_STALL) {
                Log.d(TAG, "DSD.isDataStallSuspected, first="
                        + firstTimeoutTime + ", valid=" + validTime);
            }
            return (firstTimeoutTime < validTime);
        }

        int getConsecutiveTimeoutCount() {
            return mConsecutiveTimeoutCount;
        }
    }
    
    private static class DnsResult {
        // TODO: Need to move the DNS return code definition to a specific class once unify DNS
        // response code is done.
        private static final int RETURN_CODE_DNS_TIMEOUT = 255;

        private final long mTimeStamp;
        private final int mReturnCode;

        DnsResult(int code) {
            mTimeStamp = SystemClock.elapsedRealtime();
            mReturnCode = code;
        }

        private boolean isTimeout() {
            return mReturnCode == RETURN_CODE_DNS_TIMEOUT;
        }
    }

}

```

**DataStallUtils.java**

```java

public class DataStallUtils {

    public static final int DATA_STALL_EVALUATION_TYPE_NONE = 0;
    /** Detect data stall using dns timeout counts. */
    public static final int DATA_STALL_EVALUATION_TYPE_DNS = 1 << 0;   // 1
    /** Detect data stall using tcp connection fail rate. */ 
    public static final int DATA_STALL_EVALUATION_TYPE_TCP = 1 << 1;   // 2


    // 若30min中连续5次dns失败则认为是断网
    // Default configuration values for data stall detection.
    public static final int DEFAULT_CONSECUTIVE_DNS_TIMEOUT_THRESHOLD = 5;
    public static final int DEFAULT_DATA_STALL_MIN_EVALUATE_TIME_MS = 60 * 1000;
    public static final int DEFAULT_DATA_STALL_VALID_DNS_TIME_THRESHOLD_MS = 30 * 60 * 1000;

}

```

**NetworkStackService.java**

```java

public class NetworkStackService extends Service {

    /**
     * Proxy for {@link NetworkMonitor} that implements {@link INetworkMonitor}.
     */
    @VisibleForTesting
    public static class NetworkMonitorConnector extends INetworkMonitor.Stub {

        @Override
        public void notifyDnsResponse(int returnCode) {
            mPermChecker.enforceNetworkStackCallingPermission();
            mNm.notifyDnsResponse(returnCode);
        }

    }

}

```

**ConnectivityService.java**

./Connectivity/service/src/com/android/server/ConnectivityService.java

```java

public class ConnectivityService extends IConnectivityManager.Stub
        implements PendingIntent.OnFinished {

    class DnsResolverUnsolicitedEventCallback extends
            IDnsResolverUnsolicitedEventListener.Stub {

        @Override
        public void onDnsHealthEvent(final DnsHealthEventParcel event) {
            NetworkAgentInfo nai = getNetworkAgentInfoForNetId(event.netId);
            if (nai != null && nai.satisfies(mDefaultRequest.mRequests.get(0))) {
                nai.networkMonitor().notifyDnsResponse(event.healthResult);
            }
        }
    }
}

```

**DnsResolver/DnsProxyListener.cpp**

```cpp

void reportDnsEvent(int eventType, const android_net_context& netContext, int latencyUs,
                    int returnCode, NetworkDnsEventReported& event, const std::string& query_name,
                    const std::vector<std::string>& ip_addrs = {}, int total_ip_addr_count = 0) {

    if (returnCode == NETD_RESOLV_TIMEOUT) {
        const DnsHealthEventParcel dnsHealthEvent = {
                .netId = static_cast<int32_t>(netContext.dns_netid),
                .healthResult = IDnsResolverUnsolicitedEventListener::DNS_HEALTH_RESULT_TIMEOUT,
        };
        for (const auto& it : unsolEventListeners) {
            it->onDnsHealthEvent(dnsHealthEvent);
        }
    }
 
}

```

## DNS 解析器-DnsResolver

**异常日志摘录**

```txt

06-26 05:00:40.774   419  1497 W resolv  : Validating DnsTlsServer 8.8.8.8 with mark 0xf0065
06-26 05:00:40.774   419  1498 W resolv  : Validating DnsTlsServer 114.114.114.114 with mark 0xf0065
06-26 05:00:43.085   419  1497 W resolv  : SSL_connect ssl error =5, mark 0xf0065: No route to host
06-26 05:00:43.085   419  1498 W resolv  : SSL_connect ssl error =5, mark 0xf0065: No route to host
06-26 05:00:43.085   419  1497 W resolv  : TLS Handshake failed
06-26 05:00:43.085   419  1498 W resolv  : TLS Handshake failed
06-26 05:00:43.085   419  1497 W resolv  : query failed
06-26 05:00:43.085   419  1498 W resolv  : query failed
06-26 05:00:43.085   419  1497 W resolv  : validateDnsTlsServer returned 0 for 8.8.8.8
06-26 05:00:43.085   419  1498 W resolv  : validateDnsTlsServer returned 0 for 114.114.114.114

06-26 05:10:56.762   419  4875 W resolv  : Validating DnsTlsServer 8.8.8.8 with mark 0xf0066
06-26 05:10:56.762   419  4876 W resolv  : Validating DnsTlsServer 114.114.114.114 with mark 0xf0066
06-26 05:10:56.762   610   711 D ConnectivityService: Adding iface eth1 to network 102
06-26 05:10:56.762   419  4876 W resolv  : Socket failed to connect: Network is unreachable
06-26 05:10:56.762   419  4875 W resolv  : Socket failed to connect: Network is unreachable
06-26 05:10:56.762   419  4876 W resolv  : TCP Handshake failed: 101
06-26 05:10:56.762   419  4876 W resolv  : query failed
06-26 05:10:56.762   419  4876 W resolv  : validateDnsTlsServer returned 0 for 114.114.114.114
06-26 05:10:56.763   419  4876 W resolv  : Validation failed
06-26 05:10:56.763   419  4875 W resolv  : TCP Handshake failed: 101
06-26 05:10:56.763   419  4875 W resolv  : query failed
06-26 05:10:56.763   419  4875 W resolv  : validateDnsTlsServer returned 0 for 8.8.8.8
06-26 05:10:56.763   419  4875 W resolv  : Validation failed
06-26 05:10:56.764   610   711 D ConnectivityService: Setting DNS servers for network 102 to [/8.8.8.8, /114.114.114.114]
06-26 05:10:56.765   610   711 D DnsManager: sendDnsConfigurationForNetwork(102, [8.8.8.8, 114.114.114.114], [], 1800, 25, 8, 64, 0, 0, , [8.8.8.8, 114.114.114.114])
06-26 05:10:56.765   419  4877 W resolv  : Validating DnsTlsServer 8.8.8.8 with mark 0xf0066
06-26 05:10:56.765   419  4878 W resolv  : Validating DnsTlsServer 114.114.114.114 with mark 0xf0066

```

DNS 解析器模块可保护用户免受 DNS 拦截和配置更新攻击，并改进了 DNS 解析的网络性能。此模块包含用于实现 DNS 桩解析器的代码

在搭载 Android 9 及更低版本的设备上，DNS 解析器代码分布在 Bionic 和 netd 上。DNS 查找操作集中在 netd 守护程序中，以便进行系统级缓存，而应用在 Bionic 中调用函数（例如 getaddrinfo）。查询会通过 UNIX 套接字发送到 /dev/socket/dnsproxyd，再到 netd 守护程序，该守护程序会解析请求并再次调用 getaddrinfo 以发出 DNS 查找请求，然后它会缓存结果以供其他应用使用。DNS 解析器实现主要包含在 bionic/libc/dns/ 中，部分包含在 system/netd/server/dns 中。

Android 10 将 DNS 解析器代码移至 system/netd/resolv,，将其转换为 C++，然后对代码进行翻新和重构。

**DNS超时时间 DnsResolver/res_send.cpp**

```cpp

static struct timespec get_timeout(res_state statp, const res_params* params, const int ns) {
    int msec;
    // Legacy algorithm which scales the timeout by nameserver number.
    // For instance, with 4 nameservers: 5s, 2.5s, 5s, 10s
    // This has no effect with 1 or 2 nameservers
    msec = params->base_timeout_msec << ns;
    if (ns > 0) {
        msec /= statp->nameserverCount();
    }
    // For safety, don't allow OEMs and experiments to configure a timeout shorter than 1s.
    if (msec < 1000) {
        msec = 1000;  // Use at least 1000ms
    }
    LOG(INFO) << __func__ << ": using timeout of " << msec << " msec";

    struct timespec result;
    result.tv_sec = msec / 1000;
    result.tv_nsec = (msec % 1000) * 1000000;
    return result;
}


static int send_dg(res_state statp, res_params* params, const uint8_t* buf, int buflen,
                   uint8_t* ans, int anssiz, int* terrno, size_t* ns, int* v_circuit,
                   int* gotsomewhere, time_t* at, int* rcode, int* delay) {

    //----------------------------省略代码----------------------------------

    timespec timeout = get_timeout(statp, params, *ns);
    timespec start_time = evNowTime();
    timespec finish = evAddTime(start_time, timeout);
    for (;;) {
        // Wait for reply.
        auto result = udpRetryingPollWrapper(statp, *ns, &finish);
        --------------------------省略代码----------------------------------
    }

}

```

## dumpsys dnsresolver

```txt

130|rk3588_s:/ $ dumpsys dnsresolver
NetId: 101
  DnsEvent subsampling map: 7:110 2:110 0:400 default:8
  DNS servers: # IP (total, successes, errors, timeouts, internal errors, RTT avg, last sample)
    192.168.0.1 (4, 4, 0, 0, 0, 1ms, 829s)
  No search domains defined
  DNS parameters: sample validity = 1800s, success threshold = 25%, samples (min, max) = (8, 64), base_timeout = 5000msec, retry count = 2times
  DNS64 config: none
  Private DNS mode: OPPORTUNISTIC
  Private DNS configuration (1 entries)
    192.168.0.1 name{} status{fail}
  Concurrent DNS query timeout: 0
  Server statistics: (total, RTT avg, {rcode:counts}, last update)
    over UDP
      192.168.0.1 (4, 1ms, [NOERROR:4 ], 829s) score{100.0}
    over TLS
      192.168.0.1 <no data> score{100.0}
    over TCP
      192.168.0.1 <no data> score{100.0}
  TC mode: default
  TransportType: ETHERNET

PrivateDnsLog:
  16:46:35.208 - netId=100 PrivateDns={192.168.0.1:853/} state=in_process
  16:46:35.209 - netId=100 PrivateDns={192.168.0.1:853/} state=fail
  16:46:35.212 - netId=100 PrivateDns={192.168.0.1:853/} state=in_process
  16:46:37.070 - netId=100 PrivateDns={192.168.0.1:853/} state=fail
  16:46:37.136 - netId=101 PrivateDns={192.168.0.1:853/} state=in_process
  16:46:37.137 - netId=101 PrivateDns={192.168.0.1:853/} state=fail
  16:46:37.139 - netId=101 PrivateDns={192.168.0.1:853/} state=in_process
  16:46:37.140 - netId=101 PrivateDns={192.168.0.1:853/} state=fail
  16:46:37.219 - netId=101 PrivateDns={192.168.0.1:853/} state=in_process
  16:46:37.220 - netId=101 PrivateDns={192.168.0.1:853/} state=fail

Experiments list: 
  dot_validation_latency_offset_ms: UNSET
  sort_nameservers: UNSET
  dot_xport_unusable_threshold: UNSET
  dot_query_timeout_ms: UNSET
  keep_listening_udp: UNSET
  parallel_lookup_sleep_time: UNSET
  dot_revalidation_threshold: UNSET
  dot_async_handshake: UNSET
  dot_maxtries: UNSET
  dot_validation_latency_factor: UNSET
  dot_connect_timeout_ms: UNSET
  parallel_lookup_release: UNSET

```

## IpReachabilityMonitor

在Android S及其之后的版本中，IpReachabilityMonitor是一个关键组件，用于监控设备与其他网络设备（如路由器）之间的IP可达性。其主要工作原理涵盖以下几个方面：

**监控网络连接状态：**

IpReachabilityMonitor跟踪管理设备与其连接的每个网络接口的连接状态。这包括监测设备是否能够通过特定的网络接口访问Internet或局域网中的其他设备。

**使用ARP和ND协议：**

通过ARP（Address Resolution Protocol）和ND（Neighbor Discovery）协议，IpReachabilityMonitor获取并维护设备与其他网络设备的连接状态。这些协议允许设备解析IP地址与物理MAC地址之间的映射关系，并监测这些映射关系的变化。

**处理网络事件**

当设备无法通过特定网络接口访问某个IP地址时，或者网络连接状态发生变化时，IpReachabilityMonitor会触发相应的事件处理。这包括通知网络堆栈或应用程序相关的连接状态变化。

**错误处理和故障排除**

如果出现网络连接故障或设备无法到达特定IP地址的情况，IpReachabilityMonitor会记录相关的错误信息，并可能采取一些措施尝试恢复连接或提供适当的反馈。

**网络性能优化：**

通过监控设备与其他网络设备之间的IP可达性，IpReachabilityMonitor帮助优化网络性能。例如，可以检测并响应网络连接的中断或恢复，以确保用户体验的连续性和网络稳定性。

**警告日志**

06-26 05:00:43.085   610  1488 W IpClient.eth1: [IpReachabilityMonitor] WARN ALERT neighbor went from: null to: NeighborEvent{@15250,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]}
06-26 05:00:43.085   610  1488 W IpReachabilityMonitor: FAILURE: LOST_PROVISIONING, NeighborEvent{@15250,RTM_NEWNEIGH,if=9,192.168.1.1,NUD_FAILED,[null]}


```java

public class IpReachabilityMonitor {


    IpReachabilityMonitor(Context context, InterfaceParams ifParams, Handler h, SharedLog log,
            Callback callback, boolean usingMultinetworkPolicyTracker, Dependencies dependencies,
            final IpConnectivityLog metricsLog, final INetd netd) {

        //-----------------------------此处代码省略-------------------

        mIpNeighborMonitor = mDependencies.makeIpNeighborMonitor(h, mLog,
                (NeighborEvent event) -> {
                    if (mInterfaceParams.index != event.ifindex) return;
                    if (!mNeighborWatchList.containsKey(event.ip)) return;

                    final NeighborEvent prev = mNeighborWatchList.put(event.ip, event);

                    // TODO: Consider what to do with other states that are not within
                    // NeighborEvent#isValid() (i.e. NUD_NONE, NUD_INCOMPLETE).
                    if (event.nudState == StructNdMsg.NUD_FAILED) {
                        mLog.w("ALERT neighbor went from: " + prev + " to: " + event);
                        handleNeighborLost(event);
                    } else if (event.nudState == StructNdMsg.NUD_REACHABLE) {
                        maybeRestoreNeighborParameters();
                    }
                });
        mIpNeighborMonitor.start();
    }

    private void handleNeighborLost(NeighborEvent event) {
        final LinkProperties whatIfLp = new LinkProperties(mLinkProperties);

        InetAddress ip = null;
        for (Map.Entry<InetAddress, NeighborEvent> entry : mNeighborWatchList.entrySet()) {
            // TODO: Consider using NeighborEvent#isValid() here; it's more
            // strict but may interact badly if other entries are somehow in
            // NUD_INCOMPLETE (say, during network attach).
            final NeighborEvent val = entry.getValue();

            // Find all the neighbors that have gone into FAILED state.
            // Ignore entries for which we have never received an event. If there are neighbors
            // that never respond to ARP/ND, the kernel will send several FAILED events, then
            // an INCOMPLETE event, and then more FAILED events. The INCOMPLETE event will
            // populate the map and the subsequent FAILED event will be processed.
            if (val == null || val.nudState != StructNdMsg.NUD_FAILED) continue;

            ip = entry.getKey();
            for (RouteInfo route : mLinkProperties.getRoutes()) {
                if (ip.equals(route.getGateway())) {
                    whatIfLp.removeRoute(route);
                }
            }

            if (avoidingBadLinks() || !(ip instanceof Inet6Address)) {
                // We should do this unconditionally, but alas we cannot: b/31827713.
                whatIfLp.removeDnsServer(ip);
            }
        }

        final boolean lostProvisioning =
                (mLinkProperties.isIpv4Provisioned() && !whatIfLp.isIpv4Provisioned())
                || (mLinkProperties.isIpv6Provisioned() && !whatIfLp.isIpv6Provisioned());

        if (lostProvisioning) {
            final String logMsg = "FAILURE: LOST_PROVISIONING, " + event;
            Log.w(TAG, logMsg);
            if (mCallback != null) {
                // TODO: remove |ip| when the callback signature no longer has
                // an InetAddress argument.
                mCallback.notifyLost(ip, logMsg);  // 通知应用层网路丢失
            }
        }
        logNudFailed(lostProvisioning);
    }

}


```

**IpClient.java**

mConfiguration.mUsingIpReachabilityMonitor 参数可以配置是否开启网络可达性检测

```java

public class IpClient extends StateMachine {

    class RunningState extends State {
    
        @Override
        public void enter() {
            //---------------------------------------省略---------------------

            if (mConfiguration.mUsingIpReachabilityMonitor && !startIpReachabilityMonitor()) {
                doImmediateProvisioningFailure(
                        IpManagerEvent.ERROR_STARTING_IPREACHABILITYMONITOR);
                enqueueJumpToStoppingState(DisconnectCode.DC_ERROR_STARTING_IPREACHABILITYMONITOR);
                return;
            }
        }
    }

    private boolean startIpReachabilityMonitor() {
        try {
            mIpReachabilityMonitor = new IpReachabilityMonitor(
                    mContext,
                    mInterfaceParams,
                    getHandler(),
                    mLog,
                    new IpReachabilityMonitor.Callback() {
                        @Override
                        public void notifyLost(InetAddress ip, String logMsg) {
                            mCallback.onReachabilityLost(logMsg);
                        }
                    },
                    mConfiguration.mUsingMultinetworkPolicyTracker,
                    mNetd);
        } catch (IllegalArgumentException iae) {
            // Failed to start IpReachabilityMonitor. Log it and call
            // onProvisioningFailure() immediately.
            //
            // See http://b/31038971.
            logError("IpReachabilityMonitor failure: %s", iae);
            mIpReachabilityMonitor = null;
        }

        return (mIpReachabilityMonitor != null);
    }
    
}

```

## 可能的误判

**误报网络不可达**

* 误判临时性问题：有时候网络传输中的短暂中断或暂时性延迟可能会被错误地判定为长期性网络不可达。
* 设备配置问题：例如，设备本身的网络设置或接口配置不正确，可能导致IpReachabilityMonitor错误地判断某个IP地址不可达

**未能检测到实际的网络问题**

* 监测频率问题：监测间隔过长或过短可能导致IpReachabilityMonitor未能及时发现真实的网络连接问题。
* 协议问题：如果ARP或ND协议实现有问题，可能导致设备无法正确获取或更新与其他设备的连接状态信息

**错误的网络状态处理**

* 在处理网络事件时，如果IpReachabilityMonitor未能正确识别或响应某些网络状态变化，可能会导致设备无法及时恢复网络连接或无法正确通知应用程序。

## 调试命令

dumpsys ethernet

dumpsys netd

dumpsys network_stack

dumpsys connectivity

## dumpsys connectivity

```txt

rk3588_s:/ $ dumpsys connectivity
NetworkProviders for: WifiNetworkFactory OemPaidWifiNetworkFactory Ethernet PhoneSwitcherNetworkRequstListener VcnNetworkProvider UntrustedWifiNetworkFactory VpnNetworkProvider:0 TelephonyNetworkFactory[0]

Active default network: 101

Current per-app default networks: Per-App Network Preference:
    none

Current Networks:
  NetworkAgentInfo{network{101}  handle{437197393933}  ni{Ethernet CONNECTED extra: ec:0a:81:96:f0:b4} Score(70 ; KeepConnected : 0 ; Policies : EVER_VALIDATED&IS_UNMETERED&IS_VALIDATED)  everValidated lastValidated  lp{{InterfaceName: eth1 LinkAddresses: [ fe80::b0be:3214:ee84:81f2/64,192.168.0.56/24 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ fe80::/64 -> :: eth1 mtu 0,192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}}  nc{[ Transports: ETHERNET Capabilities: NOT_METERED&INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&VALIDATED&NOT_ROAMING&FOREGROUND&NOT_CONGESTED&NOT_SUSPENDED&NOT_VCN_MANAGED LinkUpBandwidth>=100000Kbps LinkDnBandwidth>=100000Kbps]}}
    Requests: REQUEST:10 LISTEN:9 BACKGROUND_REQUEST:0 total:19
      NetworkRequest [ REQUEST id=1, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ LISTEN id=5, [ Capabilities: FOREGROUND RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ REQUEST id=7, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ LISTEN id=8, [ Capabilities: FOREGROUND RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ LISTEN id=9, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&FOREGROUND&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ LISTEN id=10, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&FOREGROUND&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ LISTEN id=11, [ RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ REQUEST id=14, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ REQUEST id=16, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.android.networkstack.inprocess] ]
      NetworkRequest [ REQUEST id=20, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ]
      NetworkRequest [ REQUEST id=22, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ]
      NetworkRequest [ LISTEN id=23, [ RequestorUid: 10044 RequestorPkg: com.android.systemui] ]
      NetworkRequest [ TRACK_SYSTEM_DEFAULT id=24, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: com.android.networkstack.tethering.inprocess] ]
      NetworkRequest [ REQUEST id=27, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1001 RequestorUid: 1001 RequestorPkg: com.android.phone] ]
      NetworkRequest [ REQUEST id=29, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ REQUEST id=30, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]
      NetworkRequest [ LISTEN id=31, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]
      NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10007 RequestorUid: 1000 RequestorPkg: android] ]
      NetworkRequest [ LISTEN id=38, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.ota] ]
    Inactivity Timers:

Status for known UIDs:
  
Network Requests:
  uid/pid:1000/622 activeRequest: 1 callbackRequest: 1 [NetworkRequest [ REQUEST id=1, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 1 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 2 [NetworkRequest [ BACKGROUND_REQUEST id=2, [ Transports: CELLULAR Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 1 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 5 [NetworkRequest [ LISTEN id=5, [ Capabilities: FOREGROUND RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: 7 callbackRequest: 6 [NetworkRequest [ REQUEST id=7, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 8 [NetworkRequest [ LISTEN id=8, [ Capabilities: FOREGROUND RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 9 [NetworkRequest [ LISTEN id=9, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&FOREGROUND&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 10 [NetworkRequest [ LISTEN id=10, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&FOREGROUND&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 11 [NetworkRequest [ LISTEN id=11, [ RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 12 [NetworkRequest [ LISTEN id=12, [ Transports: CELLULAR Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: 14 callbackRequest: 13 [NetworkRequest [ REQUEST id=14, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: 16 callbackRequest: 15 [NetworkRequest [ REQUEST id=16, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.android.networkstack.inprocess] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: null callbackRequest: 17 [NetworkRequest [ LISTEN id=17, [ Transports: WIFI Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.android.networkstack.inprocess] ]] callback flags: 0 priority: 2147483647
  uid/pid:10044/792 activeRequest: null callbackRequest: 18 [NetworkRequest [ LISTEN id=18, [ Transports: CELLULAR|WIFI Capabilities: NOT_VPN RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 1 priority: 2147483647
  uid/pid:10044/792 activeRequest: 20 callbackRequest: 19 [NetworkRequest [ REQUEST id=20, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 1 priority: 2147483647
  uid/pid:10044/792 activeRequest: 22 callbackRequest: 21 [NetworkRequest [ REQUEST id=22, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 1 priority: 2147483647
  uid/pid:10044/792 activeRequest: null callbackRequest: 23 [NetworkRequest [ LISTEN id=23, [ RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: 24 callbackRequest: 24 [NetworkRequest [ TRACK_SYSTEM_DEFAULT id=24, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: com.android.networkstack.tethering.inprocess] ]] callback flags: 0 priority: 2147483647
  uid/pid:1001/913 activeRequest: null callbackRequest: 25 [NetworkRequest [ LISTEN id=25, [ Transports: WIFI Capabilities: INTERNET&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1001 RequestorUid: 1001 RequestorPkg: com.android.phone] ]] callback flags: 0 priority: 2147483647
  uid/pid:1001/913 activeRequest: 27 callbackRequest: 26 [NetworkRequest [ REQUEST id=27, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1001 RequestorUid: 1001 RequestorPkg: com.android.phone] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 activeRequest: 29 callbackRequest: 28 [NetworkRequest [ REQUEST id=29, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/1278 activeRequest: 30 callbackRequest: 30 [NetworkRequest [ REQUEST id=30, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/1278 activeRequest: null callbackRequest: 31 [NetworkRequest [ LISTEN id=31, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/622 asUid: 10007 activeRequest: 35 callbackRequest: 34 [NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10007 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  uid/pid:1000/1764 activeRequest: null callbackRequest: 38 [NetworkRequest [ LISTEN id=38, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.ota] ]] callback flags: 0 priority: 2147483647

mLegacyTypeTracker:
  Supported types: 1 7 9 13 17
  Current state:
    9 [101 ETHERNET]


Supported Socket keepalives: [1, 3, 0, 0, 0, 0, 0, 0, 0, 0]
Reserved Privileged keepalives: 2
Allowed Unprivileged keepalives per uid: 2
Socket keepalives:

Bad Wi-Fi avoidance: unrestricted


mNetworkRequestInfoLogs (most recent first):
  2024-06-27T16:46:38.654 - RELEASE uid/pid:1000/1785 activeRequest: 40 callbackRequest: 39 [NetworkRequest [ REQUEST id=40, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.remotecontrol] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:38.636 - REGISTER uid/pid:1000/1785 activeRequest: null callbackRequest: 39 [NetworkRequest [ REQUEST id=40, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.remotecontrol] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:38.524 - REGISTER uid/pid:1000/1764 activeRequest: null callbackRequest: 38 [NetworkRequest [ LISTEN id=38, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.ota] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:38.460 - RELEASE uid/pid:10007/1723 activeRequest: 37 callbackRequest: 36 [NetworkRequest [ REQUEST id=37, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10007 RequestorUid: 10007 RequestorPkg: com.android.statementservice] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:38.449 - REGISTER uid/pid:10007/1723 activeRequest: null callbackRequest: 36 [NetworkRequest [ REQUEST id=37, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10007 RequestorUid: 10007 RequestorPkg: com.android.statementservice] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:38.435 - REGISTER uid/pid:1000/622 asUid: 10007 activeRequest: null callbackRequest: 34 [NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10007 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:37.134 - RELEASE uid/pid:1000/1278 activeRequest: null callbackRequest: 32 [NetworkRequest [ REQUEST id=33, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:36.750 - REGISTER uid/pid:1000/1278 activeRequest: null callbackRequest: 32 [NetworkRequest [ REQUEST id=33, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:36.616 - REGISTER uid/pid:1000/1278 activeRequest: null callbackRequest: 31 [NetworkRequest [ LISTEN id=31, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:36.606 - REGISTER uid/pid:1000/1278 activeRequest: null callbackRequest: 30 [NetworkRequest [ REQUEST id=30, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:36.532 - REGISTER uid/pid:1000/622 activeRequest: null callbackRequest: 28 [NetworkRequest [ REQUEST id=29, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:35.151 - REGISTER uid/pid:1001/913 activeRequest: null callbackRequest: 26 [NetworkRequest [ REQUEST id=27, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1001 RequestorUid: 1001 RequestorPkg: com.android.phone] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:35.134 - REGISTER uid/pid:1001/913 activeRequest: null callbackRequest: 25 [NetworkRequest [ LISTEN id=25, [ Transports: WIFI Capabilities: INTERNET&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1001 RequestorUid: 1001 RequestorPkg: com.android.phone] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:35.001 - REGISTER uid/pid:1000/622 activeRequest: null callbackRequest: 24 [NetworkRequest [ TRACK_SYSTEM_DEFAULT id=24, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: com.android.networkstack.tethering.inprocess] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:34.968 - REGISTER uid/pid:10044/792 activeRequest: null callbackRequest: 23 [NetworkRequest [ LISTEN id=23, [ RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:34.966 - REGISTER uid/pid:10044/792 activeRequest: null callbackRequest: 21 [NetworkRequest [ REQUEST id=22, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 1 priority: 2147483647
  2024-06-27T16:46:34.964 - REGISTER uid/pid:10044/792 activeRequest: null callbackRequest: 19 [NetworkRequest [ REQUEST id=20, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 1 priority: 2147483647
  2024-06-27T16:46:34.964 - REGISTER uid/pid:10044/792 activeRequest: null callbackRequest: 18 [NetworkRequest [ LISTEN id=18, [ Transports: CELLULAR|WIFI Capabilities: NOT_VPN RequestorUid: 10044 RequestorPkg: com.android.systemui] ]] callback flags: 1 priority: 2147483647
  2024-06-27T16:46:34.928 - REGISTER uid/pid:1000/622 activeRequest: null callbackRequest: 17 [NetworkRequest [ LISTEN id=17, [ Transports: WIFI Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.android.networkstack.inprocess] ]] callback flags: 0 priority: 2147483647
  2024-06-27T16:46:34.928 - REGISTER uid/pid:1000/622 activeRequest: null callbackRequest: 15 [NetworkRequest [ REQUEST id=16, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.android.networkstack.inprocess] ]] callback flags: 0 priority: 2147483647

mNetworkInfoBlockingLogs (most recent first):

NetTransition WakeLock activity (most recent first):
  total acquisitions: 1
  total releases: 1
  cumulative duration: 1s
  longest duration: 1s
  2024-06-27T16:46:38.216 - RELEASE (EVENT_CLEAR_NET_TRANSITION_WAKELOCK)
  2024-06-27T16:46:37.130 - ACQUIRE for [100 ETHERNET]
  
  bandwidth update requests (by uid):

mOemNetworkPreferencesLogs (most recent first):


Permission Monitor:
  Interface filtering rules:

Legacy network activity:
  mNetworkActive=false
  Idle timers:

```

## dumpsys ethernet

```txt

rk3588_s:/ $ dumpsys ethernet
Current Ethernet state: 
  EthernetTracker
  Ethernet interface name filter: eth1
  Default interface: eth1
  Default interface mode: 1
  Tethered interface requests: 0
  Listeners: 0
  IP Configurations:
    eth1: IP assignment: STATIC
    Static configuration: IP address 192.168.0.56/24 Gateway 192.168.0.1  DNS servers: [ 192.168.0.1 0.0.0.0 ] Domains 
    Proxy settings: NONE
    
    eth0: IP assignment: STATIC
    Static configuration: IP address 192.168.43.50/24 Gateway 192.168.43.1  DNS servers: [ 192.168.43.1 0.0.0.0 ] Domains 
    Proxy settings: NONE
    
  
  Network Capabilities:
  
  providerId=1, ScoreFilter=Score(70 ; Policies : 0), Filter=[ Transports: ETHERNET Capabilities: NOT_METERED&INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_ROAMING&NOT_CONGESTED&NOT_SUSPENDED&NOT_VCN_MANAGED], requests=10
    {NetworkRequest [ REQUEST id=20, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ], requested=false}
    {NetworkRequest [ REQUEST id=16, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.android.networkstack.inprocess] ], requested=false}
    {NetworkRequest [ REQUEST id=22, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10044 RequestorUid: 10044 RequestorPkg: com.android.systemui] ], requested=false}
    {NetworkRequest [ REQUEST id=7, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ], requested=false}
    {NetworkRequest [ REQUEST id=14, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ], requested=false}
    {NetworkRequest [ REQUEST id=1, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED RequestorUid: 1000 RequestorPkg: android] ], requested=false}
    {NetworkRequest [ REQUEST id=27, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1001 RequestorUid: 1001 RequestorPkg: com.android.phone] ], requested=false}
    {NetworkRequest [ REQUEST id=29, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: android] ], requested=false}
    {NetworkRequest [ REQUEST id=30, [ Capabilities: NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_VCN_MANAGED Uid: 1000 RequestorUid: 1000 RequestorPkg: com.wif.baseservice] ], requested=false}
    {NetworkRequest [ REQUEST id=35, [ Capabilities: INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VCN_MANAGED Uid: 10007 RequestorUid: 1000 RequestorPkg: android] ], requested=true}
  EthernetNetworkFactory
  Tracking interfaces:
    eth1:NetworkInterfaceState{ refCount: 1, iface: eth1, up: true, hwAddress: ec:0a:81:96:f0:b4, networkCapabilities: [ Transports: ETHERNET Capabilities: NOT_METERED&INTERNET&NOT_RESTRICTED&TRUSTED&NOT_VPN&NOT_ROAMING&NOT_CONGESTED&NOT_SUSPENDED&NOT_VCN_MANAGED LinkUpBandwidth>=100000Kbps LinkDnBandwidth>=100000Kbps], networkAgent: com.android.server.ethernet.EthernetNetworkFactory$NetworkInterfaceState$1@d207d0b, score: 70, ipClient: android.net.ip.IIpClient$Stub$Proxy@e70c7e8,linkProperties: {InterfaceName: eth1 LinkAddresses: [ fe80::b0be:3214:ee84:81f2/64,192.168.0.56/24 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ 192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}}
      IpClient logs have moved to dumpsys network_stack
Handler:
  EthernetServiceImplHandler (android.os.Handler) {7425798} @ 84776
  EthernetServiceImpl  Looper (EthernetServiceThread, tid 124) {57fcbf1}
  EthernetServiceImpl    (Total messages: 0, polling=true, quitting=false)


```

## dumpsys network_stack

```txt

rk3588_s:/ $ dumpsys network_stack
NetworkStack version:
LocalInterface:10:4925f4fdbb270e4f35cc5519a15ed8dd8c69a549
ipmemorystore:10:d5ea5eb3ddbdaa9a986ce6ba70b0804ca3e39b0c
netd:7:850353de5d19a0dd718f8fd20791f0532e6a34c7
networkstack:10:4925f4fdbb270e4f35cc5519a15ed8dd8c69a549

NetworkStack logs:

Recently active IpClient logs:
IpClient.eth1
  IpClient.eth1 APF dump:
    No active ApfFilter; Hardware does not support APF.
  
  IpClient.eth1 current ProvisioningConfiguration:
    ProvisioningConfiguration{mEnableIPv4: true, mEnableIPv6: true, mEnablePreconnection: false, mUsingMultinetworkPolicyTracker: true, mUsingIpReachabilityMonitor: false, mRequestedPreDhcpActionMs: 0, mInitialConfig: null, mStaticIpConfig: IP address 192.168.0.56/24 Gateway 192.168.0.1  DNS servers: [ 192.168.0.1 0.0.0.0 ] Domains , mApfCapabilities: null, mProvisioningTimeoutMs: 18000, mIPv6AddrGenMode: 2, mNetwork: null, mDisplayName: null, mScanResultInfo: null, mLayer2Info: null, mDhcpOptions: null}
  
  IpClient.eth1 StateMachine dump:
    2024-06-27T16:46:35.186 - CMD_UPDATE_TCP_BUFFER_SIZES eth1/-1 0 0 524288,1048576,3145728,524288,1048576,2097152 [rcvd_in=StoppedState, proc_in=StoppedState]
    2024-06-27T16:46:35.187 - CMD_START eth1/-1 0 0 ProvisioningConfiguration{mEnableIPv4: true, mEnableIPv6: true, mEnablePreconnection: false, mUsingMultinetworkPolicyTracker: true, mUsingIpReachabilityMonitor: false, mRequestedPreDhcpActionMs: 0, mInitialConfig: null, mStaticIpConfig: IP address 192.168.0.56/24 Gateway 192.168.0.1  DNS servers: [ 192.168.0.1 0.0.0.0 ] Domains , mApfCapabilities: null, mProvisioningTimeoutMs: 18000, mIPv6AddrGenMode: 2, mNetwork: null, mDisplayName: null, mScanResultInfo: null, mLayer2Info: null, mDhcpOptions: null} [rcvd_in=StoppedState, proc_in=StoppedState]
    2024-06-27T16:46:35.194 - INVOKE setNeighborDiscoveryOffload(true)
    2024-06-27T16:46:35.194 - CMD_ADDRESSES_CLEARED eth1/9 0 0 null [rcvd_in=null, proc_in=null]
    2024-06-27T16:46:35.195 - INVOKE setFallbackMulticastFilter(false)
    2024-06-27T16:46:35.200 - INVOKE onNewDhcpResults({android.net.networkstack.DhcpResults@128dba3 DHCP server null Vendor info null lease 0 seconds Servername null})
    2024-06-27T16:46:35.200 - INVOKE onProvisioningSuccess({{InterfaceName: eth1 LinkAddresses: [ 192.168.0.56/24 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ 192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}})
    2024-06-27T16:46:37.031 - INVOKE onLinkPropertiesChange({{InterfaceName: eth1 LinkAddresses: [ 192.168.0.56/24 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ fe80::/64 -> :: eth1 mtu 0,192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}})
    2024-06-27T16:46:37.032 - INVOKE onLinkPropertiesChange({{InterfaceName: eth1 LinkAddresses: [ 192.168.0.56/24,fe80::b0be:3214:ee84:81f2/64 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ fe80::/64 -> :: eth1 mtu 0,192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}})
    2024-06-27T16:46:37.033 - CMD_STOP eth1/9 1 0 null [rcvd_in=RunningState, proc_in=RunningState]
    2024-06-27T16:46:37.068 - CMD_JUMP_STOPPING_TO_STOPPED eth1/9 0 0 null [rcvd_in=StoppingState, proc_in=StoppingState]
    2024-06-27T16:46:37.069 - INVOKE onLinkPropertiesChange({{InterfaceName: eth1 LinkAddresses: [ ] DnsAddresses: [ ] Domains: null MTU: 0 Routes: [ ]}})
    2024-06-27T16:46:37.069 - CMD_TERMINATE_AFTER_STOP eth1/9 0 0 null [rcvd_in=StoppedState, proc_in=StoppedState]
    2024-06-27T16:46:37.070 - INVOKE onQuit()
    2024-06-27T16:46:37.072 - CMD_UPDATE_TCP_BUFFER_SIZES eth1/-1 0 0 524288,1048576,3145728,524288,1048576,2097152 [rcvd_in=StoppedState, proc_in=StoppedState]
    2024-06-27T16:46:37.072 - CMD_START eth1/-1 0 0 ProvisioningConfiguration{mEnableIPv4: true, mEnableIPv6: true, mEnablePreconnection: false, mUsingMultinetworkPolicyTracker: true, mUsingIpReachabilityMonitor: false, mRequestedPreDhcpActionMs: 0, mInitialConfig: null, mStaticIpConfig: IP address 192.168.0.56/24 Gateway 192.168.0.1  DNS servers: [ 192.168.0.1 0.0.0.0 ] Domains , mApfCapabilities: null, mProvisioningTimeoutMs: 18000, mIPv6AddrGenMode: 2, mNetwork: null, mDisplayName: null, mScanResultInfo: null, mLayer2Info: null, mDhcpOptions: null} [rcvd_in=StoppedState, proc_in=StoppedState]
    2024-06-27T16:46:37.073 - INVOKE setNeighborDiscoveryOffload(true)
    2024-06-27T16:46:37.074 - CMD_ADDRESSES_CLEARED eth1/9 0 0 null [rcvd_in=null, proc_in=null]
    2024-06-27T16:46:37.074 - INVOKE setFallbackMulticastFilter(false)
    2024-06-27T16:46:37.076 - INVOKE onNewDhcpResults({android.net.networkstack.DhcpResults@3ee0b33 DHCP server null Vendor info null lease 0 seconds Servername null})
    2024-06-27T16:46:37.076 - INVOKE onLinkPropertiesChange({{InterfaceName: eth1 LinkAddresses: [ fe80::b0be:3214:ee84:81f2/64 ] DnsAddresses: [ ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ fe80::/64 -> :: eth1 mtu 0,192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}})
    2024-06-27T16:46:37.077 - INVOKE onProvisioningSuccess({{InterfaceName: eth1 LinkAddresses: [ fe80::b0be:3214:ee84:81f2/64,192.168.0.56/24 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ fe80::/64 -> :: eth1 mtu 0,192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}})
    2024-06-27T16:46:37.134 - INVOKE onLinkPropertiesChange({{InterfaceName: eth1 LinkAddresses: [ fe80::b0be:3214:ee84:81f2/64,192.168.0.56/24 ] DnsAddresses: [ /192.168.0.1 ] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 Routes: [ 192.168.0.0/24 -> 0.0.0.0 eth1 mtu 0,0.0.0.0/0 -> 192.168.0.1 eth1 mtu 0 ]}})
  
  IpClient.eth1 connectivity packet log:
  
  Debug with python and scapy via:
  shell$ python
  >>> from scapy import all as scapy
  >>> scapy.Ether("<paste_hex_string>".decode("hex")).show2()
  
    2024-06-27T16:49:20.401 - RX 04:f9:f8:72:b5:ec > ff:ff:ff:ff:ff:ff arp who-has 192.168.1.1
    [FFFFFFFFFFFF04F9F872B5EC0806000108000604000104F9F872B5ECC0A80016000000000000C0A80101000000000000000000000000000000000000]
    2024-06-27T16:49:21.451 - RX 04:f9:f8:72:b5:ec > ff:ff:ff:ff:ff:ff arp who-has 192.168.0.8
    [FFFFFFFFFFFF04F9F872B5EC0806000108000604000104F9F872B5ECC0A80016000000000000C0A80008000000000000000000000000000000000000]
    2024-06-27T16:49:22.501 - RX 04:f9:f8:72:b5:ec > ff:ff:ff:ff:ff:ff arp who-has 192.168.0.231
    [FFFFFFFFFFFF04F9F872B5EC0806000108000604000104F9F872B5ECC0A80016000000000000C0A800E7000000000000000000000000000000000000]

Other IpClient logs:

Validation logs (most recent first):
101 - ec:0a:81:96:f0:b4
  2024-06-27T16:46:37.172 - Validation disabled.
100 - ec:0a:81:96:f0:b4
  2024-06-27T16:46:35.237 - Validation disabled.

useNeighborResource: false

```

## dumpsys netd

```txt

ppid:1 -> pid:423 -> tid:423
total running time: 0d0h6m59s699ms (419699ms)
user: 0s64ms sys: 0s100ms
maxrss: 9044kB


  NetworkController
    Default network: 101

    Networks:
      51 DUMMY dummy0

      52 UNREACHABLE

      99 LOCAL

      101 PHYSICAL eth1
        Required permission: NONE


    Interface <-> last network map:
      Ifindex: 9 NetId: 101

    Interface addresses:
      address: 192.168.0.56/24 ifindices: [9]
      address: fe80::b0be:3214:ee84:81f2/64 ifindices: [9]

  TrafficController

    mCookieTagMap status: OK
    mUidCounterSetMap status: OK
    mAppUidStatsMap status: OK
    mStatsMapA status: OK
    mStatsMapB status: OK
    mIfaceIndexNameMap status: OK
    mIfaceStatsMap status: OK
    mConfigurationMap status: OK
    mUidOwnerMap status: OK

    Cgroup ingress program status: OK
    Cgroup egress program status: OK
    xt_bpf ingress program status: OK
    xt_bpf egress program status: OK
    xt_bpf bandwidth allowlist program status: OK
    xt_bpf bandwidth denylist program status: OK

  XfrmController
    XFRM-I support: 1

  ClatdController
    Trackers: iif[iface] nat64Prefix v6Addr -> v4Addr v4iif[v4iface] [fwmark]
    BPF ingress map: iif(iface) nat64Prefix v6Addr -> v4Addr oif(iface)
    BPF egress map: iif(iface) v4Addr -> v6Addr nat64Prefix oif(iface)

  TetherController
    Forwarding requests: 
    Interface pairs:

    Log:
      06-27 16:46:30.377 netd 1.0 starting
      06-27 16:46:30.387 Pid file removed
      06-27 16:46:30.387 SIGPIPE is blocked
      06-27 16:46:30.387 setCloseOnExec(dnsproxyd)
      06-27 16:46:30.387 setCloseOnExec(fwmarkd)
      06-27 16:46:30.387 setCloseOnExec(mdns)
      06-27 16:46:30.387 BPF programs are loaded
      06-27 16:46:30.387 NetlinkManager instanced
      06-27 16:46:30.387 enter NetworkController ctor
      06-27 16:46:30.388 leave NetworkController ctor
      06-27 16:46:30.388 enter TetherController ctor
      06-27 16:46:30.388 leave TetherController ctor
      06-27 16:46:30.417 Creating child chains: 26958us
      06-27 16:46:30.417 Setting up OEM hooks: 82us
      06-27 16:46:30.417 Setting up FirewallController hooks: 221us
      06-27 16:46:30.418 Setting up TetherController hooks: 1155us
      06-27 16:46:30.419 Setting up BandwidthController hooks: 698us
      06-27 16:46:30.419 Setting up IdletimerController hooks: 21us
      06-27 16:46:30.420 Setting up StrictController hooks: 1277us
      06-27 16:46:30.420 Initializing ClatdController: 60us
      06-27 16:46:30.421 Initializing traffic control: 448us
      06-27 16:46:30.423 Enabling bandwidth control: 2451us
      06-27 16:46:30.435 Initializing RouteController: 11325us
      06-27 16:46:30.500 Initializing XfrmController: 65145us
      06-27 16:46:30.502 Registering NetdNativeService: 259us
      06-27 16:46:30.504 Registering NetdHwService: 1517us
      06-27 16:46:30.504 Netd started in 127145us
      06-27 16:46:33.537 registerUnsolicitedEventListener() <0.05ms>
      06-27 16:46:33.697 registerUnsolicitedEventListener() <0.01ms>
      06-27 16:46:33.904 registerUnsolicitedEventListener() <0.01ms>
      06-27 16:46:33.915 interfaceGetList() -> {[ip6tnl0, ip_vti0, wlan0, eth1, can0, sit0, usb0, dummy0, eth0, lo, p2p0, ip6_vti0]} <0.14ms>
      06-27 16:46:33.916 NetdNativeService::interfaceGetCfg(eth1) -> ({eth1, ec:0a:81:96:f0:b4, 0.0.0.0, 0, down, broadcast, multicast}) (0.2ms)
      06-27 16:46:33.916 interfaceGetCfg(eth1) -> {InterfaceConfigurationParcel{ifName: eth1, hwAddr: ec:0a:81:96:f0:b4, ipv4Addr: 0.0.0.0, prefixLength: 0, flags: [down, broadcast, multicast]}} <0.24ms>
      06-27 16:46:33.972 NetdNativeService::interfaceSetCfg({eth1, ec:0a:81:96:f0:b4, 0.0.0.0, 0, broadcast, multicast, up}) (6e+01ms)
      06-27 16:46:33.972 interfaceSetCfg(InterfaceConfigurationParcel{ifName: eth1, hwAddr: ec:0a:81:96:f0:b4, ipv4Addr: 0.0.0.0, prefixLength: 0, flags: [broadcast, multicast, up]}) <56.20ms>
      06-27 16:46:33.973 NetdNativeService::interfaceGetCfg(eth1) -> ({eth1, ec:0a:81:96:f0:b4, 0.0.0.0, 0, up, broadcast, multicast}) (0.2ms)
      06-27 16:46:33.973 interfaceGetCfg(eth1) -> {InterfaceConfigurationParcel{ifName: eth1, hwAddr: ec:0a:81:96:f0:b4, ipv4Addr: 0.0.0.0, prefixLength: 0, flags: [up, broadcast, multicast]}} <0.21ms>
      06-27 16:46:34.216 firewallSetFirewallType(1) <0.01ms>
      06-27 16:46:34.217 isAlive() -> {true} <0.01ms>
      06-27 16:46:34.224 firewallReplaceUidChain(fw_standby, false, []) -> {true} <0.02ms>
      06-27 16:46:34.249 trafficSwapActiveStatsMap() <24.60ms>
      06-27 16:46:34.250 firewallReplaceUidChain(fw_standby, false, []) -> {true} <19.61ms>
      06-27 16:46:34.250 firewallEnableChildChain(2, true) <0.02ms>
      06-27 16:46:34.251 tetherGetStats() -> {[]} <0.73ms>
      06-27 16:46:34.251 socketDestroy([], []) <0.88ms>
      06-27 16:46:34.253 bandwidthSetGlobalAlert(2097152) <0.91ms>
      06-27 16:46:34.256 networkSetPermissionForUser(1, [10052, 1002, 10044, 10030]) <0.00ms>
      06-27 16:46:34.256 networkSetPermissionForUser(2, [2000, 10032, 10003, 10035, 1000, 1001, 10026]) <0.00ms>
      06-27 16:46:34.256 trafficSetNetPermForUids(12, [1000, 1001, 1002, 1013, 2000, 10003]) <0.01ms>
      06-27 16:46:34.256 trafficSetNetPermForUids(4, [10004, 10007, 10008, 10009, 10013, 10016, 10017, 10022, 10023, 10026, 10028, 10030, 10032, 10037, 10038, 10039, 10047, 10052]) <0.03ms>
      06-27 16:46:34.256 trafficSetNetPermForUids(8, [1041, 1047, 10050]) <0.00ms>
      06-27 16:46:34.257 trafficSetNetPermForUids(0, [1068, 1073, 10000, 10001, 10002, 10005, 10006, 10010, 10011, 10012, 10014, 10015, 10018, 10019, 10020, 10021, 10024, 10025, 10027, 10029, 10031, 10033, 10034, 10035, 10036, 10040, 10041, 10042, 10043, 10044, 10045, 10046, 10048, 10049, 10051]) <0.03ms>
      06-27 16:46:34.257 registerUnsolicitedEventListener() <0.35ms>
      06-27 16:46:34.326 trafficSwapActiveStatsMap() <25.79ms>
      06-27 16:46:34.328 tetherGetStats() -> {[]} <0.74ms>
      06-27 16:46:34.363 trafficSwapActiveStatsMap() <24.58ms>
      06-27 16:46:34.364 tetherGetStats() -> {[]} <0.73ms>
      06-27 16:46:34.400 trafficSwapActiveStatsMap() <32.53ms>
      06-27 16:46:34.401 tetherGetStats() -> {[]} <0.36ms>
      06-27 16:46:34.426 trafficSwapActiveStatsMap() <23.67ms>
      06-27 16:46:34.427 tetherGetStats() -> {[]} <0.35ms>
      06-27 16:46:34.463 trafficSwapActiveStatsMap() <33.75ms>
      06-27 16:46:34.464 tetherGetStats() -> {[]} <0.34ms>
      06-27 16:46:34.496 trafficSwapActiveStatsMap() <30.11ms>
      06-27 16:46:34.497 tetherGetStats() -> {[]} <0.58ms>
      06-27 16:46:34.529 trafficSwapActiveStatsMap() <26.84ms>
      06-27 16:46:34.530 tetherGetStats() -> {[]} <0.36ms>
      06-27 16:46:34.586 trafficSwapActiveStatsMap() <53.42ms>
      06-27 16:46:34.588 tetherGetStats() -> {[]} <0.99ms>
      06-27 16:46:34.620 trafficSwapActiveStatsMap() <28.95ms>
      06-27 16:46:34.620 tetherGetStats() -> {[]} <0.33ms>
      06-27 16:46:34.653 trafficSwapActiveStatsMap() <30.30ms>
      06-27 16:46:34.653 tetherGetStats() -> {[]} <0.32ms>
      06-27 16:46:34.676 trafficSwapActiveStatsMap() <20.56ms>
      06-27 16:46:34.678 tetherGetStats() -> {[]} <0.77ms>
      06-27 16:46:34.709 trafficSwapActiveStatsMap() <29.61ms>
      06-27 16:46:34.711 tetherGetStats() -> {[]} <0.81ms>
      06-27 16:46:34.740 trafficSwapActiveStatsMap() <26.88ms>
      06-27 16:46:34.741 tetherGetStats() -> {[]} <0.72ms>
      06-27 16:46:34.776 trafficSwapActiveStatsMap() <32.81ms>
      06-27 16:46:34.778 tetherGetStats() -> {[]} <0.74ms>
      06-27 16:46:34.806 trafficSwapActiveStatsMap() <25.83ms>
      06-27 16:46:34.808 tetherGetStats() -> {[]} <0.73ms>
      06-27 16:46:34.929 registerUnsolicitedEventListener() <0.02ms>
      06-27 16:46:34.999 registerUnsolicitedEventListener() <0.02ms>
      06-27 16:46:35.185 interfaceSetEnableIPv6(eth1, false) <0.25ms>
      06-27 16:46:35.185 interfaceClearAddrs(eth1) <0.28ms>
      06-27 16:46:35.186 interfaceGetList() -> {[ip6tnl0, ip_vti0, wlan0, eth1, can0, sit0, usb0, dummy0, eth0, lo, p2p0, ip6_vti0]} <0.10ms>
      06-27 16:46:35.186 NetdNativeService::interfaceGetCfg(eth0) -> ({eth0, 8e:90:63:2f:4b:68, 0.0.0.0, 0, down, broadcast, multicast}) (0.1ms)
      06-27 16:46:35.186 interfaceGetCfg(eth0) -> {InterfaceConfigurationParcel{ifName: eth0, hwAddr: 8e:90:63:2f:4b:68, ipv4Addr: 0.0.0.0, prefixLength: 0, flags: [down, broadcast, multicast]}} <0.17ms>
      06-27 16:46:35.192 NetdNativeService::interfaceSetCfg({eth0, 8e:90:63:2f:4b:68, 0.0.0.0, 0, broadcast, up, multicast}) (5ms)
      06-27 16:46:35.192 interfaceSetCfg(InterfaceConfigurationParcel{ifName: eth0, hwAddr: 8e:90:63:2f:4b:68, ipv4Addr: 0.0.0.0, prefixLength: 0, flags: [broadcast, up, multicast]}) <5.45ms>
      06-27 16:46:35.198 interfaceSetIPv6PrivacyExtensions(eth1, true) <0.15ms>
      06-27 16:46:35.198 setIPv6AddrGenMode(eth1, 2) <0.17ms>
      06-27 16:46:35.198 interfaceSetEnableIPv6(eth1, true) <0.04ms>
      06-27 16:46:35.198 NetdNativeService::interfaceSetCfg({eth1, , 192.168.0.56, 24}) (0.3ms)
      06-27 16:46:35.199 interfaceSetCfg(InterfaceConfigurationParcel{ifName: eth1, hwAddr: , ipv4Addr: 192.168.0.56, prefixLength: 24, flags: []}) <0.31ms>
      06-27 16:46:35.202 getFwmarkForNetwork(100) -> {MarkMaskParcel{mark: 100, mask: 65535}} <0.00ms>
      06-27 16:46:35.206 networkCreate(NativeNetworkConfig{netId: 100, networkType: PHYSICAL, permission: 0, secure: false, vpnType: -1}) <0.03ms>
      06-27 16:46:35.207 createNetworkCache(100) <0.37ms>
      06-27 16:46:35.208 DnsResolverService::setResolverConfiguration(100, [192.168.0.1], [], 1800, 25, 8, 64, 0, 0, "", [192.168.0.1]) -> (0) (0.3ms)
      06-27 16:46:35.208 setResolverConfiguration(ResolverParamsParcel{netId: 100, sampleValiditySeconds: 1800, successThreshold: 25, minSamples: 8, maxSamples: 64, baseTimeoutMsec: 0, retryCount: 0, servers: [192.168.0.1], domains: [], tlsName: , tlsServers: [192.168.0.1], tlsFingerprints: [], caCertificate: , tlsConnectTimeoutMs: 0, resolverOptions: (null), transportTypes: [3]}) <0.37ms>
      06-27 16:46:35.211 networkAddInterface(100, eth1) <2.01ms>
      06-27 16:46:35.212 networkAddRouteParcel(100, RouteInfoParcel{destination: 192.168.0.0/24, ifName: eth1, nextHop: , mtu: 0}) <0.18ms>
      06-27 16:46:35.212 networkAddRouteParcel(100, RouteInfoParcel{destination: 0.0.0.0/0, ifName: eth1, nextHop: 192.168.0.1, mtu: 0}) <0.07ms>
      06-27 16:46:35.212 DnsResolverService::setResolverConfiguration(100, [192.168.0.1], [], 1800, 25, 8, 64, 0, 0, "", [192.168.0.1]) -> (0) (0.2ms)
      06-27 16:46:35.212 setResolverConfiguration(ResolverParamsParcel{netId: 100, sampleValiditySeconds: 1800, successThreshold: 25, minSamples: 8, maxSamples: 64, baseTimeoutMsec: 0, retryCount: 0, servers: [192.168.0.1], domains: [], tlsName: , tlsServers: [192.168.0.1], tlsFingerprints: [], caCertificate: , tlsConnectTimeoutMs: 0, resolverOptions: (null), transportTypes: [3]}) <0.31ms>
      06-27 16:46:35.233 trafficSwapActiveStatsMap() <19.34ms>
      06-27 16:46:35.234 tetherGetStats() -> {[]} <0.81ms>
      06-27 16:46:35.236 networkSetDefault(100) <0.08ms>
      06-27 16:46:35.236 setTcpRWmemorySize(524288 1048576 3145728, 524288 1048576 2097152) <0.07ms>
      06-27 16:46:35.266 trafficSwapActiveStatsMap() <29.34ms>
      06-27 16:46:35.267 tetherGetStats() -> {[]} <0.31ms>
      06-27 16:46:35.273 DnsResolverService::setResolverConfiguration(100, [192.168.0.1], [], 1800, 25, 8, 64, 0, 0, "", [192.168.0.1]) -> (0) (0.04ms)
      06-27 16:46:35.273 setResolverConfiguration(ResolverParamsParcel{netId: 100, sampleValiditySeconds: 1800, successThreshold: 25, minSamples: 8, maxSamples: 64, baseTimeoutMsec: 0, retryCount: 0, servers: [192.168.0.1], domains: [], tlsName: , tlsServers: [192.168.0.1], tlsFingerprints: [], caCertificate: , tlsConnectTimeoutMs: 0, resolverOptions: (null), transportTypes: [3]}) <0.07ms>
      06-27 16:46:36.402 firewallReplaceUidChain(fw_standby, false, []) -> {true} <0.02ms>
      06-27 16:46:36.403 firewallEnableChildChain(2, false) <0.01ms>
      06-27 16:46:37.032 networkAddRouteParcel(100, RouteInfoParcel{destination: fe80::/64, ifName: eth1, nextHop: , mtu: 0}) <0.11ms>
      06-27 16:46:37.059 trafficSwapActiveStatsMap() <26.55ms>
      06-27 16:46:37.061 tetherGetStats() -> {[]} <0.38ms>
      06-27 16:46:37.068 interfaceSetEnableIPv6(eth1, false) <0.14ms>
      06-27 16:46:37.069 interfaceClearAddrs(eth1) <0.31ms>
      06-27 16:46:37.069 setProcSysNet(6, 1, eth1, accept_ra, 2) <0.06ms>
      06-27 16:46:37.071 interfaceSetEnableIPv6(eth1, false) <0.08ms>
      06-27 16:46:37.071 interfaceClearAddrs(eth1) <0.23ms>
      06-27 16:46:37.074 interfaceSetIPv6PrivacyExtensions(eth1, true) <0.09ms>
      06-27 16:46:37.075 setIPv6AddrGenMode(eth1, 2) <0.04ms>
      06-27 16:46:37.075 interfaceSetEnableIPv6(eth1, true) <0.08ms>
      06-27 16:46:37.075 NetdNativeService::interfaceSetCfg({eth1, , 192.168.0.56, 24}) (0.3ms)
      06-27 16:46:37.075 interfaceSetCfg(InterfaceConfigurationParcel{ifName: eth1, hwAddr: , ipv4Addr: 192.168.0.56, prefixLength: 24, flags: []}) <0.33ms>
      06-27 16:46:37.078 getFwmarkForNetwork(101) -> {MarkMaskParcel{mark: 101, mask: 65535}} <0.00ms>
      06-27 16:46:37.086 trafficSwapActiveStatsMap() <22.66ms>
      06-27 16:46:37.087 tetherGetStats() -> {[]} <0.33ms>
      06-27 16:46:37.126 trafficSwapActiveStatsMap() <34.68ms>
      06-27 16:46:37.127 tetherGetStats() -> {[]} <0.32ms>
      06-27 16:46:37.133 networkDestroy(100) <1.15ms>
      06-27 16:46:37.133 destroyNetworkCache(100) <0.04ms>
      06-27 16:46:37.134 networkCreate(NativeNetworkConfig{netId: 101, networkType: PHYSICAL, permission: 0, secure: false, vpnType: -1}) <0.01ms>
      06-27 16:46:37.134 createNetworkCache(101) <0.04ms>
      06-27 16:46:37.136 DnsResolverService::setResolverConfiguration(101, [192.168.0.1], [], 1800, 25, 8, 64, 0, 0, "", [192.168.0.1]) -> (0) (0.1ms)
      06-27 16:46:37.136 setResolverConfiguration(ResolverParamsParcel{netId: 101, sampleValiditySeconds: 1800, successThreshold: 25, minSamples: 8, maxSamples: 64, baseTimeoutMsec: 0, retryCount: 0, servers: [192.168.0.1], domains: [], tlsName: , tlsServers: [192.168.0.1], tlsFingerprints: [], caCertificate: , tlsConnectTimeoutMs: 0, resolverOptions: (null), transportTypes: [3]}) <0.16ms>
      06-27 16:46:37.137 networkAddInterface(101, eth1) <1.19ms>
      06-27 16:46:37.138 networkAddRouteParcel(101, RouteInfoParcel{destination: fe80::/64, ifName: eth1, nextHop: , mtu: 0}) <0.08ms>
      06-27 16:46:37.138 networkAddRouteParcel(101, RouteInfoParcel{destination: 192.168.0.0/24, ifName: eth1, nextHop: , mtu: 0}) <0.04ms>
      06-27 16:46:37.138 networkAddRouteParcel(101, RouteInfoParcel{destination: 0.0.0.0/0, ifName: eth1, nextHop: 192.168.0.1, mtu: 0}) <0.04ms>
      06-27 16:46:37.139 DnsResolverService::setResolverConfiguration(101, [192.168.0.1], [], 1800, 25, 8, 64, 0, 0, "", [192.168.0.1]) -> (0) (0.1ms)
      06-27 16:46:37.139 setResolverConfiguration(ResolverParamsParcel{netId: 101, sampleValiditySeconds: 1800, successThreshold: 25, minSamples: 8, maxSamples: 64, baseTimeoutMsec: 0, retryCount: 0, servers: [192.168.0.1], domains: [], tlsName: , tlsServers: [192.168.0.1], tlsFingerprints: [], caCertificate: , tlsConnectTimeoutMs: 0, resolverOptions: (null), transportTypes: [3]}) <0.13ms>
      06-27 16:46:37.170 trafficSwapActiveStatsMap() <29.25ms>
      06-27 16:46:37.170 tetherGetStats() -> {[]} <0.34ms>
      06-27 16:46:37.172 networkSetDefault(101) <0.07ms>
      06-27 16:46:37.213 trafficSwapActiveStatsMap() <39.49ms>
      06-27 16:46:37.213 tetherGetStats() -> {[]} <0.33ms>
      06-27 16:46:37.219 DnsResolverService::setResolverConfiguration(101, [192.168.0.1], [], 1800, 25, 8, 64, 0, 0, "", [192.168.0.1]) -> (0) (0.1ms)
      06-27 16:46:37.219 setResolverConfiguration(ResolverParamsParcel{netId: 101, sampleValiditySeconds: 1800, successThreshold: 25, minSamples: 8, maxSamples: 64, baseTimeoutMsec: 0, retryCount: 0, servers: [192.168.0.1], domains: [], tlsName: , tlsServers: [192.168.0.1], tlsFingerprints: [], caCertificate: , tlsConnectTimeoutMs: 0, resolverOptions: (null), transportTypes: [3]}) <0.14ms>
      06-27 16:46:38.029 bandwidthAddNiceApp(10003) <0.05ms>
      06-27 16:47:20.193 trafficSwapActiveStatsMap() <29.71ms>
      06-27 16:47:20.194 tetherGetStats() -> {[]} <0.37ms>
      06-27 16:47:20.195 bandwidthSetGlobalAlert(2097152) <0.12ms>
      06-27 16:52:59.929 isAlive() -> {true} <0.00ms>

    UnsolicitedLog:
      06-27 16:46:33.849 onInterfaceAdded(usb0) (0.1ms)
      06-27 16:46:33.849 onInterfaceAdded(usb0) (0.03ms)
      06-27 16:46:33.849 onInterfaceLinkStateChanged(usb0, false) (0.05ms)
      06-27 16:46:33.849 onInterfaceLinkStateChanged(usb0, false) (0.02ms)
      06-27 16:46:33.972 onInterfaceLinkStateChanged(eth1, false) (0.05ms)
      06-27 16:46:33.973 onInterfaceLinkStateChanged(eth1, false) (0.02ms)
      06-27 16:46:33.973 onInterfaceLinkStateChanged(eth1, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.1ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.03ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.03ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.192 onInterfaceLinkStateChanged(eth0, false) (0.02ms)
      06-27 16:46:35.199 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.04ms)
      06-27 16:46:35.199 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:35.199 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:35.199 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:35.199 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:37.030 onRouteChanged(true, fe80::/64, "", eth1) (0.1ms)
      06-27 16:46:37.030 onRouteChanged(true, fe80::/64, "", eth1) (0.03ms)
      06-27 16:46:37.030 onRouteChanged(true, fe80::/64, "", eth1) (0.03ms)
      06-27 16:46:37.030 onRouteChanged(true, fe80::/64, "", eth1) (0.03ms)
      06-27 16:46:37.030 onRouteChanged(true, fe80::/64, "", eth1) (0.03ms)
      06-27 16:46:37.030 onInterfaceLinkStateChanged(eth1, true) (0.02ms)
      06-27 16:46:37.030 onInterfaceLinkStateChanged(eth1, true) (0.02ms)
      06-27 16:46:37.030 onInterfaceLinkStateChanged(eth1, true) (0.03ms)
      06-27 16:46:37.030 onInterfaceLinkStateChanged(eth1, true) (0.02ms)
      06-27 16:46:37.030 onInterfaceLinkStateChanged(eth1, true) (0.02ms)
      06-27 16:46:37.031 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.03ms)
      06-27 16:46:37.031 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.031 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.03ms)
      06-27 16:46:37.031 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.03ms)
      06-27 16:46:37.031 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.068 onRouteChanged(false, fe80::/64, "", eth1) (0.04ms)
      06-27 16:46:37.068 onRouteChanged(false, fe80::/64, "", eth1) (0.02ms)
      06-27 16:46:37.068 onRouteChanged(false, fe80::/64, "", eth1) (0.02ms)
      06-27 16:46:37.068 onRouteChanged(false, fe80::/64, "", eth1) (0.02ms)
      06-27 16:46:37.069 onRouteChanged(false, fe80::/64, "", eth1) (0.02ms)
      06-27 16:46:37.069 onInterfaceAddressRemoved(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.04ms)
      06-27 16:46:37.069 onInterfaceAddressRemoved(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.069 onInterfaceAddressRemoved(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.069 onInterfaceAddressRemoved(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.069 onInterfaceAddressRemoved(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.070 onInterfaceAddressRemoved(192.168.0.56/24, eth1, 128, 0) (0.04ms)
      06-27 16:46:37.070 onInterfaceAddressRemoved(192.168.0.56/24, eth1, 128, 0) (0.03ms)
      06-27 16:46:37.070 onInterfaceAddressRemoved(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:37.070 onInterfaceAddressRemoved(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:37.071 onInterfaceAddressRemoved(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:37.075 onRouteChanged(true, fe80::/64, "", eth1) (0.02ms)
      06-27 16:46:37.075 onRouteChanged(true, fe80::/64, "", eth1) (0.01ms)
      06-27 16:46:37.075 onRouteChanged(true, fe80::/64, "", eth1) (0.008ms)
      06-27 16:46:37.075 onRouteChanged(true, fe80::/64, "", eth1) (0.008ms)
      06-27 16:46:37.075 onRouteChanged(true, fe80::/64, "", eth1) (0.01ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.02ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.007ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.007ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.007ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2244, 253) (0.006ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.01ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.009ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.007ms)
      06-27 16:46:37.075 onInterfaceAddressUpdated(192.168.0.56/24, eth1, 128, 0) (0.02ms)
      06-27 16:46:37.133 onRouteChanged(false, fe80::/64, "", eth1) (0.03ms)
      06-27 16:46:37.133 onRouteChanged(false, fe80::/64, "", eth1) (0.01ms)
      06-27 16:46:37.133 onRouteChanged(false, fe80::/64, "", eth1) (0.009ms)
      06-27 16:46:37.133 onRouteChanged(false, fe80::/64, "", eth1) (0.008ms)
      06-27 16:46:37.133 onRouteChanged(false, fe80::/64, "", eth1) (0.009ms)
      06-27 16:46:38.086 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2176, 253) (0.08ms)
      06-27 16:46:38.086 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2176, 253) (0.01ms)
      06-27 16:46:38.087 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2176, 253) (0.01ms)
      06-27 16:46:38.087 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2176, 253) (0.01ms)
      06-27 16:46:38.087 onInterfaceAddressUpdated(fe80::b0be:3214:ee84:81f2/64, eth1, 2176, 253) (0.008ms)


```




























