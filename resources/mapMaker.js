const socket = io();
//TileData
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

//Injecting elements for the selector
const tileSelector = document.getElementById('tileSelector');
const guide = Object.keys(tiles);
for(let i = 0; i<guide.length; i++){
  const temp = document.createElement('option');
  temp.value=i;
  const sign = document.createTextNode(tiles[guide[i]]);
  temp.appendChild(sign);
  tileSelector.appendChild(temp);
}

const stampSelector = document.getElementById('stampSelector');
for(let i =0; i<Object.keys(stamps).length;i++){
  const temp = document.createElement('option');
  temp.value=i;
  const sign = document.createTextNode(stamps[i]);
  temp.appendChild(sign);
  stampSelector.appendChild(temp);
}

//Grid and file Setup

let mapObject = {
  tiles:[],
  stamps:[]
}


const x=12;
const y=20;

//populate map tiles
const intializeMapTiles = ()=>{
  for(let i = 0; i<x*y;i++){
    mapObject.tiles.push(0);
  }
  mapObject.stamps=[];
}
intializeMapTiles();

let trayMode=0;

let tileArray = [];


const canvasFrame = document.getElementById('canvasFrame');
const canvas = document.getElementById('mapCanvas');
const brush = canvas.getContext('2d');

const q = ((canvasFrame.clientWidth/x)<=(canvasFrame.clientHeight/y))?(canvasFrame.clientWidth/x):(canvasFrame.clientHeight/y);
canvasFrame.style.display='flex';
canvasFrame.style.justifyContent='center';

canvas.style.height = q*y;
canvas.style.width = q*x;
canvas.height = q*y;
canvas.width= q*x;

const drawGrid = ()=>{
  brush.strokeStyle="black";
  for(let i = 1; i<x; i++){
    brush.moveTo(i*q,0);
    brush.lineTo(i*q, canvas.height);
    brush.stroke();
  }
  for(let i = 1; i<y; i++){
    brush.moveTo(0,i*q);
    brush.lineTo(canvas.width, i*q);
    brush.stroke();
  }
}

const drawCross=(xIn,yIn)=>{
  brush.moveTo(xIn-10,yIn);
  brush.lineTo(xIn+10,yIn);
  brush.stroke();
  brush.moveTo(xIn,yIn-10);
  brush.lineTo(xIn,yIn+10);
  brush.stroke();
}

const getTile=(xIn,yIn)=>{
  return (Math.floor(yIn/q)*x)+(Math.floor(xIn/q));
}
const updateMapVisuals=()=>{
  for(i=0;i<x*y;i++){
    fillTile(i, textures[mapObject.tiles[i]]);
  }
  drawGrid();
}

const fillTile=(id, color)=>{
  const yIn = Math.floor(id/x);
  const xIn = id-x*yIn;
  brush.fillStyle=color;
  brush.fillRect(xIn*q,yIn*q,q,q);
}

drawGrid()

//Here lies those who listen and act
const rotationSlider = document.getElementById('rotation');
const rotationValue = document.getElementById('rotationValue');
const scaleSlider = document.getElementById('scale');
const scaleValue = document.getElementById('scaleValue');
const sendButton = document.getElementById('submit');

document.getElementById('tileButton').addEventListener('click',e=>{
  e.preventDefault();
  trayMode=0;
  document.getElementById('tileTray').style.display='block';
  document.getElementById('stampTray').style.display='none';
})

document.getElementById('stampButton').addEventListener('click',e=>{
  e.preventDefault();
  trayMode=1;
  document.getElementById('tileTray').style.display='none';
  document.getElementById('stampTray').style.display='block';
})

canvas.addEventListener('click',(e)=>{
  e.preventDefault();
  if(trayMode===0){
    fillTile(getTile(e.offsetX,e.offsetY),textures[tileSelector.value]);
    mapObject.tiles[getTile(e.offsetX,e.offsetY)]=tileSelector.value;
  }else{
    brush.save();
    brush.translate(e.offsetX,e.offsetY);
    brush.rotate(rotationSlider.value*(Math.PI/180));
    brush.scale(scaleSlider.value/100,scaleSlider.value/100);
    drawCross(0,0);
    mapObject.stamps.push({x:(e.offsetX/canvas.width), y:(e.offsetY/canvas.height),scale:scaleSlider.value,rotation:rotationSlider.value,stamp:stampSelector.value})
    brush.restore();
  }
})

rotationSlider.addEventListener('input', e=>{
  rotationValue.value=e.target.value;
})
scaleSlider.addEventListener('input', e=>{
  scaleValue.value=e.target.value;
})
scaleValue.addEventListener('input',e=>{
  scaleSlider.value=e.target.value;
})
rotationValue.addEventListener('input',e=>{
  rotationSlider.value=e.target.value;
})
sendButton.addEventListener('click',e=>{
  e.preventDefault();
  socket.emit('message',{type:'save',payload:{name:document.getElementById('fileName').value, map:mapObject}})
})
document.getElementById('clear').addEventListener('click',e=>{
  e.preventDefault();
  brush.beginPath();
  brush.closePath();
  brush.clearRect(0,0,canvas.width,canvas.height);
  drawGrid()
  intializeMapTiles();
})
document.getElementById('fill').addEventListener('click',e=>{
  e.preventDefault();
  for(i=0;i<mapObject.tiles.length;i++){
    mapObject.tiles[i]=tileSelector.value
  }
  updateMapVisuals();
  console.log(mapObject)
})