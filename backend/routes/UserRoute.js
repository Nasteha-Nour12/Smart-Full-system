import { Router } from "express";
import {
  registerUser, loginUser, getAllUsers, getSingleUser,
  approveUser, banUser, updateUserRole, updateMe, createUserByAdmin
} from "../controller/UserController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";

const r = Router();

r.post("/register", registerUser);
r.post("/login", loginUser);
r.post("/admin-create", authenticate, authorizeRoles("ADMIN"), createUserByAdmin);

r.get("/", authenticate, authorizeRoles("ADMIN"), getAllUsers);
r.get("/:id", authenticate, authorizeRoles("ADMIN"), getSingleUser);

r.patch("/:id/approve", authenticate, authorizeRoles("ADMIN"), approveUser);
r.patch("/:id/ban", authenticate, authorizeRoles("ADMIN"), banUser);
r.patch("/:id/role", authenticate, authorizeRoles("ADMIN"), updateUserRole);

r.patch("/me/update", authenticate, updateMe);

export default r;
