---
layout:     post
title:      Android KeyEvent
subtitle:   软件模拟按键事件
date:       2020-01-19
author:     LXG
header-img: img/post-bg-keybord.jpg
catalog: true
tags:
    - android
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

![input_keyevent](/images/input_manager/input_keyevent.png)


