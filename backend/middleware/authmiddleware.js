import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { jwt_secret } from "../config/config.js";


/**
 * ✅ Verify JWT and attach user payload to req.user
 */
export const authenticate = (req, res, next) => {
  const bearerHeader = req.headers?.authorization || req.headers?.Authorization;
  const bearerToken =
    typeof bearerHeader === "string" && bearerHeader.startsWith("Bearer ")
      ? bearerHeader.slice(7).trim()
      : null;

  const token = req.cookies?.token || bearerToken; // accept cookie or bearer token
  if (!token) {
    return res.status(401).json({ message: "Access denied. please login " });
  }

  try {
    const decoded = jwt.verify(token, jwt_secret);
    const userIdRaw = decoded.id || decoded._id || decoded.sub;
    const userId = String(userIdRaw || "").trim();
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid token payload: missing user id" });
    }

    req.user = {
      ...decoded,
      id: userId,
      _id: userId,
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * ✅ Optional helper to restrict specific roles
 *    Usage: router.post('/admin-only', authenticate, authorizeRoles('admin'), handler)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};

// // i need check user is active or not
// export const checkActiveStatus = (req, res, next) => {
//   if (!req.user || req.user.isActive === false) {
//     return res.status(403).json({ message: "Account is inactive. Contact admin." });
//   }
//   next();
// }
