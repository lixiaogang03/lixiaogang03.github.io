---
layout:     post
title:      RK3568 USB 相机固定CameraID
subtitle:   使用 Cursor 实现修改
date:       2026-01-17
author:     LXG
header-img: img/post-bg-camera.jpg
catalog: true
tags:
    - camera
---

## 目标需求

RK3568 Androd 11 主板接了三个USB相机

1. 其中一个相机直接接在RK3568 USB控制器上
2. 另外相机接在RK3568 引出的USB hub上

需求是在相机插入的USB口不变的情况下，APP 获取到的三个相机的CameraID 保持不变, 也就是绑定USB口和CameraID

**注意事项**

一个相机会生成两个节点，比如/dev/video0 和 /dev/video1

```markdown

RK3568 USB Host
 ├── 直连 USB 口
 └── USB Hub
     ├── Hub Port 1
     └── Hub Port 2

```

## 原生固件 CameraID 会漂移的原因

1. USB 设备被内核发现的顺序
2. Hub 下设备 probe 时序（受供电、reset、延迟影响）
3. 插拔 / 重启时 /dev/video* 的生成顺序
4. ExternalCameraProviderImpl 内部的 addExternalCamera() 顺序

## Chatgpt 需求分析

**需要驱动和HAL层配合来修改此问题**

```markdown

硬件
 ↓
驱动：稳定暴露物理身份
 ↓
HAL：用物理身份做确定性映射
 ↓
Framework / APP：稳定 CameraID

```

**数据流图**

```less

[ 物理 USB 口 ]
        │
        ▼
[ USB Host / Hub 拓扑 ]
        │
        ▼
[ Linux USB Core ]
        │
        ▼
[ UVC Driver ]
        │
        ▼
[ V4L2 video 设备 (/dev/videoX) ]
        │
        ├── sysfs: /sys/class/video4linux/videoX/device
        │
        ├── symlink: /dev/v4l/by-path/xxx-video-index0
        │
        ▼
[ External Camera HAL ]
        │
        ▼
[ CameraProviderManager ]
        │
        ▼
[ CameraService ]
        │
        ▼
[ APP / CameraManager.getCameraIdList() ]

```

## 驱动部分修改

```bash

# USB 1
rk3568_r:/ $ readlink /sys/class/video4linux/video0/device
../../../2-1:1.0

# USB 2
rk3568_r:/ $ readlink /sys/class/video4linux/video0/device
../../../1-1.1:1.0

# USB 3
rk3568_r:/ $ readlink /sys/class/video4linux/video0/device
../../../1-1.2:1.0

# USB 4
rk3568_r:/ $ readlink /sys/class/video4linux/video0/device
../../../1-1.4:1.0

# USB 5
rk3568_r:/ $ readlink /sys/class/video4linux/video0/device
../../../5-1:1.0

```

**注意事项**

一个相机会生成两个节点，比如/dev/video0 和 /dev/video1

## Cursor 实现步骤

**开始初始化**

```scss

                     ┌─────────────────────────────┐
                     │ 发现 /dev/videoX 设备       │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │ getStableCameraIdLocked()   │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                   ┌─────────────────────────────┐
                   │ 获取 USB 物理端口路径       │
                   │ (extractUsbPortPath)        │
                   └─────────────┬───────────────┘
                                 │
               ┌─────────────────┴─────────────────┐
               │                                   │
               ▼                                   ▼
      ┌─────────────────────┐           ┌─────────────────────────┐
      │ 固定端口映射表中？  │           │ 不在固定映射表中       │
      └─────────────┬───────┘           └─────────────┬───────────┘
                    │ Yes                               │ No
                    ▼                                   ▼
      ┌─────────────────────────┐           ┌──────────────────────────────┐
      │ 使用固定 CameraID       │           │ 查找运行时映射表 mUsbToCameraIdMap │
      └─────────────┬───────────┘           └─────────────┬────────────────┘
                    │ Found                         │ Found
                    ▼                               ▼
          ┌─────────────────────┐           ┌─────────────────────┐
          │ 返回 CameraID       │           │ 返回 CameraID       │
          └─────────────┬───────┘           └─────────────┬───────┘
                        │                               │
                        ▼                               ▼
                  ┌───────────────┐              ┌───────────────┐
                  │ Not Found?     │              │ Not Found?    │
                  └──────┬────────┘              └──────┬────────┘
                         │ Yes                           │ Yes
                         ▼                               ▼
              ┌─────────────────────────┐     ┌─────────────────────────┐
              │ 动态分配新的 CameraID   │     │ 动态分配新的 CameraID   │
              │ (从 cameraIdOffset 开始)│     │ (从 cameraIdOffset 开始)│
              └─────────────┬───────────┘     └─────────────┬───────────┘
                            ▼                               ▼
             ┌─────────────────────────────┐  ┌─────────────────────────────┐
             │ 更新映射表 mUsbToCameraIdMap │  │ 更新映射表 mUsbToCameraIdMap │
             │ mCameraIdToUsbMap           │  │ mCameraIdToUsbMap           │
             └─────────────┬───────────────┘  └─────────────┬───────────────┘
                           ▼                               ▼
                  ┌─────────────────────┐          ┌─────────────────────┐
                  │ 返回 CameraID 给 HAL │          │ 返回 CameraID 给 HAL │
                  └─────────────────────┘          └─────────────────────┘


```

**热插拔**

```scss

                     ┌─────────────────────────────┐
                     │ deviceAdded(devName)        │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │ getStableCameraIdLocked()   │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                   ┌─────────────────────────────┐
                   │ 检查 USB 物理端口是否已有  │
                   │ CameraID 映射               │
                   └─────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
      ┌─────────────────────────────┐    ┌─────────────────────────────┐
      │ 映射存在 → 使用原 CameraID   │    │ 映射不存在 → 分配新 CameraID │
      └─────────────┬───────────────┘    └─────────────┬───────────────┘
                    │                               │
                    ▼                               ▼
           ┌─────────────────────────┐     ┌─────────────────────────┐
           │ 更新映射表 mUsbToCameraIdMap │   │ 更新映射表 mUsbToCameraIdMap │
           └─────────────┬───────────┘     └─────────────┬───────────┘
                         ▼                               ▼
                 ┌─────────────────────┐          ┌─────────────────────┐
                 │ 返回 CameraID 给 HAL │          │ 返回 CameraID 给 HAL │
                 └─────────────┬───────┘          └─────────────┬───────┘
                               │
                               ▼
                     ┌─────────────────────────────┐
                     │ deviceRemoved(devName)       │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │ 获取 USB 物理端口路径       │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │ 查找映射表 mUsbToCameraIdMap │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │ 保留映射关系不删除          │
                     │ (热插拔复用 CameraID)       │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │ 更新 mCameraStatusMap       │
                     │ 通知 HAL 状态变为不可用     │
                     └─────────────────────────────┘


```


* 检测 USB 相机插入（如 /dev/video0）
* 读取 symlink /sys/class/video4linux/video0/device → ../../../2-1:1.0
* 转换为绝对路径并找到 USB 设备目录
* 提取物理端口路径 → 2-1（去掉 :1.0 接口号）
* 查找硬编码映射表 → 找到 2-1 → 返回 "100"
* APP 获取到的 CameraID = 100


















