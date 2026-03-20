import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ROLES = ["ADMIN", "CEO", "ICT_OFFICER", "JOB_SEEKER", "EMPLOYER"];
const STATUS = ["ACTIVE", "PENDING", "BANNED"];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, unique: true, sparse: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "JOB_SEEKER" },
    status: { type: String, enum: STATUS, default: "PENDING" },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
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
