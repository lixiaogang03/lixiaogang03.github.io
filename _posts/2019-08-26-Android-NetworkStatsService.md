---
layout:     post
title:      Android NetworkStatsService
subtitle:   流量统计服务
date:       2019-08-26
author:     LXG
header-img: img/post-bg-e2e-ux.jpg
catalog: true
tags:
    - Android
---

[Android性能测试之网络流量-简书](https://www.jianshu.com/p/47e2f4540f29)

### NetworkTemplate

```java

/**
 * Template definition used to generically match {@link NetworkIdentity},
 * usually when collecting statistics.
 *
 * @hide
 */
public class NetworkTemplate implements Parcelable {


    /**
     * Template to match {@link ConnectivityManager#TYPE_MOBILE} networks with
     * the given IMSI.
     */
    public static NetworkTemplate buildTemplateMobileAll(String subscriberId) {
        return new NetworkTemplate(MATCH_MOBILE_ALL, subscriberId, null);
    }

}

```

### NetworkPolicyManager

```java

/**
 * Manager for creating and modifying network policy rules.
 *
 * {@hide}
 */
public class NetworkPolicyManager {

    public NetworkPolicy[] getNetworkPolicies() {
        try {
            return mService.getNetworkPolicies(mContext.getOpPackageName());
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }

}

```

### NetworkPolicy

```java

/**
 * Policy for networks matching a {@link NetworkTemplate}, including usage cycle
 * and limits to be enforced.
 *
 * @hide
 */
public class NetworkPolicy implements Parcelable, Comparable<NetworkPolicy> {

}

```

### NetworkStatsHistory

```java

/**
 * Collection of historical network statistics, recorded into equally-sized
 * "buckets" in time. Internally it stores data in {@code long} series for more
 * efficient persistence.
 * <p>
 * Each bucket is defined by a {@link #bucketStart} timestamp, and lasts for
 * {@link #bucketDuration}. Internally assumes that {@link #bucketStart} is
 * sorted at all times.
 *
 * @hide
 */
public class NetworkStatsHistory implements Parcelable {

    /** Path to {@code /proc/net/xt_qtaguid/iface_stat_all}. */
    private final File mStatsXtIfaceAll;
    /** Path to {@code /proc/net/xt_qtaguid/iface_stat_fmt}. */
    private final File mStatsXtIfaceFmt;
    /** Path to {@code /proc/net/xt_qtaguid/stats}. */
    private final File mStatsXtUid;

    public NetworkStatsFactory() {
        this(new File("/proc/"));
    }

    @VisibleForTesting
    public NetworkStatsFactory(File procRoot) {
        mStatsXtIfaceAll = new File(procRoot, "net/xt_qtaguid/iface_stat_all");
        mStatsXtIfaceFmt = new File(procRoot, "net/xt_qtaguid/iface_stat_fmt");
        mStatsXtUid = new File(procRoot, "net/xt_qtaguid/stats");
    }

}

```

### NetworkStatsService

```java

/**
 * Collect and persist detailed network statistics, and provide this data to
 * other system services.
 */
public class NetworkStatsService extends INetworkStatsService.Stub {

    private static final String TAG = "NetworkStats";

    @Override
    public INetworkStatsSession openSession() {
        return createSession(null, /* poll on create */ false);
    }

    private INetworkStatsSession createSession(final String callingPackage, boolean pollOnCreate) {
        assertBandwidthControlEnabled();

        if (pollOnCreate) {
            final long ident = Binder.clearCallingIdentity();
            try {
                performPoll(FLAG_PERSIST_ALL);
            } finally {
                Binder.restoreCallingIdentity(ident);
            }
        }

        // return an IBinder which holds strong references to any loaded stats
        // for its lifetime; when caller closes only weak references remain.

        return new INetworkStatsSession.Stub() { }

   }


    /**
     * Return network history, splicing between DEV and XT stats when
     * appropriate.
     */
    private NetworkStatsHistory internalGetHistoryForNetwork(NetworkTemplate template, int fields,
            @NetworkStatsAccess.Level int accessLevel) {
        // We've been using pure XT stats long enough that we no longer need to
        // splice DEV and XT together.
        return mXtStatsCached.getHistory(template, UID_ALL, SET_ALL, TAG_NONE, fields, accessLevel);
    }

}

/** {@hide} */
interface INetworkStatsSession {

    /** Return device aggregated network layer usage summary for traffic that matches template. */
    NetworkStats getDeviceSummaryForNetwork(in NetworkTemplate template, long start, long end);

    /** Return network layer usage summary for traffic that matches template. */
    NetworkStats getSummaryForNetwork(in NetworkTemplate template, long start, long end);

    /** Return historical network layer stats for traffic that matches template. */
    NetworkStatsHistory getHistoryForNetwork(in NetworkTemplate template, int fields);

    /** Return network layer usage summary per UID for traffic that matches template. */
    NetworkStats getSummaryForAllUid(in NetworkTemplate template, long start, long end, boolean includeTags);

    /** Return historical network layer stats for specific UID traffic that matches template. */
    NetworkStatsHistory getHistoryForUid(in NetworkTemplate template, int uid, int set, int tag, int fields);

    /** Return historical network layer stats for specific UID traffic that matches template. */
    NetworkStatsHistory getHistoryIntervalForUid(in NetworkTemplate template, int uid, int set, int tag, int fields, long start, long end);

    /** Return array of uids that have stats and are accessible to the calling user */
    int[] getRelevantUids();

    void close();

}

```

### NetworkPolicyManagerService

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
    public NetworkPolicy[] getNetworkPolicies(String callingPackage) {
        mContext.enforceCallingOrSelfPermission(MANAGE_NETWORK_POLICY, TAG);
        try {
            mContext.enforceCallingOrSelfPermission(READ_PRIVILEGED_PHONE_STATE, TAG);
            // SKIP checking run-time OP_READ_PHONE_STATE since caller or self has PRIVILEGED
            // permission
        } catch (SecurityException e) {
            mContext.enforceCallingOrSelfPermission(READ_PHONE_STATE, TAG);

            if (mAppOps.noteOp(AppOpsManager.OP_READ_PHONE_STATE, Binder.getCallingUid(),
                    callingPackage) != AppOpsManager.MODE_ALLOWED) {
                return new NetworkPolicy[0];
            }
        }

        synchronized (mNetworkPoliciesSecondLock) {
            final int size = mNetworkPolicy.size();
            final NetworkPolicy[] policies = new NetworkPolicy[size];
            for (int i = 0; i < size; i++) {
                policies[i] = mNetworkPolicy.valueAt(i);
            }
            return policies;
        }
    }

}

