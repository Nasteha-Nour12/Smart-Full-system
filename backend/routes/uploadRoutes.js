import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/authmiddleware.js";
import { uploadSingleFile } from "../controller/uploadController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/single", authenticate, upload.single("file"), uploadSingleFile);

export default router;
