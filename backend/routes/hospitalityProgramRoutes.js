import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
import {
  createHospitality,
  getHospitalityList,
  getHospitalityById,
  updateHospitality,
} from "../controller/hospitalityProgramController.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("ADMIN", "ICT_OFFICER"), createHospitality);
router.get("/", authenticate, authorizeRoles("ADMIN", "ICT_OFFICER"), getHospitalityList);
router.get("/:id", authenticate, authorizeRoles("ADMIN", "ICT_OFFICER"), getHospitalityById);
router.put("/:id", authenticate, authorizeRoles("ADMIN", "ICT_OFFICER"), updateHospitality);

export default router;

