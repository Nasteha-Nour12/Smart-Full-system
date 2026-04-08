import express from "express";
import {
  submitGoToWork,
  getMyGoToWork,
  getAllGoToWork,
  getGoToWorkById,
  updateGoToWork,
  updateGoToWorkStatus,
  deleteGoToWork,
  importGoToWork,
} from "../controller/goToWorkController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   JOB_SEEKER
============================ */
router.post("/", authenticate, authorizeRoles("JOB_SEEKER", "ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"), submitGoToWork);
router.get("/me", authenticate, getMyGoToWork);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), getAllGoToWork);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), getGoToWorkById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), updateGoToWork);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), updateGoToWorkStatus);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), deleteGoToWork);
router.post("/import", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER", "ICT_OFFICER"), importGoToWork);

export default router;
