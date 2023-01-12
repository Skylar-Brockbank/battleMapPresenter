const socket = io();

const red = document.getElementById('testButtonRed');
const blue = document.getElementById('testButtonBlue');

red.addEventListener('click', (e)=>{
  e.preventDefault();
  socket.emit('colorChange', 'red')
})

blue.addEventListener('click', (e)=>{
  e.preventDefault();
  socket.emit('colorChange', 'blue')
})