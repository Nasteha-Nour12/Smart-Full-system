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
   JOB_SEEKER
============================ */
router.get("/me", authenticate, getMyCertificates);

/* ============================
   ADMIN
============================ */
router.post("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), issueCertificate);
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getAllCertificates);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getCertificateById);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteCertificate);

export default router;
