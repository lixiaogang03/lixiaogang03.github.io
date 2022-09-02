---
layout:     post
title:      Rockchip Vendor Storage
subtitle:   Vendor storage is designed for stored SN, MAC and other vendor data.
date:       2022-09-02
author:     LXG
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Rockchip
---

RKDocs: RK Vendor StorageApplication Note

## 概念

Vendor storage is designed for stored SN, MAC and other vendor data.

Feature:

* Unique ID Access
* Reliable Data Validation
* Power Lost Recovery
* Writable and Readable for PC
* Writable and Readable for UBOOT
* Writable and Readable for Kernel
* Writable and Readable for Linux Application

## 架构

![vendor_storage](/images/rockchip/vendor_storage.png)

## 存储结构

![data_layout](/images/rockchip/data_layout.png)

**SPI NOR FLASH**

SPI一种串行通信接口, Flash是非易失性存储介质, 分为NOR和NAND两种, 在1～4MB的小容量时具有很高的成本效益

**NAND Flash**

NAND Flash的存储容量比NOR Flash大, NAND结构能提供极高的单元密度，可以达到高存储密度，并且写入和擦除的速度也很快。应用NAND的困难在于flash的管理和需要特殊的系统接口。

**EMMC**

eMMC (Embedded Multi Media Card）,即嵌入式多媒体卡，是MMC协会订立、主要针对手机或平板电脑等产品的内嵌式存储器标准规格。eMMC由Nand flash、Nand flash控制器以及标准接口封装组成。

**EEPROM**

E2PROM电可擦除，如学习单片机时用到的AT24C02芯片，大小为2K，用于保存少量掉电不丢失的数据，单片机通过IIC来读写这个EEPROM的内容

## 数据ID

![vendor_data_id](/images/rockchip/vendor_data_id.png)






