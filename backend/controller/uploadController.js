import cloudinary from "../utils/cloudinary.js";

export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
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
