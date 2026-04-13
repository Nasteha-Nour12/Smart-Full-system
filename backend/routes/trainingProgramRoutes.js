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

router.post("/", authenticate, authorizeRoles("VISITOR", "ADMIN"), createTrainingProgram);
router.get("/me", authenticate, authorizeRoles("VISITOR"), getMyTrainingPrograms);
router.patch("/me/cancel/:id", authenticate, authorizeRoles("VISITOR"), cancelMyTrainingProgram);

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  getAllTrainingPrograms
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  getTrainingProgramById
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  updateTrainingProgram
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  updateTrainingStatus
);
router.post(
  "/import",
  authenticate,
  authorizeRoles("ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"),
  importTrainingPrograms
);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteTrainingProgram);

export default router;
