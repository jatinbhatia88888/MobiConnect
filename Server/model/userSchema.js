import {mongoose} from 'mongoose'
//import Rooms from './models/roomSchema'
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
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
      
  }]
});
const  User= mongoose.model('User', userSchema);
export default  User