---
layout:     post
title:      Android JNI CMake
subtitle:   CMake is an open-source, cross-platform family of tools designed to build, test and package software.
date:       2019-01-30
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Android
---

[CMake-官网](https://cmake.org/)

[CMake Demo-IBM](https://www.ibm.com/developerworks/cn/linux/l-cn-cmake/index.html)

## CMake 简介

> CMake 是一个跨平台的自动化建构系统, 它使用一个名为 CMakeLists.txt 的文件来描述构建过程,可以产生标准的构建文件, 如 Unix 的 Makefile 或Windows Visual C++ 的 projects/workspaces
> 文件 CMakeLists.txt 需要手工编写, 也可以通过编写脚本进行半自动的生成

## CMake Demo

### main.cpp

```c++

#include <iostream>

int main() {

    std::cout<<"Hello word!"<<std::endl;
    return 0;

}

```

### CMakeLists.txt

```cmake
# CMakeLists.txt 的语法比较简单,由命令、注释和空格组成,其中命令是不区分大小写的,符号"#"后面的内容被认为是注释。
# 命令由命令名称、小括号和参数组成,参数之间使用空格进行间隔

# 项目的名称是 main
PROJECT(main)

# 限定了 CMake 的版本
CMAKE_MINIMUM_REQUIRED(VERSION 3.4.1)

# AUX_SOURCE_DIRECTORY 将当前目录中的源文件名称赋值给变量 DIR_SRCS
AUX_SOURCE_DIRECTORY(. DIR_SRCS)

# 指示变量 DIR_SRCS 中的源文件需要编译 成一个名称为 main 的可执行文件
ADD_EXECUTABLE(main ${DIR_SRCS})

```

### 构建-cmake .
```
-- The C compiler identification is GNU 5.4.0
-- The CXX compiler identification is GNU 5.4.0
-- Check for working C compiler: /usr/bin/cc
-- Check for working C compiler: /usr/bin/cc -- works
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Detecting C compile features
-- Detecting C compile features - done
-- Check for working CXX compiler: /usr/bin/c++
-- Check for working CXX compiler: /usr/bin/c++ -- works
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Configuring done
-- Generating done
-- Build files have been written to: /home/***/JNI/cmake
```

### 构建结果

```
├── CMakeCache.txt
├── CMakeFiles
│   ├── 3.5.1
│   │   ├── CMakeCCompiler.cmake
│   │   ├── CMakeCXXCompiler.cmake
│   │   ├── CMakeDetermineCompilerABI_C.bin
│   │   ├── CMakeDetermineCompilerABI_CXX.bin
│   │   ├── CMakeSystem.cmake
│   │   ├── CompilerIdC
│   │   │   ├── a.out
│   │   │   └── CMakeCCompilerId.c
│   │   └── CompilerIdCXX
│   │       ├── a.out
│   │       └── CMakeCXXCompilerId.cpp
│   ├── cmake.check_cache
│   ├── CMakeDirectoryInformation.cmake
│   ├── CMakeOutput.log
│   ├── CMakeTmp
│   ├── feature_tests.bin
│   ├── feature_tests.c
│   ├── feature_tests.cxx
│   ├── main.dir
│   │   ├── build.make
│   │   ├── cmake_clean.cmake
│   │   ├── DependInfo.cmake
│   │   ├── depend.make
│   │   ├── flags.make
│   │   ├── link.txt
│   │   └── progress.make
│   ├── Makefile2
│   ├── Makefile.cmake
│   ├── progress.marks
│   └── TargetDirectories.txt
├── cmake_install.cmake
├── CMakeLists.txt
├── main.cpp
└── Makefile
```

### 执行编译-make
```
[ 50%] Building CXX object CMakeFiles/main.dir/main.cpp.o
[100%] Linking CXX executable main
[100%] Built target main
```

### 运行main.bin

> Hello word!




