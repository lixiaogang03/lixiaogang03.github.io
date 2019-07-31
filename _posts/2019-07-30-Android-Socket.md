---
layout:     post
title:      Android Socket
subtitle:   IPC
date:       2019-07-30
author:     LXG
header-img: img/post-bg-digital-native.jpg
catalog: true
tags:
    - android
    - socket
---

## 参考地址

[Socket通信-看云](https://www.kancloud.cn/kancloud/android-tutorial/87238)

## Socket通信模型

![socket_model](/images/socket_model.jpg)

## 服务端

```java

    class SocketServer implements Runnable {
        @Override
        public void run() {
            try {
                ServerSocket serverSocket = new ServerSocket(8188);
                while (!exitService) {
                    Socket client = serverSocket.accept();
                    Log.d(TAG, "===Socket connect success===");
                    startLogcatProcess(client);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

```

## TCP keep-alive


```java

    /**
     * When the keepalive option is set for a TCP socket and no data
     * has been exchanged across the socket in either direction for
     * <2 hours> (NOTE: the actual value is implementation dependent),
     * TCP automatically sends a keepalive probe to the peer. This probe is a
     * TCP segment to which the peer must respond.
     * One of three responses is expected:
     * 1. The peer responds with the expected ACK. The application is not
     *    notified (since everything is OK). TCP will send another probe
     *    following another 2 hours of inactivity.
     * 2. The peer responds with an RST, which tells the local TCP that
     *    the peer host has crashed and rebooted. The socket is closed.
     * 3. There is no response from the peer. The socket is closed.
     *
     * The purpose of this option is to detect if the peer host crashes.
     *
     * Valid only for TCP socket: SocketImpl
     *
     * @see Socket#setKeepAlive
     * @see Socket#getKeepAlive
     */
    @Native public final static int SO_KEEPALIVE = 0x0008;


    /**
     * Enable/disable {@link SocketOptions#SO_KEEPALIVE SO_KEEPALIVE}.
     *
     * @param on  whether or not to have socket keep alive turned on.
     * @exception SocketException if there is an error
     * in the underlying protocol, such as a TCP error.
     * @since 1.3
     * @see #getKeepAlive()
     */
    public void setKeepAlive(boolean on) throws SocketException {
        if (isClosed())
            throw new SocketException("Socket is closed");
        getImpl().setOption(SocketOptions.SO_KEEPALIVE, Boolean.valueOf(on));
    }

```


