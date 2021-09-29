---
layout:     post
title:      Android Recovery
subtitle:   Recovery Mode
date:       2021-09-29
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - recovery
---

## Android 启动模式

* Normal 正常启动
* Safe mode 安全模式
* Bootloader 模式
* Recovery mode 恢复模式
* Diagnostic mode 诊断模式
* Fastboot mode

每个android设备不是所有模式都有，跟具体厂商有关

## OTA Install

![ota_mode](/images/recovery/ota_mode.png)

### RecoverySystem

```java

    /**
     * Reboots the device in order to install the given update
     * package.
     * Requires the {@link android.Manifest.permission#REBOOT} permission.
     *
     * @param context      the Context to use
     * @param packageFile  the update package to install.  Must be on
     * a partition mountable by recovery.  (The set of partitions
     * known to recovery may vary from device to device.  Generally,
     * /cache and /data are safe.)
     *
     * @throws IOException  if writing the recovery command file
     * fails, or if the reboot itself fails.
     */
    public static void installPackage(Context context, File packageFile)
        throws IOException {
        String filename = packageFile.getCanonicalPath();
        Log.w(TAG, "!!! REBOOTING TO INSTALL " + filename + " !!!");
        String arg = "--update_package=" + filename +
            "\n--locale=" + Locale.getDefault().toString();
        bootCommand(context, arg);
    }

    /**
     * Reboot into the recovery system with the supplied argument.
     * @param arg to pass to the recovery utility.
     * @throws IOException if something goes wrong.
     */
    private static void bootCommand(Context context, String arg) throws IOException {
        RECOVERY_DIR.mkdirs();  // In case we need it
        COMMAND_FILE.delete();  // In case it's not writable
        LOG_FILE.delete();

        FileWriter command = new FileWriter(COMMAND_FILE);
        try {
            command.write(arg);
            command.write("\n");
        } finally {
            command.close();
        }

        // Having written the command file, go ahead and reboot
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        pm.reboot("recovery");

        throw new IOException("Reboot failed (no permissions?)");
    }

```

### PowerManagerService

```java

    /**
     * Reboots the device.
     *
     * @param confirm If true, shows a reboot confirmation dialog.
     * @param reason The reason for the reboot, or null if none.
     * @param wait If true, this call waits for the reboot to complete and does not return.
     */
    @Override // Binder call
    public void reboot(boolean confirm, String reason, boolean wait) {
        mContext.enforceCallingOrSelfPermission(android.Manifest.permission.REBOOT, null);

        final long ident = Binder.clearCallingIdentity();
        try {
            shutdownOrRebootInternal(false, confirm, reason, wait);
        } finally {
            Binder.restoreCallingIdentity(ident);
        }
    }

    private void shutdownOrRebootInternal(final boolean shutdown, final boolean confirm,
            final String reason, boolean wait) {
        if (mHandler == null || !mSystemReady) {
            throw new IllegalStateException("Too early to call shutdown() or reboot()");
        }

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                synchronized (this) {
                    if (shutdown) {
                        ShutdownThread.shutdown(mContext, confirm);
                    } else {
                        ShutdownThread.reboot(mContext, reason, confirm);
                    }
                }
            }
        };

        // ShutdownThread must run on a looper capable of displaying the UI.
        Message msg = Message.obtain(mHandler, runnable);
        msg.setAsynchronous(true);
        mHandler.sendMessage(msg);

        // PowerManager.reboot() is documented not to return so just wait for the inevitable.
        if (wait) {
            synchronized (runnable) {
                while (true) {
                    try {
                        runnable.wait();
                    } catch (InterruptedException e) {
                    }
                }
            }
        }
    }

    /**
     * Low-level function to reboot the device. On success, this function
     * doesn't return. If more than 5 seconds passes from the time,
     * a reboot is requested, this method returns.
     *
     * @param reason code to pass to the kernel (e.g. "recovery"), or null.
     */
    public static void lowLevelReboot(String reason) {
        if (reason == null) {
            reason = "";
        }
        SystemProperties.set("sys.powerctl", "reboot," + reason);
        try {
            Thread.sleep(20000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

```

