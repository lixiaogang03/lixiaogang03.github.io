---
layout:     post
title:      WebSocket
subtitle:   Web sockets are defined as a two-way communication between the servers and the clients, which mean both the parties, communicate and exchange data at the same time.
date:       2021-08-13
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - websocket
---

[WebSocket-简书](https://www.jianshu.com/p/4e80b931cdea)

[netty.io](https://netty.io/)

## WebSocket

W3C 在 HTML5 中提供了一种 client 与 server 间进行全双工通讯的网络技术 WebSocket。WebSocket 是一个全新的、独立的协议，基于 TCP 协议，与 HTTP 协议兼容却不会融入 HTTP 协议，仅仅作为 HTML5 的一部分。

那 WebSocket 与 HTTP 什么关系呢？简单来说，WebSocket 是一种协议，是一种与 HTTP 同等的网络协议，两者都是应用层协议，都基于 TCP 协议。但是 WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据。同时，WebSocket 在建立连接时需要借助 HTTP 协议，连接建立好了之后 client 与 server 之间的双向通信就与 HTTP 无关了

![websocket](/images/webrtc/websocket.png)

## Socket.io

[socket.io-client-java](https://github.com/socketio/socket.io-client-java)

Socket.io提供了基于事件的实时双向通讯

```gradle

    implementation 'io.socket:socket.io-client:1.0.0'

```

## 代码

```java

    private final static String SOCKET_ADDRESS = "http://192.168.1.56:3000/";

    private final Emitter.Listener messageListener = new Emitter.Listener() {
        @Override
        public void call(Object... args) {

        }
    }

    private final Emitter.Listener clientIdListener = new Emitter.Listener() {
        @Override
        public void call(Object... args) {

        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            client = IO.socket(SOCKET_ADDRESS);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        client.on("message", messageListener);
        client.on("id", clientIdListener);
        client.connect();
    }

```

## netty

Netty 是 一个异步事件驱动的网络应用程序框架，用于快速开发可维护的高性能协议服务器和客户端。

![netty_components](/images/network/netty_components.png)




