import User from "../models/User.js";
import Incident from "../models/Incident.js";
import Hospital from "../models/Hospital.js";
import PoliceUnit from "../models/PoliceUnit.js";

export async function getStats(req, res, next) {
  try {
    const [totalUsers, verifiedResponders, eventsProcessed, roleCounts, hospitalsOnline] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["police", "hospital"] }, verified: true }),
      Incident.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Hospital.countDocuments({ status: "Online" }),
    ]);

    res.json({
      totalUsers,
      verifiedResponders,
      eventsProcessed,
      hospitalsOnline,
      roleCounts: roleCounts.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((u) => u.toSafeObject()));
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { role, verified } = req.body;
    const update = {};
    if (role) update.role = role;
    if (verified !== undefined) update.verified = verified;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User removed." });
  } catch (err) {
    next(err);
  }
}

export async function systemHealth(req, res, next) {
  try {
    const [incidents, hospitals, units] = await Promise.all([
      Incident.countDocuments(),
      Hospital.countDocuments({ status: "Online" }),
      PoliceUnit.countDocuments({ status: { $ne: "Offline" } }),
    ]);
    res.json({
      status: "operational",
      uptime: process.uptime(),
      incidents,
      hospitalsOnline: hospitals,
      unitsOnline: units,
    });
  } catch (err) {
    next(err);
  }
}
