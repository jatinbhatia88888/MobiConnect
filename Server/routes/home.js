import User from "../model/userSchema.js";
import CallRoom from '../model/callroom.js'; 
import express from 'express';
import { isAuthenticated } from "../controller/isAuthenticated.js";
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

    const groups = await CallRoom.find(
      { members: currentUsername, type: 'group' },
      { roomName: 1, imgurl: 1, _id: 0 }
    );

   
    const response = groups.map(group => ({
      name: group.roomName,
      imgurl: group.imgurl ,
    }));

    res.json(response);
  } catch (error) {
    console.error("chatgroup error:", error);
    res.status(500).json({ error: "Failed to fetch chat groups" });
  }
});
export default router;