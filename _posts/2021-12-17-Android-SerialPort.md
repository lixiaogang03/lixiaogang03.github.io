---
layout:     post
title:      Android SerialPort
subtitle:   modbus
date:       2021-12-17
author:     LXG
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
    - Tool
    - Android
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

![rs485.webp](/images/hardware/uart_screen/rs485.webp)

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


## SerialPort

```java

public final class SerialPort {

    static {
        System.loadLibrary("serial_port");
    }

    // dev/ttyS3
    private final File device;
    // 9600
    private final int baudrate;
    private final int dataBits;
    private final int parity;
    private final int stopBits;
    private final int flags;

    /*
     * Do not remove or rename the field mFd: it is used by native method close();
     */
    private FileDescriptor mFd;
    private FileInputStream mFileInputStream;
    private FileOutputStream mFileOutputStream;

    /**
     * 串口
     *
     * @param device 串口设备文件
     * @param baudrate 波特率
     * @param dataBits 数据位；默认8,可选值为5~8
     * @param parity 奇偶校验；0:无校验位(NONE，默认)；1:奇校验位(ODD);2:偶校验位(EVEN)
     * @param stopBits 停止位；默认1；1:1位停止位；2:2位停止位
     * @param flags 默认0
     * @throws SecurityException
     * @throws IOException
     */
    public SerialPort(@NonNull File device, int baudrate, int dataBits, int parity, int stopBits,
        int flags) throws SecurityException, IOException {

        this.device = device;
        this.baudrate = baudrate;
        this.dataBits = dataBits;
        this.parity = parity;
        this.stopBits = stopBits;
        this.flags = flags;

        mFd = open(device.getAbsolutePath(), baudrate, dataBits, parity, stopBits, flags);
        if (mFd == null) {
            Log.e(TAG, "native open returns null");
            throw new IOException();
        }
        mFileInputStream = new FileInputStream(mFd);
        mFileOutputStream = new FileOutputStream(mFd);
    }

    // Getters and setters
    @NonNull
    public InputStream getInputStream() {
        return mFileInputStream;
    }

    @NonNull
    public OutputStream getOutputStream() {
        return mFileOutputStream;
    }


    // JNI
    private native FileDescriptor open(String absolutePath, int baudrate, int dataBits, int parity,
        int stopBits, int flags);

    public native void close();

}

```

## SerialPortActivity

```java

public abstract class SerialPortActivity extends Activity {

    protected SerialPort mSerialPort;
    protected OutputStream mOutputStream;
    private InputStream mInputStream;
    private ReadThread mReadThread;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            mSerialPort = getSerialPort();
            mOutputStream = mSerialPort.getOutputStream();
            mInputStream = mSerialPort.getInputStream();

            /* Create a receiving thread */
            mReadThread = new ReadThread();
            mReadThread.start();
        } catch (SecurityException e) {
            DisplayError(R.string.error_security);
        } catch (IOException e) {
            DisplayError(R.string.error_unknown);
        } catch (InvalidParameterException e) {
            DisplayError(R.string.error_configuration);
        }
    }

    @Override
    protected void onDestroy() {
        if (mReadThread != null) mReadThread.interrupt();
        mApplication.closeSerialPort();
        mSerialPort = null;
        super.onDestroy();
    }

    public SerialPort getSerialPort()
        throws SecurityException, IOException, InvalidParameterException {
        if (mSerialPort == null) {
            SerialPort serialPort = SerialPort //
                .newBuilder("dev/ttyS3", 9600) // 串口地址地址，波特率
                .parity(2) // 校验位；0:无校验位(NONE，默认)；1:奇校验位(ODD);2:偶校验位(EVEN)
                .dataBits(7) // 数据位,默认8；可选值为5~8
                .stopBits(2) // 停止位，默认1；1:1位停止位；2:2位停止位
                .build();

            mSerialPort = serialPort;
        }
        return mSerialPort;
    }

    public void closeSerialPort() {
        if (mSerialPort != null) {
            mSerialPort.close();
            mSerialPort = null;
        }
    }

    private class ReadThread extends Thread {

        @Override
        public void run() {
            super.run();
            while (!isInterrupted()) {
                int size;
                try {
                    byte[] buffer = new byte[64];
                    if (mInputStream == null) return;
                    size = mInputStream.read(buffer);
                    if (size > 0) {
                        onDataReceived(buffer, size);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    return;
                }
            }
        }
    }

    protected abstract void onDataReceived(final byte[] buffer, final int size);

}

```

