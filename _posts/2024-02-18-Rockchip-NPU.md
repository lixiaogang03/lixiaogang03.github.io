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

[RKNN 下载地址firefly](https://www.t-firefly.com/doc/download/181.html)

## 通过 pip install 安装并推理

**安装python**

sudo apt-get install python3 python3-dev python3-pip

**安装依赖包**

sudo apt-get install libxslt1-dev zlib1g-dev libglib2.0 libsm6 libgl1-mesa-glx libprotobuf-dev gcc

rknn-toolkit2$ sudo pip3 install -r doc/requirements_cp36-1.5.0.txt -i https://mirrors.aliyun.com/pypi/simple/

-i https://mirrors.aliyun.com/pypi/simple/ 表示使用国内阿里镜像源安装

requirements_cp310-1.5.0.txt

```sh

# if install failed, please change the pip source to 'https://mirror.baidu.com/pypi/simple'

# base deps
# NumPy（Numerical Python）是Python编程语言中最重要的科学计算库之一，它为Python提供了一个强大的N维数组对象（ndarray），以及用于处理这些数组的各种数学函数、逻辑操作和工具
numpy==1.23.4

# Protocol Buffers（通常简称为protobuf）是Google开发的一种灵活、高效且与语言无关的序列化结构数据格式。它提供了一种方法，可以将结构化数据以紧凑的二进制格式进行序列化和反序列化，并且允许在不同编程语言之间轻松地交换数据
protobuf==3.20.3

# FlatBuffers库是Google开发的一款高效、跨平台的序列化库，其设计目标在于提供一种比传统序列化方法更快、更节省内存的数据存储和传输方式
flatbuffers==2.0

# utils
# requests库是Python中用于发送HTTP请求的一个流行库，它简化了与Web服务器进行通信的过程
requests==2.28.1

# psutil库在Python编程中扮演着系统和进程监控的重要角色。它是一个跨平台的库，可用于获取详细的系统及进程信息，并进行相关的系统管理操作
psutil==5.9.0

# ruamel.yaml库是Python中用于处理YAML数据的强大工具
ruamel.yaml==00.17.21

# scipy 库是 Python 中的一个核心科学计算库，它提供了广泛的数学、科学和工程计算功能。
scipy==1.9.3

# tqdm库是一个Python第三方进度条工具，主要用于在命令行界面（CLI）中实时显示任务的执行进度。当程序需要处理大量迭代操作或者耗时较长的任务时，使用tqdm可以让用户直观地看到当前任务已经完成多少以及剩余的工作量
tqdm==4.64.1
# opencv-python库是OpenCV项目的Python接口，它是一个功能强大的计算机视觉库，主要用于图像和视频处理
opencv-python==4.5.5.64

# fast-histogram库是一个用于Python的高性能直方图计算工具包。它的主要作用是提供一种快速且内存高效的手段来计算一维和二维数据分布的直方图。
# 相比于标准库中的numpy.histogram等函数，这个第三方库在处理大数据集时能够显著提升计算速度。
fast-histogram==0.11

# base
# ONNX（Open Neural Network Exchange）库是为了促进深度学习和机器学习模型在不同框架间的互操作性而创建的开源库
onnx==1.13.1
onnxoptimizer==0.3.8
onnxruntime==1.14.1
# PyTorch库（通常简称为torch库）是一个基于Python的开源机器学习库，主要由Facebook的人工智能研究团队开发和维护。
# 它的核心作用是提供了一套用于构建和训练神经网络的强大工具，并支持多种深度学习任务，包括但不限于计算机视觉、自然语言处理、强化学习等领域的研究与应用
torch==1.13.1
torchvision==0.14.1
tensorflow==2.8.0

```

**安装 RKNN-Toolkit2**

pip3 install packages/rknn_toolkit2-1.5.0+1fa95b5c-cp310-cp310-linux_x86_64.whl














