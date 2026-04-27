---
layout:     post
title:      Transformer 训练和推理
subtitle:   动手深度学习
date:       2026-04-27
author:     LXG
header-img: img/post-bg-board.jpg
catalog: true
tags:
    - AI
---

## 模型训练

```py


# Transformer主干超参数：隐藏维、层数、dropout，以及数据批处理设置
num_hiddens, num_layers, dropout, batch_size, num_steps = 32, 2, 0.1, 64, 10
# 优化与训练轮次配置；设备优先使用GPU
lr, num_epochs, device = 0.005, 10, d2l.try_gpu()
# 前馈网络与多头注意力配置
ffn_num_input, ffn_num_hiddens, num_heads = 32, 64, 4
# Q/K/V投影维度（当前实现保持一致）
key_size, query_size, value_size = 32, 32, 32
# LayerNorm归一化维度
norm_shape = [32]

# 加载NMT训练数据与词表
train_iter, src_vocab, tgt_vocab = d2l.load_data_nmt(batch_size, num_steps)

# 根据TRAIN_LOG_CFG决定是否启用“终端+文件”双写日志
enable_file_logging_if_needed()

# 构建编码器与解码器
encoder = TransformerEncoder(
    len(src_vocab), key_size, query_size, value_size, num_hiddens,
    norm_shape, ffn_num_input, ffn_num_hiddens, num_heads,
    num_layers, dropout)
decoder = TransformerDecoder(
    len(tgt_vocab), key_size, query_size, value_size, num_hiddens,
    norm_shape, ffn_num_input, ffn_num_hiddens, num_heads,
    num_layers, dropout)
# 组装Seq2Seq整体模型（Encoder-Decoder）
net = d2l.EncoderDecoder(encoder, decoder)
# 执行训练（内部含分层训练日志）
train_seq2seq_with_planned_logs(
    net, train_iter, lr, num_epochs, src_vocab, tgt_vocab, device)

```

**实现了一个 带完整可观测日志的 Transformer Seq2Seq（机器翻译模型）**

## 整体训练流程（首轮）

```md

======================== 训练开始（Epoch 1 / Batch 1） ========================

【输入数据】
src (源语言token id)                    tgt (目标语言token id)
(64, 10)                               (64, 10)
  │                                        │
  │                                        └──► 右移 + <bos>
  │                                             （作用：构造Decoder输入，
  │                                              实现Teacher Forcing）
  │
  ▼
======================== Encoder（语义理解） ========================

Embedding
  │
  ├──► (64,10) → (64,10,32)
  │     （作用：把离散token映射到连续向量空间）
  │
  ▼
× √d_model
  │
  ├──► （作用：放大embedding数值，
  │         防止位置编码被“淹没”）
  │
  ▼
+ Positional Encoding
  │
  ├──► （作用：注入位置信息，
  │         否则模型不知道词序）
  │
  ▼
X0（带语义+位置的信息表示）
  │
  ▼

-------------------- Encoder Block 0 --------------------

Multi-Head Self Attention（自注意力）
  │
  ├──► Q = XWq, K = XWk, V = XWv
  │     （作用：把输入投影到“查询/键/值”空间）
  │
  ├──► QK^T / √d
  │     （作用：计算“相关性/相似度”）
  │
  ├──► softmax
  │     （作用：变成概率分布＝注意力权重）
  │
  ├──► attention_weights @ V
  │     （作用：加权汇总全局信息）
  │
  ▼
attn_out（融合上下文后的表示）

AddNorm1（残差 + 归一化）
  │
  ├──► X + attn_out
  │     （作用：保留原信息，避免信息丢失）
  │
  ├──► LayerNorm
  │     （作用：稳定训练，防止梯度爆炸）
  │
  ▼
Y

FFN（前馈网络）
  │
  ├──► dense1 → ReLU → dense2
  │     （作用：引入非线性，提高表达能力）
  │
  ▼
ffn_out

AddNorm2
  │
  ├──► Y + ffn_out
  │     （作用：再次融合 & 稳定）
  │
  ▼
X1（Block0输出）

-------------------- Encoder Block 1 --------------------

（作用完全相同，但语义更抽象、更高级）

X1 → Self-Attn → AddNorm → FFN → AddNorm → X2

  │
  ▼
X_enc（Encoder最终输出）
（作用：整句的“上下文语义表示”）

==================================================================

======================== Decoder（逐词生成） ========================

Decoder 输入（右移后的tgt）
  │
  ▼
Embedding → √d → +位置编码
  │
  ▼
D0

-------------------- Decoder Block 0 --------------------

Masked Self Attention（带mask的自注意力）
  │
  ├──► 只能看过去（下三角mask）
  │     （作用：防止“偷看未来词”）
  │
  ▼
AddNorm1
  │
  ▼

Cross Attention（编码器-解码器注意力）🔥关键
  │
  ├──► Query = Decoder当前状态
  ├──► Key/Value = Encoder输出
  │
  ├──► （作用：在“源句子”中找当前词对应的信息）
  │
  ▼
AddNorm2

FFN
  │
  ├──► （作用：非线性变换，增强表达）
  │
  ▼
AddNorm3
  │
  ▼
D1

-------------------- Decoder Block 1 --------------------

（同上，进一步 refinement）

D1 → MaskedAttn → CrossAttn → FFN → D2

  │
  ▼
======================== 输出层 ========================

Linear（全连接）
  │
  ├──► (64,10,32) → (64,10,vocab_size)
  │
  ├──► （作用：映射到词表空间，得到每个词的概率）
  │
  ▼
logits

Softmax + Loss
  │
  ├──► MaskedSoftmaxCELoss
  │
  ├──► （作用：计算预测与真实token的差异）
  │
  ▼
loss

==================================================================

======================== 反向传播 ========================

loss
  │
  ├──► 反向传播梯度
  │
  ├──► 更新：
  │     - embedding
  │     - attention权重
  │     - FFN参数
  │
  ▼
模型参数更新（学习完成一步）

==================================================================

```

## 热力图

![demo_03_attention](/gif/2026/0427/demo_03_attention.gif)

### 训练开始时的热力图

![demo_03_attention_first](/images/2026/0427/demo_03_attention_first.png)

### 训练结束时的热力图

![demo_03_attention_last](/images/2026/0427/demo_03_attention_last.png)

**预测结果已经完全正确**

```md

pred: j'ai froid . <eos>
target: j'ai froid . <eos>
loss: 0.0318

```

👉 说明：

✔ translation 已收敛
✔ sequence-level correct
✔ EOS 处理稳定

**attention 变“更尖锐”**

```md

“froid”这一行：
几乎完全指向 “am”
权重非常集中（接近 one-hot）

👉 说明：

模型已经从“分布式对齐” → “确定性对齐”

```

**attention ≠ reasoning**

```md

❗ attention ≠ reasoning

你现在看到：

attention 很漂亮
对齐很稳定
loss 很低

但本质是：

模型在做 lookup table，而不是理解语言

```






























