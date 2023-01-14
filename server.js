const express = require("express");
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);



app.use(express.static(__dirname));

server.listen(4000);
//socket controls


io.on('connection', socket=>{
  console.log('new connection');
  // socket.emit('message','connection established');
  
  //communication management
  socket.on('colorChange', msg=>{
    console.log('color change recieved',msg)
    io.emit('message', msg);
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