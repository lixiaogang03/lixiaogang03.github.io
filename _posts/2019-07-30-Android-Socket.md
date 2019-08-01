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

[IPC通信方式之LocalSocket](https://www.jianshu.com/p/7cc0a649e1a1)

## Socket

Socket通常翻译为套接字，它是为了方便让两台机器能互相通信的一套技术，该套技术封装好了繁琐的TCP/IP协议，向外提供出简单的API简化了通信实现的过程，其可以实现不同层面，不同应用，跨进程跨网络的通信

依据Socket提供的数据传输特性可分为如下几个大类：

1. Stream socket: 提供双向、有序、可靠、非重复的数据通信。大致可以认为它封装的TCP通信协议。<br/>
2. Datagram socket: 提供双向数据通信，数据不一定按顺序到达。大致可以认为它封装的是UDP通信协议。<br/>
3. Sequential socket: 提供双向、有序、可靠数据通信，数据包有最大限制，并且必须把这个包完整的接受才能进行读取。<br/>
4. Raw socket: 提供相对TCP/UDP而言较下层的通信协议访问，如果使用非TCP/UDP的通信协议可以使用该类型的socket。


### Socket通信模型

![socket_model](/images/socket_model.jpg)

### 服务端

```java

    class SocketServer implements Runnable {
        @Override
        public void run() {
            try {
                ServerSocket serverSocket = new ServerSocket(8188);
                while (true) {
                    Socket client = serverSocket.accept(); // 阻塞等待
                    Log.d(TAG, "===Socket connect success===");
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

```

### 客户端

```java

    /**
     * Connect ServerSocket receive msg from callback
     */
    public void connectServerSocket(final SocketCallback callback, final long retryTime) {
        new Thread() {
            @Override
            public void run() {
                Socket socket = null;
                while (socket == null) {
                    try {
                        socket = new Socket("localhost", 8188);
                        client = socket;
                        callback.onConnectSuccess();
                    } catch (IOException e) {
                        callback.onConnectError(e);
                        SystemClock.sleep(retryTime);
                        callback.onConnectRetry();
                    }
                }

                try {
                    bufferedReader = new BufferedReader(new InputStreamReader(
                            socket.getInputStream()));
                    while (true) {
                        String msg = bufferedReader.readLine();
                        if (msg != null) {
                            callback.onReceive(msg);
                        }
                    }
                } catch (IOException e) {
                    callback.onReceiveError(e);
                }
            }
        }.start();
    }

```

### TCP keep-alive


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

## LocalSocket

Android中的LocalSocket是基于UNIX-domain Socket的，UNIX-domain Socket是在Socket的基础上衍生出来的一种IPC通信机制，因此LocalSocket解决的是同一台主机上不同进程间互相通信的问题。
其相对于网络通信使用的socket不需要经过网络协议栈，不需要打包拆包、计算校验，自然的执行效率也高。与大名鼎鼎的binder机制作用一样，都在Android系统中作为IPC通信手段被广泛使用。


### 服务端


```java

    /**
     * Creates a new server socket listening at specified name.
     * On the Android platform, the name is created in the Linux
     * abstract namespace (instead of on the filesystem).
     *
     * @param name address for socket
     * @throws IOException
     */
    public LocalServerSocket(String name) throws IOException
    {
        impl = new LocalSocketImpl();

        impl.create(LocalSocket.SOCKET_STREAM);

        localAddress = new LocalSocketAddress(name);
        impl.bind(localAddress);

        impl.listen(LISTEN_BACKLOG);
    }

    // 如上构造方法同时处理了bind和listen
    LocalServerSocket serverSock = new LocalServerSocket("com.android.bluetooth.tests.sock");
    LocalSocket acceptSock = serverSock.accept();

    // 获取客户端的身份以便做权限控制
    Credentials credentials = acceptSock.getPeerCredentials();
    Log.d(TAG, "connect success: " + pm.getNameForUid(credentials.getUid()));

```

### 客户端

```java

    LocalSocket client = new LocalSocket();
    LocalSocketAddress address = new LocalSocketAddress(SOCKET_NAME, LocalSocketAddress.Namespace.ABSTRACT);
    client.connect(address);

```

## 调试命令

**netstat**

```txt

V2:/ # netstat -h

usage: netstat [-pWrxwutneal]

Display networking information.

-r  Display routing table.
-a  Display all sockets (Default: Connected).
-l  Display listening server sockets.
-t  Display TCP sockets.
-u  Display UDP sockets.
-w  Display Raw sockets.
-x  Display Unix sockets.
-e  Display other/more information.
-n  Don't resolve names.
-W  Wide Display.
-p  Display PID/Program name for sockets.

```

**netstat -apn**

```txt
V2:/ # netstat -apn

Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program Name
tcp        0      0 127.0.0.1:5037          0.0.0.0:*               LISTEN      5283/adbd
tcp        0      0 :::8080                 :::*                    LISTEN      23636/cn.showmac.vsimservice
tcp        0      0 :::8188                 :::*                    LISTEN      19452/com.sunmi.sunmiopenservice
tcp        0      0 ::ffff:127.0.0.1:40954  ::ffff:127.0.0.1:8188   ESTABLISHED 19535/com.sunmi.sunmiserverdemo
tcp        0      0 ::ffff:127.0.0.1:8188   ::ffff:127.0.0.1:40954  ESTABLISHED 19452/com.sunmi.sunmiopenservice
tcp        0      0 ::ffff:10.10.163.131:34 ::ffff:175.25.50.78:701 ESTABLISHED 23636/cn.showmac.vsimservice
udp     2816      0 10.10.163.131:68        10.10.175.254:67        ESTABLISHED 899/system_server

Active UNIX domain sockets (servers and established)
Proto RefCnt Flags       Type       State           I-Node PID/Program Name                   Path

unix  2      [ ACC ]     STREAM     LISTENING     11648428 19535/com.sunmi.sunmiserverdemo    @com.sunmi.sunmiserverdemo
unix  3      [ ]         STREAM     CONNECTED        17963 303/vold                           /dev/socket/vold
unix  3      [ ]         STREAM     CONNECTED        15769 454/installd                       /dev/socket/installd
unix  2      [ ]         DGRAM                     2020915 5414/wpa_supplicant                /data/misc/wifi/sockets/wlan0
unix  3      [ ]         STREAM     CONNECTED      1880643 5283/adbd                          @jdwp-control

```

## Android中的Socket IPC

Socket通信方式也是C/S架构，比Binder简单很多。在Android系统中采用Socket通信方式的主要有：

* zygote：用于孵化进程，system_server创建进程是通过socket向zygote进程发起请求
* installd：用于安装App的守护进程，上层PackageManagerService很多实现最终都是交给它来完成
* lmkd：lowmemorykiller的守护进程，Java层的LowMemoryKiller最终都是由lmkd来完成
* adbd：这个也不用说，用于服务adb
* logcatd:这个不用说，用于服务logcat
* vold：即volume Daemon，是存储类的守护进程，用于负责如USB、Sdcard等存储设备的事件处理

Socket方式更多的用于Android framework层与native层之间的通信

### installd

[Installd守护进程](http://gityuan.com/2016/11/13/android-installd/)

## 权限控制

```java

/**
 * Socket implementation used for android.net.LocalSocket and
 * android.net.LocalServerSocket. Supports only AF_LOCAL sockets.
 */
class LocalSocketImpl {

    /**
     * Retrieves the credentials of this socket's peer. Only valid on
     * connected sockets.
     *
     * @return non-null; peer credentials
     * @throws IOException
     */
    public Credentials getPeerCredentials() throws IOException {
        return getPeerCredentials_native(fd);
    }

}

/**
 * A class for representing UNIX credentials passed via ancillary data
 * on UNIX domain sockets. See "man 7 unix" on a desktop linux distro.
 */
public class Credentials {
    /** pid of process. root peers may lie. */
    private final int pid;
    /** uid of process. root peers may lie. */
    private final int uid;
    /** gid of process. root peers may lie. */
    private final int gid;
}

```

