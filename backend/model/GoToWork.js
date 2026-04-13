import mongoose from "mongoose";

const GTW_STATUS = [
  "SUBMITTED",
  "SCREENING",
  "MATCHING",
  "INTERVIEW",
  "CONTRACT",
  "PLACED",
  "REJECTED",
];

const goToWorkSchema = new mongoose.Schema(
  {
    idNo: { type: String, trim: true, unique: true, sparse: true },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ama CandidateProfile
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: GTW_STATUS,
      default: "SUBMITTED",
    },
    readinessStatus: { type: String, trim: true, default: "PENDING" },
    interviewStatus: { type: String, trim: true, default: "NOT_SCHEDULED" },
    placementStatus: { type: String, trim: true, default: "IN_QUEUE" },
    jobTitle: { type: String, trim: true, default: "" },
    workLocation: { type: String, trim: true, default: "" },

    matchedCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    interviewDate: {
      type: Date,
      default: null,
    },

    contractUrl: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

goToWorkSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("GoToWork", goToWorkSchema);
