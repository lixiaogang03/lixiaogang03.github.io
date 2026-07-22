---
layout:     post
title:      Nvidia Isaac Sim
subtitle:   物理仿真
date:       2026-07-22
author:     LXG
header-img: img/post-bg-nvida.jpg
catalog: true
tags:
    - ROS2
---

## 概念

NVIDIA Isaac Sim 是 NVIDIA 基于 Omniverse 物理仿真平台开发的机器人仿真环境。

## Isaac Sim 在机器人系统中的位置

传统无人车开发流程：

```md

机器人
 |
传感器
 |
ROS2
 |
Nav2
 |
真机测试

```

问题：

* 改一次底盘需要重新测试
* 相机参数难验证
* SLAM问题难复现

**Isaac Sim**

```md

             Isaac Sim

      虚拟展厅/仓库环境

              |
      -----------------
      |       |       |
    LiDAR   Camera   IMU

              |
              |
            ROS2

              |
        Nav2 / SLAM
              |
          算法验证

```

## Isaac Sim 的核心组成

```md

                Isaac Sim

                    |
        --------------------------------

        场景系统
        USD世界

        物理引擎
        PhysX

        机器人模型
        URDF/USD

        传感器模拟

        ROS2接口

        AI训练工具

        数据生成

```



















