import mongoose from "mongoose";

const APP_STATUS = ["SUBMITTED", "INTERVIEW", "ACCEPTED", "REJECTED"];

const applicationSchema = new mongoose.Schema(
  {
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ama CandidateProfile
      required: true,
    },

    status: {
      type: String,
      enum: APP_STATUS,
      default: "SUBMITTED",
    },

    interviewDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// prevent duplicate application
applicationSchema.index({ opportunityId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);