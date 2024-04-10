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

## 调试

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





