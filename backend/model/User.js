import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { DEFAULT_ADMIN_PAGES, PAGE_ACCESS } from "../constants/pageAccess.js";

const ROLES = ["ADMIN", "JOB_SEEKER", "EMPLOYER", "INTERNSHIP_EMPLOYER", "CEO", "ICT_OFFICER"];
const STATUS = ["ACTIVE", "PENDING", "BANNED"];
const PASSWORD_REQUEST_STATUS = ["NONE", "PENDING", "REJECTED"];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, unique: true, sparse: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "ADMIN" },
    accessRole: { type: String, default: "ADMIN", trim: true, uppercase: true },
    pageAccess: { type: [{ type: String, enum: PAGE_ACCESS }], default: DEFAULT_ADMIN_PAGES },
    status: { type: String, enum: STATUS, default: "PENDING" },
    pendingPasswordHash: { type: String, select: false, default: "" },
    passwordChangeRequestStatus: { type: String, enum: PASSWORD_REQUEST_STATUS, default: "NONE" },
    passwordChangeRequestedAt: { type: Date, default: null },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  if (String(this.passwordHash || "").startsWith("$2")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  return token;
};

export default mongoose.model("User", userSchema);
