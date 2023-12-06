---
layout:     post
title:      Qt DeviceTest
subtitle:   T113
date:       2023-10-31
author:     LXG
header-img: img/post-bg-kuaidi.jpg
catalog: true
tags:
    - qt
---

## 命令行测试硬件

```txt

sh-4.4# ls -al rp_test/
total 55668
drwxrwxr-x    3 root     root          4096 Jan  1 00:16 .
drwxr-xr-x   22 root     root          4096 Jan  1 00:00 ..
-rwxrwxr-x    1 root     root          5212 Nov  3  2023 comtest
drwxrwxr-x    2 root     root          4096 Nov  3  2023 input
-rwxrwxrwx    1 root     root      46329002 Oct 20  2023 test.wav
-rwxrwxrwx    1 root     root      10557420 Oct 20  2023 test48000.wav
-rwxrwxr-x    1 root     root           357 Nov  3  2023 test_4G.sh
-rwxrwxr-x    1 root     root            46 Nov  3  2023 test_audio.sh
-rwxrwxr-x    1 root     root            96 Nov  3  2023 test_bt.sh
-rwxrwxr-x    1 root     root           606 Nov  3  2023 test_can.sh
-rwxrwxr-x    1 root     root            99 Nov  3  2023 test_ethernet.sh
-rwxrwxr-x    1 root     root            33 Nov  3  2023 test_uart.sh
-rwxrwxr-x    1 root     root           189 Nov  3  2023 test_watchdog.sh
-rwxrwxr-x    1 root     root           530 Nov  3  2023 test_wifi.sh
-rwxrwxr-x    1 root     root           311 Nov  3  2023 test_wifi_ap.sh
-rwxrwxr-x    1 root     root          2407 Nov  3  2023 watchdogd.cpp
-rwxrwxr-x    1 root     root          3928 Nov  3  2023 watchdogd.out

```

## 命令行测试wifi

1. iw dev wlan0 scan | grep SSID
2. wpa_passphrase kefu xintian888 >> /etc/wpa_supplicant.conf
3. wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant.conf
4. iw wlan0 link

**test_wifi.sh**

```sh

sh-4.4# cat rp_test/test_wifi.sh 
#!/bin/sh

read -p "Enter your wifi-ssid, please: " WIFISSID
read -p "Enter your wifi-pwd, please: " WIFIPWD

#WIFISSID=$1
#WIFIPWD=$2
CONF=/tmp/wpa_supplicant.conf

cp /etc/wpa_supplicant.conf /tmp/
echo "connect to WiFi ssid: $WIFISSID, Passwd: $WIFIPWD"
#sed -i "s/SSID/$WIFISSID/g" $CONF
#sed -i "s/PASSWORD/$WIFIPWD/g" $CONF

wpa_passphrase $WIFISSID $WIFIPWD > $CONF

killall wpa_supplicant
sleep 1
wpa_supplicant -B -i wlan0 -c $CONF

# auto get ipaddress
udhcpc -i wlan0

ifconfig wlan0

ping -I wlan0 -c 4 www.rpdzkj.com

```

## DeviceTest

```txt

t113_linux/platform/framework/auto/qt_demo/DeviceTest$ tree -L 1
.
├── 4G
├── adc
├── bluetooth
├── camera
├── common
├── device
├── DeviceTest.pro
├── DeviceTest.pro.user
├── ethernet
├── led
├── main.cpp
├── mainUI
├── makeDeviceTest
├── pwm
├── qrc_res.cpp
├── res
├── res.qrc
├── rgb
├── rtc
├── sound
├── test.test
├── tfcard
├── touch
├── uart
├── usb
└── wifi

```

## 工程文件pro

```makefile

QT       += core gui serialport network multimedia multimediawidgets

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++11

# The following define makes your compiler emit warnings if you use
# any Qt feature that has been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    4G/mobilenet.cpp \
    4G/mobilenetthread.cpp \
    adc/adckey.cpp \
    adc/adcthread.cpp \
    bluetooth/bluetooth.cpp \
    bluetooth/bluetooththread.cpp \
    camera/camera.cpp \
    camera/thread/camerathread1.cpp \
    camera/thread/camerathread2.cpp \
    camera/v4l2/v4l2.c \
    common/common.cpp \
    device/deviceinfo.cpp \
    device/devicethread.cpp \
    ethernet/ethernet.cpp \
    ethernet/ethnetautotest.cpp \
    ethernet/eththread.cpp \
    led/led.cpp \
    main.cpp \
    mainUI/mainwindow.cpp \
    pwm/pwm.cpp \
    pwm/pwmthread.cpp \
    rgb/lcdrgb.cpp \
    rtc/rtc.cpp \
    rtc/rtcthread.cpp \
    sound/playtimethread.cpp \
    sound/recortTimeThread.cpp \
    sound/sound.cpp \
    tfcard/tfcard.cpp \
    tfcard/tfcardthread.cpp \
    touch/touch.cpp \
    uart/uart.cpp \
    usb/usbdevices.cpp \
    usb/usbthread.cpp \
    wifi/connectthread.cpp \
    wifi/wifi.cpp \
    wifi/wifithread.cpp

HEADERS += \
    4G/mobilenet.h \
    4G/mobilenetthread.h \
    adc/adckey.h \
    adc/adcthread.h \
    bluetooth/bluetooth.h \
    bluetooth/bluetooththread.h \
    camera/camera.h \
    camera/thread/camerathread1.h \
    camera/thread/camerathread2.h \
    camera/v4l2/config.h \
    camera/v4l2/v4l2.h \
    common/common.h \
    device/deviceinfo.h \
    device/devicethread.h \
    ethernet/ethernet.h \
    ethernet/ethnetautotest.h \
    ethernet/eththread.h \
    led/led.h \
    mainUI/mainwindow.h \
    pwm/pwm.h \
    pwm/pwmthread.h \
    rgb/lcdrgb.h \
    rtc/rtc.h \
    rtc/rtcthread.h \
    sound/playtimethread.h \
    sound/recortTimeThread.h \
    sound/sound.h \
    tfcard/tfcard.h \
    tfcard/tfcardthread.h \
    touch/touch.h \
    uart/uart.h \
    usb/usbdevices.h \
    usb/usbthread.h \
    wifi/connectthread.h \
    wifi/wifi.h \
    wifi/wifithread.h

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

RESOURCES += \
    res.qrc

```

