---
layout:     post
title:      Android Location
subtitle:   位置信息服务
date:       2020-01-07
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - android
---

[构建位置感知应用-Google](https://developer.android.google.cn/training/location?hl=zh-cn)

## 架构

![android_location](/images/location/android_location.png)

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
