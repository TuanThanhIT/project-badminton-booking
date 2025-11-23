import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadBuffer = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: folder || "products",
      resource_type: "image",
    };

    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(fileBuffer); // truyền buffer trực tiếp
  });
};

export default uploadBuffer;
