<<<<<<< HEAD
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import User from "../model/User.js";
import { jwt_secret } from "../config/config.js";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, jwt_secret, {
    expiresIn: "7d",
  });

export const registerUser = async (req, res) => {
  try {
    const schema = z.object({
      fullName: z.string().min(2),
      email: z.string().email().optional(),
      phone: z.string().min(6).optional(),
      password: z.string().min(6),
      // IMPORTANT: role ha laga diro public register (security)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { fullName, email, phone, password } = parsed.data;
    if (!email && !phone) return res.status(400).json({ message: "Email ama Phone waa qasab." });

    const exists = await User.findOne({
      $or: [email ? { email: email.toLowerCase() } : null, phone ? { phone } : null].filter(Boolean),
    });
    if (exists) return res.status(409).json({ message: "User horey ayuu u jiraa." });

    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      phone,
      passwordHash: password, // pre-save will hash it
      role: "ADMIN",
      status: "ACTIVE",
    });

    return res.status(201).json({
      message: "Registered successfully.",
      user: { id: user._id, fullName: user.fullName, role: user.role, status: user.status },
    });
  } catch (e) {
    return res.status(500).json({ message: "Register error", error: e.message });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const schema = z.object({
      fullName: z.string().min(2),
      email: z.string().email().optional(),
      phone: z.string().min(6).optional(),
      password: z.string().min(6),
      role: z.enum(["ADMIN"]),
      status: z.enum(["ACTIVE", "PENDING", "BANNED"]).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { fullName, email, phone, password, role, status } = parsed.data;
    if (!email && !phone) {
      return res.status(400).json({ message: "Email ama Phone waa qasab." });
    }

    const exists = await User.findOne({
      $or: [email ? { email: email.toLowerCase() } : null, phone ? { phone } : null].filter(Boolean),
    });

    if (exists) {
      return res.status(409).json({ message: "User horey ayuu u jiraa." });
    }

    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      phone,
      passwordHash: password,
      role,
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Create user error", error: e.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const schema = z.object({
      identifier: z.string().min(3), // email or phone
      password: z.string().min(6),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { identifier, password } = parsed.data;

    const query = isEmail(identifier)
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await User.findOne(query).select("+passwordHash");
    if (!user) return res.status(400).json({ message: "User lama helin." });

    if (user.status !== "ACTIVE")
      return res.status(403).json({ message: "Account-ka wali active ma aha." });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Password khaldan." });

    const token = signToken(user);

    // Cookie (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // prod => true (https)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    return res.json({
      accessToken: token,
      user: { id: user._id, fullName: user.fullName, role: user.role, status: user.status },
    });
  } catch (e) {
    return res.status(500).json({ message: "Login error", error: e.message });
  }
};

export const getAllUsers = async (_req, res) => {
  const users = await User.find({
    role: "ADMIN",
    email: { $not: /^candidate\..+@smartses\.local$/i },
  }).select("-passwordHash -resetPasswordTokenHash -resetPasswordExpiresAt");
  res.json({ success: true, data: users });
};

export const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash -resetPasswordTokenHash -resetPasswordExpiresAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, data: user });
};

// Admin: approve user
export const approveUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "ACTIVE" },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, message: "User activated", data: user });
};

// Admin: ban user
export const banUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "BANNED" },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, message: "User banned", data: user });
};

