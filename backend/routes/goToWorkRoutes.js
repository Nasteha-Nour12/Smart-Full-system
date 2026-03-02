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
   CANDIDATE
============================ */
router.post("/", authenticate, submitGoToWork);
router.get("/me", authenticate, getMyGoToWork);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllGoToWork);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), getGoToWorkById);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateGoToWork);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), updateGoToWorkStatus);

export default router;