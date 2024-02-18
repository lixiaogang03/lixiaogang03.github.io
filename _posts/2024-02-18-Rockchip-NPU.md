---
layout:     post
title:      Rockchip NPU
subtitle:   AI 人工智能
date:       2024-02-18
author:     LXG
header-img: img/post-bg-nvida.jpg
catalog: true
tags:
    - rockchip
---

## NPU 概念

NPU 英语全称为 Neural Process Unit，译为神经网络处理器。NPU 是在电路层来模拟人类的神经元和突触，所以特别擅长处理人工智能任务。

NPU 的诞生大大的降低了 CPU 和 GPU 的负担，任何的工作首先要经过 CPU, 然后 CPU 在根据这个任务的性质来决定是分给 GPU 还是 NPU, 如果是图像处理器方面，就分给 GPU，如果是人工智能方面，就分给 NPU。

NPU 的应用场景非常的广泛，如人脸跟踪、手势和身体跟踪、图像分类、视频监控、自动语音识别(ASR)和先进的驾驶员辅助系统(ADAS)等等。

## RKNPU

瑞芯微的处理器内置的 NPU，称之为 RKNPU。

![rockchip_npu](/images/rockchip/rockchip_npu.png)

瑞芯微 RK3568 芯片内置 NPU，是 RKNPU 第三代的代表产品, 特点如下：

1. 搭载全新自研架构
2. 支持整数 8、整数 16 卷积运算
3. 内置的 NPU 支持 INT8/INT16 混合操作
4. 推理工具支持：TensorFlow, Caffe, Tflite, Pytorch, Onnx NN, Android NN 等等
5. 高达 1 TOPS 的神经网络加速处理性能

RK3568NPU 是单个核心，包含 CNA 模块、 DPU 模块、PPU 模块。

* CNA 模块全称是 Convolution Neural Network Accelerator,也就是卷积神经网络加速器。
* DPU 模块全称是 dada processing Unit,也就是数据处理单元。
* PPU 模块全称是 Pooling Processing Unit,这个单元主要做 Polling 操作

![rk3568_rknpu](/images/rockchip/rk3568_rknpu.png)

## 软件架构

![rknpu_arch](/images/rockchip/rknpu_arch.png)

**rk3568驱动源码**

```txt

RK356X_Android11.0/kernel/drivers/rknpu$ tree
.
├── include
│   ├── rknpu_drv.h
│   ├── rknpu_fence.h
│   ├── rknpu_gem.h
│   ├── rknpu_ioctl.h
│   ├── rknpu_job.h
│   └── rknpu_reset.h
├── Kconfig
├── Makefile
├── rknpu_drv.c
├── rknpu_fence.c
├── rknpu_gem.c
├── rknpu_job.c
└── rknpu_reset.c

```

**rk3588驱动源码**

```txt

RK3588_Android12.0/kernel-5.10/drivers/rknpu$ tree
.
├── built-in.a
├── include
│   ├── rknpu_debugger.h
│   ├── rknpu_drv.h
│   ├── rknpu_fence.h
│   ├── rknpu_gem.h
│   ├── rknpu_ioctl.h
│   ├── rknpu_job.h
│   ├── rknpu_mem.h
│   └── rknpu_reset.h
├── Kconfig
├── Makefile
├── modules.order
├── rknpu_debugger.c
├── rknpu_drv.c
├── rknpu_fence.c
├── rknpu_gem.c
├── rknpu_job.c
├── rknpu_mem.c
└── rknpu_reset.c

```

## RKNNToolkit2 工具

RKNNToolkit2 工具主要作用是把常用的主流框架模型转换为最终运行在板端的 RKNN 模型。RKNNToolkit2 支持一些常见框架如下图所示:

![rknpu_toolkit2](/images/rockchip/rknpu_toolkit2.png)














