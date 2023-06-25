---
layout:     post
title:      全志sys_config
subtitle:   CPU DDR EMMC
date:       2023-06-25
author:     LXG
header-img: img/post-bg-ioses.jpg
catalog: true
tags:
    - hardware
---

## 全志量产工具列表


|       工具           |  功能    |
|       :----:         |  :----:  |
| PhoenixCard          | 用于将待量产的固件通过SD卡读卡器写入SD卡中  |
| TigerPQ              | 一款可以在线实时调试TV屏显的工具，支持调试DCI/SSR/NR/BE/GAMMA等模块  |
| TigerLCD             | 用于在线调试LCD屏幕参数，支持Gamma、Sharpness及Color Matrix等模块的详细功能参数快速调节及在线读写设备参数 |
| Livecom              | 工具可以通过串口来烧写MAC、SN等  |
| TigerDebug           | 是一个用于诊断和调参的可视化PC端工具可扩展框架 |
| DragonMAT            | 工厂板卡测试系统PC端工具，支持adb，tcpip方式，目前支持Tina系统设备和vr9平台设备，需要与设备端配合工作，默认为Tina配置 |
| TigerDump            | 是一款专门对设备进行Dump的工具，包括Dump Flash和Dump DDR两大功能 |
| DragonFace           | 固件修改工具（DragonFace）是一个高效的固件修改——功能强大、所见即所得、操作便易的工具 |
| TigerCatcher         | 一款全志设备调试日志抓取工具，通过该软件可快速的抓取Android与系统日志（包括bugreport、anr等）|
| PhoenixSuit          | 全志固件升级工具，支持所有全志平台的固件烧写升级，支持烧写单个分区 |
| DragonURKP           | 全志基于Google提供的RKP提取与上传指导建议开发了一款RKP上传工具DragonURKP，便于用户将RKP上传至Google服务器 |
| DragonSN             | DragonSN烧号工具适用于烧写如SN，MAC地址等一些常用标识串，支持全平台，默认配置扫描方式的SN |
| TigerISP             | 一款专门用于全志专业图像质量调试的工具，可以通过局域网络连接单板在线调试ISP各个模块的参数，使用标定分析工具进行各类数据分析，使用rtsp工具试试预览图像效果等 |
| PhoenixUSBPro        | 多路固件下载工具，支持所有平台，支持最多8台设备同时烧录 |
| PhoenixWipe          | KEY擦除工具，可清除由DragonSN烧写的key |
| DragonHD             | 提供一种无需下载固件，即可快速对硬件进行检测、诊断的工具手段 |
| TigerAACT            | 全志音频调试工具，支持在线调试基于全志解决方案的EQ及DRC模块，同时支持离线导入导出配置文件 |
| TigerDOS             | DOS是一款设备远程在线调试系统，支持线上调试设备（adb调试&串口调试&IP+Port调试（比如ISP在线调试）），通过线上调试解决全志客户问题 |
| LcdTool              | C800 lcd调屏工具是一个在线调试实时看到显示效果的pc端工具。通过PC端填入合适的屏参，然后通过USB把参数写入到设备端，并且可以将参数保存成文件 |
| debugview            | pc端日志抓取工具dbgview，双击目录下的dbgview.exe打开即可以抓工具的打印日志  |
| PhoenixSuit_MacOS    | Mac系统烧录工具 |
| LiveSuit_Linux       | Linux系统烧录工具 |
| usbdriver            | 全志USB烧录驱动 |
| PhoenixSuit_Linux    | Linux系统烧录工具命令行版本 |

## DragonHD

【FAQ575】 如何使用DragonHD进行DDR全盘扫描

项目开发或者量产之后，概率的存在设备启动失败或启动过程崩溃等不同的现象，出现设备启动、运行过程崩溃的问题，都会怀疑一下DRAM是否存在虚焊、异常等问题，需要先行排除DDR的问题，但异常设备软件系统一般无法通过运行memtester测试DDR（或无法对DDR的所有空间进行扫描），这时需要依赖外部工具进行测试，而DragonHD则是可以摆脱对软件系统的依赖，直接进行进行DDR全盘扫描，避免遗漏。

## sys_config.fex

longan/device/config/chips/a133/configs/c3/sys_config.fex

## system

