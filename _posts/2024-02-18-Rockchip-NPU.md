---
layout:     post
title:      Rockchip NPU
subtitle:   AI 人工智能
date:       2024-02-18
author:     LXG
header-img: img/post-bg-nvida.jpg
catalog: true
tags:
    - Rockchip
    - AI
---

[嵌入式AI应用开发实战指南](https://doc.embedfire.com/linux/rk356x/Ai/zh/latest/README.html)

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

## 文档资料

hardware/rockchip/rknpu2

```txt

rk3588_android_12/hardware/rockchip/rknpu2$ tree -L 2
.
├── doc
│   ├── RK3588_NPU_SRAM_usage.md
│   ├── RKNN_Compiler_Support_Operator_List_v1.4.0.pdf
│   ├── Rockchip_Quick_Start_RKNN_SDK_V1.4.0_CN.pdf
│   ├── Rockchip_RKNPU_User_Guide_RKNN_API_V1.4.0_CN.pdf
│   ├── Rockchip_RKNPU_User_Guide_RKNN_API_V1.4.0_EN.pdf
│   └── Rockchip_RV1106_Quick_Start_RKNN_SDK_V1.4.0_CN.pdf
├── examples
│   ├── 3rdparty
│   ├── librknn_api_android_demo
│   ├── README.md
│   ├── rknn_api_demo
│   ├── rknn_common_test
│   ├── rknn_internal_mem_reuse_demo
│   ├── rknn_mobilenet_demo
│   ├── rknn_multiple_input_demo
│   ├── rknn_ssd_demo
│   ├── rknn_yolov5_android_apk_demo
│   ├── rknn_yolov5_demo
│   └── RV1106_RV1103
├── LICENSE
├── README.md
├── rknn_server_proxy.md
├── rknpu.mk
└── runtime
    ├── Android.bp
    ├── Android.go
    ├── init.rknn_server.rc
    ├── RK356X
    ├── RK3588
    └── RV1106

```

**rknn-toolkit2**

```txt

rk3588_android_12/hardware/rockchip/rknn-toolkit2$ tree -L 3
.
├── doc
│   ├── changelog-1.4.0.txt
│   ├── requirements_cp36-1.4.0.txt
│   ├── requirements_cp38-1.4.0.txt
│   ├── RKNNToolKit2_API_Difference_With_Toolkit1-1.4.0.md
│   ├── RKNNToolKit2_OP_Support-1.4.0.md
│   ├── Rockchip_Quick_Start_RKNN_Toolkit2_CN-1.4.0.pdf
│   ├── Rockchip_Quick_Start_RKNN_Toolkit2_EN-1.4.0.pdf
│   ├── Rockchip_User_Guide_RKNN_Toolkit2_CN-1.4.0.pdf
│   └── Rockchip_User_Guide_RKNN_Toolkit2_EN-1.4.0.pdf
├── examples
│   ├── caffe
│   │   ├── mobilenet_v2
│   │   └── vgg-ssd
│   ├── darknet
│   │   └── yolov3_416x416
│   ├── functions
│   │   ├── accuracy_analysis
│   │   ├── batch_size
│   │   ├── board_test
│   │   ├── hybrid_quant
│   │   ├── mmse
│   │   └── multi_input_test
│   ├── onnx
│   │   ├── resnet50v2
│   │   └── yolov5
│   ├── pytorch
│   │   ├── resnet18
│   │   ├── resnet18_export_onnx
│   │   └── resnet18_qat
│   ├── readme.txt
│   ├── tensorflow
│   │   ├── inception_v3_qat
│   │   └── ssd_mobilenet_v1
│   └── tflite
│       ├── mobilenet_v1
│       └── mobilenet_v1_qat
├── LICENSE
├── packages
│   ├── md5sum.txt
│   ├── rknn_toolkit2-1.4.0_22dcfef4-cp36-cp36m-linux_x86_64.whl
│   └── rknn_toolkit2-1.4.0_22dcfef4-cp38-cp38-linux_x86_64.whl
├── README.md
└── rknn_toolkit_lite2
    ├── docs
    │   ├── change_log.txt
    │   ├── Rockchip_User_Guide_RKNN_Toolkit_Lite2_V1.4.0_CN.pdf
    │   └── Rockchip_User_Guide_RKNN_Toolkit_Lite2_V1.4.0_EN.pdf
    ├── examples
    │   └── inference_with_lite
    └── packages
        ├── rknn_toolkit_lite2-1.4.0-cp37-cp37m-linux_aarch64.whl
        ├── rknn_toolkit_lite2-1.4.0-cp39-cp39-linux_aarch64.whl
        └── rknn_toolkit_lite2_1.4.0_packages.md5sum


```

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

## 查看NPU驱动版本

**方法1：代码中查看**

kernel/drivers/rknpu/include/rknpu_drv.h

```c

#define DRIVER_NAME "rknpu"
#define DRIVER_DESC "RKNPU driver"
#define DRIVER_DATE "20220829"
#define DRIVER_MAJOR 0
#define DRIVER_MINOR 8
#define DRIVER_PATCHLEVEL 2

```

**方法2：内核日志查看**

```txt

1|rk3568_r:/ $ dmesg | grep rknpu
[   10.397460] [drm] Initialized rknpu 0.8.2 20220428 for fde40000.npu on minor 1

```

## rknn_server

RK356X 和 RK3588 平台 NPU SDK 包含了 API 使用示例程序、NPU 运行库、服务程序、文档。服务程序称为 rknn_server，是在开发板上常驻的服务进程，用于连板推理。开发者使用 USB
连接开发板并在 PC 上使用 rknn-toolkit2 的 python 接口运行模型时，依赖服务进程建立通信，安装使用方式参考《rknn_server_proxy.md》

**查看rknn_server版本号**

```txt

rk3568_r:/ $ rknn_server
start rknn server, version:1.4.0 (bb6dac9 build: 2022-08-29 16:16:39)

```

## librknnrt

Android 平台有两种方式来调用 RKNN API
1. 应用直接链接 librknnrt.so
2 应用链接 Android 平台 HIDL 实现的 librknn_api_android.so

对于需要通过 CTS/VTS 测试的 Android 设备可以使用基于 Android 平台 HIDL 实现的 RKNN API。如果不需要通过 CTS/VTS 测试的设备建议直接链接使用 librknnrt.so，对各个接口调用流程的链路更短，可以提供更好的性能。

**查看librknnrt版本号**

```txt

2|rk3568_r:/ # strings /vendor/lib64/librknnrt.so  | grep librknnrt
librknnrt.so
librknnrt version: 1.4.0 (a10f100eb@2022-09-09T09:06:40)

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

## 安卓系统运行NPU程序

**SDK源码**

```txt

RK_NPU_SDK_1.5.0/rknpu2_1.5.0/rknpu2$ tree -L 2
.
├── doc
│   ├── RK3588_NPU_SRAM_usage.md
│   ├── RKNN_Compiler_Support_Operator_List_v1.5.0.pdf
│   ├── RKNN_Dynamic_Shape_Usage.md
│   ├── Rockchip_Quick_Start_RKNN_SDK_V1.5.0_CN.pdf
│   ├── Rockchip_RKNPU_User_Guide_RKNN_API_V1.5.0_CN.pdf
│   ├── Rockchip_RKNPU_User_Guide_RKNN_API_V1.5.0_EN.pdf
│   └── Rockchip_RV1106_Quick_Start_RKNN_SDK_V1.5.0_CN.pdf
├── examples
│   ├── 3rdparty
│   ├── librknn_api_android_demo
│   ├── README.md
│   ├── rknn_api_demo
│   ├── rknn_benchmark
│   ├── rknn_common_test
│   ├── rknn_dynamic_shape_input_demo
│   ├── rknn_internal_mem_reuse_demo
│   ├── rknn_matmul_api_demo
│   ├── rknn_mobilenet_demo            // MobileNet 图像分类
│   ├── rknn_multiple_input_demo
│   ├── rknn_yolov5_android_apk_demo   // YOLOv5 目标检测
│   ├── rknn_yolov5_demo
│   └── RV1106_RV1103
├── LICENSE
├── README.md
├── rknn_server_proxy.md
├── rknpu.mk
└── runtime
    ├── Android.bp
    ├── Android.go
    ├── init.rknn_server.rc
    ├── RK356X
    ├── RK3588
    └── RV1106

```

**瑞芯微提供了需要通过CTS认证的设备需要使用的标准接口**

vendor/rockchip/hardware/interfaces/neuralnetworks/1.0/

```txt

rk3588_android_12/vendor/rockchip/hardware/interfaces/neuralnetworks/1.0$ tree -L 1
.
├── Android.bp
├── default
├── IGetResultCallback.hal
├── ILoadModelCallback.hal
├── IRKNeuralnetworks.hal
├── librknnhal_bridge
├── nnapi_implementation
├── README.md
└── types.hal

```

**下载ndk**

[android-ndk-r26c-linux.zip](https://developer.android.google.cn/ndk/downloads?hl=zh-cn)

**修改ndk路径**

rknpu2_1.5.0/rknpu2/examples/rknn_yolov5_demo/build-android_RK3588.sh

**编译**

build-android_RK3588.sh

**编译生成文件**

```txt

examples/rknn_yolov5_demo/install/rknn_yolov5_demo_Android$ tree
.
├── lib
│   ├── libmpp.so
│   ├── librga.so
│   └── librknnrt.so
├── model
│   ├── bus.jpg
│   ├── coco_80_labels_list.txt
│   ├── RK3562
│   │   └── yolov5s-640-640.rknn
│   ├── RK3566_RK3568
│   │   └── yolov5s-640-640.rknn
│   ├── RK3588
│   │   └── yolov5s-640-640.rknn
│   └── RV110X
│       └── yolov5s-640-640.rknn
├── rknn_yolov5_demo
└── rknn_yolov5_video_demo

```

RKNN 是 Rockchip NPU 平台(也就是开发板)使用的模型类型，是以.rknn 结尾的模型文件

**将编译好的程序push到设备上**

adb push runtime/RK3588/Android/rknn_server/arm64/rknn_server /vendor/bin/

adb push runtime/RK3588/Android/librknn_api/arm64-v8a/librknnrt.so /vendor/lib64/

adb push examples/rknn_yolov5_demo/install/rknn_yolov5_demo_Android  /data/

**运行程序**

原始图片

![bus](/images/npu/bus.jpg)

```txt

rk3588_s:/data/rknn_yolov5_demo_Android # export LD_LIBRARY_PATH=./lib

rk3588_s:/data/rknn_yolov5_demo_Android # ./rknn_yolov5_demo ./model/RK3588/yolov5s-640-640.rknn  ./model/bus.jpg                                                                                                               
post process config: box_conf_threshold = 0.25, nms_threshold = 0.45
Read ./model/bus.jpg ...
img width = 640, img height = 640
Loading mode...
sdk version: 1.5.0 (e6fe0c678@2023-05-25T08:08:43) driver version: 0.8.2
model input num: 1, output num: 3
  index=0, name=images, n_dims=4, dims=[1, 640, 640, 3], n_elems=1228800, size=1228800, w_stride = 640, size_with_stride=1228800, fmt=NHWC, type=INT8, qnt_type=AFFINE, zp=-128, scale=0.003922
  index=0, name=269, n_dims=4, dims=[1, 255, 80, 80], n_elems=1632000, size=1632000, w_stride = 0, size_with_stride=1638400, fmt=NCHW, type=INT8, qnt_type=AFFINE, zp=83, scale=0.093136
  index=1, name=271, n_dims=4, dims=[1, 255, 40, 40], n_elems=408000, size=408000, w_stride = 0, size_with_stride=491520, fmt=NCHW, type=INT8, qnt_type=AFFINE, zp=48, scale=0.089854
  index=2, name=273, n_dims=4, dims=[1, 255, 20, 20], n_elems=102000, size=102000, w_stride = 0, size_with_stride=163840, fmt=NCHW, type=INT8, qnt_type=AFFINE, zp=46, scale=0.078630
model is NHWC input fmt
model input height=640, width=640, channel=3
once run use 18.324000 ms
loadLabelName ./model/coco_80_labels_list.txt
person @ (209 243 285 507) 0.883131
person @ (477 241 561 523) 0.866942
person @ (110 235 231 536) 0.825886
bus @ (92 129 553 466) 0.703667
person @ (80 354 121 516) 0.326333
loop count = 10 , average run  20.568800 ms

```

adb pull /data/rknn_yolov5_demo_Android/out.jpg ./

运行模型后生成的图片

![out](/images/npu/out.jpg)




















