---
layout:     post
title:      Visual Studio Code
subtitle:   微软的跨平台代码编辑器
date:       2019-10-20
author:     LXG
header-img: img/post-bg-e2e-ux.jpg
catalog: true
tags:
    - c++
---

[官网](https://visualstudio.microsoft.com/zh-hans/vs/)

## 简介

Microsoft 在2015年4月30日 Build 开发者大会上正式宣布了 Visual Studio Code 项目：一个运行于 Mac OS X、Windows 和 Linux 之上的，针对于编写现代 Web 和云应用的跨平台源代码编辑器

至2019年9月，已经支持了如下37种语言或文件：F#、HandleBars、Markdown、Python、Jade、PHP、Haxe、Ruby、Sass、Rust、PowerShell、Groovy、R、Makefile、HTML、JSON、TypeScript、Batch、Visual Basic、Swift、Less、SQL、XML、Lua、Go、C++、Ini、Razor、Clojure、C#、Objective-C、CSS、JavaScript、Perl、Coffee Script、Java、Dockerfile

## 安装

[下载地址](https://code.visualstudio.com/Download)

**安装**

> sudo dpkg -i code_1.39.2-1571154070_amd64.deb

**启动**

> code

**中文插件**

Chinese (Simplified) Language Pack for Visual Studio Code

## c++ 环境配置

![visual_studio_code](/images/visual_studio/visual_studio_code.png)

## 编译和运行

**安装c++插件**

![config_1](/images/visual_studio/config_1.png)

**添加编译配置**

![config_2](/images/visual_studio/config_2.png)

**运行和结果**

![config_3](/images/visual_studio/config_3.png)

## launch.json

```json

{
    "version": "0.2.0",

    "configurations": [

        {

            "name": "make",                                                 // 配置名称，将会在启动配置的下拉菜单中显示

            "type": "cppdbg",                                               // 配置类型，这里只能为cppdbg

            "request": "launch",                                            // 请求配置类型，可以为launch（启动）或attach（附加）

            "program": "${workspaceFolder}/bin/ticket",                     // 将要进行调试的程序的路径

            "args": [],                                                     // 程序调试时传递给程序的命令行参数，一般设为空即可

            "stopAtEntry": false,                                           // 设为true时程序将暂停在程序入口处，我一般设置为true

            "cwd": "${workspaceFolder}",                                    // 调试程序时的工作目录

            "environment": [],                                              // （环境变量？）

            "externalConsole": true,                                        // 调试时是否显示控制台窗口，一般设置为true显示控制台

            "internalConsoleOptions": "neverOpen",                          // 如果不设为neverOpen，调试时会跳到“调试控制台”选项卡，你应该不需要对gdb手动输命令吧？

            "MIMode": "gdb",                                                // 指定连接的调试器，可以为gdb或lldb。但目前lldb在windows下没有预编译好的版本。

            "miDebuggerPath": "gdb",                                        // 调试器路径，Windows下后缀不能省略，Linux下则去掉

            "setupCommands": [                                              // 用处未知，模板如此
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": false
                }
            ],

            "preLaunchTask": "make"                                         // 调试会话开始前执行的任务，一般为编译程序。与tasks.json的label相对应

        }

    ]

}

```

## task.json

**创建task.json快捷键F5**

```json

{

    "version": "2.0.0",

    "tasks": [

        {

            "label": "make",

            "type": "shell",

            "command": "make"

        }
    ]

}

```





