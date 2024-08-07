---
layout:     post
title:      Buildroot MQTT
subtitle:   T113 linux
date:       2024-01-04
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - linux
---

## EMQ

[EMQ-sdk](https://www.emqx.com/zh/mqtt-client-sdk)

![emq_mqtt_sdk](/images/mqtt/emq_mqtt_sdk.png)

## MQTT Config

buildroot/buildroot-201902/configs/sun8iw20p1_t113_defconfig

```sh

BR2_PACKAGE_PAHO_MQTT_C=y

# BR2_PACKAGE_PYTHON_PAHO_MQTT is not set

```

buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.mk

```makefile

################################################################################
#
# paho-mqtt-c
#
################################################################################

PAHO_MQTT_C_VERSION = v1.3.0
PAHO_MQTT_C_SITE = $(call github,eclipse,paho.mqtt.c,$(PAHO_MQTT_C_VERSION))
PAHO_MQTT_C_LICENSE = EPL-1.0 or BSD-3-Clause
PAHO_MQTT_C_LICENSE_FILES = epl-v10 edl-v10
PAHO_MQTT_C_INSTALL_STAGING = YES

ifeq ($(BR2_PACKAGE_OPENSSL),y)
PAHO_MQTT_C_DEPENDENCIES += openssl
PAHO_MQTT_C_CONF_OPTS += -DPAHO_WITH_SSL=TRUE
else
PAHO_MQTT_C_CONF_OPTS += -DPAHO_WITH_SSL=FALSE
endif

$(eval $(cmake-package))

```

## MQTT 源码

buildroot/buildroot-201902/dl/paho-mqtt-c/paho-mqtt-c-v1.3.0.tar.gz

```txt

paho.mqtt.c-1.3.0$ tree -L 1
.
├── about.html
├── android
├── appveyor.yml
├── build.xml
├── cbuild.bat
├── cmake
├── CMakeLists.txt
├── CODE_OF_CONDUCT.md
├── conanfile.py
├── CONTRIBUTING.md
├── debian
├── deploy_rsa.enc
├── dist
├── doc
├── edl-v10
├── epl-v10
├── LICENSE
├── Makefile
├── notice.html
├── README.md
├── src
├── test
├── test_package
├── travis-build.sh
├── travis-deploy.sh
├── travis-env-vars
├── travis-install.sh
├── travis-macos-vars
└── travis-setup-deploy.sh

-------------------------------------------------------------------------------------------------------

paho.mqtt.c-1.3.0/src$ tree
.
├── Base64.c
├── Base64.h
├── Clients.c
├── Clients.h
├── CMakeLists.txt
├── Heap.c
├── Heap.h
├── LinkedList.c
├── LinkedList.h
├── Log.c
├── Log.h
├── Messages.c
├── Messages.h
├── MQTTAsync.c
├── MQTTAsync.h
├── MQTTClient.c
├── MQTTClient.h
├── MQTTClientPersistence.h
├── MQTTPacket.c
├── MQTTPacket.h
├── MQTTPacketOut.c
├── MQTTPacketOut.h
├── MQTTPersistence.c
├── MQTTPersistenceDefault.c
├── MQTTPersistenceDefault.h
├── MQTTPersistence.h
├── MQTTProperties.c
├── MQTTProperties.h
├── MQTTProtocolClient.c
├── MQTTProtocolClient.h
├── MQTTProtocol.h
├── MQTTProtocolOut.c
├── MQTTProtocolOut.h
├── MQTTReasonCodes.c
├── MQTTReasonCodes.h
├── MQTTSubscribeOpts.h
├── MQTTVersion.c
├── mutex_type.h
├── OsWrapper.c
├── OsWrapper.h
├── samples
│   ├── CMakeLists.txt
│   ├── MQTTAsync_publish.c
│   ├── MQTTAsync_subscribe.c
│   ├── MQTTClient_publish_async.c
│   ├── MQTTClient_publish.c
│   ├── MQTTClient_subscribe.c
│   ├── paho_c_pub.c
│   ├── paho_cs_pub.c
│   ├── paho_cs_sub.c
│   ├── paho_c_sub.c
│   ├── pubsub_opts.c
│   └── pubsub_opts.h
├── SHA1.c
├── SHA1.h
├── SocketBuffer.c
├── SocketBuffer.h
├── Socket.c
├── Socket.h
├── SSLSocket.c
├── SSLSocket.h
├── StackTrace.c
├── StackTrace.h
├── Thread.c
├── Thread.h
├── Tree.c
├── Tree.h
├── utf-8.c
├── utf-8.h
├── VersionInfo.h.in
├── WebSocket.c
└── WebSocket.h

```

## 编译输出

```txt

t113_linux/out/t113/evb1_auto/longan/buildroot$ find . -name "*mqtt*"
./target/usr/lib/libpaho-mqtt3a.so
./target/usr/lib/libpaho-mqtt3c.so.1
./target/usr/lib/libpaho-mqtt3cs.so
./target/usr/lib/libpaho-mqtt3as.so.1
./target/usr/lib/libpaho-mqtt3c.so
./target/usr/lib/libpaho-mqtt3cs.so.1.3.0
./target/usr/lib/libpaho-mqtt3c.so.1.3.0
./target/usr/lib/libpaho-mqtt3cs.so.1
./target/usr/lib/libpaho-mqtt3a.so.1.3.0
./target/usr/lib/libpaho-mqtt3as.so.1.3.0
./target/usr/lib/libpaho-mqtt3a.so.1
./target/usr/lib/libpaho-mqtt3as.so
./build/buildroot-config/br2/package/paho/mqtt
./build/paho-mqtt-c-v1.3.0
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3a.so
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3c.so.1
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3cs.so
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3as.so.1
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3c.so
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3cs.so.1.3.0
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3c.so.1.3.0
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3cs.so.1
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3a.so.1.3.0
./build/paho-mqtt-c-v1.3.0/src/CMakeFiles/paho-mqtt3c.dir
./build/paho-mqtt-c-v1.3.0/src/CMakeFiles/paho-mqtt3as.dir
./build/paho-mqtt-c-v1.3.0/src/CMakeFiles/paho-mqtt3cs.dir
./build/paho-mqtt-c-v1.3.0/src/CMakeFiles/paho-mqtt3a.dir
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3as.so.1.3.0
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3a.so.1
./build/paho-mqtt-c-v1.3.0/src/libpaho-mqtt3as.so
./build/paho-mqtt-c-v1.3.0/test/mqttsas.py
./build/paho-mqtt-c-v1.3.0/test/test_mqtt4sync.c
./build/paho-mqtt-c-v1.3.0/test/python/mqttasync_module.c
./build/paho-mqtt-c-v1.3.0/test/python/mqttclient_module.c
./build/paho-mqtt-c-v1.3.0/test/test_mqtt4async.c

```

## 升级mqtt版本

```diff

diff --git a/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.hash b/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.hash
index d628d06611..52c139131e 100644
--- a/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.hash
+++ b/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.hash
@@ -1,4 +1,5 @@
 # Locally computed:
-sha256  87cf846b02dde6328b84832287d8725d91f12f41366eecb4d59eeda1d6c7efdf  paho-mqtt-c-v1.3.0.tar.gz
+sha256  47c77e95609812da82feee30db435c3b7c720d4fd3147d466ead126e657b6d9c  paho-mqtt-c-v1.3.13.tar.gz
 sha256  83bbba033dc985487e321b6dfde111772affb73460be48726299fed3da684b1c  edl-v10
-sha256  44277b2bec6093e4ac313afec251a4de599d24c4e768f8574d95b13a9d2d97b5  epl-v10
+sha256  0becf16567beb77fa252b7664631dd177c8f9a1889e48995b45379c7130e5303  epl-v20
+sha256  bc0f3f447097eb82a29ad6c2f4929572bb548b6bd4c9e38fde1bf131a771b7a0  LICENSE
diff --git a/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.mk b/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.mk
index 9e8ae29999..e954595bab 100644
--- a/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.mk
+++ b/buildroot/buildroot-201902/package/paho-mqtt-c/paho-mqtt-c.mk
@@ -4,7 +4,7 @@
 #
 ################################################################################
 
-PAHO_MQTT_C_VERSION = v1.3.0
+PAHO_MQTT_C_VERSION = v1.3.13
 PAHO_MQTT_C_SITE = $(call github,eclipse,paho.mqtt.c,$(PAHO_MQTT_C_VERSION))
 PAHO_MQTT_C_LICENSE = EPL-1.0 or BSD-3-Clause
 PAHO_MQTT_C_LICENSE_FILES = epl-v10 edl-v10


```

## github mqtt c

[paho.mqtt.c-github](https://github.com/eclipse/paho.mqtt.c)

**编译步骤**

```txt

1. git clone https://github.com/eclipse/paho.mqtt.c.git

2. cd paho.mqtt.c.git

3. mkdir build

4. cd build

5. cmake .. 生成makefile

6. make 使用make命令构建mqtt c库

7. sudo make install 安装到系统目录中

```

**编译生成目录**

```txt

github/paho.mqtt.c/build$ tree -L 2
.
├── CMakeCache.txt
├── CMakeFiles
│   ├── 3.22.1
│   ├── cmake.check_cache
│   ├── CMakeDirectoryInformation.cmake
│   ├── CMakeOutput.log
│   ├── CMakeTmp
│   ├── Makefile2
│   ├── Makefile.cmake
│   ├── progress.marks
│   └── TargetDirectories.txt
├── cmake_install.cmake
├── CPackConfig.cmake
├── CPackSourceConfig.cmake
├── CTestTestfile.cmake
├── install_manifest.txt
├── Makefile
├── src
│   ├── CMakeFiles
│   ├── cmake_install.cmake
│   ├── eclipse-paho-mqtt-cConfigVersion.cmake
│   ├── libpaho-mqtt3a.so -> libpaho-mqtt3a.so.1
│   ├── libpaho-mqtt3a.so.1 -> libpaho-mqtt3a.so.1.3.13
│   ├── libpaho-mqtt3a.so.1.3.13
│   ├── libpaho-mqtt3c.so -> libpaho-mqtt3c.so.1
│   ├── libpaho-mqtt3c.so.1 -> libpaho-mqtt3c.so.1.3.13
│   ├── libpaho-mqtt3c.so.1.3.13
│   ├── Makefile
│   └── MQTTVersion
├── test
│   ├── CMakeFiles
│   ├── cmake_install.cmake
│   ├── CTestTestfile.cmake
│   ├── Makefile
│   ├── test1
│   ├── test10
│   ├── test11
│   ├── test15
│   ├── test2
│   ├── test4
│   ├── test45
│   ├── test6
│   ├── test8
│   ├── test9
│   ├── test95
│   ├── test_connect_destroy
│   ├── test_issue373
│   ├── test_sync_session_present
│   └── thread
└── VersionInfo.h

```

## paho-mqtt 不同版本的区别

* paho-mqtt3a ： 一般实际开发中就是使用这个，a表示的是异步消息推送（asynchronous）
* paho-mqtt3as ： as表示的是 异步+加密（asynchronous+OpenSSL）
* paho-mqtt3c ： c 表示的是同步（Synchronize），一般性能较差，是发送+等待模式
* paho-mqtt3cs ： 同上，增加了一个OpenSSL而已

## Ubuntu 2204 Eclipse

下载地址： http://mirrors.neusoft.edu.cn/eclipse/technology/epp/downloads/release/

eclipse-cpp-2023-12-R-linux-gtk-x86_64

**添加快捷方式**

sudo vim /usr/share/applications/eclipse.desktop

```ini

[Desktop Entry]
Version=1.0
Type=Application
Name=Eclipse IDE
Comment=Eclipse Integrated Development Environment
Exec=/home/lxg/system/eclipse-cpp-2023-12-R-linux-gtk-x86_64/eclipse/eclipse
Icon=/home/lxg/system/eclipse-cpp-2023-12-R-linux-gtk-x86_64/eclipse/icon.xpm
Terminal=false
StartupNotify=true
Categories=Development;IDE;

```

**交叉编译环境配置**

![cross_gcc_1](/images/tools/eclipse/cross_gcc_1.png)

![cross_gcc_2](/images/tools/eclipse/cross_gcc_2.png)

## EMQ MQTTX

本地模拟MQTT服务器

![emq_mqttx_server](/images/mqtt/emq_mqttx_server.png)

1. wget https://www.emqx.com/zh/downloads/broker/5.4.0/emqx-5.4.0-ubuntu22.04-amd64.deb
2. sudo apt install ./emqx-5.4.0-ubuntu22.04-amd64.deb
3. sudo systemctl start emqx

EMQ X Dashboard 是一个 Web 应用程序，你可以直接通过浏览器来访问它，无需安装任何其他软件。

当 EMQ X 成功运行在你的本地计算机上且 EMQ X Dashboard 被默认启用时，你可以访问 http://localhost:18083 来查看你的 Dashboard，默认用户名是 admin，密码是 public。

[http://localhost:18083](http://localhost:18083)

![emq_server](/images/mqtt/emq_server.png)

## eclipse 引用源码

![eclipse_include](/images/tools/eclipse/eclipse_include.png)

**编译命令**

arm-linux-gnueabi-gcc -I/home/lxg/code/github/paho.mqtt.c/src -O0 -g3 -Wall -c -fmessage-length=0 -MMD -MP -MF"src/wif_service.d" -MT"src/wif_service.o" -o "src/wif_service.o" "../src/wif_service.c"

## eclipse 更换下载镜像源

http://download.eclipse.org/ 更换为 https://mirrors.ustc.edu.cn/eclipse/

![eclipse_mirror](/images/tools/eclipse/eclipse_mirror.png)


sudo gedit /etc/hosts

```sh

185.199.108.133 raw.githubusercontent.com
185.199.109.133 raw.githubusercontent.com
185.199.110.133 raw.githubusercontent.com
185.199.111.133 raw.githubusercontent.com
182.43.124.6 raw.githubusercontent.com

```

## QtCreator 开发 C 语言项目

```txt

WifMqtt$ tree
.
├── build
│   └── Debug
│       ├── build.ninja
│       ├── CMakeCache.txt
│       ├── CMakeFiles
│       │   ├── 3.22.1
│       │   │   ├── CMakeCCompiler.cmake
│       │   │   ├── CMakeDetermineCompilerABI_C.bin
│       │   │   ├── CMakeSystem.cmake
│       │   │   └── CompilerIdC
│       │   │       ├── a.out
│       │   │       ├── CMakeCCompilerId.c
│       │   │       └── tmp
│       │   ├── cmake.check_cache
│       │   ├── CMakeOutput.log
│       │   ├── CMakeTmp
│       │   ├── rules.ninja
│       │   ├── TargetDirectories.txt
│       │   └── WifMqtt.dir
│       │       └── main.c.o
│       ├── cmake_install.cmake
│       ├── WifMqtt
│       └── WifMqtt.cbp
├── CMakeLists.txt
├── CMakeLists.txt.user
├── main.c
└── README.md

```

**CMake 脚本**

```cmake

cmake_minimum_required(VERSION 3.5)

# 头文件
include_directories("/usr/local/include")

# 动态链接so库
link_directories("/home/lxg/code/gitlab/WifMqtt/lib")

project(WifMqtt LANGUAGES C)

# 可执行文件
add_executable(WifMqtt main.c)

# 动态链接paho-mqtt3a so库
TARGET_LINK_LIBRARIES(WifMqtt paho-mqtt3a)

```
















