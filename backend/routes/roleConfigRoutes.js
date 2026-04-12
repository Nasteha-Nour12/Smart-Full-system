import { Router } from "express";
import {
  createRoleConfig,
  deleteRoleConfig,
  getRoleConfigs,
  updateRoleConfig,
} from "../controller/roleConfigController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";

const r = Router();

r.get("/", authenticate, authorizeRoles("ADMIN"), getRoleConfigs);
r.post("/", authenticate, authorizeRoles("ADMIN"), createRoleConfig);
r.put("/:id", authenticate, authorizeRoles("ADMIN"), updateRoleConfig);
r.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteRoleConfig);

export default r;
