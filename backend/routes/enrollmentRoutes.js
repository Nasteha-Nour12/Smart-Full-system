import express from "express";
import {
  enrollProgram,
  getMyEnrollments,
  getAllEnrollments,
  updateEnrollment,
  dropEnrollment,
} from "../controller/enrollmentController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   JOB_SEEKER ROUTES
============================ */
router.post("/", authenticate, enrollProgram);
router.get("/me", authenticate, getMyEnrollments);
router.patch("/drop/:id", authenticate, dropEnrollment);

/* ============================
   ADMIN ROUTES
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getAllEnrollments);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateEnrollment);

export default router;
