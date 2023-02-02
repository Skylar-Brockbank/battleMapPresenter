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

let stampIndex;

const getStamps=()=>{
  socket.emit('message',{type:'stampIndex'});
}
getStamps();

socket.on('message',m=>{
  if(m.type === 'stampIndexResponse'){
    stampIndex=m.payload;

    for(let i =0; i<stampIndex.length;i++){
      const temp = document.createElement('option');
      temp.value=i;
      const sign = document.createTextNode(stampIndex[i].name);
      temp.appendChild(sign);
      stampSelector.appendChild(temp);
    }
    
  }
})

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

const drawStamp = (stamp,xIn,yIn,scale,rotation)=>{
  const image = new Image();
  image.onload= ()=>{
    brush.save();
    brush.translate(xIn,yIn);
    brush.rotate(rotation*(Math.PI/180));
    brush.scale(scale/100,scale/100);
    brush.drawImage(image,0-q/2,0-q/2, q,q);
    brush.restore();
  }
  image.src=stampIndex[stamp].image;
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

const drawStampLine = (x1,y1,x2,y2) =>{
  const dX = Math.abs(x1-x2);
  const dY = Math.abs(y1-y2);
  console.log('dx:',dX,'dy:',dY)
  const mode = dX>dY?'x':'y';

  if(mode==='x'){
    const coModifier = x1-x2>0?1:-1;
    for(let i =0; i<Math.floor(dX/q);i++){
      console.log('place stamp',x1-(i*q),y1);
      drawStamp(stampSelector.value, x1+(q/2)-coModifier*(i*q),y1,scaleSlider.value, rotationSlider.value);
      mapObject.stamps.push({x:((x1-(i*q))/canvas.width), y:(y1/canvas.height),scale:scaleSlider.value,rotation:rotationSlider.value,stamp:stampSelector.value})
    }
  }else{
    const coModifier = y1-y2>0?1:-1;
    for(let i =0; i<Math.floor(dY/q);i++){
      drawStamp(stampSelector.value, x1,y1+(q/2)-coModifier*(i*q),scaleSlider.value, rotationSlider.value);
      mapObject.stamps.push({x:(x1/canvas.width), y:((y1-(i*q))/canvas.height),scale:scaleSlider.value,rotation:rotationSlider.value,stamp:stampSelector.value})
    }
  }
}

drawGrid()

//Here lies those who listen and act
const rotationSlider = document.getElementById('rotation');
const rotationValue = document.getElementById('rotationValue');
const scaleSlider = document.getElementById('scale');
const scaleValue = document.getElementById('scaleValue');
const sendButton = document.getElementById('submit');
const lineMode = document.getElementById('lineMode');

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

let point1={};
canvas.addEventListener('click',(e)=>{
  e.preventDefault();
  if(trayMode===0){
    fillTile(getTile(e.offsetX,e.offsetY),textures[tileSelector.value]);
    mapObject.tiles[getTile(e.offsetX,e.offsetY)]=tileSelector.value;
  }else{
    console.log(lineMode.checked);
    if(lineMode.checked){
      if (point1.x){
        console.log('point1 is known:',point1,{x:e.offsetX,y:e.offsetY})
        drawStampLine(point1.x,point1.y,e.offsetX,e.offsetY);
        point1={};
      }else{
        point1={x:e.offsetX,y:e.offsetY};
        console.log('point1 set:',point1)
      }
    }else{
      drawStamp(stampSelector.value,e.offsetX,e.offsetY,scaleSlider.value,rotationSlider.value);
      mapObject.stamps.push({x:(e.offsetX/canvas.width), y:(e.offsetY/canvas.height),scale:scaleSlider.value,rotation:rotationSlider.value,stamp:stampSelector.value})
    }
    
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