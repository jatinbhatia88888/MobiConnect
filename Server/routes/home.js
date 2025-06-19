import User from "../model/userSchema.js";

import express from 'express';
import multer from 'multer';
import Rooms from '../model/roomSchema.js'
import Message from "../model/MessageSchema.js";
import cloudinary from '../utilities/cloudinary.js';
import { isAuthenticated } from "../utilities/isAuthenticated.js";
import { userSocketMap } from "../utilities/userSocketMap.js";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router=express.Router()

router.get("/chatuser", isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findOne({ name: req.session.username });

    if (!currentUser || !currentUser.chattedWith || currentUser.chattedWith.length === 0) {
      return res.json([]);
    }

    const users = await User.find(
      { name: { $in: currentUser.chattedWith } },
      { name: 1, imgurl: 1, _id: 0 } 
    );

    res.json(users);
  } catch (error) {
    console.error("chatuser error:", error);
    res.status(500).json({ error: "Failed to fetch chatted users" });
  }
});






router.get("/chatgroup", isAuthenticated, async (req, res) => {
  try {
    const currentUsername = req.session.username;
    if (!currentUsername) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ name: currentUsername });
    if (!user || !user.rooms) {
      return res.json([]);
    }

   
    const groups = await Rooms.find(
      { name: { $in: user.rooms } },
      { name: 1, imgurl: 1, _id: 0 }
    );

   
    const response = groups.map(group => ({
      name: group.name,
      imgurl: group.imgurl || null,
    }));

    res.json(response);
  } catch (error) {
    console.error("chatgroup error:", error);
    res.status(500).json({ error: "Failed to fetch chat groups" });
  }
});

router.post('/create-group',isAuthenticated, upload.single("image"),async (req,res)=>{
  
  try{
        const file=req.file
        const streamUpload = (buffer) => {
             return new Promise((resolve, reject) => {
               const stream = cloudinary.uploader.upload_stream(
                 { folder: "avatars" },
                 (error, result) => {
                   if (error) reject(error);
                   else resolve(result);
                 }
               );
               stream.end(buffer);
             });
           };
       
           const result = await streamUpload(file.buffer);
   
        const inst =new Rooms({
         name:req.body.groupname,
         admin:req.session.username,
         members:[req.session.username],
          imgurl:result.secure_url,
    });
    // console.log("url is ",result.secure_url);
    // console.dir(inst);
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
router.get('/groupmembers',isAuthenticated, async (req, res) => {
  try {
    const { group } = req.query;
    const room = await Rooms.findOne({ name: group });

    if (!room) return res.status(404).json({ error: 'Group not found' });

    const members = await User.find({ name: { $in: room.members } })
      .select('name imgurl');

    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/message/delete',isAuthenticated, async (req, res) => {
  const { _id } = req.body;
   const io = req.app.get('io');
  try {
    const msg=await Message.findById(_id);
    let fromid;
    if(msg)  fromid=userSocketMap.get(msg.from);
    let recvid;
    if(msg)  recvid=userSocketMap.get(msg.to);
    const deletedMessage = await Message.findByIdAndDelete(_id);

    if (!deletedMessage) return res.status(404).json({ error: 'Message not found' });
    console.log("formid is",fromid);
    console.log("recvid is",recvid);
    if(fromid) io.to(fromid).emit('message-deleted', { _id });
   if(recvid) io.to(recvid).emit('message-deleted', { _id });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete failed:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/check-groupname',isAuthenticated, async (req, res) => {
  const name = req.query.name;
  const groupExists = await Rooms.findOne({ name }); 
  res.json({ available: !groupExists });
});
router.post("/checkroommembership",isAuthenticated,async (req,res)=>{
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
router.get('/me',isAuthenticated, (req, res) => {
  if (req.session && req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});
router.post("/joinroom",isAuthenticated,async (req,res)=>{
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
router.get("/messages", isAuthenticated, async (req, res) => {
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
     .select('from to timestamp content contenttype url _id'); ;
     console.log(`mee pa dokah ${messages}`)
    res.json(messages.reverse()); 
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

export default router;