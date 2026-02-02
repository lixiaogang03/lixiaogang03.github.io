---
layout:     post
title:      Android Location
subtitle:   位置信息服务
date:       2021-01-07
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - Android
---

[构建位置感知应用-Google](https://developer.android.google.cn/training/location?hl=zh-cn)

[Android Q 集成百度定位-简书](https://www.jianshu.com/p/46f13b2da965)

## GNSS

GNSS的全称是全球导航卫星系统（Global Navigation Satellite System），它是泛指所有的卫星导航系统，包括全球的、区域的和增强的，
如美国的GPS、俄罗斯的Glonass、欧洲的Galileo、中国的北斗卫星导航系统，以及相关的增强系统，如美国的WAAS（广域增强系统）、欧洲的EGNOS（欧洲静地导航重叠系统）
和日本的MSAS（多功能运输卫星增强系统）等，还涵盖在建和以后要建设的其他卫星导航系统。

## RK3288

[android7_gnss_hal_driver](https://github.com/zxcwhale/android7_gnss_hal_driver)

[Firefly-RK3288](https://wiki.t-firefly.com/zh_CN/Firefly-RK3288/module_wireless.html?highlight=gps)

## 架构

![android_location](/images/android/location/android_location.png)

## 请求位置权限

```xml

<manifest ... >
  <!-- To request foreground location access, declare one of these permissions. -->
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  
  <!-- Required only when requesting background location access on
       Android 10 (API level 29) and higher. -->
  <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
  
  <!-- Recommended for Android 9 (API level 28) and lower. -->
  <!-- Required for Android 10 (API level 29) and higher. -->
  <service
    android:name="MyNavigationService"
    android:foregroundServiceType="location" ... >
    <!-- Any inner elements would go here. -->
  </service>
  
</manifest>

```

## 请求位置信息更新

```java

@SystemService(Context.LOCATION_SERVICE)
@RequiresFeature(PackageManager.FEATURE_LOCATION)
public class LocationManager {

    @RequiresPermission(anyOf = {ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION})
    public void requestLocationUpdates(@NonNull String provider, long minTimeMs, float minDistanceM,
            @NonNull LocationListener listener, @Nullable Looper looper) {
        Preconditions.checkArgument(provider != null, "invalid null provider");
        Preconditions.checkArgument(listener != null, "invalid null listener");

        LocationRequest request = LocationRequest.createFromDeprecatedProvider(
                provider, minTimeMs, minDistanceM, false);
        requestLocationUpdates(request, listener, looper);
    }

}

```

## LocationManagerServcie

### 位置服务类图

[Android网络定位源码分析-简书](https://www.jianshu.com/p/071722bd9f1c)

![location_service](/images/android/location/location_service.webp)

### 位置信息请求时序图

![location_manager](/images/android/location/location_manager.png)

## ServiceWatcher开机日志

```txt

2020-12-31 17:55:32.031 972-1015/system_process I/ServiceWatcher: [com.android.location.service.FusedLocationProvider] binding to {com.android.location.fused/com.android.location.fused.FusedLocationService}@0[u0]
2020-12-31 17:55:33.670 972-1015/system_process I/ServiceWatcher: [com.android.location.service.FusedLocationProvider] connected to {com.android.location.fused/com.android.location.fused.FusedLocationService}
2020-12-31 17:55:41.120 972-1015/system_process I/ServiceWatcher: [com.android.location.service.v3.NetworkLocationProvider] binding to {com.baidu.map.location/com.baidu.map.location.BaiduNetworkLocationService}@10[u0]
2020-12-31 17:55:41.232 972-1015/system_process I/ServiceWatcher: [com.android.location.service.GeocodeProvider] binding to {com.baidu.map.location/com.baidu.map.location.BaiduNetworkLocationService}@10[u0]
2020-12-31 17:55:43.174 972-1015/system_process I/ServiceWatcher: [com.android.location.service.v3.NetworkLocationProvider] connected to {com.baidu.map.location/com.baidu.map.location.BaiduNetworkLocationService}
2020-12-31 17:55:43.175 972-1015/system_process I/ServiceWatcher: [com.android.location.service.GeocodeProvider] connected to {com.baidu.map.location/com.baidu.map.location.BaiduNetworkLocationService}

```

## LBS开机日志

```txt

2021-01-08 13:44:14.024 977-977/system_process I/SystemServerTiming: StartLocationManagerService
2021-01-08 13:44:14.024 977-977/system_process I/SystemServiceManager: Starting com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:14.032 977-977/system_process D/SystemServerTiming: StartLocationManagerService took to complete: 8ms
2021-01-08 13:44:15.014 977-977/system_process I/SystemServerTiming: OnBootPhase_480_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:15.014 977-977/system_process D/SystemServerTiming: OnBootPhase_480_com.android.server.location.LocationManagerService$Lifecycle took to complete: 0ms
2021-01-08 13:44:15.227 977-977/system_process I/SystemServerTiming: OnBootPhase_500_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:15.237 977-977/system_process D/SystemServerTiming: OnBootPhase_500_com.android.server.location.LocationManagerService$Lifecycle took to complete: 10ms
2021-01-08 13:44:15.798 977-977/system_process I/SystemServerTiming: OnBootPhase_520_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:15.798 977-977/system_process D/SystemServerTiming: OnBootPhase_520_com.android.server.location.LocationManagerService$Lifecycle took to complete: 0ms
2021-01-08 13:44:16.078 977-977/system_process I/SystemServerTiming: OnBootPhase_550_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:16.078 977-977/system_process D/SystemServerTiming: OnBootPhase_550_com.android.server.location.LocationManagerService$Lifecycle took to complete: 0ms
2021-01-08 13:44:16.354 977-998/system_process V/LocationManagerService: location appop changed for com.android.bluetooth
2021-01-08 13:44:16.367 977-998/system_process V/LocationManagerService: location appop changed for com.android.systemui
2021-01-08 13:44:16.546 977-977/system_process I/SystemServerTiming: OnBootPhase_600_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:16.560 977-977/system_process E/LocationManagerService: unable to bind ActivityRecognitionProxy
2021-01-08 13:44:16.587 977-977/system_process D/LocationManagerService: [u0] gps provider enabled = true
2021-01-08 13:44:16.589 977-977/system_process E/LocationManagerService: unable to bind to GeofenceProxy
2021-01-08 13:44:16.589 977-977/system_process D/SystemServerTiming: OnBootPhase_600_com.android.server.location.LocationManagerService$Lifecycle took to complete: 43ms
2021-01-08 13:44:16.752 977-998/system_process W/LocationManagerService: passive provider saw user 0 unexpectedly
2021-01-08 13:44:16.752 977-998/system_process D/LocationManagerService: [u0] passive provider enabled = true
2021-01-08 13:44:16.997 977-998/system_process V/LocationManagerService: location appop changed for com.android.networkstack
2021-01-08 13:44:16.998 977-998/system_process V/LocationManagerService: location appop changed for com.android.cellbroadcastservice
2021-01-08 13:44:16.998 977-998/system_process V/LocationManagerService: location appop changed for com.android.networkstack.tethering
2021-01-08 13:44:16.999 977-998/system_process V/LocationManagerService: location appop changed for com.android.networkstack.permissionconfig
2021-01-08 13:44:17.135 977-977/system_process I/SystemServerTiming: ssm.onStartUser-0_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:17.135 977-977/system_process D/LocationManagerService: u0 started
2021-01-08 13:44:17.136 977-977/system_process D/LocationManagerService: [u0] passive provider enabled = true
2021-01-08 13:44:17.145 977-977/system_process D/LocationManagerService: [u0] network provider enabled = false
2021-01-08 13:44:17.153 977-977/system_process D/LocationManagerService: [u0] fused provider enabled = false
2021-01-08 13:44:17.154 977-977/system_process D/LocationManagerService: [u0] gps provider enabled = true
2021-01-08 13:44:17.159 977-977/system_process D/SystemServerTiming: ssm.onStartUser-0_com.android.server.location.LocationManagerService$Lifecycle took to complete: 20ms
2021-01-08 13:44:17.557 977-998/system_process V/LocationManagerService: location appop changed for com.android.providers.telephony
2021-01-08 13:44:17.568 977-998/system_process V/LocationManagerService: location appop changed for com.android.phone
2021-01-08 13:44:17.569 977-998/system_process V/LocationManagerService: location appop changed for com.qualcomm.qti.networksetting
2021-01-08 13:44:17.616 977-998/system_process D/LocationManagerService: location setting changed [u0]: content://settings/secure/location_mode
2021-01-08 13:44:17.619 977-998/system_process D/LocationManagerService: [u0] location enabled = true
2021-01-08 13:44:17.908 977-998/system_process D/LocationManagerService: [u0] fused provider enabled = true
2021-01-08 13:44:19.380 977-998/system_process V/LocationManagerService: location appop changed for android.ext.services
2021-01-08 13:44:21.492 977-1001/system_process I/ActivityManagerTiming: OnBootPhase_1000_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:21.492 977-1001/system_process D/ActivityManagerTiming: OnBootPhase_1000_com.android.server.location.LocationManagerService$Lifecycle took to complete: 0ms
2021-01-08 13:44:24.396 977-998/system_process V/LocationManagerService: location appop changed for com.android.bluetooth
2021-01-08 13:44:24.519 977-1014/system_process I/SystemServerTimingAsync: ssm.onUnlockingUser-0_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:24.519 977-1014/system_process D/SystemServerTimingAsync: ssm.onUnlockingUser-0_com.android.server.location.LocationManagerService$Lifecycle took to complete: 0ms
2021-01-08 13:44:24.816 977-1014/system_process I/SystemServerTimingAsync: ssm.onUnlockedUser-0_com.android.server.location.LocationManagerService$Lifecycle
2021-01-08 13:44:24.816 977-1014/system_process D/SystemServerTimingAsync: ssm.onUnlockedUser-0_com.android.server.location.LocationManagerService$Lifecycle took to complete: 0ms
2021-01-08 13:44:27.056 977-3078/system_process D/LocationManagerService: [u0] network provider enabled = true
2021-01-08 13:44:38.833 977-998/system_process I/LocationManagerService: remove b964a97

```

## Baidu Location 开机日志

/system_ext/priv-app/BaiduNLP/BaiduNLP.apk

```txt

2021-01-08 15:50:46.347 3472-3472/com.baidu.map.location I/NLP: init BaiduNetworkLocationProvider for action:[ com.android.location.service.v3.NetworkLocationProvider ]
2021-01-08 15:50:58.179 3472-3472/com.baidu.map.location I/NLP: ------sdk init at first location request------
2021-01-08 15:50:58.190 3472-3472/com.baidu.map.location D/NLP_parseConfigInfor: [oem:sunmi][channel:nl.nl1139][version:5.2.0][build:n924]
2021-01-08 15:50:58.191 3472-3472/com.baidu.map.location D/NLPLOC: start first
2021-01-08 15:50:58.350 3472-3472/com.baidu.map.location I/NLP: --------start定位组件-------
2021-01-08 15:50:58.351 3472-3472/com.baidu.map.location I/NLP: 百度SDK响应值为：1
2021-01-08 15:50:58.351 3472-3472/com.baidu.map.location I/NLP: --------restart service-------
2021-01-08 15:50:58.352 3472-3472/com.baidu.map.location I/NLP: 百度SDK响应值为：1
2021-01-08 15:50:58.352 3472-3472/com.baidu.map.location I/NLP: --------restart service-------
2021-01-08 15:50:58.440 3472-4118/com.baidu.map.location D/NLPLOC: upDataStr = :null
2021-01-08 15:50:58.487 3472-3472/com.baidu.map.location D/NLPLOC: baidu location service start1 ...3472
2021-01-08 15:50:58.674 3472-4147/com.baidu.map.location D/NLPLOC: NetworkCommunicationException!
2021-01-08 15:50:58.679 3472-4147/com.baidu.map.location I/NLPLOC: finally 
2021-01-08 15:50:58.681 3472-4147/com.baidu.map.location D/NLPLOC: NetworkCommunicationException!
2021-01-08 15:50:58.681 3472-4147/com.baidu.map.location I/NLPLOC: finally 
2021-01-08 15:50:58.686 3472-4147/com.baidu.map.location D/NLPLOC: NetworkCommunicationException!
2021-01-08 15:50:58.686 3472-4147/com.baidu.map.location I/NLPLOC: finally 
2021-01-08 15:50:58.693 3472-4118/com.baidu.map.location I/NLPLOC: first result 
2021-01-08 15:50:58.697 3472-4118/com.baidu.map.location D/NLPLOC: receive start1
2021-01-08 15:50:58.698 3472-3472/com.baidu.map.location I/NLP: Location result:[location successful by Baidu], reason:[network location] locType=161, NetworkLocationType = wf
2021-01-08 15:50:58.749 3472-4120/com.baidu.map.location D/NLPLOC: start network locating ...true  true
2021-01-08 15:50:58.750 3472-4120/com.baidu.map.location D/NLP_STA: network locating ...true  true
2021-01-08 15:50:58.919 3472-4173/com.baidu.map.location D/NLPLOC: upDataStr = :null
2021-01-08 15:50:59.082 3472-4175/com.baidu.map.location D/NLPLOC: NetworkCommunicationException!
2021-01-08 15:50:59.083 3472-4175/com.baidu.map.location I/NLPLOC: finally 
2021-01-08 15:50:59.084 3472-4175/com.baidu.map.location D/NLPLOC: NetworkCommunicationException!
2021-01-08 15:50:59.084 3472-4175/com.baidu.map.location I/NLPLOC: finally 
2021-01-08 15:50:59.091 3472-4175/com.baidu.map.location D/NLPLOC: NetworkCommunicationException!
2021-01-08 15:50:59.092 3472-4175/com.baidu.map.location I/NLPLOC: finally 
2021-01-08 15:50:59.406 3472-4138/com.baidu.map.location I/NLP:  开始RGC onGetFromLocation:org.codeaurora.imsmaxResults = 1

```

## 位置信息更新日志

```txt

2021-01-08 15:41:12.127 3483-3483/com.baidu.map.location I/NLP: 百度SDK响应值为：0
2021-01-08 15:41:12.155 3483-4159/com.baidu.map.location I/NLPLOC: wifi start scan
2021-01-08 15:41:12.172 3483-3483/com.baidu.map.location D/NLPLOC: WifiScan finished, in callback.
2021-01-08 15:41:12.217 3483-8332/com.baidu.map.location D/NLPLOC: start network locating ...true  false
2021-01-08 15:41:12.218 3483-8332/com.baidu.map.location D/NLP_STA: network locating ...true  false
2021-01-08 15:41:12.345 3483-8333/com.baidu.map.location D/NLPLOC: upDataStr = :null
2021-01-08 15:41:12.632 3483-3483/com.baidu.map.location I/NLP: Location result:[location successful by Baidu], reason:[network location] locType=161, NetworkLocationType = wf
2021-01-08 15:41:12.655 3483-3515/com.baidu.map.location I/NLP:  开始RGC onGetFromLocation:com.sunmi.baseservicemaxResults = 1
2021-01-08 15:41:12.656 3483-3515/com.baidu.map.location I/NLP: use rgeo cache
2021-01-08 15:41:12.706 3483-3483/com.baidu.map.location I/NLP: 百度SDK响应值为：0
2021-01-08 15:41:12.708 3483-4159/com.baidu.map.location D/NLPLOC: wifi valid time < 10S
2021-01-08 15:41:12.710 3483-3483/com.baidu.map.location I/NLP: Location result:[location successful by Baidu], reason:[network location] locType=161, NetworkLocationType = wf

```

## dumpsys location

```txt

qssi:/ $ dumpsys location
Location Manager State:
  Current System Time: 01-07 17:39:40.971, Current Elapsed Time: +3m41s468ms
  User Info:
    current users: [0]
  Location Settings:
    Location Enabled: true
    Throttling Whitelisted Packages:
      com.sunmi.remotecontrol.pro
      sunmi.remotemanager
      com.sunmi.adb
    Bypass Whitelisted Packages:
      com.sunmi.remotecontrol.pro
      sunmi.remotemanager
      com.sunmi.adb
  Battery Saver Location Mode: NO_CHANGE
  Location Listeners:
    Reciever[d93be3e listener UpdateRecord[passive 1043/android[LocationService] Request[POWER_NONE passive] null] monitoring location: false]
    Reciever[dd3149f listener UpdateRecord[network 3739/com.sunmi.baseservice (background) Request[POWER_LOW network interval=0 fastestInterval=0] null] monitoring location: false]
    Reciever[52269ec listener UpdateRecord[passive 1043/android[SensorNotificationService] Request[POWER_NONE passive] null] monitoring location: true]
    Reciever[47531b5 listener UpdateRecord[passive 3385/com.baidu.map.location (background) Request[POWER_NONE passive] null] monitoring location: true]
  Active Records by Provider:
    gps:
    passive:
      UpdateRecord[passive 1043/android[LocationService] Request[POWER_NONE passive] null]
      UpdateRecord[passive 1043/android[SensorNotificationService] Request[POWER_NONE passive] null]
      UpdateRecord[passive 3385/com.baidu.map.location (background) Request[POWER_NONE passive] null]
    network:
      UpdateRecord[network 3739/com.sunmi.baseservice (background) Request[POWER_LOW network interval=0 fastestInterval=0] null]
  Historical Records by Provider:
    gps: com.sunmi.dataService: Min interval 0 seconds: Max interval 1 seconds: Duration requested 0 total, 0 foreground, out of the last 0 minutes: Last active 0 minutes ago
    network: android: LocationService: Interval 1 seconds: Duration requested 0 total, 0 foreground, out of the last 2 minutes: Last active 2 minutes ago
    network: com.sunmi.baseservice: Interval 0 seconds: Duration requested 2 total, 0 foreground, out of the last 2 minutes: Currently active
    passive: android: LocationService: Interval 0 seconds: Duration requested 2 total, 2 foreground, out of the last 2 minutes: Currently active
    passive: android: SensorNotificationService: Interval 1800 seconds: Duration requested 2 total, 2 foreground, out of the last 2 minutes: Currently active
    passive: com.baidu.map.location: Interval 1 seconds: Duration requested 2 total, 0 foreground, out of the last 2 minutes: Currently active
    passive: com.sunmi.dataService: Interval 9 seconds: Duration requested 0 total, 0 foreground, out of the last 0 minutes: Last active 0 minutes ago
  Last Several Location Requests:
    At 01-07 17:36:46.860: + passive request from android with feature LocationService at interval 0 seconds
    At 01-07 17:36:51.833: + passive request from android with feature SensorNotificationService at interval 1800 seconds
    At 01-07 17:37:00.017: + network request from android with feature LocationService at interval 1 seconds
    At 01-07 17:37:10.022: - network request from android with feature LocationService
    At 01-07 17:37:10.068: + network request from android with feature LocationService at interval 1 seconds
    At 01-07 17:37:10.281: + passive request from com.baidu.map.location at interval 1 seconds
    At 01-07 17:37:20.069: - network request from android with feature LocationService
    At 01-07 17:37:27.224: + network request from com.sunmi.baseservice at interval 0 seconds
  Geofences:
  Location Providers:
    passive provider:
      last location=Location[network 31.309459,121.508284 hAcc=40 et=+1m23s722ms vAcc=??? sAcc=??? bAcc=??? {Bundle[mParcelledData.dataSize=64]}]
      last coarse location=Location[network 31.315315,121.502259 hAcc=2000 et=+1m11s106ms vAcc=??? sAcc=??? bAcc=???]
      enabled=true
      allowed=true
      properties=ProviderProperties[power=Low, accuracy=Coarse]
      packages={android}
      request=ProviderRequest[interval=0]
    network provider:
      last location=Location[network 31.309459,121.508284 hAcc=40 et=+1m23s722ms vAcc=??? sAcc=??? bAcc=??? {Bundle[mParcelledData.dataSize=64]}]
      last coarse location=Location[network 31.315315,121.502259 hAcc=2000 et=+1m11s106ms vAcc=??? sAcc=??? bAcc=???]
      enabled=true
      allowed=true
      properties=ProviderProperties[power=Low, accuracy=Coarse, requires=network,cell]
      packages={com.baidu.map.location}
      request=ProviderRequest[OFF]
      service={com.baidu.map.location/com.baidu.map.location.BaiduNetworkLocationService}@10[u0]
      connected=true
    fused provider:
      last location=null
      last coarse location=null
      enabled=true
      allowed=true
      properties=ProviderProperties[power=Low, accuracy=Fine, supports=[bearing, speed, altitude]]
      packages={com.android.location.fused}
      request=ProviderRequest[OFF]
      service={com.android.location.fused/com.android.location.fused.FusedLocationService}@0[u0]
      connected=true
    gps provider:
      last location=null
      last coarse location=null
      enabled=true
      allowed=true
      properties=ProviderProperties[power=High, accuracy=Fine, requires=satellite, supports=[bearing, speed, altitude]]
      packages={android}
      request=ProviderRequest[OFF]
      mStarted=false   (changed +3m41s487ms ago)
      mFixInterval=1000
      mLowPowerMode=false
      mGnssAntennaInfoProvider.isRegistered()=false
      mGnssMeasurementsProvider.isRegistered()=false
      mGnssNavigationMessageProvider.isRegistered()=false
      mDisableGpsForPowerManager=false
      mTopHalCapabilities=0xb63 ( SCHEDULING MSB GEOFENCING MEASUREMENTS LOW_POWER_MODE SATELLITE_BLACKLIST ANTENNA_INFO )
      GNSS_KPI_START
        KPI logging start time: +47s187ms
        KPI logging end time: +3m41s487ms
        Number of location reports: 0
        Number of TTFF reports: 0
        Number of position accuracy reports: 0
        Number of CN0 reports: 0
        Total number of sv status messages processed: 0
        Total number of L5 sv status messages processed: 0
        Total number of sv status messages processed, where sv is used in fix: 0
        Total number of L5 sv status messages processed, where sv is used in fix: 0
        Number of L5 CN0 reports: 0
        Used-in-fix constellation types: 
      GNSS_KPI_END
      Power Metrics
        Time on battery (min): 0.0
        Amount of time (while on battery) Top 4 Avg CN0 > 20.0 dB-Hz (min): 0.0
        Amount of time (while on battery) Top 4 Avg CN0 <= 20.0 dB-Hz (min): 0.0
        Energy consumed while on battery (mAh): 0.0
      Hardware Version: 
      native internal state: 
        Gnss Location Data:: not valid
      Gnss Time Data:: timeEstimate: 1483228800000, timeUncertaintyNs: 999, frequencyUncertaintyNsPerSec: 200000
      Satellite Data for 148 satellites:: 
      constell: 1=GPS, 2=SBAS, 3=GLO, 4=QZSS, 5=BDS, 6=GAL, 7=IRNSS; ephType: 0=Eph, 1=Alm, 2=Unk; ephSource: 0=Demod, 1=Supl, 2=Server, 3=Unk; ephHealth: 0=Good, 1=Bad, 2=Unk
      constell: 1, svid:   1, serverPredAvail: 0, serverPredAgeSec:       0, ephType: 2, ephSource: 3, ephHealth: 2, ephAgeSec:       0
      constell: 1, svid:   2, serverPredAvail: 0, serverPredAgeSec:       0, ephType: 2, ephSource: 3, ephHealth: 2, ephAgeSec:       0

  GNSS:
    GnssMeasurement Listeners:
    GnssNavigationMessage Listeners:
    GnssStatus Listeners:
      3385/com.baidu.map.location

```
