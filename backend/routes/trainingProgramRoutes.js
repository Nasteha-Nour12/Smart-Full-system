import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
import {
  createTrainingProgram,
  getMyTrainingPrograms,
  getAllTrainingPrograms,
  getTrainingProgramById,
  updateTrainingProgram,
  updateTrainingStatus,
  cancelMyTrainingProgram,
  deleteTrainingProgram,
  importTrainingPrograms,
} from "../controller/trainingProgramController.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("JOB_SEEKER", "ADMIN", "ICT_OFFICER"), createTrainingProgram);
router.get("/me", authenticate, authorizeRoles("JOB_SEEKER"), getMyTrainingPrograms);
router.patch("/me/cancel/:id", authenticate, authorizeRoles("JOB_SEEKER"), cancelMyTrainingProgram);

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  getAllTrainingPrograms
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  getTrainingProgramById
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  updateTrainingProgram
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  updateTrainingStatus
);
router.post(
  "/import",
  authenticate,
  authorizeRoles("ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  importTrainingPrograms
);
router.delete("/:id", authenticate, authorizeRoles("ADMIN", "ICT_OFFICER"), deleteTrainingProgram);

export default router;
