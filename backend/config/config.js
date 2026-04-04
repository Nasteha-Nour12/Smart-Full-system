import dotenv from 'dotenv';

dotenv.config();
export const port = process.env.PORT || 8000;
export const dburl = process.env.MONGO_URL || process.env.mongo_url;
export const jwt_secret = process.env.jwt_secret;
export const cloudinary_name=process.env.Cloudinary_name;
export const cloudinary_api_key=process.env.Cloudinary_api_key;
export const cloudinary_api_secret=process.env.Cloudinary_api_secret;