## main.cpp

```cpp

#include "mainUI/mainwindow.h"

#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    MainWindow w;
    w.show();
    return a.exec();
}

```

## main_window.cpp

```cpp

#include "mainwindow.h"
#include "rtc/rtc.h"
#include "uart/uart.h"
#include "device/deviceinfo.h"
#include "touch/touch.h"
#include "adc/adckey.h"
#include "pwm/pwm.h"
#include "ethernet/ethernet.h"
#include "wifi/wifi.h"
#include "bluetooth/bluetooth.h"
#include "camera/camera.h"
#include "led/led.h"
#include "sound/sound.h"
#include "4G/mobilenet.h"
#include "tfcard/tfcard.h"
#include "rgb/lcdrgb.h"
#include "usb/usbdevices.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    QScreen *screen = QGuiApplication::primaryScreen();
    windSize = screen->virtualGeometry();

    //default full screen
    resize(windSize.width(), windSize.height());
    this->setWindowFlags(Qt::FramelessWindowHint | Qt::Tool | Qt::WindowStaysOnTopHint); // 去掉标题栏,去掉任务栏显示，窗口置顶
    this->initWindow();
}

void MainWindow::initWindow()
{
    QGridLayout *mainLayout = new QGridLayout;
    widget = new QWidget();
    QSettings  *setting = new QSettings(CONFIG_FILE_PATH,QSettings::IniFormat);
    setting->setIniCodec("UTF-8");

    QStringList groups = setting->childGroups();
    int row = 1;
    int index = 0;
    for(int i = 0;i < groups.length(); i++){
        QString enable = setting->value("/"+groups.at(i)+"/enable").toString();
        QString name = setting->value("/"+groups.at(i)+"/name").toString();
        QString state = setting->value("/"+groups.at(i)+"/state").toString();

        if(enable == "1"){
            QPushButton *funBtn = common.getButton(name);
            funBtn->setStyleSheet(funBtn->styleSheet()+"QPushButton{width:200;height:40}");

            if(state == "1")
                funBtn->setStyleSheet(funBtn->styleSheet()+"QPushButton{border-image:url(:/icon/pass.png)}");
            if(state == "0")
                funBtn->setStyleSheet(funBtn->styleSheet()+"QPushButton{border-image:url(:/icon/faild.png)}");

            connect(funBtn, &QPushButton::clicked, [=] { handleClick(funBtn->text()); });

            if(index % 2 == 0){
                mainLayout->addWidget(funBtn, row, 1, Qt::AlignRight);

            }else{
                mainLayout->addWidget(funBtn, row, 2, Qt::AlignLeft);
                row++;
            }

            index++;
        }
    }

    QPushButton *auTestBtn = common.getButton("自动测试");
    connect(auTestBtn, &QPushButton::clicked, [=] { handleAutoTest(); });
    auTestBtn->setStyleSheet(auTestBtn->styleSheet()+"QPushButton{width:460;height:40}");
    mainLayout->addWidget(auTestBtn, ++row, 1, 1, 2, Qt::AlignHCenter);

    mainLayout->setHorizontalSpacing(60);
    widget->resize(windSize.width(), windSize.height());
    widget->setLayout(mainLayout);
    this->setCentralWidget(widget);
}

void MainWindow::updateBtnStyle(QString btnTxt, bool result)
{
    QList<QPushButton *> buttons = centralWidget()->findChildren<QPushButton *>();
    for (QPushButton *btn : buttons) {
        if(btn->text() == btnTxt){
            if (result)
                btn->setStyleSheet(btn->styleSheet()+"QPushButton{border-image:url(:/icon/pass.png)}");
            else
                btn->setStyleSheet(btn->styleSheet()+"QPushButton{border-image:url(:/icon/faild.png)}");
        }
        btn->update();
    }

    // for auto test
    if(autoTest){
        if(queue.isEmpty()){
            autoTest = 0;
            timer->stop();
            return;
        }
        timer->start();
    }
}

void MainWindow::handleAutoTest()
{
    qDebug()<<autoTest;
    autoTest = 1;
    qDebug()<<autoTest;
    QSettings  *setting = new QSettings(CONFIG_FILE_PATH,QSettings::NativeFormat);
    QStringList groups = setting->childGroups();

    for(int i = 0; i < groups.length(); i++){
        for(int j = 0; j < groups.length(); j++){
            int id = setting->value("/"+groups.at(j)+"/id").toInt();
            if ((id - 1) == i){
                QString enable = setting->value("/"+groups.at(j)+"/enable").toString();
                if(enable == "1"){
                    QString name = setting->value("/"+groups.at(j)+"/name").toString();
                    queue.enqueue(name);
                }
            }
        }
    }

    timer = new QTimer(this);
    timer->setInterval(100);
    connect(timer, &QTimer::timeout, [=] {handleClick(queue.dequeue());});
    timer->start();
}

void MainWindow::handleClick(QString str)
{
    if(autoTest){
        timer->stop();
    }

    if(str == "RTC"){
        RTC *rtc = new RTC(this);
        connect(rtc, &RTC::testFinish, [=] { updateBtnStyle(str,rtc->testResult); });
        rtc->initWindow(windSize.width(),windSize.height());
        rtc->showFullScreen();

    }else if (str == "串口") {
        Uart *uart = new Uart(this);
        connect(uart, &Uart::testFinish, [=] { updateBtnStyle(str,uart->testResult); });
        uart->initWindow(windSize.width(),windSize.height());

    }else if (str == "设备信息"){
        DeviceInfo *dev = new DeviceInfo(this);
        connect(dev, &DeviceInfo::testFinish, [=] { updateBtnStyle(str,dev->testResult); });
        dev->initWindow(windSize.width(),windSize.height());

    }else if (str == "触摸"){
        Touch *touch = new Touch(this);
        touch->initWindow(windSize.width(),windSize.height());
        touch->showFullScreen();
        connect(touch, &Touch::testFinish, [=] { updateBtnStyle(str,touch->testResult); });

    }else if(str == "ADC按键"){
        AdcKey *adc = new AdcKey(this);
        adc->initWindow(windSize.width(),windSize.height());
        adc->showFullScreen();
        connect(adc, &AdcKey::testFinish, [=] { updateBtnStyle(str,adc->testResult); });

    }else if(str == "PWM/背光"){
        Pwm *pwm = new Pwm(this);
        pwm->initWindow(windSize.width(),windSize.height());
        pwm->showFullScreen();
        connect(pwm, &Pwm::testFinish, [=] { updateBtnStyle(str,pwm->testResult); });

    }else if(str == "以太网"){
        EtherNet *etherNet = new EtherNet(this);
        etherNet->initWindow(windSize.width(),windSize.height());
        etherNet->showFullScreen();
        connect(etherNet, &EtherNet::testFinish, [=] { updateBtnStyle(str,etherNet->testResult); });

    }else if(str == "WIFI"){
        Wifi *wifi = new Wifi(this);
        wifi->initWindow(windSize.width(),windSize.height());
        wifi->showFullScreen();
        connect(wifi, &Wifi::testFinish, [=] { updateBtnStyle(str,wifi->testResult); });

    }else if(str == "蓝牙"){
        Bluetooth *bt = new Bluetooth(this);
        bt->initWindow(windSize.width(),windSize.height());
        bt->showFullScreen();
        connect(bt, &Bluetooth::testFinish, [=] { updateBtnStyle(str,bt->testResult); });

    }else if(str == "摄像头"){
        Camera *cam = new Camera(this);
        cam->initWindow(windSize.width(),windSize.height());
        connect(cam, &Camera::testFinish, [=] { updateBtnStyle(str,cam->testResult); });
        cam->showFullScreen();

    }else if(str == "补光灯"){
        Led *led = new Led(this);
        led->initWindow(windSize.width(),windSize.height());
        connect(led, &Led::testFinish, [=] { updateBtnStyle(str,led->testResult); });
        led->showFullScreen();

    }else if(str == "声卡"){
        Sound *sound = new Sound(this);
        sound->initWindow(windSize.width(),windSize.height());
        connect(sound, &Sound::testFinish, [=] { updateBtnStyle(str,sound->testResult); });
        sound->showFullScreen();

    }else if(str == "4G"){
        MobileNet *mobileNet = new MobileNet(this);
        mobileNet->initWindow(windSize.width(),windSize.height());
        connect(mobileNet, &MobileNet::testFinish, [=] { updateBtnStyle(str,mobileNet->testResult); });
        mobileNet->showFullScreen();

    }else if(str == "TF卡"){
        TFCard *tfcard = new TFCard(this);
        tfcard->initWindow(windSize.width(),windSize.height());
        connect(tfcard, &TFCard::testFinish, [=] { updateBtnStyle(str,tfcard->testResult); });
        tfcard->showFullScreen();

    }else if(str == "RGB"){
        LcdRGB *rgb = new LcdRGB(this);
        rgb->initWindow(windSize.width(),windSize.height());
        connect(rgb, &LcdRGB::testFinish, [=] { updateBtnStyle(str,rgb->testResult); });
        rgb->showFullScreen();

    }else if(str == "USB"){
        USBDevices *usb = new USBDevices(this);
        usb->initWindow(windSize.width(),windSize.height());
        connect(usb, &USBDevices::testFinish, [=] { updateBtnStyle(str,usb->testResult); });
        usb->showFullScreen();
    }
}

MainWindow::~MainWindow()
{
}

```