## ConsoleActivity

```java

public class ConsoleActivity extends SerialPortActivity {

    EditText mReception;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.console);

        mReception = findViewById(R.id.EditTextReception);

        EditText Emission = findViewById(R.id.EditTextEmission);
        Emission.setOnEditorActionListener(new OnEditorActionListener() {
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                int i;
                CharSequence t = v.getText();
                char[] text = new char[t.length()];
                for (i = 0; i < t.length(); i++) {
                    text[i] = t.charAt(i);
                }
                try {
                    mOutputStream.write(new String(text).getBytes());
                    mOutputStream.write('\n');
                } catch (IOException e) {
                    e.printStackTrace();
                }
                return false;
            }
        });
    }

    @Override
    protected void onDataReceived(final byte[] buffer, final int size) {
        runOnUiThread(() -> {
            if (mReception != null) {
                mReception.append(new String(buffer, 0, size));
            }
        });
    }
}

```

## JNI

**SerialPort.h**

```cpp

/* DO NOT EDIT THIS FILE - it is machine generated */
#include <jni.h>
/* Header for class android_serialport_SerialPort */

#ifndef _Included_android_serialport_SerialPort
#define _Included_android_serialport_SerialPort
#ifdef __cplusplus
extern "C" {
#endif
/*
 * Class:     android_serialport_SerialPort
 * Method:    open
 * Signature: (Ljava/lang/String;IIIII)Ljava/io/FileDescriptor;
 */
JNIEXPORT jobject JNICALL Java_android_serialport_SerialPort_open
  (JNIEnv *, jobject, jstring, jint, jint, jint, jint, jint);

/*
 * Class:     android_serialport_SerialPort
 * Method:    close
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_android_serialport_SerialPort_close
  (JNIEnv *, jobject);

#ifdef __cplusplus
}
#endif
#endif
/* Header for class android_serialport_SerialPort_Builder */

#ifndef _Included_android_serialport_SerialPort_Builder
#define _Included_android_serialport_SerialPort_Builder
#ifdef __cplusplus
extern "C" {
#endif
#ifdef __cplusplus
}
#endif
#endif

```

**SerialPort.c**

