---
layout:     post
title:      Android KeyEvent
subtitle:   软件模拟按键事件
date:       2020-01-19
author:     LXG
header-img: img/post-bg-keybord.jpg
catalog: true
tags:
    - Android
---


## adb shell input

```txt

Usage: input [<source>] <command> [<arg>...]

The sources are: 
      keyboard
      mouse
      joystick
      touchnavigation
      touchpad
      trackball
      dpad
      stylus
      gamepad
      touchscreen

The commands and default sources are:
      text <string> (Default: touchscreen)
      keyevent [--longpress] <key code number or name> ... (Default: keyboard)
      tap <x> <y> (Default: touchscreen)
      swipe <x1> <y1> <x2> <y2> [duration(ms)] (Default: touchscreen)
      press (Default: trackball)
      roll <dx> <dy> (Default: trackball)

```

![input_keyevent](/images/android/input_manager/input_keyevent.png)

## KeyEvent

[KeyEvent.java](http://androidxref.com/7.1.2_r36/xref/frameworks/base/core/java/android/view/KeyEvent.java)

```java

public class KeyEvent extends InputEvent implements Parcelable {

    private int mDeviceId;      // 按键设备
    private int mSource;        // 设备类型：键盘、鼠标，InputDevice
    private int mMetaState;     // 组合键功能键状态按下状态，例如CTRL、SHIFT
    private int mAction;        // down up
    private int mKeyCode;       // 键值
    private int mScanCode;      // 底层按键扫描码
    private int mRepeatCount;   // 长按时的重复次数
    private int mFlags;         // flags The flags for this key event
    private long mDownTime;     // 按下的时间
    private long mEventTime;    // 事件发生的时间
    private String mCharacters;

}

```
