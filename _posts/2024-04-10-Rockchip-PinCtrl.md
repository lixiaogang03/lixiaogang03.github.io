---
layout:     post
title:      Rockchip PinCtrl
subtitle:   Rockchip-Developer-Guide-Linux-Pin-Ctrl-CN.pdf
date:       2024-04-10
author:     LXG
header-img: img/post-bg-electronics.jpg
catalog: true
tags:
    - rockchip
---

## 代码调试

android/kernel/drivers/pinctrl/pinctrl-rockchip.c

```c

static int rockchip_set_mux(struct rockchip_pin_bank *bank, int pin, int mux)
{

	struct rockchip_pinctrl *info = bank->drvdata;
	int iomux_num = (pin / 8);
	struct regmap *regmap;
	int reg, ret, mask, mux_type;
	u8 bit;
	u32 data, rmask, route_location, route_reg, route_val;

	ret = rockchip_verify_mux(bank, pin, mux);
	if (ret < 0)
		return ret;

	if (bank->iomux[iomux_num].type & IOMUX_GPIO_ONLY)
		return 0;

	dev_warn(info->dev, "---------------setting mux of GPIO%d-%d to %d\n",
						bank->bank_num, pin, mux);
        // 调试日志
        if ((bank->bank_num == 0) && (pin == 9)) {
             dev_warn(info->dev, "------------------setting mux of GPIO%d-%d to %d\n", bank->bank_num, pin, mux);
             dump_stack();
        }

	if (bank->iomux[iomux_num].type & IOMUX_SOURCE_PMU)
		regmap = info->regmap_pmu;
	else if (bank->iomux[iomux_num].type & IOMUX_L_SOURCE_PMU)
		regmap = (pin % 8 < 4) ? info->regmap_pmu : info->regmap_base;
	else
		regmap = info->regmap_base;

	//------------------------------------------------------------------

}

```

## 命令调试

sys/kernel/debug/pinctrl/

pinctrl-devices  pinctrl-handles  pinctrl-maps  pinctrl-rockchip-pinctrl

**pinctrl-devices**

这个目录包含了系统中所有已注册的pinctrl设备信息。pinctrl设备通常对应着硬件上的pin控制器，用于管理各个GPIO引脚的复用功能（muxing）以及配置上拉/下拉电阻、驱动强度等属性。

```txt

rk3399_Android11:/ $ cat sys/kernel/debug/pinctrl/pinctrl-devices                                                                                                                                                               
name [pinmux] [pinconf]
rockchip-pinctrl yes yes

```

**pinctrl-handles**

这个目录展示了当前系统中定义的所有pinmux handle（处理程序）的详细信息。pinmux handle是一种抽象概念，通常代表了一组特定的pinmux配置，比如“enable UART mode”，“enable I2C mode”等。


```txt

rk3399_Android11:/ $ cat sys/kernel/debug/pinctrl/pinctrl-handles                                                                                                                                                               
Requested pin control handlers their pinmux maps:

device: wireless-bluetooth current state: default
  state: default
    type: MUX_GROUP controller rockchip-pinctrl group: uart0-rts (69) function: uart0 (26)
    type: CONFIGS_PIN controller rockchip-pinctrl pin gpio2-19 (83)config 00000001
    type: MUX_GROUP controller rockchip-pinctrl group: bt-reset (96) function: wireless-bluetooth (42)
    type: CONFIGS_PIN controller rockchip-pinctrl pin gpio0-9 (9)config 00000001
  state: rts_gpio
    type: MUX_GROUP controller rockchip-pinctrl group: uart0-gpios (97) function: wireless-bluetooth (42)
    type: CONFIGS_PIN controller rockchip-pinctrl pin gpio2-19 (83)config 00000001
device: gpio-keys current state: default
  state: default
    type: MUX_GROUP controller rockchip-pinctrl group: pwrbtn (119) function: buttons (56)
    type: CONFIGS_PIN controller rockchip-pinctrl pin gpio0-5 (5)config 00000105

```

**pinctrl-maps**

这个目录包含了系统中定义的所有pinmux映射表，这些映射表关联了设备名称与pinmux handle。当系统启动时，或者在运行时需要切换设备的pinmux配置时，就会根据这些映射表进行查找和设置。

