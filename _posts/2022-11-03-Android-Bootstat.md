---
layout:     post
title:      Android Bootstat
subtitle:   Android 启动原因
date:       2022-11-03
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - Android
---

[规范化启动原因](https://source.android.google.cn/docs/core/architecture/bootloader/boot-reason?hl=zh-cn)

## 启动原因

引导加载程序使用专用的硬件和内存资源来确定设备重新启动的原因，然后将 androidboot.bootreason=<reason> 添加到用于启动设备的 Android 内核命令行中，以传达这一判定。然后，init 会转换此命令行，使其传播到 Android 属性 bootloader_boot_reason_prop (ro.boot.bootreason) 中。对于发布时搭载 Android 12 或更高版本（内核版本为 5.10 或更高版本）的设备中，androidboot.bootreason=<reason> 添加到了 bootconfig，而非内核命令行中

## 启动原因规范

**Android 9 之前**

**Android 9 及之后**

## 源码

system/core/bootstat

```c

const std::map<std::string, int32_t> kBootReasonMap = {
    {"reboot,[empty]", kEmptyBootReason},
    {"__BOOTSTAT_UNKNOWN__", kUnknownBootReason},
    {"normal", 2},
    {"recovery", 3},
    {"reboot", 4},
    {"PowerKey", 5},
    {"hard_reset", 6},
    {"kernel_panic", 7},
    {"rpm_err", 8},
    {"hw_reset", 9},
    {"tz_err", 10},
    {"adsp_err", 11},
    {"modem_err", 12},
    {"mba_err", 13},
    {"Watchdog", 14},
    {"Panic", 15},
    {"power_key", 16},
    {"power_on", 17},
    {"Reboot", 18},
    {"rtc", 19},
    {"edl", 20},
    {"oem_pon1", 21},
    {"oem_powerkey", 22},
    {"oem_unknown_reset", 23},
    {"srto: HWWDT reset SC", 24},
    {"srto: HWWDT reset platform", 25},
    {"srto: bootloader", 26},
    {"srto: kernel panic", 27},
    {"srto: kernel watchdog reset", 28},
    {"srto: normal", 29},
    {"srto: reboot", 30},
    {"srto: reboot-bootloader", 31},
    {"srto: security watchdog reset", 32},
    {"srto: wakesrc", 33},
    {"srto: watchdog", 34},
    {"srto:1-1", 35},
    {"srto:omap_hsmm", 36},
    {"srto:phy0", 37},
    {"srto:rtc0", 38},
    {"srto:touchpad", 39},
    {"watchdog", 40},
    {"watchdogr", 41},
    {"wdog_bark", 42},
    {"wdog_bite", 43},
    {"wdog_reset", 44},
    {"shutdown,", 45},  // Trailing comma is intentional. Do NOT use.
    {"shutdown,userrequested", 46},
    {"reboot,bootloader", 47},
    {"reboot,cold", 48},
    {"reboot,recovery", 49},
    {"thermal_shutdown", 50},
    {"s3_wakeup", 51},
    {"kernel_panic,sysrq", 52},
    {"kernel_panic,NULL", 53},
    {"kernel_panic,null", 53},
    {"kernel_panic,BUG", 54},
    {"kernel_panic,bug", 54},
    {"bootloader", 55},
    {"cold", 56},
    {"hard", 57},
    {"warm", 58},
    {"reboot,kernel_power_off_charging__reboot_system", 59},  // Can not happen
    {"thermal-shutdown", 60},
    {"shutdown,thermal", 61},
    {"shutdown,battery", 62},
    {"reboot,ota", 63},
    {"reboot,factory_reset", 64},
    {"reboot,", 65},
    {"reboot,shell", 66},
    {"reboot,adb", 67},
    {"reboot,userrequested", 68},
    {"shutdown,container", 69},  // Host OS asking Android Container to shutdown
    {"cold,powerkey", 70},
    {"warm,s3_wakeup", 71},
    {"hard,hw_reset", 72},
    {"shutdown,suspend", 73},    // Suspend to RAM
    {"shutdown,hibernate", 74},  // Suspend to DISK
    {"power_on_key", 75},
    {"reboot_by_key", 76},
    {"wdt_by_pass_pwk", 77},
    {"reboot_longkey", 78},
    {"powerkey", 79},
    {"usb", 80},
    {"wdt", 81},
    {"tool_by_pass_pwk", 82},
    {"2sec_reboot", 83},
    {"reboot,by_key", 84},
    {"reboot,longkey", 85},
    {"reboot,2sec", 86},  // Deprecate in two years, replaced with cold,rtc,2sec
    {"shutdown,thermal,battery", 87},
    {"reboot,its_just_so_hard", 88},  // produced by boot_reason_test
    {"reboot,Its Just So Hard", 89},  // produced by boot_reason_test
    {"reboot,rescueparty", 90},
    {"charge", 91},
    {"oem_tz_crash", 92},
    {"uvlo", 93},  // aliasReasons converts to reboot,undervoltage
    {"oem_ps_hold", 94},
    {"abnormal_reset", 95},
    {"oemerr_unknown", 96},
    {"reboot_fastboot_mode", 97},
    {"watchdog_apps_bite", 98},
    {"xpu_err", 99},
    {"power_on_usb", 100},
    {"watchdog_rpm", 101},
    {"watchdog_nonsec", 102},
    {"watchdog_apps_bark", 103},
    {"reboot_dmverity_corrupted", 104},
    {"reboot_smpl", 105},  // aliasReasons converts to reboot,powerloss
    {"watchdog_sdi_apps_reset", 106},
    {"smpl", 107},  // aliasReasons converts to reboot,powerloss
    {"oem_modem_failed_to_powerup", 108},
    {"reboot_normal", 109},
    {"oem_lpass_cfg", 110},
    {"oem_xpu_ns_error", 111},
    {"power_key_press", 112},
    {"hardware_reset", 113},
    {"reboot_by_powerkey", 114},
    {"reboot_verity", 115},
    {"oem_rpm_undef_error", 116},
    {"oem_crash_on_the_lk", 117},
    {"oem_rpm_reset", 118},
    {"reboot,powerloss", 119},
    {"reboot,undervoltage", 120},
    {"factory_cable", 121},
    {"oem_ar6320_failed_to_powerup", 122},
    {"watchdog_rpm_bite", 123},
    {"power_on_cable", 124},
    {"reboot_unknown", 125},
    {"wireless_charger", 126},
    {"0x776655ff", 127},
    {"oem_thermal_bite_reset", 128},
    {"charger", 129},
    {"pon1", 130},
    {"unknown", 131},
    {"reboot_rtc", 132},
    {"cold_boot", 133},
    {"hard_rst", 134},
    {"power-on", 135},
    {"oem_adsp_resetting_the_soc", 136},
    {"kpdpwr", 137},
    {"oem_modem_timeout_waiting", 138},
    {"usb_chg", 139},
    {"warm_reset_0x02", 140},
    {"warm_reset_0x80", 141},
    {"pon_reason_0xb0", 142},
    {"reboot_download", 143},
    {"reboot_recovery_mode", 144},
    {"oem_sdi_err_fatal", 145},
    {"pmic_watchdog", 146},
    {"software_master", 147},
    {"cold,charger", 148},
    {"cold,rtc", 149},
    {"cold,rtc,2sec", 150},
    {"reboot,tool", 151},
    {"reboot,wdt", 152},
    {"reboot,unknown", 153},
    {"kernel_panic,audit", 154},
    {"kernel_panic,atomic", 155},
    {"kernel_panic,hung", 156},
    {"kernel_panic,hung,rcu", 157},
    {"kernel_panic,init", 158},
    {"kernel_panic,oom", 159},
    {"kernel_panic,stack", 160},
    {"kernel_panic,sysrq,livelock,alarm", 161},   // llkd
    {"kernel_panic,sysrq,livelock,driver", 162},  // llkd
    {"kernel_panic,sysrq,livelock,zombie", 163},  // llkd
    {"kernel_panic,modem", 164},
    {"kernel_panic,adsp", 165},
    {"kernel_panic,dsps", 166},
    {"kernel_panic,wcnss", 167},
    {"kernel_panic,_sde_encoder_phys_cmd_handle_ppdone_timeout", 168},
    {"recovery,quiescent", 169},
    {"reboot,quiescent", 170},
    {"reboot,rtc", 171},
    {"reboot,dm-verity_device_corrupted", 172},
    {"reboot,dm-verity_enforcing", 173},
    {"reboot,keys_clear", 174},
    {"reboot,pmic_off_fault,.*", 175},
    {"reboot,pmic_off_s3rst,.*", 176},
    {"reboot,pmic_off_other,.*", 177},
};

```


