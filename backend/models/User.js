import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["user", "police", "hospital", "admin"],
      default: "user",
    },
    verified: { type: Boolean, default: false },
    // Optional link to a Hospital/PoliceUnit document for role accounts
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    policeUnit: { type: mongoose.Schema.Types.ObjectId, ref: "PoliceUnit" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    verified: this.verified,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
