---
layout:     post
title:      WebRTC Protocol
subtitle:   WebRTC 协议
date:       2022-01-12
author:     LXG
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - webrtc
---

[WebRTC API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API)

## 概念

WebRTC (WebRTC Real-Time Communications) 是一项实时通信技术，它允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点(Peer-to-Peer)的连接，
实现视频流和音频流或者其他任意数据的传输。

## ICE

交互式连接设施 Interactivie Connectivity Establishmentb 是一个允许你的浏览器和对端浏览器建立连接的协议框架。在实际的网络中，有很多原因导致简单的从A端到B端的连接不成功，
这需要绕过阻止建立连接的防火墙，给设备分配一个唯一可见的地址。

## STUN

NAT的会话穿越功能Session Traversal Utilities for NAT(STUN) 是一个允许位于NAT后的客户端找出自己的公网地址，判断出路由器阻止直连的限制方法的协议

客户端通过给公网的STUN服务器发送请求获得自己的公网地址信息，以及能否被穿过路由器访问

![webrtc-turn](/images/webrtc/webrtc-turn.png)

```java

        iceServers.add(new PeerConnection.IceServer("stun:stun.rixtelecom.se"));
        iceServers.add(new PeerConnection.IceServer("stun:stun.schlund.de"));

```

## NAT

网络地址转换协议 Network Address Translation 用来给局域网设备映射一个公网的IP地址的协议。一般情况下局域网设备的IP被映射成路由器的公网IP和唯一的端口。

一些路由器严格限定了局域网设备的对外连接，这种情况下，即使STUN服务器识别了该局域网设备的公网IP和端口的映射，依然无法和这个私网设备建立连接。这种情况下就需要转向TURN协议

## TURN

一些路由器使用一种<对称型NAT>的NAT模型。这意味着路由器只接受和对端先前建立的连接。

NAT的中继穿越方式Traversal Using Relays around NAT (TURN) 通过TURN服务器中继所有数据的方式来绕过“对称型NAT”。你需要在TURN服务器上创建一个连接，然后告诉所有对端设备发包到服务器上，TURN服务器再把包转发给你。很显然这种方式是开销很大的，所以只有在没得选择的情况下采用。

![webrtc-turn-2](/images/webrtc/webrtc-turn-2.png)

## SDP

会话描述协议 Session Description Protocal(SDP) 是一个描述多媒体连接内容的协议，例如分辨率，格式，编码，加密算法等。所以在数据传输时两端都能够理解彼此的数据。
从技术上讲，SDP并不是一个真正的协议，而是一种数据格式，用于描述在设备之间共享媒体的连接

## 信令和视频通话

两个设备之间建立WebRTC连接需要一个信令服务器来实现双方通过网络进行连接。

WebRTC并没有提供信令传递机制，你可以使用websocket, socket.io等等，来交换彼此的令牌信息。

重要的是信令服务器并不需要理解和解释信令内容。虽然它基于SDP 但这并不重要：通过信令服务器的消息的内容实际上是一个黑盒，信令服务器并不需要关注发送的信令的内容。

## 交换会话描述信息

![WebRTC_Signaling_Diagram](/images/webrtc/WebRTC_Signaling_Diagram.svg)

[RTCSessionDescription](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCSessionDescription)

type：消息类型
sdp: 描述连接本地端SDP(Session Description Protocol)协议字符串

socket send offer to PkNZuHz_1MXYG-2bAAAF payload:

