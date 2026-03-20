import express from "express";
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
} from "../controller/opportunityController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   PUBLIC/LOGGED-IN VIEW
============================ */
router.get("/", authenticate, getOpportunities);
router.get("/:id", authenticate, getOpportunityById);

/* ============================
   ADMIN/EMPLOYER MANAGE
============================ */
router.post("/", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), createOpportunity);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateOpportunity);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteOpportunity);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN", "EMPLOYER"), updateOpportunityStatus);

export default router;
