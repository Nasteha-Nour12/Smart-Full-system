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
router.post("/", authenticate, authorizeRoles("JOB_SEEKER", "ADMIN", "ICT_OFFICER"), requestInternship);
router.get("/me", authenticate, authorizeRoles("JOB_SEEKER"), getMyInternships);
router.patch("/me/cancel/:id", authenticate, authorizeRoles("JOB_SEEKER"), cancelMyInternship);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), getAllInternships);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), getInternshipById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), updateInternship);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), updateInternshipStatus);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), deleteInternship);
router.post("/import", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), importInternships);

export default router;
