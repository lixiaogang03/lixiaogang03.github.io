---
layout:     post
title:      Claude Code
subtitle:   AI Code
date:       2026-01-21
author:     LXG
header-img: img/post-bg-digital_circuits.jpg
catalog: true
tags:
    - AI
---

[claude-code](https://claude.com/product/claude-code)

## Claude Code

Claude Code 是由 Anthropic 推出的一个 AI 编程助手 / 编程代理（agent‑based AI coding tool），专注于帮助开发者在 终端（Terminal / CLI） 和 IDE 中快速、智能地编写、理解、修改和管理代码。它不仅是一个聊天式助手，而是一个能直接操作代码、运行命令、生成提交（PR）等的 行动型 AI 编程工具。

## 国内限制条件

1. VPN
2. 需要有效的 Anthropic 账号 + 订阅 / API Key, 境外手机号
3. 国际支付方式

## 国内使用方式-自己搭建中转

![claude_code](/images/ai/claude_code.png)

这种方式 理论上是可行的，也是大陆用户常用的访问方法，但有几点注意事项：

**VPS 选择**

* VPS 必须位于海外，并且网络质量稳定，否则延迟高、容易断线。
* 美国住宅 IP 最理想，因为 Claude 会检测请求来源 IP。

**安全性**

* VPS 上需要配置 Claude Relay 服务，保证 OAuth token 安全。
* 个人搭建要确保不泄露账号信息，否则可能被封号。

**复杂度**

* 需要处理订阅、支付、VPS 搭建、代理配置等步骤。
* 对普通用户来说操作复杂，但技术上可行。

**支付问题仍需解决**

* Subscription Block 的环节必须能完成订阅（海外 App Store 礼品卡 + Visa/PayPal）

## 国内使用方式-商业化中转

[接口AI](https://jiekou.ai/)

**接口AI官网购买API Key**



**配置环境变量**

```bash

{
  export ANTHROPIC_BASE_URL="https://api.jiekou.ai/anthropic"
  export ANTHROPIC_AUTH_TOKEN="<API Key>"
  # 设置本平台支持的模型
  export ANTHROPIC_MODEL="claude-opus-4-1-20250805"
  export ANTHROPIC_SMALL_FAST_MODEL="claude-sonnet-4-20250514"
}

```

进入工程目录，启动 Claude Code 接口

## 安装  Claude Code

```bash

$ curl -fsSL https://claude.ai/install.sh | bash
Setting up Claude Code...

✔ Claude Code successfully installed!

  Version: 2.1.14

  Location: ~/.local/bin/claude


  Next: Run claude --help to get started

✅ Installation complete!

```

## 启动

cd your-project
claude

会提示输入账号


```bash

Welcome to Claude Code v2.1.14                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                        
 Claude Code can be used with your Claude subscription or billed based on API usage through your Console account.                                                                                   
                                                                                                                                                                                                    
 Select login method:                                                                                                                                                                               
                                                                                                                                                                                                    
 ❯ 1. Claude account with subscription · Pro, Max, Team, or Enterprise                                                                                                                              
                                                                                                                                                                                                    
   2. Anthropic Console account · API usage billing    

```

## 模型版本选择

| 系列/版本               | 上下文  | 性能 | 成本 | 使用场景           |
| ------------------- | ---- | -- | -- | -------------- |
| opus-4-5            | 200k | 高  | 高  | 复杂推理、长文档处理     |
| sonnet-4-5          | 200k | 中高 | 中高 | 对话、文本生成、中等复杂任务 |
| haiku-4-5           | 20k  | 低  | 低  | 短文本生成、快速调用、低成本 |
| opus-dd / sonnet-dd | 200k | 高  | 中高 | 需要稳定性、一致性输出场景  |

**不同角色的模型选择**

| 开发类型                     | 建议模型                                 | 上下文        | 说明                                                                |
| ------------------------ | ------------------------------------ | ---------- | ----------------------------------------------------------------- |
| Android App 开发           | claude-haiku-4-5 / claude-sonnet-4-5 | 20k / 200k | App 问题通常偏业务逻辑、UI、API 调用，haiku 低成本足够；如果一次性处理大量代码或文档，可选 sonnet 200k |
| Android Framework / 系统开发 | claude-opus-4-5 / claude-opus-4-5-dd | 200k       | 系统开发问题涉及驱动、HAL、Framework 源码、长文档，opus 高性能和大上下文更适合保证准确性和推理能力        |

## 计费方式

```swift

claude-opus-4-5-20251101
上下文 200,000
$4.5 /百万 tokens（输入）
$22.5 /百万 tokens（输出）

```

**上下文 200,000**

一次请求中：输入 tokens + 输出 tokens ≤ 200,000

**输入 token**

10,000 tokens（比如一段 Framework 源码 + 描述）

10,000 / 1,000,000 × 4.5 = $0.045 美元

**输出 token**

5,000 tokens（较长的分析 + 代码）

5,000 / 1,000,000 × 22.5 = $0.1125 美元

**一次完整调用的真实费用示例**

输入：20,000 tokens  输出：5,000 tokens

输入：20,000 / 1,000,000 × 4.5 = $0.09
输出：5,000  / 1,000,000 × 22.5 = $0.1125

总计 ≈ $0.2025 美元


```swift

claude-sonnet-4-5-20250929
上下文 200,000
$2.7 /百万 tokens（输入）
$13.5 /百万 tokens（输出）

```

**一次完整调用的真实费用示例**

输入：20,000 tokens  输出：5,000 tokens

输入：20,000 / 1,000,000 × 2.7 = $0.054
输出：5,000  / 1,000,000 × 13.5 = $0.0675

总计 ≈ $0.12 美元

## Claude Code 是否允许接入开源模型

Claude Code 本身并不是只能用 Anthropic 的闭源模型，它 可以 接入某些开源模型或第三方模型，但这需要借助 API 层兼容或代理工具，而不是 Anthropic 官方直接提供的本地开源模型运行。

社区中也出现了一些中间件或代理，如OpenRouter、claude-code-proxy等，它们将 Claude Code 的请求转译成其他模型的接口格式，例如 GPT、Gemini、GLM 等，然后返回响应。
这种方式不需要 Anthropic 的封闭模型就能用 Claude Code 的交互逻辑去调用其他 LLMS。

**风险**

* Anthropic 可能更新其工具或 API 导致这些兼容方式失效
* 官方 可能不鼓励 在商业环境下用这些代理（取决于服务条款）

## Claude Code 对比 Cursor

| 特点    | **Claude Code** | **Cursor** |
| ----- | --------------- | ---------- |
| UI 体验 | CLI             | 图形 IDE     |
| 交互方式  | 命令/对话           | 编辑器内交互     |
| 代码补全  | X               | ✔️         |
| 大规模理解 | ✔️ 强            | ✔️ 中等      |
| 自动任务  | ✔️ 强            | ✔️ 限定      |
| 费用    | 计 token + 订阅    | 订阅制        |


**使用场景选择**

A. Android App 开发（常规场景）

* 主要使用 Cursor
  * 原因：快速、低成本、直接在 IDE 内使用
* 偶尔用 Claude Code
  * 对复杂模块或全项目分析，CLI 输出报告或重构建议，再手动应用

B. Framework / HAL / Driver 开发（系统层）

* 主要使用 Claude Code CLI
  * 原因：支持大文件、长上下文、复杂依赖分析
  * 可在 Android Studio 终端里直接调用 CLI

* 辅助使用 Cursor
  * 对单个函数、类的快速优化或生成代码片段时使用

* 成本控制
  * Claude Code 输出 token 贵 → 控制输出长度
  * 先小范围测试，再批量分析













