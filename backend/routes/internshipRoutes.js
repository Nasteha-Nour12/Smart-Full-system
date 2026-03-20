import express from "express";
import {
  requestInternship,
  getMyInternships,
  getAllInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
  cancelMyInternship,
} from "../controller/internshipController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   JOB_SEEKER
============================ */
router.post("/", authenticate, requestInternship);
router.get("/me", authenticate, getMyInternships);
router.patch("/me/cancel/:id", authenticate, cancelMyInternship);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getAllInternships);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getInternshipById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateInternship);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateInternshipStatus);

export default router;