## 4G

```cpp

        MobileNet *mobileNet = new MobileNet(this);
        mobileNet->initWindow(windSize.width(),windSize.height());
        connect(mobileNet, &MobileNet::testFinish, [=] { updateBtnStyle(str,mobileNet->testResult); });
        mobileNet->showFullScreen();

```

**MobileNet**

```cpp

#ifndef MOBILENET_H
#define MOBILENET_H

#include <QObject>
#include <QWidget>
#include "common/common.h"
#include "mobilenetthread.h"

class MobileNet : public QWidget
{
    Q_OBJECT
public:
    explicit MobileNet(QWidget *parent = nullptr);

    void initWindow(int w, int h);
    bool testResult=false;

protected:
    Common common;
    QLineEdit *pppIp;
    void showDialog(int row);
    void pingTest(QString ip);
    void closeWindow();

    MobileNetThread *mobleNetThread;
    QPushButton *title;
    QTextEdit *detial;
    QTimer *timer;
    int timeoutTimes = 0;
    QTimer *closeTimer;

public slots:
    void setPppIp(QString ip);
    void dealReturnStr(QString txt);
    void readLog();

signals:
    void testFinish();
};

#endif // MOBILENET_H


```

测试实际的实现方法

```cpp

bool MobileNetThread::checkMobileNet()
{
    QList<QNetworkInterface> ifaceList=QNetworkInterface::allInterfaces();
    foreach (QNetworkInterface interface, ifaceList) {

        QString interfaceName = interface.humanReadableName();
#ifndef USE_GOBINET
        if(!interfaceName.startsWith("ppp"))
#else
        if(!interfaceName.startsWith("usb"))
#endif
            continue;

        QList<QNetworkAddressEntry> addresses = interface.addressEntries();
        foreach (QNetworkAddressEntry address, addresses) {
            qDebug()<<address.ip();
            pppIp = address.ip().toString();
            // qDebug()<<pppIp;
            break;
        }
    }

    emit getPppIP(pppIp);
    return pppIp != "";
}

```

