import User from "../model/userSchema.js";

import express from 'express';
import multer from 'multer';
import Rooms from '../model/roomSchema.js'
import cloudinary from '../controller/cloudinary.js';
import { isAuthenticated } from "../controller/isAuthenticated.js";
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
router.get('/groupmembers', async (req, res) => {
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

export default router;