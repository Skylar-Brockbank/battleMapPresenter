const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const fs = require("fs");
const uuid = require('uuid')
const path = require('path');

let mapData='';
try{
  const dataString = fs.readFileSync('./data/allMapData.json');
  mapData=JSON.parse(dataString);
}catch(err){
  console.log(err);
}

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const gatherImages=()=>{
  const imagePath = path.join(__dirname,'images');
  let imageArray = [];
  fs.readdir(imagePath,(err,i)=>{
    if(err){
      console.log(err);
    }
    i.forEach(file=>{
      const tempImagePath = './images/'+file;
      fs.readFile(tempImagePath,{encoding:'base64'},(err,image)=>{
        if(err){
          console.log(err);
        }
        else{
          imageArray.push({name:file,image:"data:image/png;base64,"+image});
        }
        
      })
    })
  })
  return imageArray;
}
const globalImages = gatherImages();

app.use(express.static(__dirname));

server.listen(4000);
//socket controls


io.on('connection', socket=>{
  console.log('new connection');
  // socket.emit('message','connection established');
  
  //communication management
  socket.on('colorChange', msg=>{
    console.log('color change recieved',msg)

    io.emit('message', {type:'color',payload:msg});
  })
  socket.on('message', msg=>{
    console.log(msg);
    if(msg.type==='save'){
      try{
        const dataString = fs.readFileSync('./data/allMapData.json');
        mapData=JSON.parse(dataString);
        console.log(JSON.stringify(mapData));
      }catch(err){
        console.log(err);
      }
      console.log({name:msg.payload.name, map:msg.payload.map})
      console.log(msg.payload.map)
      mapData[uuid.v4()]={name:msg.payload.name, map:msg.payload.map};
      console.log('updated MapData', mapData);
      fs.writeFileSync('./data/allMapData.json', JSON.stringify(mapData));


    }else if(msg.type==='command'){
      io.emit('message',{type:"map",payload:mapData[msg.payload]});
    }else if(msg.type==='request'){
      let outgoingIndex={};
      let mapDataGuide = Object.keys(mapData);
      mapDataGuide.forEach(e=>{
        outgoingIndex[e]=mapData[e].name;
      })
      console.log('emitting response');
      socket.emit('message',{type:'data',payload:outgoingIndex});
    }else if(msg.type==='stampIndex'){
      socket.emit('message',{type:'stampIndexResponse',payload:globalImages});
    }
  })
})

//view control

app.set('view engine','ejs');

app.get("/", (req, res) => {
  res.status(200);
  res.render('index');
})

app.get("/display",(req,res)=>{
  res.status(200);
  res.render('display');
})

app.get("/map-maker",(req,res)=>{
  res.status(200);
  res.render('mapMaker');
})

app.get("/controller",(req,res)=>{
  res.status(200);
  res.render('control');
})