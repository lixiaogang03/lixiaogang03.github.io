---
layout:     post
title:      Android Iptables
subtitle:   Android network firewall
date:       2019-08-23
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Android
---

[linux网络基础知识-简书](https://www.jianshu.com/p/47baebc39923)

### Linux 网络协议栈

![linux_network](/images/network/linux_network.jpg)

### Socket

应用层的各种网络应用程序基本上都是通过 Linux Socket 编程接口来和内核空间的网络协议栈通信的。
Linux Socket 是从 BSD Socket 发展而来的，它是 Linux 操作系统的重要组成部分之一，它是网络应用程序的基础。
从层次上来说，它位于应用层，是操作系统为应用程序员提供的 API，通过它，应用程序可以访问传输层协议

1. socket 位于传输层协议之上，屏蔽了不同网络协议之间的差异
2. socket 是网络编程的入口，它提供了大量的系统调用，构成了网络程序的主体
3. 在Linux系统中，socket 属于文件系统的一部分，网络通信可以被看作是对文件的读取，使得我们对网络的控制和对文件的控制一样方便

### iptables 架构

1. 由iptables客户端调用命令来配置管理防火墙，最后相关请求发送到内核模块；内核模块用于组织iptables使用的表、链和规则。
2. iptables依赖netfilter来注册各种hooks实现对数据包的具体转发逻辑控制

![linux_iptables](/images/android/netd/linux_iptables.png)

### Iptable Setting

Netd是Android系统中专门负责网络管理和控制的后台daemon程序，其功能主要分三大块：

1. 设置防火墙（Firewall）、网络地址转换（NAT）、带宽控制、无线网卡软接入点（Soft Access Point）控制，网络设备绑定（Tether）等
2. Android系统中DNS信息的缓存和管理
3. 网络服务搜索（Net Service Discovery，简称NSD）功能，包括服务注册（Service Registration）、服务搜索（Service Browse）和服务名解析（Service Resolve）等


Netd的工作流程和Vold类似，其工作可分成两部分:
- Netd接收并处理来自Framework层中NetworkManagementService或NsdService的命令。这些命令最终由Netd中对应的Command对象去处理
- Net接收并解析来自Kernel的UEvent消息，然后再转发给Framework层中对应Service去处理

Netd位于Framework层和Kernel层之间，它是Android系统中网络相关消息和命令转发及处理的中枢模块

![android_netd](/images/android/netd/android_netd.png)

### 工作原理

1. 数据包从左边进入IP协议栈，进行IP校验以后，数据包被第一个钩子函数PRE_ROUTING处理，然后就进入路由模块，由其决定该数据包是转发出去还是送给本机
2. 若该数据包是送给本机的，则要经过钩子函数LOCAL_IN处理后传递给本机的上层协议
3. 若该数据包应该被转发，则它将被钩子函数FORWARD处理，然后还要经钩子函数POST_ROUTING处理后才能传输到网络
4. 本机进程产生的数据包要先经过钩子函数LOCAL_OUT处理后，再进行路由选择处理，然后经过钩子函数POST_ROUTING处理后再发送到网络

![iptables_principle](/images/android/netd/iptables_principle.png)

### 规则

![iptables_rule](/images/android/netd/iptables_rule.png)

### iptables 命令格式

![iptables_rule_format](/images/android/netd/iptables_rule_format.png)

添加一条规则: drop掉源为10.24.67.97的icmp报文

> iptables -A INPUT -p icmp -s 10.24.67.97 -j DROP

删除一条规则

> iptables -D INPUT -p icmp -s 10.24.67.97 -j DROP

### android iptables -h

```txt

V2:/ $ iptables -h

iptables v1.4.20

Usage: iptables -[ACD] chain rule-specification [options]
       iptables -I chain [rulenum] rule-specification [options]
       iptables -R chain rulenum rule-specification [options]
       iptables -D chain rulenum [options]
       iptables -[LS] [chain [rulenum]] [options]
       iptables -[FZ] [chain] [options]
       iptables -[NX] chain
       iptables -E old-chain-name new-chain-name
       iptables -P chain target [options]
       iptables -h (print this help information)

Commands:
Either long or short options are allowed.
  --append  -A chain		Append to chain
  --check   -C chain		Check for the existence of a rule
  --delete  -D chain		Delete matching rule from chain
  --delete  -D chain rulenum
				Delete rule rulenum (1 = first) from chain
  --insert  -I chain [rulenum]
				Insert in chain as rulenum (default 1=first)
  --replace -R chain rulenum
				Replace rule rulenum (1 = first) in chain
  --list    -L [chain [rulenum]]
				List the rules in a chain or all chains
  --list-rules -S [chain [rulenum]]
				Print the rules in a chain or all chains
  --flush   -F [chain]		Delete all rules in  chain or all chains
  --zero    -Z [chain [rulenum]]
				Zero counters in chain or all chains
  --new     -N chain		Create a new user-defined chain
  --delete-chain
            -X [chain]		Delete a user-defined chain
  --policy  -P chain target
				Change policy on chain to target
  --rename-chain
            -E old-chain new-chain
				Change chain name, (moving any references)
Options:
    --ipv4	-4		Nothing (line is ignored by ip6tables-restore)
    --ipv6	-6		Error (line is ignored by iptables-restore)
[!] --protocol	-p proto	protocol: by number or name, eg. `tcp'
[!] --source	-s address[/mask][...]
				source specification
[!] --destination -d address[/mask][...]
				destination specification
[!] --in-interface -i input name[+]
				network interface name ([+] for wildcard)
 --jump	-j target
				target for rule (may load target extension)
  --goto      -g chain
                              jump to chain with no return
  --match	-m match
				extended match (may load extension)
  --numeric	-n		numeric output of addresses and ports
[!] --out-interface -o output name[+]
				network interface name ([+] for wildcard)
  --table	-t table	table to manipulate (default: `filter')
  --verbose	-v		verbose mode
  --wait	-w		wait for the xtables lock
  --line-numbers		print line numbers when listing
  --exact	-x		expand numbers (display exact values)
[!] --fragment	-f		match second or further fragments only
  --modprobe=<command>		try to insert modules using this command
  --set-counters PKTS BYTES	set the counter during insert/append
[!] --version	-V		print package version.

```

### Framework Interface

NPMS是网络策略管理服务。收费网络（Metered Network）判定和处理策略；Power Save/Device Idle情况下对APP的网络限制策略，这些策略一般指对APP的网络和限制和放行，通过netfilter来实现

```java

/**
 * Service that maintains low-level network policy rules, using
 * {@link NetworkStatsService} statistics to drive those rules.
 * <p>
 * Derives active rules by combining a given policy with other system status,
 * and delivers to listeners, such as {@link ConnectivityManager}, for
 * enforcement.
 *
 * <p>
 * This class uses 2-3 locks to synchronize state:
 * <ul>
 * <li>{@code mUidRulesFirstLock}: used to guard state related to individual UIDs (such as firewall
 * rules).
 * <li>{@code mNetworkPoliciesSecondLock}: used to guard state related to network interfaces (such
 * as network policies).
 * <li>{@code allLocks}: not a "real" lock, but an indication (through @GuardedBy) that all locks
 * must be held.
 * </ul>
 *
 * <p>
 * As such, methods that require synchronization have the following prefixes:
 * <ul>
 * <li>{@code UL()}: require the "UID" lock ({@code mUidRulesFirstLock}).
 * <li>{@code NL()}: require the "Network" lock ({@code mNetworkPoliciesSecondLock}).
 * <li>{@code AL()}: require all locks, which must be obtained in order ({@code mUidRulesFirstLock}
 * first, then {@code mNetworkPoliciesSecondLock}, then {@code mYetAnotherGuardThirdLock}, etc..
 * </ul>
 */
public class NetworkPolicyManagerService extends INetworkPolicyManager.Stub {

    static final String TAG = "NetworkPolicy";

    @Override
    public void setUidPolicy(int uid, int policy) {
        mContext.enforceCallingOrSelfPermission(MANAGE_NETWORK_POLICY, TAG);

        if (!UserHandle.isApp(uid)) {
            throw new IllegalArgumentException("cannot apply policy to UID " + uid);
        }
        synchronized (mUidRulesFirstLock) {
            final long token = Binder.clearCallingIdentity();
            try {
                final int oldPolicy = mUidPolicy.get(uid, POLICY_NONE);
                if (oldPolicy != policy) {
                    setUidPolicyUncheckedUL(uid, oldPolicy, policy, true);
                }
            } finally {
                Binder.restoreCallingIdentity(token);
            }
        }
    }

    @Override
    public void setNetworkPolicies(NetworkPolicy[] policies) {
        mContext.enforceCallingOrSelfPermission(MANAGE_NETWORK_POLICY, TAG);

        final long token = Binder.clearCallingIdentity();
        try {
            maybeRefreshTrustedTime();
            synchronized (mUidRulesFirstLock) {
                synchronized (mNetworkPoliciesSecondLock) {
                    normalizePoliciesNL(policies);
                    updateNetworkEnabledNL();
                    updateNetworkRulesNL();
                    updateNotificationsNL();
                    writePolicyAL();
                }
            }
        } finally {
            Binder.restoreCallingIdentity(token);
        }
    }

}

```

### dumpsys netpolicy --- data/system/netpolicy.xml

```xml

<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<policy-list version="10" restrictBackground="false">
<network-policy networkTemplate="1" subscriberId="460110137747172" cycleDay="20" cycleTimezone="Asia/Shanghai" warningBytes="2147483648" limitBytes="-1" lastWarningSnooze="-1" lastLimitSnooze="-1" metered="true" inferred="true" />
<network-policy networkTemplate="1" subscriberId="460040239900971" cycleDay="20" cycleTimezone="Asia/Shanghai" warningBytes="2147483648" limitBytes="-1" lastWarningSnooze="-1" lastLimitSnooze="-1" metered="true" inferred="true" />
<network-policy networkTemplate="1" cycleDay="20" cycleTimezone="Asia/Shanghai" warningBytes="2147483648" limitBytes="-1" lastWarningSnooze="-1" lastLimitSnooze="-1" metered="true" inferred="true" />
<network-policy networkTemplate="1" subscriberId="460040834361206" cycleDay="20" cycleTimezone="Asia/Shanghai" warningBytes="2147483648" limitBytes="-1" lastWarningSnooze="-1" lastLimitSnooze="-1" metered="true" inferred="true" />
</policy-list>
<whitelist>
<restrict-background uid="10008" />
<restrict-background uid="10027" />
<restrict-background uid="10091" />
</whitelist>

```




