import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"    
cloudinary.config({ 
  cloud_name: 'dc93irkff', 
  api_key: '898266179776994', 
  api_secret: 'u4GiS_VZpVjQh_orkqtUJf_W3oM' 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("Catch Block!! file upload unsuccessfull")
        fs.unlinkSync(localFilePath)
        return null

    }
}

export { uploadOnCloudinary }