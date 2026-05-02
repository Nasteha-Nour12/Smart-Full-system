import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
import { downloadSystemBackup, restoreSystemBackup } from "../controller/systemBackupController.js";

const r = Router();

r.get("/backup", authenticate, authorizeRoles("ADMIN"), downloadSystemBackup);
r.post("/restore", authenticate, authorizeRoles("ADMIN"), restoreSystemBackup);

export default r;
