import mongoose from "mongoose";

const EXP_LEVEL = ["NONE", "JUNIOR", "MID", "SENIOR"];
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
const SELECTED_PROGRAMS = ["VISITOR", "CANDIDATE", "INTERNSHIP", "HOSPITALITY", "GO_TO_WORK"];
const HOSPITALITY_TYPES = ["NO_SKILL", "HAVE_SKILL_NO_EXPERIENCE", "HAVE_SKILL_AND_EXPERIENCE", ""];
const CANDIDATE_STATUS = [
  "NEW",
  "PENDING_TRAINING",
  "ACTIVE",
  "NOT_ELIGIBLE",
  "OPPORTUNITY_LOST",
  "REMOVED_FROM_QUEUE",
];
const MANDATORY_TRAINING_STATUS = ["PENDING", "SCHEDULED", "ATTENDING", "COMPLETED", "FAILED", "ABSENT"];
const DOC_STATUS = ["MISSING", "UPLOADED", "PENDING_VERIFICATION", "VERIFIED"];

const documentSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: "" },
    status: { type: String, enum: DOC_STATUS, default: "MISSING" },
  },
  { _id: false }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // hal user = hal profile
    },

    location: { type: String, trim: true, default: "" },
    idNo: { type: String, trim: true, default: "" },
    gender: { type: String, enum: GENDER_OPTIONS, default: "OTHER" },
    contact: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    education: { type: String, trim: true, default: "" }, // backward compatible
    educationLevel: { type: String, trim: true, default: "" },
    faculty: { type: String, trim: true, default: "" },
    experienceLevel: { type: String, enum: EXP_LEVEL, default: "NONE" },
    selectedProgram: { type: String, enum: SELECTED_PROGRAMS, default: "CANDIDATE" },
    hospitalityType: { type: String, enum: HOSPITALITY_TYPES, default: "" },
    assignedProgram: { type: String, trim: true, default: "" },
    candidateStatus: { type: String, enum: CANDIDATE_STATUS, default: "NEW" },
    mandatoryTrainingStatus: { type: String, enum: MANDATORY_TRAINING_STATUS, default: "PENDING" },
    trainingStatus: { type: String, enum: MANDATORY_TRAINING_STATUS, default: "PENDING" },
    trainingFee: { type: Number, min: 0, default: 0 },
    programFee: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, default: "" },

    bio: { type: String, trim: true, default: "" },

    // skills as array
    skills: [
      {
        name: { type: String, trim: true, required: true },
        level: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" },
      },
    ],

    // document links (optional)
    cvUrl: { type: String, trim: true, default: "" },
    idUrl: { type: String, trim: true, default: "" },
    coverLetterUrl: { type: String, trim: true, default: "" },
    secondaryCertificateUrl: { type: String, trim: true, default: "" },
    universityCertificateUrl: { type: String, trim: true, default: "" },
    passportPhoto1Url: { type: String, trim: true, default: "" },
    passportPhoto2Url: { type: String, trim: true, default: "" },
    contractLetterUrl: { type: String, trim: true, default: "" },
    certificates: [{ type: String, trim: true }],
    documents: {
      cv: { type: documentSchema, default: () => ({}) },
      coverLetter: { type: documentSchema, default: () => ({}) },
      nationalId: { type: documentSchema, default: () => ({}) },
      secondaryCertificate: { type: documentSchema, default: () => ({}) },
      universityCertificate: { type: documentSchema, default: () => ({}) },
      passportPhoto1: { type: documentSchema, default: () => ({}) },
      passportPhoto2: { type: documentSchema, default: () => ({}) },
      contractLetter: { type: documentSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

candidateProfileSchema.index({ idNo: 1 }, { unique: true, sparse: true });

export default mongoose.model("CandidateProfile", candidateProfileSchema);