## 蓝牙

**BluetoothThread**

```cpp

#include "bluetooththread.h"

BluetoothThread::BluetoothThread()
{

}

void BluetoothThread::run()
{
//    qDebug()<<"run";
    openBluetooth();
    while (leScan) {
        scanBluetooth();
        msleep(5000);
    }

}

void BluetoothThread::openBluetooth()
{
    QFile hci("/sys/class/bluetooth/hci0");
    if(hci.exists()){
        ::system("hciconfig hci0 up ");
        return;
    }else{
        ::system("bt_init.sh");
        msleep(2000);
        ::system("hciconfig hci0 up ");
    }
}

void BluetoothThread::scanBluetooth()
{
    QFile fiel("/sys/class/bluetooth/hci0");
    if(!fiel.exists()){
        emit getLeScanResult("");
        return;
    }
    QProcess *p = new QProcess;
    connect(p, &QProcess::readyRead, this, [=] {this->dealReturn(p->readAll());});

    //ping -I eth0 192.168.1.1 -c 4
    QString testCmd = "hcitool scan";
    p->start("bash", QStringList() <<"-c" << testCmd);
    p->waitForFinished();
}

void BluetoothThread::dealReturn(QString returnTxt)
{
    qDebug() << returnTxt;
    emit getLeScanResult(returnTxt);
}

```

## USB

```cpp

#include "usbthread.h"

#define USB_DEVICE_PATH "/sys/bus/usb/devices/"
UsbThread::UsbThread()
{

}

void UsbThread::run()
{
    qDebug()<<"run";
    while(checkState){
        checkUsbDevices();
        msleep(500);
    }
}

void UsbThread::checkUsbDevices()
{
    usbHubCnt = 0;
    usbDevCnt = 0;
    QDir dir(USB_DEVICE_PATH);
    for(QFileInfo info : dir.entryInfoList()){
        if(info.fileName() == "." || info.fileName() == "..")
            continue;
        QFile file(QString(info.filePath() + "/product"));
        if(file.exists()){
            file.open(QIODevice::ReadOnly);
            QString product = file.readAll();

            if(product.indexOf("Controller") >= 0 || product.indexOf("controller") >= 0)
                continue;

            if(product.indexOf("Hub") >= 0)
                usbHubCnt ++;
            else
                usbDevCnt ++;
        }
    }
    emit getUsbDevices(usbHubCnt, usbDevCnt);
}

```

USB 设备数量

cat /sys/bus/usb/devices/**/product

