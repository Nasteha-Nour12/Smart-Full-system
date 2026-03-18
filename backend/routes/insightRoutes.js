import express from "express";
import { getExecutiveOverview, getOperationalInsights } from "../controller/insightController.js";
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

export default router;
