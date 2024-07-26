---
layout:     post
title:      Android SystemUI
subtitle:   SystemUI is a persistent process that provides UI for the system but outside of the system_server process.
date:       2019-03-22
author:     LXG
header-img: img/post-bg-rwd.jpg
catalog: true
tags:
    - android
    - systemui
---

[SystemUI-googlesource](https://android.googlesource.com/platform/frameworks/base/+/master/packages/SystemUI/README.md)

[SystemUI-developer](https://developer.android.com/training/system-ui)

### android N

[SystemUI-简书](https://www.jianshu.com/p/13409f91646e)

[config.xml-AndroidXRef](http://androidxref.com/7.1.2_r36/xref/frameworks/base/packages/SystemUI/res/values/config.xml)

```xml
    <!-- The default tiles to display in QuickSettings -->
    <string name="quick_settings_tiles_default" translatable="false">
        wifi,cell,battery,dnd,flashlight,rotation,bt,airplane
    </string>
```

### android M

[SystemUI-简书](https://www.jianshu.com/p/0ab1279465fa)


### 架构

![systemui](/images/android/systemui/systemui.png)



