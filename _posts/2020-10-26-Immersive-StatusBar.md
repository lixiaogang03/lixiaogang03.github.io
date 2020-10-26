---
layout:     post
title:      Immersive StatusBar
subtitle:   沉浸式状态栏
date:       2020-10-26
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - statusbar
---

[WindowInsets 在View下的的分发-简书](https://www.jianshu.com/p/756e94fa2e09)

## View.SYSTEM_UI_FLAG_IMMERSIVE

![immesive_mode](/images/statusbar/immesive_mode.png)

## WindowInsets

在Android源码的注释中解释为 window content 的一系列插入集合，final 型，不可修改，但后期可能继续扩展。其主要成员包括 mSystemWindowInsets， mWindowDecorInsets， mStableInsets。

```java

// android 9
public final class WindowInsets {

    // 表示全窗口下，被StatusBar, NavigationBar, IME 或者其它系统窗口部分或者全部覆盖的区域。
    private Rect mSystemWindowInsets;

    // 表示内容窗口下，被Android FrameWork提供的窗体，诸如ActionBar, TitleBar, ToolBar，部分或全部覆盖区域。
    private Rect mWindowDecorInsets;

    // 表示全窗口下，被系统UI部分或者全部覆盖的区域。
    private Rect mStableInsets;

    // 挖孔屏幕
    private DisplayCutout mDisplayCutout;

    private boolean mSystemWindowInsetsConsumed = false;
    private boolean mWindowDecorInsetsConsumed = false;
    private boolean mStableInsetsConsumed = false;
    private boolean mDisplayCutoutConsumed = false;

    // 这里的Rect的概念已经区别于View的Rect了，它的四个点已经不再表示围成矩形的坐标，而表示的是insets需要的左右的宽度，顶部和底部需要的高度。
    public int getSystemWindowInsetLeft() {
        return mSystemWindowInsets.left;
    }

    public int getSystemWindowInsetTop() {
        return mSystemWindowInsets.top;
    }

    public int getSystemWindowInsetRight() {
        return mSystemWindowInsets.right;
    }

    public int getSystemWindowInsetBottom() {
        return mSystemWindowInsets.bottom;
    }

    //---------------------------------------------消费Windowinsets-------------------------------------

    /**
     * Returns a copy of this WindowInsets with the system window insets fully consumed.
     *
     * @return A modified copy of this WindowInsets
     */
    public WindowInsets consumeSystemWindowInsets() {
        final WindowInsets result = new WindowInsets(this);
        result.mSystemWindowInsets = EMPTY_RECT;
        result.mSystemWindowInsetsConsumed = true;
        return result;
    }

    /**
     * Returns a copy of this WindowInsets with selected system window insets fully consumed.
     *
     * @param left true to consume the left system window inset
     * @param top true to consume the top system window inset
     * @param right true to consume the right system window inset
     * @param bottom true to consume the bottom system window inset
     * @return A modified copy of this WindowInsets
     * @hide pending API
     */
    public WindowInsets consumeSystemWindowInsets(boolean left, boolean top,
            boolean right, boolean bottom) {
        if (left || top || right || bottom) {
            final WindowInsets result = new WindowInsets(this);
            result.mSystemWindowInsets = new Rect(
                    left ? 0 : mSystemWindowInsets.left,
                    top ? 0 : mSystemWindowInsets.top,
                    right ? 0 : mSystemWindowInsets.right,
                    bottom ? 0 : mSystemWindowInsets.bottom);
            return result;
        }
        return this;
    }

    /**
     * Check if these insets have been fully consumed.
     *
     * <p>Insets are considered "consumed" if the applicable <code>consume*</code> methods
     * have been called such that all insets have been set to zero. This affects propagation of
     * insets through the view hierarchy; insets that have not been fully consumed will continue
     * to propagate down to child views.</p>
     *
     * <p>The result of this method is equivalent to the return value of
     * {@link View#fitSystemWindows(android.graphics.Rect)}.</p>
     *
     * @return true if the insets have been fully consumed.
     */
    public boolean isConsumed() {
        return mSystemWindowInsetsConsumed && mWindowDecorInsetsConsumed && mStableInsetsConsumed
                && mDisplayCutoutConsumed;
    }

}

```

## View

```java

public class View implements Drawable.Callback, KeyEvent.Callback,
        AccessibilityEventSource {

    public interface OnApplyWindowInsetsListener {
        public WindowInsets onApplyWindowInsets(View v, WindowInsets insets);
    }

    public WindowInsets dispatchApplyWindowInsets(WindowInsets insets) {
        try {
            mPrivateFlags3 |= PFLAG3_APPLYING_INSETS;
            if (mListenerInfo != null && mListenerInfo.mOnApplyWindowInsetsListener != null) {
                return mListenerInfo.mOnApplyWindowInsetsListener.onApplyWindowInsets(this, insets);
            } else {
                return onApplyWindowInsets(insets);
            }
        } finally {
            mPrivateFlags3 &= ~PFLAG3_APPLYING_INSETS;
        }
    }

    public WindowInsets onApplyWindowInsets(WindowInsets insets) {
        if ((mPrivateFlags3 & PFLAG3_FITTING_SYSTEM_WINDOWS) == 0) {
            // We weren't called from within a direct call to fitSystemWindows,
            // call into it as a fallback in case we're in a class that overrides it
            // and has logic to perform.
            if (fitSystemWindows(insets.getSystemWindowInsets())) {
                return insets.consumeSystemWindowInsets();
            }
        } else {
            // We were called from within a direct call to fitSystemWindows.
            if (fitSystemWindowsInt(insets.getSystemWindowInsets())) {
                return insets.consumeSystemWindowInsets();
            }
        }
        return insets;
    }

}

```

## ViewGroup

ViewGroup自身也会Apply WindowInsets，如果该过程中没有消耗掉WindowInsets，则会继续传递给 child 处理WindwInsets，如果child中消耗了WindowInsets, 则会退出分发循环

```java

public abstract class ViewGroup extends View implements ViewParent, ViewManager {

    @Override
    public WindowInsets dispatchApplyWindowInsets(WindowInsets insets) {
        insets = super.dispatchApplyWindowInsets(insets);
        if (!insets.isConsumed()) {
            final int count = getChildCount();
            for (int i = 0; i < count; i++) {
                insets = getChildAt(i).dispatchApplyWindowInsets(insets);
                if (insets.isConsumed()) {
                    break;
                }
            }
        }
        return insets;
    }

}

```




