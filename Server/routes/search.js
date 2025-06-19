import express, { Router } from 'express';
const router = express.Router();
import User from '../model/userSchema.js';
import Rooms from '../model/roomSchema.js';
import Message from '../model/MessageSchema.js';
import { isAuthenticated } from '../utilities/isAuthenticated.js';
router.get("/user",isAuthenticated , async (req,res)=>{
  const query=req.query.query;
 const users = await User.find(
      { name: new RegExp(query, 'i') },
      { name: 1, _id: 0 }
    );
  console.log(users);
  res.send(users)
})
router.post("/email",async(req,res)=>{
  const email=req.body.email;
  const user = await User.findOne({ email: email });
  console.log("user is",user);
 res.json({exist:!!user});
  
}
)
router.get("/group",isAuthenticated , async (req,res)=>{
  const query=req.query.query;
 const users = await Rooms.find(
      { name: new RegExp(query, 'i') },
      { name: 1, _id: 0 }
    );
  console.log(users);
  res.json(users)
})
export default router;