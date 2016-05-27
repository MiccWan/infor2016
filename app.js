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
	res.sendFile(__dirname+'/3DConnect4.html',function(){
		res.end();
	})
})

app.get('/chatroom.html',function(req,res){
  res.sendFile(__dirname+'/chatroom.html',function(){
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
    if(i%4==0)gameStat[i]=3;
    else gameStat[i]=0;
}

var chk = function(id){
	var stat = [];
	for(var i=0;i<4;i++){
		stat[i]=[];
		for(var j=0;j<4;j++){
			stat[i][j]=[];
		}
	}

	for(var i=0,j=0,k=0,l=0;l<64;i++,l++){
	    if(i==4){
	    	i=0;
	    	j++;
	    }
	    if(j==4){
	    	j=0;
	    	k++
		}
	    if(k==4){
	    	k=0;
	    	throw "k==4";
	    }
	    stat[i][j][k]=gameStat[l];

	}
	// console.log(gameStat);
	// console.log(stat);

	// stat part
	var x=id%4;
	var y=parseInt(id/4)%4;
	var z=parseInt(id/16);
	var jizz=1;
    var res=[0,0,0,0,0,0,0,0,0,0,0,0,0];
    for(var i=0;i<4;i++,jizz*=2){
        var point = [stat[x][y][i],stat[x][i][z],stat[i][y][z],stat[x][i][i],stat[x][i][3-i],stat[i][y][i],stat[i][y][3-i],stat[i][i][z],stat[i][3-i][z],stat[i][i][i],stat[i][i][3-i],stat[3-i][i][i],stat[3-i][i][3-i]];
        for(var line=0;line<point.length;line++){
            if(point[line]==1){
                res[line]+=jizz;
            }
            if(point[line]==2){
                res[line]-=jizz;
            }
        }
    }
    for(var i=0;i<res.length;i++){
        if(res[i]==15){
            return 1;
        }
        if(res[i]==-15){
            return 2;
        }
    }
    return 0;
}

var gameStart function(){
    for(;;){    
        if(waitingList.length>1){
            playerList = [];
            playerList[0] = waitingList.shift(1);
            playerList[1] = waitingList.shift(1);
        }
    }
}

gameStart();


io.sockets.on('connection', function(socket){
	var id = socket.id;
	var name;
	socket.on('loginreq', function(name,join){
		if(join){
			waitingList.push({name:name,id:id});
		}
		onlineList.push({name:name,id:id});
	})
	socket.on('down',function(id){
        if(socket.id==playerList[player-1]){
            gameStat[id]=player;
            var winner=chk(id);
            if(winner){
                // socket.emit('gameOver',playerList[winner-1]["name"])
                socket.emit('gameOver',"got it!")
            }
            if( id%4 != 3)gameStat[id+1]=3;
            io.emit('downed',gameStat,player);
            console.log(gameStat)
            player = player==1 ? 2 : 1;
        }
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
    
    //chatroom==========
    
    setInterval(function(){
        socket.emit("now",{date:now});
    },1000)

    socket.on('sendchat', function(text,name){
        console.log(text+" "+name+" "+now);
        io.emit("pubchat", text, name ,now);
    });

    socket.on('disconnect', function(){
        
    })
})

server.listen(2319);



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