// Admin: update role
export const updateUserRole = async (req, res) => {
  const schema = z.object({ role: z.enum(["ADMIN"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: parsed.data.role },
    { new: true }
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, message: "Role updated", data: user });
};

// User: update profile + change password
export const updateMe = async (req, res) => {
  const schema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    oldPassword: z.string().min(6).optional(),
    newPassword: z.string().min(6).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await User.findById(req.user.id).select("+passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });

  const { fullName, phone, oldPassword, newPassword } = parsed.data;

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;

  if (newPassword) {
    if (!oldPassword) return res.status(400).json({ message: "Old password required" });
    const ok = await user.comparePassword(oldPassword);
    if (!ok) return res.status(401).json({ message: "Old password incorrect" });
    user.passwordHash = newPassword; // pre-save hashes
  }

  await user.save();
  res.json({ success: true, message: "Updated", data: { id: user._id, fullName: user.fullName, phone: user.phone } });
};

export const getMe = (req,res)=>{

}
export const logout = (req,res)=>{

}
=======
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import User from "../model/User.js";
import { jwt_secret } from "../config/config.js";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const NAME_REGEX = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name is required")
  .max(80, "Full name is too long")
  .regex(NAME_REGEX, "Full name accepts letters only");

const phoneSchema = z.string().trim().regex(PHONE_REGEX, "Phone must be digits only");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(PASSWORD_REGEX, "Password must include uppercase, lowercase, number, and special character.");

const validationResponse = (parsed) => {
  const firstField = Object.entries(parsed.error.flatten().fieldErrors || {}).find(([, val]) => val?.length);
  const field = firstField?.[0] || "request";
  const issue = firstField?.[1]?.[0] || parsed.error.issues?.[0]?.message || "Invalid input";
  return {
    message: `Validation error at ${field}: ${issue}`,
    fieldErrors: parsed.error.flatten().fieldErrors,
  };
};

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, jwt_secret, {
    expiresIn: "7d",
  });

export const registerUser = async (req, res) => {
  try {
    const schema = z.object({
      fullName: fullNameSchema,
      email: z.string().email().optional(),
      phone: phoneSchema.optional(),
      password: passwordSchema,
      // IMPORTANT: role ha laga diro public register (security)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(validationResponse(parsed));

    const { fullName, email, phone, password } = parsed.data;
    if (!email && !phone) return res.status(400).json({ message: "Email ama Phone waa qasab." });

    const existingAdmins = await User.countDocuments({ role: "ADMIN" });
    if (existingAdmins > 0) {
      return res.status(403).json({ message: "Second user disabled. Please login with existing admin." });
    }

    const exists = await User.findOne({
      $or: [email ? { email: email.toLowerCase() } : null, phone ? { phone } : null].filter(Boolean),
    });
    if (exists) return res.status(409).json({ message: "User horey ayuu u jiraa." });

    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      phone,
      passwordHash: password, // pre-save will hash it
      role: "ADMIN",
      status: "ACTIVE",
    });

    return res.status(201).json({
      message: "Registered successfully.",
      user: { id: user._id, fullName: user.fullName, role: user.role, status: user.status },
    });
  } catch (e) {
    return res.status(500).json({ message: "Register error", error: e.message });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const schema = z.object({
      fullName: fullNameSchema,
      email: z.string().email().optional(),
      phone: phoneSchema.optional(),
      password: passwordSchema,
      role: z.enum(["ADMIN"]),
      status: z.enum(["ACTIVE", "PENDING", "BANNED"]).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(validationResponse(parsed));

    const { fullName, email, phone, password, role, status } = parsed.data;
    if (!email && !phone) {
      return res.status(400).json({ message: "Email ama Phone waa qasab." });
    }

    const existingAdmins = await User.countDocuments({ role: "ADMIN" });
    if (existingAdmins >= 1) {
      return res.status(403).json({ message: "Second admin user disabled by system settings." });
    }

    const exists = await User.findOne({
      $or: [email ? { email: email.toLowerCase() } : null, phone ? { phone } : null].filter(Boolean),
    });

    if (exists) {
      return res.status(409).json({ message: "User horey ayuu u jiraa." });
    }

    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      phone,
      passwordHash: password,
      role,
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Create user error", error: e.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const schema = z.object({
      identifier: z.string().trim().min(3), // email or phone
      password: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(validationResponse(parsed));

    const { identifier, password } = parsed.data;
    const normalizedIdentifier = identifier.trim();
    const useEmail = isEmail(normalizedIdentifier);
    if (!useEmail && !PHONE_REGEX.test(normalizedIdentifier)) {
      return res.status(400).json({ message: "Identifier must be valid email or phone digits only." });
    }

    const query = useEmail
      ? { email: normalizedIdentifier.toLowerCase() }
      : { phone: normalizedIdentifier };

    const user = await User.findOne(query).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    if (user.status !== "ACTIVE")
      return res.status(403).json({ message: "Account-ka wali active ma aha." });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Incorrect password." });

    const token = signToken(user);

    // Cookie (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // prod => true (https)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    return res.json({
      accessToken: token,
      user: { id: user._id, fullName: user.fullName, role: user.role, status: user.status },
    });
  } catch (e) {
    return res.status(500).json({ message: "Login error", error: e.message });
  }
};

export const getAllUsers = async (_req, res) => {
  const users = await User.find({
    role: "ADMIN",
    email: { $not: /^candidate\..+@smartses\.local$/i },
  }).select("-passwordHash -resetPasswordTokenHash -resetPasswordExpiresAt");
  res.json({ success: true, data: users });
};

export const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash -resetPasswordTokenHash -resetPasswordExpiresAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, data: user });
};

// Admin: approve user
export const approveUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "ACTIVE" },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, message: "User activated", data: user });
};

// Admin: ban user
export const banUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "BANNED" },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, message: "User banned", data: user });
};

// Admin: update role
export const updateUserRole = async (req, res) => {
  const schema = z.object({ role: z.enum(["ADMIN"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationResponse(parsed));

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: parsed.data.role },
    { new: true }
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, message: "Role updated", data: user });
};

// User: update profile + change password
export const updateMe = async (req, res) => {
  const schema = z.object({
    fullName: fullNameSchema.optional(),
    phone: phoneSchema.optional(),
    oldPassword: z.string().min(8).optional(),
    newPassword: passwordSchema.optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await User.findById(req.user.id).select("+passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });

  const { fullName, phone, oldPassword, newPassword } = parsed.data;

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;

  if (newPassword) {
    if (!oldPassword) return res.status(400).json({ message: "Old password required" });
    const ok = await user.comparePassword(oldPassword);
    if (!ok) return res.status(401).json({ message: "Old password incorrect" });
    user.passwordHash = newPassword; // pre-save hashes
  }

  await user.save();
  res.json({ success: true, message: "Updated", data: { id: user._id, fullName: user.fullName, phone: user.phone } });
};

export const getMe = (req,res)=>{
  res.json({ success: true, data: req.user });
};
export const logout = (_req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
};
>>>>>>> 9129225 (Start real project changes)