```cpp

#include <termios.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <string.h>
#include <jni.h>

#include "SerialPort.h"

#include "android/log.h"

static const char *TAG = "serial_port";
#define LOGI(fmt, args...) __android_log_print(ANDROID_LOG_INFO,  TAG, fmt, ##args)
#define LOGD(fmt, args...) __android_log_print(ANDROID_LOG_DEBUG, TAG, fmt, ##args)
#define LOGE(fmt, args...) __android_log_print(ANDROID_LOG_ERROR, TAG, fmt, ##args)

static speed_t getBaudrate(jint baudrate) {
    switch (baudrate) {
        case 0:
            return B0;
        case 50:
            return B50;
        case 75:
            return B75;
        case 110:
            return B110;
        case 134:
            return B134;
        case 150:
            return B150;
        case 200:
            return B200;
        case 300:
            return B300;
        case 600:
            return B600;
        case 1200:
            return B1200;
        case 1800:
            return B1800;
        case 2400:
            return B2400;
        case 4800:
            return B4800;
        case 9600:
            return B9600;
        case 19200:
            return B19200;
        case 38400:
            return B38400;
        case 57600:
            return B57600;
        case 115200:
            return B115200;
        case 230400:
            return B230400;
        case 460800:
            return B460800;
        case 500000:
            return B500000;
        case 576000:
            return B576000;
        case 921600:
            return B921600;
        case 1000000:
            return B1000000;
        case 1152000:
            return B1152000;
        case 1500000:
            return B1500000;
        case 2000000:
            return B2000000;
        case 2500000:
            return B2500000;
        case 3000000:
            return B3000000;
        case 3500000:
            return B3500000;
        case 4000000:
            return B4000000;
        default:
            return -1;
    }
}

/*
 * Class:     android_serialport_SerialPort
 * Method:    open
 * Signature: (Ljava/lang/String;II)Ljava/io/FileDescriptor;
 */
JNIEXPORT jobject JNICALL Java_android_serialport_SerialPort_open
        (JNIEnv *env, jobject thiz, jstring path, jint baudrate, jint dataBits, jint parity,
         jint stopBits,
         jint flags) {

    int fd;
    speed_t speed;
    jobject mFileDescriptor;

    /* Check arguments */
    {
        speed = getBaudrate(baudrate);
        if (speed == -1) {
            /* TODO: throw an exception */
            LOGE("Invalid baudrate");
            return NULL;
        }
    }

    /* Opening device */
    {
        jboolean iscopy;
        const char *path_utf = (*env)->GetStringUTFChars(env, path, &iscopy);
        LOGD("Opening serial port %s with flags 0x%x", path_utf, O_RDWR | flags);
        fd = open(path_utf, O_RDWR | flags);
        LOGD("open() fd = %d", fd);
        (*env)->ReleaseStringUTFChars(env, path, path_utf);
        if (fd == -1) {
            /* Throw an exception */
            LOGE("Cannot open port");
            /* TODO: throw an exception */
            return NULL;
        }
    }

    /* Configure device */
    {
        struct termios cfg;
        LOGD("Configuring serial port");
        if (tcgetattr(fd, &cfg)) {
            LOGE("tcgetattr() failed");
            close(fd);
            /* TODO: throw an exception */
            return NULL;
        }

        cfmakeraw(&cfg);
        cfsetispeed(&cfg, speed);
        cfsetospeed(&cfg, speed);


        cfg.c_cflag &= ~CSIZE;
        switch (dataBits) {
            case 5:
                cfg.c_cflag |= CS5;    //使用5位数据位
                break;
            case 6:
                cfg.c_cflag |= CS6;    //使用6位数据位
                break;
            case 7:
                cfg.c_cflag |= CS7;    //使用7位数据位
                break;
            case 8:
                cfg.c_cflag |= CS8;    //使用8位数据位
                break;
            default:
                cfg.c_cflag |= CS8;
                break;
        }

        switch (parity) {
            case 0:
                cfg.c_cflag &= ~PARENB;    //无奇偶校验
                break;
            case 1:
                cfg.c_cflag |= (PARODD | PARENB);   //奇校验
                break;
            case 2:
                cfg.c_iflag &= ~(IGNPAR | PARMRK); // 偶校验
                cfg.c_iflag |= INPCK;
                cfg.c_cflag |= PARENB;
                cfg.c_cflag &= ~PARODD;
                break;
            default:
                cfg.c_cflag &= ~PARENB;
                break;
        }

        switch (stopBits) {
            case 1:
                cfg.c_cflag &= ~CSTOPB;    //1位停止位
                break;
            case 2:
                cfg.c_cflag |= CSTOPB;    //2位停止位
                break;
            default:
                cfg.c_cflag &= ~CSTOPB;    //1位停止位
                break;
        }

        if (tcsetattr(fd, TCSANOW, &cfg)) {
            LOGE("tcsetattr() failed");
            close(fd);
            /* TODO: throw an exception */
            return NULL;
        }
    }

    /* Create a corresponding file descriptor */
    {
        jclass cFileDescriptor = (*env)->FindClass(env, "java/io/FileDescriptor");
        jmethodID iFileDescriptor = (*env)->GetMethodID(env, cFileDescriptor, "<init>", "()V");
        jfieldID descriptorID = (*env)->GetFieldID(env, cFileDescriptor, "descriptor", "I");
        mFileDescriptor = (*env)->NewObject(env, cFileDescriptor, iFileDescriptor);
        (*env)->SetIntField(env, mFileDescriptor, descriptorID, (jint) fd);
    }

    return mFileDescriptor;
}

/*
 * Class:     cedric_serial_SerialPort
 * Method:    close
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_android_serialport_SerialPort_close
        (JNIEnv *env, jobject thiz) {
    jclass SerialPortClass = (*env)->GetObjectClass(env, thiz);
    jclass FileDescriptorClass = (*env)->FindClass(env, "java/io/FileDescriptor");

    jfieldID mFdID = (*env)->GetFieldID(env, SerialPortClass, "mFd", "Ljava/io/FileDescriptor;");
    jfieldID descriptorID = (*env)->GetFieldID(env, FileDescriptorClass, "descriptor", "I");

    jobject mFd = (*env)->GetObjectField(env, thiz, mFdID);
    jint descriptor = (*env)->GetIntField(env, mFd, descriptorID);

    LOGD("close(fd = %d)", descriptor);
    close(descriptor);
}

```

