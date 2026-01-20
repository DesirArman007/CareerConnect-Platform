import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  api_key: process.env.CLOUDINARY_API_KEY || undefined,
  api_secret: process.env.CLOUDINARY_API_SECRET || undefined,
  secure: true,
});

export default cloudinary;

// const safeUnlink = (p) => {
//   try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch {}
// };

// export const uploadOnCloudinary = async (filePath) => {
//   if (!filePath) return null;
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       resource_type: "auto",
//     });
//     return result;
//   } finally {
//     safeUnlink(filePath); // cleanup temp file regardless of success/failure
//   }
// };