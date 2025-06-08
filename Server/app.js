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
import Message from './model/MessageSchema.js'
import * as mediasoup from 'mediasoup'; 
import os from 'os';
import callRoom from './model/callroom.js';

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  }
];

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
  console.log("checking session object");
  console.dir(req.session)
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
app.post('/login', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  console.log(name);
  console.log(email);

  const user = await User.findOne({ email });

  if (!user || user.name !== name) {
    return res.redirect("http://localhost:5173/login");
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).send("Session regeneration failed");
    }

    req.session.userId = user._id;
    req.session.username = user.name;

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("http://localhost:5173/login");
      }

      res.redirect("http://localhost:5173/home");
    });
  });
});



app.post('/signup', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;

  console.log(name);
  console.log(email);

  const inst = new User({
    name: name,
    email: email
  });

  try {
    await inst.save();
    console.log(inst);

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).send("Session regeneration failed");
      }

      req.session.username = name;
      req.session.userId = inst._id;

      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("http://localhost:5173/login");
        }

        res.redirect("http://localhost:5173/home");
      });
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.redirect("http://localhost:5173/login");
  }
});

app.post('/create-group',isAuthenticated, async (req,res)=>{
  
  try{
   
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

app.get("/messages", isAuthenticated, async (req, res) => {
  const { type,  peer, limit = 20, page = 0 } = req.query;
  const username = req.session.username;
   console.log(`${peer} is ${req.session.username} `)
   let offset=(page-1)*limit;
  const filter = {
    type,
    ...(type === 'user'                   
      ? {
          $or: [
            { from: username,to: peer },
            { from: peer, to: username }
          ]
        }
      : { to: peer })
  };
  
  try {
    const messages = await Message.find(filter)
      .sort({ timestamp: -1 }) 
      .skip(parseInt(offset))
      .limit(parseInt(limit))
     .select('from to timestamp content -_id'); ;
     console.log(`mee pa dokah ${messages}`)
    res.json(messages.reverse()); 
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

const mediasoupWorkers = [];

const numCores = os.cpus().length; 
const NUM_WORKERS = Math.min(numCores - 1, 4); 
 async function initMediasoupWorkers() {
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = await mediasoup.createWorker({
      rtcMinPort: 2000 + i * 100,
      rtcMaxPort: 2099 + i * 100,
      logLevel: 'warn',
    });

    worker.on('died', () => {
      console.error(`Worker ${i} died, exiting in 2 seconds`);
      setTimeout(() => process.exit(1), 2000);
    });

    mediasoupWorkers.push(worker);
  }
}


console.log("Media Soup Workers are:");
console.dir(mediasoupWorkers);






















io.use(sharedSession(mongosession, {
  autoSave: true
}));
app.get("/chatuser",isAuthenticated,async (req,res)=>{
   
   const ans = await User.findOne({ name: req.session.username }, 'chattedWith');

    console.log(` happy happy pls mahakal ${req.session.username}`)
    console.log(ans);                               
 console.log(ans.chattedWith);
 if(ans==null) res.json(["startchatting "])
  res.json(ans.chattedWith);
})
app.get("/chatgroup",isAuthenticated,async (req,res)=>{
   
   const ans = await User.findOne({ name: req.session.username }, 'rooms');
   console.log(ans.rooms);
   if(ans==null) res.json(["startchatting "])
   res.json(ans.rooms);
})






app.post("/checkroommembership",async (req,res)=>{
  const userId = req.session.userId;
  const  groupId  = req.body.groupname;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({isMember:false,});
    }

    const isMember = user.rooms.includes(groupId);
    return res.json({ isMember }); 

  } catch (err) {
    console.error("Membership check failed:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})
app.get('/home/me', (req, res) => {
  if (req.session && req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post("/joinroom",async (req,res)=>{
  console.dir(req);
  const userId = req.session.username; 
   const  groupId  = req.body.groupname;

  const user = await User.findOne({name:req.session.username});
  if (!user.rooms.includes(groupId)) {
    user.rooms.push(groupId);
    
    await user.save();
  }
  const room =await Rooms.findOne({name:groupId});
  if(!room.members.includes(userId)){
        room.members.push(userId);
        await room.save();
  }
  res.json({ success: true });

})

io.on("connect",(socket)=>{
    const session = socket.handshake.session;
    console.dir(session);

    userSocketMap.set(session.username, socket.id);
    socket.on('join-multiple-rooms', (groupList) => {
  if(groupList!=null) groupList.forEach(groupId => socket.join(groupId));
  console.log(`Socket ${socket.id} joined rooms: ${groupList}`);
  console.dir(groupList)
});

    const chattedWithSet = new Set();
    const roomSet=new Set();
   
    socket.on("sendMessage",async (msg)=>{
      let type=msg.type;
      
      console.log(msg);
      if(type==="user"){
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
    
      const newMsg = new Message({
       from: session.username,
       to: msg.recv,
       type,
       content: msg.message
     });

    await newMsg.save();
      const toSocket = userSocketMap.get(msg.recv);
      if(!toSocket) return ;
      console.log(`toSocket:${toSocket}`);
      if(toSocket){
      io.to(toSocket).emit('receiveMessage',{
        message:msg.message,
        fromUser:session.username,
      })
      }}
      if(type=="group"){
        const newMsg = new Message({
       from: session.username,
       to: msg.recv,
       type,
       content: msg.message
     });

    await newMsg.save();
        socket.to(msg.recv).emit('receiveMessage', {
          message:msg.message,
          fromUser:msg.recv,
           
  });
  console.log("message is sent in room");
      }
    })

    





























































const rooms = new Map();

socket.on('join-call-room', async ({ roomName }, callback) => {
  if (!rooms.has(roomName)) {
    const worker = mediasoupWorkers[0]; 
    console.dir(mediasoupWorkers)
    const router = await worker.createRouter({ mediaCodecs });
    rooms.set(roomName, { router, peers: new Map() });
  }

  const room = rooms.get(roomName);
  room.peers.set(socket.id, { transports: [], producers: [], consumers: [] });
  
  callback({ routerRtpCapabilities: room.router.rtpCapabilities });
});
   
socket.on('createProducerTransport', async ({ roomName }, callback) => {
  console.log(`room name is ${roomName}`)
  const room = rooms.get(roomName);
  const transport = await room.router.createWebRtcTransport({ listenIps: [{ ip: '0.0.0.0', announcedIp: null }], 
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 1000000 });

  room.peers.get(socket.id).transports.push(transport);
  transport.observer.once('close', () => {
    room.peers.get(socket.id).transports = room.peers.get(socket.id).transports.filter(t => t !== transport);
  });

  callback({
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters
  });

  socket.on('connectProducerTransport', ({ dtlsParameters }, ack) => {
    transport.connect({ dtlsParameters });
    ack();
  });


socket.on('produce', async ({ kind, rtpParameters }, callback) => {
 
  try{
    const producer = await transport.produce({ kind, rtpParameters });

    const peer = room.peers.get(socket.id);
    if (!peer) return callback({ error: 'Peer not found in room' });
    peer.producers = peer.producers || [];
    peer.producers.push(producer);

    producer.on('transportclose', () => {
      peer.producers = peer.producers.filter(p => p.id !== producer.id);
    })

    callback({ id: producer.id });

    
    for (const [otherSocketId] of room.peers.entries()) {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.sockets.sockets.get(otherSocketId);
        if (otherSocket) {
          otherSocket.emit('new-producer', {
            producerSocketId: socket.id,
            producerId: producer.id,
            kind
          });
        }
      }
    }

  } catch (error) {
    console.error('produce error:', error);
    callback({ error: error.message });
  }
});
});
    socket.on("connectConsumerTransport", async ({ dtlsParameters }, callback) => {
  const peer = rooms.peers.get(socket.id);
  const transport = peer.consumerTransport;
  await transport.connect({ dtlsParameters });
  callback();
});

socket.on("createConsumerTransport", async ({ roomName }, callback) => {
  const room = rooms.get(roomName);
  if (!room) return callback({ error: "Room not found" });

  const peer = room.peers.get(socket.id);
  if (!peer) return callback({ error: "Peer not found" });

  try {
    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: "127.0.0.1", announcedIp: null }], 
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    
    peer.consumerTransport = transport;

    transport.on("dtlsstatechange", (state) => {
      if (state === "closed") transport.close();
    });

    transport.on("close", () => {
      console.log("Consumer transport closed for", socket.id);
    });

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  } catch (err) {
    console.error("Failed to create consumer transport", err);
    callback({ error: err.message });
  }
});




































  socket.on('consume', async ({ producerSocketId, kind, roomName }, callback) => {
  const room = rooms.get(roomName);
  const producerPeer = room.peers.get(producerSocketId);
  const producer = producerPeer.producers.find(p => p.kind === kind);

  const consumer = await socket.consumerTransport.consume({
    producerId: producer.id,
    rtpCapabilities: room.router.rtpCapabilities,
    paused: false
  });

  room.peers.get(socket.id).consumers.push(consumer);

  callback({
    id: consumer.id,
    producerId: producer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters
  });
});


  socket.on("start-video-call", ({ room, to, type }) => {
  const from = socket.handshake.session.username;

  if (type === "user") {
    const toSocketId = userSocketMap.get(to);
    if (toSocketId) {
      io.to(toSocketId).emit("incoming-video-call", { room, from, type });
    }
  } else if (type === "group") {
    socket.to(to).emit("incoming-video-call", { room, from, type });
  }
});




  socket.on("join-room", ({ roomName }) => {
  const username = socket.handshake.session.username;
  if (roomName.startsWith("user-")) {
    const [, user1, user2] = roomName.split("-");
    if (![user1, user2].includes(username)) {
      socket.emit("unauthorized");
      return;
    }
  }

  socket.join(roomName);
  socket.on('disconnect', () => {
  rooms.forEach((room, roomName) => {
    const peer = room.peers.get(socket.id);
    if (!peer) return;

    peer.transports.forEach(t => t.close());
    peer.producers.forEach(p => p.close());
    peer.consumers.forEach(c => c.close());

    room.peers.delete(socket.id);

    if (room.peers.size === 0) {
      room.router.close();
      rooms.delete(roomName);
    }
  });
});

});
































    // socket.on('disconnect',()=>{
    //     console.log("client disconnected ");
    //     setInterval(() => {
    //       console.dir(session)    ;
    //       console.log("Session:", session);
    //       console.log("User ID:", session.userId);
    //       console.log("Username:", session.username);       
    //     }, 100000000);
       
    // })
   
});












async function startServer() {
  await initMediasoupWorkers(); 

  server.listen(8000, () => {
    console.log("🚀 Server is running on port 8000 (Mahakal ki help)");
  });
}
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  
});