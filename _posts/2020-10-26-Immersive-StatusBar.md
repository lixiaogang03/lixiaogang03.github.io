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

![immesive_mode](/images/android/statusbar/immesive_mode.png)

## Android 9

### WindowInsets

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

### View

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

    @Deprecated
    protected boolean fitSystemWindows(Rect insets) {
        if ((mPrivateFlags3 & PFLAG3_APPLYING_INSETS) == 0) {
            if (insets == null) {
                // Null insets by definition have already been consumed.
                // This call cannot apply insets since there are none to apply,
                // so return false.
                return false;
            }
            // If we're not in the process of dispatching the newer apply insets call,
            // that means we're not in the compatibility path. Dispatch into the newer
            // apply insets path and take things from there.
            try {
                mPrivateFlags3 |= PFLAG3_FITTING_SYSTEM_WINDOWS;
                return dispatchApplyWindowInsets(new WindowInsets(insets)).isConsumed();
            } finally {
                mPrivateFlags3 &= ~PFLAG3_FITTING_SYSTEM_WINDOWS;
            }
        } else {
            // We're being called from the newer apply insets path.
            // Perform the standard fallback behavior.
            return fitSystemWindowsInt(insets);
        }
    }

    private boolean fitSystemWindowsInt(Rect insets) {
        if ((mViewFlags & FITS_SYSTEM_WINDOWS) == FITS_SYSTEM_WINDOWS) {
            mUserPaddingStart = UNDEFINED_PADDING;
            mUserPaddingEnd = UNDEFINED_PADDING;
            Rect localInsets = sThreadLocal.get();
            if (localInsets == null) {
                localInsets = new Rect();
                sThreadLocal.set(localInsets);
            }
            boolean res = computeFitSystemWindows(insets, localInsets);
            mUserPaddingLeftInitial = localInsets.left;
            mUserPaddingRightInitial = localInsets.right;
            internalSetPadding(localInsets.left, localInsets.top,
                    localInsets.right, localInsets.bottom);
            return res;
        }
        return false;
    }

}

```

### ViewGroup

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

### ViewRootImpl

```java

public final class ViewRootImpl implements ViewParent,
        View.AttachInfo.Callbacks, ThreadedRenderer.DrawCallbacks {

    void dispatchApplyInsets(View host) {
        WindowInsets insets = getWindowInsets(true /* forceConstruct */);
        final boolean dispatchCutout = (mWindowAttributes.layoutInDisplayCutoutMode
                == LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS);
        if (!dispatchCutout) {
            // Window is either not laid out in cutout or the status bar inset takes care of
            // clearing the cutout, so we don't need to dispatch the cutout to the hierarchy.
            insets = insets.consumeDisplayCutout();
        }
        host.dispatchApplyWindowInsets(insets);
    }

    private void performTraversals() {

        -----------------------------------------------------------------

            dispatchApplyInsets(host);

        ----------------------------------------------------------------

    }

}

```

## Android 11

### WindowInsets

```java

public final class WindowInsets {

    private final Insets[] mTypeInsetsMap;
    private final Insets[] mTypeMaxInsetsMap;
    private final boolean[] mTypeVisibilityMap;

    @Nullable private Rect mTempRect;
    private final boolean mIsRound;
    @Nullable private final DisplayCutout mDisplayCutout;

}

```

### WindowInsetsController

```java

/**
 * Interface to control windows that generate insets.
 *
 * TODO(118118435): Needs more information and examples once the API is more baked.
 */
public interface WindowInsetsController {

    int BEHAVIOR_SHOW_BARS_BY_TOUCH = 0;

    int BEHAVIOR_SHOW_BARS_BY_SWIPE = 1;

    int BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE = 2;

    /**
     * Determines the behavior of system bars when hiding them by calling {@link #hide}.
     * @hide
     */
    @Retention(RetentionPolicy.SOURCE)
    @IntDef(value = {BEHAVIOR_SHOW_BARS_BY_TOUCH, BEHAVIOR_SHOW_BARS_BY_SWIPE,
            BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE})
    @interface Behavior {
    }

    void show(@InsetsType int types);

    void hide(@InsetsType int types);

    void setSystemBarsAppearance(@Appearance int appearance, @Appearance int mask);

    @Appearance int getSystemBarsAppearance();

}

```

### InsetsController

```java

