import Hospital from "../models/Hospital.js";

function getIO(req) {
  return req.app.get("io");
}

export async function listHospitals(req, res, next) {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json(hospitals);
  } catch (err) {
    next(err);
  }
}

export async function createHospital(req, res, next) {
  try {
    const hospital = await Hospital.create(req.body);
    getIO(req)?.emit("hospital:update", hospital);
    res.status(201).json(hospital);
  } catch (err) {
    next(err);
  }
}

export async function updateHospital(req, res, next) {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    getIO(req)?.emit("hospital:update", hospital);
    res.json(hospital);
  } catch (err) {
    next(err);
  }
}

export async function deleteHospital(req, res, next) {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    res.json({ message: "Hospital removed." });
  } catch (err) {
    next(err);
  }
}
