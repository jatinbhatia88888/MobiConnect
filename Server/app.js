import express from 'express'
import http from 'http'
import process from 'process'
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
import User from './model/userSchema.js'
import session from 'express-session'
import Rooms from './model/roomSchema.js';
import MongoStore from 'connect-mongo';
const userSocketMap = new Map(); 
import sharedSession from 'express-socket.io-session';

dotenv.config()
const uri = process.env.MONGODBURI

  mongoose.connect(uri)
   .then(() => console.log("✅ Connected to MongoDB Atlas"))
   .then(()=>console.log(mongoose.connection.name))
   .catch(err => console.error("❌ MongoDB connection error:", err));

   
const app=express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

const server=http.createServer(app);

const mongosession=session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false,
    maxAge:7*24*60*60*1000,
  },
  store: MongoStore.create({
    mongoUrl: uri,
    autoRemove: 'native'
  })})
app.use(mongosession);
app.use(express.json()); 
app.use(express.urlencoded({ extended: true})); 

const io= new Server(server,{
    cors: {
        origin:'http://localhost:5173',
        credentials: true
    }
});

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  console.log(`Blocked: ${req.session.userId}`);
 res.status(400).json({ error: 'Query parameter is required.' })
};
app.get('/',isAuthenticated,(req,res)=>{
   res.send("hello sir ji")
})

app.get("/search/user",isAuthenticated , async (req,res)=>{
  const query=req.query.query;
 const users = await User.find(
      { name: new RegExp(query, 'i') },
      { name: 1, _id: 0 }
    );
  console.log(users);
  res.json(users)
})
app.get("/search/group",isAuthenticated , async (req,res)=>{
  const query=req.query.query;
 const users = await Rooms.find(
      { name: new RegExp(query, 'i') },
      { name: 1, _id: 0 }
    );
  console.log(users);
  res.json(users)
})
app.post('/login', async (req,res)=>{
   const name=req.body.name;
   const email=req.body.email;
   console.log(name);
   console.log(email);
   const user = await User.findOne({ email });
   
  if (!user || user.name !== name) {
    return res.redirect("http://localhost:5173/login");
  }
 
 
  req.session.userId = user._id;
  req.session.username=user.name;
   req.session.save(err => {
  if (err) {
    console.error("Session save error:", err);
    return res.redirect("http://localhost:5173/login");
  }
  res.redirect("http://localhost:5173/home");


})});

app.post('/signup',(req,res)=>{
    const name=req.body.name;
   const email=req.body.email;
   console.log(name);
   console.log(email);
   const inst=User();
   try{
   inst.email=email;
   inst.name=name;
   inst.save();
   console.log(inst);
   req.session.userId = inst._id;
   res.redirect("http://localhost:5173/home")
   }
   catch(err){
   res.redirect("http://localhost:5173/login")
   }
})
app.post('/create-group',isAuthenticated, async (req,res)=>{
  
  try{
    //console.dir(req);
    const inst =new Rooms({
         name:req.body.groupname,
         admin:req.session.username,
         members:[req.session.username],
    });
      await inst.save();
       
       const peer= await User.findOne({name:req.session.username});
       peer.rooms.push(req.body.groupname);
        await peer.save();
       res.json("ok");
  }
  catch{
    res.send("error occured");
  }
})
io.use(sharedSession(mongosession, {
  autoSave: true
}));
app.get("/chatuser",isAuthenticated,async (req,res)=>{
   
   const ans = await User.findOne({ name: req.session.username }, 'chattedWith');

    console.log(` happy happy pls mahakal ${req.session.username}`)
    console.log(ans);                               
 console.log(ans.chattedWith);
  res.json(ans.chattedWith);
})
app.get("/chatgroup",isAuthenticated,async (req,res)=>{
   
   const ans = await User.findOne({ name: req.session.username }, 'rooms');
   console.log(ans.rooms);
   res.json(ans.rooms);
})








io.on("connect",(socket)=>{
    const session = socket.handshake.session;
    console.dir(session);
    userSocketMap.set(session.username, socket.id);
    const chattedWithSet = new Set();
    console.log("connection");
    socket.on("sendMessage",async (msg)=>{
      console.log(msg);
      if (!chattedWithSet.has(msg.recv)) {
      const receiver = await User.findOne({ name: msg.recv });
      const sender = await User.findOne({ name: session.username});
      console.dir(sender)
      console.log(`user is ${receiver}& ${session.username}`);
      console.log(`user is ${sender}`);

     const alreadyChatted1 = sender.chattedWith.includes(msg.recv);
      const alreadyChatted2 = receiver.chattedWith.includes(session.username);
      if (!alreadyChatted1) {
        await User.updateOne(
          { name: session.username },
          { $addToSet: { chattedWith: msg.recv } }
        );
      }
      if(!alreadyChatted2){
        await User.updateOne(
          { name: msg.recv },
          { $addToSet: { chattedWith: session.username } }
        );
      }
       chattedWithSet.add(msg.recv); 
    }
    
      
      const toSocket = userSocketMap.get(msg.recv);
      if(!toSocket) return ;
      console.log(`toSocket:${toSocket}`);
      if(toSocket){
      io.to(toSocket).emit('receiveMessage',{
        message:msg.message,
        fromUser:session.username,
      })
      }
    })
    socket.on('disconnect',()=>{
        console.log("client disconnected ");
        setInterval(() => {
          console.dir(session)    ;
          console.log("Session:", session);
       console.log("User ID:", session.userId);
        console.log("Username:", session.username);       
        }, 100000000);
       
    })
   
});
server.listen("8000",()=>{
    console.log("this is mahakal ki help")
})