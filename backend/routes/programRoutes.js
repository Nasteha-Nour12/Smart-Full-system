import express from "express";
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  updateProgramStatus,
} from "../controller/programController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   PROGRAM ROUTES
============================ */

// anyone logged-in can view
router.get("/", authenticate, getPrograms);
router.get("/:id", authenticate, getProgramById);

// admin/employer create-update, admin only delete
router.post("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), createProgram);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateProgram);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteProgram);

// admin/employer update status
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateProgramStatus);

export default router;