```json

{

"type":"offer",
"sdp":"v=0\r\n
       o=- 4117047937486873381 2 IN IP4 127.0.0.1\r\n
       s=-\r\n
       t=0 0\r\n
       a=group:BUNDLE audio video\r\n
       a=msid-semantic: WMS ARDAMS\r\n

       m=audio 9 UDP\/TLS\/RTP\/SAVPF 111 103 9 102 0 8 105 13 110 113 126\r\n
       c=IN IP4 0.0.0.0\r\n
       a=rtcp:9 IN IP4 0.0.0.0\r\n
       a=ice-ufrag:9zCU\r\n
       a=ice-pwd:4r5kmdSwJEi7aoM5\/7CwGQq9\r\n
       a=ice-options:trickle renomination\r\n
       a=fingerprint:sha-256 CB:68:4B:3F:A2:DE:6B:5E:8C:22:2B:7C:47:F2:D1:3E:7E:FD:8A:0A:75:59:96:75:99:45:06:8C:92:67:95:23\r\n
       a=setup:actpass\r\n
       a=mid:audio\r\n
       a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n
       a=sendrecv\r\n
       a=rtcp-mux\r\n
       a=rtpmap:111 opus\/48000\/2\r\n
       a=rtcp-fb:111 transport-cc\r\n
       a=fmtp:111 minptime=10;useinbandfec=1\r\n
       a=rtpmap:103 ISAC\/16000\r\n
       a=rtpmap:9 G722\/8000\r\n
       a=rtpmap:102 ILBC\/8000\r\n
       a=rtpmap:0 PCMU\/8000\r\n
       a=rtpmap:8 PCMA\/8000\r\n
       a=rtpmap:105 CN\/16000\r\n
       a=rtpmap:13 CN\/8000\r\n
       a=rtpmap:110 telephone-event\/48000\r\n
       a=rtpmap:113 telephone-event\/16000\r\n
       a=rtpmap:126 telephone-event\/8000\r\n
       a=ssrc:1834392586 cname:YwgZFEL73XIqLmZP\r\n
       a=ssrc:1834392586 msid:ARDAMS ARDAMSa0\r\n
       a=ssrc:1834392586 mslabel:ARDAMS\r\n
       a=ssrc:1834392586 label:ARDAMSa0\r\n

       m=video 9 UDP\/TLS\/RTP\/SAVPF 96 98 100 127 97 99 101\r\n
       c=IN IP4 0.0.0.0\r\n
       a=rtcp:9 IN IP4 0.0.0.0\r\n
       a=ice-ufrag:9zCU\r\n
       a=ice-pwd:4r5kmdSwJEi7aoM5\/7CwGQq9\r\n
       a=ice-options:trickle renomination\r\n
       a=fingerprint:sha-256 CB:68:4B:3F:A2:DE:6B:5E:8C:22:2B:7C:47:F2:D1:3E:7E:FD:8A:0A:75:59:96:75:99:45:06:8C:92:67:95:23\r\n
       a=setup:actpass\r\n
       a=mid:video\r\n
       a=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\n
       a=extmap:3 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/abs-send-time\r\n
       a=extmap:4 urn:3gpp:video-orientation\r\n
       a=extmap:5 http:\/\/www.ietf.org\/id\/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\n
       a=extmap:6 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/playout-delay\r\n
       a=sendrecv\r\n
       a=rtcp-mux\r\n
       a=rtcp-rsize\r\n
       a=rtpmap:96 VP8\/90000\r\n
       a=rtcp-fb:96 ccm fir\r\n
       a=rtcp-fb:96 nack\r\n
       a=rtcp-fb:96 nack pli\r\n
       a=rtcp-fb:96 goog-remb\r\n
       a=rtcp-fb:96 transport-cc\r\n
       a=rtpmap:98 VP9\/90000\r\n
       a=rtcp-fb:98 ccm fir\r\n
       a=rtcp-fb:98 nack\r\n
       a=rtcp-fb:98 nack pli\r\n
       a=rtcp-fb:98 goog-remb\r\n
       a=rtcp-fb:98 transport-cc\r\n
       a=rtpmap:100 red\/90000\r\n
       a=rtpmap:127 ulpfec\/90000\r\n
       a=rtpmap:97 rtx\/90000\r\n
       a=fmtp:97 apt=96\r\n
       a=rtpmap:99 rtx\/90000\r\n
       a=fmtp:99 apt=98\r\n
       a=rtpmap:101 rtx\/90000\r\n
       a=fmtp:101 apt=100\r\n
       a=ssrc-group:FID 3502754536 2768334962\r\n
       a=ssrc:3502754536 cname:YwgZFEL73XIqLmZP\r\n
       a=ssrc:3502754536 msid:ARDAMS ARDAMSv0\r\n
       a=ssrc:3502754536 mslabel:ARDAMS\r\n
       a=ssrc:3502754536 label:ARDAMSv0\r\n
       a=ssrc:2768334962 cname:YwgZFEL73XIqLmZP\r\n
       a=ssrc:2768334962 msid:ARDAMS ARDAMSv0\r\n
       a=ssrc:2768334962 mslabel:ARDAMS\r\n
       a=ssrc:2768334962 label:ARDAMSv0\r\n"
}

```

