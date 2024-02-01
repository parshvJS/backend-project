import mongoose from "mongoose";
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    password: {
        type: String,
        required: [true, "Password Is Required !"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,9)


    next()
})

userSchema.methods.isPasswordCorrect=async function () {
    return await bcrypt.compare(password,this.password)
 }

 userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
 }
 userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
 }
export const User = mongoose.model("User", userSchema)