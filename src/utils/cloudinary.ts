import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "node:fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (localFilePath: string): void => {
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
};

const uploadOnCloudinary = async (
  localFilePath: string,
): Promise<UploadApiResponse | null> => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    removeLocalFile(localFilePath);
    return response;
  } catch (error: unknown) {
    removeLocalFile(localFilePath);
    console.error("Error uploading to Cloudinary", error);
    return null;
  }
};

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export { uploadOnCloudinary, deleteFromCloudinary };
