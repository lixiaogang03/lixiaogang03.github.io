---
layout:     post
title:      Android TelephonyManager
subtitle:   eSIM
date:       2019-08-06
author:     LXG
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - TelephonyManager
    - Android
    - eSIM
---

[TelephonyManager-developer](https://developer.android.google.cn/reference/android/telephony/TelephonyManager)

## dumpsys telephony.registry

![TelephonyRegistry](/images/telephony_registry.png)


```java

class TelephonyRegistry extends ITelephonyRegistry.Stub {


    @Override
    public void dump(FileDescriptor fd, PrintWriter pw, String[] args) {
        if (mContext.checkCallingOrSelfPermission(android.Manifest.permission.DUMP)
                != PackageManager.PERMISSION_GRANTED) {
            pw.println("Permission Denial: can't dump telephony.registry from from pid="
                    + Binder.getCallingPid() + ", uid=" + Binder.getCallingUid());
            return;
        }
        synchronized (mRecords) {
            final int recordCount = mRecords.size();
            pw.println("last known state:");
            for (int i = 0; i < TelephonyManager.getDefault().getPhoneCount(); i++) {
                pw.println("  Phone Id=" + i);
                pw.println("  mCallState=" + mCallState[i]);
                pw.println("  mCallIncomingNumber=" + mCallIncomingNumber[i]);
                pw.println("  mServiceState=" + mServiceState[i]);
                pw.println("  mSignalStrength=" + mSignalStrength[i]);
                pw.println("  mMessageWaiting=" + mMessageWaiting[i]);
                pw.println("  mCallForwarding=" + mCallForwarding[i]);
                pw.println("  mDataActivity=" + mDataActivity[i]);
                pw.println("  mDataConnectionState=" + mDataConnectionState[i]);
                pw.println("  mDataConnectionPossible=" + mDataConnectionPossible[i]);
                pw.println("  mDataConnectionReason=" + mDataConnectionReason[i]);
                pw.println("  mDataConnectionApn=" + mDataConnectionApn[i]);
                pw.println("  mDataConnectionLinkProperties=" + mDataConnectionLinkProperties[i]);
                pw.println("  mDataConnectionNetworkCapabilities=" +
                        mDataConnectionNetworkCapabilities[i]);
                pw.println("  mCellLocation=" + mCellLocation[i]);
                pw.println("  mCellInfo=" + mCellInfo.get(i));
            }
            pw.println("registrations: count=" + recordCount);
            for (Record r : mRecords) {
                pw.println("  " + r);
            }
        }
    }

}


public class ServiceState implements Parcelable {

    /**
     * Get current registered data network operator name in long alphanumeric format.
     * @return long name of voice operator
     * @hide
     */
    public String getDataOperatorAlphaLong() {
        return mDataOperatorAlphaLong;
    }

    /**
     * Get current registered operator name in long alphanumeric format.
     *
     * In GSM/UMTS, long format can be up to 16 characters long.
     * In CDMA, returns the ERI text, if set. Otherwise, returns the ONS.
     *
     * @return long name of operator, null if unregistered or unknown
     */
    public String getOperatorAlphaLong() {
        return mVoiceOperatorAlphaLong;
    }

}


```


