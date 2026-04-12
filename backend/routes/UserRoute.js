import { Router } from "express";
import {
  registerUser, loginUser, getAllUsers, getSingleUser,
  approveUser, banUser, updateUserRole, updateMe, createUserByAdmin, getMe, logout,
  getPasswordChangeRequests, approvePasswordChangeRequest, rejectPasswordChangeRequest
} from "../controller/UserController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";

const r = Router();

r.post("/register", registerUser);
r.post("/login", loginUser);
r.post("/logout", authenticate, logout);
r.post("/admin-create", authenticate, authorizeRoles("ADMIN"), createUserByAdmin);
r.get("/me", authenticate, getMe);

r.get("/", authenticate, authorizeRoles("ADMIN"), getAllUsers);
r.get("/:id", authenticate, authorizeRoles("ADMIN"), getSingleUser);

r.patch("/:id/approve", authenticate, authorizeRoles("ADMIN"), approveUser);
r.patch("/:id/ban", authenticate, authorizeRoles("ADMIN"), banUser);
r.patch("/:id/role", authenticate, authorizeRoles("ADMIN"), updateUserRole);
r.get("/password-requests/pending", authenticate, authorizeRoles("ADMIN"), getPasswordChangeRequests);
r.patch("/password-requests/:id/approve", authenticate, authorizeRoles("ADMIN"), approvePasswordChangeRequest);
r.patch("/password-requests/:id/reject", authenticate, authorizeRoles("ADMIN"), rejectPasswordChangeRequest);

r.patch("/me/update", authenticate, updateMe);

export default r;
