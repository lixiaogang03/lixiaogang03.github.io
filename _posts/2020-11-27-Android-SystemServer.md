---
layout:     post
title:      Android SystemServer
subtitle:   Android system_server process
date:       2020-11-27
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - system_server
    - android
---

[进程的Binder线程池工作过程-Gityuan](http://gityuan.com/2016/10/29/binder-thread-pool/)

## Thread

```txt

# ps -T 969
1	969	Runnable	539	663	main
*2	977	Wait	0	0	Signal Catcher
*3	978	Runnable	0	0
*4	979	Runnable	37	623	ADB-JDWP Connection Control Thread
*5	980	Runnable	208	180	Jit thread pool worker thread 0
*6	981	Wait	5351	1483	HeapTaskDaemon
*7	982	Wait	541	1911	ReferenceQueueDaemon
*8	983	Wait	28	29	FinalizerDaemon
*9	984	Wait	4	13	FinalizerWatchdogDaemon
10	989	Runnable	3652	4364	Binder:969_1
11	990	Runnable	5743	6888	Binder:969_2
12	1009	Runnable	679	659	android.fg
13	1010	Runnable	2028	3703	android.ui
14	1011	Runnable	27	109	android.io
15	1012	Runnable	89	111	android.display
16	1013	Runnable	245	217	android.anim
17	1014	Runnable	41	79	android.anim.lf
18	1015	Wait	29	139	watchdog
19	2776	Runnable	0	0	OsuServerHandler
20	1020	Runnable	3631	6663	android.bg
21	1022	Runnable	42	130	HwBinder:969_1
22	1026	Runnable	1060	2220	ActivityManager
23	1027	Runnable	2645	4393	ActivityManager:procStart
24	1030	Runnable	1687	9002	ActivityManager:kill
25	1031	Runnable	1205	1533	ActivityManager:killHandler
26	1033	Runnable	19	383	OomAdjuster
27	1032	Runnable	0	0	Thread-2
28	1040	Wait	388	90	batterystats-worker
29	1090	Runnable	3586	5096	FileObserver
30	1095	Wait	15	184	CpuTracker
31	1100	Runnable	0	0	Thread-3
32	1101	Runnable	27	175	Thread-4
33	1099	Runnable	0	0	Thread-5
34	1104	Runnable	3509	5769	PowerManagerService
35	1119	Runnable	0	0	BatteryStats_wakeupReason
36	1137	Runnable	0	0	PackageManager
37	1146	Runnable	10	26	PackageManager
38	1150	Runnable	5344	6359	Binder:969_4
39	2794	Runnable	6244	7399	Binder:969_A
40	1635	Runnable	4	3	PackageInstaller
41	3044	Runnable	4632	5501	Binder:969_B
42	1744	Runnable	0	0	SensorService
43	1743	Runnable	0	0	SensorEventAckReceiver
44	1755	Runnable	0	0	HealthServiceHwbinder
45	1759	Runnable	0	0	RollbackPackageHealthObserver
46	1760	Runnable	0	0	RollbackManagerServiceHandler
47	3067	Wait	8	36	LazyTaskWriterThread
48	3103	Wait	64	38	pool-6-thread-1
49	1763	Runnable	0	0	AccountManagerService
50	1766	Runnable	3	15	SettingsProvider
51	1770	Runnable	6	2475	CachedAppOptimizerThread
52	1771	Runnable	89	279	AlarmManager
53	1774	Runnable	5251	6078	Binder:969_5
54	3090	Runnable	6	13	backup-0
55	1778	Runnable	11	54	InputReader
56	1777	Runnable	45	122	InputDispatcher
57	1775	Runnable	14	134	UEventObserver
58	1782	Runnable	0	4	NetworkWatchlistService
59	1783	Runnable	627	1560	HwBinder:969_2
60	1784	Runnable	0	0	hidl_ssvc_poll
61	1785	Runnable	416	1089	HwBinder:969_3
62	1787	Runnable	617	1019	EventHandlerThread
63	1788	Runnable	6	0	AppIntegrityManagerServiceHandler
64	1793	Runnable	0	2	StorageManagerService
65	3372	Runnable	7685	8960	Binder:969_C
66	1798	Runnable	0	0	LockSettingsService
67	3454	Runnable	5625	6455	Binder:969_D
68	1805	Runnable	78	285	NetworkStats
69	1806	Runnable	24	69	NetworkPolicy
70	1807	Runnable	53	212	NetworkPolicy.uid
71	1809	Runnable	0	0	AsyncChannelHandlerThread
72	1810	Runnable	3306	8920	WifiHandlerThread
73	1813	Runnable	4	1	WifiP2pService
74	1814	Runnable	4	0	PasspointProvisionerHandlerThread
75	1823	Runnable	154	60	WifiScanningService
76	1825	Runnable	590	454	ConnectivityServiceThread
77	1826	Runnable	0	0	android.pacmanager
78	1827	Runnable	0	0	NsdService
79	1828	Runnable	0	0	mDnsConnector
80	1830	Runnable	1	0	ranker
81	1831	Runnable	0	5	notification-sqlite-log
82	1832	Runnable	0	2	ConditionProviders.ECP
83	1834	Runnable	24	142	DeviceStorageMonitorService
84	1836	Runnable	5	7	AS.SfxWorker
85	1838	Runnable	0	3	AudioService
86	1840	Runnable	0	0	AudioDeviceBroker
87	1851	Wait	0	0	Thread-8
88	1857	Runnable	68	26	ConnectivityThread
89	2573	Runnable	4689	5607	Binder:969_9
90	1858	Runnable	5	3	backup
91	1860	Runnable	0	2	GraphicsStats-disk
92	1862	Runnable	0	0	BlobStore
93	1864	Runnable	0	0	SessionRecordThread
94	1865	Runnable	0	0	SliceManagerService
95	1866	Runnable	0	0	CameraService_proxy
96	1867	Runnable	0	0	StatsCompanionService
97	1872	Runnable	1	1	wifiRttService
98	1873	Runnable	23	25	wifiAwareService
99	1875	Runnable	48	27	EthernetServiceThread
100	1876	Runnable	42	20	WifiManagerThread
101	1880	Wait	78	148	TaskSnapshotPersister
102	1886	Wait	0	0	PhotonicModulator
103	1887	Runnable	0	0	HealthServiceHwbinder
104	1906	Runnable	0	0	SyncManager
105	1931	Runnable	0	0	UsbService host thread
106	3526	Wait	0	0	Timer-0
107	2758	Runnable	0	0	AdbDebuggingManager
108	2756	Runnable	0	0	RedirectListenerHandler
109	3528	Wait	1	0	pool-4-thread-1
110	1946	Runnable	88	305	Thread-10
111	1948	Runnable	6	34	SyncHandler-0
112	1947	Wait	5	14	AsyncTask #1
113	1953	Runnable	0	4	NetworkStatsObservers
114	2019	Runnable	457	1187	HwBinder:969_4
115	2029	Runnable	0	0	EmergencyAffordanceService
116	2070	Runnable	11	8	SunmiNetworkTimeUpdateService
117	2054	Runnable	728	1950	HwBinder:969_5
118	2124	Runnable	4551	5443	Binder:969_6
119	2160	Runnable	5438	6567	Binder:969_7
120	2184	Runnable	5567	6687	Binder:969_8
121	2491	Runnable	0	6	SyncHandler-1
122	2291	Runnable	0	0	BluetoothRouteManager
123	2292	Runnable	0	0	AudioPortEventHandler
124	2299	Runnable	0	0	com.android.server.telecom.CallAudioRouteStateMachine
125	2301	Runnable	0	0	CallAudioModeStateMachine
126	2308	Runnable	0	0	ConnectionSvrFocusMgr
127	2476	Runnable	0	0	queued-work-looper
128	3530	Wait	0	1	pool-4-thread-3
129	3541	Wait	0	1	pool-4-thread-8
130	3529	Wait	2	0	pool-4-thread-2
131	3532	Wait	0	1	pool-4-thread-5
132	3531	Wait	1	0	pool-4-thread-4
133	3533	Wait	0	1	pool-4-thread-6
134	3540	Wait	0	2	pool-4-thread-7
135	3549	Wait	0	1	pool-4-thread-9
136	3552	Wait	0	2	pool-4-thread-10
137	3893	Runnable	6624	7837	Binder:969_E
138	5506	Runnable	0	2	AudioTrack
139	4063	Runnable	0	1	AsyncQueryWorker
*140	4364	Runnable	61	125	RenderThread
141	4227	Runnable	8276	9516	Binder:969_F
142	29433	Runnable	16	23	Binder:969_15
143	5978	Runnable	7466	8805	Binder:969_10
144	8795	Runnable	0	0	AudioTrack
145	11994	Runnable	7421	8887	Binder:969_11
146	13411	Runnable	2314	2848	Binder:969_12
147	13413	Runnable	4434	5370	Binder:969_13
148	13435	Runnable	4814	5648	Binder:969_14
149	20887	Runnable	8	22	SyncHandler-2
151	30294	Runnable	2920	3406	Binder:969_16

```

## UML

![service_thread](/images/init/service_thread.png)

## 主线程

```java

public final class SystemServer {

    /**
     * The main entry point from zygote.
     */
    public static void main(String[] args) {
        new SystemServer().run();
    }

    private void run() {

        Looper.prepareMainLooper();

        // Loop forever.
        Looper.loop();
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }

}

```

## ServiceThread

**线程基类**

```java

public class ServiceThread extends HandlerThread {
    private static final String TAG = "ServiceThread";

    private final boolean mAllowIo;

    public ServiceThread(String name, int priority, boolean allowIo) {
        super(name, priority);
        mAllowIo = allowIo;
    }

    @Override
    public void run() {
        Process.setCanSelfBackground(false);

        if (!mAllowIo) {
            StrictMode.initThreadDefaults(null);
        }

        super.run();
    }
}

```


## android.fg

**系统共享的后台线程，用于执行一些比较耗时的操作，例如磁盘读写**

```java

/**
 * Shared singleton foreground thread for the system.  This is a thread for regular
 * foreground service operations, which shouldn't be blocked by anything running in
 * the background.  In particular, the shared background thread could be doing
 * relatively long-running operations like saving state to disk (in addition to
 * simply being a background priority), which can cause operations scheduled on it
 * to be delayed for a user-noticeable amount of time.
 */
public final class FgThread extends ServiceThread {
    private static final long SLOW_DISPATCH_THRESHOLD_MS = 100;
    private static final long SLOW_DELIVERY_THRESHOLD_MS = 200;

    private static FgThread sInstance;
    private static Handler sHandler;
    private static HandlerExecutor sHandlerExecutor;

    private FgThread() {
        super("android.fg", android.os.Process.THREAD_PRIORITY_DEFAULT, true /*allowIo*/);
    }

    private static void ensureThreadLocked() {
        if (sInstance == null) {
            sInstance = new FgThread();
            sInstance.start();
            final Looper looper = sInstance.getLooper();
            looper.setTraceTag(Trace.TRACE_TAG_SYSTEM_SERVER);
            looper.setSlowLogThresholdMs(
                    SLOW_DISPATCH_THRESHOLD_MS, SLOW_DELIVERY_THRESHOLD_MS);
            sHandler = new Handler(sInstance.getLooper());
            sHandlerExecutor = new HandlerExecutor(sHandler);
        }
    }

    public static FgThread get() {
        synchronized (FgThread.class) {
            ensureThreadLocked();
            return sInstance;
        }
    }

    public static Handler getHandler() {
        synchronized (FgThread.class) {
            ensureThreadLocked();
            return sHandler;
        }
    }

    public static Executor getExecutor() {
        synchronized (FgThread.class) {
            ensureThreadLocked();
            return sHandlerExecutor;
        }
    }
}

```

### android.ui

**UI线程**

```java

/**
 * Shared singleton thread for showing UI.  This is a foreground thread, and in
 * additional should not have operations that can take more than a few ms scheduled
 * on it to avoid UI jank.
 */
public final class UiThread extends ServiceThread {

    private UiThread() {
        super("android.ui", Process.THREAD_PRIORITY_FOREGROUND, false /*allowIo*/);
    }


```

## android.io

**IO线程**

```java

/**
 * Shared singleton I/O thread for the system.  This is a thread for non-background
 * service operations that can potential block briefly on network IO operations
 * (not waiting for data itself, but communicating with network daemons).
 */
public final class IoThread extends ServiceThread {

    private IoThread() {
        super("android.io", android.os.Process.THREAD_PRIORITY_DEFAULT, true /*allowIo*/);
    }

}

```

## android.display

```java

/**
 * Shared singleton foreground thread for the system.  This is a thread for
 * operations that affect what's on the display, which needs to have a minimum
 * of latency.  This thread should pretty much only be used by the WindowManager,
 * DisplayManager, and InputManager to perform quick operations in real time.
 */
public final class DisplayThread extends ServiceThread {

    private DisplayThread() {
        // DisplayThread runs important stuff, but these are not as important as things running in
        // AnimationThread. Thus, set the priority to one lower.
        super("android.display", Process.THREAD_PRIORITY_DISPLAY + 1, false /*allowIo*/);
    }
}

```

## android.anim

```java

/**
 * Thread for handling all legacy window animations, or anything that's directly impacting
 * animations like starting windows or traversals.
 */
public final class AnimationThread extends ServiceThread {

    private AnimationThread() {
        super("android.anim", THREAD_PRIORITY_DISPLAY, false /*allowIo*/);
    }
}

```

## android.bg

```java

package com.android.internal.os;

/**
 * Shared singleton background thread for each process.
 */
public final class BackgroundThread extends HandlerThread {

    private BackgroundThread() {
        super("android.bg", android.os.Process.THREAD_PRIORITY_BACKGROUND);
    }
}

```

## Binder线程

```txt

1	27841	Runnable	30	28	main
2	12870	Runnable	0	0	Binder:27841_4
*6	27856	Wait	0	0	Signal Catcher
*7	27857	Runnable	0	0
*8	27858	Runnable	0	3	ADB-JDWP Connection Control Thread
*9	27859	Runnable	3	3	Jit thread pool worker thread 0
*10	27860	Wait	0	2	HeapTaskDaemon
*11	27861	Wait	0	0	ReferenceQueueDaemon
*12	27862	Wait	0	0	FinalizerDaemon
*13	27863	Wait	0	0	FinalizerWatchdogDaemon
14	27864	Runnable	0	0	Binder:27841_1	              //Binder主线程
15	27865	Runnable	0	0	Binder:27841_2
16	27867	Runnable	0	0	Binder:27841_3
*17	27870	Runnable	1	0	Profile Saver
*18	27872	Runnable	21	19	RenderThread
19	28086	Runnable	0	0	Thread-2
20	28073	Runnable	77130	10908	Thread-3
*21	28119	Runnable	184	82	Thread-4
*22	28121	Runnable	20	105	Thread-5
23	28153	TimedWait	555	611	Studio:InputCon


```

Binder主线程：进程创建过程会调用startThreadPool()过程中再进入spawnPooledThread(true)，来创建Binder主线程。编号从1开始，也就是意味着binder主线程名为binder_1，并且主线程是不会退出的。
Binder普通线程：是由Binder Driver来根据是否有空闲的binder线程来决定是否创建binder线程，回调spawnPooledThread(false) ，isMain=false，该线程名格式为binder_x。
Binder其他线程：其他线程是指并没有调用spawnPooledThread方法，而是直接调用IPC.joinThreadPool()，将当前线程直接加入binder线程队列。例如： mediaserver和servicemanager的主线程都是binder线程，但system_server的主线程并非binder线程。


