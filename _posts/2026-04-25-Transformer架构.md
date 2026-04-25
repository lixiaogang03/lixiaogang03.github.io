---
layout:     post
title:      Transformer 架构
subtitle:   深度学习
date:       2026-04-25
author:     LXG
header-img: img/post-bg-digital_circuits.jpg
catalog: true
tags:
    - AI
---

[动手深度学习](https://zh-v2.d2l.ai/chapter_attention-mechanisms/transformer.html#)

## Transformer 架构

如果用一句工程化的话总结：

Transformer = “用矩阵并行计算的全局信息交互系统”

或者更直白： 它让每个 token 都能“瞬间看到全局”

![transformer](/images/2026/0425/transformer.svg)

## 基于位置的前馈网络

Position-wise Feed Forward Network（FFN）

```py

import math
import pandas as pd
import torch
from torch import nn
from d2l import torch as d2l


def log_tensor_info(name, tensor):
    """统一打印张量信息：形状、dtype和完整张量。"""
    print(f"[LOG] {name}: shape={tuple(tensor.shape)}, dtype={tensor.dtype}")
    print(f"[LOG] {name} 完整内容:\n{tensor.detach().cpu()}")


#@save
class PositionWiseFFN(nn.Module):
    """基于位置的前馈网络"""
    def __init__(self, ffn_num_input, ffn_num_hiddens, ffn_num_outputs,
                 **kwargs):
        super(PositionWiseFFN, self).__init__(**kwargs)
        # 第1层线性变换：把每个位置的特征从输入维映射到隐藏维
        # 输入最后一维: ffn_num_input -> 输出最后一维: ffn_num_hiddens
        self.dense1 = nn.Linear(ffn_num_input, ffn_num_hiddens)
        # 非线性激活：为网络引入非线性表达能力
        self.relu = nn.ReLU()
        # 第2层线性变换：把隐藏维映射到目标输出维
        # ffn_num_hiddens -> ffn_num_outputs
        self.dense2 = nn.Linear(ffn_num_hiddens, ffn_num_outputs)

        # 初始化日志，帮助理解网络结构
        print("[LOG] PositionWiseFFN 初始化完成")
        print(
            f"[LOG] 输入维={ffn_num_input}, 隐藏维={ffn_num_hiddens}, 输出维={ffn_num_outputs}"
        )

    def forward(self, X):
        # X 常见形状: (batch_size, num_steps, d_model)
        # 注意“PositionWise”的含义：
        # - 不同位置之间不会在FFN里混合（没有跨位置计算）
        # - 仅对每个位置的向量独立执行“线性->ReLU->线性”
        print("\n[LOG] ===== 进入 PositionWiseFFN.forward =====")
        log_tensor_info("输入X", X)

        h1 = self.dense1(X)
        log_tensor_info("dense1(X)", h1)

        h2 = self.relu(h1)
        log_tensor_info("ReLU后", h2)

        out = self.dense2(h2)
        log_tensor_info("dense2输出", out)
        print("[LOG] ===== 退出 PositionWiseFFN.forward =====\n")
        return out


# 示例：输入维=4，隐藏维=4，输出维=8
ffn = PositionWiseFFN(4, 4, 8)
# 设为推理模式，确保输出可复现（该模块本身虽无dropout，依然是良好习惯）
ffn.eval()

# 构造输入：
# batch_size=2, num_steps=3, d_model=4
X = torch.ones((2, 3, 4))
log_tensor_info("示例输入X", X)

# 运行前馈网络
Y = ffn(X)
log_tensor_info("示例输出Y", Y)

# 打印第0个样本在所有位置上的输出（形状: 3x8）
print("[LOG] Y[0] =")
print(Y[0])

```

### 数据输入

```bash

[LOG] 输入X: shape=(2, 3, 4), dtype=torch.float32
[LOG] 示例输入X 完整内容:
tensor([[[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]],

        [[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]]])

```

| 维度 | 含义                    |
| -- | --------------------- |
| 2  | batch_size（2个样本）      |
| 3  | seq_len（每个样本3个token）  |
| 4  | d_model（每个token 4维特征） |

### 进入 forward

**Step 1：dense1（第一层线性变换）**

```md

h1 = self.dense1(X)
📌 本质计算

对每一个 token：

h1 = X @ W1^T + b1
📐 维度变化
输入:  (2, 3, 4)
权重:  (4 → 4)
输出:  (2, 3, 4)

👉 注意：

PyTorch 的 nn.Linear(in, out) 实际权重是 (out, in)
自动对最后一维做矩阵乘法


[LOG] dense1 参数
[LOG] dense1.weight: shape=(4, 4), dtype=torch.float32
[LOG] dense1.weight 完整内容:
tensor([[ 0.0336,  0.1130, -0.3063,  0.4771],
        [-0.2043,  0.2148, -0.2774,  0.2155],
        [-0.1847,  0.0449, -0.3454, -0.3507],
        [ 0.1168,  0.2330, -0.1549,  0.2228]])
        
[LOG] dense1.bias: shape=(4,), dtype=torch.float32
[LOG] dense1.bias 完整内容:
tensor([ 0.3793,  0.3294, -0.1541,  0.0368])

计算公式： h1 = X @ W1^T + b1

[LOG] dense1(X): shape=(2, 3, 4), dtype=torch.float32
[LOG] dense1(X) 完整内容:
tensor([[[ 0.6967,  0.2780, -0.9898,  0.4545],
         [ 0.6967,  0.2780, -0.9898,  0.4545],
         [ 0.6967,  0.2780, -0.9898,  0.4545]],

        [[ 0.6967,  0.2780, -0.9898,  0.4545],
         [ 0.6967,  0.2780, -0.9898,  0.4545],
         [ 0.6967,  0.2780, -0.9898,  0.4545]]])


```

**Step 2：ReLU（非线性激活）**

```md

h2 = self.relu(h1)
📌 本质计算
ReLU(x) = max(0, x)
🧠 实际作用
把负数变成0
保留正数
🔥 为什么必须有它？

如果没有 ReLU：

dense2(dense1(X)) = 一个大线性层

👉 整个网络就退化成：

❌ 线性模型（表达能力很差）

✅ 加了 ReLU 后：

👉 可以表示：

非线性关系
条件激活（类似“开关”）

[LOG] ReLU后: shape=(2, 3, 4), dtype=torch.float32
[LOG] ReLU后 完整内容:
tensor([[[0.6967, 0.2780, 0.0000, 0.4545],
         [0.6967, 0.2780, 0.0000, 0.4545],
         [0.6967, 0.2780, 0.0000, 0.4545]],

        [[0.6967, 0.2780, 0.0000, 0.4545],
         [0.6967, 0.2780, 0.0000, 0.4545],
         [0.6967, 0.2780, 0.0000, 0.4545]]])

```

**Step 3：dense2（第二层线性变换）**

```md

out = self.dense2(h2)
📌 本质计算
out = h2 @ W2^T + b2
📐 维度变化
输入:  (2, 3, 4)
权重:  (4 → 8)
输出:  (2, 3, 8)
🧠 实际作用

👉 把“激活后的特征”投影到更高维空间：

4维 → 8维
🔥 直观理解

这一层在做：

重新编码信息（feature projection）

[LOG] dense2 参数
[LOG] dense2.weight: shape=(8, 4), dtype=torch.float32
[LOG] dense2.weight 完整内容:
tensor([[-3.5300e-01, -3.9332e-01,  2.8701e-01, -3.4535e-02],
        [ 3.8852e-01, -3.8515e-01, -3.9982e-01, -6.5256e-02],
        [-4.0756e-01, -1.3083e-04,  1.9923e-01,  2.6752e-01],
        [-9.9782e-02,  5.5980e-02, -4.2391e-01, -4.8913e-02],
        [-5.7005e-02,  2.1488e-01,  2.4811e-01, -3.3240e-01],
        [ 6.8557e-02, -4.1339e-01, -3.3388e-01, -2.0628e-01],
        [-2.1272e-01,  5.8841e-02, -1.2252e-01, -4.8725e-02],
        [ 4.8711e-01, -3.8770e-02,  3.9174e-01,  4.7053e-01]])
[LOG] dense2.bias: shape=(8,), dtype=torch.float32
[LOG] dense2.bias 完整内容:
tensor([-0.3661, -0.3997, -0.1815, -0.2088,  0.2070,  0.1019, -0.4531, -0.0070])

[LOG] dense2输出: shape=(2, 3, 8), dtype=torch.float32
[LOG] dense2输出 完整内容:
tensor([[[-0.7371, -0.2657, -0.3439, -0.2850,  0.0760, -0.0590, -0.6071, 0.5354],
         [-0.7371, -0.2657, -0.3439, -0.2850,  0.0760, -0.0590, -0.6071, 0.5354],
         [-0.7371, -0.2657, -0.3439, -0.2850,  0.0760, -0.0590, -0.6071, 0.5354]],

        [[-0.7371, -0.2657, -0.3439, -0.2850,  0.0760, -0.0590, -0.6071, 0.5354],
         [-0.7371, -0.2657, -0.3439, -0.2850,  0.0760, -0.0590, -0.6071, 0.5354],
         [-0.7371, -0.2657, -0.3439, -0.2850,  0.0760, -0.0590, -0.6071, 0.5354]]])
[LOG] ===== 退出 PositionWiseFFN.forward =====

```

### FFN 架构

**Position-wise Feed Forward Network（FFN）的作用**

在 Transformer 里，FFN 常被一句话概括：对每个 token 独立做的两层 MLP，用来增强表示能力（非线性特征变换）

```md

            输入 token 向量 x (4维)
                   │
                   ▼
        ┌─────────────────────┐
        │   Linear (dense1)   │
        │   W1: 4 → 4         │
        └─────────────────────┘
                   │
                   ▼
             中间特征 h1
                   │
                   ▼
        ┌─────────────────────┐
        │      ReLU 激活       │
        └─────────────────────┘
                   │
                   ▼
             激活特征 h2
                   │
                   ▼
        ┌─────────────────────┐
        │   Linear (dense2)   │
        │   W2: 4 → 8         │
        └─────────────────────┘
                   │
                   ▼
            输出向量 y (8维)

```

**关键结构特点（图中最重要的点）**

```md

1️⃣ “逐位置”处理（核心）
batch 0:
  token1 ──► FFN ──► y1
  token2 ──► FFN ──► y2
  token3 ──► FFN ──► y3

batch 1:
  token1 ──► FFN ──► y1
  token2 ──► FFN ──► y2
  token3 ──► FFN ──► y3

👉 每个 token：

完全独立
共享同一套权重
2️⃣ 不跨 token（非常重要）
token1 ❌ 不会看到 token2
token2 ❌ 不会看到 token3

👉 所以它不是“序列建模层”

```

## 残差连接和层规范化

### 第一部分代码解析

```py

# LayerNorm 与 BatchNorm 对比示例
# - LayerNorm: 对“每个样本自身的特征维”做归一化（与batch大小无关）
# - BatchNorm1d: 对“一个batch同一特征维”做归一化（依赖batch统计量）
ln = nn.LayerNorm(2)
bn = nn.BatchNorm1d(2)
X = torch.tensor([[1, 2], [2, 3]], dtype=torch.float32)
# 在训练模式下计算X的均值和方差
print("\n[LOG] ===== LayerNorm vs BatchNorm 示例 =====")
log_tensor_info("输入X", X)
ln_out = ln(X)
bn_out = bn(X)
log_tensor_info("LayerNorm输出", ln_out)
log_tensor_info("BatchNorm输出", bn_out)
print("[LOG] ===== 结束 LayerNorm vs BatchNorm 示例 =====\n")

```

**数据输入**

```md

[LOG] ===== LayerNorm vs BatchNorm 示例 =====
[LOG] 输入X: shape=(2, 2), dtype=torch.float32
[LOG] 输入X 完整内容:
tensor([[1., 2.],
        [2., 3.]])

```

**LayerNorm 逐样本计算**

```md

[LOG] LayerNorm输出: shape=(2, 2), dtype=torch.float32
[LOG] LayerNorm输出 完整内容:
tensor([[-1.0000,  1.0000],
        [-1.0000,  1.0000]])

👉 每个样本内部被“拉成零均值、单位方差”

```

**BatchNorm1d 逐通道计算**

```md

[LOG] BatchNorm输出: shape=(2, 2), dtype=torch.float32
[LOG] BatchNorm输出 完整内容:
tensor([[-1.0000, -1.0000],
        [ 1.0000,  1.0000]])

```

| 方法        | 归一化方向        |
| --------- | ------------ |
| LayerNorm | 每一行（样本内部）    |
| BatchNorm | 每一列（跨 batch） |

### 第二部分代码解析

```py

#@save
class AddNorm(nn.Module):
    """残差连接后进行层规范化"""
    def __init__(self, normalized_shape, dropout, **kwargs):
        super(AddNorm, self).__init__(**kwargs)
        # dropout作用于子层输出Y，再与残差X相加，最后做LayerNorm。
        self.dropout = nn.Dropout(dropout)
        self.ln = nn.LayerNorm(normalized_shape)
        print("[LOG] AddNorm 初始化完成")
        print(f"[LOG] normalized_shape={normalized_shape}, dropout={dropout}")

    def forward(self, X, Y):
        print("\n[LOG] ===== 进入 AddNorm.forward =====")
        log_tensor_info("残差输入X", X)
        log_tensor_info("子层输出Y", Y)
        y_drop = self.dropout(Y)
        log_tensor_info("dropout(Y)", y_drop)
        added = y_drop + X
        log_tensor_info("残差相加结果(Y_drop + X)", added)
        out = self.ln(added)
        log_tensor_info("LayerNorm后输出", out)
        print("[LOG] ===== 退出 AddNorm.forward =====\n")
        return out

add_norm = AddNorm([3, 4], 0.5)
add_norm.eval()
addnorm_out = add_norm(torch.ones((2, 3, 4)), torch.ones((2, 3, 4)))
log_tensor_info("AddNorm示例输出", addnorm_out)
print(f"[LOG] AddNorm示例输出形状: {tuple(addnorm_out.shape)}")

```

**Step 1: 数据输入**

```md

[LOG] ===== 进入 AddNorm.forward =====
[LOG] 残差输入X: shape=(2, 3, 4), dtype=torch.float32
[LOG] 残差输入X 完整内容:
tensor([[[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]],

        [[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]]])

[LOG] 子层输出Y: shape=(2, 3, 4), dtype=torch.float32
[LOG] 子层输出Y 完整内容:
tensor([[[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]],

        [[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]]])

```

**Step 2：Dropout**

```md

add_norm.eval()

👉 eval 模式：

dropout 关闭

所以：

y_drop = Y

[LOG] dropout(Y): shape=(2, 3, 4), dtype=torch.float32
[LOG] dropout(Y) 完整内容:
tensor([[[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]],

        [[1., 1., 1., 1.],
         [1., 1., 1., 1.],
         [1., 1., 1., 1.]]])

```

**Step 3：残差相加**

```md

[LOG] 残差相加结果(Y_drop + X): shape=(2, 3, 4), dtype=torch.float32
[LOG] 残差相加结果(Y_drop + X) 完整内容:
tensor([[[2., 2., 2., 2.],
         [2., 2., 2., 2.],
         [2., 2., 2., 2.]],

        [[2., 2., 2., 2.],
         [2., 2., 2., 2.],
         [2., 2., 2., 2.]]])

```

**Step 4：LayerNorm（核心）**

```md

[LOG] LayerNorm后输出: shape=(2, 3, 4), dtype=torch.float32
[LOG] LayerNorm后输出 完整内容:
tensor([[[0., 0., 0., 0.],
         [0., 0., 0., 0.],
         [0., 0., 0., 0.]],

        [[0., 0., 0., 0.],
         [0., 0., 0., 0.],
         [0., 0., 0., 0.]]])

为什么是全 0？

因为：所有值完全一样 → 方差=0 → 全部归一化为0

```

### AddNorm 结构图

```md

            X（残差输入）
             │
             │
             │        Y（子层输出）
             │               │
             │               ▼
             │        Dropout（训练才生效）
             │               │
             │               ▼
             └──────►  加法  ◄──────┘
                       │
                       ▼
                 LayerNorm
                       │
                       ▼
                     输出

```


1️⃣ 残差连接  X + Y

作用：

* 防止梯度消失
* 保留原始信息
* 允许“微调而不是重写”

2️⃣ LayerNorm

作用：

* 控制数值范围
* 稳定训练
* 加速收敛

3️⃣ Dropout

作用：防止过拟合（训练时）

## 编码器

### 第一部分代码理解

```py

#@save
class EncoderBlock(nn.Module):
    """Transformer编码器块

    结构：
      输入X
        │
        ├──► 多头自注意力(Q=K=V=X) ──► AddNorm(残差+LayerNorm) ──► Y
        │                                                           │
        └───────────────────────────────────────────────────────── ┘
                                                                    │
        ┌──────────────────────────────────────────────────────────┘
        │
        ├──► PositionWiseFFN(Y) ──► AddNorm(残差+LayerNorm) ──► 输出
        │                                                          │
        └──────────────────────────────────────────────────────────┘
    """
    def __init__(self, key_size, query_size, value_size, num_hiddens,
                 norm_shape, ffn_num_input, ffn_num_hiddens, num_heads,
                 dropout, use_bias=False, **kwargs):
        super(EncoderBlock, self).__init__(**kwargs)
        # 子层1：多头自注意力
        # Q、K、V 均来自同一输入X（自注意力），输出维度为 num_hiddens
        # 新版 d2l.MultiHeadAttention 签名: (num_hiddens, num_heads, dropout, bias)
        # 不再需要单独传 key_size/query_size/value_size
        self.attention = d2l.MultiHeadAttention(
            num_hiddens, num_heads, dropout, use_bias)
        # 子层1 后的残差连接 + 层归一化
        self.addnorm1 = AddNorm(norm_shape, dropout)
        # 子层2：逐位置前馈网络，对每个位置独立做非线性变换
        self.ffn = PositionWiseFFN(
            ffn_num_input, ffn_num_hiddens, num_hiddens)
        # 子层2 后的残差连接 + 层归一化
        self.addnorm2 = AddNorm(norm_shape, dropout)

        print("[LOG] EncoderBlock 初始化完成")
        print(f"[LOG] num_hiddens={num_hiddens}, num_heads={num_heads}, "
              f"ffn_num_hiddens={ffn_num_hiddens}, dropout={dropout}")

    def forward(self, X, valid_lens):
        """
        参数：
            X          : (batch_size, num_steps, num_hiddens)  编码器输入
            valid_lens : (batch_size,) 或 None，用于屏蔽填充位置
        返回：
            与X形状相同的编码输出
        """
        print("\n[LOG] ========== 进入 EncoderBlock.forward ==========")
        log_tensor_info("输入X", X)
        print(f"[LOG] valid_lens={valid_lens}")

        # --- 子层1：多头自注意力 ---
        # Q=K=V=X，让每个位置都能关注序列中所有位置（受valid_lens限制）
        attn_out = self.attention(X, X, X, valid_lens)
        log_tensor_info("多头自注意力输出 attn_out", attn_out)

        # 残差连接 + LayerNorm：attn_out经dropout后与X相加，再归一化
        Y = self.addnorm1(X, attn_out)
        log_tensor_info("AddNorm1后输出Y", Y)

        # --- 子层2：逐位置前馈网络 ---
        ffn_out = self.ffn(Y)
        log_tensor_info("FFN输出 ffn_out", ffn_out)

        # 残差连接 + LayerNorm：ffn_out经dropout后与Y相加，再归一化
        out = self.addnorm2(Y, ffn_out)
        log_tensor_info("AddNorm2后输出(EncoderBlock最终输出)", out)
        print("[LOG] ========== 退出 EncoderBlock.forward ==========\n")
        return out


print("\n[LOG] ===== 编码器块测试 =====")
# 构造测试输入：batch_size=2, num_steps=100, num_hiddens=24
X = torch.ones((2, 100, 24))
log_tensor_info("测试输入X", X)

# valid_lens: 第0个样本只看前3个位置，第1个样本只看前2个位置
valid_lens = torch.tensor([3, 2])
print(f"[LOG] valid_lens={valid_lens}")

# 初始化编码器块
# key/query/value_size=24, num_hiddens=24, norm_shape=[100,24]
# ffn_num_input=24, ffn_num_hiddens=48, num_heads=8, dropout=0.5
encoder_blk = EncoderBlock(24, 24, 24, 24, [100, 24], 24, 48, 8, 0.5)
encoder_blk.eval()  # 推理模式，dropout不生效，结果可复现

output = encoder_blk(X, valid_lens)
print(f"[LOG] EncoderBlock输出形状: {tuple(output.shape)}")
print("[LOG] ===== 编码器块测试结束 =====\n")

```

**架构**

```md

X
│
├── Self-Attention
│      ↓
├── Add & Norm  （残差1）
│      ↓
├── FFN
│      ↓
└── Add & Norm  （残差2）
       ↓
     输出

```

#### 数据输入

```md

X.shape = (2, 100, 24)

[LOG] 测试输入X: shape=(2, 100, 24), dtype=torch.float32
[LOG] 测试输入X 完整内容:
tensor([[[1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.],
         ...,
         [1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.]],

        [[1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.],
         ...,
         [1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.],
         [1., 1., 1.,  ..., 1., 1., 1.]]])

```

| 维度  | 说明          |
| --- | ----------- |
| 2   | batch       |
| 100 | 序列长度        |
| 24  | embedding维度 |

```md

valid_lens = [3, 2]

👉 作用：

第1个样本：只允许看前3个 token
第2个样本：只允许看前2个 token

👉 后面的 token 会被 mask 掉

```

#### PositionWiseFFN

```md

[LOG] PositionWiseFFN 初始化完成
[LOG] 输入维=24, 隐藏维=48, 输出维=24
[LOG] dense1 参数
[LOG] dense1.weight: shape=(48, 24), dtype=torch.float32
[LOG] dense1.weight 完整内容:
tensor([[-0.0627,  0.1583,  0.0363,  ..., -0.1293, -0.1403,  0.0511],
        [-0.1481,  0.0495, -0.0628,  ..., -0.0917, -0.1495, -0.0644],
        [-0.0271, -0.1870, -0.0948,  ..., -0.1679, -0.1096,  0.0957],
        ...,
        [-0.0276,  0.1536,  0.0568,  ..., -0.1469, -0.0915, -0.0856],
        [ 0.1135, -0.0184,  0.0330,  ...,  0.0470,  0.2012, -0.0248],
        [ 0.0607,  0.0418, -0.1447,  ...,  0.0322, -0.0400, -0.0710]])
[LOG] dense1.bias: shape=(48,), dtype=torch.float32
[LOG] dense1.bias 完整内容:
tensor([ 0.1649,  0.1784, -0.0196, -0.0276,  0.0587, -0.1541, -0.1756, -0.1351,
         0.1887, -0.1075, -0.0332, -0.0600, -0.1659, -0.1472, -0.1123, -0.1028,
         0.0076,  0.0641,  0.1130,  0.0777, -0.0257, -0.0656, -0.0449, -0.1324,
        -0.0187, -0.1960, -0.1980, -0.1332, -0.1313, -0.1265,  0.1737, -0.0182,
        -0.0558, -0.0620, -0.1547,  0.0924, -0.0586, -0.1146,  0.1801, -0.0604,
        -0.1654, -0.1518,  0.1121,  0.1409,  0.0836, -0.0488, -0.1851, -0.0886])

[LOG] dense2 参数
[LOG] dense2.weight: shape=(24, 48), dtype=torch.float32
[LOG] dense2.weight 完整内容:
tensor([[ 0.0248, -0.1010,  0.0445,  ..., -0.1299,  0.1192, -0.1108],
        [ 0.0041, -0.1158,  0.1042,  ...,  0.0748,  0.0463,  0.0654],
        [-0.0787, -0.0308, -0.1035,  ...,  0.0877,  0.1203, -0.1250],
        ...,
        [-0.0394, -0.0815,  0.0370,  ..., -0.1113, -0.0425,  0.0554],
        [ 0.1180, -0.1212,  0.0735,  ..., -0.0208, -0.1322, -0.0840],
        [ 0.1339,  0.0996,  0.0584,  ..., -0.0632, -0.0570, -0.0192]])
[LOG] dense2.bias: shape=(24,), dtype=torch.float32
[LOG] dense2.bias 完整内容:
tensor([-0.0400,  0.0554,  0.0028, -0.1291, -0.0754,  0.1313, -0.0341,  0.1149,
         0.0035, -0.1052,  0.0067, -0.0261, -0.0183, -0.0008,  0.0731,  0.0730,
         0.1362,  0.1111, -0.0523, -0.1191, -0.1024, -0.1101,  0.1146, -0.1102])

```

#### Step 1：多头自注意力（Self-Attention）

```md

attn_out = self.attention(X, X, X, valid_lens)
📌 本质
Q = X
K = X
V = X

👉 每个 token：

“去看整个序列（但受 valid_lens 限制）”

📐 输出形状
attn_out.shape = (2, 100, 24)
🔥 关键理解

这一层负责：token之间的信息交互

[LOG] 多头自注意力输出 attn_out: shape=(2, 100, 24), dtype=torch.float32
[LOG] 多头自注意力输出 attn_out 完整内容:
tensor([[[ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         ...,
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334]],

        [[ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         ...,
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334]]])

```

#### Step 2：AddNorm1（残差 + LayerNorm）

```md

Y = self.addnorm1(X, attn_out)

作用

1️⃣ 残差
X + attn_out

👉 保留原始信息

2️⃣ LayerNorm

👉 稳定数值分布

📐 输出
Y.shape = (2, 100, 24)

[LOG] 子层输出Y: shape=(2, 100, 24), dtype=torch.float32
[LOG] 子层输出Y 完整内容:
tensor([[[ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         ...,
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334]],

        [[ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         ...,
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334],
         [ 0.4831, -0.0471, -0.7931,  ...,  0.2540,  0.2923, -0.1334]]])

[LOG] 残差相加结果(Y_drop + X): shape=(2, 100, 24), dtype=torch.float32
[LOG] 残差相加结果(Y_drop + X) 完整内容:
tensor([[[1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         ...,
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666]],

        [[1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         ...,
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666],
         [1.4831, 0.9529, 0.2069,  ..., 1.2540, 1.2923, 0.8666]]])
         
# 归一化
[LOG] LayerNorm后输出: shape=(2, 100, 24), dtype=torch.float32
[LOG] LayerNorm后输出 完整内容:
tensor([[[ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         ...,
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350]],

        [[ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         ...,
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350],
         [ 1.2714, -0.0241, -1.8467,  ...,  0.7115,  0.8052, -0.2350]]])
[LOG] ===== 退出 AddNorm.forward =====

```

#### Step 3：FFN（逐位置前馈网络）

```md

ffn_out = self.ffn(Y)
📌 本质

对每个 token：

y → Linear(24→48) → ReLU → Linear(48→24)
🔥 特点
不跨 token
每个位置独立
参数共享
📐 输出
ffn_out.shape = (2, 100, 24)
🔥 作用

对每个 token 做“非线性特征加工”

[LOG] dense1(X): shape=(2, 100, 48), dtype=torch.float32
[LOG] dense1(X) 完整内容:
tensor([[[ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         ...,
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718]],

        [[ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         ...,
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718],
         [ 0.5987,  0.1660,  0.3433,  ...,  0.3329, -0.4658, -0.0718]]])
[LOG] ReLU后: shape=(2, 100, 48), dtype=torch.float32
[LOG] ReLU后 完整内容:
tensor([[[0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         ...,
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000]],

        [[0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         ...,
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000],
         [0.5987, 0.1660, 0.3433,  ..., 0.3329, 0.0000, 0.0000]]])
[LOG] dense2输出: shape=(2, 100, 24), dtype=torch.float32
[LOG] dense2输出 完整内容:
tensor([[[ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         ...,
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303]],

        [[ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         ...,
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303],
         [ 0.1860,  0.0345,  0.1935,  ..., -0.1780, -0.1262, -0.2303]]])
[LOG] ===== 退出 PositionWiseFFN.forward =====

```

#### Step 4：AddNorm2（第二次残差）

```md

[LOG] AddNorm2后输出(EncoderBlock最终输出): shape=(2, 100, 24), dtype=torch.float32
[LOG] AddNorm2后输出(EncoderBlock最终输出) 完整内容:
tensor([[[ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         ...,
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027]],

        [[ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         ...,
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027],
         [ 1.3459,  0.0299, -1.4830,  ...,  0.5057,  0.6380, -0.4027]]])

```

#### 架构总结

```md

输入 X (2,100,24)
      │
      ▼
┌────────────────────┐
│ Multi-HeadAttention│
└────────────────────┘
      │
      ▼
┌────────────────────┐
│ AddNorm (X + attn) │
└────────────────────┘
      │
      ▼
        Y
      │
      ▼
┌────────────────────┐
│ PositionWise FFN   │
└────────────────────┘
      │
      ▼
┌────────────────────┐
│ AddNorm (Y + ffn)  │
└────────────────────┘
      │
      ▼
    输出 out

```
1️⃣ Attention vs FFN 分工

| 模块        | 作用        |
| --------- | --------- |
| Attention | token之间通信 |
| FFN       | token内部加工 |


2️⃣ 残差的作用

X + 子层输出

👉 防止：

* 梯度消失
* 信息丢失
3️⃣ LayerNorm 的作用

👉 保证：

* 数值稳定
* 训练收敛

### 完整编码器代码

```py

#@save
class TransformerEncoder(d2l.Encoder):
    """Transformer编码器"""
    def __init__(self, vocab_size, key_size, query_size, value_size,
                 num_hiddens, norm_shape, ffn_num_input, ffn_num_hiddens,
                 num_heads, num_layers, dropout, use_bias=False, **kwargs):
        super(TransformerEncoder, self).__init__(**kwargs)
        # 保存隐藏维度，后续在embedding缩放时使用
        self.num_hiddens = num_hiddens
        # 词嵌入：把离散token id映射到连续向量
        self.embedding = nn.Embedding(vocab_size, num_hiddens)
        # 位置编码：为序列注入位置信息
        self.pos_encoding = d2l.PositionalEncoding(num_hiddens, dropout)
        # 编码器块堆叠容器
        self.blks = nn.Sequential()
        for i in range(num_layers):
            # 逐层添加编码器块，形成深层特征提取
            self.blks.add_module("block"+str(i),
                EncoderBlock(key_size, query_size, value_size, num_hiddens,
                             norm_shape, ffn_num_input, ffn_num_hiddens,
                             num_heads, dropout, use_bias))

        print("[LOG] TransformerEncoder 初始化完成")
        print(f"[LOG] vocab_size={vocab_size}, num_hiddens={num_hiddens}, "
              f"num_heads={num_heads}, num_layers={num_layers}, dropout={dropout}")
        print(f"[LOG] norm_shape={norm_shape}, ffn_num_input={ffn_num_input}, "
              f"ffn_num_hiddens={ffn_num_hiddens}")

    def forward(self, X, valid_lens, *args):
        print("\n[LOG] ========= 进入 TransformerEncoder.forward =========")
        log_tensor_info("TransformerEncoder输入token索引X", X)
        print(f"[LOG] valid_lens={valid_lens}")

        # 因为位置编码值在-1和1之间，
        # 因此嵌入值乘以嵌入维度的平方根进行缩放，
        # 然后再与位置编码相加。
        emb = self.embedding(X)
        log_tensor_info("词嵌入输出 embedding(X)", emb)

        scaled_emb = emb * math.sqrt(self.num_hiddens)
        log_tensor_info("缩放后的词嵌入 scaled_emb", scaled_emb)

        X = self.pos_encoding(scaled_emb)
        log_tensor_info("加入位置编码后的输入", X)

        self.attention_weights = [None] * len(self.blks)
        for i, blk in enumerate(self.blks):
            print(f"[LOG] ---- 进入编码器块 block{i} ----")
            X = blk(X, valid_lens)
            log_tensor_info(f"block{i} 输出", X)
            self.attention_weights[
                i] = blk.attention.attention.attention_weights
            log_tensor_info(f"block{i} 注意力权重", self.attention_weights[i])
            print(f"[LOG] ---- 退出编码器块 block{i} ----")

        print("[LOG] ========= 退出 TransformerEncoder.forward =========\n")
        return X
    
print("\n[LOG] ===== 完整TransformerEncoder测试 =====")
encoder = TransformerEncoder(
    200, 24, 24, 24, 24, [100, 24], 24, 48, 8, 2, 0.5)
encoder.eval()
enc_input = torch.ones((2, 100), dtype=torch.long)
log_tensor_info("完整编码器测试输入 enc_input", enc_input)
enc_output = encoder(enc_input, valid_lens)
print(f"[LOG] 完整编码器输出形状: {tuple(enc_output.shape)}")
log_tensor_info("完整编码器输出 enc_output", enc_output)
print("[LOG] ===== 完整TransformerEncoder测试结束 =====\n")

```

#### 




































