import mongoose from 'mongoose'
//import User from './model/userSchema'
const room =new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        admin:{
            type:String,
            required:true,
        },
        members:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    }
)
 const Rooms=mongoose.model('Rooms',room);
 export default Rooms