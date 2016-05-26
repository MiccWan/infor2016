'use strict'

var path = require('path');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var bodyParser = require('body-parser');

var express = require('express')
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var http = require('http');

app.use('/static', express.static(__dirname+'/static'));

app.use(bodyParser.urlencoded({extended: true}));

//MongoClient.createCollection('users');

app.get('/add.html',function(req,res){
    res.sendFile(__dirname+'/form.html',function(){res.end();})
});
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html',function(){res.end();})
});

app.get('/chat.html',function(req,res){
  res.sendFile(__dirname+'/chatroom.html',function(){res.end();})
})

//MongoClient.connect('mongodb://localhost:27017',function(err,db){
  //console.log(db);
  //db.collection('users').insert({"a":"b"});  
//});

io.sockets.on('connection', function(socket){
  var id=socket.id;
  socket.emit("who");
  var nn;

  socket.on('sendchat', function(text,name){
    var month = new Date().getMonth()+1;
    var now = new Date().getFullYear().toString()+"-"+month.toString()+"-"+new Date().getDate().toString()+" ";
    if(new Date().getHours()<10){var nnow=now+"0"+new Date().getHours().toString()+":";}
      else{var nnow=now+new Date().getHours().toString()+":";}
    if(new Date().getMinutes()<10){var nnnow=nnow+"0"+new Date().getMinutes().toString()+":";}
      else{var nnnow=nnow+new Date().getMinutes().toString()+":";}
    if(new Date().getSeconds()<10){var nnnnow=nnnow+"0"+new Date().getSeconds().toString();}
      else{var nnnnow=nnnow+new Date().getSeconds().toString();}
    console.log(text+" "+name+" "+nnnnow);
    io.emit("pubchat", text, name ,nnnnow);
    MongoClient.connect('mongodb://210.71.78.200:27017/users',function(err,db){
      db.collection('messages').insert({"sendby":name,"text":text,"time":nnnnow});
    });
    var something = "text :"+text+", sendby :"+name+", time :"+nnnnow;
  });


  setInterval(function() {
    var month = new Date().getMonth()+1;
    var now = new Date().getFullYear().toString()+"-"+month.toString()+"-"+new Date().getDate().toString()+" ";
    if(new Date().getHours()<10){var nnow=now+"0"+new Date().getHours().toString()+":";}
      else{var nnow=now+new Date().getHours().toString()+":";}
    if(new Date().getMinutes()<10){var nnnow=nnow+"0"+new Date().getMinutes().toString()+":";}
      else{var nnnow=nnow+new Date().getMinutes().toString()+":";}
    if(new Date().getSeconds()<10){var nnnnow=nnnow+"0"+new Date().getSeconds().toString();}
      else{var nnnnow=nnnow+new Date().getSeconds().toString();}
    io.emit('now', {'date':nnnnow});
  }, 1000);

  socket.on('regq',function(username,nickname,pass,pass2,email,birth){
    MongoClient.connect('mongodb://210.71.78.200:27017/users',function(err,db){
      db.collection('users').find({"username":username}).count(function(err,cnt){
        if(cnt){socket.emit('usernameq');}
        else{
          db.collection('users').find({"nickname":nickname}).count(function(err,cnt2){
            if(cnt2){socket.emit('nickq');}
            else{
              db.collection('users').insertOne({"username":username,"nickname":nickname,"pass":pass,"pass2":pass2,"email":email,"birth":birth});
              socket.emit('jumpmain');
            }
          });
        }
      });
    });
  });

  socket.on('loginq',function(username,pass){
    MongoClient.connect('mongodb://210.71.78.200:27017/users',function(err,db){
      db.collection('users').find({"username":username}).count(function(err,cnt){
        if(cnt==0){socket.emit("nou");}
        else{
          db.collection('users').find({"username":username,"pass":pass}).count(function(err,cnt){
            if(cnt){
              db.collection('users').findOne({"username":username,"pass":pass},function(err,data){
                nn=data.nickname;
                socket.emit("logindone" , nn);
                console.log(nn+" join to chat");
                var month = new Date().getMonth()+1;
                var now = new Date().getFullYear().toString()+"-"+month.toString()+"-"+new Date().getDate().toString()+" ";
                if(new Date().getHours()<10){var nnow=now+"0"+new Date().getHours().toString()+":";}
                  else{var nnow=now+new Date().getHours().toString()+":";}
                if(new Date().getMinutes()<10){var nnnow=nnow+"0"+new Date().getMinutes().toString()+":";}
                  else{var nnnow=nnow+new Date().getMinutes().toString()+":";}
                if(new Date().getSeconds()<10){var nnnnow=nnnow+"0"+new Date().getSeconds().toString();}
                  else{var nnnnow=nnnow+new Date().getSeconds().toString();}
                io.emit("sbc",nn, nnnnow);
                MongoClient.connect('mongodb://210.71.78.200:27017/users',function(err,db){
                  db.collection('messages').insert({"sendby":nn,"text":"join the chat","time":nnnnow});
                });
              });
            }
            else{socket.emit('wp')}
          });
        }
      });
    });
  });

  socket.on('disconnect',function(){
    var month = new Date().getMonth()+1;
    var now = new Date().getFullYear().toString()+"-"+month.toString()+"-"+new Date().getDate().toString()+" ";
    if(new Date().getHours()<10){var nnow=now+"0"+new Date().getHours().toString()+":";}
      else{var nnow=now+new Date().getHours().toString()+":";}
    if(new Date().getMinutes()<10){var nnnow=nnow+"0"+new Date().getMinutes().toString()+":";}
      else{var nnnow=nnow+new Date().getMinutes().toString()+":";}
    if(new Date().getSeconds()<10){var nnnnow=nnnow+"0"+new Date().getSeconds().toString();}
      else{var nnnnow=nnnow+new Date().getSeconds().toString();}
    io.emit('leave',nn,nnnnow);
    MongoClient.connect('mongodb://210.71.78.200:27017/users',function(err,db){
      db.collection('messages').insert({"sendby":nn,"text":"leave the chat","time":nnnnow});
    });
    console.log(nn+" leave the chat");
  });
});

server.listen(80);
