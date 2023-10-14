"use strict"
const socket = io('/gameboy');

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const ctx_data = ctx.createImageData(160, 144);


socket.on('frame', (data) => {
  for (var i=0; i < data.length; i++){
    ctx_data.data[i] = data[i];
  }

  ctx.putImageData(ctx_data, 0, 0);
})

const keys = {
  "37":"left",
  "39":"right",
  "38":"up",
  "40":"down",
  "90":"a",
  "88":"b",
  "13":"start",
  "32":"select"
};

let pressed = []

window.onkeydown = function(e) {
  if(keys[e.keyCode] != undefined) {
      if(!pressed.find(k => k === keys[e.keyCode])) pressed.push(keys[e.keyCode])
  }
}

window.onkeyup = function(e) {
  if(keys[e.keyCode] != undefined) {
      // socket.emit('keyup', { key: keys[e.keyCode] });
      // console.log(index)
      const index = pressed.indexOf(keys[e.keyCode]);
      pressed.splice(index, 1);
  }
}

setInterval(() => {
  // console.log(pressed)
  if(pressed.length) socket.emit('input', pressed);
}, 100)