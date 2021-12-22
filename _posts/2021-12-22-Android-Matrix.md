---
layout:     post
title:      Android Matrix
subtitle:   矩阵变换
date:       2021-12-22
author:     LXG
header-img: img/post-bg-map.jpg
catalog: true
tags:
    - android
---

[MPAndroidChart](https://github.com/PhilJay/MPAndroidChart)

[Android Matrix-简书](https://www.jianshu.com/p/5e30db034596)

## Matrix

Android android.graphics.Matrix 类是一个3 x 3的矩阵

![android_matrix](/images/view/android_matrix.png)

## 源码

frameworks/base/graphics/java/android/graphics/Matrix.java

[Matrix-Google](https://developer.android.google.cn/reference/android/graphics/Matrix?hl=zh-cn)

```java

/**
 * The Matrix class holds a 3x3 matrix for transforming coordinates.
 */
public class Matrix {

    /**
     * Create an identity matrix
     */
    public Matrix() {
        native_instance = native_create(0);
    }

    /**
     * Create a matrix that is a (deep) copy of src
     * @param src The matrix to copy into this matrix
     */
    public Matrix(Matrix src) {
        native_instance = native_create(src != null ? src.native_instance : 0);
    }


    /**
     * Set the matrix to scale by sx and sy, with a pivot point at (px, py).
     * The pivot point is the coordinate that should remain unchanged by the
     * specified transformation.
     */
    public void setScale(float sx, float sy, float px, float py) {
        native_setScale(native_instance, sx, sy, px, py);
    }

    private static native long native_create(long native_src_or_zero);

    private static native void native_setScale(long native_object,
                                        float sx, float sy, float px, float py);

}

```

## 矩阵乘法

![matrix_cal](/images/view/matrix_cal.awebp)

注意：矩阵的乘法不满足交换律

## 矩阵变换

|    英文     |    中文    |
| ----------- | ---------- | 
| Translate | 位移 |
| Rotate | 旋转 |
| Scale | 缩放 |
| Skew | 错切 |

## 位移

对应 MTRANS_X 与 MTRANS_Y

位移操作是指将坐标（x0,y0）平移一定的距离，我们直接将坐标加上平移的距离即可得到平移后的坐标：

![matrix_translate](/images/view/matrix_translate.webp)

```java

    /** Set the matrix to translate by (dx, dy). */
    public void setTranslate(float dx, float dy) {
        native_setTranslate(native_instance, dx, dy);
    }

    /**
     * Preconcats the matrix with the specified translation.
     * M' = M * T(dx, dy)
     */
    public boolean preTranslate(float dx, float dy) {
        native_preTranslate(native_instance, dx, dy);
        return true;
    }

    /**
     * Postconcats the matrix with the specified translation.
     * M' = T(dx, dy) * M
     */
    public boolean postTranslate(float dx, float dy) {
        native_postTranslate(native_instance, dx, dy);
        return true;
    }

```

## 缩放

对应 MSCALE_X 与 MSCALE_Y

假设对某个点宽度缩放 k1 倍，高度缩放 k2 倍，该点坐标为 x0、y0，缩放后坐标为 x、y，那么缩放的公式如下：

![matrix_scale](/images/view/matrix_scale.webp)

```java

    /**
     * Set the matrix to scale by sx and sy, with a pivot point at (px, py).
     * The pivot point is the coordinate that should remain unchanged by the
     * specified transformation.
     */
    public void setScale(float sx, float sy, float px, float py) {
        native_setScale(native_instance, sx, sy, px, py);
    }

    /**
     * Preconcats the matrix with the specified scale.
     * M' = M * S(sx, sy, px, py)
     */
    public boolean preScale(float sx, float sy, float px, float py) {
        native_preScale(native_instance, sx, sy, px, py);
        return true;
    }

    /**
     * Postconcats the matrix with the specified scale.
     * M' = S(sx, sy, px, py) * M
     */
    public boolean postScale(float sx, float sy, float px, float py) {
        native_postScale(native_instance, sx, sy, px, py);
        return true;
    }

```

**相机缩放**

相机预览比例和相机比例一致, 保持中心点坐标不动进行缩放

```java

        Matrix matrix = new Matrix();
        matrix = mPreview.getTransform(matrix);
        float scaleX = 1f, scaleY = 1f;
        float scaledTextureWidth, scaledTextureHeight;
        if (mWidth > mHeight * mAspectRatio) {
            scaledTextureWidth = mHeight * mAspectRatio;
            scaledTextureHeight = mHeight;
        } else {
            scaledTextureWidth = mWidth;
            scaledTextureHeight = mWidth / mAspectRatio;
        }

        scaleX = scaledTextureWidth / mWidth;
        scaleY = scaledTextureHeight / mHeight;

        matrix.setScale(scaleX, scaleY, (float) mWidth / 2, (float) mHeight / 2);

```

## 错切

对应 MSKEW_X 与 MSKEW_Y

![matrix_skew](/images/view/matrix_skew.webp)

```java

    /**
     * Set the matrix to skew by sx and sy, with a pivot point at (px, py).
     * The pivot point is the coordinate that should remain unchanged by the
     * specified transformation.
     */
    public void setSkew(float kx, float ky, float px, float py) {
        native_setSkew(native_instance, kx, ky, px, py);
    }


    /**
     * Preconcats the matrix with the specified skew.
     * M' = M * K(kx, ky, px, py)
     */
    public boolean preSkew(float kx, float ky, float px, float py) {
        native_preSkew(native_instance, kx, ky, px, py);
        return true;
    }

    /**
     * Postconcats the matrix with the specified skew.
     * M' = K(kx, ky, px, py) * M
     */
    public boolean postSkew(float kx, float ky, float px, float py) {
        native_postSkew(native_instance, kx, ky, px, py);
        return true;
    }

```

## 旋转

旋转相对以上三种变化又有一点复杂，这里涉及一些三角函数的计算

![matrix_rotate](/images/view/matrix_rotate.png)

![matrix_rotate](/images/view/matrix_rotate.webp)

```java

    /**
     * Set the matrix to rotate by the specified number of degrees, with a pivot
     * point at (px, py). The pivot point is the coordinate that should remain
     * unchanged by the specified transformation.
     */
    public void setRotate(float degrees, float px, float py) {
        native_setRotate(native_instance, degrees, px, py);
    }

    /**
     * Preconcats the matrix with the specified rotation.
     * M' = M * R(degrees, px, py)
     */
    public boolean preRotate(float degrees, float px, float py) {
        native_preRotate(native_instance, degrees, px, py);
        return true;
    }

    /**
     * Postconcats the matrix with the specified rotation.
     * M' = R(degrees) * M
     */
    public boolean postRotate(float degrees) {
        native_postRotate(native_instance, degrees);
        return true;
    }

```

## JNI

frameworks/base/libs/hwui/Matrix.cpp

```cpp

#include "GraphicsJNI.h"
#include "Matrix.h"
#include "SkMatrix.h"
#include "core_jni_helpers.h"

#include <Caches.h>
#include <jni.h>


static const JNINativeMethod methods[] = {
    {"finalizer", "(J)V", (void*) SkMatrixGlue::finalizer},
    {"native_create","(J)J", (void*) SkMatrixGlue::create},

    {"native_isIdentity","!(J)Z", (void*) SkMatrixGlue::isIdentity},
    {"native_isAffine","!(J)Z", (void*) SkMatrixGlue::isAffine},
    {"native_rectStaysRect","!(J)Z", (void*) SkMatrixGlue::rectStaysRect},
    {"native_reset","!(J)V", (void*) SkMatrixGlue::reset},
    {"native_set","!(JJ)V", (void*) SkMatrixGlue::set},
    {"native_setTranslate","!(JFF)V", (void*) SkMatrixGlue::setTranslate},
    {"native_setScale","!(JFFFF)V", (void*) SkMatrixGlue::setScale__FFFF},
    {"native_setScale","!(JFF)V", (void*) SkMatrixGlue::setScale__FF},
    {"native_setRotate","!(JFFF)V", (void*) SkMatrixGlue::setRotate__FFF},
    {"native_setRotate","!(JF)V", (void*) SkMatrixGlue::setRotate__F},
    {"native_setSinCos","!(JFFFF)V", (void*) SkMatrixGlue::setSinCos__FFFF},
    {"native_setSinCos","!(JFF)V", (void*) SkMatrixGlue::setSinCos__FF},
    {"native_setSkew","!(JFFFF)V", (void*) SkMatrixGlue::setSkew__FFFF},
    {"native_setSkew","!(JFF)V", (void*) SkMatrixGlue::setSkew__FF},
    {"native_setConcat","!(JJJ)V", (void*) SkMatrixGlue::setConcat},
    {"native_preTranslate","!(JFF)V", (void*) SkMatrixGlue::preTranslate},
    {"native_preScale","!(JFFFF)V", (void*) SkMatrixGlue::preScale__FFFF},
    {"native_preScale","!(JFF)V", (void*) SkMatrixGlue::preScale__FF},
    {"native_preRotate","!(JFFF)V", (void*) SkMatrixGlue::preRotate__FFF},
    {"native_preRotate","!(JF)V", (void*) SkMatrixGlue::preRotate__F},
    {"native_preSkew","!(JFFFF)V", (void*) SkMatrixGlue::preSkew__FFFF},
    {"native_preSkew","!(JFF)V", (void*) SkMatrixGlue::preSkew__FF},
    {"native_preConcat","!(JJ)V", (void*) SkMatrixGlue::preConcat},
    {"native_postTranslate","!(JFF)V", (void*) SkMatrixGlue::postTranslate},
    {"native_postScale","!(JFFFF)V", (void*) SkMatrixGlue::postScale__FFFF},
    {"native_postScale","!(JFF)V", (void*) SkMatrixGlue::postScale__FF},
    {"native_postRotate","!(JFFF)V", (void*) SkMatrixGlue::postRotate__FFF},
    {"native_postRotate","!(JF)V", (void*) SkMatrixGlue::postRotate__F},
    {"native_postSkew","!(JFFFF)V", (void*) SkMatrixGlue::postSkew__FFFF},
    {"native_postSkew","!(JFF)V", (void*) SkMatrixGlue::postSkew__FF},
    {"native_postConcat","!(JJ)V", (void*) SkMatrixGlue::postConcat},
    {"native_setRectToRect","!(JLandroid/graphics/RectF;Landroid/graphics/RectF;I)Z", (void*) SkMatrixGlue::setRectToRect},
    {"native_setPolyToPoly","!(J[FI[FII)Z", (void*) SkMatrixGlue::setPolyToPoly},
    {"native_invert","!(JJ)Z", (void*) SkMatrixGlue::invert},
    {"native_mapPoints","!(J[FI[FIIZ)V", (void*) SkMatrixGlue::mapPoints},
    {"native_mapRect","!(JLandroid/graphics/RectF;Landroid/graphics/RectF;)Z", (void*) SkMatrixGlue::mapRect__RectFRectF},
    {"native_mapRadius","!(JF)F", (void*) SkMatrixGlue::mapRadius},
    {"native_getValues","!(J[F)V", (void*) SkMatrixGlue::getValues},
    {"native_setValues","!(J[F)V", (void*) SkMatrixGlue::setValues},
    {"native_equals", "!(JJ)Z", (void*) SkMatrixGlue::equals}
};

```

## Skia

./external/skia/src/core/SkMatrix.cpp

![android_skia](/images/view/android_skia.webp)

**SkMatrix.h**

```cpp

    SkScalar         fMat[9];

    enum {
        kMScaleX,
        kMSkewX,
        kMTransX,
        kMSkewY,
        kMScaleY,
        kMTransY,
        kMPersp0,
        kMPersp1,
        kMPersp2
    };

```




