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

    @UnsupportedAppUsage
    private final IDropBoxManagerService mService;

    public DropBoxManager(Context context, IDropBoxManagerService service) {
        mContext = context;
        mService = service;
    }

    /**
     * Stores human-readable text.  The data may be discarded eventually (or even
     * immediately) if space is limited, or ignored entirely if the tag has been
     * blocked (see {@link #isTagEnabled}).
     *
     * @param tag describing the type of entry being stored
     * @param data value to store
     */
    public void addText(String tag, String data) {
        try {
            mService.add(new Entry(tag, 0, data));
        } catch (RemoteException e) {
            if (e instanceof TransactionTooLargeException
                    && mContext.getApplicationInfo().targetSdkVersion < Build.VERSION_CODES.N) {
                Log.e(TAG, "App sent too much data, so it was ignored", e);
                return;
            }
            throw e.rethrowFromSystemServer();
        }
    }

    /**
     * Stores binary data, which may be ignored or discarded as with {@link #addText}.
     *
     * @param tag describing the type of entry being stored
     * @param data value to store
     * @param flags describing the data
     */
    public void addData(String tag, byte[] data, int flags) {
        if (data == null) throw new NullPointerException("data == null");
        try {
            mService.add(new Entry(tag, 0, data, flags));
        } catch (RemoteException e) {
            if (e instanceof TransactionTooLargeException
                    && mContext.getApplicationInfo().targetSdkVersion < Build.VERSION_CODES.N) {
                Log.e(TAG, "App sent too much data, so it was ignored", e);
                return;
            }
            throw e.rethrowFromSystemServer();
        }
    }

    /**
     * Stores the contents of a file, which may be ignored or discarded as with
     * {@link #addText}.
     *
     * @param tag describing the type of entry being stored
     * @param file to read from
     * @param flags describing the data
     * @throws IOException if the file can't be opened
     */
    public void addFile(String tag, File file, int flags) throws IOException {
        if (file == null) throw new NullPointerException("file == null");
        Entry entry = new Entry(tag, 0, file, flags);
        try {
            mService.add(entry);
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        } finally {
            entry.close();
        }
    }

    /**
     * Checks any blacklists (set in system settings) to see whether a certain
     * tag is allowed.  Entries with disabled tags will be dropped immediately,
     * so you can save the work of actually constructing and sending the data.
     *
     * @param tag that would be used in {@link #addText} or {@link #addFile}
     * @return whether events with that tag would be accepted
     */
    public boolean isTagEnabled(String tag) {
        try {
            return mService.isTagEnabled(tag);
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }

    /**
     * Gets the next entry from the drop box <em>after</em> the specified time.
     * You must always call {@link Entry#close()} on the return value!
     *
     * @param tag of entry to look for, null for all tags
     * @param msec time of the last entry seen
     * @return the next entry, or null if there are no more entries
     */
    @RequiresPermission(allOf = { READ_LOGS, PACKAGE_USAGE_STATS })
    public @Nullable Entry getNextEntry(String tag, long msec) {
        try {
            return mService.getNextEntry(tag, msec, mContext.getOpPackageName());
        } catch (SecurityException e) {
            if (mContext.getApplicationInfo().targetSdkVersion >= Build.VERSION_CODES.P) {
                throw e;
            } else {
                Log.w(TAG, e.getMessage());
                return null;
            }
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }

    /**
     * A single entry retrieved from the drop box.
     * This may include a reference to a stream, so you must call
     * {@link #close()} when you are done using it.
     */
    public static class Entry implements Parcelable, Closeable {
        private final String mTag;
        private final long mTimeMillis;

        private final byte[] mData;
        private final ParcelFileDescriptor mFileDescriptor;
        private final int mFlags;

    }

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

## DropBoxManagerService

![dropbox_manager_service](/images/android/bugreport/dropbox_manager_service.png)

```java

public final class DropBoxManagerService extends SystemService {

    private static final int DEFAULT_AGE_SECONDS = 3 * 86400;        // 文件最长存活时长为3天
    private static final int DEFAULT_MAX_FILES = 1000;               // 最大dropbox文件个数为1000
    private static final int DEFAULT_MAX_FILES_LOWRAM = 300;
    private static final int DEFAULT_QUOTA_KB = 5 * 1024;            // 分配的dropbox的空间最大值为5MB
    private static final int DEFAULT_QUOTA_PERCENT = 10;             // dropbox目录最多可占用空间比例为10%
    private static final int DEFAULT_RESERVE_PERCENT = 10;           // dropbox不可使用的存储空间比例为10%
    private static final int QUOTA_RESCAN_MILLIS = 5000;             // 重新扫描retrim时长为5s

    // Max number of bytes of a dropbox entry to write into protobuf.
    private static final int PROTO_MAX_DATA_BYTES = 256 * 1024; // 256Kb = 32KB

    private int mMaxFiles = -1; // -1 means uninitialized.

    /**
     * Creates an instance of managed drop box storage using the default dropbox
     * directory.
     *
     * @param context to use for receiving free space & gservices intents
     */
    public DropBoxManagerService(final Context context) {
        this(context, new File("/data/system/dropbox"), FgThread.get().getLooper());
    }

    /**
     * Creates an instance of managed drop box storage.  Normally there is one of these
     * run by the system, but others can be created for testing and other purposes.
     *
     * @param context to use for receiving free space & gservices intents
     * @param path to store drop box entries in
     */
    @VisibleForTesting
    public DropBoxManagerService(final Context context, File path, Looper looper) {
        super(context);
        mDropBoxDir = path;
        mContentResolver = getContext().getContentResolver();
        mHandler = new DropBoxManagerBroadcastHandler(looper);
    }


    @Override
    public void onStart() {
        publishBinderService(Context.DROPBOX_SERVICE, mStub);

        // The real work gets done lazily in init() -- that way service creation always
        // succeeds, and things like disk problems cause individual method failures.
    }

    @Override
    public void onBootPhase(int phase) {
        switch (phase) {
            case PHASE_SYSTEM_SERVICES_READY:
                IntentFilter filter = new IntentFilter();
                filter.addAction(Intent.ACTION_DEVICE_STORAGE_LOW);
                getContext().registerReceiver(mReceiver, filter);

                mContentResolver.registerContentObserver(
                    Settings.Global.CONTENT_URI, true,
                    new ContentObserver(new Handler()) {
                        @Override
                        public void onChange(boolean selfChange) {
                            mReceiver.onReceive(getContext(), (Intent) null);
                        }
                    });

                getLowPriorityResourceConfigs();
                break;

            case PHASE_BOOT_COMPLETED:
                mBooted = true;
                break;
        }
    }

    private final IDropBoxManagerService.Stub mStub = new IDropBoxManagerService.Stub() {
        @Override
        public void add(DropBoxManager.Entry entry) {
            DropBoxManagerService.this.add(entry);
        }

        @Override
        public boolean isTagEnabled(String tag) {
            return DropBoxManagerService.this.isTagEnabled(tag);
        }

        @Override
        public DropBoxManager.Entry getNextEntry(String tag, long millis, String callingPackage) {
            return DropBoxManagerService.this.getNextEntry(tag, millis, callingPackage);
        }

        @Override
        public void dump(FileDescriptor fd, PrintWriter pw, String[] args) {
            DropBoxManagerService.this.dump(fd, pw, args);
        }

        @Override
        public void onShellCommand(FileDescriptor in, FileDescriptor out,
                                   FileDescriptor err, String[] args, ShellCallback callback,
                                   ResultReceiver resultReceiver) {
            (new ShellCmd()).exec(this, in, out, err, args, callback, resultReceiver);
        }
    };

    /** Receives events that might indicate a need to clean up files. */
    private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            // For ACTION_DEVICE_STORAGE_LOW:
            mCachedQuotaUptimeMillis = 0;  // Force a re-check of quota size

            // Run the initialization in the background (not this main thread).
            // The init() and trimToFit() methods are synchronized, so they still
            // block other users -- but at least the onReceive() call can finish.
            new Thread() {
                public void run() {
                    try {
                        init();
                        trimToFit();
                    } catch (IOException e) {
                        Slog.e(TAG, "Can't init", e);
                    }
                }
            }.start();
        }
    };

    /** If never run before, scans disk contents to build in-memory tracking data. */
    private synchronized void init() throws IOException {
        if (mStatFs == null) {
            if (!mDropBoxDir.isDirectory() && !mDropBoxDir.mkdirs()) {
                throw new IOException("Can't mkdir: " + mDropBoxDir);
            }
            try {
                mStatFs = new StatFs(mDropBoxDir.getPath());
                mBlockSize = mStatFs.getBlockSize();
            } catch (IllegalArgumentException e) {  // StatFs throws this on error
                throw new IOException("Can't statfs: " + mDropBoxDir);
            }
        }

        if (mAllFiles == null) {
            // 列出所有dropbox文件
            File[] files = mDropBoxDir.listFiles();
            if (files == null) throw new IOException("Can't list files: " + mDropBoxDir);

            mAllFiles = new FileList();
            mFilesByTag = new ArrayMap<>();

            // Scan pre-existing files.
            for (File file : files) {
                if (file.getName().endsWith(".tmp")) {
                    Slog.i(TAG, "Cleaning temp file: " + file);
                    file.delete();
                    continue;
                }

                // 创建dropbox的实体文件对象，更具文件名获取时间戳
                EntryFile entry = new EntryFile(file, mBlockSize);

                if (entry.hasFile()) {
                    // Enroll only when the filename is valid.  Otherwise the above constructor
                    // has removed the file already.
                    // 将entry加入AllFile对象
                    enrollEntry(entry);
                }
            }
        }
    }

    /**
     * Trims the files on disk to make sure they aren't using too much space.
     * @return the overall quota for storage (in bytes)
     */
    private synchronized long trimToFit() throws IOException {}

}

```

## 调试

```txt

/***************************************************************************/

qssi:/ $ dumpsys dropbox -h
Dropbox (dropbox) dump options:
  [-h|--help] [-p|--print] [-f|--file] [timestamp]
    -h|--help: print this help
    -p|--print: print full contents of each entry
    -f|--file: print path of each entry's file
    --proto: dump data to proto
  [timestamp] optionally filters to only those entries.

/***************************************************************************/

qssi:/ $ dumpsys dropbox
Drop box contents: 720 entries
Max entries: 1000
Low priority rate limit period: 2000 ms
Low priority tags: {data_app_wtf, keymaster, system_server_wtf, system_app_strictmode, system_app_wtf, system_server_strictmode, data_app_strictmode, netstats}

2020-12-24 19:37:07 system_server_strictmode (text, 1295 bytes)
    Process: unknown/Build: SUNMI/qssi/qssi:11/RKQ1.200903.002/eng.lxg.202 ...
2020-12-24 19:37:07 system_server_strictmode (text, 1413 bytes)
    Process: unknown/Build: SUNMI/qssi/qssi:11/RKQ1.200903.002/eng.lxg.202 ...
2020-12-24 19:37:07 system_server_strictmode (text, 1535 bytes)
    Process: unknown/Build: SUNMI/qssi/qssi:11/RKQ1.200903.002/eng.lxg.202 ...
..........................................

Usage: dumpsys dropbox [--print|--file] [YYYY-mm-dd] [HH:MM:SS] [tag]

/***************************************************************************/

qssi:/ $ dumpsys dropbox -f
Drop box contents: 797 entries
Max entries: 1000
Low priority rate limit period: 2000 ms
Low priority tags: {data_app_wtf, keymaster, system_server_wtf, system_app_strictmode, system_app_wtf, system_server_strictmode, data_app_strictmode, netstats}

2020-12-24 19:37:07 system_server_strictmode (text, 1295 bytes)
    /data/system/dropbox/system_server_strictmode@1608809827048.txt
2020-12-24 19:37:07 system_server_strictmode (text, 1413 bytes)
    /data/system/dropbox/system_server_strictmode@1608809827054.txt

/***************************************************************************/

```
















