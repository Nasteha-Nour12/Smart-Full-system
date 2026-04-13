import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
import {
  createHospitality,
  getHospitalityList,
  getHospitalityById,
  updateHospitality,
} from "../controller/hospitalityProgramController.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("ADMIN"), createHospitality);
router.get("/", authenticate, authorizeRoles("ADMIN"), getHospitalityList);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), getHospitalityById);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateHospitality);

export default router;

