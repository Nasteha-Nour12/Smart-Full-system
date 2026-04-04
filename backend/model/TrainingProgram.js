import mongoose from "mongoose";

const TRAINING_STATUS = ["PENDING", "SCHEDULED", "ATTENDING", "COMPLETED", "FAILED", "ABSENT", "CANCELLED"];
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
const TRAINING_TYPE = ["MANDATORY_3_DAY", "HOSPITALITY_LONG_2_MONTH", "GENERAL"];

const trainingProgramSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idNo: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: GENDER_OPTIONS, required: true },
    contact: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    educationLevel: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    otherSkills: [{ type: String, trim: true }],
    selectedProgram: { type: String, trim: true, default: "" },
    hospitalityType: { type: String, trim: true, default: "" },
    trainingType: { type: String, enum: TRAINING_TYPE, default: "GENERAL" },
    trainingStatus: {
      type: String,
      enum: TRAINING_STATUS,
      default: "PENDING",
    },
    trainingFee: { type: Number, min: 0, default: 0 },
    durationDays: { type: Number, min: 0, default: 0 },
    durationMonths: { type: Number, min: 0, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    attendancePercent: { type: Number, min: 0, max: 100, default: 0 },
    completion: { type: Boolean, default: false },
    files: {
      cvUrl: { type: String, trim: true, default: "" },
      coverLetterUrl: { type: String, trim: true, default: "" },
      nationalIdUrl: { type: String, trim: true, default: "" },
      secondaryCertificateUrl: { type: String, trim: true, default: "" },
      universityCertificateUrl: { type: String, trim: true, default: "" },
      passportPhoto1Url: { type: String, trim: true, default: "" },
      passportPhoto2Url: { type: String, trim: true, default: "" },
      contractLetterUrl: { type: String, trim: true, default: "" },
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

trainingProgramSchema.index({ candidateId: 1, idNo: 1, faculty: 1 });
trainingProgramSchema.index({ candidateId: 1, trainingType: 1, createdAt: -1 });

export default mongoose.model("TrainingProgram", trainingProgramSchema);