```c

;sunxi platform application
;---------------------------------------------------------------------------------------------------------
; 说明： 脚本中的字符串区分大小写，用户可以修改"="后面的数值，但是不要修改前面的字符串
; 描述gpio的形式：Port:端口+组内序号<功能分配><内部电阻状态><驱动能力><输出电平状态>
;---------------------------------------------------------------------------------------------------------

[product]
version = "100"            // sdk 版本号
machine = "evb"            // sdk 代号

[platform]
eraseflag   = 1            // 量产时是否擦除
next_work   = 3            // USB 量产完成后状态
debug_mode  = 3            // uboot 打印等级

;----------------------------------------------------------------------------------
;[target]  system bootup configuration
;boot_clock	= CPU boot frequency, Unit: MHz
;storage_type	= boot medium, 0-nand, 1-card0, 2-card2, -1(defualt)auto scan
;burn_key  1:support burn key; 0:not support burn key
;dragonboard_test 1:support card boot dragonboard; 0:not support card boot dragonboard
;power_mode	= axp_type,   0:axp81X, 1:dummy, 2:axp806, 3:axp2202, 4:axp858
;----------------------------------------------------------------------------------
[target]
boot_clock       = 1008          // 启动频率，单位：MHz
storage_type     = -1            // 启动介质选择 0 ：nand, 1：card0,2：card2, -1（defualt）:auto scan
burn_key         = 1             // 启动时是否需要烧 key 0：不烧 1：烧
dragonboard_test = 0             // 是否编译支持卡启动的 dragonboard 固件。1：是 0：否
power_mode      = 0              // 电源管理芯片

;----------------------------------------------------------------------------------
;   system configuration
;   ?
;dcdc1_vol							---set dcdc1 voltage,mV,500-1200,10mV/step
;											1220-3400,20mV/step
;dcdc2_vol							---set dcdc2 voltage,mV,500-1200,10mV/step
;											1220-1540,20mV/step
;aldo1_vol							---set aldo1 voltage,mV,500-3500,100mV/step
;dldo1_vol							---set dldo1 voltage,mV,500-3500,100mV/step
;dcdcX_mode							---set dcdc mode,  0:pfm-pwm   1:force pwm
;----------------------------------------------------------------------------------
[power_sply]
dcdc1_vol                  = 1003300
aldo1_vol                  = 1001800
aldo2_vol                  = 1001800
aldo3_vol                  = 1003300
dldo1_vol                  = 1003300          // PMIC 初始电压
dldo2_vol                  = 1001800
dldo3_vol                  = 1001800
dldo4_vol                  = 1001800
eldo1_vol                  = 1001800
eldo2_vol                  = 1001800
eldo3_vol                  = 1001800
fldo1_vol                  = 100900
dc1sw_vol                  = 1003300
dcdc5_mode                 = 0
dcdc2_mode                 = 0
dcdc3_mode                 = 0
battery_exist              = 0                // 是否支持电池

[card_boot]
logical_start   = 40960                              // 启动卡逻辑起始扇区
sprite_gpio0    = port:PH6<1><default><default><1>    // 卡量产，一键 recovery led 指示灯 GPIO 配置

;----------------------------------------------------------------------------------
;fastboot key
;----------------------------------------------------------------------------------
[fastboot_key]
key_max         = 0x2a
key_min         = 0x28

;----------------------------------------------------------------------------------
;recovery key
;----------------------------------------------------------------------------------
[recovery_key]
key_max         = 0x1f
key_min         = 0x1c

;---------------------------------------------------------------------------------------------------------
; if 1 == standby_mode, then support super standby;
; else, support normal standby.
;---------------------------------------------------------------------------------------------------------
[pm_para]
standby_mode		= 1

[card0_boot_para]
card_ctrl       = 0
card_high_speed = 1
card_line       = 4                             // 4：4 线卡，8：8 线卡
sdc_d1          = port:PF0<2><1><3><default>
sdc_d0          = port:PF1<2><1><3><default>
sdc_clk         = port:PF2<2><1><3><default>
sdc_cmd         = port:PF3<2><1><3><default>
sdc_d3          = port:PF4<2><1><3><default>
sdc_d2          = port:PF5<2><1><3><default>
;sdc_type	= "tm1"

[card2_boot_para]
card_ctrl       = 2
card_high_speed = 1
card_line       = 8
sdc_clk         = port:PC5<3><1><3><default>
sdc_cmd         = port:PC6<3><1><3><default>
sdc_d0          = port:PC10<3><1><3><default>
sdc_d1          = port:PC13<3><1><3><default>
sdc_d2          = port:PC15<3><1><3><default>
sdc_d3          = port:PC8<3><1><3><default>
sdc_d4          = port:PC9<3><1><3><default>
sdc_d5          = port:PC11<3><1><3><default>
sdc_d6          = port:PC14<3><1><3><default>
sdc_d7          = port:PC16<3><1><3><default>
sdc_emmc_rst    = port:PC1<3><1><3><default>
sdc_ds          = port:PC0<3><2><3><default>
sdc_tm4_hs200_max_freq = 150
sdc_tm4_hs400_max_freq = 100
sdc_ex_dly_used = 2
sdc_io_1v8	= 1
sdc_tm4_win_th = 8
;sdc_dis_host_caps = 0x100
;sdc_erase	= 2
;sdc_boot0_sup_1v8 = 1
;sdc_type	= "tm4"

[gpio_bias]
pc_bias		= 1800               // emmc 电压配置，高速 emmc 才使用
;pl_bias		= 1800

[auto_print]
auto_print_used = 1

[uart_para]
uart_debug_port = 0                                           // Boot 串口控制器编号， 调试串口编号
uart_debug_tx   = port:PB09<2><1><default><default>
uart_debug_rx   = port:PB10<2><1><default><default>

[jtag_para]
jtag_enable     = 1
jtag_ms         = port:PH9<3><default><default><default>
jtag_ck         = port:PH10<3><default><default><default>
jtag_do         = port:PH11<3><default><default><default>
jtag_di         = port:PH12<3><default><default><default>

[clock]
pll4            = 300
pll6            = 600
pll8            = 360
pll9            = 297
pll10           = 264

```