```txt

sh-4.4# ls -al  /sys/bus/usb/devices/
total 0
drwxr-xr-x    2 root     root             0 Jan  1 00:07 .
drwxr-xr-x    4 root     root             0 Jan  1 00:07 ..
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-0:1.0 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-0:1.0
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1                                 // USB2.0 Hub
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1                         // Android
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1:1.0 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1/1-1.1:1.0
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1:1.1 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1/1-1.1:1.1
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1:1.2 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1/1-1.1:1.2
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1:1.3 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1/1-1.1:1.3
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1:1.4 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1/1-1.1:1.4
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.1:1.6 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.1/1-1.1:1.6
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.2 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.2                         // USB Optical Mouse
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.2:1.0 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.2/1-1.2:1.0
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.4 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.4                         // 802.11n WLAN Adapter
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.4:1.0 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.4/1-1.4:1.0
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.4:1.1 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.4/1-1.4:1.1
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1.4:1.2 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1.4/1-1.4:1.2
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 1-1:1.0 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1/1-1/1-1:1.0
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 2-0:1.0 -> ../../../devices/platform/soc@3000000/4200400.ohci1-controller/usb2/2-0:1.0
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 usb1 -> ../../../devices/platform/soc@3000000/4200000.ehci1-controller/usb1                                    // EHCI Host Controller
lrwxrwxrwx    1 root     root             0 Jan  1 00:07 usb2 -> ../../../devices/platform/soc@3000000/4200400.ohci1-controller/usb2                                    // OHCI Host Controller

```

## WIFI

```cpp

#include "wifithread.h"

WifiThread::WifiThread()
{

}

void WifiThread::run()
{
    qDebug()<<"run";
    openWifi();
    while(scanFlg){
        scanAp();
        msleep(5000);
    }
}

void WifiThread::openWifi()
{
    ::system("echo 1 > /sys/class/rfkill/rfkill1/state");
    ::system("ifconfig wlan0 up");
}

void WifiThread::scanAp()
{
    QMap<QString,QString> infoMap;
    QList<QMap<QString, QString>> infoList;
    QString apList = common.execLinuxCmd("iwlist wlan0 scan");
    QList<QString> resultList = apList.replace(" ","").split("Cell");

    infoList.clear();
    foreach (QString str, resultList) {
        //qDebug()<<str;
        infoMap.clear();
        QStringList wifiInfoList = str.split("\n");
        foreach (QString wifiInfo, wifiInfoList) {
            if(wifiInfo.startsWith("ESSID")){
                QString ssid = wifiInfo.replace("ESSID:", "").replace("\"","");
                if(ssid == "")
                    break;

                infoMap.insert("SSID",ssid);
                    //qDebug()<<ssid;
            }

            if(wifiInfo.startsWith("Frequency")){
                QString freq = wifiInfo.replace("Frequency:", "").replace("\"","");
                infoMap.insert("Frequency",freq);
            }
        }
        if(!infoMap.isEmpty())
            infoList.append(infoMap);
    }
    emit getApMap(infoList);
}

```

## 设备信息

```cpp

#include "devicethread.h"

DeviceThread::DeviceThread()
{

}

void DeviceThread::run()
{
    getCpuModle();
    getCoreNum();
    getDDRSize();
    getEMMCSIze();
}

void DeviceThread::getCpuModle()
{
    QString detial = common.execLinuxCmd("cat /proc/device-tree/compatible");
    emit endGetCpuModle(detial, detial);
}

void DeviceThread::getCoreNum()
{
    QString detial = common.execLinuxCmd("cat /proc/cpuinfo");
    QStringList strlist = detial.split("\n");
    int coreNum = 0;
    foreach (QString str, strlist) {
        if (str.startsWith("processor"))
            coreNum ++;
    }
    emit endGeCoreNum(QString::number(coreNum), detial);
}

void DeviceThread::getDDRSize()
{
    QString detial = common.execLinuxCmd("cat /proc/meminfo");
    QStringList strlist = detial.split("\n");
    QString DDRSize;
    foreach (QString str, strlist){
        if (str.startsWith("MemTotal")){
            DDRSize = str.replace(QRegExp("\\s{1,}"), " ").split(" ").at(1);
            break;
        }
    }

    long size = DDRSize.toLong();
    if(size <= 512*1024){
        size = size / 1024;
        emit endGetDDRSize(QString::number(size) + "M", detial);
    }else{
        size = size / 1048576 + 1; //1024*1024
        emit endGetDDRSize(QString::number(size) + "G", detial);
    }
}

void DeviceThread::getEMMCSIze()
{
    QString sizeStr;
    long totalSize = 0;
    QString detial = common.execLinuxCmd("fdisk -l");

    // cat /sys/block/mmcblk0/device/type get MMC type
    // cat /sys/block/mmcblk0/size  get MMC Size

    for(int i=0; i <= 5; i++){
        QString mmcTypePath = QString("/sys/block/mmcblk%1/device/type").arg(QString::number(i));
        QString mmcSizePath = QString("/sys/block/mmcblk%1/size").arg(QString::number(i));
        QFile mmcTypeFile(mmcTypePath);
        if(mmcTypeFile.exists()){
            mmcTypeFile.open(QIODevice::ReadOnly);
            QString type = mmcTypeFile.readAll();
            qDebug()<<type;
            mmcTypeFile.close();

            if(type == "MMC\n"){
                QFile mmcSizeFile(mmcSizePath);
                mmcSizeFile.open(QIODevice::ReadOnly);
                sizeStr = mmcSizeFile.readAll();
                qDebug()<<sizeStr;
                mmcSizeFile.close();
                break;
            }
        }
    }

    totalSize = sizeStr.toLong()*512/1024/1024/1024 + 1;

    if (totalSize <= 8 && totalSize >=7)
        totalSize = 8;

    if (totalSize <= 16 && totalSize >=15)
        totalSize = 16;

    if (totalSize <= 32 && totalSize >=28)
        totalSize = 32;

    if (totalSize <= 64 && totalSize >=56)
        totalSize = 64;

    if (totalSize <= 128 && totalSize >=110)
        totalSize = 128;

    emit endGetEMMCSize(QString::number(totalSize)+"G", detial);
}

```

