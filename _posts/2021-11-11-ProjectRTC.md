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

## Web客户端

### adapter.js

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

前端入口

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
    	camera.preview = $window.document.getElementById('localVideo');

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

		rtc.view = function(stream){
			console.log("app.js----------rtc.view");
			client.peerInit(stream.id);
			stream.isPlaying = !stream.isPlaying;
		};
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
      remoteVideoContainer = document.getElementById('remoteVideosContainer'),
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








