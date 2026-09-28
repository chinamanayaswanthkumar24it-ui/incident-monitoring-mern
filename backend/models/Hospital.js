import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    bedsTotal: { type: Number, default: 0, min: 0 },
    bedsAvailable: { type: Number, default: 0, min: 0 },
    ambulancesTotal: { type: Number, default: 0, min: 0 },
    ambulancesAvailable: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Online",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hospital", hospitalSchema);
