---
layout:     post
title:      Android APN
subtitle:   Access Point Name
date:       2021-05-19
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - apn
---

[全面&详细解析APN](https://blog.csdn.net/GentelmanTsao/article/details/103234535)

## 概念

In the GPRS backbone, an Access Point Name (APN) is a reference to a GGSN. To support inter-PLMN roaming, the internal GPRS DNS functionality is used to translate the APN into the IP address of the GGSN.

从定义可看出，APN是GGSN的引用，被internal GPRS DNS转换为GGSN的IP地址。

![apn_define](/images/apn/apn_define.png)

那么GGSN是什么，又是做什么的呢？
**GGSN全称Gateway GPRS Support Node, 网关GPRS支持节点**

GGSN主要起网关作用，所扮演的角色：
对内：网络传输； （网络接入控制，分组数据的过滤）
对外：路由器（路由选择和分组的转发，IP地址分配）

## APN 参数

![apn_param](/images/apn/apn_param.png)

## APN 类型

![apn_type](/images/apn/apn_type.png)

## apns-conf.xml

system/etc/apns-conf.xml

device/rockchip/rk3288/rk3288.mk:PRODUCT_COPY_FILES += vendor/rockchip/common/phone/etc/apns-full-conf.xml:system/etc/apns-conf.xml

vendor/rockchip/common/phone/etc/apns-full-conf.xml

```xml

<apns version="8">

  <apn carrier="China Mobile" mcc="460" mnc="00" apn="cmnet" type="default,supl" />
  <apn carrier="China Mobile" mcc="460" mnc="02" apn="cmnet" type="default,supl" />
  <apn carrier="中国移动 (China Mobile) GPRS" mcc="460" mnc="07" user="cmnet" password="cmnet" apn="cmnet" type="default,supl" />

</apns>

```


