import express from "express";
import {
  getMyProfile,
  upsertMyProfile,
  updateMyProfile,
  addSkill,
  removeSkill,
  getAllProfiles,
  getProfileByUserId,
  deleteProfileByUserId,
} from "../controller/candidateProfileController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";


const router = express.Router();

/* ============================
   CANDIDATE (MY PROFILE)
============================ */
router.get("/me", authenticate, getMyProfile);
router.post("/me", authenticate, upsertMyProfile);   // create or update
router.put("/me", authenticate, updateMyProfile);    // update only

router.post("/me/skills", authenticate, addSkill);
router.delete("/me/skills/:skillId", authenticate, removeSkill);

/* ============================
   ADMIN
============================ */
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllProfiles);
router.get("/:userId", authenticate, authorizeRoles("ADMIN"), getProfileByUserId);
router.delete("/:userId", authenticate, authorizeRoles("ADMIN"), deleteProfileByUserId);

export default router;