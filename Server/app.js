import express from 'express'
import http from 'http'
import {Server} from 'socket.io';
import cors from 'cors'
const app=express();
app.use(cors())
const server=http.createServer(app);
app.use(cors())
const io= new Server(server,{
    cors: {
        origin:'*'
    }
});
app.get('/',(req,res)=>{
   res.send("hello sir ji")
})

io.on("connect",(socket)=>{
    console.log("connection")
    socket.emit("message","this is hi from sever ")
    socket.on('disconnect',()=>{
        console.log("client disconnected ");
       // socket.close();
    })
   
})
server.listen("8000",()=>{
    console.log("this is mahakal ki help")
})