const socket = io();

let imageIndex;

const area = document.getElementById('mapArea');
const brush = area.getContext('2d');

const x = 36;
const y = 60;
const q= ((window.innerHeight/y)>(window.innerWidth/x))?(window.innerWidth/x):(window.innerHeight/y);

area.style.height=y*q;
area.style.width=x*q;
area.height = y*q;
area.width = x*q;

let currentMap;

let entityList = {};

const getStamps=()=>{
  socket.emit('message',{type:'fullImageRequest'});
}
getStamps();



const colorChange = (update)=>{
  brush.fillStyle=update;
  brush.fillRect(0,0,area.width,area.height);
  drawGrid();
}

// const drawGrid = ()=>{
//   brush.strokeStyle="rgba(255, 255, 255,0.1)";
//   for(let i = 1; i<x; i++){
//     brush.moveTo(i*q,0);
//     brush.lineTo(i*q, area.height);
//     brush.stroke();
//   }
//   for(let i = 1; i<y; i++){
//     brush.moveTo(0,i*q);
//     brush.lineTo(area.width, i*q);
//     brush.stroke();
//   }
// }
const drawGrid = ()=>{
  brush.strokeStyle="rgba(255, 255, 255,0.1)";
  for(let i = 1; i<(x/3); i++){
    brush.moveTo(i*q*3,0);
    brush.lineTo(i*q*3, area.height);
    brush.stroke();
  }
  for(let i = 1; i<(y/3); i++){
    brush.moveTo(0,i*q*3);
    brush.lineTo(area.width, i*q*3);
    brush.stroke();
  }
}
const fillTile=(id, color)=>{
  const yIn = (Math.floor(id/(x)))*(q);
  const xIn = (id-x*(Math.floor(id/(x))))*(q);
  
  // const image = new Image();
  // image.onload= ()=>{f
    brush.save();
    brush.translate(xIn,yIn);
    brush.drawImage(imageIndex[color].loaded,0,0, q,q);
    // brush.drawImage(image,0,0, q,q);
    brush.restore();
  // }
  // image.src=imageIndex[color].image;
}
const drawItems = (items)=>{
  for(let i = 0; i<items.length;i++){
    fillItem(items[i].tile, items[i].item);
  }
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

const drawEntities = (list)=>{
  const listKeys = Object.keys(list);
  for(let i =0; i<listKeys; i++){
    const xIn = list[listKeys[i]].x*q;
    const yIn = list[listKeys[i]].y*q;
    brush.beginPath();
    brush.arc(xIn+q/2,yIn+q/2, 0.4*q, 0, 2*Math.PI);
    brush.stroke();
    brush.font = "30px Arial";
    brush.fillText(listKeys[i], xIn, yIn);
    console.log(listKeys[i]);
  }
}
const drawMap=(map)=>{
  for(let i=0; i<map.map.tiles.length; i++){
    fillTile(i, map.map.tiles[i]);
  }
  console.log(map);
  drawItems(map.map.items);
  drawAllStamps(map.map.stamps);
  drawEntities(entityList);
}

const drawStamp = (stamp,xP,yP,scale,rotation)=>{
  const xIn = xP*x*q;
  const yIn = yP*y*q;
  const w=q*3
  // const image = new Image();
  // image.onload= ()=>{
    brush.save();
    brush.translate(xIn,yIn);
    brush.rotate(rotation*(Math.PI/180));
    brush.scale(scale/100,scale/100);
    brush.drawImage(imageIndex[stamp].loaded,0-w/2,0-w/2, w,w);
    brush.restore();
  // }
  // image.src=imageIndex[stamp].image;
}
const drawAllStamps = (stamps)=>{
  for(let i =0; i<stamps.length; i++){
    let t = stamps[i];
    drawStamp(t.stamp, t.x, t.y, t.scale, t.rotation);
  }
}
const clearScreen = () =>{
  brush.fillStyle='black';
  brush.fillRect(0,0,area.width,area.height);
}

socket.on('message', msg=>{
  console.log(msg);

  if(msg.type==='color'){
    if(msg.payload==='black'){
      clearScreen();
    }else{
      colorChange(msg.payload);  
    }
  }else if(msg.type==='map'){
    console.log(msg);
    currentMap=msg.payload;
    drawMap(msg.payload);
    drawGrid();
  }else if(msg.type === 'fullImageRequestResponse'){
    imageIndex=msg.payload;
    let utilityArray=Object.keys(imageIndex);
    utilityArray.forEach(e => {
      imageIndex[e].loaded = new Image()
      imageIndex[e].loaded.src = imageIndex[e].image;
    });
  }else if(msg.type==='setEntity'){
    console.log(msg);
    entityList[msg.payload.name]=msg.payload;
    drawMap(currentMap);
  }
})