## 以太网

```cpp

#include "eththread.h"

EthThread::EthThread()
{

}

void EthThread::run()
{
    while(readFlag){
        //检测网线插拔
        this->getReticleStat();

        if(pingTestFlag){
            pingTest();
            pingTestFlag = false;
        }

        if(iperfTestFlag){
            iperfTestFlag = false;
        }

        msleep(200);
    }
}

void EthThread::pingTest()
{
    result = false;
    QString str;
    if(targetIp.startsWith("www")){
        str = eth +"测试开始\n开始测试域名解析，目的地址:" +targetIp;
    }else{
        str = eth +"测试开始\n开始测试IP通信，目的地址:" +targetIp;
    }

    emit pingTestFinish(str);

    QProcess *p = new QProcess;
    connect(p, &QProcess::readyRead, this, [=] {this->dealReturn(p->readAll());});

    //ping -I eth0 192.168.1.1 -c 4 -i 0.4
    QString testCmd = "ping -I " + eth + " " + targetIp + " -c 4" + " -i 0.4";
    p->start("bash", QStringList() <<"-c" << testCmd);
    p->waitForFinished();
}

void EthThread::dealReturn(QString returnTxt){
    emit pingTestFinish(returnTxt);

    //test finish
    if(targetIp.startsWith("www")){
        if(returnTxt.indexOf("transmitted") >= 0){
            emit setResult(result, eth, targetIp);
            return;
        }
    }

    //test finish
    if(returnTxt.indexOf("transmitted") >= 0){
        emit setResult(result, eth, targetIp);
        // targetIp = targetAddr;
        // pingTestFlag = true;
    }

    if(returnTxt.indexOf("ttl") >= 0) {
        //qDebug("test success");
        result = true;
    }
}

void EthThread::getReticleStat()
{
    QList<QNetworkInterface> list = QNetworkInterface::allInterfaces();//获取所有网卡接口信息到list
    //遍历接口信息
    foreach(QNetworkInterface interface,list){
        QNetworkInterface::InterfaceFlags flags = interface.flags();//获取flag
        if(QNetworkInterface::Ethernet == interface.type()){
            //lixiaogang add start
            if (interface.name().startsWith("usb")) {
                break;
            }
            //lixiaogang add end
            if(flags.testFlag(QNetworkInterface::IsUp)){ //判断活动状态，可以此检测网线插拔
                // qDebug()<<interface.name()<<"is up";
                QList<QNetworkAddressEntry> iplist = interface.addressEntries();//获取当前ip
                ip = getIp(iplist);

                if(ip == ""){
                    QString cmd = QString("timeout 2 udhcpc -i %1").arg(interface.name());
                    system(cmd.toLocal8Bit());
                }
                ip = getIp(iplist);
                if(ip == "")
                    emit setIp(interface.name(), "");
                else
                    emit setIp(interface.name(), ip);

            }else{
                //qDebug()<<interface.name()<<"is down";
            }
        }
    }
}

QString EthThread::getIp(QList<QNetworkAddressEntry> ettry)
{
    QString ip;
    foreach (QNetworkAddressEntry address, ettry) {
        //qDebug()<<address.ip().toString();
        ip = address.ip().toString();
        break;
    }
    return ip;
}

```

## 串口

485 串口需要外接串口小板测试

