import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { cloudinary_api_key, cloudinary_api_secret, cloudinary_name } from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../uploads");

const saveFileLocally = async (req) => {
  await fs.mkdir(uploadsRoot, { recursive: true });
  const ext = path.extname(req.file.originalname || "") || ".bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  const targetPath = path.join(uploadsRoot, safeName);
  await fs.writeFile(targetPath, req.file.buffer);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return {
    secure_url: `${baseUrl}/uploads/${safeName}`,
    public_id: `local/${safeName}`,
  };
};

const hasCloudinaryConfig = () =>
  Boolean(cloudinary_name && cloudinary_api_key && cloudinary_api_secret);

export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    let result;
    if (hasCloudinaryConfig()) {
      try {
        result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "smart-ses",
              resource_type: "auto",
            },
            (error, uploaded) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(uploaded);
            }
          );

          stream.end(req.file.buffer);
        });
      } catch (_cloudinaryError) {
        result = await saveFileLocally(req);
      }
    } else {
      result = await saveFileLocally(req);
    }

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};
