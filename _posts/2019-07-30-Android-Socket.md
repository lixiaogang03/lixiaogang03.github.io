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


