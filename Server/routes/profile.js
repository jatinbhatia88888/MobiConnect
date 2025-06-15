import express from 'express';
import User from '../model/userSchema.js';
import multer from 'multer';
import cloudinary from '../controller/cloudinary.js';

const router = express.Router();

router.post('/username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username required' });
    }

    const user = await User.findOne({ origname: username.trim() });

    res.json({ exists: !!user });
  } catch (err) {
    console.error('Username check failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


const storage = multer.memoryStorage();
const upload = multer({ storage });


    
  router.post("/setup", upload.single("image"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(400).json({ error: "Not authenticated" });
    }
   
    const { username } = req.body;
    const file = req.file;

    const existing = await User.findOne({ origname: username });
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }

    
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

    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = username;
    user.imgurl = result.secure_url;
    await user.save();

    
    req.session.username = username;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Session save failed" });
      }

      
      res.json({ success: true });
    });
  } catch (err) {
    console.error("Profile setup error:", err);
    res.status(500).json({ error: "Profile setup failed" });
  }
});








export default router;
