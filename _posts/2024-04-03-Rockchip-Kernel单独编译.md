---
layout:     post
title:      Rockchip Kernel 单独编译
subtitle:   android 11 以上
date:       2024-04-03
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - rockchip
---

## rk3568 android 11

**先刷入固件rockdev/Image-rk3568_r/**

![rk3568_kernel_1](/images/rockchip/rk3568_kernel_1.png)

![rk3568_kernel_2](/images/rockchip/rk3568_kernel_2.png)


**执行如下脚本编译内核**

```sh

export WIF_SCREEN_SIZE=T7L_T7R

case $WIF_SCREEN_SIZE in
    T7L_T7R)
       export WIF_KERNEL_DTS=rk3568-wif-lvds-1024x600-rgb-1024x600
       ;;
    KLL)
       export WIF_KERNEL_DTS=rk3568-wif-mipi2lvds-1920x1080
       ;;
    ?)
       usage ;;
esac

cp rockdev/Image-rk3568_r/boot.img kernel/boot_sample.img

cd kernel

make ARCH=arm64 rockchip_defconfig android-11.config

make ARCH=arm64 BOOT_IMG=boot_sample.img $WIF_KERNEL_DTS.img -j24

```

**将kernel/boot.img单独刷入设备验证内核修改**

![rk3568_kernel_3](/images/rockchip/rk3568_kernel_3.png)




