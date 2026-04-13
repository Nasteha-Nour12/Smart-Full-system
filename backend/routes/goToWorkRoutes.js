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
router.post("/", authenticate, authorizeRoles("VISITOR", "ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), submitGoToWork);
router.get("/me", authenticate, getMyGoToWork);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), getAllGoToWork);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), getGoToWorkById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), updateGoToWork);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), updateGoToWorkStatus);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), deleteGoToWork);
router.post("/import", authenticate, authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"), importGoToWork);

export default router;
