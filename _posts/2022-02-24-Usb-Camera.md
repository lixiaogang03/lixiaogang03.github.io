---
layout:     post
title:      Usb Camera
subtitle:   USB 相机
date:       2022-02-24
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - 硬件
---

[android设备外接多个usb摄像头](https://youshaohua.com/post/android-device-external-multiple-USB-camera)

[RK3288 android 6.0 同时打开两个摄像头](https://www.litreily.top/2021/07/12/dual-camera/)

## USB 带宽

USB 2.0: 理论带宽 480 Mbps, 实际数据的传输速度存理论上最高也只有53 MB/s(426Mbps).实际综合条件下15 MB/s至25 MB/s都可以作为合理的高速目标。

![usb_bandwidth](/images/hardware/usb/usb_bandwidth.png)

## Usb Camera带宽

wMaxPacketSize变量说明的就是该uvc camera支持的带宽，它会支持多种带宽，以适应不同的USB传输速率

一个摄像头占用带宽可以粗略估算：长(640)*宽(480)*帧率(30)*像素点数据长度(24) + 协议头部 = 640 x 480 x 30 x 24 = 26.3MB/s (210Mbps)

```txt

lsusb -v -d 1ad8:c38d

Bus 003 Device 029: ID 1ad8:c38d 
Couldn't open device, some information will be missing
Device Descriptor:
  bLength                18
  bDescriptorType         1
  bcdUSB               2.10
  bDeviceClass          239 Miscellaneous Device
  bDeviceSubClass         2 ?
  bDeviceProtocol         1 Interface Association
  bMaxPacketSize0        64
  idVendor           0x1ad8 
  idProduct          0xc38d 
  bcdDevice            1.00
  iManufacturer           3 
  iProduct                1 
  iSerial                 2 
  bNumConfigurations      1
  Configuration Descriptor:
    bLength                 9
    bDescriptorType         2
    wTotalLength         1128
    bNumInterfaces          4
    bConfigurationValue     1
    iConfiguration          4 
    bmAttributes         0x80
      (Bus Powered)
    MaxPower              500mA
    Interface Association:
      bLength                 8
      bDescriptorType        11
      bFirstInterface         0
      bInterfaceCount         2
      bFunctionClass         14 Video
      bFunctionSubClass       3 Video Interface Collection
      bFunctionProtocol       0 
      iFunction               5 
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        0
      bAlternateSetting       0
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      1 Video Control
      bInterfaceProtocol      0 
      iInterface              5 
      VideoControl Interface Descriptor:
        bLength                13
        bDescriptorType        36
        bDescriptorSubtype      1 (HEADER)
        bcdUVC               1.00
        wTotalLength          107
        dwClockFrequency       15.000000MHz
        bInCollection           1
        baInterfaceNr( 0)       1
      VideoControl Interface Descriptor:
        bLength                18
        bDescriptorType        36
        bDescriptorSubtype      2 (INPUT_TERMINAL)
        bTerminalID             1
        wTerminalType      0x0201 Camera Sensor
        bAssocTerminal          0
        iTerminal               0 
        wObjectiveFocalLengthMin      0
        wObjectiveFocalLengthMax      0
        wOcularFocalLength            0
        bControlSize                  3
        bmControls           0x00022a2e
          Auto-Exposure Mode
          Auto-Exposure Priority
          Exposure Time (Absolute)
          Focus (Absolute)
          Zoom (Absolute)
          PanTilt (Absolute)
          Roll (Absolute)
          Focus, Auto
      VideoControl Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      5 (PROCESSING_UNIT)
      Warning: Descriptor too short
        bUnitID                 2
        bSourceID               1
        wMaxMultiplier          0
        bControlSize            2
        bmControls     0x0000157f
          Brightness
          Contrast
          Hue
          Saturation
          Sharpness
          Gamma
          White Balance Temperature
          Backlight Compensation
          Power Line Frequency
          White Balance Temperature, Auto
        iProcessing             0 
        bmVideoStandards     0x 9
          None
          SECAM - 625/50
      VideoControl Interface Descriptor:
        bLength                 9
        bDescriptorType        36
        bDescriptorSubtype      3 (OUTPUT_TERMINAL)
        bTerminalID             3
        wTerminalType      0x0101 USB Streaming
        bAssocTerminal          0
        bSourceID               6
        iTerminal               0 
      VideoControl Interface Descriptor:
        bLength                27
        bDescriptorType        36
        bDescriptorSubtype      6 (EXTENSION_UNIT)
        bUnitID                 4
        guidExtensionCode         {8ca72912-b447-9440-b0ce-db07386fb938}
        bNumControl             2
        bNrPins                 1
        baSourceID( 0)          2
        bControlSize            2
        bmControls( 0)       0x00
        bmControls( 1)       0x06
        iExtension              0 
      VideoControl Interface Descriptor:
        bLength                29
        bDescriptorType        36
        bDescriptorSubtype      6 (EXTENSION_UNIT)
        bUnitID                 6
        guidExtensionCode         {5a10b826-1307-7048-979d-da79444bb68e}
        bNumControl            12
        bNrPins                 1
        baSourceID( 0)          4
        bControlSize            4
        bmControls( 0)       0x3f
        bmControls( 1)       0x00
        bmControls( 2)       0xfc
        bmControls( 3)       0x00
        iExtension              6 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x83  EP 3 IN
        bmAttributes            3
          Transfer Type            Interrupt
          Synch Type               None
          Usage Type               Data
        wMaxPacketSize     0x0010  1x 16 bytes
        bInterval               6
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       0
      bNumEndpoints           0
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      VideoStreaming Interface Descriptor:
        bLength                            15
        bDescriptorType                    36
        bDescriptorSubtype                  1 (INPUT_HEADER)
        bNumFormats                         2
        wTotalLength                      367
        bEndPointAddress                  129
        bmInfo                              0
        bTerminalLink                       3
        bStillCaptureMethod                 2
        bTriggerSupport                     1
        bTriggerUsage                       0
        bControlSize                        1
        bmaControls( 0)                    11
        bmaControls( 1)                    11
      VideoStreaming Interface Descriptor:
        bLength                            11
        bDescriptorType                    36
        bDescriptorSubtype                  6 (FORMAT_MJPEG)
        bFormatIndex                        1
        bNumFrameDescriptors                7
        bFlags                              1
          Fixed-size samples: Yes
        bDefaultFrameIndex                  1
        bAspectRatioX                       0
        bAspectRatioY                       0
        bmInterlaceFlags                 0x00
          Interlaced stream or variable: No
          Fields per frame: 1 fields
          Field 1 first: No
          Field pattern: Field 1 only
          bCopyProtect                      0
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         1
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           3264
        wHeight                          2448
        dwMinBitRate                1917665280
        dwMaxBitRate                1917665280
        dwMaxVideoFrameBufferSize    15980544
        dwDefaultFrameInterval         666666
        bFrameIntervalType                  1
        dwFrameInterval( 0)            666666
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         2
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           1920
        wHeight                          1080
        dwMinBitRate                995328000
        dwMaxBitRate                995328000
        dwMaxVideoFrameBufferSize     4147200
        dwDefaultFrameInterval         333333
        bFrameIntervalType                  1
        dwFrameInterval( 0)            333333
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         3
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           1280
        wHeight                           720
        dwMinBitRate                442368000
        dwMaxBitRate                442368000
        dwMaxVideoFrameBufferSize     1843200
        dwDefaultFrameInterval         333333
        bFrameIntervalType                  1
        dwFrameInterval( 0)            333333
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         4
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                            640
        wHeight                           480
        dwMinBitRate                147456000
        dwMaxBitRate                147456000
        dwMaxVideoFrameBufferSize      614400
        dwDefaultFrameInterval         333333
        bFrameIntervalType                  1
        dwFrameInterval( 0)            333333
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         5
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           1600
        wHeight                          1200
        dwMinBitRate                921600000
        dwMaxBitRate                921600000
        dwMaxVideoFrameBufferSize     3840000
        dwDefaultFrameInterval         333333
        bFrameIntervalType                  1
        dwFrameInterval( 0)            333333
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         6
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           2048
        wHeight                          1536
        dwMinBitRate                1509949440
        dwMaxBitRate                1509949440
        dwMaxVideoFrameBufferSize     6291456
        dwDefaultFrameInterval         333333
        bFrameIntervalType                  1
        dwFrameInterval( 0)            333333
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  7 (FRAME_MJPEG)
        bFrameIndex                         7
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           2592
        wHeight                          1944
        dwMinBitRate                1209323520
        dwMaxBitRate                1209323520
        dwMaxVideoFrameBufferSize    10077696
        dwDefaultFrameInterval         666666
        bFrameIntervalType                  1
        dwFrameInterval( 0)            666666
      VideoStreaming Interface Descriptor:
        bLength                            18
        bDescriptorType                    36
        bDescriptorSubtype                  3 (STILL_IMAGE_FRAME)
        bEndpointAddress                    0
        bNumImageSizePatterns               3
        wWidth( 0)                       1920
        wHeight( 0)                      1080
        wWidth( 1)                       1280
        wHeight( 1)                       720
        wWidth( 2)                        640
        wHeight( 2)                       480
        bNumCompressionPatterns             3
      VideoStreaming Interface Descriptor:
        bLength                             6
        bDescriptorType                    36
        bDescriptorSubtype                 13 (COLORFORMAT)
        bColorPrimaries                     1 (BT.709,sRGB)
        bTransferCharacteristics            1 (BT.709)
        bMatrixCoefficients                 4 (SMPTE 170M (BT.601))
      VideoStreaming Interface Descriptor:
        bLength                            27
        bDescriptorType                    36
        bDescriptorSubtype                  4 (FORMAT_UNCOMPRESSED)
        bFormatIndex                        2
        bNumFrameDescriptors                2
        guidFormat                            {59555932-0000-1000-8000-00aa00389b71}
        bBitsPerPixel                      16
        bDefaultFrameIndex                  1
        bAspectRatioX                       0
        bAspectRatioY                       0
        bmInterlaceFlags                 0x00
          Interlaced stream or variable: No
          Fields per frame: 2 fields
          Field 1 first: No
          Field pattern: Field 1 only
          bCopyProtect                      0
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  5 (FRAME_UNCOMPRESSED)
        bFrameIndex                         1
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                            640
        wHeight                           480
        dwMinBitRate                147456000
        dwMaxBitRate                147456000
        dwMaxVideoFrameBufferSize      614400
        dwDefaultFrameInterval         333333
        bFrameIntervalType                  1
        dwFrameInterval( 0)            333333
      VideoStreaming Interface Descriptor:
        bLength                            30
        bDescriptorType                    36
        bDescriptorSubtype                  5 (FRAME_UNCOMPRESSED)
        bFrameIndex                         2
        bmCapabilities                   0x00
          Still image unsupported
        wWidth                           1280
        wHeight                           720
        dwMinBitRate                147456000
        dwMaxBitRate                147456000
        dwMaxVideoFrameBufferSize     1843200
        dwDefaultFrameInterval        1000000
        bFrameIntervalType                  1
        dwFrameInterval( 0)           1000000
      VideoStreaming Interface Descriptor:
        bLength                            14
        bDescriptorType                    36
        bDescriptorSubtype                  3 (STILL_IMAGE_FRAME)
        bEndpointAddress                    0
        bNumImageSizePatterns               2
        wWidth( 0)                       1280
        wHeight( 0)                       720
        wWidth( 1)                        640
        wHeight( 1)                       360
        bNumCompressionPatterns             2
      VideoStreaming Interface Descriptor:
        bLength                             6
        bDescriptorType                    36
        bDescriptorSubtype                 13 (COLORFORMAT)
        bColorPrimaries                     1 (BT.709,sRGB)
        bTransferCharacteristics            1 (BT.709)
        bMatrixCoefficients                 4 (SMPTE 170M (BT.601))
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       1
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0080  1x 128 bytes
        bInterval               1
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       2
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0200  1x 512 bytes
        bInterval               1
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       3
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0400  1x 1024 bytes
        bInterval               1
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       4
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0b00  2x 768 bytes
        bInterval               1
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       5
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0c00  2x 1024 bytes
        bInterval               1
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       6
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x1380  3x 896 bytes
        bInterval               1
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        1
      bAlternateSetting       7
      bNumEndpoints           1
      bInterfaceClass        14 Video
      bInterfaceSubClass      2 Video Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x1400  3x 1024 bytes
        bInterval               1
    Interface Association:
      bLength                 8
      bDescriptorType        11
      bFirstInterface         2
      bInterfaceCount         2
      bFunctionClass          1 Audio
      bFunctionSubClass       2 Streaming
      bFunctionProtocol       0 
      iFunction               7 
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        2
      bAlternateSetting       0
      bNumEndpoints           0
      bInterfaceClass         1 Audio
      bInterfaceSubClass      1 Control Device
      bInterfaceProtocol      0 
      iInterface              7 
      AudioControl Interface Descriptor:
        bLength                 9
        bDescriptorType        36
        bDescriptorSubtype      1 (HEADER)
        bcdADC               1.00
        wTotalLength           39
        bInCollection           1
        baInterfaceNr( 0)       3
      AudioControl Interface Descriptor:
        bLength                12
        bDescriptorType        36
        bDescriptorSubtype      2 (INPUT_TERMINAL)
        bTerminalID             1
        wTerminalType      0x0201 Microphone
        bAssocTerminal          0
        bNrChannels             1
        wChannelConfig     0x0003
          Left Front (L)
          Right Front (R)
        iChannelNames           0 
        iTerminal               0 
      AudioControl Interface Descriptor:
        bLength                 9
        bDescriptorType        36
        bDescriptorSubtype      3 (OUTPUT_TERMINAL)
        bTerminalID             2
        wTerminalType      0x0101 USB Streaming
        bAssocTerminal          1
        bSourceID               3
        iTerminal               0 
      AudioControl Interface Descriptor:
        bLength                 9
        bDescriptorType        36
        bDescriptorSubtype      6 (FEATURE_UNIT)
        bUnitID                 3
        bSourceID               1
        bControlSize            2
        bmaControls( 0)      0x03
        bmaControls( 0)      0x02
          Mute Control
          Volume Control
          Loudness Control
        iFeature                0 
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       0
      bNumEndpoints           0
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       1
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              2 PCM8
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           1
        bBitResolution          8
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        22050
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x003c  1x 60 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       2
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              2 PCM8
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           1
        bBitResolution          8
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        44100
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x006c  1x 108 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       3
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              2 PCM8
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           1
        bBitResolution          8
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        48000
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0078  1x 120 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       4
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           2
        bBitResolution         16
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        22050
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x006c  1x 108 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       5
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           2
        bBitResolution         16
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        44100
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x00c0  1x 192 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       6
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             1
        bSubframeSize           2
        bBitResolution         16
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        48000
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0078  1x 120 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       7
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           2
        bBitResolution         16
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        48000
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x00d8  1x 216 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       8
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           3
        bBitResolution         24
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        22050
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0090  1x 144 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting       9
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           3
        bBitResolution         24
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        44100
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x0114  1x 276 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        3
      bAlternateSetting      10
      bNumEndpoints           1
      bInterfaceClass         1 Audio
      bInterfaceSubClass      2 Streaming
      bInterfaceProtocol      0 
      iInterface              0 
      AudioStreaming Interface Descriptor:
        bLength                 7
        bDescriptorType        36
        bDescriptorSubtype      1 (AS_GENERAL)
        bTerminalLink           2
        bDelay                  1 frames
        wFormatTag              1 PCM
      AudioStreaming Interface Descriptor:
        bLength                11
        bDescriptorType        36
        bDescriptorSubtype      2 (FORMAT_TYPE)
        bFormatType             1 (FORMAT_TYPE_I)
        bNrChannels             2
        bSubframeSize           3
        bBitResolution         24
        bSamFreqType            1 Discrete
        tSamFreq[ 0]        48000
      Endpoint Descriptor:
        bLength                 9
        bDescriptorType         5
        bEndpointAddress     0x82  EP 2 IN
        bmAttributes            5
          Transfer Type            Isochronous
          Synch Type               Asynchronous
          Usage Type               Data
        wMaxPacketSize     0x012c  1x 300 bytes
        bInterval               4
        bRefresh                0
        bSynchAddress           0
        AudioControl Endpoint Descriptor:
          bLength                 7
          bDescriptorType        37
          bDescriptorSubtype      1 (EP_GENERAL)
          bmAttributes         0x01
            Sampling Frequency
          bLockDelayUnits         0 Undefined
          wLockDelay              0 Undefined


```

## Kernel

kernel/drivers/media/usb/uvc/uvc_video.c

```c

//lixiaogang add start
#define UVC_LIMITED_BANDWIDTH   800
//lixiaogang add end


/*
 * Initialize isochronous/bulk URBs and allocate transfer buffers.
 */
static int uvc_init_video(struct uvc_streaming *stream, gfp_t gfp_flags)
{
	struct usb_interface *intf = stream->intf;
	struct usb_host_endpoint *ep;
	unsigned int i;
	int ret;

	stream->sequence = -1;
	stream->last_fid = -1;
	stream->bulk.header_size = 0;
	stream->bulk.skip_payload = 0;
	stream->bulk.payload_size = 0;

	uvc_video_stats_start(stream);

	stream->async_wq = alloc_workqueue("uvcvideo", WQ_UNBOUND | WQ_HIGHPRI,
			0);
	if (!stream->async_wq)
		return -ENOMEM;

	if (intf->num_altsetting > 1) {
		struct usb_host_endpoint *best_ep = NULL;
		unsigned int best_psize = UINT_MAX;
		unsigned int bandwidth;
		unsigned int uninitialized_var(altsetting);
		int intfnum = stream->intfnum;

		/* Isochronous endpoint, select the alternate setting. */
		bandwidth = stream->ctrl.dwMaxPayloadTransferSize;

                //lixioagang add start
                if (bandwidth > UVC_LIMITED_BANDWIDTH) {
                        printk(KERN_ERR "UVC_DBG: limit bandwidth from %d to %d \n",
                               bandwidth, UVC_LIMITED_BANDWIDTH);
                       bandwidth = UVC_LIMITED_BANDWIDTH;
                }
                //lixiaogang add end

		if (bandwidth == 0) {
			uvc_trace(UVC_TRACE_VIDEO, "Device requested null "
				"bandwidth, defaulting to lowest.\n");
			bandwidth = 1;
		} else {
			uvc_trace(UVC_TRACE_VIDEO, "Device requested %u "
				"B/frame bandwidth.\n", bandwidth);
		}

		for (i = 0; i < intf->num_altsetting; ++i) {
			struct usb_host_interface *alts;
			unsigned int psize;

			alts = &intf->altsetting[i];
			ep = uvc_find_endpoint(alts,
				stream->header.bEndpointAddress);
			if (ep == NULL)
				continue;

			/* Check if the bandwidth is high enough. */
			psize = uvc_endpoint_max_bpi(stream->dev->udev, ep);
			if (psize >= bandwidth && psize <= best_psize) {
				altsetting = alts->desc.bAlternateSetting;
				best_psize = psize;
				best_ep = ep;
			}
		}

		if (best_ep == NULL) {
			uvc_trace(UVC_TRACE_VIDEO, "No fast enough alt setting "
				"for requested bandwidth.\n");
			return -EIO;
		}

		uvc_trace(UVC_TRACE_VIDEO, "Selecting alternate setting %u "
			"(%u B/frame bandwidth).\n", altsetting, best_psize);

		ret = usb_set_interface(stream->dev->udev, intfnum, altsetting);
		if (ret < 0)
			return ret;

		ret = uvc_init_video_isoc(stream, best_ep, gfp_flags);
	} else {
		/* Bulk endpoint, proceed to URB initialization. */
		ep = uvc_find_endpoint(&intf->altsetting[0],
				stream->header.bEndpointAddress);
		if (ep == NULL)
			return -EIO;

		ret = uvc_init_video_bulk(stream, ep, gfp_flags);
	}

	if (ret < 0)
		return ret;

	/* Submit the URBs. */
	for (i = 0; i < UVC_URBS; ++i) {
		struct uvc_urb *uvc_urb = &stream->uvc_urb[i];

		ret = usb_submit_urb(uvc_urb->urb, gfp_flags);
		if (ret < 0) {
			uvc_printk(KERN_ERR, "Failed to submit URB %u "
					"(%d).\n", i, ret);
			uvc_uninit_video(stream, 1);
			return ret;
		}
	}

	/* The Logitech C920 temporarily forgets that it should not be adjusting
	 * Exposure Absolute during init so restore controls to stored values.
	 */
	if (stream->dev->quirks & UVC_QUIRK_RESTORE_CTRLS_ON_INIT)
		uvc_ctrl_restore_values(stream->dev);

	return 0;
}

```

## Linux UVC debug

echo 0xffff > /sys/module/uvcvideo/parameters/trace

echo 0 > /sys/module/uvcvideo/parameters/trace

## RK3288 双路 USB camera 带宽不足

```txt

[ 3565.941930] usb 1-1.5: new high-speed USB device number 15 using dwc2
[ 3566.159852] usb 1-1.5: New USB device found, idVendor=058f, idProduct=2657
[ 3566.159910] usb 1-1.5: New USB device strings: Mfr=1, Product=2, SerialNumber=0
[ 3566.159947] usb 1-1.5: Product: PC Camera
[ 3566.159982] usb 1-1.5: Manufacturer: Alcor Micro, Corp.
[ 3566.168266] uvcvideo: Probing generic UVC device 1.5
[ 3566.168329] uvcvideo: Found format YUV 4:2:2 (YUYV).
[ 3566.168350] uvcvideo: - 640x480 (30.0 fps)
[ 3566.168368] uvcvideo: - 352x288 (30.0 fps)
[ 3566.168384] uvcvideo: - 320x240 (30.0 fps)
[ 3566.168400] uvcvideo: - 176x144 (30.0 fps)
[ 3566.168416] uvcvideo: - 160x120 (30.0 fps)
[ 3566.168454] uvcvideo: - 800x600 (15.0 fps)
[ 3566.168471] uvcvideo: - 1280x960 (12.0 fps)
[ 3566.168487] uvcvideo: - 1280x720 (15.0 fps)
[ 3566.168502] uvcvideo: Found format MJPEG.
[ 3566.168518] uvcvideo: - 640x480 (30.0 fps)
[ 3566.168534] uvcvideo: - 352x288 (30.0 fps)
[ 3566.168641] uvcvideo: - 320x240 (30.0 fps)
[ 3566.168658] uvcvideo: - 176x144 (30.0 fps)
[ 3566.168674] uvcvideo: - 160x120 (30.0 fps)
[ 3566.168707] uvcvideo: - 800x600 (30.0 fps)
[ 3566.168723] uvcvideo: - 1280x960 (30.0 fps)
[ 3566.168738] uvcvideo: - 1280x720 (30.0 fps)
[ 3566.168770] uvcvideo: Found a Status endpoint (addr 81).
[ 3566.168789] uvcvideo: Found UVC 1.00 device PC Camera (058f:2657)
[ 3566.169776] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/2 to device 1.5 entity 1
[ 3566.169825] uvcvideo: Adding mapping 'Exposure, Auto' to control 00000000-0000-0000-0000-000000000001/2.
[ 3566.169862] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/3 to device 1.5 entity 1
[ 3566.169886] uvcvideo: Adding mapping 'Exposure, Auto Priority' to control 00000000-0000-0000-0000-000000000001/3.
[ 3566.169915] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/4 to device 1.5 entity 1
[ 3566.169949] uvcvideo: Adding mapping 'Exposure (Absolute)' to control 00000000-0000-0000-0000-000000000001/4.
[ 3566.169980] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/11 to device 1.5 entity 1
[ 3566.170005] uvcvideo: Adding mapping 'Zoom, Absolute' to control 00000000-0000-0000-0000-000000000001/11.
[ 3566.170033] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/13 to device 1.5 entity 1
[ 3566.170068] uvcvideo: Adding mapping 'Pan (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3566.170088] uvcvideo: Adding mapping 'Tilt (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3566.170112] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/2 to device 1.5 entity 2
[ 3566.170130] uvcvideo: Adding mapping 'Brightness' to control 00000000-0000-0000-0000-000000000101/2.
[ 3566.170158] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/3 to device 1.5 entity 2
[ 3566.170176] uvcvideo: Adding mapping 'Contrast' to control 00000000-0000-0000-0000-000000000101/3.
[ 3566.170211] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/6 to device 1.5 entity 2
[ 3566.170230] uvcvideo: Adding mapping 'Hue' to control 00000000-0000-0000-0000-000000000101/6.
[ 3566.170255] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/7 to device 1.5 entity 2
[ 3566.170274] uvcvideo: Adding mapping 'Saturation' to control 00000000-0000-0000-0000-000000000101/7.
[ 3566.170299] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/8 to device 1.5 entity 2
[ 3566.170326] uvcvideo: Adding mapping 'Sharpness' to control 00000000-0000-0000-0000-000000000101/8.
[ 3566.170353] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/9 to device 1.5 entity 2
[ 3566.170372] uvcvideo: Adding mapping 'Gamma' to control 00000000-0000-0000-0000-000000000101/9.
[ 3566.170397] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/10 to device 1.5 entity 2
[ 3566.170419] uvcvideo: Adding mapping 'White Balance Temperature' to control 00000000-0000-0000-0000-000000000101/10.
[ 3566.170480] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/1 to device 1.5 entity 2
[ 3566.170504] uvcvideo: Adding mapping 'Backlight Compensation' to control 00000000-0000-0000-0000-000000000101/1.
[ 3566.170531] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/5 to device 1.5 entity 2
[ 3566.170552] uvcvideo: Adding mapping 'Power Line Frequency' to control 00000000-0000-0000-0000-000000000101/5.
[ 3566.170602] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/11 to device 1.5 entity 2
[ 3566.170624] uvcvideo: Adding mapping 'White Balance Temperature, Auto' to control 00000000-0000-0000-0000-000000000101/11.
[ 3566.170645] uvcvideo: Scanning UVC chain: OT 3 <- PU 2 (-> XU 6) <- IT 1
[ 3566.170730] uvcvideo: Found a valid video chain (1 -> 3).
[ 3566.180021] input: PC Camera as /devices/platform/ff540000.usb/usb1/1-1/1-1.5/1-1.5:1.0/input/input48
[ 3566.180507] uvcvideo: UVC device initialized.
[ 3566.182091] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3566.182128] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3566.182149] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3566.182172] rt5640 2-001c: Error applying setting, reverse things back
[ 3566.182239] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3566.186115] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3566.186152] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3566.186174] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3566.186199] rt5640 2-001c: Error applying setting, reverse things back
[ 3566.186251] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3566.193208] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3566.193251] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3566.193272] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3566.193291] rt5640 2-001c: Error applying setting, reverse things back
[ 3566.193344] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3566.391923] usb 1-1.6: new high-speed USB device number 16 using dwc2
[ 3566.901392] usb 1-1.6: New USB device found, idVendor=1ad8, idProduct=c38d
[ 3566.901420] usb 1-1.6: New USB device strings: Mfr=3, Product=1, SerialNumber=2
[ 3566.901436] usb 1-1.6: Product: USB Camera
[ 3566.901447] usb 1-1.6: Manufacturer: FLIP_MIRROR
[ 3566.901456] usb 1-1.6: SerialNumber: 20180424
[ 3566.924099] uvcvideo: Probing generic UVC device 1.6
[ 3566.924124] uvcvideo: Found format MJPEG.
[ 3566.924132] uvcvideo: - 3264x2448 (15.0 fps)
[ 3566.924139] uvcvideo: - 1920x1080 (30.0 fps)
[ 3566.924146] uvcvideo: - 1280x720 (30.0 fps)
[ 3566.924153] uvcvideo: - 640x480 (30.0 fps)
[ 3566.924159] uvcvideo: - 1600x1200 (30.0 fps)
[ 3566.924166] uvcvideo: - 2048x1536 (30.0 fps)
[ 3566.924173] uvcvideo: - 2592x1944 (15.0 fps)
[ 3566.924186] uvcvideo: Found format YUV 4:2:2 (YUYV).
[ 3566.924193] uvcvideo: - 640x480 (30.0 fps)
[ 3566.924200] uvcvideo: - 1280x720 (10.0 fps)
[ 3566.933563] uvcvideo: Found a Status endpoint (addr 83).
[ 3566.933576] uvcvideo: Found UVC 1.00 device USB Camera (1ad8:c38d)
[ 3566.933855] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/2 to device 1.6 entity 1
[ 3566.933869] uvcvideo: Adding mapping 'Exposure, Auto' to control 00000000-0000-0000-0000-000000000001/2.
[ 3566.933886] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/3 to device 1.6 entity 1
[ 3566.933895] uvcvideo: Adding mapping 'Exposure, Auto Priority' to control 00000000-0000-0000-0000-000000000001/3.
[ 3566.933909] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/4 to device 1.6 entity 1
[ 3566.933918] uvcvideo: Adding mapping 'Exposure (Absolute)' to control 00000000-0000-0000-0000-000000000001/4.
[ 3566.933938] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/6 to device 1.6 entity 1
[ 3566.933949] uvcvideo: Adding mapping 'Focus (absolute)' to control 00000000-0000-0000-0000-000000000001/6.
[ 3566.933961] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/11 to device 1.6 entity 1
[ 3566.933972] uvcvideo: Adding mapping 'Zoom, Absolute' to control 00000000-0000-0000-0000-000000000001/11.
[ 3566.933984] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/13 to device 1.6 entity 1
[ 3566.933995] uvcvideo: Adding mapping 'Pan (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3566.934003] uvcvideo: Adding mapping 'Tilt (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3566.934014] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/15 to device 1.6 entity 1
[ 3566.934031] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/8 to device 1.6 entity 1
[ 3566.934042] uvcvideo: Adding mapping 'Focus, Auto' to control 00000000-0000-0000-0000-000000000001/8.
[ 3566.934052] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/2 to device 1.6 entity 2
[ 3566.934064] uvcvideo: Adding mapping 'Brightness' to control 00000000-0000-0000-0000-000000000101/2.
[ 3566.934075] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/3 to device 1.6 entity 2
[ 3566.934083] uvcvideo: Adding mapping 'Contrast' to control 00000000-0000-0000-0000-000000000101/3.
[ 3566.934094] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/6 to device 1.6 entity 2
[ 3566.934102] uvcvideo: Adding mapping 'Hue' to control 00000000-0000-0000-0000-000000000101/6.
[ 3566.934113] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/7 to device 1.6 entity 2
[ 3566.934121] uvcvideo: Adding mapping 'Saturation' to control 00000000-0000-0000-0000-000000000101/7.
[ 3566.934131] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/8 to device 1.6 entity 2
[ 3566.934140] uvcvideo: Adding mapping 'Sharpness' to control 00000000-0000-0000-0000-000000000101/8.
[ 3566.934150] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/9 to device 1.6 entity 2
[ 3566.934159] uvcvideo: Adding mapping 'Gamma' to control 00000000-0000-0000-0000-000000000101/9.
[ 3566.934169] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/10 to device 1.6 entity 2
[ 3566.934183] uvcvideo: Adding mapping 'White Balance Temperature' to control 00000000-0000-0000-0000-000000000101/10.
[ 3566.934193] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/1 to device 1.6 entity 2
[ 3566.934202] uvcvideo: Adding mapping 'Backlight Compensation' to control 00000000-0000-0000-0000-000000000101/1.
[ 3566.934214] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/5 to device 1.6 entity 2
[ 3566.934224] uvcvideo: Adding mapping 'Power Line Frequency' to control 00000000-0000-0000-0000-000000000101/5.
[ 3566.934236] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/11 to device 1.6 entity 2
[ 3566.934245] uvcvideo: Adding mapping 'White Balance Temperature, Auto' to control 00000000-0000-0000-0000-000000000101/11.
[ 3566.934257] uvcvideo: Scanning UVC chain: OT 3 <- XU 6 <- XU 4 <- PU 2 <- IT 1
[ 3566.934282] uvcvideo: Found a valid video chain (1 -> 3).
[ 3567.148275] input: USB Camera as /devices/platform/ff540000.usb/usb1/1-1/1-1.6/1-1.6:1.0/input/input49
[ 3567.149098] uvcvideo: UVC device initialized.
[ 3567.151172] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3567.151228] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3567.151260] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3567.151295] rt5640 2-001c: Error applying setting, reverse things back
[ 3567.151376] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3567.156595] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3567.156691] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3567.156890] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3567.157088] rt5640 2-001c: Error applying setting, reverse things back
[ 3567.157351] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.116676] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.116708] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.116721] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.116733] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.116772] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.118096] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.118125] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.118138] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.118149] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.118183] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.140125] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.140154] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.140165] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.140175] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.140209] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.162906] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.162935] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.162945] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.162953] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.162982] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.234288] uvcvideo: Probing generic UVC device 1.5
[ 3568.234860] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.234875] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.234884] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.234891] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.234919] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.235128] uvcvideo: Found format YUV 4:2:2 (YUYV).
[ 3568.235139] uvcvideo: - 640x480 (30.0 fps)
[ 3568.235145] uvcvideo: - 352x288 (30.0 fps)
[ 3568.235150] uvcvideo: - 320x240 (30.0 fps)
[ 3568.235154] uvcvideo: - 176x144 (30.0 fps)
[ 3568.235159] uvcvideo: - 160x120 (30.0 fps)
[ 3568.235164] uvcvideo: - 800x600 (15.0 fps)
[ 3568.235169] uvcvideo: - 1280x960 (12.0 fps)
[ 3568.235394] uvcvideo: - 1280x720 (15.0 fps)
[ 3568.235404] uvcvideo: Found format MJPEG.
[ 3568.235410] uvcvideo: - 640x480 (30.0 fps)
[ 3568.235416] uvcvideo: - 352x288 (30.0 fps)
[ 3568.235421] uvcvideo: - 320x240 (30.0 fps)
[ 3568.235426] uvcvideo: - 176x144 (30.0 fps)
[ 3568.235430] uvcvideo: - 160x120 (30.0 fps)
[ 3568.235435] uvcvideo: - 800x600 (30.0 fps)
[ 3568.235440] uvcvideo: - 1280x960 (30.0 fps)
[ 3568.235445] uvcvideo: - 1280x720 (30.0 fps)
[ 3568.235463] uvcvideo: Found a Status endpoint (addr 81).
[ 3568.235472] uvcvideo: Found UVC 1.00 device PC Camera (058f:2657)
[ 3568.236242] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/2 to device 1.5 entity 1
[ 3568.236257] uvcvideo: Adding mapping 'Exposure, Auto' to control 00000000-0000-0000-0000-000000000001/2.
[ 3568.236268] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/3 to device 1.5 entity 1
[ 3568.236274] uvcvideo: Adding mapping 'Exposure, Auto Priority' to control 00000000-0000-0000-0000-000000000001/3.
[ 3568.236283] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/4 to device 1.5 entity 1
[ 3568.236315] uvcvideo: Adding mapping 'Exposure (Absolute)' to control 00000000-0000-0000-0000-000000000001/4.
[ 3568.236325] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/11 to device 1.5 entity 1
[ 3568.236333] uvcvideo: Adding mapping 'Zoom, Absolute' to control 00000000-0000-0000-0000-000000000001/11.
[ 3568.236341] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/13 to device 1.5 entity 1
[ 3568.236348] uvcvideo: Adding mapping 'Pan (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3568.236354] uvcvideo: Adding mapping 'Tilt (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3568.236361] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/2 to device 1.5 entity 2
[ 3568.236366] uvcvideo: Adding mapping 'Brightness' to control 00000000-0000-0000-0000-000000000101/2.
[ 3568.236375] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/3 to device 1.5 entity 2
[ 3568.236380] uvcvideo: Adding mapping 'Contrast' to control 00000000-0000-0000-0000-000000000101/3.
[ 3568.236388] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/6 to device 1.5 entity 2
[ 3568.236394] uvcvideo: Adding mapping 'Hue' to control 00000000-0000-0000-0000-000000000101/6.
[ 3568.236401] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/7 to device 1.5 entity 2
[ 3568.236407] uvcvideo: Adding mapping 'Saturation' to control 00000000-0000-0000-0000-000000000101/7.
[ 3568.236414] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/8 to device 1.5 entity 2
[ 3568.236419] uvcvideo: Adding mapping 'Sharpness' to control 00000000-0000-0000-0000-000000000101/8.
[ 3568.236427] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/9 to device 1.5 entity 2
[ 3568.236434] uvcvideo: Adding mapping 'Gamma' to control 00000000-0000-0000-0000-000000000101/9.
[ 3568.236442] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/10 to device 1.5 entity 2
[ 3568.236448] uvcvideo: Adding mapping 'White Balance Temperature' to control 00000000-0000-0000-0000-000000000101/10.
[ 3568.236455] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/1 to device 1.5 entity 2
[ 3568.236462] uvcvideo: Adding mapping 'Backlight Compensation' to control 00000000-0000-0000-0000-000000000101/1.
[ 3568.236470] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/5 to device 1.5 entity 2
[ 3568.236477] uvcvideo: Adding mapping 'Power Line Frequency' to control 00000000-0000-0000-0000-000000000101/5.
[ 3568.236485] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/11 to device 1.5 entity 2
[ 3568.236491] uvcvideo: Adding mapping 'White Balance Temperature, Auto' to control 00000000-0000-0000-0000-000000000101/11.
[ 3568.236501] uvcvideo: Scanning UVC chain: OT 3 <- PU 2 (-> XU 6) <- IT 1
[ 3568.236547] uvcvideo: Found a valid video chain (1 -> 3).
[ 3568.254428] input: PC Camera as /devices/platform/ff540000.usb/usb1/1-1/1-1.5/1-1.5:1.0/input/input50
[ 3568.254740] uvcvideo: UVC device initialized.
[ 3568.255394] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.255411] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.255420] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.255434] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.255464] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.288368] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.288387] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.288397] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.288406] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.288436] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.322170] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.322191] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.322200] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.322209] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.322248] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.356819] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.356836] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.356845] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.356852] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.356885] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.414087] uvcvideo: Probing generic UVC device 1.5
[ 3568.414130] uvcvideo: Found format YUV 4:2:2 (YUYV).
[ 3568.414138] uvcvideo: - 640x480 (30.0 fps)
[ 3568.414142] uvcvideo: - 352x288 (30.0 fps)
[ 3568.414148] uvcvideo: - 320x240 (30.0 fps)
[ 3568.414152] uvcvideo: - 176x144 (30.0 fps)
[ 3568.414156] uvcvideo: - 160x120 (30.0 fps)
[ 3568.414161] uvcvideo: - 800x600 (15.0 fps)
[ 3568.414166] uvcvideo: - 1280x960 (12.0 fps)
[ 3568.414171] uvcvideo: - 1280x720 (15.0 fps)
[ 3568.414176] uvcvideo: Found format MJPEG.
[ 3568.414180] uvcvideo: - 640x480 (30.0 fps)
[ 3568.414185] uvcvideo: - 352x288 (30.0 fps)
[ 3568.414190] uvcvideo: - 320x240 (30.0 fps)
[ 3568.414194] uvcvideo: - 176x144 (30.0 fps)
[ 3568.414199] uvcvideo: - 160x120 (30.0 fps)
[ 3568.414204] uvcvideo: - 800x600 (30.0 fps)
[ 3568.414208] uvcvideo: - 1280x960 (30.0 fps)
[ 3568.414213] uvcvideo: - 1280x720 (30.0 fps)
[ 3568.414225] uvcvideo: Found a Status endpoint (addr 81).
[ 3568.414231] uvcvideo: Found UVC 1.00 device PC Camera (058f:2657)
[ 3568.414273] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.414285] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.414294] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.414301] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.414335] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.414718] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/2 to device 1.5 entity 1
[ 3568.414732] uvcvideo: Adding mapping 'Exposure, Auto' to control 00000000-0000-0000-0000-000000000001/2.
[ 3568.414743] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/3 to device 1.5 entity 1
[ 3568.414751] uvcvideo: Adding mapping 'Exposure, Auto Priority' to control 00000000-0000-0000-0000-000000000001/3.
[ 3568.414758] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/4 to device 1.5 entity 1
[ 3568.414765] uvcvideo: Adding mapping 'Exposure (Absolute)' to control 00000000-0000-0000-0000-000000000001/4.
[ 3568.414774] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/11 to device 1.5 entity 1
[ 3568.414781] uvcvideo: Adding mapping 'Zoom, Absolute' to control 00000000-0000-0000-0000-000000000001/11.
[ 3568.414789] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/13 to device 1.5 entity 1
[ 3568.414796] uvcvideo: Adding mapping 'Pan (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3568.414801] uvcvideo: Adding mapping 'Tilt (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3568.414807] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/2 to device 1.5 entity 2
[ 3568.414813] uvcvideo: Adding mapping 'Brightness' to control 00000000-0000-0000-0000-000000000101/2.
[ 3568.414820] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/3 to device 1.5 entity 2
[ 3568.414826] uvcvideo: Adding mapping 'Contrast' to control 00000000-0000-0000-0000-000000000101/3.
[ 3568.414833] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/6 to device 1.5 entity 2
[ 3568.414839] uvcvideo: Adding mapping 'Hue' to control 00000000-0000-0000-0000-000000000101/6.
[ 3568.414847] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/7 to device 1.5 entity 2
[ 3568.414852] uvcvideo: Adding mapping 'Saturation' to control 00000000-0000-0000-0000-000000000101/7.
[ 3568.414859] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/8 to device 1.5 entity 2
[ 3568.414865] uvcvideo: Adding mapping 'Sharpness' to control 00000000-0000-0000-0000-000000000101/8.
[ 3568.414871] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/9 to device 1.5 entity 2
[ 3568.414877] uvcvideo: Adding mapping 'Gamma' to control 00000000-0000-0000-0000-000000000101/9.
[ 3568.414884] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/10 to device 1.5 entity 2
[ 3568.414890] uvcvideo: Adding mapping 'White Balance Temperature' to control 00000000-0000-0000-0000-000000000101/10.
[ 3568.414900] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/1 to device 1.5 entity 2
[ 3568.414905] uvcvideo: Adding mapping 'Backlight Compensation' to control 00000000-0000-0000-0000-000000000101/1.
[ 3568.414913] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/5 to device 1.5 entity 2
[ 3568.414920] uvcvideo: Adding mapping 'Power Line Frequency' to control 00000000-0000-0000-0000-000000000101/5.
[ 3568.414927] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/11 to device 1.5 entity 2
[ 3568.414933] uvcvideo: Adding mapping 'White Balance Temperature, Auto' to control 00000000-0000-0000-0000-000000000101/11.
[ 3568.414940] uvcvideo: Scanning UVC chain: OT 3 <- PU 2 (-> XU 6) <- IT 1
[ 3568.414959] uvcvideo: Found a valid video chain (1 -> 3).
[ 3568.435695] input: PC Camera as /devices/platform/ff540000.usb/usb1/1-1/1-1.5/1-1.5:1.0/input/input51
[ 3568.435907] uvcvideo: UVC device initialized.
[ 3568.436107] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.436120] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.436129] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.436137] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.436172] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.705762] uvcvideo: Probing generic UVC device 1.6
[ 3568.705944] uvcvideo: Found format MJPEG.
[ 3568.705989] uvcvideo: - 3264x2448 (15.0 fps)
[ 3568.706022] uvcvideo: - 1920x1080 (30.0 fps)
[ 3568.706053] uvcvideo: - 1280x720 (30.0 fps)
[ 3568.706083] uvcvideo: - 640x480 (30.0 fps)
[ 3568.706113] uvcvideo: - 1600x1200 (30.0 fps)
[ 3568.706143] uvcvideo: - 2048x1536 (30.0 fps)
[ 3568.706173] uvcvideo: - 2592x1944 (15.0 fps)
[ 3568.706203] uvcvideo: Found format YUV 4:2:2 (YUYV).
[ 3568.706236] uvcvideo: - 640x480 (30.0 fps)
[ 3568.706266] uvcvideo: - 1280x720 (10.0 fps)
[ 3568.706618] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.706727] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.706784] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.706866] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.707012] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.710199] uvcvideo: Found a Status endpoint (addr 83).
[ 3568.710252] uvcvideo: Found UVC 1.00 device USB Camera (1ad8:c38d)
[ 3568.711536] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/2 to device 1.6 entity 1
[ 3568.711600] uvcvideo: Adding mapping 'Exposure, Auto' to control 00000000-0000-0000-0000-000000000001/2.
[ 3568.711676] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/3 to device 1.6 entity 1
[ 3568.711719] uvcvideo: Adding mapping 'Exposure, Auto Priority' to control 00000000-0000-0000-0000-000000000001/3.
[ 3568.711773] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/4 to device 1.6 entity 1
[ 3568.711814] uvcvideo: Adding mapping 'Exposure (Absolute)' to control 00000000-0000-0000-0000-000000000001/4.
[ 3568.711868] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/6 to device 1.6 entity 1
[ 3568.712028] uvcvideo: Adding mapping 'Focus (absolute)' to control 00000000-0000-0000-0000-000000000001/6.
[ 3568.712086] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/11 to device 1.6 entity 1
[ 3568.712992] uvcvideo: Adding mapping 'Zoom, Absolute' to control 00000000-0000-0000-0000-000000000001/11.
[ 3568.713011] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/13 to device 1.6 entity 1
[ 3568.713025] uvcvideo: Adding mapping 'Pan (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3568.713033] uvcvideo: Adding mapping 'Tilt (Absolute)' to control 00000000-0000-0000-0000-000000000001/13.
[ 3568.713046] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/15 to device 1.6 entity 1
[ 3568.713060] uvcvideo: Added control 00000000-0000-0000-0000-000000000001/8 to device 1.6 entity 1
[ 3568.713069] uvcvideo: Adding mapping 'Focus, Auto' to control 00000000-0000-0000-0000-000000000001/8.
[ 3568.713081] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/2 to device 1.6 entity 2
[ 3568.713088] uvcvideo: Adding mapping 'Brightness' to control 00000000-0000-0000-0000-000000000101/2.
[ 3568.713099] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/3 to device 1.6 entity 2
[ 3568.713107] uvcvideo: Adding mapping 'Contrast' to control 00000000-0000-0000-0000-000000000101/3.
[ 3568.713117] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/6 to device 1.6 entity 2
[ 3568.713125] uvcvideo: Adding mapping 'Hue' to control 00000000-0000-0000-0000-000000000101/6.
[ 3568.713136] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/7 to device 1.6 entity 2
[ 3568.713144] uvcvideo: Adding mapping 'Saturation' to control 00000000-0000-0000-0000-000000000101/7.
[ 3568.713154] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/8 to device 1.6 entity 2
[ 3568.713163] uvcvideo: Adding mapping 'Sharpness' to control 00000000-0000-0000-0000-000000000101/8.
[ 3568.713173] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/9 to device 1.6 entity 2
[ 3568.713181] uvcvideo: Adding mapping 'Gamma' to control 00000000-0000-0000-0000-000000000101/9.
[ 3568.713192] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/10 to device 1.6 entity 2
[ 3568.713201] uvcvideo: Adding mapping 'White Balance Temperature' to control 00000000-0000-0000-0000-000000000101/10.
[ 3568.713211] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/1 to device 1.6 entity 2
[ 3568.713221] uvcvideo: Adding mapping 'Backlight Compensation' to control 00000000-0000-0000-0000-000000000101/1.
[ 3568.713232] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/5 to device 1.6 entity 2
[ 3568.713241] uvcvideo: Adding mapping 'Power Line Frequency' to control 00000000-0000-0000-0000-000000000101/5.
[ 3568.713252] uvcvideo: Added control 00000000-0000-0000-0000-000000000101/11 to device 1.6 entity 2
[ 3568.713261] uvcvideo: Adding mapping 'White Balance Temperature, Auto' to control 00000000-0000-0000-0000-000000000101/11.
[ 3568.713275] uvcvideo: Scanning UVC chain: OT 3 <- XU 6 <- XU 4 <- PU 2 <- IT 1
[ 3568.713301] uvcvideo: Found a valid video chain (1 -> 3).
[ 3568.727325] input: USB Camera as /devices/platform/ff540000.usb/usb1/1-1/1-1.6/1-1.6:1.0/input/input52
[ 3568.727726] uvcvideo: UVC device initialized.
[ 3568.727958] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.727984] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.727998] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.728010] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.728053] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.751742] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.751762] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.751773] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.751783] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.751826] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.752827] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.752853] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.752864] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.752874] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.752904] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.771200] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.771377] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.771394] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.771406] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.771448] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.794060] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.794079] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.794088] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.794096] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.794127] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.795978] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.795996] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.796006] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.796014] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.796046] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.849230] rockchip-pinctrl pinctrl: pin gpio6-8 already requested by 2-0010; cannot claim for 2-001c
[ 3568.849252] rockchip-pinctrl pinctrl: pin-192 (2-001c) status -22
[ 3568.849261] rockchip-pinctrl pinctrl: could not request pin 192 (gpio6-8) from group i2s0-mclk  on device rockchip-pinctrl
[ 3568.849269] rt5640 2-001c: Error applying setting, reverse things back
[ 3568.849299] of_get_named_gpiod_flags: can't parse 'realtek,ldo1-en-gpios' property of node '/i2c@ff660000/rt5640@1c[0]'
[ 3568.924253] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924284] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924330] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924352] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924391] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924410] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924452] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924470] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924506] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924528] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924566] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924583] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924617] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924633] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924666] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924683] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924716] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924736] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924769] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924786] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924819] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924835] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924868] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924885] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924916] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924936] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.924969] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.924986] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925018] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925034] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925066] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925083] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925117] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925136] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925173] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925189] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925255] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925272] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925306] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925320] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925346] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925358] usb 1-1.6: usbfs: usb_submit_urb returned -28
[ 3568.925383] dwc2 ff540000.usb: DWC OTG HCD URB Enqueue failed adding QTD. Error status -28
[ 3568.925392] usb 1-1.6: usbfs: usb_submit_urb returned -28

```




