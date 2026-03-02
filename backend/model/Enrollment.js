import mongoose from "mongoose";

const ENROLL_STATUS = [
  "ENROLLED",
  "IN_PROGRESS",
  "COMPLETED",
  "DROPPED",
];

const enrollmentSchema = new mongoose.Schema(
  {
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or CandidateProfile haddii aad rabto
      required: true,
    },

    status: {
      type: String,
      enum: ENROLL_STATUS,
      default: "ENROLLED",
    },

    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// prevent duplicate enrollment
enrollmentSchema.index({ programId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);