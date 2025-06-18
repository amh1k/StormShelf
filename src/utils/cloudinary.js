import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
//configure cloudinary
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


const uploadOnCloudinary = async  (localFilePath) => {
    try {
        if (!localFilePath) return NULL;
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
            }
        )
        console.log("File uploaded on cloudniary" + response.url )
        // once the file is uploaded 
        fs.unlinkSync(localFilePath)
        return response;


    }
    catch(err) {
        fs.unlinkSync(localFilePath)
        console.log("error on cloudinary", err)
        return NULL

    }
}
const deleteFromCloudinary  = async (publicId) => {
    try {
        const result = cloudinary.uploader.destroy(publicId);
        console.log("deleted from cloudinary")

    }
    catch(err) {
        console.log("error deleting from Cloudinary", err);
        return NULL;
    }
}
export {uploadOnCloudinary, deleteFromCloudinary}