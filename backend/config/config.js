<<<<<<< HEAD
import dotenv from 'dotenv';

dotenv.config();
export const port = process.env.PORT || 8000;
export const dburl = process.env.MONGO_URL || process.env.mongo_url;
export const jwt_secret = process.env.jwt_secret;
export const cloudinary_name=process.env.Cloudinary_name;
export const cloudinary_api_key=process.env.Cloudinary_api_key;
export const cloudinary_api_secret=process.env.Cloudinary_api_secret;
=======
import dotenv from 'dotenv';

dotenv.config();
export const port = process.env.PORT || 8000;
export const dburl = process.env.MONGO_URL || process.env.mongo_url;
export const jwt_secret = process.env.jwt_secret;
export const cloudinary_name=process.env.Cloudinary_name;
export const cloudinary_api_key=process.env.Cloudinary_api_key;
export const cloudinary_api_secret=process.env.Cloudinary_api_secret;
export const sms_api_url = process.env.SMS_API_URL || "";
export const sms_api_key = process.env.SMS_API_KEY || "";
export const sms_from = process.env.SMS_FROM || "SMART-SES";
export const sms_to = process.env.SMS_TO || "";
>>>>>>> 9129225 (Start real project changes)
