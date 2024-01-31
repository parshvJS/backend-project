import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
    try{
        console.log("trying to connect with DB... !")
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       console.log(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`connected with DB !`)
    }
    catch(error){
        console.log("Enable to connect with Database !")
        throw error
    }
}

export default connectDB;