/**
 * Implements {@link WindowInsetsController} on the client.
 * @hide
 */
public class InsetsController implements WindowInsetsController, InsetsAnimationControlCallbacks {


    public interface Host {

        /**
         * @see WindowInsetsController#setSystemBarsAppearance
         */
        void setSystemBarsAppearance(@Appearance int appearance, @Appearance int mask);

        /**
         * @see WindowInsetsController#getSystemBarsAppearance()
         */
        @Appearance int getSystemBarsAppearance();

        /**
         * @see WindowInsetsController#setSystemBarsBehavior
         */
        void setSystemBarsBehavior(@Behavior int behavior);

        /**
         * @see WindowInsetsController#getSystemBarsBehavior
         */
        @Behavior int getSystemBarsBehavior();

    }


    public InsetsController(Host host) {}

    @Override
    public void setSystemBarsAppearance(@Appearance int appearance, @Appearance int mask) {
        mHost.setSystemBarsAppearance(appearance, mask);
    }

    @Override
    public @Appearance int getSystemBarsAppearance() {
        return mHost.getSystemBarsAppearance();
    }

    @Override
    public void setCaptionInsetsHeight(int height) {
        mCaptionInsetsHeight = height;
    }

    @Override
    public void setSystemBarsBehavior(@Behavior int behavior) {
        mHost.setSystemBarsBehavior(behavior);
    }

    @Override
    public @Appearance int getSystemBarsBehavior() {
        return mHost.getSystemBarsBehavior();
    }

}

```

### ViewRootImpl

```java

public final class ViewRootImpl implements ViewParent,
        View.AttachInfo.Callbacks, ThreadedRenderer.DrawCallbacks {

    private final InsetsController mInsetsController;
    private final ImeFocusController mImeFocusController;

    public ViewRootImpl(Context context, Display display, IWindowSession session,
            boolean useSfChoreographer) {

        mInsetsController = new InsetsController(new ViewRootInsetsControllerHost(this));

    }

    private void showInsets(@InsetsType int types, boolean fromIme) {
        mHandler.obtainMessage(MSG_SHOW_INSETS, types, fromIme ? 1 : 0).sendToTarget();
    }

    private void hideInsets(@InsetsType int types, boolean fromIme) {
        mHandler.obtainMessage(MSG_HIDE_INSETS, types, fromIme ? 1 : 0).sendToTarget();
    }

}

```

### ViewRootInsetsControllerHost

```java

public class ViewRootInsetsControllerHost implements InsetsController.Host {

    @Override
    public void setSystemBarsAppearance(int appearance, int mask) {
        mViewRoot.mWindowAttributes.privateFlags |= PRIVATE_FLAG_APPEARANCE_CONTROLLED;
        final InsetsFlags insetsFlags = mViewRoot.mWindowAttributes.insetsFlags;
        if (insetsFlags.appearance != appearance) {
            insetsFlags.appearance = (insetsFlags.appearance & ~mask) | (appearance & mask);
            mViewRoot.mWindowAttributesChanged = true;
            mViewRoot.scheduleTraversals();
        }
    }

    @Override
    public int getSystemBarsAppearance() {
        if ((mViewRoot.mWindowAttributes.privateFlags & PRIVATE_FLAG_APPEARANCE_CONTROLLED) == 0) {
            // We only return the requested appearance, not the implied one.
            return 0;
        }
        return mViewRoot.mWindowAttributes.insetsFlags.appearance;
    }

    @Override
    public void setSystemBarsBehavior(int behavior) {
        mViewRoot.mWindowAttributes.privateFlags |= PRIVATE_FLAG_BEHAVIOR_CONTROLLED;
        if (mViewRoot.mWindowAttributes.insetsFlags.behavior != behavior) {
            mViewRoot.mWindowAttributes.insetsFlags.behavior = behavior;
            mViewRoot.mWindowAttributesChanged = true;
            mViewRoot.scheduleTraversals();
        }
    }

    @Override
    public int getSystemBarsBehavior() {
        if ((mViewRoot.mWindowAttributes.privateFlags & PRIVATE_FLAG_BEHAVIOR_CONTROLLED) == 0) {
            // We only return the requested behavior, not the implied one.
            return 0;
        }
        return mViewRoot.mWindowAttributes.insetsFlags.behavior;
    }

}

```