## DRAM 配置

```c

;*****************************************************************************
;
;dram select configuration
;
;select_mode	:	dram模式选择,	0:不进行自动识别
;					1:gpio识别模式(dram_para, dram_para1-15, 共16组有效)
;					2:gpadc识别模式(dram_para, dram_para1-7, 共8组有效)
;					3:1个IO+gpadc识别模式(dram_para, dram_para1-15, 共16组有效)。其中IO配置优先级按select_gpio0>select_gpio1>select_gpio2>select_gpio3
;gpadc_channel	:	选择gpadc通道	有效值(0-3)
;select_gpio1-4	:	选择gpio pin
;*****************************************************************************


[dram_select_para]
select_mode	= 0
gpadc_channel	= 1
select_gpio0	= port:PB7<0><1><default><default>
select_gpio1	= port:PB4<0><1><default><default>
select_gpio2	= port:PH1<0><1><default><default>
select_gpio3	= port:PH0<0><1><default><default>


;*****************************************************************************
;sdram configuration
;
;*****************************************************************************
[dram_para]

dram_clk       = 792                 // DRAM 的时钟频率，单位为 MHz
dram_type      = 8                   // DRAM 类型：8 为 LPDDR4 , 由源厂调节，请勿修改
dram_dx_odt    = 0x07070707
dram_dx_dri    = 0x0d0d0d0d
dram_ca_dri    = 0x0e0e
dram_para0     = 0x0d0a050c
dram_para1     = 0x30ea
dram_para2     = 0x1000
dram_mr0       = 0x0
dram_mr1       = 0x34
dram_mr2       = 0x1b
dram_mr3       = 0x33
dram_mr4       = 0x3
dram_mr5       = 0x0
dram_mr6       = 0x0
dram_mr11      = 0x04
dram_mr12      = 0x72
dram_mr13      = 0x0
dram_mr14      = 0x7
dram_mr16      = 0x0
dram_mr17      = 0x0
dram_mr22      = 0x26
dram_tpr0      = 0x06060606
dram_tpr1      = 0x04040404
dram_tpr2      = 0x0
dram_tpr3      = 0x0
dram_tpr6      = 0x48010101
dram_tpr10     = 0x00273333
dram_tpr11     = 0x241f1923
dram_tpr12     = 0x14151313
dram_tpr13     = 0x81d20
dram_tpr14     = 0x2023211f

```

## UART

```c

;----------------------------------------------------------------------------------
;os life cycle para configuration
;----------------------------------------------------------------------------------

;----------------------------------------------------------------------------------
;uart configuration
;uart_type ---  2 (2 wire), 4 (4 wire), 8 (8 wire, full function)
;----------------------------------------------------------------------------------
[uart0]
uart0_used       = 1            // UART 使用控制：1 使用，0 不用
uart0_port       = 0            // UART 端口号
uart0_type       = 2            // 2：2 线模式;4：4 线模式;8：8 线模式
uart0_tx         = port:PB09<2><1><default><default>              // UART TX 的 GPIO 配置
uart0_rx         = port:PB10<2><1><default><default>

```





















