---
layout:     post
title:      Android P WindowConfiguration
subtitle:   窗口配置
date:       2020-08-12
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - wms
---

## 代码

### WindowConfiguration

```java

public class WindowConfiguration implements Parcelable, Comparable<WindowConfiguration> {

    /**
     * bounds that can differ from app bounds, which may include things such as insets.
     *
     * TODO: Investigate combining with {@link mAppBounds}. Can the latter be a product of the
     * former?
     */
    private Rect mBounds = new Rect();

    /**
     * {@link android.graphics.Rect} defining app bounds. The dimensions override usages of
     * {@link DisplayInfo#appHeight} and {@link DisplayInfo#appWidth} and mirrors these values at
     * the display level. Lower levels can override these values to provide custom bounds to enforce
     * features such as a max aspect ratio.
     */
    private Rect mAppBounds;

    //--------------------------------------------WindowingMode------------------------------------------

    /** The current windowing mode of the configuration. */
    private @WindowingMode int mWindowingMode;

    /** Windowing mode is currently not defined. */
    public static final int WINDOWING_MODE_UNDEFINED = 0;

    // 全屏模式
    /** Occupies the full area of the screen or the parent container. */
    public static final int WINDOWING_MODE_FULLSCREEN = 1;

    // 锁屏
    /** Always on-top (always visible). of other siblings in its parent container. */
    public static final int WINDOWING_MODE_PINNED = 2;

    // 分屏模式-1
    /** The primary container driving the screen to be in split-screen mode. */
    public static final int WINDOWING_MODE_SPLIT_SCREEN_PRIMARY = 3;

    // 分屏模式-2
    /**
     * The containers adjacent to the {@link #WINDOWING_MODE_SPLIT_SCREEN_PRIMARY} container in
     * split-screen mode.
     * NOTE: Containers launched with the windowing mode with APIs like
     * {@link ActivityOptions#setLaunchWindowingMode(int)} will be launched in
     * {@link #WINDOWING_MODE_FULLSCREEN} if the display isn't currently in split-screen windowing
     * mode
     * @see #WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY
     */
    public static final int WINDOWING_MODE_SPLIT_SCREEN_SECONDARY = 4;

    /**
     * Alias for {@link #WINDOWING_MODE_SPLIT_SCREEN_SECONDARY} that makes it clear that the usage
     * points for APIs like {@link ActivityOptions#setLaunchWindowingMode(int)} that the container
     * will launch into fullscreen or split-screen secondary depending on if the device is currently
     * in fullscreen mode or split-screen mode.
     */
    public static final int WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY =
            WINDOWING_MODE_SPLIT_SCREEN_SECONDARY;

    // 自由窗口模式
    /** Can be freely resized within its parent container. */
    public static final int WINDOWING_MODE_FREEFORM = 5;

    /** @hide */
    @IntDef(prefix = { "WINDOWING_MODE_" }, value = {
            WINDOWING_MODE_UNDEFINED,
            WINDOWING_MODE_FULLSCREEN,
            WINDOWING_MODE_PINNED,
            WINDOWING_MODE_SPLIT_SCREEN_PRIMARY,
            WINDOWING_MODE_SPLIT_SCREEN_SECONDARY,
            WINDOWING_MODE_FULLSCREEN_OR_SPLIT_SCREEN_SECONDARY,
            WINDOWING_MODE_FREEFORM,
    })
    public @interface WindowingMode {}

    //---------------------------------------------ActivityType-----------------------------------------

    /** The current activity type of the configuration. */
    private @ActivityType int mActivityType;

    // 未定义的类型
    /** Activity type is currently not defined. */
    public static final int ACTIVITY_TYPE_UNDEFINED = 0;

    // 标准类型
    /** Standard activity type. Nothing special about the activity... */
    public static final int ACTIVITY_TYPE_STANDARD = 1;

    // HOME 类型
    /** Home/Launcher activity type. */
    public static final int ACTIVITY_TYPE_HOME = 2;

    // Recent类型
    /** Recents/Overview activity type. There is only one activity with this type in the system. */
    public static final int ACTIVITY_TYPE_RECENTS = 3;

    //
    /** Assistant activity type. */
    public static final int ACTIVITY_TYPE_ASSISTANT = 4;

    /** @hide */
    @IntDef(prefix = { "ACTIVITY_TYPE_" }, value = {
            ACTIVITY_TYPE_UNDEFINED,
            ACTIVITY_TYPE_STANDARD,
            ACTIVITY_TYPE_HOME,
            ACTIVITY_TYPE_RECENTS,
            ACTIVITY_TYPE_ASSISTANT,
    })
    public @interface ActivityType {}

    //-----------------------------------WindowConfig--------------------------------------

    /** Bit that indicates that the {@link #mBounds} changed.
     * @hide */
    public static final int WINDOW_CONFIG_BOUNDS = 1 << 0;
    /** Bit that indicates that the {@link #mAppBounds} changed.
     * @hide */
    public static final int WINDOW_CONFIG_APP_BOUNDS = 1 << 1;
    /** Bit that indicates that the {@link #mWindowingMode} changed.
     * @hide */
    public static final int WINDOW_CONFIG_WINDOWING_MODE = 1 << 2;
    /** Bit that indicates that the {@link #mActivityType} changed.
     * @hide */
    public static final int WINDOW_CONFIG_ACTIVITY_TYPE = 1 << 3;

    /** @hide */
    @IntDef(flag = true, prefix = { "WINDOW_CONFIG_" }, value = {
            WINDOW_CONFIG_BOUNDS,
            WINDOW_CONFIG_APP_BOUNDS,
            WINDOW_CONFIG_WINDOWING_MODE,
            WINDOW_CONFIG_ACTIVITY_TYPE
    })
    public @interface WindowConfig {}


}


```

### Rect

```java

public final class Rect implements Parcelable {
    public int left;
    public int top;
    public int right;
    public int bottom;

    /**
     * @return the rectangle's width. This does not check for a valid rectangle
     * (i.e. left <= right) so the result may be negative.
     */
    public final int width() {
        return right - left;
    }

    /**
     * @return the rectangle's height. This does not check for a valid rectangle
     * (i.e. top <= bottom) so the result may be negative.
     */
    public final int height() {
        return bottom - top;
    }
}

```





