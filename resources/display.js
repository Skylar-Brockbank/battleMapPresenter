const socket = io();

let imageIndex;

const area = document.getElementById('mapArea');
const brush = area.getContext('2d');

const x = 12;
const y = 20;
const q= ((window.innerHeight/y)>(window.innerWidth/x))?(window.innerWidth/x):(window.innerHeight/y);

area.style.height=y*q;
area.style.width=x*q;
area.height = y*q;
area.width = x*q;

const getStamps=()=>{
  socket.emit('message',{type:'fullImageRequest'});
}
getStamps();



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
  const yIn = (Math.floor(id/x))*q;
  const xIn = (id-x*(Math.floor(id/x)))*q;
  
  const image = new Image();
  image.onload= ()=>{
    brush.save();
    brush.translate(xIn,yIn);
    brush.drawImage(image,0,0, q,q);
    brush.restore();
  }
  image.src=imageIndex[color].image;
}

const drawMap=(map)=>{
  for(let i=0; i<map.map.tiles.length; i++){
    fillTile(i, map.map.tiles[i]);
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
  }else if(msg.type === 'fullImageRequestResponse'){
    imageIndex=msg.payload;
  }
})