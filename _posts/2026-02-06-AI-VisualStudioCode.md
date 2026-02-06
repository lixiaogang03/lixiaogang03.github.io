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





























