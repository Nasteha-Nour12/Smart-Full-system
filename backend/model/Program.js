import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["HOSPITALITY", "SMART_SKILLS"],
      required: true,
    },

    description: {
      type: String,
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

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "DRAFT"],
      default: "DRAFT",
    },
  },
  { timestamps: true } // createdAt + updatedAt auto
);

export default mongoose.model("Program", programSchema);