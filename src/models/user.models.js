import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        index:true,
        lowercase:true
    },
    email:{
    type : String,
    required : true,
    },
    fullname:{
    type : String,
    required : true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:{
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },
    password:{
        type:String,
        required:[true,"Password Is Required !"]
    },
    refreshToken:{
        type:String
    }    
},{timestamps:true})

export const User=mongoose.model("User",userSchema)