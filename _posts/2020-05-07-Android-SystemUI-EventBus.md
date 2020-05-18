---
layout:     post
title:      Android SystemUI EventBus
subtitle:   事件总线
date:       2020-05-07
author:     LXG
header-img: img/post-bg-android.jpg
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

### 发送事件

![event_bus_sendevent](/images/eventbus/event_bus_sendevent.png)

### 注册日志

```txt

1970-11-15 07:58:58.701 1743-1743/? D/EventBus: [1743, u0] New EventBus
1970-11-15 07:58:58.701 1743-1743/? D/EventBus: [1743, u0] registerSubscriber(Recents)
1970-11-15 07:58:58.702 1743-1743/? D/EventBus: [1743, u0] Subscriber class type requires registration
1970-11-15 07:58:58.702 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -get0
1970-11-15 07:58:58.702 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -get1
1970-11-15 07:58:58.702 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -get2
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -get3
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -get4
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -set0
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -wrap0
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: -wrap1
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: getConfiguration
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: getDebugFlags
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: getMetricsCounterForResizeMode
1970-11-15 07:58:58.703 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: getSystemServices
1970-11-15 07:58:58.704 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: getTaskLoader
1970-11-15 07:58:58.704 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: isUserSetup
1970-11-15 07:58:58.704 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: logDockAttempt
1970-11-15 07:58:58.704 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: postToSystemUser
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: proxyToOverridePackage
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: registerWithSystemUser
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be public: runAndFlushOnConnectRunnables
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: cancelPreloadingRecents
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: dockTopTask
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: getSystemUserCallbacks
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: hideRecents
1970-11-15 07:58:58.705 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: onBootCompleted
1970-11-15 07:58:58.706 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: ConfigurationChangedEvent interprocess? false
1970-11-15 07:58:58.706 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: DockedTopTaskEvent interprocess? false
1970-11-15 07:58:58.706 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: RecentsActivityStartingEvent interprocess? false
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: RecentsVisibilityChangedEvent interprocess? false
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: ScreenPinningRequestEvent interprocess? false
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: ShowUserToastEvent interprocess? false
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   * Method: onBusEvent event: RecentsDrawnEvent interprocess? false
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: onConfigurationChanged
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: onDraggingInRecents
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: onDraggingInRecentsEnded
1970-11-15 07:58:58.707 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: preloadRecents
1970-11-15 07:58:58.708 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: showNextAffiliatedTask
1970-11-15 07:58:58.708 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: showPrevAffiliatedTask
1970-11-15 07:58:58.708 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: showRecents
1970-11-15 07:58:58.708 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: start
1970-11-15 07:58:58.708 1743-1743/? D/EventBus: [1743, u0]   Expected method to be final: toggleRecents
1970-11-15 07:58:58.708 1743-1743/? D/EventBus: [1743, u0] Registered Recents in 6662 microseconds

// SystemUI registerSubscriber

1970-11-15 08:05:58.907 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(Recents)
1970-11-15 08:05:58.915 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(SystemServicesProxy)
1970-11-15 08:05:58.925 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(RecentsTaskLoader)
1970-11-15 08:05:59.285 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(ForcedResizableInfoActivityController)
1970-11-15 08:05:59.379 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(DividerView)
1970-11-15 08:06:00.889 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(RecentsVisibilityObserver)
1970-11-15 08:06:23.213 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(RecentsActivity)
1970-11-15 08:06:23.854 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(SystemBarScrimViews)
1970-11-15 08:06:23.856 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(RecentsView)   //屏幕固定
1970-11-15 08:06:23.860 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(RecentsViewTouchHandler)
1970-11-15 08:06:23.862 1762-1762/com.android.systemui D/EventBus: [1762, u0] registerSubscriber(TaskStackView)


```

### 事件发送和处理（屏幕固定）

