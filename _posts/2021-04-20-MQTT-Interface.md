---
layout:     post
title:      MQTT Interface
subtitle:   MWTT 接口描述
date:       2021-04-20
author:     LXG
header-img: img/post-bg-os-metro.jpg
catalog: true
tags:
    - mqtt
---

[MQTT-LXG](https://lixiaogang03.github.io/2019/12/27/MQTT/)

[MQTT中文网](http://mqtt.p2hp.com/)

## IMqttClient

[MQTT-JAVA-Document](https://www.eclipse.org/paho/files/javadoc/index.html)

Enables an application to communicate with an MQTT server using blocking methods. (阻塞方法)
This interface allows applications to utilize all features of the MQTT version 3.1 specification including:

* connect
* publish
* subscribe
* unsubscribe
* disconnect

## MqttClient

Lightweight client for talking to an MQTT server using methods that block until an operation completes.
This class implements the blocking IMqttClient client interface where all actions block until they have completed (or timed out). This implementation is compatible with all Java SE runtimes from 1.4.2 and up.

An application can connect to an MQTT server using:

* A plain TCP socket
* An secure SSL/TLS socket

## MqttCallback

Enables an application to be notified when asynchronous events related to the client occur. Classes implementing this interface can be registered on both types of client: IMqttClient.setCallback(MqttCallback) and IMqttAsyncClient.setCallback(MqttCallback)




