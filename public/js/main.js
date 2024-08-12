"use strict"

let socket

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const ctx_data = ctx.createImageData(160, 144);




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

window.addEventListener("contextmenu", e => e.preventDefault());

document.querySelectorAll('.controls button').forEach(btn => {
  btn.addEventListener('touchstart', (e) => {
    console.log(e.target.classList)
    pressed.push(e.target.classList[0])
  })

  btn.addEventListener('touchend', (e) => {
    const index = pressed.indexOf(e.target.classList[0]);
    pressed.splice(index, 1);
    if(!pressed.length) {
      console.log('sending empty', pressed)
      socket.emit('input', pressed);
    }
  })

  btn.addEventListener('mousedown', (e) => {
    console.log(e.target.classList)
    pressed.push(e.target.classList[0])
  })

  btn.addEventListener('mouseup', (e) => {
    const index = pressed.indexOf(e.target.classList[0]);
    pressed.splice(index, 1);
    if(!pressed.length) {
      console.log('sending empty', pressed)
      socket.emit('input', pressed);
    }
  })
})

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
      if(!pressed.length) {
        console.log('sending empty', pressed)
        socket.emit('input', pressed);
      }
  }
}

setInterval(() => {
  // console.log(pressed)
  if(pressed.length) socket.emit('input', pressed);
}, 100)

;(async () => {
  const token = localStorage.getItem('token')
  let isExpired = true
  if(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    isExpired = payload.exp < (Date.now() / 1000)
  }
  if(isExpired) {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');

    if(!codeParam) {
      location.href = location.origin === "http://localhost:3000" ? 
      "https://github.com/login/oauth/authorize?client_id=8d7a9d49582f3e342dac&redirect_uri=http://localhost:3000/client.html" :
      "https://github.com/login/oauth/authorize?client_id=91c84824bc7ffaace9d5&redirect_uri=http://aws-v.charles-chrismann.fr/client.html"
    } else {
      const token = await (await fetch(`/auth/auth?code=${codeParam}`)).json()
      if(token.statusCode && token.statusCode === 500) {
          location.href = location.origin === "http://localhost:3000" ? 
          "https://github.com/login/oauth/authorize?client_id=8d7a9d49582f3e342dac&redirect_uri=http://localhost:3000/client.html" :
          "https://github.com/login/oauth/authorize?client_id=91c84824bc7ffaace9d5&redirect_uri=http://aws-v.charles-chrismann.fr/client.html"
      } else localStorage.setItem('token', token.access_token)
    }
  }
  window.history.pushState({}, document.title, window.location.pathname);

  socket = io('/gameboy', {
    transportOptions: {
      polling: {
        extraHeaders: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      },
    },
  });

  socket.on('frame', (data) => {
    for (let i = 0; i < data.length; i++){
      ctx_data.data[i] = data[i];
    }
  
    ctx.putImageData(ctx_data, 0, 0);
  })

  socket.on('diff', (data) => {
    for (let i = 0; i < data.length; i+= 2){
      for(let j = 0; j < data[i + 1].length; j++) {
        ctx_data.data[data[i + 1][j]] = data[i];
      }
    }
  
    ctx.putImageData(ctx_data, 0, 0);
  })

})()