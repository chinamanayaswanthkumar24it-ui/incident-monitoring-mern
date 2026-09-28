import PoliceUnit from "../models/PoliceUnit.js";

function getIO(req) {
  return req.app.get("io");
}

export async function listUnits(req, res, next) {
  try {
    const units = await PoliceUnit.find().sort({ unitCode: 1 }).populate("currentIncident", "title location");
    res.json(units);
  } catch (err) {
    next(err);
  }
}

export async function createUnit(req, res, next) {
  try {
    const unit = await PoliceUnit.create(req.body);
    getIO(req)?.emit("unit:update", unit);
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
}

export async function updateUnit(req, res, next) {
  try {
    const unit = await PoliceUnit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    getIO(req)?.emit("unit:update", unit);
    res.json(unit);
  } catch (err) {
    next(err);
  }
}

export async function deleteUnit(req, res, next) {
  try {
    const unit = await PoliceUnit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    res.json({ message: "Unit removed." });
  } catch (err) {
    next(err);
  }
}