```cpp

#include "uart.h"

static QString testText = "Netflix IoT Technology";
Uart::Uart(QWidget *parent) : QWidget(parent)
{

}

void Uart::initWindow(int w, int h)
{
    uartNum = 0;
    timer = new QTimer(this);
    QString ignoreTTY = common.getConfig("serial", "ignore_tty");

    QHBoxLayout *boxLayout_h = new QHBoxLayout();
    QVBoxLayout *boxLayout_v = new QVBoxLayout(); //垂直
    QHBoxLayout *btnLayout_h = new QHBoxLayout();
    QGridLayout *uartLayout = new QGridLayout();

    QLabel *reciveLabel = common.getLabel("接收端：");
    QLabel *sendLabel = common.getLabel("发送端：");
    reciveMessage = common.getTextEdit();
//    reciveMessage->setDisabled(true);
    reciveMessage->setText("短接tx和rx,自动收发!");

    sendMessage = common.getTextEdit();
    sendMessage->setText(testText);

    QLabel *serial = common.getLabel("串口:");
    QLabel *baudSel = common.getLabel("波特率:");
    QLabel *dataBitSel = common.getLabel("数据位:");
    QLabel *stopBitSel = common.getLabel("停止位:");
    QLabel *flowContrlSel = common.getLabel("流控:");

    QGridLayout *serialLayout = new QGridLayout();


    QLineEdit *baudRate = common.getLineEdit();
    baudRate->setText("115200");
    baudRate->setDisabled(true);

    QLineEdit *dataBit = common.getLineEdit();
    dataBit->setText("8");
    dataBit->setDisabled(true);

    QLineEdit *stopBit = common.getLineEdit();
    stopBit->setText("1");
    stopBit->setDisabled(true);

    QLineEdit *flowContrl = common.getLineEdit();
    flowContrl->setText("0");
    flowContrl->setDisabled(true);

    QPushButton *closeWindow = common.getButton("关闭窗口");
    closeWindow->setStyleSheet(closeWindow->styleSheet()+"QPushButton{background-color:#f56c6c}");
    connect(closeWindow, &QPushButton::clicked, [=](){this->getTestResult();});

    QPushButton *cleanBtn = common.getButton("清空数据");
    connect(cleanBtn, &QPushButton::clicked, reciveMessage, &QTextEdit::clear);

    foreach (const QSerialPortInfo &info, QSerialPortInfo::availablePorts())
    {
        QSerialPort serial;
        serial.setPort(info);
        if(serial.open(QIODevice::ReadWrite))
        {
            if(serial.portName().indexOf("ttyUSB") < 0 && ignoreTTY.indexOf(serial.portName()) < 0)
            {
                uartNum++;
                QPushButton *serialBtn = common.getButton(serial.portName());
                QSerialPort *testSerial = new QSerialPort(this);

                testSerial->setPortName(serial.portName());
                testSerial->open(QIODevice::ReadWrite);
                testSerial->setBaudRate(QSerialPort::Baud115200);
                testSerial->setDataBits(QSerialPort::Data8);
                testSerial->setParity(QSerialPort::NoParity);
                testSerial->setStopBits(QSerialPort::OneStop);
                testSerial->setFlowControl(QSerialPort::NoFlowControl);

                serialLayout->addWidget(serialBtn, uartNum, 1);

                connect(testSerial, &QSerialPort::readyRead, [=] { reciveData(testSerial); });
                connect(timer, &QTimer::timeout, [=] {
                    this->sendSerialData(sendMessage->toPlainText().toLatin1(),testSerial);
                });
            }
        }
    }

    //------------------------------------------------------------------------------------------------

    boxLayout_v->addWidget(reciveLabel);
    boxLayout_v->addWidget(reciveMessage);
    boxLayout_v->addWidget(sendLabel);
    boxLayout_v->addWidget(sendMessage);
    btnLayout_h->addWidget(cleanBtn);
    boxLayout_v->addLayout(btnLayout_h);
    uartLayout->addWidget(serial, 1, 1, Qt::AlignRight);
    uartLayout->addLayout(serialLayout, 1, 2);
    uartLayout->addWidget(baudSel, 2, 1, Qt::AlignRight);
    uartLayout->addWidget(baudRate, 2, 2);
    uartLayout->addWidget(dataBitSel, 3, 1, Qt::AlignRight);
    uartLayout->addWidget(dataBit, 3, 2);
    uartLayout->addWidget(stopBitSel, 4, 1, Qt::AlignRight);
    uartLayout->addWidget(stopBit, 4, 2);
    uartLayout->addWidget(flowContrlSel, 5, 1, Qt::AlignRight);
    uartLayout->addWidget(flowContrl, 5, 2);
    uartLayout->addWidget(closeWindow, 6, 2);
    boxLayout_h->addLayout(boxLayout_v);
    boxLayout_h->addLayout(uartLayout);
    this->setLayout(boxLayout_h);
    this->resize(w,h);
    this->setWindowFlags(Qt::Window | Qt::FramelessWindowHint | Qt::CustomizeWindowHint);
    this->showFullScreen();
    timer->start(200);
}

void Uart::reciveData(QSerialPort *testSerial)
{
    QByteArray buf;
    buf = testSerial->readAll();
    qDebug() << testSerial->portName() << buf;
    if(!buf.isEmpty()){
        QString dis = buf;
        // delete by lixiaogang
        //if (dis == testText){
            reciveMessage->append(testSerial->portName() + ":" + dis);
            reciveMessage->moveCursor(QTextCursor::End);
        //} else {
        //    return;
        //}

        QList<QPushButton *> buttons = this->findChildren<QPushButton *>();
        for (QPushButton *btn : buttons) {
            if(btn->text() == testSerial->portName()){
                btn->setStyleSheet(btn->styleSheet()+"QPushButton{border-image:url(:/icon/pass.png)}");
            }
             btn->update();
        }
    }

    buf.clear();
}

```

## 喇叭

