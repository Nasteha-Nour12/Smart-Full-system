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
   CANDIDATE
============================ */
router.post("/", authenticate, requestInternship);
router.get("/me", authenticate, getMyInternships);
router.patch("/me/cancel/:id", authenticate, cancelMyInternship);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllInternships);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), getInternshipById);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateInternship);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), updateInternshipStatus);

export default router;