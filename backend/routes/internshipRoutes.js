import express from "express";
import {
  requestInternship,
  getMyInternships,
  getAllInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
  cancelMyInternship,
  importInternships,
} from "../controller/internshipController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   JOB_SEEKER
============================ */
router.post("/", authenticate, authorizeRoles("VISITOR", "ADMIN"), requestInternship);
router.get("/me", authenticate, authorizeRoles("VISITOR"), getMyInternships);
router.patch("/me/cancel/:id", authenticate, authorizeRoles("VISITOR"), cancelMyInternship);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), getAllInternships);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), getInternshipById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), updateInternship);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), updateInternshipStatus);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), deleteInternship);
router.post("/import", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), importInternships);

export default router;
