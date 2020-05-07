---
layout:     post
title:      Android EventBus
subtitle:   事件总线
date:       2020-05-07
author:     LXG
header-img: img/post-bg-map.jpg
catalog: true
tags:
    - EventBus
---

[Android_System_UI_EventBus](http://dogee.tech/2016/09/05/2016-09-05_Android_System_UI_EventBus/)

[SystemUI的EventBus实现原理-简书](https://www.jianshu.com/p/9c26c69fa08a)

## EventBus

![event_bus](/images/eventbus/event_bus.webp)

EventBus的处理流程是订阅者在EventBus中register(订阅)事件，当发布者发送出事件时，EventBus根据事件查找到订阅了该事件的订阅者列表，并逐一调用订阅者的onBusEvent()事件响应函数，把事件传给订阅者处理。

## SystemUI EventBus

[EventBus.java](http://androidxref.com/7.1.2_r36/xref/frameworks/base/packages/SystemUI/src/com/android/systemui/recents/events/EventBus.java)

### 类图

![event_bus_class](/images/eventbus/event_bus_class.png)

### 注册订阅者

![event_bus_register](/images/eventbus/event_bus_register.png)

```java

public class EventBus extends BroadcastReceiver {

    /**
     * Proguard must also know, and keep, all methods matching this signature.
     * <p>
     * -keepclassmembers class ** {
     * public void onBusEvent(**);
     * public void onInterprocessBusEvent(**);
     * }
     */
    private static final String METHOD_PREFIX = "onBusEvent";
    private static final String INTERPROCESS_METHOD_PREFIX = "onInterprocessBusEvent";

    /**
     * Map from event class -> event handler list.  Keeps track of the actual mapping from event
     * to subscriber method.
     */
    private HashMap<Class<? extends Event>, ArrayList<EventHandler>> mEventTypeMap = new HashMap<>();

    /**
     * Map from subscriber class -> event handler method lists.  Used to determine upon registration
     * of a new subscriber whether we need to read all the subscriber's methods again using
     * reflection or whether we can just add the subscriber to the event type map.
     */
    private HashMap<Class<? extends Object>, ArrayList<EventHandlerMethod>> mSubscriberTypeMap = new HashMap<>();

    /**
     * Map from interprocess event name -> interprocess event class.  Used for mapping the event
     * name after receiving the broadcast, to the event type.  After which a new instance is created
     * and posted in the local process.
     */
    private HashMap<String, Class<? extends InterprocessEvent>> mInterprocessEventNameMap = new HashMap<>();

    /**
     * Set of all currently registered subscribers
     */
    private ArrayList<Subscriber> mSubscribers = new ArrayList<>();

}

```



