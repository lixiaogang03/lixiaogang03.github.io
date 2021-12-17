---
layout:     post
title:      Android SerialPort
subtitle:   modbus
date:       2021-12-17
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - modbus
---

[Android-SerialPort-API-Github](https://github.com/licheedev/Android-SerialPort-API)

[Modbus4Android-Github](https://github.com/licheedev/Modbus4Android)

[SerialWorker-Github](https://github.com/licheedev/SerialWorker)

## RS485

[RS485通讯指南](https://www.eltima.com/article/rs485-communication-guide/)

## 定义

RS-485（目前称为EIA/TIA-485）是通信物理层的标准接口，一种信号传输方式， OSI（开放系统互连）模型的第一级。创建 RS-485 是为了扩展 RS-232 接口的物理功能。

串行 EIA-485 连接是使用两根或三根电线的电缆完成的：一根数据线、一根带反转数据的电线，通常还有一根零线（接地，0 V）

这里的主要思想是通过两根电线传输一个信号。当一根电线传输原始信号时，另一根电线传输其反向副本。这种传输方法提供了对共模干扰的高抵抗力。用作传输线的双绞线可以是屏蔽或非屏蔽的。

![rs485.webp](images/uart_screen/rs485.webp)

## 传输距离和速率

1200 米是 RS-485 通信中的最大电缆长度，可以达到100 kbits/s

## 通讯协议

在 RS485 通信协议中，命令由定义为主站的节点发送。连接到主站的所有其他节点通过 RS485 端口接收数据。根据发送的信息，线路上的零个或多个节点响应主站。

RS-485接口的主要优点是：

* 通过一对双绞线进行双向数据交换
* 支持连接到同一条线路的多个收发器，即创建网络的能力
* 通讯线长
* 高传输速度

## RS485 与 RS232

| 协议	| RS232	| RS485 |
| ----- | ----- | ----- |
| 协议类型 | 双工 | 半双工 |
| 信号类型 | 不平衡 | 均衡 |
| 设备数量 | 1 个发射器和 1 个接收器 | 多达 32 个发射器和 43 个接收器 |
| 最大数据传输 | 19.2Kbps 15 米 | 10Mbps 15 米 |
| 最大电缆长度 | 约 15.25 米，19.2Kbps | 大约 1220 米，100 Kbps |
| 输出电流 | 500mA | 250mA |
| 最小输入电压 | +/- 3V | 0.2V 差分 |

## Modbus

[modbus-rtu-guide](https://www.virtual-serial-port.org/articles/modbus-rtu-guide/)

Modbus是一种被工业电子设备广泛使用的串行通信协议。在 Modbus 中，在主站（主机）和从站（基于 COM 的设备）* 之间建立连接。Modbus 有助于访问设备的配置并读取测量值。

数据交换由主机发起。主机可以自行将其 RS-485 驱动程序切换到传输模式，而其他 RS485 驱动程序（从机）工作在接收模式。为了让从设备通过通信线路应答主机，“主设备”向它发送一个特殊命令，该命令使目标设备有权将其驱动程序切换到传输模式一段时间

Modbus 是用于设备相互交互的最简单的协议之一。同时对于设备制造商来说很容易实现，这是它盛行的主要原因，同时对于一个工程师、程序员来说却很难，因为它把所有实现的困难都推到了他的肩上。最终的解决方案，需要他处理寄存器和变量的多页表、它们的地址、各种读写和数据转换功能。

Modbus RTU 采用二进制编码和 CRC 错误检查。这些选择是为了提高效率，也是 RTU 模式在工业环境中最常用的主要原因。您可能已经猜到，Modbus ASCII 在发送消息时使用 ASCII 字符。

## Modebus 报文

![modbus_protocal](/images/uart_screen/modbus_protocal.jpg)

* 地址：取值范围是0-247，如果是0，就是主站广播报文；如果是1-247，则有可能是主站请求或者从站应答。
* 功能码：也就是报文命令，代表主站对从站的操作，读或者写
* 数据：数据字段，主请求报文，从应答报文会有所差异。也就是说假设抓取总线报文，如何区分是主站请求还是从站应答，则需要通过数据字段进行区分了。
* CRC校验：采样CRC16，16位循环冗余校验。








