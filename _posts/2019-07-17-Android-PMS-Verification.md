---
layout:     post
title:      Android PMS Verification
subtitle:   PackageManagerService
date:       2019-07-17
author:     LXG
header-img: img/post-bg-ioses.jpg
catalog: true
tags:
    - android
    - pms
---

## 应用安装检查 Package Verifiers

[应用安装检查](http://www.robotshell.com/2018/02/06/Android包管理之App安装前的校验/)

### 核心代码

**PackageManagerService.java**

```java

    /**
     * Whether verification is enabled by default.
     */
    private static final boolean DEFAULT_VERIFY_ENABLE = true;

    /**
     * The default maximum time to wait for the verification agent to return in
     * milliseconds.
     */
    private static final long DEFAULT_VERIFICATION_TIMEOUT = 10 * 1000;

    /**
     * The default response for package verification timeout.
     *
     * This can be either PackageManager.VERIFICATION_ALLOW or
     * PackageManager.VERIFICATION_REJECT.
     */
    private static final int DEFAULT_VERIFICATION_RESPONSE = PackageManager.VERIFICATION_ALLOW;

         // Invoke remote method to get package information and install
         // location values. Override install location based on default
         // policy if needed and then create install arguments based
         // on the install location.
        public void handleStartCopy() throws RemoteException {
            -----------------------------------------------------------------------------
                        Trace.asyncTraceBegin(
                                TRACE_TAG_PACKAGE_MANAGER, "verification", verificationId);
                        // Send the intent to the required verification agent,
                        // but only start the verification timeout after the
                        // target BroadcastReceivers have run.
                        verification.setComponent(requiredVerifierComponent);
                        mContext.sendOrderedBroadcastAsUser(verification, verifierUser,
                                android.Manifest.permission.PACKAGE_VERIFICATION_AGENT,
                                // 此处巧妙，此Receiver做为orderedBroadcast的最后一站，将接收到intent
                                new BroadcastReceiver() {
                                    @Override
                                    public void onReceive(Context context, Intent intent) {
                                        final Message msg = mHandler
                                                .obtainMessage(CHECK_PENDING_VERIFICATION);
                                        msg.arg1 = verificationId;
                                        // 延时发送校验结束的消息，即超时时间到后发送校验结束，由于未携带
                                        // 校验结果，将被判定为REJECT.
                                        mHandler.sendMessageDelayed(msg, getVerificationTimeout());
                                    }
                                }, null, 0, null, null);

                         // 暂停安装等待校验结果
                         // We don't want the copy to proceed until verification
                         // succeeds, so null out this field.
                        mArgs = null;
            -----------------------------------------------------------------------------------------
        }

        void handleReturnCode() {
            // If mArgs is null, then MCS couldn't be reached. When it
            // reconnects, it will try again to install. At that point, this
            // will succeed.
            if (mArgs != null) {
                processPendingInstall(mArgs, mRet);
            }
        }


    // 检验完成后的回调(Binder IPC)
    @Override
    public void verifyPendingInstall(int id, int verificationCode) throws RemoteException {
        mContext.enforceCallingOrSelfPermission(
                android.Manifest.permission.PACKAGE_VERIFICATION_AGENT,
                "Only package verification agents can verify applications");

        final Message msg = mHandler.obtainMessage(PACKAGE_VERIFIED);
        final PackageVerificationResponse response = new PackageVerificationResponse(
                verificationCode, Binder.getCallingUid());
        msg.arg1 = id;
        msg.obj = response;
        mHandler.sendMessage(msg);
    }

```

**android.provider.Settings**

```java

       /**
        * Whether the package manager should send package verification broadcasts for verifiers to
        * review apps prior to installation.
        * 1 = request apps to be verified prior to installation, if a verifier exists.
        * 0 = do not verify apps before installation
        * @hide
        */
       public static final String PACKAGE_VERIFIER_ENABLE = "package_verifier_enable";

       /** Timeout for package verification.
        * @hide */
       public static final String PACKAGE_VERIFIER_TIMEOUT = "verifier_timeout";

       /** Default response code for package verification.
        * @hide */
       public static final String PACKAGE_VERIFIER_DEFAULT_RESPONSE = "verifier_default_response";

       /**
        * Show package verification setting in the Settings app.
        * 1 = show (default)
        * 0 = hide
        * @hide
        */
       public static final String PACKAGE_VERIFIER_SETTING_VISIBLE = "verifier_setting_visible";

       /**
        * Run package verification on apps installed through ADB/ADT/USB
        * 1 = perform package verification on ADB installs (default)
        * 0 = bypass package verification on ADB installs
        * @hide
        */
       public static final String PACKAGE_VERIFIER_INCLUDE_ADB = "verifier_verify_adb_installs";

```

**APP层**

```xml

    <uses-permission android:name="android.permission.PACKAGE_VERIFICATION_AGENT"/>

    <receiver android:name=".receiver.PackageVerifyReceiver">
        <intent-filter>
            <action android:name="android.intent.action.PACKAGE_NEEDS_VERIFICATION"/>
            <data android:mimeType="application/vnd.android.package-archive"/>
        </intent-filter>
    </receiver>

```

```java

public class PackageVerifyReceiver extends BroadcastReceiver {

    public static final String EXTRA_VERIFICATION_INSTALLER_UID
            = "android.content.pm.extra.VERIFICATION_INSTALLER_UID";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (Intent.ACTION_PACKAGE_NEEDS_VERIFICATION.equals(action)
                || Intent.ACTION_PACKAGE_VERIFIED.equals(action)) {
            Bundle extras = intent.getExtras();
            if (extras != null) {
                int id = extras.getInt(PackageManager.EXTRA_VERIFICATION_ID);
                int uid = extras.getInt(EXTRA_VERIFICATION_INSTALLER_UID);

                // check uid here

                PackageManager pm = context.getPackageManager();
                pm.verifyPendingInstall(id, PackageManager.VERIFICATION_REJECT);
            }
        }
    }
}

```

### dumpsys 调试

```txt
L2:/ $ dumpsys package v
Verifiers:
  Required: com.android.vending (uid=10033)
```