```

1970-11-15 08:10:17.218 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(UserInteractionEvent)
1970-11-15 08:10:17.218 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> TaskStackView [0x5a42352, P3] onBusEvent(UserInteractionEvent)
1970-11-15 08:10:17.218 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(UserInteractionEvent) duration: 55 microseconds, avg: 753
1970-11-15 08:10:17.218 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(UserInteractionEvent)
1970-11-15 08:10:17.219 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(UserInteractionEvent) duration: 40 microseconds, avg: 737
1970-11-15 08:10:17.351 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(LaunchTaskEvent)
1970-11-15 08:10:17.352 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> TaskStackView [0x5a42352, P3] onBusEvent(LaunchTaskEvent)
1970-11-15 08:10:17.352 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(LaunchTaskEvent) duration: 64 microseconds, avg: 722
1970-11-15 08:10:17.352 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsView [0xb00dcab, P3] onBusEvent(LaunchTaskEvent)
1970-11-15 08:10:17.354 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(LaunchTaskStartedEvent)
1970-11-15 08:10:17.355 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> TaskStackView [0x5a42352, P3] onBusEvent(LaunchTaskStartedEvent)
1970-11-15 08:10:17.357 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(LaunchTaskStartedEvent) duration: 2012 microseconds, avg: 750
1970-11-15 08:10:17.387 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(LaunchTaskSucceededEvent)
1970-11-15 08:10:17.387 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(LaunchTaskSucceededEvent)
1970-11-15 08:10:17.387 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(LaunchTaskSucceededEvent) duration: 142 microseconds, avg: 737
1970-11-15 08:10:17.427 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(LaunchTaskEvent) duration: 74937 microseconds, avg: 2283
1970-11-15 08:10:17.430 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(UserInteractionEvent)
1970-11-15 08:10:17.431 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> TaskStackView [0x5a42352, P3] onBusEvent(UserInteractionEvent)
1970-11-15 08:10:17.431 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(UserInteractionEvent) duration: 65 microseconds, avg: 2237
1970-11-15 08:10:17.431 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(UserInteractionEvent)
1970-11-15 08:10:17.431 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(UserInteractionEvent) duration: 64 microseconds, avg: 2194
1970-11-15 08:10:17.513 1762-1762/com.android.systemui D/EventBus: [1762, u0] post(HideRecentsEvent)
1970-11-15 08:10:17.533 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(HideRecentsEvent)
1970-11-15 08:10:17.534 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(HideRecentsEvent) duration: 16 microseconds, avg: 2151
1970-11-15 08:10:17.621 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(CancelEnterRecentsWindowAnimationEvent)
1970-11-15 08:10:17.622 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(CancelEnterRecentsWindowAnimationEvent)
1970-11-15 08:10:17.625 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(CancelEnterRecentsWindowAnimationEvent) duration: 2935 microseconds, avg: 2166
1970-11-15 08:10:17.625 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(ExitRecentsWindowFirstAnimationFrameEvent)
1970-11-15 08:10:17.625 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(ExitRecentsWindowFirstAnimationFrameEvent)
1970-11-15 08:10:17.625 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(ExitRecentsWindowFirstAnimationFrameEvent) duration: 97 microseconds, avg: 2127
1970-11-15 08:10:17.965 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(AppTransitionFinishedEvent)
1970-11-15 08:10:17.965 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> ForcedResizableInfoActivityController [0x374d109, P1] onBusEvent(AppTransitionFinishedEvent)
1970-11-15 08:10:17.966 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(AppTransitionFinishedEvent) duration: 77 microseconds, avg: 2089
1970-11-15 08:10:17.966 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(AppTransitionFinishedEvent)
1970-11-15 08:10:17.966 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> ForcedResizableInfoActivityController [0x374d109, P1] onBusEvent(AppTransitionFinishedEvent)
1970-11-15 08:10:17.966 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(AppTransitionFinishedEvent) duration: 61 microseconds, avg: 2052
1970-11-15 08:10:17.977 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(ScreenPinningRequestEvent)
1970-11-15 08:10:17.977 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsActivity [0xc269e06, P2] onBusEvent(ScreenPinningRequestEvent)
1970-11-15 08:10:17.978 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(ScreenPinningRequestEvent) duration: 167 microseconds, avg: 2019
1970-11-15 08:10:17.978 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> Recents [0x82efb, P1] onBusEvent(ScreenPinningRequestEvent)
1970-11-15 08:10:17.993 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(ScreenPinningRequestEvent) duration: 15546 microseconds, avg: 2256
1970-11-15 08:10:19.748 1762-1762/com.android.systemui D/EventBus: [1762, u0] send(RecentsVisibilityChangedEvent)
1970-11-15 08:10:19.749 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> RecentsVisibilityObserver [0x28f3653, P1] onBusEvent(RecentsVisibilityChangedEvent)
1970-11-15 08:10:19.749 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(RecentsVisibilityChangedEvent) duration: 592 microseconds, avg: 2227
1970-11-15 08:10:19.750 1762-1762/com.android.systemui D/EventBus: [1762, u0]  -> Recents [0x82efb, P1] onBusEvent(RecentsVisibilityChangedEvent)
1970-11-15 08:10:19.750 1762-1762/com.android.systemui D/EventBus: [1762, u0] onBusEvent(RecentsVisibilityChangedEvent) duration: 224 microseconds, avg: 2193

```

## 小结

整个EventBus的实现有很多巧妙的地方。
这里充分利用了函数签名和函数名称的一致性，建立了一套EventBus的Subscriber框架。
实现了代码级别的功能解耦，使得同一个事件可以被不同的Subscriber对象所处理，对于Subscriber而言，只需要关注自己关心的那一块即可。

