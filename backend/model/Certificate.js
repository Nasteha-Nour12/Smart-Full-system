import mongoose from "mongoose";

const SOURCE_TYPES = ["PROGRAM", "INTERNSHIP"];

const certificateSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ama CandidateProfile
      required: true,
    },

    sourceType: {
      type: String,
      enum: SOURCE_TYPES,
      required: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // NOTE: polymorphic reference (Program/Internship) — populate direct ma fududa
    },

    certificateUrl: {
      type: String,
      trim: true,
      required: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// prevent duplicates
certificateSchema.index(
  { candidateId: 1, sourceType: 1, sourceId: 1 },
  { unique: true }
);

export default mongoose.model("Certificate", certificateSchema);