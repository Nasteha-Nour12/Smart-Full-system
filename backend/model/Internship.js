import mongoose from "mongoose";

const INTERNSHIP_STATUS = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"];

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
  },
  { timestamps: true }
);

// prevent duplicate ACTIVE internship for same candidate+company+position (optional)
internshipSchema.index(
  { candidateId: 1, companyId: 1, position: 1 },
  { unique: false }
);

export default mongoose.model("Internship", internshipSchema);