```

### NetworkStatsCollection

```java

/**
 * Collection of {@link NetworkStatsHistory}, stored based on combined key of
 * {@link NetworkIdentitySet}, UID, set, and tag. Knows how to persist itself.
 */
public class NetworkStatsCollection implements FileRotator.Reader {

    /**
     * Combine all {@link NetworkStatsHistory} in this collection which match
     * the requested parameters.
     */
    public NetworkStatsHistory getHistory(
            NetworkTemplate template, int uid, int set, int tag, int fields,
            @NetworkStatsAccess.Level int accessLevel) {
        return getHistory(template, uid, set, tag, fields, Long.MIN_VALUE, Long.MAX_VALUE,
                accessLevel);
    }

    /**
     * Combine all {@link NetworkStatsHistory} in this collection which match
     * the requested parameters.
     */
    public NetworkStatsHistory getHistory(
            NetworkTemplate template, int uid, int set, int tag, int fields, long start, long end,
            @NetworkStatsAccess.Level int accessLevel, int callerUid) {
        if (!NetworkStatsAccess.isAccessibleToUser(uid, callerUid, accessLevel)) {
            throw new SecurityException("Network stats history of uid " + uid
                    + " is forbidden for caller " + callerUid);
        }

        final NetworkStatsHistory combined = new NetworkStatsHistory(
                mBucketDuration, start == end ? 1 : estimateBuckets(), fields);

        // shortcut when we know stats will be empty
        if (start == end) return combined;

        for (int i = 0; i < mStats.size(); i++) {
            final Key key = mStats.keyAt(i);
            if (key.uid == uid && NetworkStats.setMatches(set, key.set) && key.tag == tag
                    && templateMatches(template, key.ident)) {
                final NetworkStatsHistory value = mStats.valueAt(i);
                combined.recordHistory(value, start, end);
            }
        }
        return combined;
    }

}

```

### proc/net/xt_qtaguid/stats

```txt

L2K:/ $ cat proc/net/xt_qtaguid/stats | grep 10027
idx iface acct_tag_hex uid_tag_int cnt_set rx_bytes rx_packets tx_bytes tx_packets rx_tcp_bytes rx_tcp_packets rx_udp_bytes rx_udp_packets rx_other_bytes rx_other_packets tx_tcp_bytes tx_tcp_packets tx_udp_bytes tx_udp_packets tx_other_bytes tx_other_packets
10 rmnet_data0 0x0 10027 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
11 rmnet_data0 0x0 10027 1 451662 2320 1193948 3888 451662 2320 0 0 0 0 1193948 3888 0 0 0 0
40 wlan0 0x0 10027 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
41 wlan0 0x0 10027 1 38829 166 77083 208 38829 166 0 0 0 0 77083 208 0 0 0 0

```