```cpp

void Sound::playAudio(QAudioDeviceInfo device, QString btnTxt){
    QPushButton *btn = this->findChild<QPushButton *>(device.deviceName());
    if(btnTxt == "播放"){
        btn->setText("停止");
        if (device.isFormatSupported(format)){
            outputFile.setFileName(RECORD_PATH);
            if(!outputFile.exists() || outputFile.size() == 0)
                outputFile.setFileName(AUDIO_PATH);
            if(outputFile.open( QIODevice::ReadOnly)){
                outputDev = new QAudioOutput(device, format, this);
//                outputDev->setVolume(0.1f);
                int duration = (outputFile.size()-44) / dateRate;//get wav file time
                if(outputDev){
                    playTimeThread->playTime = duration;
                    playTimeThread->playStart = true;
                    outputDev->start(&outputFile);
                    playTimeThread->start();
                    connect(outputDev, &QAudioOutput::stateChanged, [=] {
                        this->handleOutDevState(outputDev->state(), device);
                    });
                }
            }else{
                qDebug()<<"File not exits!";
                btn->setText("播放");
            }
        }else{
            btn->setText("播放");
            if(!reFormatOutputDev){
                format.setChannelCount(SINGLE_CHANNEL);
                dateRate = (SAMPLE_RATE * SINGLE_CHANNEL * SAMPLE_SIZE / 8);
                reFormatOutputDev = true;
                emit btn->clicked();  //call playAudio();
            }else{
                showDialog();
            }
        }
    }else{
        btn->setText("播放");
        closeOutDev();
    }
}

```

## 触摸

命令查看坐标 hexdump dev/input/event6

```cpp

#include "touch.h"

Touch::Touch(QWidget *parent): QWidget(parent)
{
}

void Touch::initWindow(int w, int h)
{
    point = common.getLabel("当前坐标:");
    point->setAlignment(Qt::AlignCenter);
    passBtn = common.getButton("测试通过");
    failBtn = common.getButton("测试失败");
    failBtn->setStyleSheet(failBtn->styleSheet()+"QPushButton{background-color:#f56c6c}");

    connect(passBtn, &QPushButton::clicked, [=] {this->handleClick(true);});
    connect(failBtn, &QPushButton::clicked, [=] {this->handleClick(false);});

    QVBoxLayout *layout = new QVBoxLayout;
    layout->setMargin(0);
    layout->setSpacing(0);
    QHBoxLayout *hlayout = new QHBoxLayout;
    hlayout->setMargin(0);


    layout->addWidget(point, Qt::AlignCenter);
    hlayout->addWidget(passBtn, Qt::AlignBottom);
    hlayout->addWidget(failBtn, Qt::AlignBottom);

    layout->addLayout(hlayout);

    this->setLayout(layout);
    this->resize(w, h);
    point->setAttribute(Qt::WA_AcceptTouchEvents);
    point->installEventFilter(this);
    point->resize(w,h);
    this->setWindowFlags(Qt::Window | Qt::FramelessWindowHint | Qt::CustomizeWindowHint);
    point->setStyleSheet("QLabel{border: 1px solid #07a5ff; border-radius: 1px; padding:0px}");
}

bool Touch::eventFilter(QObject *watched, QEvent *event)
{
    if(watched == point){
        switch (event->type()){
            case QEvent::TouchBegin:
                return handleTouchBegin(event);

            case QEvent::TouchUpdate:
                return handleTouchUpdate(event);

            case QEvent::TouchEnd:
                return handleTouchEnd(event);

            default:
                return false;
            }
    }
    return false;
}

bool Touch::handleTouchBegin(QEvent *event)
{
    QTouchEvent *touchEvent = static_cast<QTouchEvent *>(event);
    QList<QTouchEvent::TouchPoint> touchStartPoints = touchEvent->touchPoints();
    QPoint startPoint = touchStartPoints.at(0).screenPos().toPoint();
    x = startPoint.x();
    y = startPoint.y();
    point->setText("当前坐标:"+QString::number(x)+","+QString::number(y));
    point->update();
    path.moveTo(x,y);
    return true;
}

bool Touch::handleTouchUpdate(QEvent *event)
{
    QTouchEvent *touchEvent = static_cast<QTouchEvent *>(event);
    QList<QTouchEvent::TouchPoint> touchStartPoints = touchEvent->touchPoints();
    QPoint startPoint = touchStartPoints.at(0).screenPos().toPoint();
    x1 = startPoint.x();
    y1 = startPoint.y();
    point->setText("当前坐标:"+QString::number(x1)+","+QString::number(y1));
    point->update();
    path.lineTo(x1,y1);
    return true;
}

bool Touch::handleTouchEnd(QEvent *event)
{
    point->setText("当前坐标:");

    //clean old path
    //path.clear();
    return true;
}

void Touch::paintEvent(QPaintEvent *)
{
    QPainter painter(this);
    painter.setPen(Qt::blue);
    painter.drawPath(path);
}

void Touch::handleClick(bool result)
{
    testResult = result;
    //update config file state
    common.setConfig("tp", "state", QString::number(result));
    this->close();
    emit testFinish();
}

```

