到此为止双方都知道使用什么样的代码和参数进行通信了，但是此时仍然不知道如何传递媒体数据

**Java**

```java

public class SessionDescription {
    public final SessionDescription.Type type;
    public final String description;

    public SessionDescription(SessionDescription.Type type, String description) {
        this.type = type;
        this.description = description;
    }

    public static enum Type {
        OFFER,
        PRANSWER,
        ANSWER;

        private Type() {
        }

        public String canonicalForm() {
            return this.name().toLowerCase(Locale.US);
        }

        public static SessionDescription.Type fromCanonicalForm(String canonical) {
            return (SessionDescription.Type)valueOf(SessionDescription.Type.class, canonical.toUpperCase(Locale.US));
        }
    }
}

```

## 交换 ICE 候选

两个节点需要交换ICE候选来协商具体如何连接。每一个ICE候选描述一个发送者使用的通信方法，每个节点按照他们被发现的顺序发送候选并且保持发送直到退出。

![WebRTC_ICE_Candidate_Exchange](/images/webrtc/WebRTC_ICE_Candidate_Exchange.svg)

[RTCIceCandidate](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate)

socket send candidate to PkNZuHz_1MXYG-2bAAAF payload:

```json

{
	"label": 0,
	"id": "audio",
	"candidate": "candidate:1008872818 1 udp 2122260223 192.168.1.69 46623 typ host generation 0 ufrag 9zCU network-id 4 network-cost 10"
}


{
	"label": 0,
	"id": "audio",
	"candidate": "candidate:1008872818 1 udp 2122194687 192.168.1.69 41524 typ host generation 0 ufrag 9zCU network-id 3 network-cost 900"
}

{
	"label": 1,
	"id": "video",
	"candidate": "candidate:1008872818 1 udp 2122260223 192.168.1.69 54502 typ host generation 0 ufrag 9zCU network-id 4 network-cost 10"
}

{
	"label": 1,
	"id": "video",
	"candidate": "candidate:1008872818 1 udp 2122194687 192.168.1.69 52440 typ host generation 0 ufrag 9zCU network-id 3 network-cost 900"
}

```

每个ICE消息都提供一个通信协议（TCP OR UDP）、IP地址、端口号、连接类型、NAT，以及将两台计算机连接在一起所需的其他信息。

每一端从本地的ICE层接收候选时，都会将其发送给另一方；不存在轮流或成批的候选。一旦两端就一个候选达成一致，双方就都可以用此候选来交换媒体数据，媒体数据就开始流动。即使在媒体数据已经开始流动之后，每一端都会继续向候选发送消息，直到他们没有选择的余地。这样做是为了找到比最初选择的更好的选择。

如果条件发生变化，例如网络连接恶化，一个或两个对等方可能建议切换到较低带宽的媒体分辨率，或其他编解码器。这将触发新的候选交换，之后可能会发生另一种媒体格式和/或编解码器更改。

一般来说，使用TCP的ICE候选者只有当UDP不可用或被限制时才使用。不是所有的浏览器都支持ICE over TCP。

## 会话描述

WebRTC连接上的端点配置称为会话描述。该描述包括关于要发送的媒体类型，其格式，正在使用的传输协议，端点的IP地址和端口以及描述媒体传输端店所需的其他信息。使用会话描述协议（SDP）来存储和交换该信息;

