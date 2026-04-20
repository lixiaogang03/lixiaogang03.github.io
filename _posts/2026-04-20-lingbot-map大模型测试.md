---
layout:     post
title:      lingbot-map大模型测试
subtitle:   蚂蚁灵波科技
date:       2026-04-20
author:     LXG
header-img: img/post-bg-DJI.jpg
catalog: true
tags:
    - AI
---

[lingbot-map大模型-魔塔社区](https://www.modelscope.cn/models/Robbyant/lingbot-map)

[lingbot-map-Github](https://github.com/robbyant/lingbot-map)

## 概念

LingBot-Map 是蚂蚁灵波科技开源的流式三维重建模型，普通 RGB 摄像头可在视频采集过程中实时完成相机位姿估计与场景三维结构重建。模型以纯自回归式建模为核心，基于几何上下文 Transformer 架构，在 Oxford Spires 等权威基准上实现轨迹精度较此前最优流式方法提升约 2.8 倍，填补实时空间感知领域关键技术空白。

* 实时流式重建：边看边理解，逐帧处理当前及历史画面，持续输出相机位姿和深度信息。
* 长序列稳定运行：支持 10,000+ 帧长视频连续推理，长序列运行精度几乎无衰减。
* 纯视觉空间感知：无需复杂硬件，单颗普通摄像头可实现实时三维建图。
* 相机轨迹估计：支持精准估计相机在三维空间中的运动轨迹（位姿估计）。

## 环境准备

```bash

conda create -n lingbot-map python=3.10 -y

pip install torch==2.9.1 torchvision==0.24.1 --index-url https://download.pytorch.org/whl/cu128

git clone https://github.com/robbyant/lingbot-map.git

cd lingbot-map/

pip install -e .

pip install -e ".[vis]"

pip install modelscope

modelscope download --model Robbyant/lingbot-map --local_dir ./models

```

**下载skyseg**

```bash

curl -sSfL https://hf.co/git-xet/install.sh | sh

git clone https://huggingface.co/JianyuanWang/skyseg

```

这一个 ONNX 模型：

* 文件：skyseg.onnx
* 来源：HuggingFace
* 功能：识别图像里的“天空区域”

🎯 作用

* 把天空区域从点云里过滤掉

因为：

* 天空没有真实深度
* SLAM / 重建容易产生“漂浮点”
* 会污染点云质量

## 模型测试命令

```bash

(lingbot-map) xt@xt-2288H-V5:~/lixiaogang/lingbot-map/lingbot-map$ python demo.py --model_path ../models/lingbot-map.pt --image_folder example/university --use_sdpa --mask_sky

========== LingBot-MAP Demo ==========
[配置] 输入模式: 图片集
[配置] 推理模式: streaming
[配置] 模型路径: ../models/lingbot-map.pt
[配置] 图片目录: example/university
[配置] SkySeg模型: /home/xt/lixiaogang/lingbot-map/skyseg/skyseg.onnx
======================================

[阶段] 开始加载数据与模型...
正在加载 324 张图像...
原始图像分辨率(首帧): 518x294
Loading images: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 324/324 [00:01<00:00, 279.68it/s]
图像预处理完成: 尺寸=518x294, 模式=canonical crop
flashinfer not available
torchtitan not available for ulysses cp
正在构建模型...
pretrained_path: 
Failed to load pretrained weights: [Errno 2] No such file or directory: ''
正在加载权重文件: ../models/lingbot-map.pt
  缺失参数键数量: 62
  权重加载完成。
[耗时] 数据与模型加载完成: 17.4s
正在将 aggregator 转为 torch.bfloat16 (heads 保持 fp32)
[输入] 帧数: 324, 张量形状: (324, 3, 294, 518)
[输入] 当前模式: streaming
加载后 GPU 显存: alloc=3.54 GB, reserved=3.57 GB
[阶段] 开始模型推理 (mode=streaming, dtype=torch.bfloat16)...
Streaming inference: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 324/324 [01:48<00:00,  2.92it/s]
[耗时] 模型推理完成: 110.38s
[统计] 平均单帧耗时: 340.67 ms
[统计] 推理吞吐: 2.94 FPS
推理阶段 GPU 峰值显存: 13.03 GB (reserved 峰值 13.97 GB)
[阶段] 开始后处理...
正在将结果移动到 CPU...
[耗时] 后处理完成: 0.02s
2026-04-20 11:34:10.944001979 [W:onnxruntime:Default, device_discovery.cc:164 DiscoverDevicesForPlatform] GPU device discovery failed: device_discovery.cc:89 ReadFileContents Failed to open file: "/sys/class/drm/card0/device/vendor"
╭────── viser (listening *:8080) ───────╮
│             ╷                         │
│   HTTP      │ http://localhost:8080   │
│   Websocket │ ws://localhost:8080     │
│             ╵                         │
╰───────────────────────────────────────╯
Generating sky masks from image array...
100%|█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 324/324 [01:10<00:00,  4.60it/s]
Sky segmentation applied successfully
[阶段] 可视化服务已启动: http://localhost:8080
(viser) Connection opened (0, 1 total), 4278 persistent messages
(viser) Connection opened (1, 2 total), 4278 persistent messages
(viser) Connection closed (0, 1 total)

```

![lingbot_map_demo](/images/2026/0420/lingbot_map_demo.png)

































