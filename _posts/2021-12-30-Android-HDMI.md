---
layout:     post
title:      Android HDMI
subtitle:   High Definition Multimedia Interface
date:       2021-12-30
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
---

[显示器接口VGA、DVI、HDMI、DP](https://www.jianshu.com/p/4b77dc78b0e8)

[Android R DisplayManagerService模块](https://juejin.cn/post/6947657994905583629)

## 常用显示器接口

图片来自[绿联](https://www.lulian.cn/product/list-12-cn.html)

VGA: Video Graphics Array 视频图形阵列, 模拟信号, 液晶显示器需要 A/D转换器，模拟信号抗干扰能力差，不适合超高清显示，一般用在**1080p**以内

![vga](/images/hardware/hdmi/vga.jpg)

HDMI: High Definition Multimedia Interface 高清多媒体接口, 全数字化视频和声音发送接口, 最新的**HDMI2.1**带宽达**48Gbps**，可以支持2K 240hz、4K 144hz、5K 60hz、8K 30hz

![hdmi](/images/hardware/hdmi/hdmi.jpg)

DP: DisplayPort 数字高清接口, 最新的**DP2.0**带宽已经高达**80Gbps**，最大支持16K（15360*8460）的超强分辨率

![dp](/images/hardware/hdmi/dp.jpg)

## RK3288 dts

```c

&hdmi {	
	status = "okay";
};

&route_hdmi {
	status = "okay";
}

```

## 显示器类型

```java

public final class DisplayManagerService extends SystemService {

    // List of all currently registered display adapters.
    private final ArrayList<DisplayAdapter> mDisplayAdapters = new ArrayList<DisplayAdapter>();

    // List of all currently connected display devices.
    private final ArrayList<DisplayDevice> mDisplayDevices = new ArrayList<DisplayDevice>();

    // List of all logical displays indexed by logical display id.
    private final SparseArray<LogicalDisplay> mLogicalDisplays =
            new SparseArray<LogicalDisplay>();

}

// 用于LocalDisplayDevice和DMS的连接
final class LocalDisplayAdapter extends DisplayAdapter {

    private final SparseArray<LocalDisplayDevice> mDevices =
            new SparseArray<LocalDisplayDevice>();

}

// 物理屏幕
abstract class DisplayDevice {

    private final DisplayAdapter mDisplayAdapter;

}

// 内置物理屏幕
private final class LocalDisplayDevice extends DisplayDevice {

        private final int mBuiltInDisplayId;

        private DisplayDeviceInfo mInfo;

}

// 开发者选项->模拟辅助显示开启后，创建的就是该类对象
private abstract class OverlayDisplayDevice extends DisplayDevice {

        private DisplayDeviceInfo mInfo;

}


// 表示虚拟显示屏幕，用于屏幕录制等
private final class VirtualDisplayDevice extends DisplayDevice implements DeathRecipient {

        private DisplayDeviceInfo mInfo;

}

// 通过Wifi连接显示的物理屏幕
private final class WifiDisplayDevice extends DisplayDevice {

        private Surface mSurface;
        private DisplayDeviceInfo mInfo;

}


// 表逻辑显示屏，每一个physical display都会对应一个logical display
final class LogicalDisplay {

    private DisplayInfo mOverrideDisplayInfo; // set by the window manager
    public DisplayInfo mInfo;

}

// DisplayDevice信息封装类，在创建DisplayDevice时会进行创建，与之对应的是Logical display 的DisplayInfo；
final class DisplayDeviceInfo {

    public int rotation = Surface.ROTATION_0;

}

// LogicalDisplay信息的封装类，基本数据由DisplayDeviceInfo中获得，app可以通过WMS来修改自己的参数；
public final class DisplayInfo implements Parcelable {

    @Surface.Rotation
    public int rotation;

}

```

## RK3288 HDMI 旋转

| 属性值 | 含义 |
| ------ | ----- |
| ro.sf.hwrotation | 主屏初始方向 |
| ro.orientation.einit | 副屏初始方向 |
| ro.same.orientation | 主副屏方向是否相同 |
| ro.rotation.external | 副屏是否随主屏旋转 |
| persist.orientation.vhinit | DisplayDeviceInfo 描述一个物理屏幕默认方向 |
| persist.demo.hdmirotation | LocalDisplayAdapter 外部显示器默认方向 |
| persist.demo.hdmirotates | DisplayDeviceInfo.FLAG_ROTATES_WITH_CONTENT 显示和设备的方向和逻辑显示的方向一致 |
| sys.hwc.device.main | 查询当前主屏幕显示的输出接口 |
| sys.hwc.device.aux | 查询当前副屏幕显示的输出接口 |
| sys.hwc.device.primary | 设置显示接口作为主显 |
| sys.hwc.device.extend | 设置显示接口作为副显 |
| persist.sys.framebuffer.main | 设置分辨率 1920x1080 |

## FAQ

**RK3288 修改外部HDMI显示器的默认显示方向为竖屏**

1. persist.demo.hdmirotates=true
2. persist.demo.hdmirotation=portrait
3. persist.orientation.vhinit=1

**rk3588 HDMI 显示器方向修改**

persist.sys.rotation.einit-1=1  // HDMI 竖屏显示
persist.sys.rotation.efull-1=1  // HDMI 全屏显示

```java

final class LogicalDisplay {
    private static final String TAG = "LogicalDisplay";

    public void updateLocked(DisplayDeviceRepository deviceRepo) {
        --------------------------------------------------------------------------------

            if (SystemProperties.get("ro.board.platform").equals("rk356x") ||
                SystemProperties.get("ro.board.platform").equals("rk3588")) {
                if (deviceInfo.type == Display.TYPE_EXTERNAL) {
                    int mPhysicalDisplayId = Integer.valueOf(deviceInfo.uniqueId.split(":")[1]);
                    String property = "persist.sys.rotation.einit-" + mPhysicalDisplayId;
                    if (SystemProperties.getInt(property, 0) % 2 != 0) {
                        mBaseDisplayInfo.appWidth = deviceInfo.height;
                        mBaseDisplayInfo.appHeight = deviceInfo.width;
                        mBaseDisplayInfo.logicalWidth = deviceInfo.height;
                        mBaseDisplayInfo.logicalHeight = deviceInfo.width;
                    }
                }
            } else {
                if (deviceInfo.type == Display.TYPE_EXTERNAL) {
                    if (SystemProperties.getInt("persist.sys.rotation.einit", 0) % 2 != 0) {
                        mBaseDisplayInfo.appWidth = deviceInfo.height;
                        mBaseDisplayInfo.appHeight = deviceInfo.width;
                        mBaseDisplayInfo.logicalWidth = deviceInfo.height;
                        mBaseDisplayInfo.logicalHeight = deviceInfo.width;
                    }
                }
            }

        ---------------------------------------------------------------------------------
    }

    public void configureDisplayLocked(SurfaceControl.Transaction t,
            DisplayDevice device,
            boolean isBlanked) {
        --------------------------------------------------------------------------------------

        if (SystemProperties.get("ro.board.platform").equals("rk356x")||SystemProperties.get("ro.board.platform").equals("rk3588")) {
            if (displayDeviceInfo.type == Display.TYPE_EXTERNAL) {
                int mPhysicalDisplayId = Integer.valueOf(device.getDisplayDeviceInfoLocked().uniqueId.split(":")[1]);
                String property="persist.sys.rotation.efull-"+mPhysicalDisplayId;
                if (SystemProperties.getBoolean(property, false)) {
                    mTempDisplayRect.top = 0;
                    mTempDisplayRect.left = 0;
                    mTempDisplayRect.right = physWidth;
                    mTempDisplayRect.bottom = physHeight;
                }
            }
        } else {
            if (device.getDisplayDeviceInfoLocked().type == Display.TYPE_EXTERNAL) {
                if (SystemProperties.getBoolean("persist.sys.rotation.efull", false)) {
                    mTempDisplayRect.top = 0;
                    mTempDisplayRect.left = 0;
                    mTempDisplayRect.right = physWidth;
                    mTempDisplayRect.bottom = physHeight;
                }
            }
        }

        --------------------------------------------------------------------------------------
    }

}

```
































