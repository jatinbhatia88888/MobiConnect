// models/CallRoom.js
import mongoose from 'mongoose';

const callRoomSchema = new mongoose.Schema({
  roomName: String,
  members: [String], // user IDs or usernames
  type: { type: String, enum: ['individual', 'group'] }, // call type
  createdAt: { type: Date, default: Date.now },
});

const callRoom= mongoose.model('CallRoom', callRoomSchema);
export default callRoom;
