---
layout:     post
title:      Android StateMachine
subtitle:   状态机
date:       2019-08-28
author:     LXG
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - android
    - StateMachine
---

[Android StateMachine-简书](https://www.jianshu.com/p/4f01cb96f8c2)

### 概念

StateMachine在状态机的类别中属于有限状态机（Finite state machine），简称FSM，属于状态设计模式中Context环境类，
适用于需要在复杂状态与业务之间进行切换的场景，如游戏当中人物的走、跑、攻击，会经常在这几个状态之中进行切换,运用状态机能保证项目的可拓展性，提高可读性。


### 如何使用

StateMachine的基本使用必须按如下四个步骤进行，缺一不可：

1. 继承StateMachine，StateMachine类的构造函数是Protect访问权限，所以只能通过继承实现实例化
2. 通过addState方法构造状态层次结构（树形结构，可多棵），状态层次结构根据状态转移图构建，各种状态需要继承State类，实现自己相应业务逻辑
3. 通过setInitialState设置初始状态
4. 调用start方法启动状态机

[StateMachine.java](http://androidxref.com/7.1.2_r36/xref/frameworks/base/core/java/com/android/internal/util/StateMachine.java)

```java

public class StateMachine {

    // Name of the state machine and used as logging tag
    private String mName;

    private SmHandler mSmHandler;
    private HandlerThread mSmThread;

    private static class SmHandler extends Handler {

        /** The map of all of the states in the state machine */
        private HashMap<State, StateInfo> mStateInfo = new HashMap<State, StateInfo>();

        /** The initial state that will process the first message */
        private State mInitialState;

        /**
         * Constructor
         *
         * @param looper for dispatching messages
         * @param sm the hierarchical state machine
         */
        private SmHandler(Looper looper, StateMachine sm) {
            super(looper);
            mSm = sm;

            // 添加空闲状态与退出状态
            addState(mHaltingState, null);
            addState(mQuittingState, null);
        }

    }

    /**
     * Initialize.
     *
     * @param looper for this state machine
     * @param name of the state machine
     */
    private void initStateMachine(String name, Looper looper) {
        mName = name;
        mSmHandler = new SmHandler(looper, this);
    }

    /**
     * Constructor creates a StateMachine with its own thread.
     *
     * @param name of the state machine
     */
    protected StateMachine(String name) {
        mSmThread = new HandlerThread(name);
        mSmThread.start();
        Looper looper = mSmThread.getLooper();

        initStateMachine(name, looper);
    }

    /**
     * Add a new state to the state machine
     * @param state the state to add
     * @param parent the parent of state
     */
    protected final void addState(State state, State parent) {
        mSmHandler.addState(state, parent);
    }

    /**
     * Set the initial state. This must be invoked before
     * and messages are sent to the state machine.
     *
     * @param initialState is the state which will receive the first message.
     */
    protected final void setInitialState(State initialState) {
        mSmHandler.setInitialState(initialState);
    }

}

```

1. 通过addState函数初始化状态机的状态层次结构，该层次结构由SmHandler中的HashMap<State,StateInfo> mStateInfo来存储表示。
2. 通过setInitialState方法设置初始状态




