import express from 'express'
import http from 'http'
import process from 'process'
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
import User from './model/userSchema.js'
dotenv.config()
const uri = process.env.MONGODBURI
async ()=>{
  await mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
}
 
const app=express();
app.use(cors())
const server=http.createServer(app);
app.use(cors())
app.use(express.urlencoded({ extended: true})); 
const io= new Server(server,{
    cors: {
        origin:'*'
    }
});
app.get('/',(req,res)=>{
   res.send("hello sir ji")
})
app.post('/login',(req,res)=>{
   const name=req.body.name;
   const email=req.body.email;
   console.log(name);
   console.log(email);
   res.redirect("http://localhost:5173/home")
})
io.on("connect",(socket)=>{
    console.log("connection")
    socket.emit("message","this is hi from sever ")
    socket.on('disconnect',()=>{
        console.log("client disconnected ");
       
    })
   
})
server.listen("8000",()=>{
    console.log("this is mahakal ki help")
})