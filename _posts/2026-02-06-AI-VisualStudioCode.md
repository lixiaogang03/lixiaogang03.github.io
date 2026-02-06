---
layout:     post
title:      AI Visual Studio Code
subtitle:   AI 编程
date:       2026-02-06
author:     LXG
header-img: img/post-bg-e2e-ux.jpg
catalog: true
tags:
    - Tool
    - AI
---

## 修改菜单字体大小

```markdown

Ctrl + ,
搜索 window.zoomLevel

```

![vs_code_size](/images/ai/vs_code_size.png)

## 如何配置交叉编译环境

```cmake

cmake_minimum_required(VERSION 3.5)

# 交叉编译工具链配置
set(TOOLCHAIN_PATH "${CMAKE_CURRENT_SOURCE_DIR}/build/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi")
set(CMAKE_C_COMPILER "${TOOLCHAIN_PATH}/bin/arm-linux-gnueabi-gcc")
set(CMAKE_CXX_COMPILER "${TOOLCHAIN_PATH}/bin/arm-linux-gnueabi-g++")
set(CMAKE_AR "${TOOLCHAIN_PATH}/bin/arm-linux-gnueabi-ar")
set(CMAKE_RANLIB "${TOOLCHAIN_PATH}/bin/arm-linux-gnueabi-ranlib")

# 目标平台设置
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR ARM)

# 搜索路径配置
set(CMAKE_FIND_ROOT_PATH "${TOOLCHAIN_PATH}/arm-linux-gnueabi")
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# 项目目录配置
set(PROJECT_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/include")
set(PROJECT_LIB_DIR "${CMAKE_CURRENT_SOURCE_DIR}/lib")

include_directories("${PROJECT_INCLUDE_DIR}")

link_directories("${PROJECT_LIB_DIR}")

project(WifMqtt LANGUAGES C)

set(CMAKE_BUILD_TYPE Release CACHE STRING "Choose the type of build, options are: Debug Release RelWithDebInfo MinSizeRel.")

if (${CMAKE_BUILD_TYPE} MATCHES "Debug")
    add_definitions(-DDEBUG_BUILD)
endif()

ADD_EXECUTABLE(wif_mqtt main.c mqtt_sub.c mqtt_msg_build.c common_utils.c config_utils.c mqtt_msg_ota.c mqtt_msg_log.c mqtt_msg_app.c callback.h version.h)

# 添加链接标志以处理 GLIBC 版本差异
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,--allow-shlib-undefined")

# 链接库：使用库搜索路径
TARGET_LINK_LIBRARIES(wif_mqtt -L${PROJECT_LIB_DIR} paho-mqtt3as curl cjson config ssl crypto sys_info gnutls nettle hogweed gmp tasn1 rtmp z pthread)

# set_target_properties(wif_mqtt PROPERTIES OUTPUT_NAME "wif_mqtt_${CMAKE_BUILD_TYPE}")

```

## VS Code + AI

AI 大模型在 VS Code 上普遍适配，是因为 VS Code 开放、轻量、插件丰富，而且拥有 全球开发者用户群，技术实现简单、用户体验好、覆盖面广

![vs_code_ai](/images/ai/vs_code_ai.png)

## VS Code 使用 codex

[VS Code 使用 codex](https://docs.jiekou.ai/docs/integration/codex)

## PoloAPI

国内的 AI 大模型聚合与中转服务平台，主要面向开发者和企业用户提供统一、大模型 API 的调用入口

[PoloAPI](https://poloai.cn/pricing)

**通过 VS Code 使用 PoloAI**

* 安装插件，比如 CodeGPT / LocalAI / CodeGeeX
* 在插件设置里，把 API Base URL 改成 PoloAI 提供的接口地址
* 例如 https://api.poloai.cn/v1
* 填写 PoloAI 提供的 API Key

![code_gpt](/images/ai/code_gpt.png)

## CodeGPT 添加模型和 VS code直接添加模型区别

| 场景       | 插件添加模型                                       | 直接添加模型                    |
| -------- | -------------------------------------------- | ------------------------- |
| 多模型对比    | ✅ 可同时添加 OpenAI + Claude + LLaMA              | ❌ 通常只支持官方提供的              |
| 企业内网使用   | ✅ 本地部署模型，API Key 可控                          | ❌ 受官方网络限制，无法使用本地模型        |
| 快速个人测试   | ⚠️ 需配置插件                                     | ✅ 开箱即用                    |
| 多 IDE 支持 | ✅ 可在 VS Code / Android Studio / JetBrains 同步 | ❌ 主要局限 VS Code / 官方支持 IDE |

![vs_code_add_model](/images/ai/vs_code_add_model.png)

## PoloAPI 和 接口AI 区别

| 特性 / 平台   | **PoloAPI**             | **接口AI (JieKou.AI)** |
| --------- | ----------------------- | -------------------- |
| 模型聚合      | 是，支持多家主流模型              | 是，同样支持多模型            |
| Target 用户 | 企业优先 + 企业级服务            | 企业 + 个人开发者均支持        |
| 企业级保障     | 强调 SLA / 7×24 支持 / 专属服务 | 有基础服务与管理             |
| 价格策略      | 主打降本和折扣（原厂 API 折扣）      | 支持按量付费、透明计费          |
| 国内访问优化    | 提供国内加速和稳定通道             | 同样支持国内可访问模型 API      |
| 支持协议      | 统一标准 API                | 兼容 OpenAI API 标准     |
| 侧重场景      | 生产级稳定性、成本控制             | 通用聚合 + 模型体验 + 本地调用支持 |

## 聚合平台的透明度和可能的套利问题

![jiekou_ai_com](/images/ai/jiekou_ai_com.png)



























