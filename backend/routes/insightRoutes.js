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
  authorizeRoles("ADMIN", "CEO"),
  getExecutiveOverview
);

router.get(
  "/operational-insights",
  authenticate,
  authorizeRoles("ADMIN", "CEO"),
  getOperationalInsights
);

router.get(
  "/today-registrations",
  authenticate,
  authorizeRoles("ADMIN", "CEO"),
  getTodaysRegistrationStats
);

router.post(
  "/notify/today-registrations-sms",
  authenticate,
  authorizeRoles("ADMIN", "CEO"),
  sendTodaysRegistrationSms
);

export default router;
