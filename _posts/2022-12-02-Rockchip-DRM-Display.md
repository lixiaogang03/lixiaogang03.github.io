---
layout:     post
title:      Rockchip DRM Display
subtitle:   屏幕调试
date:       2022-12-02
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - rockchip
---

Rockchip_Developer_Guide_DRM_Panel_Porting_CN.pdf

Rockchip_Developer_Guide_DRM_Display_Driver_CN.pdf

## 显示系统的硬件框架

**VOP 1.0 显示子系统架构**

![display_system](/images/rockchip/display_system.png)

**VOP 2.0 显示子系统架构**

![display_system_2](/images/rockchip/display_system_2.png)

从上面的 DSS 框图可以看到,在整个显示通路的最后端,是由 RGA,GPU、VPU 组成的显示图形加速模块,他们是专门针对图像处理优化设计的硬件 IP,能够高效的进行图像的生成和进一步处理(比如 GPU 通过 opengl 功能提供图像渲染功能,RGA 可以对图像数据进行缩放,旋转,合成等 2D 处理,VPU 可以高效的进行视频解码),从而减轻 CPU负担。

经过这些图像加速模块处理后的数据会存放在 DDR 中,然后由 VOP 读取,根据应用需求进行 Alpha 叠加,颜色空间转换,gamma 矫正,HDR 转换 等处理后,再发送到对应的显示接口模块(HDMI/DP/DSI/RGB/LVDS), 这些接口模块会把接收到的数据转换成符合各自协议的数据流,发送到显示器或者屏幕上,呈现在最终用户眼前。

目前 Rockchip 平台上存在两种 VOP 架构—— VOP 1.0 和 VOP 2.0,他们的主要的区别是对多显的支持方式不同,VOP 1.0 是用多 VOP 的方式来实现多屏幕显示,即正常情况下,一个 VOP 在同一时刻只能输出一路独立的显示时序,驱动一个屏幕显示独立的内容。如果需要实现双屏显示,则需要有两个 VOP 来实现,所以在 RK3288,RK3399,RK3326/PX30 的支持双显的平台上,都有两个独立的 VOP。

VOP 2.0 采用了统一显示架构,即整个 SOC 上只存在一个 VOP,但是在 VOP 的后端设计了多路独立的 Video Port(简称 VP) 输出接口,这些 VP 能够同时独立工作,并且输出相关独立的显示时序。比如在上面的 VOP 2.0 框图中,有三个VP,就能同时实现三屏异显。









