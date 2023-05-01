const socket = io();

//Set global size
// const x=12;
// const y=20;
const x=36;
const y=60;

let clickMode=0;
let clickPoint={
  x:null,
  y:null
}

let imageIndex;

const getStamps=()=>{
  socket.emit('message',{type:'fullImageRequest'});
}
getStamps();

socket.on('message',m=>{
  if(m.type === 'fullImageRequestResponse'){
    imageIndex=m.payload;
    let utArray=Object.keys(imageIndex);
    utArray.forEach(e => {
      imageIndex[e].loaded = new Image()
      imageIndex[e].loaded.src = imageIndex[e].image;
    });

    let utilityArray = Object.keys(imageIndex);
    for(let i =0; i<utilityArray.length;i++){
      if(imageIndex[utilityArray[i]].type==='s'){
        const temp = document.createElement('option');
        temp.value=utilityArray[i];
        const sign = document.createTextNode(utilityArray[i]);
        temp.appendChild(sign);
        stampSelector.appendChild(temp);
      }
    }

    for(let i =0; i<utilityArray.length;i++){
      if(imageIndex[utilityArray[i]].type==='t'){
        const temp = document.createElement('option');
        temp.value=utilityArray[i];
        const sign = document.createTextNode(utilityArray[i]);
        temp.appendChild(sign);
        tileSelector.appendChild(temp);
      }
    }

    for(let i =0; i<utilityArray.length;i++){
      if(imageIndex[utilityArray[i]].type==='i'){
        const temp = document.createElement('option');
        temp.value=utilityArray[i];
        const sign = document.createTextNode(utilityArray[i]);
        temp.appendChild(sign);
        itemSelector.appendChild(temp);
      }
    }
    
  }
})
//Identify select box objects
const tileSelector = document.getElementById('tileSelector');
const stampSelector = document.getElementById('stampSelector');
const itemSelector = document.getElementById('itemSelector');


//Grid and file Setup

let mapObject = {
  tiles:[],
  stamps:[],
  items:[]
}


//populate map tiles

const intializeMapTiles = ()=>{
  for(let i = 0; i<x*y;i++){
    mapObject.tiles.push(0);
  }
  mapObject.stamps=[];
  mapObject.items=[];
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
  for(let i = 1; i<(x/3); i++){
    brush.moveTo(i*q*3,0);
    brush.lineTo(i*q*3, canvas.height);
    brush.stroke();
  }
  for(let i = 1; i<(y/3); i++){
    brush.moveTo(0,i*q*3);
    brush.lineTo(canvas.width, i*q*3);
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
  const w=q*3;
  image.onload= ()=>{
    brush.save();
    brush.translate(xIn,yIn);
    brush.rotate(rotation*(Math.PI/180));
    brush.scale(scale/100,scale/100);
    brush.drawImage(image,0-w/2,0-w/2, w,w);
    brush.restore();
  }
  image.src=imageIndex[stamp].image;
}

const getTile=(xIn,yIn)=>{
  return (Math.floor(yIn/q)*x)+(Math.floor(xIn/q));
}
const getItemTile=(xIn,yIn)=>{
  return (Math.floor(yIn/(q*3))*(x/3))+(Math.floor(xIn/(q*3)));
}
const updateMapVisuals=()=>{
  for(i=0;i<x*y;i++){
    fillTile(i, mapObject.tiles[i]);
  }
  drawGrid();
}

const fillTile=(id, color)=>{
  const yIn = (Math.floor(id/x))*q;
  const xIn = (id-x*(Math.floor(id/x)))*q;
  
  // const image = new Image();
  // image.onload= ()=>{
    brush.save();
    brush.translate(xIn,yIn);
    brush.drawImage(imageIndex[color].loaded,0,0, q,q);
    // brush.drawImage(image,0,0, q,q);
    brush.restore();
  // }
  // image.src=imageIndex[color].image;
}
const fillItem=(id, color)=>{
  const yIn = (Math.floor(id/(x/3)))*q*3;
  const xIn = (id-(x/3)*(Math.floor(id/(x/3))))*q*3;
  
  // const image = new Image();
  // image.onload= ()=>{
    brush.save();
    brush.translate(xIn,yIn);
    brush.drawImage(imageIndex[color].loaded,0,0, q*3,q*3);
    // brush.drawImage(image,0,0, q,q);
    brush.restore();
  // }
  // image.src=imageIndex[color].image;
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
  document.getElementById('itemTray').style.display='none';
})
document.getElementById('itemButton').addEventListener('click',e=>{
  e.preventDefault();
  trayMode=2;
  document.getElementById('tileTray').style.display='none';
  document.getElementById('stampTray').style.display='none';
  document.getElementById('itemTray').style.display='block';
})


document.getElementById('stampButton').addEventListener('click',e=>{
  e.preventDefault();
  trayMode=1;
  document.getElementById('tileTray').style.display='none';
  document.getElementById('stampTray').style.display='block';
  document.getElementById('itemTray').style.display='none';
})


const fillRectangle = (texture, x1, y1, x2, y2) =>{
  xstart = (x1<x2)?x1:x2;
  ystart = (y1<y2)?y1:y2;
  xend = (x1>x2)?x1:x2;
  yend = (y1>y2)?y1:y2;
  


  for(i=0; i<(xend-xstart); i++){
    for(j=0; j<(yend-ystart); j++){
      const tileID = getTile(xstart+i, ystart+j);
      fillTile(tileID, texture);
      mapObject.tiles[tileID]=texture;
    }
  }
  drawGrid();
}

//Canvas click event handler
canvas.addEventListener('click',(e)=>{
  e.preventDefault();
  if(trayMode===0){
    if(clickMode===0){
      fillTile(getTile(e.offsetX,e.offsetY),tileSelector.value);
      mapObject.tiles[getTile(e.offsetX,e.offsetY)]=tileSelector.value;
    }else if(clickMode===1){
      if(clickPoint.x){
        console.log("clickPoint x is true");
        fillRectangle(tileSelector.value, e.offsetX,e.offsetY,clickPoint.x,clickPoint.y);
        clickPoint.x=null;
        clickPoint.y=null;
        clickMode=0;
      }else{
        clickPoint.x=e.offsetX;
        clickPoint.y=e.offsetY;
        console.log(clickPoint);
      }
    }
  }else if(trayMode===1){
    drawStamp(stampSelector.value,e.offsetX,e.offsetY,scaleSlider.value,rotationSlider.value);
    mapObject.stamps.push({x:(e.offsetX/canvas.width), y:(e.offsetY/canvas.height),scale:scaleSlider.value,rotation:rotationSlider.value,stamp:stampSelector.value})
    
  }else if(trayMode===2){
    fillItem(getItemTile(e.offsetX,e.offsetY),itemSelector.value);
    mapObject.items.push({tile:getItemTile(e.offsetX,e.offsetY), item:itemSelector.value})
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
document.getElementById('fillRect').addEventListener('click',e=>{
  e.preventDefault();
  clickMode=1;
  console.log('click mode:', clickMode);
})