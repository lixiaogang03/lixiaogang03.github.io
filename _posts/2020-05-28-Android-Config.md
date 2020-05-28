---
layout:     post
title:      Android Config
subtitle:   frameworks/base/core/res/res/values/config.xml
date:       2020-05-28
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - android
---

[config.xml-androidxref](http://androidxref.com/9.0.0_r3/xref/frameworks/base/core/res/res/values/)

[Android6.0之App中的资源管理对象创建](https://www.jianshu.com/p/56d6e00bb0a1)

[cc1over.github.io](https://cc1over.github.io/)

## config.xml

```xml

<string translatable="false" name="config_ntpServer">time.android.com</string>

```

## symbols.xml

**com.android.internal.R.string**

```xml

<java-symbol type="string" name="config_ntpServer" />

```

out/target/common/R/com/android/internal/R.java

```
package com.android.internal;

public final class R {

    public static final class string {

        public static final int config_ntpServer=0x01040054;

    }

```

## public.xml

**android.R.color**

```xml

<public type="color" name="white" id="0x0106000b" />
<public type="color" name="black" id="0x0106000c" />

```

out/target/common/R/android/R.java

```java

package android;

public final class R {

    public static final class color {

        public static final int black=0x0106000c;
        public static final int white=0x0106000b;

    }
}

```

## add config

1. config.xml
2. symbols.xml
3. mmm frameworks/base/core/res/
4. make update-api

## App

```java

context.getResources().getString(Resources.getSystem().getIdentifier("config_ntpServer", "string", "android"));

```

## framework-res.apk

![framework_res](/images/asset/framework_res.png)

## ResourcesManager

```java

class ContextImpl extends Context {

    private ContextImpl(ContextImpl container, ActivityThread mainThread,
            LoadedApk packageInfo, IBinder activityToken, UserHandle user, int flags,
            Display display, Configuration overrideConfiguration, int createDisplayWithId) {

        mResourcesManager = ResourcesManager.getInstance();

        ---------------------------------------------------------------------------------

                    resources = mResourcesManager.createBaseActivityResources(
                            activityToken,
                            packageInfo.getResDir(),
                            packageInfo.getSplitResDirs(),
                            packageInfo.getOverlayDirs(),
                            packageInfo.getApplicationInfo().sharedLibraryFiles,
                            displayId,
                            overrideConfiguration,
                            compatInfo,
                            packageInfo.getClassLoader());

        mResources = resources;

   }

    @Override
    public AssetManager getAssets() {
        return getResources().getAssets();
    }

    @Override
    public Resources getResources() {
        return mResources;
    }

}


/** @hide */
public class ResourcesManager {

    public @Nullable Resources createBaseActivityResources(@NonNull IBinder activityToken,
            @Nullable String resDir,
            @Nullable String[] splitResDirs,
            @Nullable String[] overlayDirs,
            @Nullable String[] libDirs,
            int displayId,
            @Nullable Configuration overrideConfig,
            @NonNull CompatibilityInfo compatInfo,
            @Nullable ClassLoader classLoader) {
        try {
            Trace.traceBegin(Trace.TRACE_TAG_RESOURCES,
                    "ResourcesManager#createBaseActivityResources");
            final ResourcesKey key = new ResourcesKey(
                    resDir,
                    splitResDirs,
                    overlayDirs,
                    libDirs,
                    displayId,
                    overrideConfig != null ? new Configuration(overrideConfig) : null, // Copy
                    compatInfo);
            classLoader = classLoader != null ? classLoader : ClassLoader.getSystemClassLoader();

            if (DEBUG) {
                Slog.d(TAG, "createBaseActivityResources activity=" + activityToken
                        + " with key=" + key);
            }

            synchronized (this) {
                // Force the creation of an ActivityResourcesStruct.
                getOrCreateActivityResourcesStructLocked(activityToken);
            }

            // Update any existing Activity Resources references.
            updateResourcesForActivity(activityToken, overrideConfig);

            // Now request an actual Resources object.
            return getOrCreateResources(activityToken, key, classLoader);
        } finally {
            Trace.traceEnd(Trace.TRACE_TAG_RESOURCES);
        }
    }

    private @Nullable Resources getOrCreateResources(@Nullable IBinder activityToken,
            @NonNull ResourcesKey key, @NonNull ClassLoader classLoader) {

        ----------------------------------------------------------------------------------

        // If we're here, we didn't find a suitable ResourcesImpl to use, so create one now.
        ResourcesImpl resourcesImpl = createResourcesImpl(key);

        ----------------------------------------------------------------------------------

    }

    private @Nullable ResourcesImpl createResourcesImpl(@NonNull ResourcesKey key) {
        final DisplayAdjustments daj = new DisplayAdjustments(key.mOverrideConfiguration);
        daj.setCompatibilityInfo(key.mCompatInfo);

        final AssetManager assets = createAssetManager(key);
        if (assets == null) {
            return null;
        }

        final DisplayMetrics dm = getDisplayMetrics(key.mDisplayId, daj);
        final Configuration config = generateConfig(key, dm);
        final ResourcesImpl impl = new ResourcesImpl(assets, dm, config, daj);
        if (DEBUG) {
            Slog.d(TAG, "- creating impl=" + impl + " with key: " + key);
        }
        return impl;
    }

    protected @Nullable AssetManager createAssetManager(@NonNull final ResourcesKey key) {
        AssetManager assets = new AssetManager();

        // resDir can be null if the 'android' package is creating a new Resources object.
        // This is fine, since each AssetManager automatically loads the 'android' package
        // already.
        if (key.mResDir != null) {
            if (assets.addAssetPath(key.mResDir) == 0) {
                Log.e(TAG, "failed to add asset path " + key.mResDir);
                return null;
            }
        }

        if (key.mSplitResDirs != null) {
            for (final String splitResDir : key.mSplitResDirs) {
                if (assets.addAssetPath(splitResDir) == 0) {
                    Log.e(TAG, "failed to add split asset path " + splitResDir);
                    return null;
                }
            }
        }

        if (key.mOverlayDirs != null) {
            for (final String idmapPath : key.mOverlayDirs) {
                assets.addOverlayPath(idmapPath);
            }
        }

        if (key.mLibDirs != null) {
            for (final String libDir : key.mLibDirs) {
                if (libDir.endsWith(".apk")) {
                    // Avoid opening files we know do not have resources,
                    // like code-only .jar files.
                    if (assets.addAssetPathAsSharedLibrary(libDir) == 0) {
                        Log.w(TAG, "Asset path '" + libDir +
                                "' does not exist or contains no resources.");
                    }
                }
            }
        }
        return assets;
    }

}

```





