import { userSocketMap } from '../utilities/userSocketMap.js';
import express from 'express'
const router = express.Router();


router.post("/", (req, res) => {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(200).json({ message: "Already logged out" });
  }

  
  const socketId = userSocketMap[userId];
  if (socketId && req.app.get("io")) {
    const io = req.app.get("io");
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.disconnect(true); 
    delete userSocketMap[userId];
  }

  

  
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
    });
     console.log("logout successful");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

export default router;