```txt

device wireless-bluetooth
state default
type MUX_GROUP (2)
controlling device pinctrl
group uart0-rts
function uart0

device wireless-bluetooth
state default
type CONFIGS_PIN (3)
controlling device pinctrl
pin gpio2-19
config 00000001

device wireless-bluetooth
state default
type MUX_GROUP (2)
controlling device pinctrl
group bt-reset
function wireless-bluetooth

device wireless-bluetooth
state default
type CONFIGS_PIN (3)
controlling device pinctrl
pin gpio0-9
config 00000001

device wireless-bluetooth
state rts_gpio
type MUX_GROUP (2)
controlling device pinctrl
group uart0-gpios
function wireless-bluetooth

device wireless-bluetooth
state rts_gpio
type CONFIGS_PIN (3)
controlling device pinctrl
pin gpio2-19
config 00000001


```

## pinctrl-rockchip-pinctrl

这个目录专用于Rockchip RK3399平台的pinctrl控制器，其中包含了该平台特有的GPIO和pinmux控制信息。通过查看和操作这个目录下的文件，可以获取和修改RK3399上各个GPIO引脚的复用状态和配置。

gpio-ranges  pinconf-config  pinconf-groups  pinconf-pins  pingroups  pinmux-functions  pinmux-pins  pins


**gpio-ranges**

RK3399平台上GPIO控制器的引脚编号范围，以及它们与GPIO控制器内部寄存器偏移量的关系

```txt

rk3399_Android11:/sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl # cat gpio-ranges
GPIO ranges handled:
0: gpio0 GPIOS [0 - 31] PINS [0 - 31]
0: gpio1 GPIOS [32 - 63] PINS [32 - 63]
0: gpio2 GPIOS [64 - 95] PINS [64 - 95]
0: gpio3 GPIOS [96 - 127] PINS [96 - 127]
0: gpio4 GPIOS [128 - 159] PINS [128 - 159]

```

**pinconf-config**

包含了关于GPIO引脚配置的全局设置，例如上拉、下拉、开漏输出等属性， 这是个可执行文件，需要参数

```txt

rk3399_Android11:/sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl $ cat pinconf-config
No config found for dev/state/pin, expected:
Searched dev:
Searched state:
Searched pin:
Use: modify config_pin <devname> <state> <pinname> <value>

```

**pinconf-groups**

列出了系统中定义的pin配置组，这些组可能包含了多个具有相同配置属性的GPIO引脚。

```txt

rk3399_Android11:/sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl $ cat pinconf-groups                                                                                                                                        
Pin config settings per pin group
Format: group (name): configs
0 (clk-32k): 
1 (edp-hpd): 
2 (rgmii-pins): 
3 (rmii-pins): 

----------------

95 (wifi-enable-h): 
96 (bt-reset): 
97 (uart0-gpios): 

-----------------

```

**pinconf-pins**

提供了对单个GPIO引脚进行配置的能力，通过这个文件可以查看和修改每个GPIO引脚的具体配置

```txt

pin 0 (gpio0-0): input bias pull up, output drive strength (5 mA)
pin 1 (gpio0-1): input bias pull up, output drive strength (5 mA), pin output (1 level)
pin 2 (gpio0-2): input bias pull down, output drive strength (5 mA), pin output (1 level)
pin 3 (gpio0-3): input bias pull down, output drive strength (5 mA)
pin 4 (gpio0-4): input bias pull down, output drive strength (5 mA)
pin 5 (gpio0-5): input bias pull up, output drive strength (5 mA)
pin 6 (gpio0-6): input bias pull down, output drive strength (5 mA)
pin 7 (gpio0-7): input bias pull up, output drive strength (5 mA)
pin 8 (gpio0-8): input bias pull up, output drive strength (5 mA), pin output (1 level)
pin 9 (gpio0-9): input bias disabled, output drive strength (5 mA), pin output (1 level)

---------------------------------------------------------------------------------------

```

**pingroups**

定义了各个GPIO组，这些组由多个GPIO引脚组成，用于实现特定的功能或硬件接口

```txt

group: wifi-enable-h
pin 10 (gpio0-10)

group: bt-reset
pin 9 (gpio0-9)

```

**pinmux-functions**

列出了系统支持的所有pinmux功能，也就是GPIO引脚可以复用为的多种硬件接口功能，如UART、I2C、SPI等。

```txt

rk3399_Android11:/sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl # cat pinmux-functions

function: sdio-pwrseq, groups = [ wifi-enable-h ]
function: wireless-bluetooth, groups = [ bt-reset uart0-gpios ]

```

**pinmux-pins**

