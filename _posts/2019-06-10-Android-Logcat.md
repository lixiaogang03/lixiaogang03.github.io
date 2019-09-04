---
layout:     post
title:      Android Logcat
subtitle:   Debug
date:       2019-06-10
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - debug
---

[android-logcat](https://developer.android.google.cn/studio/command-line/logcat.html)

## logcat system

![android_logcat](/images/android_logcat.png)

## 缓冲区

![logcat_circle_buffer](/images/logcat_circle_buffer.png)

Android 日志记录系统为日志消息保留了多个环形缓冲区，而且并非所有的日志消息都会发送到默认的环形缓冲区。
要查看其他日志消息，可以使用 -b 选项运行 logcat 命令，以请求查看备用的环形缓冲区。可以查看下列任意备用缓冲区：

> adb logcat -b main -b radio -b events

1. radio：查看包含无线装置/电话相关消息的缓冲区
2. events：查看已经过解释的二进制系统事件缓冲区消息
3. main：查看主日志缓冲区（默认），不包含系统和崩溃日志消息
4. system：查看系统日志缓冲区（默认）
5. crash：查看崩溃日志缓冲区（默认）
6. all：查看所有缓冲区
7. default：报告 main、system 和 crash 缓冲区


## 过滤日志输出

优先级是以下字符值之一（按照从最低到最高优先级的顺序排列）：

1. V：详细（最低优先级）
2. D：调试
3. I：信息
4. W：警告
5. E：错误
6. F：严重
7. S：静默（最高优先级，未曾输出过任何内容）

以下是一个过滤器表达式的示例，该表达式会阻止除标记为“ActivityManager”、优先级不低于“信息”的日志消息以及标记为“MyApp”、优先级不低于“调试”的日志消息以外的所有其他日志消息

> adb logcat ActivityManager:I  PackageManager:D *:S

## 格式化输出

### 控制日志输出格式

除标记和优先级外，日志消息还包含许多元数据字段。可以修改消息的输出格式，以便它们显示特定的元数据字段。为此，可以使用 -v 选项，并指定下列某一受支持的输出格式。

1. brief：显示优先级/标记以及发出消息的进程的 PID
2. long：显示所有元数据字段，并使用空白行分隔消息
3. process：仅显示 PID
4. raw：显示不包含其他元数据字段的原始日志消息
5. tag：仅显示优先级和标记
6. thread:：旧版格式，显示优先级、PID 以及发出消息的线程的 TID
7. threadtime（默认值）：显示日期、调用时间、优先级、标记、PID 以及发出消息的线程的 TID
8. time：显示日期、调用时间、优先级、标记以及发出消息的进程的 PID

### 格式修饰符

格式修饰符依据以下一个或多个修饰符的任意组合更改 Logcat 输出。要指定格式修饰符，请使用 -v 选项，如下所示：

> adb logcat -b all -v color -d

1. color：使用不同的颜色来显示每个优先级
2. descriptive：显示日志缓冲区事件说明。此修饰符仅影响事件日志缓冲区消息，不会对其他非二进制文件缓冲区产生任何影响。事件说明取自 event-log-tags 数据库
3. epoch：显示自 1970 年 1 月 1 日以来的时间（以秒为单位）
4. monotonic：显示自上次启动以来的时间（以 CPU 秒为单位）
5. printable：确保所有二进制日志记录内容都进行了转义
6. uid：如果访问控制允许，则显示 UID 或记录的进程的 Android ID
7. usec：显示精确到微秒的时间
8. UTC：显示 UTC 时间
9. year：将年份添加到显示的时间
10. zone：将本地时区添加到显示的时间

## 常用命令

### 查看指定缓冲区日志

adb logcat -b radio

adb logcat -b main -b radio -b events

adb logcat -v main,radio,events

### 滚动记录日志到文件

adb logcat -f /sdcard/log.txt -r 1 -n 5

-f: 将log输出到指定文件中
-r: 单个文件的大小上限
-n: 文件的个数

命令输出：log.txt.1 log.txt.2 log.txt.3 log.txt.4 log.txt.5

### 查看日志缓冲区的大小

```txt

 $ logcat -b all -g 100
main: ring buffer is 256Kb (245Kb consumed), max entry is 5120b, max payload is 4068b
radio: ring buffer is 256Kb (245Kb consumed), max entry is 5120b, max payload is 4068b
events: ring buffer is 256Kb (243Kb consumed), max entry is 5120b, max payload is 4068b
system: ring buffer is 256Kb (245Kb consumed), max entry is 5120b, max payload is 4068b
crash: ring buffer is 256Kb (0b consumed), max entry is 5120b, max payload is 4068b
kernel: ring buffer is 256Kb (202Kb consumed), max entry is 5120b, max payload is 4068b

```

### 输出日志统计信息

```txt

$ logcat -b all -S
size/num main               radio              events             system             crash              security           kernel
Total    34748511/543920    17967354/157500    755132/8916        2367378/31924      0/0                0/0                207326/3235
Now      249797/4230        255176/5294        254541/3028        245828/4441                                              207326/3235

Chattiest UIDs in main log buffer:                           Size   +/-  Pruned
UID   PACKAGE                                               BYTES           NUM
1001  radio                                                 33731  +11%     929
10084 cn.showmac.vsimservice                                33338  +18%     834
10033 com.android.systemui                                  32766  -45%    2373
10027 com.sunmi.baseservice                                 32541  -51%    2715
10025 sunmi.remotemanager                                   31889  3.0X
1000  system                                                31289  -8.7%   1154
  PID/UID   COMMAND LINE                                       "             " 
 1338/1000  system_server                                   29777          1154
 1898/1000  .dataservices                                    1512
10068 com.sunmi.dataService                                 30899  2.9X      18
10066 woyou.market                                           9009  3.2X
10072 com.woyou.udh                                          6392  3.1X
10029 com.sunmi.remotecontrol.pro                            5952  3.2X
10094 com.sunmi.vsim                                         1182  4.0X
10071 com.sunmi.ibeacon                                       569  3.0X

```

## logcat -help

```txt
Unrecognized Option h
Usage: logcat [options] [filterspecs]
options include:
  -s              Set default filter to silent. Equivalent to filterspec '*:S'  // 过滤标签
  -f <file>, --file=<file>               Log to file. Default is stdout         // 日志输出到文件
  -r <kbytes>, --rotate-kbytes=<kbytes>
                  Rotate log every kbytes. Requires -f option                   // 单个日志文件大小上限
  -n <count>, --rotate-count=<count>
                  Sets max number of rotated logs to <count>, default 4         // 滚动记录日志的文件个数
  -v <format>, --format=<format>
                  Sets the log print format, where <format> is:                 // 指定输出的日志格式：一般使用默认即可
                    brief color epoch long monotonic printable process raw
                    tag thread threadtime time uid usec UTC year zone
  -D, --dividers  Print dividers between each log buffer                        // 输出各个日志缓冲区之间的分隔线
  -c, --clear     Clear (flush) the entire log and exit
                  if Log to File specified, clear fileset instead
  -d              Dump the log and then exit (don't block)                      // 将缓冲区的log输出到屏幕中然后退出
  -e <expr>, --regex=<expr>
                  Only print lines where the log message matches <expr>         // 只输出日志消息与 <expr> 匹配的行，其中 <expr> 是一个正则表达式
                  where <expr> is a regular expression
  -m <count>, --max-count=<count>
                  Quit after printing <count> lines. This is meant to be        // 输出 <count> 行后退出（定量日志）
                  paired with --regex, but will work on its own.
  --print         Paired with --regex and --max-count to let content bypass     // 与--regex 和 --max-count 配对，使内容绕过正则表达式过滤器，但仍能够在获得适当数量的匹配时停止
                  regex filter but still stop at number of matches.
  -t <count>      Print only the most recent <count> lines (implies -d)         // 仅输出最新的行数。此选项包括 -d 功能 (输出缓存区的最近多少行数)
  -t '<time>'     Print most recent lines since specified time (implies -d)     // 输出自指定时间以来的最新行。此选项包括 -d 功能。要了解如何引用带有嵌入空间的参数，请参阅 -P 选项
                                                                                // adb logcat -t '01-26 20:52:41.820'

  -T <count>      Print only the most recent <count> lines (does not imply -d)  // 输出自指定时间以来的最新行数。此选项不包括 -d 功能
  -T '<time>'     Print most recent lines since specified time (not imply -d)   // 输出自指定时间以来的最新行。此选项不包括 -d 功能。要了解如何引用带有嵌入空间的参数，请参阅 -P 选项
                  count is pure numerical, time is 'MM-DD hh:mm:ss.mmm...'
                  'YYYY-MM-DD hh:mm:ss.mmm...' or 'sssss.mmm...' format
  -g, --buffer-size                      Get the size of the ring buffer.       // 输出指定日志缓冲区的大小并退出

  -G <size>, --buffer-size=<size>
                  Set size of log ring buffer, may suffix with K or M.          // 设置日志环形缓冲区的大小。可以在结尾处添加 K 或 M，以指示单位为千字节或兆字节
  -L, -last       Dump logs from prior to last reboot                           // 在最后一次重新启动之前转储日志
  -b <buffer>, --buffer=<buffer>         Request alternate ring buffer, 'main',
                  'system', 'radio', 'events', 'crash', 'default' or 'all'.     // 输出指定缓冲区的日志
                  Multiple -b parameters or comma separated list of buffers are
                  allowed. Buffers interleaved. Default -b main,system,crash.
  -B, --binary    Output the log in binary.                                     // 以二进制文件形式输出日志
  -S, --statistics                       Output statistics.                     // 在输出中包含统计信息，以帮助您识别和定位日志垃圾信息发送者
  -p, --prune     Print prune white and ~black list. Service is specified as    // 输出（读取）当前的白名单和黑名单，不采用任何参数
                  UID, UID/PID or /PID. Weighed for quicker pruning if prefix
                  with ~, otherwise weighed for longevity if unadorned. All
                  other pruning activity is oldest first. Special case ~!
                  represents an automatic quicker pruning for the noisiest
                  UID as determined by the current statistics.
  -P '<list> ...', --prune='<list> ...'
                  Set prune white and ~black list, using same format as         // 写入（设置）白名单和黑名单，以出于特定目的调整日志记录内容(控制日志输出)
                  listed above. Must be quoted.
  --pid=<pid>     Only prints logs from the given pid.                          // 仅输出来自给定 PID 的日志
  --wrap          Sleep for 2 hours or when buffer about to wrap whichever
                  comes first. Improves efficiency of polling by providing      // 休眠 2 小时或者当缓冲区即将封装时（两者取其先）。通过提供即将封装唤醒来提高轮询的效率
                  an about-to-wrap wakeup.

filterspecs are a series of 
  <tag>[:priority]

where <tag> is a log component tag (or * for all) and priority is:
  V    Verbose (default for <tag>)
  D    Debug (default for '*')
  I    Info
  W    Warn
  E    Error
  F    Fatal
  S    Silent (suppress all output)

'*' by itself means '*:D' and <tag> by itself means <tag>:V.
If no '*' filterspec or -s on command line, all filter defaults to '*:V'.
eg: '*:S <tag>' prints only <tag>, '<tag>:S' suppresses all <tag> log messages.

If not specified on the command line, filterspec is set from ANDROID_LOG_TAGS.

If not specified with -v on command line, format is set from ANDROID_PRINTF_LOG
or defaults to "threadtime"

```

