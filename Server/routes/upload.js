import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Message from '../model/MessageSchema.js';

const router = express.Router();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});


const upload = multer({ storage: multer.memoryStorage() });
const uploadToCloudinary = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', public_id: filename },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export default function createUploadRoute(io, userSocketMap) {
  router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const { from, to, type } = req.body;
      const file = req.file;

      if (!file) return res.status(400).json({ error: 'No file provided' });

     
      const uploadResult = await uploadToCloudinary(file.buffer, file.originalname, file.mimetype);
      const url = uploadResult.secure_url;
      const contenttype = file.mimetype.startsWith('image/') ? 'img' : 'file';

     
      const savedMessage = await Message.create({
        from,
        to,
        type,
        contenttype,
        url,
        content: file.originalname,
      });

      const socketPayload = {
        message: file.originalname,
        contenttype,
        url,
        fromUser: from,
      };

      
      if (type === 'group') {
        io.to(`group`).emit('receiveMessage', socketPayload);
      } else {
        const senderSocketId = userSocketMap.get(from);
        const receiverSocketId = userSocketMap.get(to);

        if (senderSocketId) io.to(senderSocketId).emit('receiveMessage', socketPayload);
        if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', socketPayload);
      }

      res.status(200).json({ success: true, message: savedMessage });
    } catch (err) {
      console.error('[Upload Error]', err);
      res.status(500).json({ error: 'File upload failed' });
    }
  });

  return router;
}
