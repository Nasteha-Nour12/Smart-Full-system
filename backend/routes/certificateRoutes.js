import express from "express";
import {
  issueCertificate,
  getMyCertificates,
  getAllCertificates,
  getCertificateById,
  deleteCertificate,
} from "../controller/certificateController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   CANDIDATE
============================ */
router.get("/me", authenticate, getMyCertificates);

/* ============================
   ADMIN
============================ */
router.post("/", authenticate, authorizeRoles("ADMIN"), issueCertificate);
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllCertificates);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), getCertificateById);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteCertificate);

export default router;