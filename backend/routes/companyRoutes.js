import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  updateCompanyStatus,
} from "../controller/companyController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   PUBLIC ROUTES
============================ */
router.post("/", authenticate, createCompany);
router.get("/", authenticate, getCompanies);
router.get("/:id", authenticate, getCompanyById);

/* ============================
   ADMIN ROUTES
============================ */
router.put("/:id", authenticate, updateCompany);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteCompany);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), updateCompanyStatus);

export default router;