### ShutdownThread

```java

    // Provides shutdown assurance in case the system_server is killed
    public static final String SHUTDOWN_ACTION_PROPERTY = "sys.shutdown.requested";

    /**
     * Request a clean shutdown, waiting for subsystems to clean up their
     * state etc.  Must be called from a Looper thread in which its UI
     * is shown.
     *
     * @param context Context used to display the shutdown progress dialog.
     * @param reason code to pass to the kernel (e.g. "recovery"), or null.
     * @param confirm true if user confirmation is needed before shutting down.
     */
    public static void reboot(final Context context, String reason, boolean confirm) {
        mReboot = true;
        mRebootSafeMode = false;
        mRebootReason = reason;
        if (reason != null) {
            Log.d(TAG,"reboot reason is " + mRebootReason);
        }
        shutdownInner(context, confirm);
    }

    static void shutdownInner(final Context context, boolean confirm) {
        // ensure that only one thread is trying to power down.
        // any additional calls are just returned
        synchronized (sIsStartedGuard) {
            if (sIsStarted) {
                Log.d(TAG, "Request to shutdown already running, returning.");
                return;
            }
        }

        if (confirm) {
            -----------------------------------------------
        } else {
            beginShutdownSequence(context);
        }
    }

    private static void beginShutdownSequence(Context context) {
        synchronized (sIsStartedGuard) {
            if (sIsStarted) {
                Log.d(TAG, "Shutdown sequence already running, returning.");
                return;
            }
            sIsStarted = true;
        }

        SystemProperties.set("sys.start_shutdown", "1");
        SystemProperties.set("sys.fasboot_shutdown", "1");

        -------------------------------------------------------------------

        if (mRebootReason != null){
            mBootFastEnable = false;
            Log.d(TAG,"have reason " + mRebootReason + " real reboot");
        }

        -------------------------------------------------------------------

        sInstance = new ShutdownThread();

        ------------------------------------------------------------------

        sInstance.start();

   }


    /**
     * Makes sure we handle the shutdown gracefully.
     * Shuts off power regardless of radio and bluetooth state if the alloted time has passed.
     */
    public void run() {

        -----------------------------------------------------
        if (!mBootFastEnable) {
            ------------------------------------------------
            /*
             * Write a system property in case the system_server reboots before we
             * get to the actual hardware restart. If that happens, we'll retry at
             * the beginning of the SystemServer startup.
             */
            {
                String reason = (mReboot ? "1" : "0") + (mRebootReason != null ? mRebootReason : "");
                SystemProperties.set(SHUTDOWN_ACTION_PROPERTY, reason);
            }

            ----------------------------------------------------

            killRemoveActivity(mContext);
            killRemoveService(mContext);
            Log.i(TAG, "Sending shutdown broadcast...");

            // First send the high-level shut down broadcast.
            mActionDone = false;
            Intent intent = new Intent(Intent.ACTION_SHUTDOWN);
            intent.addFlags(Intent.FLAG_RECEIVER_FOREGROUND);
            mContext.sendOrderedBroadcastAsUser(intent,
                    UserHandle.ALL, null, br, mHandler, 0, null, null);

            ----------------------------------------------------------------

            Log.i(TAG, "Shutting down activity manager...");

            final IActivityManager am =
                    ActivityManagerNative.asInterface(ServiceManager.checkService("activity"));
            if (am != null) {
                try {
                    am.shutdown(MAX_BROADCAST_TIME);
                } catch (RemoteException e) {
                }
            }

            -----------------------------------------------------------------

            // Shutdown MountService to ensure media is in a safe state
            IMountShutdownObserver observer = new IMountShutdownObserver.Stub() {
                public void onShutDownComplete(int statusCode) throws RemoteException {
                    Log.w(TAG, "Result code " + statusCode + " from MountService.shutdown");
                    actionDone();
                }
            };

            Log.i(TAG, "Shutting down MountService");

            -----------------------------------------------------------------

            rebootOrShutdown(mReboot, mRebootReason);

        } else {
            -----------------------------------------------------
        }

    }


    /**
     * Do not call this directly. Use {@link #reboot(Context, String, boolean)}
     * or {@link #shutdown(Context, boolean)} instead.
     *
     * @param reboot true to reboot or false to shutdown
     * @param reason reason for reboot
     */
    public static void rebootOrShutdown(boolean reboot, String reason) {
        if (reboot) {
            Log.i(TAG, "Rebooting, reason: " + reason);
            try {
                PowerManagerService.lowLevelReboot(reason);
            } catch (Exception e) {
                Log.e(TAG, "Reboot failed, will attempt shutdown instead", e);
            }
        } else {
            ------------------------------------------------------------
        }
        ---------------------------------------------------------------
    }

```

