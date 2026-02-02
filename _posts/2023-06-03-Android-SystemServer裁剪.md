---
layout:     post
title:      Android SystemServer 裁剪
subtitle:   Binder
date:       2023-06-03
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - Android
---

## A133 service list

```txt

ceres-c3:/ $ service list
Found 166 services:
0	carrier_config: [com.android.internal.telephony.ICarrierConfigLoader]
1	phone: [com.android.internal.telephony.ITelephony]
2	isms: [com.android.internal.telephony.ISms]
3	iphonesubinfo: [com.android.internal.telephony.IPhoneSubInfo]
4	simphonebook: [com.android.internal.telephony.IIccPhoneBook]
5	ircs: [android.telephony.ims.aidl.IRcs]
6	network_stack: [android.net.INetworkStackConnector]
7	secure_element: [android.se.omapi.ISecureElementService]             可裁剪---移动设备上存储敏感信息，例如银行卡信息、密码和认证令牌等
8	telecom: [com.android.internal.telecom.ITelecomService]
9	isub: [com.android.internal.telephony.ISub]
10	aw_display: [com.softwinner.IDisplayService]
11	contexthub: [android.hardware.location.IContextHubService]
12	netd_listener: [android.net.metrics.INetdEventListener]
13	connmetrics: [android.net.IIpConnectivityMetrics]
14	bluetooth_manager: [android.bluetooth.IBluetoothManager]
15	app_binding: []
16	clipboard: [android.content.IClipboard]
17	autofill: [android.view.autofill.IAutoFillManager]
18	imms: [com.android.internal.telephony.IMms]
19	incidentcompanion: [android.os.IIncidentCompanion]
20	statscompanion: [android.os.IStatsCompanionService]
21	media.camera.proxy: [android.hardware.ICameraServiceProxy]
22	slice: [android.app.slice.ISliceManager]
23	media_projection: [android.media.projection.IMediaProjectionManager]
24	crossprofileapps: [android.content.pm.ICrossProfileApps]
25	launcherapps: [android.content.pm.ILauncherApps]
26	shortcut: [android.content.pm.IShortcutService]
27	media_router: [android.media.IMediaRouterService]
28	media_session: [android.media.session.ISessionManager]
29	restrictions: [android.content.IRestrictionsManager]
30	companiondevice: [android.companion.ICompanionDeviceManager]
31	print: [android.print.IPrintManager]
32	graphicsstats: [android.view.IGraphicsStats]
33	dreams: [android.service.dreams.IDreamManager]
34	network_time_update_service: []
35	runtime: []
36	diskstats: []
37	voiceinteraction: [com.android.internal.app.IVoiceInteractionManagerService]
38	role: [android.app.role.IRoleManager]
39	appwidget: [com.android.internal.appwidget.IAppWidgetService]
40	backup: [android.app.backup.IBackupManager]
41	trust: [android.app.trust.ITrustManager]
42	soundtrigger: [com.android.internal.app.ISoundTriggerService]
43	jobscheduler: [android.app.job.IJobScheduler]
44	color_display: [android.hardware.display.IColorDisplayManager]
45	hardware_properties: [android.os.IHardwarePropertiesManager]
46	serial: [android.hardware.ISerialManager]
47	usb: [android.hardware.usb.IUsbManager]
48	adb: [android.debug.IAdbManager]
49	midi: [android.media.midi.IMidiManager]              USB 声卡
50	DockObserver: []
51	audio: [android.media.IAudioService]
52	wallpaper: [android.app.IWallpaperManager]
53	search: [android.app.ISearchManager]
54	time_detector: [android.app.timedetector.ITimeDetectorService]
55	country_detector: [android.location.ICountryDetector]
56	location: [android.location.ILocationManager]
57	devicestoragemonitor: []
58	notification: [android.app.INotificationManager]
59	updatelock: [android.os.IUpdateLock]
60	system_update: [android.os.ISystemUpdateManager]
61	servicediscovery: [android.net.nsd.INsdManager]
62	connectivity: [android.net.IConnectivityManager]
63	ethernet: [android.net.IEthernetManager]
64	wifip2p: [android.net.wifi.p2p.IWifiP2pManager]
65	wifiscanner: [android.net.wifi.IWifiScanner]
66	wifi: [android.net.wifi.IWifiManager]
67	netpolicy: [android.net.INetworkPolicyManager]
68	netstats: [android.net.INetworkStatsService]
69	network_score: [android.net.INetworkScoreService]
70	textclassification: [android.service.textclassifier.ITextClassifierService]
71	textservices: [com.android.internal.textservice.ITextServicesManager]
72	ipsec: [android.net.IIpSecService]
73	network_management: [android.os.INetworkManagementService]
74	content_suggestions: [android.app.contentsuggestions.IContentSuggestionsManager]
75	app_prediction: [android.app.prediction.IPredictionManager]
76	statusbar: [com.android.internal.statusbar.IStatusBarService]
77	device_policy: [android.app.admin.IDevicePolicyManager]
78	persistent_data_block: [android.service.persistentdata.IPersistentDataBlockService]
79	deviceidle: [android.os.IDeviceIdleController]
80	oem_lock: [android.service.oemlock.IOemLockService]
81	testharness: []
82	lock_settings: [com.android.internal.widget.ILockSettings]
83	uimode: [android.app.IUiModeManager]
84	storagestats: [android.app.usage.IStorageStatsManager]
85	mount: [android.os.storage.IStorageManager]
86	accessibility: [android.view.accessibility.IAccessibilityManager]
87	input_method: [com.android.internal.view.IInputMethodManager]
88	pinner: []
89	network_watchlist: [com.android.internal.net.INetworkWatchlistManager]
90	input: [android.hardware.input.IInputManager]
91	window: [android.view.IWindowManager]
92	inputflinger: [android.input.IInputFlinger]
93	alarm: [android.app.IAlarmManager]
94	consumer_ir: [android.hardware.IConsumerIrService]             可裁剪---红外服务
95	dynamic_system: [android.os.image.IDynamicSystemService]
96	vibrator: [android.os.IVibratorService]                        可裁剪---振动服务
97	external_vibrator_service: [android.os.IExternalVibratorService]
98	dropbox: [com.android.internal.os.IDropBoxManagerService]
99	device_config: []
100	settings: []
101	content: [android.content.IContentService]
102	account: [android.accounts.IAccountManager]
103	telephony.registry: [com.android.internal.telephony.ITelephonyRegistry]
104	scheduling_policy: [android.os.ISchedulingPolicyService]
105	sec_key_att_app_id_provider: [android.security.keymaster.IKeyAttestationApplicationIdProvider]
106	bugreport: [android.os.IDumpstate]
107	rollback: [android.content.rollback.IRollbackManager]
108	looper_stats: []
109	binder_calls_stats: []
110	webviewupdate: [android.webkit.IWebViewUpdateService]
111	usagestats: [android.app.usage.IUsageStatsManager]
112	batteryproperties: [android.os.IBatteryPropertiesRegistrar]
113	background: [android.aw.IBackgroundManager]
114	battery: []
115	overlay: [android.content.om.IOverlayManager]
116	media.sound_trigger_hw: [android.hardware.ISoundTriggerHwService]
117	sensorservice: [android.gui.SensorServer]
118	media.audio_policy: [android.media.IAudioPolicyService]
119	media.camera: [android.hardware.ICameraService]
120	sensor_privacy: [android.hardware.ISensorPrivacyManager]
121	processinfo: [android.os.IProcessInfoService]
122	permission: [android.os.IPermissionController]
123	cpuinfo: []
124	dbinfo: []
125	gfxinfo: []
126	meminfo: []
127	procstats: [com.android.internal.app.procstats.IProcessStats]
128	activity: [android.app.IActivityManager]
129	user: [android.os.IUserManager]
130	otadexopt: [android.content.pm.IOtaDexopt]
131	package_native: [android.content.pm.IPackageManagerNative]
132	package: [android.content.pm.IPackageManager]
133	display: [android.hardware.display.IDisplayManager]
134	recovery: [android.os.IRecoverySystem]
135	thermalservice: [android.os.IThermalService]
136	power: [android.os.IPowerManager]
137	appops: [com.android.internal.app.IAppOpsService]
138	batterystats: [com.android.internal.app.IBatteryStats]
139	activity_task: [android.app.IActivityTaskManager]
140	uri_grants: [android.app.IUriGrantsManager]
141	device_identifiers: [android.os.IDeviceIdentifiersPolicyService]
142	SurfaceFlinger: [android.ui.ISurfaceComposer]
143	media.resource_manager: [android.media.IResourceManagerService]
144	media.player: [android.media.IMediaPlayerService]
145	media.extractor: [android.media.IMediaExtractorService]
146	media.audio_flinger: [android.media.IAudioFlinger]
147	storaged_pri: [android.os.storaged.IStoragedPrivate]
148	storaged: [android.os.IStoraged]
149	drm.drmManager: [drm.IDrmManagerService]
150	media.metrics: [android.media.IMediaAnalyticsService]
151	android.security.keystore: [android.security.keystore.IKeystoreService]
152	idmap: [android.os.IIdmap2]
153	android.service.gatekeeper.IGateKeeperService: [android.service.gatekeeper.IGateKeeperService]
154	netd: [android.net.INetd]
155	dnsresolver: [android.net.IDnsResolver]
156	stats: [android.os.IStatsManager]
157	wificond: [android.net.wifi.IWificond]
158	media.drm: [android.media.IMediaDrmService]
159	incident: [android.os.IIncidentManager]
160	installd: [android.os.IInstalld]
161	gpu: [android.graphicsenv.IGpuService]
162	ashmem_device_service: [android.ashmemd.IAshmemDeviceService]
163	suspend_control: [android.system.suspend.ISuspendControlService]
164	apexservice: [android.apex.IApexService]
165	vold: [android.os.IVold]

```

