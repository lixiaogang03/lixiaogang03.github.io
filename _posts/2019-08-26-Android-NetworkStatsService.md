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
    - NetworkStatsService
---

## Mobile Network

### App

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

### Framework

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
