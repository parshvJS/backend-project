import dotenv from 'dotenv'
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import app from './app.js'
import connectDB from './db/index.js'
dotenv.config()
const port=process.env.PORT || 8000


connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`listen is : http://localhost:/${port}`)
    })
}).catch(()=>{
    console.log("(src/index.js) error is : ",err)
})






    // created Ifiy and connected Database
    // ; (async () => {
    //     try {
    //         console.log("Trying To Connect DB... !");
    //         mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    //         app.on("error", () => {
    //             console.log("Enable to Communicate with DB From Application !");
    //         })
    //         app.listen(process.env.PORT, () => {
    //             console.log(`Listening to Port ${process.env.PORT}`)
    //         })
    //     }
    //     catch (error) {
    //         console.log("Enable to connect DB !");
    //         throw error
    //     }
    // })()