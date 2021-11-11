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