显示了每个GPIO引脚当前被配置为哪个pinmux功能，以及相关的配置细节

```txt

pin 8 (gpio0-8): (MUX UNCLAIMED) (GPIO UNCLAIMED)
pin 9 (gpio0-9): wireless-bluetooth gpio0:9 function wireless-bluetooth group bt-reset
pin 10 (gpio0-10): sdio-pwrseq gpio0:10 function sdio-pwrseq group wifi-enable-h

```

**pins**

```txt

rk3399_Android11:/sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl $ cat pins                                                                                                                                                  
registered pins: 160
pin 0 (gpio0-0) 
pin 1 (gpio0-1) 
pin 2 (gpio0-2) 
pin 3 (gpio0-3) 
pin 4 (gpio0-4) 
pin 5 (gpio0-5) 
pin 6 (gpio0-6) 
pin 7 (gpio0-7) 
pin 8 (gpio0-8) 
pin 9 (gpio0-9) 
pin 10 (gpio0-10) 
pin 11 (gpio0-11) 
pin 12 (gpio0-12) 
pin 13 (gpio0-13) 
pin 14 (gpio0-14) 
pin 15 (gpio0-15) 
pin 16 (gpio0-16) 
pin 17 (gpio0-17) 
pin 18 (gpio0-18) 
pin 19 (gpio0-19) 
pin 20 (gpio0-20) 
pin 21 (gpio0-21) 
pin 22 (gpio0-22) 
pin 23 (gpio0-23) 
pin 24 (gpio0-24) 
pin 25 (gpio0-25) 
pin 26 (gpio0-26) 
pin 27 (gpio0-27) 
pin 28 (gpio0-28) 
pin 29 (gpio0-29) 
pin 30 (gpio0-30) 
pin 31 (gpio0-31) 
pin 32 (gpio1-0) 
pin 33 (gpio1-1) 
pin 34 (gpio1-2) 
pin 35 (gpio1-3) 
pin 36 (gpio1-4) 
pin 37 (gpio1-5) 
pin 38 (gpio1-6) 
pin 39 (gpio1-7) 
pin 40 (gpio1-8) 
pin 41 (gpio1-9) 
pin 42 (gpio1-10) 
pin 43 (gpio1-11) 
pin 44 (gpio1-12) 

-----------------

```

## DTS

/kernel/arch/arm64/boot/dts/rockchip/rk3399-evb.

```c

{

	wireless-wlan {
		compatible = "wlan-platdata";
		rockchip,grf = <&grf>;
		wifi_chip_type = "rtl8821cs";
		sdio_vref = <1800>;
		WIFI,host_wake_irq = <&gpio0 3 GPIO_ACTIVE_HIGH>; /* GPIO0_a3 */
		status = "okay";
	};

	wireless-bluetooth {
		compatible = "bluetooth-platdata";
		clocks = <&rk808 1>;
		clock-names = "ext_clock";
		//wifi-bt-power-toggle;
		uart_rts_gpios = <&gpio2 19 GPIO_ACTIVE_LOW>; /* GPIO2_C3 */
		pinctrl-names = "default", "rts_gpio";
		pinctrl-0 = <&uart0_rts &bt_reset>;
		pinctrl-1 = <&uart0_gpios>;
		//BT,power_gpio  = <&gpio3 19 GPIO_ACTIVE_HIGH>; /* GPIOx_xx */
		BT,reset_gpio    = <&gpio0 9 GPIO_ACTIVE_HIGH>; /* GPIO0_B1 */
		BT,wake_gpio     = <&gpio2 27 GPIO_ACTIVE_HIGH>; /* GPIO2_D3 BT_WAKE */
		BT,wake_host_irq = <&gpio0 4 GPIO_ACTIVE_HIGH>; /* GPIO0_A4 */
		status = "okay";
	};
	
}

&pinctrl {
	sdio-pwrseq {
		wifi_enable_h: wifi-enable-h {
			rockchip,pins = <0 RK_PB2 RK_FUNC_GPIO &pcfg_pull_none>;
		};
	};

	wireless-bluetooth {
		bt_reset: bt-reset{
			rockchip,pins = <0 RK_PB1 RK_FUNC_GPIO &pcfg_pull_none>;
		};
		uart0_gpios: uart0-gpios {
			rockchip,pins = <2 RK_PC3 RK_FUNC_GPIO &pcfg_pull_none>;
		};
	};
}


```

















