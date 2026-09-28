import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["Accident", "Medical", "Fire", "Crime", "Other"],
      default: "Other",
    },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Reported", "Responding", "Resolved"],
      default: "Reported",
    },
    location: {
      address: { type: String, default: "" },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedUnit: { type: mongoose.Schema.Types.ObjectId, ref: "PoliceUnit", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

incidentSchema.index({ createdAt: -1 });

export default mongoose.model("Incident", incidentSchema);
