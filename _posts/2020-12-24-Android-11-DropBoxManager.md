---
layout:     post
title:      Android 11 DropBoxManager
subtitle:   DropBoxManagerService
date:       2020-12-24
author:     LXG
header-img: img/post-bg-keybord.jpg
catalog: true
tags:
    - dropbox
---

[DropBoxManager-Goolgle](https://developer.android.com/reference/android/os/DropBoxManager)

[DropBoxManager启动篇-Gityuan](http://gityuan.com/2016/06/12/DropBoxManagerService/)

## 简介

Enqueues chunks of data (from various sources -- application crashes, kernel log records, etc.). The queue is size bounded and will drop old data if the enqueued data exceeds the maximum size. You can think of this as a persistent, system-wide, blob-oriented "logcat".

DropBoxManager entries are not sent anywhere directly, but other system services and debugging tools may scan and upload entries for processing.


## DropBoxManager

```java

@SystemService(Context.DROPBOX_SERVICE)
public class DropBoxManager {



}

```

## App使用方法

```java

    private void testDropbox() {
        HandlerThread handlerThread = new HandlerThread("DropboxExporter");
        handlerThread.start();
        Handler handler = new Handler(handlerThread.getLooper());
        handler.post(new Runnable() {
            @Override
            public void run() {
                String destPath = output(context, Environment.getExternalStorageDirectory().getPath() + "/dropbox.log", 800 * 1024);
                Log.d("whh", "dropbox output success: " + destPath);
            }
        });
    }

    /**
     * Outputs the dropbox logcat to the specified file or dir，donnot do this in the main thread
     * @param context nonnull context
     * @param pathname absolute path of file or directory for the logcat，if give a directory, default file name is "dropbox.log"
     * @param maxBytes of string to return with {@link DropBoxManager.Entry#getText(int)}
     * @return the absolute path of dropbox-logcat-file
     */
    public String output(@NonNull Context context, String pathname, int maxBytes) {
        //1、get dropbox manager
        DropBoxManager dropBoxManager = (DropBoxManager) context.getApplicationContext().getSystemService(Context.DROPBOX_SERVICE);
        if (dropBoxManager == null) {
            return null;
        }

        File file = new File(pathname);
        if (file.isDirectory()) {
            file = new File(pathname, "dropbox.log");
        }
        if (file.exists()) {
            file.delete();
        }
        file.getParentFile().mkdirs();
        try {
            if (!file.createNewFile()) {
                Log.e(TAG, "create file " + file.getAbsolutePath() + " failed");
                return null;
            }
        } catch (IOException e) {
            Log.e(TAG, e.getMessage());
            return null;
        }
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file.getAbsolutePath(), true))){
            long startTime = 0L;
            DropBoxManager.Entry entry = null;
            //2、get entry by startTime
            while ((entry = dropBoxManager.getNextEntry(null, startTime)) != null) {
                //3、write the tag info and entry info into file
                writer.write(entry.getTag() + ":\r\n" + entry.getText(maxBytes) + "\r\n\r\n");
                //4、reset startTime for the next entry
                startTime = entry.getTimeMillis();
                //5、donnot forget to close the entry after you finished your task
                entry.close();
            }
        } catch (IOException e) {
            Log.e(TAG, e.getMessage());
        }
        return file.getAbsolutePath();
    }

```
