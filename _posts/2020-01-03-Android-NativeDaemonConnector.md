---
layout:     post
title:      Android NativeDaemonConnector
subtitle:   netd
date:       2020-01-03
author:     LXG
header-img: img/post-bg-miui-ux.jpg
catalog: true
tags:
    - Android
---

[源码NativeDaemonConnector解析](http://gaozhipeng.me/posts/nativedaemonconnector_source_code/)

## NativeDaemonConnector

NetworkManagerService 和 netd 之间的桥梁

```java

public class NetworkManagementService extends INetworkManagementService.Stub
        implements Watchdog.Monitor {

    private NetworkManagementService(Context context, String socket) {

        mConnector = new NativeDaemonConnector(
                new NetdCallbackReceiver(), socket, 10, NETD_TAG, 160, wl,
                FgThread.get().getLooper());
        mThread = new Thread(mConnector, NETD_TAG);

        mDaemonHandler = new Handler(FgThread.get().getLooper());

    }

}


final class NativeDaemonConnector implements Runnable, Handler.Callback, Watchdog.Monitor {

    @Override
    public void run() {
        mCallbackHandler = new Handler(mLooper, this);

        while (true) {
            try {
                listenToSocket();
            } catch (Exception e) {
                loge("Error in NativeDaemonConnector: " + e);
                SystemClock.sleep(5000);
            }
        }
    }


    private void listenToSocket() throws IOException {
        LocalSocket socket = null;

        try {
            socket = new LocalSocket();
            LocalSocketAddress address = determineSocketAddress();

            socket.connect(address);

            InputStream inputStream = socket.getInputStream();
            synchronized (mDaemonLock) {
                mOutputStream = socket.getOutputStream();
            }

            mCallbacks.onDaemonConnected();

            FileDescriptor[] fdList = null;
            byte[] buffer = new byte[BUFFER_SIZE];
            int start = 0;

            while (true) {
                int count = inputStream.read(buffer, start, BUFFER_SIZE - start);

                ------------------------------------------------------------

                            final NativeDaemonEvent event =
                                    NativeDaemonEvent.parseRawEvent(rawEvent, fdList);

                            log("RCV <- {" + event + "}");

                            // netd 主动上报的消息
                            if (event.isClassUnsolicited()) {
                                // TODO: migrate to sending NativeDaemonEvent instances
                                if (mCallbacks.onCheckHoldWakeLock(event.getCode())
                                        && mWakeLock != null) {
                                    mWakeLock.acquire();
                                    releaseWl = true;
                                }
                                Message msg = mCallbackHandler.obtainMessage(
                                        event.getCode(), uptimeMillisInt(), 0, event.getRawEvent());
                                if (mCallbackHandler.sendMessage(msg)) {
                                    releaseWl = false;
                                }
                            } else {
                                // NMS 请求，netd 答复的消息
                                mResponseQueue.add(event.getCmdNumber(), event);
                            }

                 ------------------------------------------------------------

            }

   }

}

```

## 初始化

![native_daemon_connector_init](/images/network/native_daemon_connector_init.png)

## 向netd发送指令

```java

    @Override
    public InterfaceConfiguration getInterfaceConfig(String iface) {
        mContext.enforceCallingOrSelfPermission(CONNECTIVITY_INTERNAL, TAG);

        final NativeDaemonEvent event;
        try {
            event = mConnector.execute("interface", "getcfg", iface);
        } catch (NativeDaemonConnectorException e) {
            throw e.rethrowAsParcelableException();
        }

        event.checkCode(InterfaceGetCfgResult);

        // Rsp: 213 xx:xx:xx:xx:xx:xx yyy.yyy.yyy.yyy zzz flag1 flag2 flag3
        final StringTokenizer st = new StringTokenizer(event.getMessage());

    }

```

![native_daemon_connector_execute](/images/network/native_daemon_connector_execute.png)

## 响应码

```java

    class NetdResponseCode {
        /* Keep in sync with system/netd/server/ResponseCode.h */
        public static final int InterfaceListResult       = 110;
        public static final int TetherInterfaceListResult = 111;
        public static final int TetherDnsFwdTgtListResult = 112;
        public static final int TtyListResult             = 113;
        public static final int TetheringStatsListResult  = 114;

        public static final int TetherStatusResult        = 210;
        public static final int IpFwdStatusResult         = 211;
        public static final int InterfaceGetCfgResult     = 213;
        public static final int SoftapStatusResult        = 214;
        public static final int InterfaceRxCounterResult  = 216;
        public static final int InterfaceTxCounterResult  = 217;
        public static final int QuotaCounterResult        = 220;
        public static final int TetheringStatsResult      = 221;
        public static final int DnsProxyQueryResult       = 222;
        public static final int ClatdStatusResult         = 223;

        public static final int InterfaceChange           = 600;
        public static final int BandwidthControl          = 601;
        public static final int InterfaceClassActivity    = 613;
        public static final int InterfaceAddressChange    = 614;
        public static final int InterfaceDnsServerInfo    = 615;
        public static final int RouteChange               = 616;
        public static final int StrictCleartext           = 617;
        public static final int InterfaceMessage          = 618;
    }

```

## netd 主动上报的消息处理

![ndc_unsolicited_msg](/images/network/ndc_unsolicited_msg.png)

## 原理总结

在服务刚刚开启的时候，就会开启一个线程在后台与localsocket进行连接，然后等待inputstream，
在调用对应的execute方法之后，调用者会阻塞在等待result，在命令执行完成后，会往inputstream里面传入流，
线程拿到流后进行解析，同时将解析结果放到responsequeue中。这个时候，execute方法的超时时间过了，
如果在responesequeue中还是没有结果就会抛出异常，如果有结果则会返回给调用者结果

## 打开有线网

![ethernet_enabled](/images/network/ethernet_enabled.png)

