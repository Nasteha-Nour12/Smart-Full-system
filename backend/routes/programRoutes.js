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

// admin only create/update/delete
router.post("/", authenticate, authorizeRoles("ADMIN"), createProgram);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateProgram);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteProgram);

// admin update status
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), updateProgramStatus);

export default router;