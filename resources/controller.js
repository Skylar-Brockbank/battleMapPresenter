const socket = io();

const red = document.getElementById('testButtonRed');
const blue = document.getElementById('testButtonBlue');
const black = document.getElementById('testButtonBlack');
const coast = document.getElementById('mapViewTest');

const idString='5bf95cf6-9927-41b7-b244-cc53ff64f379';

const mapButtonContainer = document.getElementById('mapButtons');
mapButtonContainer.style.display='flex';
mapButtonContainer.style.flexDirection='column';

let entityList = {};

const setEntity = (name, x,y, visable) =>{
  entityList[name] = {name:name, x:x,y:y,visable:visable};
  socket.emit('message',{type:'setEntity', payload:{name:name,x:x,y:y,visable:visable}});
}

socket.emit('message',{type:'request'});

socket.on('message',msg=>{
  if(msg.type==='data'){
    console.log('data recieved',msg)
    const index = msg.payload;
    const indexGuide = Object.keys(index);
    indexGuide.forEach(i=>{
      const temp = document.createElement('button');
      temp.id=i;
      temp.innerText=index[i];
      mapButtonContainer.appendChild(temp);
      temp.addEventListener('click',e=>{
        e.preventDefault();
        socket.emit('message',{type:'command',payload:e.target.id})
      })
    })
  }
})

red.addEventListener('click', (e)=>{
  e.preventDefault();
  socket.emit('colorChange', 'red')
})

blue.addEventListener('click', (e)=>{
  e.preventDefault();
  socket.emit('colorChange', 'blue')
})
black.addEventListener('click', (e)=>{
  e.preventDefault();
  socket.emit('colorChange', 'black')
})

const ename = document.getElementById('entityName');
const xin = document.getElementById('xinput');
const yin = document.getElementById('yinput');
const vis = document.getElementById('vis');

document.getElementById('updateForm').addEventListener('click',(e)=>{
  e.preventDefault();
  if(ename.value){
    setEntity(ename.value, xin.value, yin.value, vis.value);
  }
})