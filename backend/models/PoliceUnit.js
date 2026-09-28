import mongoose from "mongoose";

const policeUnitSchema = new mongoose.Schema(
  {
    unitCode: { type: String, required: true, unique: true, trim: true },
    zone: { type: String, default: "" },
    officerCount: { type: Number, default: 2, min: 0 },
    status: {
      type: String,
      enum: ["Available", "Responding", "Offline"],
      default: "Available",
    },
    currentIncident: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("PoliceUnit", policeUnitSchema);
