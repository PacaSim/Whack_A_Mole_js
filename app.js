const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");

const io = socketIO(server);

//서버 실행시 페이지 지정
app.use(express.static(path.join(__dirname, "src"))); 
//포트 지정
const PORT = process.env.PORT || 5000;

//클라이언트로부터 name과 score 전송받기
io.on("connection",(socket)=>{
  socket.on("score", (data)=>{
      const { name, score } = data;
    io.emit("score", {
      name,
      score,
      currentTime: moment(new Date()).format("h:mm:ss A")
    })
  })
})

//PORT : 5000로 listen
server.listen(PORT, ()=> console.log(`server is running ${PORT}`));
