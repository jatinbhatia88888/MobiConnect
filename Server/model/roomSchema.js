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
       members: [{
     type: String,
     required: true ,
  }],
    }
    
)
 const Rooms=mongoose.model('Rooms',room);
 export default Rooms