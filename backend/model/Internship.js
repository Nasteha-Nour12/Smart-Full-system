import mongoose from "mongoose";

const INTERNSHIP_STATUS = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"];
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];

const internshipSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ama CandidateProfile
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    position: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: INTERNSHIP_STATUS,
      default: "PENDING",
    },

    evaluationScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    recommendationLetterUrl: {
      type: String,
      trim: true,
      default: "",
    },

    idNo: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: GENDER_OPTIONS, required: true },
    contact: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    educationLevel: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    otherSkills: [{ type: String, trim: true }],
    internshipFee: { type: Number, min: 0, default: 0 },
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

// prevent duplicate ACTIVE internship for same candidate+company+position (optional)
internshipSchema.index(
  { candidateId: 1, companyId: 1, position: 1 },
  { unique: false }
);

export default mongoose.model("Internship", internshipSchema);