## pm list features

```txt

255|ceres-c3:/ $ pm list features
feature:reqGlEsVersion=0x30002
feature:android.hardware.audio.output
feature:android.hardware.bluetooth
feature:android.hardware.bluetooth_le
feature:android.hardware.camera
feature:android.hardware.camera.any
feature:android.hardware.camera.front
feature:android.hardware.ethernet
feature:android.hardware.faketouch
feature:android.hardware.location
feature:android.hardware.location.network
feature:android.hardware.microphone                       // 麦克风
feature:android.hardware.opengles.aep
feature:android.hardware.ram.low                          // 低内存设备
feature:android.hardware.screen.landscape
feature:android.hardware.screen.portrait
feature:android.hardware.sensor.accelerometer             // 可裁剪        加速计
feature:android.hardware.sensor.light                     // 可裁剪        感光
feature:android.hardware.sensor.proximity                 // 可裁剪        近距离感测 
feature:android.hardware.touchscreen
feature:android.hardware.touchscreen.multitouch
feature:android.hardware.touchscreen.multitouch.distinct
feature:android.hardware.touchscreen.multitouch.jazzhand
feature:android.hardware.usb.accessory
feature:android.hardware.usb.host
feature:android.hardware.vulkan.version=4194307
feature:android.hardware.wifi
feature:android.hardware.wifi.direct
feature:android.hardware.wifi.passpoint
feature:android.software.adoptable_storage
feature:android.software.autofill                        // 可裁剪  自动填写服务
feature:android.software.backup                          // 备份服务，可裁剪，三方app可能使用
feature:android.software.cant_save_state
feature:android.software.companion_device_setup
feature:android.software.connectionservice
feature:android.software.cts
feature:android.software.device_admin
feature:android.software.home_screen
feature:android.software.input_methods
feature:android.software.ipsec_tunnels
feature:android.software.midi                            // USB 声卡
feature:android.software.print                           // 打印
feature:android.software.secure_lock_screen
feature:android.software.verified_boot
feature:android.software.webview

```

## A133 awbms

device/softwinner/common/config/awbms_config

```txt

debug: true
limit: 12
threadCheck: true
memoryCheck: true
memoryLimit: 512,0
memoryTrim: true
skipService: false               表示阻止第三方开启后台服务
blockBroadcast: false            表示阻止第三方应用接收广播
lmk: false
lmk_level: 100,150,250
lmk_adj: 99,200,600

whitelist:                       表示已添加白名单的应用
android
com.android
com.android.phone
com.android.server.telecom
com.google
com.softwinner
com.allwinnertech
com.wif
com.ysxsoft
com.xintian

action:
android.service.wallpaper.WallpaperService
com.android.cts.verifier.camera.its.START

```


