// 导入 http 和 http-proxy 模块
import http from 'http';
import {Server} from "socket.io"
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


import express from 'express'
const app = express();
app.use(express.static('dist'));
app.get('/meeting/:id', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
})
let server = http.createServer(app)
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});


const io = new Server(server)

let users = {}


let ress = {}

io.on('connection', (socket) => {
  //加入房间
  socket.on('join', (roomId,data) => {
    users[socket.id] = roomId
    socket.join(roomId);
    socket.to(roomId).emit("join",socket.id,data)
  });
  socket.on('updateInfo', (data) => {
    let roomId = users[socket.id]
    socket.to(roomId).emit("updateInfo",socket.id,data)
  });
  socket.on('message', (data) => {
    let roomId = users[socket.id]
    socket.to(roomId).emit("message",data)
  });


  // socket.on('chatGPT', async (text) => {
  //   if(ress[socket.id]===undefined){
  //
  //     ress[socket.id] = await api.sendMessage(text)
  //     socket.emit("chatGPT",ress[socket.id].text)
  //   } else {
  //     ress[socket.id] = await api.sendMessage(text, {
  //       parentMessageId: ress[socket.id].id
  //     })
  //     socket.emit("chatGPT",ress[socket.id].text)
  //   }
  // })


  //退出
  socket.on("disconnect", () => {
    const roomId = users[socket.id]
    delete users[socket.id]
    io.to(roomId).emit("user-disconnected", socket.id);
  });
})


// import {ChatGPTAPI} from "chatgpt";
// import proxy from "https-proxy-agent";
// import nodeFetch from "node-fetch";

// const api = new ChatGPTAPI({
//   apiKey: "",
//   fetch: (url, options = {}) => {
//     const defaultOptions = {
//       agent: proxy("http://127.0.0.1:10809"),
//     };
//
//     const mergedOptions = {
//       ...defaultOptions,
//       ...options,
//     };
//
//     return nodeFetch(url, mergedOptions);
//   },
// });
