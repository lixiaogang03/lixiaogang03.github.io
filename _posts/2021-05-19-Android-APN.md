---
layout:     post
title:      Android APN
subtitle:   Access Point Name
date:       2021-05-19
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - Android
---

[全面&详细解析APN](https://blog.csdn.net/GentelmanTsao/article/details/103234535)

## 概念

In the GPRS backbone, an Access Point Name (APN) is a reference to a GGSN. To support inter-PLMN roaming, the internal GPRS DNS functionality is used to translate the APN into the IP address of the GGSN.

从定义可看出，APN是GGSN的引用，被internal GPRS DNS转换为GGSN的IP地址。

![apn_define](/images/android/apn/apn_define.png)

那么GGSN是什么，又是做什么的呢？
**GGSN全称Gateway GPRS Support Node, 网关GPRS支持节点**

GGSN主要起网关作用，所扮演的角色：
对内：网络传输； （网络接入控制，分组数据的过滤）
对外：路由器（路由选择和分组的转发，IP地址分配）

## APN 参数

![apn_param](/images/android/apn/apn_param.png)

## APN 类型

![apn_type](/images/android/apn/apn_type.png)

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

## telephony.db

./user_de/0/com.android.providers.telephony/databases/telephony.db

```txt

sqlite> .tables
android_metadata  carriers          siminfo 

```

**siminfo**

```txt

_id|icc_id|sim_id|display_name|carrier_name|name_source|color|number|display_number_format|data_roaming|mcc|mnc|enable_cmas_extreme_threat_alerts|enable_cmas_severe_threat_alerts|enable_cmas_amber_alerts|enable_emergency_alerts|alert_sound_duration|alert_reminder_interval|enable_alert_vibrate|enable_alert_speech|enable_etws_test_alerts|enable_channel_50_alerts|enable_cmas_test_alerts|show_cmas_opt_out_dialog
1|89860919730002173816|0|CARD 1|CHN-UNICOM|0|-16746133||1|0|460|9|1|1|1|1|4|0|1|1|0|1|0|1

```

**carriers**

```txt

sqlite> select * from carriers;
_id|name|numeric|mcc|mnc|apn|user|server|password|proxy|port|mmsproxy|mmsport|mmsc|authtype|type|current|protocol|roaming_protocol|carrier_enabled|bearer|bearer_bitmask|mvno_type|mvno_match_data|sub_id|profile_id|modem_cognitive|max_conns|wait_time|max_conns_time|mtu|edited|user_visible

1088|CMNET|46000|460|00|cmnet|||||||||-1|default,supl||IPV4V6|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1089|CMNET|46002|460|02|cmnet|||||||||-1|default,supl||IPV4V6|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1090|CMNET|46007|460|07|cmnet|cmnet||cmnet||||||-1|default,supl||IPV4V6|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1091|CHina Mobile MMS|46000|460|00|cmwap||||10.0.0.172|80|10.0.0.172|80|http://mmsc.monternet.com|-1|mms||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1092|China Mobile MMS|46002|460|02|cmwap||||10.0.0.172|80|10.0.0.172|80|http://mmsc.monternet.com|-1|mms||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1093|中国移动彩信 (China Mobile)|46007|460|07|cmwap||||10.0.0.172|80|10.0.0.172|80|http://mmsc.monternet.com|-1|mms||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1094|China Mobile CMWAP|46000|460|00|CMWAP|wap|http://wap.monternet.com|wap|10.0.0.172|80|10.0.0.172|80|http://mmsc.monternet.com|-1|default||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1095|China Mobile CMWAP|46002|460|02|CMWAP|wap|http://wap.monternet.com|wap|10.0.0.172|80|10.0.0.172|80|http://mmsc.monternet.com|-1|default||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1096|China Mobile CMWAP|46007|460|07|CMWAP|wap|http://wap.monternet.com|wap|10.0.0.172|80|10.0.0.172|80|http://mmsc.monternet.com|-1|default||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1

1097|China Unicom 3G|46001|460|01|3gnet|||||80||||-1|default,supl||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1098|联通彩信|46001|460|01|3gwap||||||10.0.0.172|80|http://mmsc.myuni.com.cn|-1|mms||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1099|China Unicom MMS|46001|460|01|uniwap||||||10.0.0.172|80|http://mmsc.myuni.com.cn|-1|mms||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1100|China Telecom|46003|460|03|CTNET|ctnet@mycdma.cn||vnet.mobi||||||-1|default||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1101|China Telecom wap|46003|460|03|CTWAP|ctwap@mycdma.cn||vnet.mobi|||10.0.0.200|80|http://mmsc.vnet.mobi|-1|default||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1
1102|China Telecom Mms|46003|460|03|CTWAP|ctwap@mycdma.cn||vnet.mobi|10.0.0.200|80|10.0.0.200|80|http://mmsc.vnet.mobi|-1|mms||IP|IP|1|0|0|||-1|0|0|0|0|0|0|0|1

```

## 三大运营商apn

[三大电信运营APN设置](https://www.jianshu.com/p/8af304a15892)

**中国移动**

```txt

CMNET
APN：cmnet
MCC:460
MNC:02
APN类型：default，supl，dun

CMWAP
APN：cmwap
代理：10.0.0.172
端口：80
MCC:460
MNC:02
APN类型：default,supl,dun

移动彩信：
名称：彩信
APN：cmwap
MMSC:mmsc.monternet.com
彩信代理：10.0.0.172
彩信端口：80

```

**中国电信**

```txt

APN设置：名称：4G（随意，不要用中文）
接入点名称:ctnet
端口：80
用户名：vnet@mycdma.cn
密码：vnet.mobi
服务器地址：10.0.0.200
MMSC :http://mmsc.vnet.mobi
彩信代理：10.0.0.200
端口：80 MCC:460
MNC:11
身份验证类型：pap或chap
APN类型：default,mms,supl,hirpiAPN
协议：IPv4
APN漫游协议：IPv4
其它的不变（未设置）

```

**中国联通**

```txt

名称：3gwap
APN：3gwap
代理：10.0.0.172
端口：80
用户名：空
密码：http://www.wo.com.cn
服务器：空
MMSC：http://mmsc.myuni.com.cn
彩信代理：010.000.000.172
彩信端口：80
彩信协议：WAP 2.0
MCC：460
MNC：01
APN类型：mms

```




