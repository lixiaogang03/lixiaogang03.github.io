---
layout:     post
title:      Android P StatusBar
subtitle:   StatusBarManagerService
date:       2020-09-16
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - statusbar
---

[十分钟了解Android触摸事件原理-简书](https://www.jianshu.com/p/0a72736a9a4a)

## View

```java

public class View implements Drawable.Callback, KeyEvent.Callback,
        AccessibilityEventSource {

    public static final int SYSTEM_UI_FLAG_VISIBLE = 0;                          // 显示状态栏
    public static final int SYSTEM_UI_FLAG_LOW_PROFILE = 0x00000001;             // 弱化状态栏和导航栏的图标
    public static final int SYSTEM_UI_FLAG_HIDE_NAVIGATION = 0x00000002;         // 隐藏导航栏
    public static final int SYSTEM_UI_FLAG_FULLSCREEN = 0x00000004;              // 需要下拉才显示状态栏

    public static final int SYSTEM_UI_FLAG_LAYOUT_STABLE = 0x00000100;           // 稳定的布局，不会随状态栏和导航栏的隐藏、显示而变化
    public static final int SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION = 0x00000200;  // 将布局内容拓展到导航栏的后面
    public static final int SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN = 0x00000400;       // 将布局内容拓展到状态栏的后面

    public static final int SYSTEM_UI_FLAG_IMMERSIVE = 0x00000800;               // 使状态栏和导航栏真正的进入沉浸模式，即全屏模式
    public static final int SYSTEM_UI_FLAG_IMMERSIVE_STICKY = 0x00001000;        // 沉浸模式，用户可以交互的界面。同时，用户上下拉系统栏时，会自动隐藏系统栏


    int mSystemUiVisibility;

    /**
     * Request that the visibility of the status bar or other screen/window
     * decorations be changed.
     *
     * @param visibility  Bitwise-or of flags {@link #SYSTEM_UI_FLAG_LOW_PROFILE},
     * {@link #SYSTEM_UI_FLAG_HIDE_NAVIGATION}, {@link #SYSTEM_UI_FLAG_FULLSCREEN},
     * {@link #SYSTEM_UI_FLAG_LAYOUT_STABLE}, {@link #SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION},
     * {@link #SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN}, {@link #SYSTEM_UI_FLAG_IMMERSIVE},
     * and {@link #SYSTEM_UI_FLAG_IMMERSIVE_STICKY}.
     */
    public void setSystemUiVisibility(int visibility) {
        if (visibility != mSystemUiVisibility) {
            mSystemUiVisibility = visibility;
            if (mParent != null && mAttachInfo != null && !mAttachInfo.mRecomputeGlobalAttributes) {
                mParent.recomputeViewAttributes(this);
            }
        }
    }

}

```

## 触摸事件模型

![touch_event](/images/view/touch_event.webp)

## 触摸时间派发

![touch_event_dispatch](/images/view/touch_event_dispatch.webp)





