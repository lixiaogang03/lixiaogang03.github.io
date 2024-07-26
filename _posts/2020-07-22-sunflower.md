---
layout:     post
title:      sunflower
subtitle:   A gardening app illustrating Android development best practices with Android Jetpack.
date:       2020-07-22
author:     LXG
header-img: img/post-bg-miui6.jpg
catalog: true
tags:
    - sunflower
    - android
---

[sunflower-github](https://github.com/android/sunflower)

## Jetpack

[Jetpack-Google](https://developer.android.google.cn/jetpack?hl=zh-cn)

![jetpack](/images/android/jetpack.png)

## build.gradle

```gradle

dependencies {
    kapt "androidx.room:room-compiler:$rootProject.roomVersion"
    kapt "com.github.bumptech.glide:compiler:$rootProject.glideVersion"
    implementation "androidx.appcompat:appcompat:$rootProject.appCompatVersion"
    implementation "androidx.constraintlayout:constraintlayout:$rootProject.constraintLayoutVersion"
    implementation "androidx.core:core-ktx:$rootProject.ktxVersion"
    implementation "androidx.fragment:fragment-ktx:$rootProject.fragmentVersion"
    implementation "androidx.lifecycle:lifecycle-extensions:$rootProject.lifecycleVersion"
    implementation "androidx.lifecycle:lifecycle-livedata-ktx:$rootProject.lifecycleVersion"
    implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:$rootProject.lifecycleVersion"
    implementation "androidx.navigation:navigation-fragment-ktx:$rootProject.navigationVersion"
    implementation "androidx.navigation:navigation-ui-ktx:$rootProject.navigationVersion"
    implementation "androidx.paging:paging-runtime:$rootProject.pagingVersion"
    implementation "androidx.recyclerview:recyclerview:$rootProject.recyclerViewVersion"
    implementation "androidx.room:room-runtime:$rootProject.roomVersion"
    implementation "androidx.room:room-ktx:$rootProject.roomVersion"
    implementation "androidx.viewpager2:viewpager2:$rootProject.viewPagerVersion"
    implementation "androidx.work:work-runtime-ktx:$rootProject.workVersion"
    implementation "com.github.bumptech.glide:glide:$rootProject.glideVersion"
    implementation "com.google.android.material:material:$rootProject.materialVersion"
    implementation "com.google.code.gson:gson:$rootProject.gsonVersion"
    implementation "com.squareup.okhttp3:logging-interceptor:$rootProject.okhttpLoggingVersion"
    implementation "com.squareup.retrofit2:converter-gson:$rootProject.retrofitVersion"
    implementation "com.squareup.retrofit2:retrofit:$rootProject.retrofitVersion"
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk8:$rootProject.kotlinVersion"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:$rootProject.coroutinesVersion"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:$rootProject.coroutinesVersion"

    // Testing dependencies
    androidTestImplementation "androidx.arch.core:core-testing:$rootProject.coreTestingVersion"
    androidTestImplementation "androidx.test.espresso:espresso-contrib:$rootProject.espressoVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$rootProject.espressoVersion"
    androidTestImplementation "androidx.test.espresso:espresso-intents:$rootProject.espressoVersion"
    androidTestImplementation "androidx.test.ext:junit:$rootProject.testExtJunit"
    androidTestImplementation "androidx.test.uiautomator:uiautomator:$rootProject.uiAutomatorVersion"
    androidTestImplementation "androidx.work:work-testing:$rootProject.workVersion"
    androidTestImplementation "com.google.truth:truth:$rootProject.truthVersion"
    testImplementation "junit:junit:$rootProject.junitVersion"
}

```

androidx.appcompat	允许在平台旧版 API 上访问新 API（很多使用 Material Design）

androidx.coordinatorlayout	定位顶级应用微件，例如 AppBarLayout 和 FloatingActionButton

androidx.core		针对最新的平台功能和 API 调整应用，同时还支持旧设备

androidx.fragment	将您的应用细分为在一个 Activity 中托管的多个独立屏幕

androidx.lifecycle	构建生命周期感知型组件，这些组件可以根据 Activity 或 Fragment 的当前生命周期状态调整行为

androidx.navigation	构建和组织应用内界面，处理深层链接以及在屏幕之间导航

androidx.paging		在页面中加载数据，并在 RecyclerView 中呈现

androidx.recyclerview	在您的界面中显示大量数据，同时最大限度减少内存用量

androidx.room		创建、存储和管理由 SQLite 数据库支持的持久性数据

androidx.viewpager2	以可滑动的格式显示视图或 Fragment

androidx.work		调度和执行可延期且基于约束条件的后台任务

## kotlin

### project gradle

```gradle

    ext.kotlin_version = "1.3.72"

    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }

```

### app gradle

```gradle

apply plugin: 'kotlin-android'
apply plugin: 'kotlin-android-extensions'


dependencies {

    implementation "androidx.core:core-ktx:$rootProject.ktxVersion"
    implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk8:$rootProject.kotlinVersion"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:$rootProject.coroutinesVersion"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:$rootProject.coroutinesVersion"

}

```







