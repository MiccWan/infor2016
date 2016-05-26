'use strict'

var path = require('path');
// var mongodb = require('mongodb');
// var MongoClient = mongodb.MongoClient;
var bodyParser = require('body-parser');

var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var http =  require('http');

var now;

app.use('/static', express.static(__dirname+'/static'));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req,res){
	res.sendFile(__dirname+'/main.html', function(){
		res.end();
	})
})
app.get('/3DConnect4.html', function(req,res){
	res.sendFile(__dirname+'3D Bingo.html',function(){
		res.end();
	})
})

setInterval(function(){
	var month = new Date().getMonth()+1;
	now = new Date().getFullYear().toString()+"-"+month.toString()+"-"+new Date().getDate().toString()+" ";
	if(new Date().getHours()<10){
		now=now+"0"+new Date().getHours().toString()+":";
	}
	else{
		now=now+new Date().getHours().toString()+":";
	}
	if(new Date().getMinutes()<10){
		now=now+"0"+new Date().getMinutes().toString()+":";
	}
	else{
		now=now+new Date().getMinutes().toString()+":";
	}
	if(new Date().getSeconds()<10){
		now=now+"0"+new Date().getSeconds().toString();
	}
	else{
		now=now+new Date().getSeconds().toString();
	}
}, 1000)

// ------------------------------------------------------------------------------------

var playerList = [];
var waitingList = [];
var onlineList = [];
var player = 1;
var gameStat = [];
for(var i=0;i<64;i++){
	gameStat[i]=0;
}

var chk = function(){
	var stat = [];
	for(var i=0;i<4;i++){
	    stat.push([]);
	    for(var j=0;j<4;j++){
	        stat[i].push([]);
	        for(var k=0;k<4;k++){
	            stat[i][j].push([]);
	        }
	    }
	}
	var i=0,j=0,k=0;
	for(var l=0;l<64;l++){
	    if(i==4)i=0;
	    if(j==4)j=0;
	    if(k==4)k=0;
	    gameStat[l]=chk[i][j][k];
	    i++;
	    j++;
	    k++;
	}

	// chk part
}

io.sockets.on('connection', function(socket){
	var id = socket.id;
	playerList.push(id);
	var name;
	socket.on('loginreq', function(name,join){
		if(join){
			waitingList.push({name:name,id:id});
		}
		onlineList.push({name:name,id:id});
	})
	socket.on('down',function(id){
		gameStat[id]=player;
		if(chk()){

		}
		if( id%4 != 3)gameStat[id]=3;
		io.emit('downed',gameStat,player);
		player = player==1 ? 2 : 1;
	})
	socket.on('disconnection',function(){
		for(var i=0;i<onlineList.length;i++){
			if(onlineList[i]["id"]==id){
				delete onlineList[i];
			}
		}
		for(var i=0;i<waitingList.length;i++){
			if(waitingList[i]["id"]==id){
				delete waitingList[i];
			}
		}
		if(playerList[0]["id"]==id || playerList[1]["id"]==id){
			io.emit('player leave');
		}
	})
})

server.listen(7122);



// Mongo Example
// MongoClient.connect('mongodb://localhost:27017/datbs',function(err,db){
// 	db.collection('users').find({"username":creater, "pass":crpw}).count(function(err,cnt){
// 		if(cnt == 0){
// 			socket.emit('noperadd');
// 		}
// 		else{
// 			count++;
// 			db.collection('datbs').insert({"id": count.toString(), "time": now, "title": title, "descr": descr, "tag": tag, "creater": creater});
// 			db.collection('counting').insert({});
// 		}
// 	})
// })