## Modbus

[modbus-rtu-guide](https://www.virtual-serial-port.org/articles/modbus-rtu-guide/)

Modbus是一种被工业电子设备广泛使用的串行通信协议。在 Modbus 中，在主站（主机）和从站（基于 COM 的设备）* 之间建立连接。Modbus 有助于访问设备的配置并读取测量值。

数据交换由主机发起。主机可以自行将其 RS-485 驱动程序切换到传输模式，而其他 RS485 驱动程序（从机）工作在接收模式。为了让从设备通过通信线路应答主机，“主设备”向它发送一个特殊命令，该命令使目标设备有权将其驱动程序切换到传输模式一段时间

Modbus 是用于设备相互交互的最简单的协议之一。同时对于设备制造商来说很容易实现，这是它盛行的主要原因，同时对于一个工程师、程序员来说却很难，因为它把所有实现的困难都推到了他的肩上。最终的解决方案，需要他处理寄存器和变量的多页表、它们的地址、各种读写和数据转换功能。

Modbus RTU 采用二进制编码和 CRC 错误检查。这些选择是为了提高效率，也是 RTU 模式在工业环境中最常用的主要原因。您可能已经猜到，Modbus ASCII 在发送消息时使用 ASCII 字符。

## Modbus 串行通信参数

MODBUS规约模式：RTU模式。
* 传输速率：2400 bps，4800bps,9600bps,19200bps。
* 串行口通讯数据格式：1 个起始位, 8 个数据位, 无校验位, 1个停止位。
* 通讯介质：推荐采用0.5mm的双绞线，不带屏蔽层。（原因是如果使用屏蔽双绞线，但现场接地处理不好反而影响通讯质量）。
* 应答时间：小于4.5个byte传输时间(帧间隔最小时间) + 10ms。

## Modbus 报文

![modbus_protocal](/images/hardware/uart_screen/modbus_protocal.jpg)

* 地址：取值范围是0-247，如果是0，就是主站广播报文；如果是1-247，则有可能是主站请求或者从站应答。
* 功能码：也就是报文命令，代表主站对从站的操作，读或者写
* 数据：数据字段，主请求报文，从应答报文会有所差异。也就是说假设抓取总线报文，如何区分是主站请求还是从站应答，则需要通过数据字段进行区分了。
* CRC校验：采样CRC16，16位循环冗余校验。

## 常用功能码

0x03：读取保持寄存器
0x06：写单个寄存器
0x10：写多个寄存器

## 读取保持寄存器

16位地址的寻址空间为64Kb (2^64)

主机发送Modbus RTU 报文如下：

| Modbus协议类型 | MBAP报文头 | 地址码 | 功能码 | 寄存器地址 | 寄存器数量 | CRC校验 |
| ------------- | ---------- | ----- | ------- | --------- | --------- | ------- |
| Modbus RTU | 无 | 01 | 03 | 00 01 | 00 01 | D5 CA |
| Modbus RTU | 无 | 11 | 03 | 00 6B | 00 03 | D5 CA |

从站设备返回Modbus RTU报文如下：

| Modbus协议类型 | MBAP报文头 | 地址码 | 功能码 | 字节数 | 数据内容 | CRC校验 |
| ------------- | ---------- | ----- | ------- | --------- | --------- | ------- |
| Modbus RTU | 无 | 01 | 03 | 02 | 00 09 | 78 42 |
| Modbus RTU | 无 | 11 | 03 | 06 | 02 2B 00 00 00 64 | 78 42 |

## 写单个寄存器

主机发送Modbus RTU/TCP报文如下：

| Modbus协议类型 | MBAP报文头 | 地址码 | 功能码 | 寄存器地址 | 数据内容 | CRC校验 |
| ------------- | ---------- | ----- | ------- | --------- | --------- | ------- |
| Modbus RTU | 无 | 0B | 06 | 00 1D | 01 2C | 19 2B |
| Modbus RTU | 无 | 11 | 06 | 00 01 | 02 2B | 19 2B |

从站设备返回Modbus RTU/TCP报文如下：

| Modbus协议类型 | MBAP报文头 | 地址码 | 功能码 | 寄存器地址 | 数据内容 | CRC校验 |
| ------------- | ---------- | ----- | ------- | --------- | --------- | ------- |
| Modbus RTU | 无 | 0B | 06 | 00 1D | 01 2C | 19 2B |
| Modbus RTU | 无 | 11 | 06 | 00 01 | 02 2B | 19 2B |

## 写多个寄存器

主机发送Modbus RTU/TCP报文如下：

| Modbus协议类型 | MBAP报文头 | 地址码 | 功能码 | 寄存器地址 | 寄存器数量 | 字节数 | 数据内容 | CRC校验 |
| ------------- | ---------- | ----- | ------- | ---------| ------- | ------ | -----------| ------- |
| Modbus RTU    |      无    |  0A   |    10   | 00 1E    | 00 02   |  04    | 00 00 75 30 | 70 8F |
| Modbus RTU    |      无    |  11   |    10   | 00 01    | 00 02   |  04    | 02 2B 00 01 | 70 8F |


从站设备返回Modbus RTU/TCP报文如下：

| Modbus协议类型 | MBAP报文头 | 地址码 | 功能码 | 寄存器地址 | 寄存器数量 | CRC校验 |
| ------------- | -----------| ------ | ------ | --------- | ---------- | ------- |
| Modbus RTU | 无 | 0A | 10 | 00 1E | 00 02 | 20 B5 |
| Modbus RTU | 无 | 11 | 10 | 00 01 | 00 02 | 20 B5 |

## modbus4j-java

[modbus4j](https://github.com/MangoAutomation/modbus4j)

由 Infinite Automation Systems 和 Serotonin Software 用 Ja​​va 编写的 Modbus 协议的高性能和易于使用的实现。支持 ASCII、RTU、TCP 和 UDP 作为从站或主站传输，自动请求分区和响应数据类型解析。

* 主机Master及其子类：主机的入口，数据流的起点和终点。
* 数据端口类StreamTransport：负责数据的写入和读出。
* Modbus消息类ModbusMessage及其子类：支持Modbus定义的各种方法（FunctionCode）
* 收发数据控制类MessageControl：支持 timeout、retries，默认200ms，1次。
* 收发等待室WaitingRoom：负责同步收发逻辑。
* 输出Request消息类：OutgoingRequestMessage 及其子类。
* 收到Response消息类：IncomingResponseMessage 及其子类。
* 解析类MessageParser：负责解析收到的消息。
* 协议数据类型定义：DataType
* 协议功能码定义：FunctionCode
* 协议寄存器范围：RegisterRange

![modbus](/images/hardware/uart_screen/modbus.png)

## modbus 仿真工具

[www.modbustools.com](https://www.modbustools.com/modbus_slave.html)

Modbus Slave 用于在 32 个窗口中模拟多达 32 个从设备！使用此仿真工具加速您的 PLC 编程

## Modbus4Android

```java

public class MainActivity extends BaseActivity {

    private void openDevice() {

        if (ModbusManager.get().isModbusOpened()) {
            ModbusManager.get().closeModbusMaster();
            updateDeviceSwitchButton();
            return;
        }

        ModbusParam param;

        if (mMode == MODE_SERIAL) {
            // 串口
            String path = mDevicePaths[mDeviceIndex];
            int baudrate = mBaudrates[mBaudrateIndex];

            mDeviceConfig.updateSerialConfig(path, baudrate);
            param = SerialParam.create(path, baudrate) // 串口地址和波特率
                .setDataBits(mDataBits) // 数据位
                .setParity(mParity) // 校验位
                .setStopBits(mStopBits) // 停止位
                .setTimeout(1000).setRetries(0); // 不重试
        } else {
            // TCP
            String host = mEtHost.getText().toString().trim();
            int port = 0;
            try {
                port = Integer.parseInt(mEtPort.getText().toString().trim());
            } catch (NumberFormatException e) {
                //e.printStackTrace();
            }
            param = TcpParam.create(host, port)
                .setTimeout(1000)
                .setRetries(0)
                .setEncapsulated(false)
                .setKeepAlive(true);
        }

        ModbusManager.get().closeModbusMaster();
        ModbusManager.get().init(param, new ModbusCallback<ModbusMaster>() {
            @Override
            public void onSuccess(ModbusMaster modbusMaster) {
                showOneToast("打开成功");
            }

            @Override
            public void onFailure(Throwable tr) {
                showOneToast("打开失败," + tr);
            }

            @Override
            public void onFinally() {
                updateDeviceSwitchButton();
            }
        });
    }


    private void send03() {

        if (checkSlave() && checkOffset() && checkAmount()) {
            ModbusManager.get()
                .readHoldingRegisters(mSalveId, mOffset, mAmount,
                    new ModbusCallback<ReadHoldingRegistersResponse>() {
                        @Override
                        public void onSuccess(
                            ReadHoldingRegistersResponse readHoldingRegistersResponse) {
                            byte[] data = readHoldingRegistersResponse.getData();
                            appendText("F03读取：" + ByteUtil.bytes2HexStr(data) + "\n");
                        }

                        @Override
                        public void onFailure(Throwable tr) {
                            appendError("F03", tr);
                        }

                        @Override
                        public void onFinally() {

                        }
                    });
        }
    }


    private void send06() {
        if (checkSlave() && checkOffset() && checkRegValue()) {

            ModbusManager.get()
                .writeSingleRegister(mSalveId, mOffset, mRegValue,
                    new ModbusCallback<WriteRegisterResponse>() {
                        @Override
                        public void onSuccess(WriteRegisterResponse writeRegisterResponse) {
                            appendText("F06写入成功\n");
                        }

                        @Override
                        public void onFailure(Throwable tr) {
                            appendError("F06", tr);
                        }

                        @Override
                        public void onFinally() {

                        }
                    });
        }
    }

}

```

**ModbusWorker**

```java

/**
 * ModbusWorker实现，实现了初始化modbus，并增加了线圈、离散量输入、寄存器的读写方法
 */
public class ModbusWorker implements IModbusWorker {

    private final ExecutorService mRequestExecutor;

    protected ModbusMaster mModbusMaster;
    private long mSendTime;
    private long mSendIntervalTime;

    public ModbusWorker() {

        // modbus请求用的单一线程池
        mRequestExecutor = Executors.newSingleThreadExecutor();
    }

    /**
     * 初始化modbus
     *
     * @param param
     * @param callback
     */
    @Override
    public void init(final ModbusParam param, final ModbusCallback<ModbusMaster> callback) {

        rxInit(param).observeOn(AndroidSchedulers.mainThread()).doFinally(new Action() {
            @Override
            public void run() throws Exception {
                try {
                    callback.onFinally();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).subscribe(new Observer<ModbusMaster>() {
            @Override
            public void onSubscribe(Disposable d) {

            }

            @Override
            public void onNext(ModbusMaster modbusMaster) {
                try {
                    callback.onSuccess(modbusMaster);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onError(Throwable e) {
                try {
                    callback.onFailure(e);
                } catch (Exception e1) {
                    e1.printStackTrace();
                }
            }

            @Override
            public void onComplete() {

            }
        });
    }

    /**
     * 初始化modbus
     *
     * @param param
     * @return
     */
    @Override
    public Observable<ModbusMaster> rxInit(final ModbusParam param) {
        return getRxObservable(callableInit(param)).subscribeOn(Schedulers.io());
    }

    /**
     * 初始化的Callable
     *
     * @param param
     * @return
     */
    @NonNull
    private Callable<ModbusMaster> callableInit(final ModbusParam param) {
        return new Callable<ModbusMaster>() {
            @Override
            public ModbusMaster call() throws Exception {

                // 重置发送时间
                mSendTime = 0;

                if (mModbusMaster != null) {
                    mModbusMaster.destroy();
                    mModbusMaster = null;
                }

                ModbusMaster master = param.createModbusMaster();

                try {
                    if (master == null) {
                        throw new ModbusInitException("Invalid ModbusParam!");
                    }
                    master.init();
                } catch (ModbusInitException e) {

                    Log.w(TAG, "ModbusMaster init failed", e);

                    if (master != null) {
                        master.destroy();
                    }
                    // 再抛出异常
                    throw e;
                }

                mModbusMaster = master;
                return master;
            }
        };
    }

}

```

**SerialParam**

```java

public class SerialParam implements ModbusParam<SerialParam> {

    /**
     * 串口设备
     */
    private String serialDevice;
    /**
     * 串口波特率
     */
    private int baudRate;
    /**
     * 超时
     */
    private int timeout = DEFAULT_TIMEOUT;
    /**
     * 重试
     */
    private int retries = 2;
    /**
     * 数据位
     */
    private int dataBits = 8;
    /**
     * 校验位
     */
    private int parity = 0;
    /**
     * 停止位
     */
    private int stopBits = 1;

    private SerialParam() {
    }

    public static SerialParam create(String serialDevice, int baudRate) {
        SerialParam param = new SerialParam();
        param.serialDevice = serialDevice;
        param.baudRate = baudRate;
        return param;
    }

    @Override
    public ModbusMaster createModbusMaster() {

        ModbusFactory modbusFactory = new ModbusFactory();

        SerialPortWrapper wrapper =
            new AndroidSerialPortWrapper(getSerialDevice(), getBaudRate(), getDataBits(),
                getParity(), getStopBits());

        ModbusMaster master = modbusFactory.createRtuMaster(wrapper);
        master.setRetries(getRetries());
        master.setTimeout(getTimeout());

        return master;
    }

}

```

**AndroidSerialPortWrapper**

```java

/**
 * modbus的Android串口实现
 */
public class AndroidSerialPortWrapper implements SerialPortWrapper {

    private final String mDevice;
    private final int mBaudRate;
    private final int mDataBits;
    private final int mParity;
    private final int mStopBits;

    private BufferedInputStream mInputStream;
    private BufferedOutputStream mOutputStream;
    private SerialPort mSerialPort;

    public AndroidSerialPortWrapper(String device, int baudRate, int dataBits, int parity,
        int stopBits) {
        mDevice = device;
        mBaudRate = baudRate;
        mDataBits = dataBits;
        mParity = parity;
        mStopBits = stopBits;
    }

    @Override
    public void close() throws Exception {

        if (mInputStream != null) {
            try {
                mInputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                mInputStream = null;
            }
        }

        if (mOutputStream != null) {

            try {
                mOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                mOutputStream = null;
            }
        }

        if (mSerialPort != null) {
            try {
                mSerialPort.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void open() throws Exception {

        mSerialPort = SerialPort //
            .newBuilder(mDevice, mBaudRate)
            .parity(mParity)
            .dataBits(mDataBits)
            .stopBits(mStopBits)
            .build();
        
        mInputStream = new BufferedInputStream(mSerialPort.getInputStream());
        mOutputStream = new BufferedOutputStream(mSerialPort.getOutputStream());
    }

}

```

**RtuMaster**

```java

public class RtuMaster extends SerialMaster {

    // Runtime fields.
    private MessageControl conn;
    
    /**
     * <p>Constructor for RtuMaster.</p>
     * 
     * Default to validating the slave id in responses
     * 
     * @param wrapper a {@link com.serotonin.modbus4j.serial.SerialPortWrapper} object.
     */
    public RtuMaster(SerialPortWrapper wrapper) {
        super(wrapper, true);
    }

    @Override
    public void init() throws ModbusInitException {
        super.init();

        RtuMessageParser rtuMessageParser = new RtuMessageParser(true);
        conn = getMessageControl();
        try {
            conn.start(transport, rtuMessageParser, null, new SerialWaitingRoomKeyFactory());
            if (getePoll() == null)
                ((StreamTransport) transport).start("Modbus RTU master");
        }
        catch (IOException e) {
            throw new ModbusInitException(e);
        }
        initialized = true;
    }

    @Override
    public ModbusResponse sendImpl(ModbusRequest request) throws ModbusTransportException {
        // Wrap the modbus request in an rtu request.
        RtuMessageRequest rtuRequest = new RtuMessageRequest(request);

        // Send the request to get the response.
        RtuMessageResponse rtuResponse;
        try {
            rtuResponse = (RtuMessageResponse) conn.send(rtuRequest);
            if (rtuResponse == null)
                return null;
            return rtuResponse.getModbusResponse();
        }
        catch (Exception e) {
            throw new ModbusTransportException(e, request.getSlaveId());
        }
        finally {
            
        }
    }

}

```

**SerialMaster**

```java

abstract public class SerialMaster extends ModbusMaster {

	// Runtime fields.
    protected SerialPortWrapper wrapper;
    protected Transport transport;

    public SerialMaster(SerialPortWrapper wrapper, boolean validateResponse) {
        this.wrapper = wrapper;
        this.validateResponse = validateResponse;
    }

    /** {@inheritDoc} */
    @Override
    public void init() throws ModbusInitException {
        try {
            
        	this.wrapper.open();
            
            if (getePoll() != null)
                transport = new EpollStreamTransport(wrapper.getInputStream(), wrapper.getOutputStream(),
                        getePoll());
            else
                transport = new StreamTransport(wrapper.getInputStream(), wrapper.getOutputStream());
        }
        catch (Exception e) {
            throw new ModbusInitException(e);
        }
    }

}

```

**MessageControl**

```java

public class MessageControl implements DataConsumer {

    private Transport transport;
    private MessageParser messageParser;

    public void start(Transport transport, MessageParser messageParser, RequestHandler handler,
            WaitingRoomKeyFactory waitingRoomKeyFactory) throws IOException {
        this.transport = transport;
        this.messageParser = messageParser;
        this.requestHandler = handler;
        this.waitingRoomKeyFactory = waitingRoomKeyFactory;
        waitingRoom.setKeyFactory(waitingRoomKeyFactory);
        transport.setConsumer(this);
    }

    public IncomingResponseMessage send(OutgoingRequestMessage request, int timeout, int retries) throws IOException {
        byte[] data = request.getMessageData();
        if (DEBUG||ModbusConfig.isEnalbeSendLog())
            System.out.println("MessagingControl.send: " + StreamUtils.dumpHex(data));

        IncomingResponseMessage response = null;

        if (request.expectsResponse()) {
            WaitingRoomKey key = waitingRoomKeyFactory.createWaitingRoomKey(request);

            // Enter the waiting room
            waitingRoom.enter(key);

            try {
                do {
                    // Send the request.
                    write(data);

                    // Wait for the response.
                    response = waitingRoom.getResponse(key, timeout);

                    if (DEBUG && response == null)
                        System.out.println("Timeout waiting for response");
                }
                while (response == null && retries-- > 0);
            }
            finally {
                // Leave the waiting room.
                waitingRoom.leave(key);
            }

            if (response == null)
                throw new TimeoutException("request=" + request);
        }
        else
            write(data);

        return response;
    }

}

```