### init.rc

```txt

on property:sys.powerctl=*
    powerctl ${sys.powerctl}

```

### keywords.h

system/core/init/keywords.h

```h

int do_powerctl(int nargs, char **args);

    KEYWORD(powerctl,    COMMAND, 1, do_powerctl)

```

### builtins.c

system/core/init/builtins.c

```c

int do_powerctl(int nargs, char **args)
{
    char command[PROP_VALUE_MAX];
    int res;
    int len = 0;
    int cmd = 0;
    char *reboot_target;

    res = expand_props(command, args[1], sizeof(command));
    if (res) {
        ERROR("powerctl: cannot expand '%s'\n", args[1]);
        return -EINVAL;
    }

    if (strncmp(command, "shutdown", 8) == 0) {
        cmd = ANDROID_RB_POWEROFF;
        len = 8;
    } else if (strncmp(command, "reboot", 6) == 0) {
        cmd = ANDROID_RB_RESTART2;
        len = 6;
    } else {
        ERROR("powerctl: unrecognized command '%s'\n", command);
        return -EINVAL;
    }

    if (command[len] == ',') {
        reboot_target = &command[len + 1];
    } else if (command[len] == '\0') {
        reboot_target = "";
    } else {
        ERROR("powerctl: unrecognized reboot target '%s'\n", &command[len]);
        return -EINVAL;
    }

    return android_reboot(cmd, 0, reboot_target);
}

```

### android_reboot.c

system/core/libcutils/android_reboot.c

```c

int android_reboot(int cmd, int flags, char *arg)
{
    int ret;

    sync();
    remount_ro();

    switch (cmd) {
        case ANDROID_RB_RESTART:
            ret = reboot(RB_AUTOBOOT);
            break;

        case ANDROID_RB_POWEROFF:
            ret = reboot(RB_POWER_OFF);
            break;

        case ANDROID_RB_RESTART2:
            //ret = __reboot(LINUX_REBOOT_MAGIC1, LINUX_REBOOT_MAGIC2,
            //               LINUX_REBOOT_CMD_RESTART2, arg);
            write_misc(arg);
            ret = reboot(RB_AUTOBOOT);
            break;

        default:
            ret = -1;
    }

    return ret;
}

```

### misc_rw.c

system/core/libcutils/misc_rw.c

```c

static const char *MISC_DEVICE = "/dev/block/by-name/misc";

/* force the next boot to recovery/efex */
int write_misc(char *reason){
	struct bootloader_message boot, temp;
	char device[32] = {0};
	memset(&boot, 0, sizeof(boot));
	if(!strcmp("recovery",reason)){
            reason = "boot-recovery";
	}

	strcpy(boot.command, reason);
	sprintf(device,"%s", MISC_DEVICE);
	if (set_bootloader_message_block(&boot, device))
		return -1;

	//read for compare
	memset(&temp, 0, sizeof(temp));
	if (get_bootloader_message_block(&temp, device))
		return -1;

	if ( memcmp(&boot, &temp, sizeof(boot)))
		return -1;

	return 0;

}

```

