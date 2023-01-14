const socket = io();

// socket.on('message', message=>{
//   console.log(message);
// })
const tiles = {
  0:'dirt',
  1:'grass',
  2:'wood',
  3:'stone',
  4:'water'
}

const textures = {
  0:'tan',
  1:'green',
  2:'brown',
  3:'gray',
  4:'blue'
}

const stamps = {
  0:'tree',
  1:'log'
}

const area = document.getElementById('mapArea');
const brush = area.getContext('2d');

const x = 12;
const y = 20;
const q= ((window.innerHeight/y)>(window.innerWidth/x))?(window.innerWidth/x):(window.innerHeight/y);

area.style.height=y*q;
area.style.width=x*q;
area.height = y*q;
area.width = x*q;



const colorChange = (update)=>{
  brush.fillStyle=update;
  brush.fillRect(0,0,area.width,area.height);
  drawGrid();
}

const drawGrid = ()=>{
  brush.strokeStyle="White";
  for(let i = 1; i<x; i++){
    brush.moveTo(i*q,0);
    brush.lineTo(i*q, area.height);
    brush.stroke();
  }
  for(let i = 1; i<y; i++){
    brush.moveTo(0,i*q);
    brush.lineTo(area.width, i*q);
    brush.stroke();
  }
}
const fillTile=(id, color)=>{
  const yIn = Math.floor(id/x);
  const xIn = id-x*yIn;
  brush.fillStyle=color;
  brush.fillRect(xIn*q,yIn*q,q,q);
}

const drawMap=(map)=>{
  for(let i=0; i<map.map.tiles.length; i++){
    fillTile(i, textures[map.map.tiles[i]]);
  }
}

const clearScreen = () =>{
  brush.fillStyle='black';
  brush.fillRect(0,0,area.width,area.height);
}

socket.on('message', msg=>{
  if(msg.type==='color'){
    if(msg.payload==='black'){
      clearScreen();
    }else{
      colorChange(msg.payload);  
    }
  }else if(msg.type==='map'){
    console.log(msg);
    drawMap(msg.payload);
    drawGrid();
  }
})