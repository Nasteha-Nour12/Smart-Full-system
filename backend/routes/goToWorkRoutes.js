import express from "express";
import {
  submitGoToWork,
  getMyGoToWork,
  getAllGoToWork,
  getGoToWorkById,
  updateGoToWork,
  updateGoToWorkStatus,
} from "../controller/goToWorkController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   JOB_SEEKER
============================ */
router.post("/", authenticate, submitGoToWork);
router.get("/me", authenticate, getMyGoToWork);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getAllGoToWork);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), getGoToWorkById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateGoToWork);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateGoToWorkStatus);

export default router;
