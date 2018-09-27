---
layout:     post
title:      dumpsys ethernet
subtitle:   EthernetService.java
date:       2018-09-27
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
    - debug
    - dumpsys
---

## dumpsys ethernet

### DHCP
Current Ethernet state: 
  Tracking interface: eth0
    MAC address: 0c:25:76:48:a5:9b
    Link state: up
  
  NetworkInfo: [type: Ethernet[], state: CONNECTED/CONNECTED, reason: (unspecified), extra: 0c:25:76:48:a5:9b, failover: false, available: true, roaming: false, metered: false]
  LinkProperties: {InterfaceName: eth0 LinkAddresses: [fe80::e25:76ff:fe48:a59b/64,172.16.3.111/22,]  Routes: [fe80::/64 -> :: eth0,172.16.0.0/22 -> 0.0.0.0 eth0,0.0.0.0/0 -> 172.16.0.1 eth0,] DnsAddresses: [202.96.209.133,202.96.209.5,] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 HttpProxy: [192.168.0.133] 8888 xl=test.api.sunmi.com }
  NetworkAgent: Handler (com.android.server.ethernet.EthernetNetworkFactory$1$2) {868f2c1}
  IpManager:
    APF dump:
      No apf support
    
    IpManager.eth0 StateMachine dump:
      09-27 19:48:23.417 - INVOKE setNeighborDiscoveryOffload(true)
      09-27 19:48:23.441 - CMD_UPDATE_HTTP_PROXY eth0/26 0 0 [192.168.0.133] 8888 xl=test.api.sunmi.com [rcvd_in=StoppedState, proc_in=StoppedState]
      09-27 19:48:23.443 - CMD_UPDATE_TCP_BUFFER_SIZES eth0/26 0 0 524288,1048576,3145728,524288,1048576,2097152 [rcvd_in=StoppedState, proc_in=StoppedState]
      09-27 19:48:23.445 - CMD_START eth0/26 0 0 ProvisioningConfiguration{mEnableIPv4: true, mEnableIPv6: true, mUsingIpReachabilityMonitor: true, mRequestedPreDhcpActionMs: 0, mStaticIpConfig: null, mApfCapabilities: null, mProvisioningTimeoutMs: 0} [rcvd_in=StoppedState, proc_in=StoppedState]
      09-27 19:48:23.446 - INVOKE setFallbackMulticastFilter(false)
      09-27 19:48:23.473 - INVOKE onLinkPropertiesChange({{InterfaceName: eth0 LinkAddresses: [fe80::e25:76ff:fe48:a59b/64,]  Routes: [fe80::/64 -> :: eth0,] DnsAddresses: [] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 HttpProxy: [192.168.0.133] 8888 xl=test.api.sunmi.com }})
      09-27 19:48:23.510 - CMD_PRE_DHCP_ACTION eth0/26 0 0 null [rcvd_in=RunningState, proc_in=RunningState]
      09-27 19:48:23.511 - EVENT_PRE_DHCP_ACTION_COMPLETE eth0/26 0 0 null [rcvd_in=RunningState, proc_in=RunningState]
      09-27 19:48:25.081 - INVOKE onNewDhcpResults({IP address 172.16.3.111/22 Gateway 172.16.0.1  DNS servers: [ 202.96.209.133 202.96.209.5 ] Domains  DHCP server /172.16.0.1 Vendor info null lease 86400 seconds})
      09-27 19:48:25.082 - INVOKE onLinkPropertiesChange({{InterfaceName: eth0 LinkAddresses: [fe80::e25:76ff:fe48:a59b/64,]  Routes: [fe80::/64 -> :: eth0,172.16.0.0/22 -> 0.0.0.0 eth0,0.0.0.0/0 -> 172.16.0.1 eth0,] DnsAddresses: [] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 HttpProxy: [192.168.0.133] 8888 xl=test.api.sunmi.com }})
      09-27 19:48:25.083 - CMD_POST_DHCP_ACTION eth0/26 1 0 IP address 172.16.3.111/22 Gateway 172.16.0.1  DNS servers: [ 202.96.209.133 202.96.209.5 ] Domains  DHCP server /172.16.0.1 Vendor info null lease 86400 seconds [rcvd_in=RunningState, proc_in=RunningState]
      09-27 19:48:25.094 - CMD_CONFIGURE_LINKADDRESS eth0/26 0 0 172.16.3.111/22 [rcvd_in=RunningState, proc_in=RunningState]
      09-27 19:48:25.101 - INVOKE onProvisioningSuccess({{InterfaceName: eth0 LinkAddresses: [fe80::e25:76ff:fe48:a59b/64,172.16.3.111/22,]  Routes: [fe80::/64 -> :: eth0,172.16.0.0/22 -> 0.0.0.0 eth0,0.0.0.0/0 -> 172.16.0.1 eth0,] DnsAddresses: [202.96.209.133,202.96.209.5,] Domains: null MTU: 0 TcpBufferSizes: 524288,1048576,3145728,524288,1048576,2097152 HttpProxy: [192.168.0.133] 8888 xl=test.api.sunmi.com }})

Stored Ethernet configuration: 
  IP assignment: DHCP
  Proxy settings: STATIC
  HTTP proxy: [192.168.0.133] 8888 xl=test.api.sunmi.com
  
Handler:
  EthernetServiceImplHandler (android.os.Handler) {1c68738} @ 33174870
  EthernetServiceImpl  Looper (EthernetServiceThread, tid 67) {c0ad311}
  EthernetServiceImpl    (Total messages: 0, polling=true, quitting=false)
  
### STATIC
  Current Ethernet state: 
  Tracking interface: eth0
    MAC address: 0c:25:76:48:a5:9b
    Link state: up
  
  NetworkInfo: [type: Ethernet[], state: CONNECTED/CONNECTED, reason: (unspecified), extra: 0c:25:76:48:a5:9b, failover: false, available: true, roaming: false, metered: false]
  LinkProperties: {InterfaceName: eth0 LinkAddresses: [172.16.3.111/22,]  Routes: [172.16.0.0/22 -> 0.0.0.0 eth0,0.0.0.0/0 -> 172.16.0.1 eth0,] DnsAddresses: [202.96.209.133,202.96.209.5,] Domains: null MTU: 0 HttpProxy: [192.168.0.133] 8888 xl=test.api.sunmi.com }
  NetworkAgent: Handler (com.android.server.ethernet.EthernetNetworkFactory$1$2) {c4ba80}

Stored Ethernet configuration: 
  IP assignment: STATIC
  Static configuration: IP address 172.16.3.111/22 Gateway 172.16.0.1  DNS servers: [ 202.96.209.133 202.96.209.5 ] Domains 
  Proxy settings: STATIC
  HTTP proxy: [192.168.0.133] 8888 xl=test.api.sunmi.com
  
Handler:
  EthernetServiceImplHandler (android.os.Handler) {1c68738} @ 32936295
  EthernetServiceImpl  Looper (EthernetServiceThread, tid 67) {c0ad311}
  EthernetServiceImpl    (Total messages: 0, polling=true, quitting=false)
  
