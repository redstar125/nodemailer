const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    }
})
const User=mongoose.model('User',userSchema);
module.exports=User;