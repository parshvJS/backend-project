import {v2 as cloudinary} from 'cloudinary';
import fs from "fs" 

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key:  process.env.CLOUD_KEY, 
  api_secret:  process.env.CLOUD_SECRET 
});


const uploadOnCloudinary= async (localFilePath)=>{
    try {
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        if(response){
            console.log("File has been uploaded succesfully ! ")
            console.log("file url : ",response.url)
            return response
        }
        else{
            console.log("File not uploaded successfully !")
            console.log("Response Is : ",response)
        }
    } catch (error) {
        console.log("Catch Block!! file upload unsuccessfull")
        fn.unlinkSync(localFilePath)
        return null
        
    }
}

export { uploadOnCloudinary }