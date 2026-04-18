const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    goal: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Planned", "Active", "Completed"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);
