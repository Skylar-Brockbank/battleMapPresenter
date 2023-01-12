const socket = io();

// socket.on('message', message=>{
//   console.log(message);
// })
const area = document.getElementById('testArea');
// document.style.overflow='hidden';
// body.style.padding=0;
area.style.height='100vh';
area.style.width='100vw';

const colorChange = (update)=>{
  area.style.backgroundColor=update;
}

socket.on('message', msg=>{
  colorChange(msg);
  console.log(msg);
})