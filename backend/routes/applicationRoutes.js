import express from "express";
import {
  applyOpportunity,
  getMyApplications,
  withdrawMyApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
} from "../controller/applicationController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   JOB_SEEKER
============================ */
router.post("/", authenticate, applyOpportunity);
router.get("/me", authenticate, getMyApplications);
router.delete("/me/:id", authenticate, withdrawMyApplication);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getAllApplications);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getApplicationById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateApplication);

export default router;
