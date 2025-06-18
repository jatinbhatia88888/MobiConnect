import mongoose from 'mongoose';

const callRoomSchema = new mongoose.Schema({
  roomName: String,
  members: [String], 
  type: { type: String, enum: ['individual', 'group'] }, 
  createdAt: { type: Date, default: Date.now },
  imgurl:{
    type:String,
    
  }
});

const callRoom= mongoose.model('CallRoom', callRoomSchema);
export default callRoom;
