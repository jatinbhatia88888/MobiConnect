import {mongoose} from 'mongoose'
//import Rooms from './models/roomSchema'
const userSchema=new mongoose.Schema({
    origname:{
      type:String,
    },
    googleid:{
      type:String,

    },
    name:{
        type:String,
        
    },
    email:{
        type:String,
        match: [/.+\@.+\..+/],
        required:true,
    },
     rooms:[{
        type:String,
        
     }],
      chattedWith:[{
    type:String,
      
  }],
  imgurl:{
    type:String

  },
  password:{
    type:String
  }
});
const  User= mongoose.model('User', userSchema);
export default  User