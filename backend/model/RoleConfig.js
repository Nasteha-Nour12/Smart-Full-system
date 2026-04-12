import mongoose from "mongoose";
import { PAGE_ACCESS } from "../constants/pageAccess.js";

const roleConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    pages: [{ type: String, enum: PAGE_ACCESS }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("RoleConfig", roleConfigSchema);
