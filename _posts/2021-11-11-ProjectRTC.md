---
layout:     post
title:      ProjectRTC
subtitle:   android webrtc remote control
date:       2021-11-11
author:     LXG
header-img: img/post-bg-android.jpg
catalog: true
tags:
    - webrtc
---

[AndroidRTC](https://github.com/pchab/AndroidRTC)

## 服务器

```txt

-------------server init----------------

load streams.js
load routes.js
load socketHandler.js
Express server listening on port 3000

-------------web client---------------

Get Home index
GET / 200 16.896 ms - 1911
GET /stylesheets/style.css 200 8.697 ms - 1087
GET /javascripts/rtcClient.js 200 7.736 ms - 5590
GET /javascripts/app.js 200 6.848 ms - 4791
GET /javascripts/adapter.js 200 4.888 ms - 7789
socketHandler.js-------- -zzMdMZpp35j7eO7AAAA joined --
routes.js--------------displayStreams: Get streams as JSON
streams.js------------getStreams
GET /streams.json 200 2.081 ms - 2

--------------android client--------------

GET /stylesheets/style.css 200 1.894 ms - 1087
socketHandler.js-------- CYFpq45PF0YipCnUAAAB joined --
socketHandler.js--------CYFpq45PF0YipCnUAAAB is ready to stream --
streams.js------------addStream: CYFpq45PF0YipCnUAAAB


---------------call remote----------------------

socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message
socketHandler.js--------client on message

```

### app.js

```js

var express = require('express')
,	path = require('path')
,	streams = require('./app/streams.js')();

var favicon = require('serve-favicon')
,	logger = require('morgan')
,	methodOverride = require('method-override')
,	bodyParser = require('body-parser')
,	errorHandler = require('errorhandler');

var https = require("https");  //1.
var fs = require("fs");  //2.

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

const httpsOption = {                         //3.
  key : fs.readFileSync("ssl/server.key"),
  cert: fs.readFileSync("ssl/server.crt")
}

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// routing
require('./app/routes.js')(app, streams);

//var server = app.listen(app.get('port'), function(){  //4.
//  console.log('Express server listening on port ' + app.get('port'));
//});

var Httpsserver = https.createServer(httpsOption, app).listen(app.get('port'), function(){    //5.
  console.log('Express server listening on port ' + app.get('port'));
});

//var io = require('socket.io').listen(server);      //6.
var io = require('socket.io').listen(Httpsserver);   //7.

/**
 * Socket.io event handling
 */
require('./app/socketHandler.js')(io, streams);

```

### socketHandler.js

设备消息处理入口

```js

module.exports = function(io, streams) {

  console.log("load socketHandler.js");

  io.on('connection', function(client) {
    console.log('socketHandler.js-------- ' + client.id + ' joined --');
    client.emit('id', client.id);

    client.on('message', function (details) {                                // 控制建立的消息通道
      console.log("socketHandler.js--------client on message");
      var otherClient = io.sockets.connected[details.to];

      if (!otherClient) {
        return;
      }
        delete details.to;
        details.from = client.id;
        otherClient.emit('message', details);
    });
      
    client.on('readyToStream', function(options) {
      console.log('socketHandler.js--------' + client.id + ' is ready to stream --');
      
      streams.addStream(client.id, options.name); 
    });
    
    client.on('update', function(options) {
      console.log("socketHandler.js--------client update");
      streams.update(client.id, options.name);
    });

    function leave() {
      console.log('socketHandler.js-------- ' + client.id + ' left --');
      streams.removeStream(client.id);
    }

    client.on('disconnect', leave);
    client.on('leave', leave);
  });
};

```

### streams.js

创建视频流

```js

module.exports = function() {

  console.log("load streams.js");

  /**
   * available streams 
   * the id value is considered unique (provided by socket.io)
   */
  var streamList = [];

  /**
   * Stream object
   */
  var Stream = function(id, name) {
    this.name = name;
    this.id = id;
  }

  return {
    addStream : function(id, name) {
      console.log("streams.js------------addStream: " + id);
      var stream = new Stream(id, name);
      streamList.push(stream);
    },

    removeStream : function(id) {
      console.log("streams.js------------removeStream");
      var index = 0;
      while(index < streamList.length && streamList[index].id != id){
        index++;
      }
      streamList.splice(index, 1);
    },

    // update function
    update : function(id, name) {
      console.log("streams.js------------update");
      var stream = streamList.find(function(element, i, array) {
        return element.id == id;
      });
      stream.name = name;
    },

    getStreams : function() {
      console.log("streams.js------------getStreams");
      return streamList;
    }
  }
};

```

### routes.js

视频流显示

```js

module.exports = function(app, streams) {

  console.log("load routes.js");

  // GET home 
  var index = function(req, res) {
    console.log("Get Home index");
    res.render('index', { 
                          title: 'Project RTC', 
                          header: 'WebRTC live streaming',
                          username: 'Username',
                          share: 'Share this link',
                          footer: 'pierre@chabardes.net',
                          id: req.params.id
                        });
  };

  // GET streams as JSON
  var displayStreams = function(req, res) {
    console.log("routes.js--------------displayStreams: Get streams as JSON");
    var streamList = streams.getStreams();
    // JSON exploit to clone streamList.public
    var data = (JSON.parse(JSON.stringify(streamList))); 

    res.status(200).json(data);
  };

  app.get('/streams.json', displayStreams);
  app.get('/', index);
  app.get('/:id', index);
}

```

## PC Web客户端

```txt

----------------------------------web client join in------------------

load adapter.js
adapter.js:147 adapter.js-----------This appears to be Chrome
app.js:3 load app.js
app.js:9 app.js----------new PeerManager
rtcClient.js:3 load rtcClient.js
app.js:21 app.js----------app.factory
app.js:135 app.controller: LocalStreamController
app.js:59 app.controller: RemoteStreamsController
app.js:68 app.js----------rtc.loaddata
app.js:71 app.js----------http get streams.json success

----------------------------------call remote--------------------------------

app.js----------rtc.call
adapter.js:223 adapter.js-----------requestUserMedia
adapter.js:233 adapter.js-----------getUserMedia
app.js:28 app.js----------camera start
adapter.js:202 adapter.js----------attachMediaStream
rtcClient.js:145 rtcClient.js------------setLocalStream
app.js:142 app.js----------local cameraIsOn
rtcClient.js:162 rtcClient.js-------toggleLocalStream
rtcClient.js:32 rtcClient.js-------addPeer
rtcClient.js:187 rtcClient.js-------new RTCPeerConnection
adapter.js:191 adapter.js-----------new webkitRTCPeerConnection
rtcClient.js:168 rtcClient.js-------peerInit
rtcClient.js:122 rtcClient.js-------sending init to CYFpq45PF0YipCnUAAAB
rtcClient.js:96 rtcClient.js-------received offer from CYFpq45PF0YipCnUAAAB
rtcClient.js:70 rtcClient.js-------answer
rtcClient.js:45 rtcClient.js-------onaddstream
adapter.js:202 adapter.js----------attachMediaStream
rtcClient.js:122 rtcClient.js-------sending answer to CYFpq45PF0YipCnUAAAB
rtcClient.js:96 rtcClient.js-------received candidate from CYFpq45PF0YipCnUAAAB
rtcClient.js:55 rtcClient.js-------oniceconnectionstatechange
rtcClient.js:35 rtcClient.js-------onicecandidate
rtcClient.js:122 rtcClient.js-------sending candidate to CYFpq45PF0YipCnUAAAB
rtcClient.js:35 rtcClient.js-------onicecandidate
rtcClient.js:122 rtcClient.js-------sending candidate to CYFpq45PF0YipCnUAAAB
3rtcClient.js:96 rtcClient.js-------received candidate from CYFpq45PF0YipCnUAAAB
rtcClient.js:55 rtcClient.js-------oniceconnectionstatechange
rtcClient.js:35 rtcClient.js-------onicecandidate

```

### adapter.js

处理不同浏览器的适配

```js

'use strict';

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

console.log("load adapter.js");

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ' + text);
  } else {
    console.log(text);
  }
}


if (navigator.mozGetUserMedia) {
  // Firefox 浏览器
} else if (navigator.webkitGetUserMedia) {
  // Chrome 浏览器
  console.log('adapter.js-----------This appears to be Chrome');                      // 第一步

  webrtcDetectedBrowser = 'chrome';
  // Temporary fix until crbug/374263 is fixed.
  // Setting Chrome version to 999, if version is unavailable.
  var result = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  if (result !== null) {
    webrtcDetectedVersion = parseInt(result[2], 10);
  } else {
    webrtcDetectedVersion = 999;
  }

  // Creates iceServer from the url for Chrome M33 and earlier.
  window.createIceServer = function(url, username, password) {
    console.log("adapter.js-----------createIceServer");
    var iceServer = null;
    var urlParts = url.split(':');
    if (urlParts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = {
        'url': url
      };
    } else if (urlParts[0].indexOf('turn') === 0) {
      // Chrome M28 & above uses below TURN format.
      iceServer = {
        'url': url,
        'credential': password,
        'username': username
      };
    }
    return iceServer;
  };

  // Creates an ICEServer object from multiple URLs.
  window.createIceServers = function(urls, username, password) {
    return {
      'urls': urls,
      'credential': password,
      'username': username
    };
  };

  // The RTCPeerConnection object.
  RTCPeerConnection = function(pcConfig, pcConstraints) {
    console.log("adapter.js-----------new webkitRTCPeerConnection");
    return new webkitRTCPeerConnection(pcConfig, pcConstraints);
  };

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {                //第十一步
    console.log("adapter.js----------attachMediaStream");
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };
} else {
  console.log('Browser does not appear to be WebRTC-capable');
}

// Returns the result of getUserMedia as a Promise.
function requestUserMedia(constraints) {                       // 第十步
  console.log("adapter.js-----------requestUserMedia");
  return new Promise(function(resolve, reject) {
    var onSuccess = function(stream) {
      resolve(stream);
    };
    var onError = function(error) {
      reject(error);
    };

    try {
      console.log("adapter.js-----------getUserMedia");
      getUserMedia(constraints, onSuccess, onError);
    } catch (e) {
      reject(e);
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    RTCPeerConnection: RTCPeerConnection,
    getUserMedia: getUserMedia,
    attachMediaStream: attachMediaStream,
    reattachMediaStream: reattachMediaStream,
    webrtcDetectedBrowser: webrtcDetectedBrowser,
    webrtcDetectedVersion: webrtcDetectedVersion
    //requestUserMedia: not exposed on purpose.
    //trace: not exposed on purpose.
  };
}

```

### app.js

前端入口， 处理前端页面交互， Camera 打开， 开启远程控制

```js

(function(){

	console.log("load app.js");

	var app = angular.module('projectRtc', [],
		function($locationProvider){$locationProvider.html5Mode(true);}
    );

	console.log("app.js----------new PeerManager")

	var client = new PeerManager();                                 // 第二步
	var mediaConfig = {
        audio:true,
        video: {
			mandatory: {},
			optional: []
        }
    };

    app.factory('camera', ['$rootScope', '$window', function($rootScope, $window){
	console.log("app.js----------app.factory");                                 // 第四步
    	var camera = {};
    	camera.preview = $window.document.getElementById('localVideo');   // 界面本地视频流显示元素

        // 打开 PC Camera
    	camera.start = function(){
			return requestUserMedia(mediaConfig)                        // 第十步 打开PC Camera
			.then(function(stream){
				console.log("app.js----------camera start");			
				attachMediaStream(camera.preview, stream);
				client.setLocalStream(stream);
				camera.stream = stream;
				$rootScope.$broadcast('cameraIsOn',true);
			})
			.catch(Error('Failed to get access to local media.'));
		};

        // 关闭 PC Camera
    	camera.stop = function(){
    		return new Promise(function(resolve, reject) {
				try {
					console.log("app.js----------camera stop");
					//camera.stream.stop() no longer works
          				for( var track in camera.stream.getTracks() ){
            					track.stop();
          				}
					camera.preview.src = '';
					resolve();
				} catch(error) {
					reject(error);
				}
    		})
    		.then(function(result){
    			$rootScope.$broadcast('cameraIsOn',false);
    		});	
		};
		return camera;
    }]);

	// 远程视频流控制器
	app.controller('RemoteStreamsController', ['camera', '$location', '$http', function(camera, $location, $http){
		console.log("app.controller: RemoteStreamsController");                    // 第六步
		var rtc = this;
		rtc.remoteStreams = [];
		function getStreamById(id) {
		    for(var i=0; i<rtc.remoteStreams.length;i++) {
		    	if (rtc.remoteStreams[i].id === id) {return rtc.remoteStreams[i];}
		    }
		}
		rtc.loadData = function () {
			console.log("app.js----------rtc.loaddata")                        // 第八步
			// get list of streams from the server
			$http.get('/streams.json').success(function(data){
				console.log("app.js----------http get streams.json success");
				// filter own stream
				var streams = data.filter(function(stream) {
			      	return stream.id != client.getId();
			    });
			    // get former state
			    for(var i=0; i<streams.length;i++) {
			    	var stream = getStreamById(streams[i].id);
			    	streams[i].isPlaying = (!!stream) ? stream.isPLaying : false;
			    }
			    // save new streams
			    rtc.remoteStreams = streams;
			});
		};

                // 前端 View 按钮
		rtc.view = function(stream){
			console.log("app.js----------rtc.view");
			client.peerInit(stream.id);
			stream.isPlaying = !stream.isPlaying;
		};

                // 前端 Call 按钮
		rtc.call = function(stream){
			console.log("app.js----------rtc.call");                        // 远程控制第一步
			/* If json isn't loaded yet, construct a new stream 
			 * This happens when you load <serverUrl>/<socketId> : 
			 * it calls socketId immediatly.
			**/
			if(!stream.id){
				stream = {id: stream, isPlaying: false};
				rtc.remoteStreams.push(stream);
			}
			if(camera.isOn){
				client.toggleLocalStream(stream.id);
				if(stream.isPlaying){
					client.peerRenegociate(stream.id);
				} else {
					client.peerInit(stream.id);                   // 远程控制第二步
				}
				stream.isPlaying = !stream.isPlaying;
			} else {
				camera.start()
				.then(function(result) {
					client.toggleLocalStream(stream.id);
					if(stream.isPlaying){
						client.peerRenegociate(stream.id);
					} else {
						client.peerInit(stream.id);
					}
					stream.isPlaying = !stream.isPlaying;
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		};

		//initial load
		rtc.loadData();                                                            // 第七步
                if($location.url() != '/'){
      			rtc.call($location.url().slice(1));
    		};
	}]);

	// 本地视频流控制器
	app.controller('LocalStreamController',['camera', '$scope', '$window', function(camera, $scope, $window){
		console.log("app.controller: LocalStreamController");                       //第五步
		var localStream = this;
		localStream.name = 'Guest';
		localStream.link = '';
		localStream.cameraIsOn = false;

		$scope.$on('cameraIsOn', function(event,data) {
			console.log("app.js----------local cameraIsOn");
    		$scope.$apply(function() {
		    	localStream.cameraIsOn = data;
		    });
		});

                // 打开PC端 Camera 的按钮
		localStream.toggleCam = function(){
			console.log("app.js----------localStream.toggleCam");               // 第九步 打开PC camera
			if(localStream.cameraIsOn){
				camera.stop()
				.then(function(result){
					client.send('leave');
	    			client.setLocalStream(null);
				})
				.catch(function(err) {
					console.log(err);
				});
			} else {
				camera.start()
				.then(function(result) {
					localStream.link = $window.location.host + '/' + client.getId();
					client.send('readyToStream', { name: localStream.name });   // 第十三步 告知服务器本地视频流ready
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		};
	}]);
})();

```

### rtcClient.js

处理端与端之间的消息和视频流传输

```js

var PeerManager = (function () {

  console.log("load rtcClient.js");                        // 第三步

  var localId,
      config = {
        peerConnectionConfig: {
          iceServers: [
            //{"url": "stun:23.21.150.121"},
            //{"url": "stun:stun.l.google.com:19302"}
            {"url": "stun:stun.rixtelecom.se"},
            {"url": "stun:stun.schlund.de"}
          ]
        },
        peerConnectionConstraints: {
          optional: [
            {"DtlsSrtpKeyAgreement": true}
          ]
        }
      },
      peerDatabase = {},
      localStream,
      remoteVideoContainer = document.getElementById('remoteVideosContainer'),    // 远程视频流显示区域
      socket = io();
      
  socket.on('message', handleMessage);
  socket.on('id', function(id) {
    localId = id;
  });
      
  function addPeer(remoteId) {
    console.log("rtcClient.js-------addPeer");
    var peer = new Peer(config.peerConnectionConfig, config.peerConnectionConstraints);
    peer.pc.onicecandidate = function(event) {
      console.log("rtcClient.js-------onicecandidate");
      if (event.candidate) {
        send('candidate', remoteId, {
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      }
    };
    peer.pc.onaddstream = function(event) {
      console.log("rtcClient.js-------onaddstream");
      attachMediaStream(peer.remoteVideoEl, event.stream);
      remoteVideosContainer.appendChild(peer.remoteVideoEl);
    };
    peer.pc.onremovestream = function(event) {
      console.log("rtcClient.js-------onremovestream");
      peer.remoteVideoEl.src = '';
      remoteVideosContainer.removeChild(peer.remoteVideoEl);
    };
    peer.pc.oniceconnectionstatechange = function(event) {
      console.log("rtcClient.js-------oniceconnectionstatechange");
      switch(
      (  event.srcElement // Chrome
      || event.target   ) // Firefox
      .iceConnectionState) {
        case 'disconnected':
          remoteVideosContainer.removeChild(peer.remoteVideoEl);
          break;
      }
    };
    peerDatabase[remoteId] = peer;
        
    return peer;
  }
  function answer(remoteId) {
    console.log("rtcClient.js-------answer");
    var pc = peerDatabase[remoteId].pc;
    pc.createAnswer(
      function(sessionDescription) {
        pc.setLocalDescription(sessionDescription);
        send('answer', remoteId, sessionDescription);
      }, 
      error
    );
  }
  function offer(remoteId) {
    console.log("rtcClient.js-------offer");
    var pc = peerDatabase[remoteId].pc;
    pc.createOffer(
      function(sessionDescription) {
        pc.setLocalDescription(sessionDescription);
        send('offer', remoteId, sessionDescription);
      }, 
      error
    );
  }

  // 处理收到的远程客户端的消息， 建立 P2P 视频传输通道
  function handleMessage(message) {
    var type = message.type,
        from = message.from,
        pc = (peerDatabase[from] || addPeer(from)).pc;

    console.log('rtcClient.js-------received ' + type + ' from ' + from);
  
    switch (type) {
      case 'init':
        toggleLocalStream(pc);
        offer(from);
        break;
      case 'offer':
        pc.setRemoteDescription(new RTCSessionDescription(message.payload), function(){}, error);
        answer(from);
        break;
      case 'answer':
        pc.setRemoteDescription(new RTCSessionDescription(message.payload), function(){}, error);
        break;
      case 'candidate':
        if(pc.remoteDescription) {
          pc.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: message.payload.label,
            sdpMid: message.payload.id,
            candidate: message.payload.candidate
          }), function(){}, error);
        }
        break;
    }
  }
  function send(type, to, payload) {
    console.log('rtcClient.js-------sending ' + type + ' to ' + to);

    socket.emit('message', {
      to: to,
      type: type,
      payload: payload
    });
  }
  function toggleLocalStream(pc) {
    if(localStream) {
      (!!pc.getLocalStreams().length) ? pc.removeStream(localStream) : pc.addStream(localStream);
    }
  }
  function error(err){
    console.log(err);
  }

  return {
    getId: function() {
      return localId;
    },
    
    setLocalStream: function(stream) {
      console.log("rtcClient.js------------setLocalStream");                         // 第十二步

      // if local cam has been stopped, remove it from all outgoing streams.
      if(!stream) {
        for(id in peerDatabase) {
          pc = peerDatabase[id].pc;
          if(!!pc.getLocalStreams().length) {
            pc.removeStream(localStream);
            offer(id);
          }
        }
      }

      localStream = stream;
    }, 

    toggleLocalStream: function(remoteId) {
      console.log("rtcClient.js-------toggleLocalStream");
      peer = peerDatabase[remoteId] || addPeer(remoteId);
      toggleLocalStream(peer.pc);
    },
    
    peerInit: function(remoteId) {
      console.log("rtcClient.js-------peerInit");
      peer = peerDatabase[remoteId] || addPeer(remoteId);
      send('init', remoteId, null);                                                // 远程控制第三步
    },

    peerRenegociate: function(remoteId) {
      console.log("rtcClient.js-------peerRenegociate");
      offer(remoteId);
    },

    send: function(type, payload) {
      console.log("rtcClient.js-------send-----" + type);
      socket.emit(type, payload);
    }
  };
  
});

var Peer = function (pcConfig, pcConstraints) {
  console.log("rtcClient.js-------new RTCPeerConnection");
  this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
  this.remoteVideoEl = document.createElement('video');
  this.remoteVideoEl.controls = true;
  this.remoteVideoEl.autoplay = true;
}

```

## Android 客户端

[ScreenShareRTC](https://github.com/Jeffiano/ScreenShareRTC)

**RtcActivity**

```java

public class RtcActivity extends Activity {

    private WebRtcClient mWebRtcClient;
    private static final int CAPTURE_PERMISSION_REQUEST_CODE = 1;
    private static Intent mMediaProjectionPermissionResultData;
    private static int mMediaProjectionPermissionResultCode;


    @Override
    public void onCreate(Bundle savedInstanceState) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            startScreenCapture();
        }

    }


    @TargetApi(21)
    private void startScreenCapture() {
        Log.d(TAG, "startScreenCapture");
        MediaProjectionManager mediaProjectionManager =
                (MediaProjectionManager) getApplication().getSystemService(
                        Context.MEDIA_PROJECTION_SERVICE);
        startActivityForResult(
                mediaProjectionManager.createScreenCaptureIntent(), CAPTURE_PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "onActivityResult");
        if (requestCode != CAPTURE_PERMISSION_REQUEST_CODE)
            return;
        mMediaProjectionPermissionResultCode = resultCode;
        mMediaProjectionPermissionResultData = data;
        init();
    }

    private void init() {
        PeerConnectionClient.PeerConnectionParameters peerConnectionParameters =
                new PeerConnectionClient.PeerConnectionParameters(true, false,
                        true, sDeviceWidth / SCREEN_RESOLUTION_SCALE, sDeviceHeight / SCREEN_RESOLUTION_SCALE, 0,
                        0, "VP8",
                        false,
                        true,
                        0,
                        "OPUS", false, false, false, false, false, false, false, false, null);
        mWebRtcClient = new WebRtcClient(getApplicationContext(), this, createScreenCapturer(), peerConnectionParameters);
    }

}

```

**WebRtcClient**

```java

public class WebRtcClient {

    public static final String VIDEO_TRACK_ID = "ARDAMSv0";
    private final static String TAG = "WebRtcClient";
    private final static int MAX_PEER = 2;
    private boolean[] endPoints = new boolean[MAX_PEER];
    private PeerConnectionFactory factory;
    private HashMap<String, Peer> peers = new HashMap<>();
    private LinkedList<PeerConnection.IceServer> iceServers = new LinkedList<>();
    private PeerConnectionClient.PeerConnectionParameters mPeerConnParams;
    private MediaConstraints mPeerConnConstraints = new MediaConstraints();
    private MediaStream mLocalMediaStream;
    private VideoSource mVideoSource;
    private RtcListener mListener;
    private Socket mSocket;
    VideoCapturer videoCapturer;
    MessageHandler messageHandler = new MessageHandler();
    Context mContext;

    /**
     * Implement this interface to be notified of events.
     */
    public interface RtcListener {
        void onReady(String remoteId);

        void onCall(String applicant);

        void onHandup();

        void onStatusChanged(String newStatus);
    }

    public interface Command {
        void execute(String peerId, JSONObject payload) throws JSONException;
    }

    public class CreateOfferCommand implements Command {
        public void execute(String peerId, JSONObject payload) throws JSONException {
            Log.d(TAG, "CreateOfferCommand");
            Peer peer = peers.get(peerId);
            peer.pc.createOffer(peer, mPeerConnConstraints);
//            sendMessage("r0Z049NKJF2ZCIhRAAAZ","offer",new JSONObject());
        }
    }

    public class CreateAnswerCommand implements Command {
        public void execute(String peerId, JSONObject payload) throws JSONException {
            Log.d(TAG, "CreateAnswerCommand");
            Peer peer = peers.get(peerId);
            SessionDescription sdp = new SessionDescription(
                    SessionDescription.Type.fromCanonicalForm(payload.optString("type")),
                    payload.optString("sdp")
            );
            peer.pc.setRemoteDescription(peer, sdp);
            peer.pc.createAnswer(peer, mPeerConnConstraints);
        }
    }

    public class SetRemoteSDPCommand implements Command {
        public void execute(String peerId, JSONObject payload) throws JSONException {
            Log.d(TAG, "SetRemoteSDPCommand");
            Peer peer = peers.get(peerId);
            SessionDescription sdp = new SessionDescription(
                    SessionDescription.Type.fromCanonicalForm(payload.optString("type")),
                    payload.optString("sdp")
            );
            peer.pc.setRemoteDescription(peer, sdp);
        }
    }

    public class AddIceCandidateCommand implements Command {
        public void execute(String peerId, JSONObject payload) throws JSONException {
            Log.d(TAG, "AddIceCandidateCommand");
            PeerConnection pc = peers.get(peerId).pc;
            if (pc.getRemoteDescription() != null) {
                IceCandidate candidate = new IceCandidate(
                        payload.optString("id"),
                        payload.optInt("label"),
                        payload.optString("candidate")
                );
                pc.addIceCandidate(candidate);
            }
        }
    }

    /**
     * Send a message through the signaling server
     *
     * @param to      id of recipient
     * @param type    type of message
     * @param payload payload of message
     * @throws JSONException
     */
    public void sendMessage(String to, String type, JSONObject payload) throws JSONException {
        JSONObject message = new JSONObject();
        message.put("to", to);
        message.put("type", type);
        message.put("payload", payload);
        mSocket.emit("message", message);
        Log.d(TAG, "socket send " + type + " to " + to + " payload:" + payload);
    }

    public class MessageHandler {
        private HashMap<String, Command> commandMap;

        public MessageHandler() {
            this.commandMap = new HashMap<>();
            commandMap.put("init", new CreateOfferCommand());
            commandMap.put("offer", new CreateAnswerCommand());
            commandMap.put("answer", new SetRemoteSDPCommand());
            commandMap.put("candidate", new AddIceCandidateCommand());
        }

        public Emitter.Listener onMessage = new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                try {
                    JSONObject data = (JSONObject) args[0];
//                    String info = (String) args[0];
//                    JSONObject data = new JSONObject(info);
                    String from = data.optString("from");
                    String type = data.optString("type");
                    Log.d(TAG, "socket received " + type + " from " + from);
                    JSONObject payload = null;
                    if (!type.equals("init")) {
                        payload = data.optJSONObject("payload");
                    }
                    // if peer is unknown, try to add him
                    if (!peers.containsKey(from)) {
                        // if MAX_PEER is reach, ignore the call
                        int endPoint = findEndPoint();
                        if (endPoint != MAX_PEER) {
                            Peer peer = addPeer(from, endPoint);
                            peer.pc.addStream(mLocalMediaStream);
                            commandMap.get(type).execute(from, payload);
                        }
                    } else {
                        Command command = commandMap.get(type);
                        if(command!=null){
                            command.execute(from, payload);
                        }
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };

        public Emitter.Listener onId = new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                String id = (String) args[0];
                mListener.onReady(id);
                mListener.onStatusChanged("READY");
                Log.d(TAG, "socket onId " + id);
            }
        };
    }

    public class Peer implements SdpObserver, PeerConnection.Observer {
        public PeerConnection pc;
        public String id;
        public int endPoint;

        @Override
        public void onCreateSuccess(final SessionDescription sdp) {
            // TODO: modify sdp to use mPeerConnParams prefered codecs
            try {
                JSONObject payload = new JSONObject();
                payload.put("type", sdp.type.canonicalForm());
                payload.put("sdp", sdp.description);
                Log.d(TAG, "onCreateSuccess");
                sendMessage(id, sdp.type.canonicalForm(), payload);
                pc.setLocalDescription(Peer.this, sdp);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onSetSuccess() {
        }

        @Override
        public void onCreateFailure(String s) {
        }

        @Override
        public void onSetFailure(String s) {
        }

        @Override
        public void onSignalingChange(PeerConnection.SignalingState signalingState) {
        }


        public void onIceConnectionReceivingChange(boolean var1) {

        }

        public void onIceCandidatesRemoved(IceCandidate[] var1) {

        }

        public void onAddTrack(RtpReceiver var1, MediaStream[] var2) {

        }

        @Override
        public void onIceConnectionChange(PeerConnection.IceConnectionState iceConnectionState) {
            if (iceConnectionState == PeerConnection.IceConnectionState.DISCONNECTED) {
                removePeer(id);
                mListener.onStatusChanged("DISCONNECTED");
            }
        }

        @Override
        public void onIceGatheringChange(PeerConnection.IceGatheringState iceGatheringState) {
        }

        @Override
        public void onIceCandidate(final IceCandidate candidate) {
            try {
                JSONObject payload = new JSONObject();
                payload.put("label", candidate.sdpMLineIndex);
                payload.put("id", candidate.sdpMid);
                payload.put("candidate", candidate.sdp);
                sendMessage(id, "candidate", payload);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onAddStream(MediaStream mediaStream) {
            Log.d(TAG, "onAddStream " + mediaStream.label());
            // remote streams are displayed from 1 to MAX_PEER (0 is localStream)
//            mediaStream.videoTracks.get(0).addRenderer(new VideoRenderer(mRemoteRender));
//            mListener.onAddRemoteStream(mediaStream, endPoint + 1);
        }

        @Override
        public void onRemoveStream(MediaStream mediaStream) {
            Log.d(TAG, "onRemoveStream " + mediaStream.label());
            removePeer(id);
        }

        @Override
        public void onDataChannel(DataChannel dataChannel) {
        }

        @Override
        public void onRenegotiationNeeded() {

        }

        public Peer(String id, int endPoint) {
            Log.d(TAG, "new Peer: " + id + " " + endPoint);
            this.pc = factory.createPeerConnection(iceServers, mPeerConnConstraints, this);
            this.id = id;
            this.endPoint = endPoint;
            pc.addStream(mLocalMediaStream); //, new MediaConstraints()
        }
    }

    private Peer addPeer(String id, int endPoint) {
        Peer peer = new Peer(id, endPoint);
        peers.put(id, peer);

        endPoints[endPoint] = true;
        return peer;
    }

    private void removePeer(String id) {
        Peer peer = peers.get(id);
        peer.pc.close();
        peers.remove(peer.id);
        endPoints[peer.endPoint] = false;
    }


    public WebRtcClient(Context context, RtcListener listener, VideoCapturer capturer, PeerConnectionClient.PeerConnectionParameters params) {
        Log.d(TAG, "new WebRtcClient");
        mContext = context;
        mListener = listener;
        mPeerConnParams = params;
        videoCapturer = capturer;
        PeerConnectionFactory.initializeAndroidGlobals(mContext, true, true,
                params.videoCodecHwAcceleration);
        factory = new PeerConnectionFactory();

        try {
            TrustManager[] trustAllCerts = new TrustManager[1];
            TrustManager tm = new miTM();
            trustAllCerts[0] = tm;
            SSLContext sc = SSLContext.getInstance("SSL");
            X509TrustManager x509m = new X509TrustManager() {
                //          返回受信任的X509证书数组。
                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return new java.security.cert.X509Certificate[] {};
                }
                //          该方法检查服务器的证书，若不信任该证书同样抛出异常。通过自己实现该方法，可以使之信任我们指定的任何证书。
//          在实现该方法时，也可以简单的不做任何处理，即一个空的函数体，由于不会抛出异常，它就会信任任何证书。
                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                }
                //          该方法检查客户端的证书，若不信任该证书则抛出异常。由于我们不需要对客户端进行认证，
//          因此我们只需要执行默认的信任管理器的这个方法。JSSE中，默认的信任管理器类为TrustManager。
                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                }
            };

            try {
                sc.init(null, trustAllCerts, null);
            } catch ( KeyManagementException e ) {
                e.printStackTrace();
            }
            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .hostnameVerifier(new HostnameVerifier() {
                        @Override
                        public boolean verify( String s, SSLSession sslSession ) {
                            return true;
                        }
                    })
                    .sslSocketFactory(sc.getSocketFactory(), x509m)
                    .build();
            IO.Options opts = new IO.Options();
            opts.callFactory = okHttpClient;
            opts.webSocketFactory = okHttpClient;

            // default settings for all sockets
            IO.setDefaultOkHttpWebSocketFactory(okHttpClient);
            IO.setDefaultOkHttpCallFactory(okHttpClient);

            // set as an option
            String host = "https://" + context.getString(R.string.host) + ":" + context.getString(R.string.port) + "/";
            mSocket = IO.socket(host,opts);

        } catch (URISyntaxException | NoSuchAlgorithmException e) {
            e.printStackTrace();
        }

        mSocket.on("id", messageHandler.onId);
        mSocket.on("message", messageHandler.onMessage);
        mSocket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "socket state connect");
            }
        });
        mSocket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "socket state disconnect");
            }
        });
        mSocket.on(Socket.EVENT_ERROR, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "socket state error");
            }
        });
        mSocket.connect();
        Log.d(TAG, "socket start connect");

//        iceServers.add(new PeerConnection.IceServer("stun:23.21.150.121"));
//        iceServers.add(new PeerConnection.IceServer("stun:stun.l.google.com:19302"));


        iceServers.add(new PeerConnection.IceServer("stun:stun.rixtelecom.se"));
        iceServers.add(new PeerConnection.IceServer("stun:stun.schlund.de"));

        mPeerConnConstraints.mandatory.add(new MediaConstraints.KeyValuePair("OfferToReceiveAudio", "true"));
        mPeerConnConstraints.mandatory.add(new MediaConstraints.KeyValuePair("OfferToReceiveVideo", "true"));
        mPeerConnConstraints.optional.add(new MediaConstraints.KeyValuePair("DtlsSrtpKeyAgreement", "true"));
    }


    /**
     * Start the mSocket.
     * <p>
     * Set up the local stream and notify the signaling server.
     * Call this method after onCallReady.
     *
     * @param name mSocket name
     */
    public void start(String name) {
        initScreenCapturStream();
        try {
            JSONObject message = new JSONObject();
            message.put("name", name);
            mSocket.emit("readyToStream", message);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void initScreenCapturStream() {
        mLocalMediaStream = factory.createLocalMediaStream("ARDAMS");
        MediaConstraints videoConstraints = new MediaConstraints();
        videoConstraints.mandatory.add(new MediaConstraints.KeyValuePair("maxHeight", Integer.toString(mPeerConnParams.videoHeight)));
        videoConstraints.mandatory.add(new MediaConstraints.KeyValuePair("maxWidth", Integer.toString(mPeerConnParams.videoWidth)));
        videoConstraints.mandatory.add(new MediaConstraints.KeyValuePair("maxFrameRate", Integer.toString(mPeerConnParams.videoFps)));
        videoConstraints.mandatory.add(new MediaConstraints.KeyValuePair("minFrameRate", Integer.toString(mPeerConnParams.videoFps)));

//        VideoCapturer capturer = createScreenCapturer();
        mVideoSource = factory.createVideoSource(videoCapturer);
        videoCapturer.startCapture(mPeerConnParams.videoWidth, mPeerConnParams.videoHeight, mPeerConnParams.videoFps);
        VideoTrack localVideoTrack = factory.createVideoTrack(VIDEO_TRACK_ID, mVideoSource);
        localVideoTrack.setEnabled(true);
        mLocalMediaStream.addTrack(factory.createVideoTrack("ARDAMSv0", mVideoSource));
        AudioSource audioSource = factory.createAudioSource(new MediaConstraints());
        mLocalMediaStream.addTrack(factory.createAudioTrack("ARDAMSa0", audioSource));
//        mLocalMediaStream.videoTracks.get(0).addRenderer(new VideoRenderer(mLocalRender));
//        mListener.onLocalStream(mLocalMediaStream);
        mListener.onStatusChanged("STREAMING");
    }

    /**
     * Call this method in Activity.onDestroy()
     */
    public void destroy() {
        for (Peer peer : peers.values()) {
            peer.pc.dispose();
        }
        if (factory != null) {
            factory.dispose();
        }
        if (mVideoSource != null) {
            mVideoSource.dispose();
        }
//        mSocket.disconnect();
//        mSocket.close();
    }

}

```

**PeerConnectionClient**

```java

public class PeerConnectionClient {

    /**
     * Peer connection parameters.
     */
    public static class DataChannelParameters {
        public final boolean ordered;
        public final int maxRetransmitTimeMs;
        public final int maxRetransmits;
        public final String protocol;
        public final boolean negotiated;
        public final int id;

        public DataChannelParameters(boolean ordered, int maxRetransmitTimeMs, int maxRetransmits,
                                     String protocol, boolean negotiated, int id) {
            this.ordered = ordered;
            this.maxRetransmitTimeMs = maxRetransmitTimeMs;
            this.maxRetransmits = maxRetransmits;
            this.protocol = protocol;
            this.negotiated = negotiated;
            this.id = id;
        }
    }

    /**
     * Peer connection parameters.
     */
    public static class PeerConnectionParameters {
        public final boolean videoCallEnabled;
        public final boolean loopback;
        public final boolean tracing;
        public final int videoWidth;
        public final int videoHeight;
        public final int videoFps;
        public final int videoMaxBitrate;
        public final String videoCodec;
        public final boolean videoCodecHwAcceleration;
        public final boolean videoFlexfecEnabled;
        public final int audioStartBitrate;
        public final String audioCodec;
        public final boolean noAudioProcessing;
        public final boolean aecDump;
        public final boolean useOpenSLES;
        public final boolean disableBuiltInAEC;
        public final boolean disableBuiltInAGC;
        public final boolean disableBuiltInNS;
        public final boolean enableLevelControl;
        public final boolean disableWebRtcAGCAndHPF;
        private final DataChannelParameters dataChannelParameters;

        public PeerConnectionParameters(boolean videoCallEnabled, boolean loopback, boolean tracing,
                                        int videoWidth, int videoHeight, int videoFps, int videoMaxBitrate, String videoCodec,
                                        boolean videoCodecHwAcceleration, boolean videoFlexfecEnabled, int audioStartBitrate,
                                        String audioCodec, boolean noAudioProcessing, boolean aecDump, boolean useOpenSLES,
                                        boolean disableBuiltInAEC, boolean disableBuiltInAGC, boolean disableBuiltInNS,
                                        boolean enableLevelControl, boolean disableWebRtcAGCAndHPF) {
            this(videoCallEnabled, loopback, tracing, videoWidth, videoHeight, videoFps, videoMaxBitrate,
                    videoCodec, videoCodecHwAcceleration, videoFlexfecEnabled, audioStartBitrate, audioCodec,
                    noAudioProcessing, aecDump, useOpenSLES, disableBuiltInAEC, disableBuiltInAGC,
                    disableBuiltInNS, enableLevelControl, disableWebRtcAGCAndHPF, null);
        }

        public PeerConnectionParameters(boolean videoCallEnabled, boolean loopback, boolean tracing,
                                        int videoWidth, int videoHeight, int videoFps, int videoMaxBitrate, String videoCodec,
                                        boolean videoCodecHwAcceleration, boolean videoFlexfecEnabled, int audioStartBitrate,
                                        String audioCodec, boolean noAudioProcessing, boolean aecDump, boolean useOpenSLES,
                                        boolean disableBuiltInAEC, boolean disableBuiltInAGC, boolean disableBuiltInNS,
                                        boolean enableLevelControl, boolean disableWebRtcAGCAndHPF,
                                        DataChannelParameters dataChannelParameters) {
            this.videoCallEnabled = videoCallEnabled;
            this.loopback = loopback;
            this.tracing = tracing;
            this.videoWidth = videoWidth;
            this.videoHeight = videoHeight;
            this.videoFps = videoFps;
            this.videoMaxBitrate = videoMaxBitrate;
            this.videoCodec = videoCodec;
            this.videoFlexfecEnabled = videoFlexfecEnabled;
            this.videoCodecHwAcceleration = videoCodecHwAcceleration;
            this.audioStartBitrate = audioStartBitrate;
            this.audioCodec = audioCodec;
            this.noAudioProcessing = noAudioProcessing;
            this.aecDump = aecDump;
            this.useOpenSLES = useOpenSLES;
            this.disableBuiltInAEC = disableBuiltInAEC;
            this.disableBuiltInAGC = disableBuiltInAGC;
            this.disableBuiltInNS = disableBuiltInNS;
            this.enableLevelControl = enableLevelControl;
            this.disableWebRtcAGCAndHPF = disableWebRtcAGCAndHPF;
            this.dataChannelParameters = dataChannelParameters;
        }
    }

}

```




