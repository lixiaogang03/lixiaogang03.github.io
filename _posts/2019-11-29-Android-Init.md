---
layout:     post
title:      Android init
subtitle:   init 进程
date:       2019-11-29
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - init
---

## 参考链接

[Android 操作系统架构开篇](http://gityuan.com/android/)

[Android 9.0 init-简书](https://www.jianshu.com/p/77363ef7ca7d)

## Android 架构图-Gityuan

![android-stack](/images/init/android-stack.png)

## Android 启动架构图-Gityuan

![android-boot](/images/init/android-boot.jpg)

## init 进程

init进程是Linux系统中用户空间的第一个进程，进程号固定为1。Kernel启动后，在用户空间启动init进程，并调用init中的main()方法执行init进程的职责。对于init进程的功能分为4部分：

* 解析并运行所有的init.rc相关文件
* 根据rc文件，生成相应的设备驱动节点
* 处理子进程的终止(signal方式)
* 提供属性服务的功能

### 代码

[system/core/init/init.cpp](http://androidxref.com/7.1.2_r36/xref/system/core/init/init.cpp)

```cpp

int main(int argc, char** argv) {
    if (!strcmp(basename(argv[0]), "ueventd")) {
        return ueventd_main(argc, argv);
    }

    if (!strcmp(basename(argv[0]), "watchdogd")) {
        return watchdogd_main(argc, argv);
    }

    //设置文件属性0777
    // Clear the umask.
    umask(0);

    add_environment("PATH", _PATH_DEFPATH);

    bool is_first_stage = (argc == 1) || (strcmp(argv[1], "--second-stage") != 0);

    // Get the basic filesystem setup we need put together in the initramdisk
    // on / and then we'll let the rc file figure out the rest.
    if (is_first_stage) {
        mount("tmpfs", "/dev", "tmpfs", MS_NOSUID, "mode=0755");
        mkdir("/dev/pts", 0755);
        mkdir("/dev/socket", 0755);
        mount("devpts", "/dev/pts", "devpts", 0, NULL);
        #define MAKE_STR(x) __STRING(x)
        mount("proc", "/proc", "proc", 0, "hidepid=2,gid=" MAKE_STR(AID_READPROC));
        mount("sysfs", "/sys", "sysfs", 0, NULL);
    }

    // We must have some place other than / to create the device nodes for
    // kmsg and null, otherwise we won't be able to remount / read-only
    // later on. Now that tmpfs is mounted on /dev, we can actually talk
    // to the outside world.
    open_devnull_stdio();

    // 初始化内核log，位于节点/dev/kmsg
    klog_init();
    // 设置输出的log级别
    klog_set_level(KLOG_NOTICE_LEVEL);

    NOTICE("init %s started!\n", is_first_stage ? "first stage" : "second stage");

    if (!is_first_stage) {
        // Indicate that booting is in progress to background fw loaders, etc.
        close(open("/dev/.booting", O_WRONLY | O_CREAT | O_CLOEXEC, 0000));

        // 创建一块共享的内存空间，用于属性服务
        property_init();

        // If arguments are passed both on the command line and in DT,
        // properties set in DT always have priority over the command-line ones.
        process_kernel_dt();
        process_kernel_cmdline();

        // Propagate the kernel variables to internal variables
        // used by init as well as the current required properties.
        export_kernel_boot_props();
    }

    // Set up SELinux, including loading the SELinux policy if we're in the kernel domain.
    selinux_initialize(is_first_stage);

    // If we're in the kernel domain, re-exec init to transition to the init domain now
    // that the SELinux policy has been loaded.
    if (is_first_stage) {
        if (restorecon("/init") == -1) {
            ERROR("restorecon failed: %s\n", strerror(errno));
            security_failure();
        }
        char* path = argv[0];
        char* args[] = { path, const_cast<char*>("--second-stage"), nullptr };
        if (execv(path, args) == -1) {
            ERROR("execv(\"%s\") failed: %s\n", path, strerror(errno));
            security_failure();
        }
    }

    // These directories were necessarily created before initial policy load
    // and therefore need their security context restored to the proper value.
    // This must happen before /dev is populated by ueventd.
    NOTICE("Running restorecon...\n");
    restorecon("/dev");
    restorecon("/dev/socket");
    restorecon("/dev/__properties__");
    restorecon("/property_contexts");
    restorecon_recursive("/sys");

    // 初始化epoll功能
    epoll_fd = epoll_create1(EPOLL_CLOEXEC);
    if (epoll_fd == -1) {
        ERROR("epoll_create1 failed: %s\n", strerror(errno));
        exit(1);
    }

    // 初始化子进程退出的信号处理函数，并调用epoll_ctl设置signal fd可读的回调函数
    signal_handler_init();

    // 加载default.prop文件
    property_load_boot_defaults();
    export_oem_lock_status();

    // 启动属性服务器，此处会调用epoll_ctl设置property fd可读的回调函数
    start_property_service();

    const BuiltinFunctionMap function_map;
    Action::set_function_map(&function_map);

    Parser& parser = Parser::GetInstance();
    parser.AddSectionParser("service",std::make_unique<ServiceParser>());
    parser.AddSectionParser("on", std::make_unique<ActionParser>());
    parser.AddSectionParser("import", std::make_unique<ImportParser>());

    // 解析init.rc文件
    parser.ParseConfig("/init.rc");

    ActionManager& am = ActionManager::GetInstance();

    // 执行rc文件中触发器为on early-init的语句
    am.QueueEventTrigger("early-init");

    // Queue an action that waits for coldboot done so we know ueventd has set up all of /dev...
    // 等冷插拔设备初始化完成
    am.QueueBuiltinAction(wait_for_coldboot_done_action, "wait_for_coldboot_done");
    // ... so that we can start queuing up actions that require stuff from /dev.
    am.QueueBuiltinAction(mix_hwrng_into_linux_rng_action, "mix_hwrng_into_linux_rng");
    // 设备组合键的初始化操作，此处会调用epoll_ctl设置keychord fd可读的回调函数
    am.QueueBuiltinAction(keychord_init_action, "keychord_init");

    // 屏幕上显示Android静态Logo
    am.QueueBuiltinAction(console_init_action, "console_init");

    // Trigger all the boot actions to get us started.
    // 执行rc文件中触发器为on init的语句
    am.QueueEventTrigger("init");

    // Repeat mix_hwrng_into_linux_rng in case /dev/hw_random or /dev/random
    // wasn't ready immediately after wait_for_coldboot_done
    am.QueueBuiltinAction(mix_hwrng_into_linux_rng_action, "mix_hwrng_into_linux_rng");

    // Don't mount filesystems or start core system services in charger mode.
    // 当处于充电模式，则charger加入执行队列；否则late-init加入队列。
    std::string bootmode = property_get("ro.bootmode");
    if (bootmode == "charger") {
        am.QueueEventTrigger("charger");
    } else if (strncmp(bootmode.c_str(), "ffbm", 4) == 0) {
        NOTICE("Booting into ffbm mode\n");
        am.QueueEventTrigger("ffbm");
    } else {
        am.QueueEventTrigger("late-init");
    }

    // 触发器为属性是否设置
    // Run all property triggers based on current state of the properties.
    am.QueueBuiltinAction(queue_property_triggers_action, "queue_property_triggers");

    while (true) {
        if (!waiting_for_exec) {
            am.ExecuteOneCommand();
            // 根据需要重启服务
            restart_processes();
        }

        int timeout = -1;
        if (process_needs_restart) {
            timeout = (process_needs_restart - gettime()) * 1000;
            if (timeout < 0)
                timeout = 0;
        }

        if (am.HasMoreCommands()) {
            timeout = 0;
        }

        bootchart_sample(&timeout);

        epoll_event ev;
        // 循环等待事件发生
        int nr = TEMP_FAILURE_RETRY(epoll_wait(epoll_fd, &ev, 1, timeout));
        if (nr == -1) {
            ERROR("epoll_wait failed: %s\n", strerror(errno));
        } else if (nr == 1) {
            ((void (*)()) ev.data.ptr)();
        }
    }

    return 0;
}

```

init进程执行完成后进入循环等待epoll_wait的状态。

## 小结

![android_9_boot.webp](/images/init/android_9_boot.webp)


