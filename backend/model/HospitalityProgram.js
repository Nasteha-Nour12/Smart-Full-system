import mongoose from "mongoose";

const GENDER = ["MALE", "FEMALE", "OTHER"];
const HOSPITALITY_TYPES = ["NO_SKILL", "HAVE_SKILL_NO_EXPERIENCE", "HAVE_SKILL_AND_EXPERIENCE"];
const ASSIGNED_RESULTS = [
  "TRAINING",
  "INTERNSHIP_RECOMMENDATION",
  "GO_TO_WORK_RECOMMENDATION",
];

const hospitalityProgramSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    idNo: { type: String, required: true, trim: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: GENDER, required: true },
    contact: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    educationLevel: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    otherSkills: [{ type: String, trim: true }],
    hospitalityType: {
      type: String,
      enum: HOSPITALITY_TYPES,
      required: true,
    },
    assignedResult: {
      type: String,
      enum: ASSIGNED_RESULTS,
      required: true,
    },
    duration: { type: String, trim: true, default: "" },
    fee: { type: Number, min: 0, default: 0 },
    status: { type: String, trim: true, default: "PENDING" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

hospitalityProgramSchema.index({ fullName: 1, contact: 1, district: 1 });

export default mongoose.model("HospitalityProgram", hospitalityProgramSchema);

