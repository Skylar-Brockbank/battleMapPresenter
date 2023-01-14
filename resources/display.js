const socket = io();

// socket.on('message', message=>{
//   console.log(message);
// })
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
const clearScreen = () =>{
  brush.fillStyle='black';
  brush.fillRect(0,0,area.width,area.height);
}

socket.on('message', msg=>{
  if(msg==='black'){
    clearScreen();
  }else{
    colorChange(msg);  
  }
})