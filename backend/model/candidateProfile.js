import mongoose from "mongoose";

const EXP_LEVEL = ["NONE", "JUNIOR", "MID", "SENIOR"];

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // hal user = hal profile
    },

    location: { type: String, trim: true, default: "" },
    education: { type: String, trim: true, default: "" },
    experienceLevel: { type: String, enum: EXP_LEVEL, default: "NONE" },

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
    certificates: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model("CandidateProfile", candidateProfileSchema);