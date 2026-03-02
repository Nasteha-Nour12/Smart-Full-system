import mongoose from "mongoose";

const OPPORTUNITY_TYPES = ["JOB", "INTERNSHIP"];
const OPPORTUNITY_STATUS = ["DRAFT", "PUBLISHED", "CLOSED"];

const opportunitySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    type: {
      type: String,
      enum: OPPORTUNITY_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    requirements: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

  
    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: OPPORTUNITY_STATUS,
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

// helpful indexes
opportunitySchema.index({ companyId: 1, status: 1, createdAt: -1 });
opportunitySchema.index({ type: 1, status: 1 });

export default mongoose.model("Opportunity", opportunitySchema);