### reboot.c

./bionic/libc/bionic/reboot.c

```c

int reboot (int  mode) 
{
    return __reboot( LINUX_REBOOT_MAGIC1, LINUX_REBOOT_MAGIC2, mode, NULL );
}

```

### __reboot.S

bionic/libc/arch-arm/syscalls/__reboot.S

```c

ENTRY(__reboot)
    mov     ip, r7
    ldr     r7, =__NR_reboot  //
    swi     #0
    mov     r7, ip
    cmn     r0, #(MAX_ERRNO + 1)
    bxls    lr
    neg     r0, r0
    b       __set_errno
END(__reboot)

```

### glibc-syscalls.h

./libc/include/sys/glibc-syscalls.h

```c

#define SYS_reboot __NR_reboot

```

### sys.c

kernel/kernel/sys.c

```C

/*
 * Reboot system call: for obvious reasons only root may call it,
 * and even root needs to set up some magic numbers in the registers
 * so that some mistake won't make this reboot the whole machine.
 * You can also set the meaning of the ctrl-alt-del-key here.
 *
 * reboot doesn't sync: do that yourself before calling this.
 */
SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
		void __user *, arg)
{
	char buffer[256];
	int ret = 0;

	/* We only trust the superuser with rebooting the system. */
	if (!capable(CAP_SYS_BOOT))
		return -EPERM;

	/* For safety, we require "magic" arguments. */
	if (magic1 != LINUX_REBOOT_MAGIC1 ||
	    (magic2 != LINUX_REBOOT_MAGIC2 &&
	                magic2 != LINUX_REBOOT_MAGIC2A &&
			magic2 != LINUX_REBOOT_MAGIC2B &&
	                magic2 != LINUX_REBOOT_MAGIC2C))
		return -EINVAL;

	/*
	 * If pid namespaces are enabled and the current task is in a child
	 * pid_namespace, the command is handled by reboot_pid_ns() which will
	 * call do_exit().
	 */
	ret = reboot_pid_ns(task_active_pid_ns(current), cmd);
	if (ret)
		return ret;

	/* Instead of trying to make the power_off code look like
	 * halt when pm_power_off is not set do it the easy way.
	 */
	if ((cmd == LINUX_REBOOT_CMD_POWER_OFF) && !pm_power_off)
		cmd = LINUX_REBOOT_CMD_HALT;

	mutex_lock(&reboot_mutex);
	switch (cmd) {
	case LINUX_REBOOT_CMD_RESTART:
		kernel_restart(NULL);
		break;

	case LINUX_REBOOT_CMD_CAD_ON:
		C_A_D = 1;
		break;

	case LINUX_REBOOT_CMD_CAD_OFF:
		C_A_D = 0;
		break;

	case LINUX_REBOOT_CMD_HALT:
		kernel_halt();
		do_exit(0);
		panic("cannot halt");

	case LINUX_REBOOT_CMD_POWER_OFF:
		kernel_power_off();
		do_exit(0);
		break;

	case LINUX_REBOOT_CMD_RESTART2:
		if (strncpy_from_user(&buffer[0], arg, sizeof(buffer) - 1) < 0) {
			ret = -EFAULT;
			break;
		}
		buffer[sizeof(buffer) - 1] = '\0';

		kernel_restart(buffer);
		break;

#ifdef CONFIG_KEXEC
	case LINUX_REBOOT_CMD_KEXEC:
		ret = kernel_kexec();
		break;
#endif

#ifdef CONFIG_HIBERNATION
	case LINUX_REBOOT_CMD_SW_SUSPEND:
		ret = hibernate();
		break;
#endif

	default:
		ret = -EINVAL;
		break;
	}
	mutex_unlock(&reboot_mutex);
	return ret;
}

```

## Recovery Mode

![recovery_mode](/images/recovery/recovery_mode.png)





