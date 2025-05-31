import express from 'express'
import http from 'http'
import process from 'process'
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
const uri = process.env.MONGODBURI

 mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// app.use(process)
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