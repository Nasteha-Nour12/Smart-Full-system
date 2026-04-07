import express from "express";
import {
  getExecutiveOverview,
  getOperationalInsights,
  getTodaysRegistrationStats,
  sendTodaysRegistrationSms,
} from "../controller/insightController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get(
  "/executive-overview",
  authenticate,
  authorizeRoles("ADMIN", "CEO", "ICT_OFFICER"),
  getExecutiveOverview
);

router.get(
  "/operational-insights",
  authenticate,
  authorizeRoles("ADMIN", "CEO", "ICT_OFFICER"),
  getOperationalInsights
);

router.get(
  "/today-registrations",
  authenticate,
  authorizeRoles("ADMIN", "CEO", "ICT_OFFICER"),
  getTodaysRegistrationStats
);

router.post(
  "/notify/today-registrations-sms",
  authenticate,
  authorizeRoles("ADMIN", "CEO", "ICT_OFFICER"),
  sendTodaysRegistrationSms
);

export default router;