当用户对另一个用户启动WebRTC调用时，将创建一个称为提议(offer)的特定描述。 该描述包括有关呼叫者建议的呼叫配置的所有信息。 接收者然后用应答(answer)进行响应，这是他们对呼叫结束的描述。 以这种方式，两个设备彼此共享以便交换媒体数据所需的信息。 该交换是使用交互式连接建立(ICE)(ICE处理的，这是一种协议，即使两个设备通过网络地址转换(NAT)。

然后，每个对等端保持两个描述：描述本身的本地描述和描述呼叫的远端的远程描述。

在首次建立呼叫时，还可以在呼叫格式或其他配置需要更改的任何时候执行提议/应答过程。 无论是新呼叫还是重新配置现有的呼叫，这些都是交换提议和回答所必需的基本步骤，暂时忽略了ICE层：

1. 呼叫者通过 navigator.mediaDevices.getUserMedia() (en-US) 捕捉本地媒体。
2. 呼叫者创建一个RTCPeerConnection 并调用 RTCPeerConnection.addTrack() (注： addStream 已经过时。)
3. 呼叫者调用 RTCPeerConnection.createOffer() 来创建一个提议(offer).
4. 呼叫者调用 RTCPeerConnection.setLocalDescription() (en-US) 将提议(Offer) 设置为本地描述 (即，连接的本地描述).
5. setLocalDescription()之后, 呼叫者请求 STUN 服务创建ice候选(ice candidates)
6. 呼叫者通过信令服务器将提议(offer)传递至 本次呼叫的预期的接受者.
7. 接受者收到了提议(offer) 并调用 RTCPeerConnection.setRemoteDescription() 将其记录为远程描述 (也就是连接的另一端的描述).
8. 接受者做一些可能需要的步骤结束本次呼叫：捕获本地媒体，然后通过RTCPeerConnection.addTrack()添加到连接中。
9. 接受者通过 RTCPeerConnection.createAnswer() (en-US) 创建一个应答。
10. 接受者调用 RTCPeerConnection.setLocalDescription() (en-US) 将应答(answer)   设置为本地描述. 此时，接受者已经获知连接双方的配置了.
11. 接受者通过信令服务器将应答传递到呼叫者.
12. 呼叫者接受到应答.
13. 呼叫者调用 RTCPeerConnection.setRemoteDescription() 将应答设定为远程描述. 如此，呼叫者已经获知连接双方的配置了.

![webrtc_complete_diagram](/images/webrtc/webrtc_complete_diagram.png)

## 接口

**RTCPeerConnection**

表示本地计算机和远程对等方之间的 WebRtc 连接。用于处理两个对等点之间的有效数据流

```java

public class PeerConnection {
    private final List<MediaStream> localStreams;
    private final long nativePeerConnection;
    private final long nativeObserver;
    private List<RtpSender> senders;
    private List<RtpReceiver> receivers;

    PeerConnection(long nativePeerConnection, long nativeObserver) {
        this.nativePeerConnection = nativePeerConnection;
        this.nativeObserver = nativeObserver;
        this.localStreams = new LinkedList();
        this.senders = new LinkedList();
        this.receivers = new LinkedList();
    }

    public native SessionDescription getLocalDescription();

    public native SessionDescription getRemoteDescription();

    public native DataChannel createDataChannel(String var1, Init var2);

    public native void createOffer(SdpObserver var1, MediaConstraints var2);

    public native void createAnswer(SdpObserver var1, MediaConstraints var2);

    public native void setLocalDescription(SdpObserver var1, SessionDescription var2);

    public native void setRemoteDescription(SdpObserver var1, SessionDescription var2);

    public boolean setConfiguration(PeerConnection.RTCConfiguration config) {
        return this.nativeSetConfiguration(config, this.nativeObserver);
    }

    public boolean addIceCandidate(IceCandidate candidate) {
        return this.nativeAddIceCandidate(candidate.sdpMid, candidate.sdpMLineIndex, candidate.sdp);
    }

    public boolean removeIceCandidates(IceCandidate[] candidates) {
        return this.nativeRemoveIceCandidates(candidates);
    }

    public boolean addStream(MediaStream stream) {
        boolean ret = this.nativeAddLocalStream(stream.nativeStream);
        if (!ret) {
            return false;
        } else {
            this.localStreams.add(stream);
            return true;
        }
    }

    public void removeStream(MediaStream stream) {
        this.nativeRemoveLocalStream(stream.nativeStream);
        this.localStreams.remove(stream);
    }

    public RtpSender createSender(String kind, String stream_id) {
        RtpSender new_sender = this.nativeCreateSender(kind, stream_id);
        if (new_sender != null) {
            this.senders.add(new_sender);
        }

        return new_sender;
    }

    public List<RtpSender> getSenders() {
        Iterator var1 = this.senders.iterator();

        while(var1.hasNext()) {
            RtpSender sender = (RtpSender)var1.next();
            sender.dispose();
        }

        this.senders = this.nativeGetSenders();
        return Collections.unmodifiableList(this.senders);
    }

    public List<RtpReceiver> getReceivers() {
        Iterator var1 = this.receivers.iterator();

        while(var1.hasNext()) {
            RtpReceiver receiver = (RtpReceiver)var1.next();
            receiver.dispose();
        }

        this.receivers = this.nativeGetReceivers();
        return Collections.unmodifiableList(this.receivers);
    }

    public void getStats(RTCStatsCollectorCallback callback) {
        this.nativeNewGetStats(callback);
    }

    public boolean startRtcEventLog(int file_descriptor, int max_size_bytes) {
        return this.nativeStartRtcEventLog(file_descriptor, max_size_bytes);
    }

    public void stopRtcEventLog() {
        this.nativeStopRtcEventLog();
    }

    public native PeerConnection.SignalingState signalingState();

    public native PeerConnection.IceConnectionState iceConnectionState();

    public native PeerConnection.IceGatheringState iceGatheringState();

    public native void close();

    public void dispose() {
        this.close();
        Iterator var1 = this.localStreams.iterator();

        while(var1.hasNext()) {
            MediaStream stream = (MediaStream)var1.next();
            this.nativeRemoveLocalStream(stream.nativeStream);
            stream.dispose();
        }

        this.localStreams.clear();
        var1 = this.senders.iterator();

        while(var1.hasNext()) {
            RtpSender sender = (RtpSender)var1.next();
            sender.dispose();
        }

        this.senders.clear();
        var1 = this.receivers.iterator();

        while(var1.hasNext()) {
            RtpReceiver receiver = (RtpReceiver)var1.next();
            receiver.dispose();
        }

        this.receivers.clear();
        freePeerConnection(this.nativePeerConnection);
        freeObserver(this.nativeObserver);
    }

    private static native void freePeerConnection(long var0);

    private static native void freeObserver(long var0);

    public native boolean nativeSetConfiguration(PeerConnection.RTCConfiguration var1, long var2);

    private native boolean nativeAddIceCandidate(String var1, int var2, String var3);

    private native boolean nativeRemoveIceCandidates(IceCandidate[] var1);

    private native boolean nativeAddLocalStream(long var1);

    private native void nativeRemoveLocalStream(long var1);

    private native boolean nativeOldGetStats(StatsObserver var1, long var2);

    private native void nativeNewGetStats(RTCStatsCollectorCallback var1);

    private native RtpSender nativeCreateSender(String var1, String var2);

    private native List<RtpSender> nativeGetSenders();

    private native List<RtpReceiver> nativeGetReceivers();

    private native boolean nativeStartRtcEventLog(int var1, int var2);

    private native void nativeStopRtcEventLog();

    static {
        System.loadLibrary("jingle_peerconnection_so");
    }


}

```

**RTCDataChannel**

表示连接的两个对等方之间的双向数据通道

```java


public class DataChannel {
    private final long nativeDataChannel;
    private long nativeObserver;

    public DataChannel(long nativeDataChannel) {
        this.nativeDataChannel = nativeDataChannel;
    }

    public void registerObserver(DataChannel.Observer observer) {
        if (this.nativeObserver != 0L) {
            this.unregisterObserverNative(this.nativeObserver);
        }

        this.nativeObserver = this.registerObserverNative(observer);
    }

    private native long registerObserverNative(DataChannel.Observer var1);

    public void unregisterObserver() {
        this.unregisterObserverNative(this.nativeObserver);
    }

    private native void unregisterObserverNative(long var1);

    public native String label();

    public native int id();

    public native DataChannel.State state();

    public native long bufferedAmount();

    public native void close();

    public boolean send(DataChannel.Buffer buffer) {
        byte[] data = new byte[buffer.data.remaining()];
        buffer.data.get(data);
        return this.sendNative(data, buffer.binary);
    }

    private native boolean sendNative(byte[] var1, boolean var2);

    public native void dispose();

    public static enum State {
        CONNECTING,
        OPEN,
        CLOSING,
        CLOSED;

        private State() {
        }
    }

}

```

**RTCSessionDescription**

表示会话的参数。每一个RTCSessionDescription包含一个描述type, 表明它描述了提供/应答协商过程的哪一部分以及会话的SDP描述符

```java

public class SessionDescription {
    public final SessionDescription.Type type;
    public final String description;

    public SessionDescription(SessionDescription.Type type, String description) {
        this.type = type;
        this.description = description;
    }

    public static enum Type {
        OFFER,
        PRANSWER,
        ANSWER;

        private Type() {
        }

        public String canonicalForm() {
            return this.name().toLowerCase(Locale.US);
        }

        public static SessionDescription.Type fromCanonicalForm(String canonical) {
            return (SessionDescription.Type)valueOf(SessionDescription.Type.class, canonical.toUpperCase(Locale.US));
        }
    }
}

```

**RTCIceCandidate**

表示一个候选交互式连接建立 ICE 服务器，用于建立一个 RTCPeerConnection

```java

public class IceCandidate {
    public final String sdpMid;
    public final int sdpMLineIndex;
    public final String sdp;
    public final String serverUrl;

    public IceCandidate(String sdpMid, int sdpMLineIndex, String sdp) {
        this.sdpMid = sdpMid;
        this.sdpMLineIndex = sdpMLineIndex;
        this.sdp = sdp;
        this.serverUrl = "";
    }

    private IceCandidate(String sdpMid, int sdpMLineIndex, String sdp, String serverUrl) {
        this.sdpMid = sdpMid;
        this.sdpMLineIndex = sdpMLineIndex;
        this.sdp = sdp;
        this.serverUrl = serverUrl;
    }

    public String toString() {
        return this.sdpMid + ":" + this.sdpMLineIndex + ":" + this.sdp + ":" + this.serverUrl;
    }
}

```

**ScreenCapturerAndroid**

only > android 7

```java

@TargetApi(21)
public class ScreenCapturerAndroid implements VideoCapturer, OnTextureFrameAvailableListener {

}

```

**MediaStream**

表示媒体内容流。一个流由多个轨道组成，例如视频或者音频轨道。

```java

public class MediaStream {
    public final LinkedList<AudioTrack> audioTracks = new LinkedList();
    public final LinkedList<VideoTrack> videoTracks = new LinkedList();
    public final LinkedList<VideoTrack> preservedVideoTracks = new LinkedList();
    final long nativeStream;

    public MediaStream(long nativeStream) {
        this.nativeStream = nativeStream;
    }

    public boolean addTrack(AudioTrack track) {
        if (nativeAddAudioTrack(this.nativeStream, track.nativeTrack)) {
            this.audioTracks.add(track);
            return true;
        } else {
            return false;
        }
    }

    public boolean addTrack(VideoTrack track) {
        if (nativeAddVideoTrack(this.nativeStream, track.nativeTrack)) {
            this.videoTracks.add(track);
            return true;
        } else {
            return false;
        }
    }

}

```






















