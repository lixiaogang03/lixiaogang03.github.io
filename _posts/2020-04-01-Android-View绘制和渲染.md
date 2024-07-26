---
layout:     post
title:      Android View 绘制和渲染
subtitle:   Drawing and Rendering
date:       2020-04-01
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
    - view
---

[一文彻底搞懂Android View的绘制流程](https://juejin.im/post/5e17e4726fb9a030176e6352)

[深入Android渲染机制](https://www.jianshu.com/p/1ef2a9e5aa91)

[Android基于Choreographer的渲染机制详解](https://zhuanlan.zhihu.com/p/87954949)

## App Launch Systrace

![systrace_app_launch](/images/performance/systrace/systrace_app_launch.png)

## View Drawing Rendering

![view_drawing_rendering](/images/performance/systrace/view_drawing_rendering.png)

## performTraversals

```java

//ViewRootImpl.java

private void performTraversals() {

    int childWidthMeasureSpec = getRootMeasureSpec(mWidth, lp.width);
    int childHeightMeasureSpec = getRootMeasureSpec(mHeight, lp.height);

    //执行测量流程
    performMeasure(childWidthMeasureSpec, childHeightMeasureSpec);

    //执行布局流程
    performLayout(lp, desiredWindowWidth, desiredWindowHeight);

    //执行绘制流程
    performDraw();
}

```

![perform_traversals](/images/android/view/perform_traversals.webp)

## View Rendering

UI对象---->CPU处理为多维图形,纹理-----通过OpeGL ES接口调用GPU---->GPU对图进行光栅化(Frame Rate)---->硬件时钟(Refresh Rate)----垂直同步---->投射到屏幕

![view_rendering](/images/android/view/view_rendering.webp)









