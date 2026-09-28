import Incident from "../models/Incident.js";
import PoliceUnit from "../models/PoliceUnit.js";

function getIO(req) {
  return req.app.get("io");
}

export async function listIncidents(req, res, next) {
  try {
    const { status, severity, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const query = Incident.find(filter)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name role")
      .populate("assignedUnit", "unitCode zone");

    if (limit) query.limit(Number(limit));

    const incidents = await query;
    res.json(incidents);
  } catch (err) {
    next(err);
  }
}

export async function getIncident(req, res, next) {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("reportedBy", "name role")
      .populate("assignedUnit", "unitCode zone");

    if (!incident) return res.status(404).json({ message: "Incident not found." });
    res.json(incident);
  } catch (err) {
    next(err);
  }
}

export async function createIncident(req, res, next) {
  try {
    const { title, description, category, severity, lat, lng, address } = req.body;

    if (!title || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Title, lat and lng are required." });
    }

    const incident = await Incident.create({
      title,
      description,
      category,
      severity,
      location: { lat, lng, address },
      reportedBy: req.user._id,
    });

    const populated = await incident.populate("reportedBy", "name role");

    getIO(req)?.emit("incident:new", populated);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

export async function updateIncident(req, res, next) {
  try {
    const { status, severity, assignedUnit, description } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found." });

    if (status) {
      incident.status = status;
      if (status === "Resolved") incident.resolvedAt = new Date();
    }
    if (severity) incident.severity = severity;
    if (description !== undefined) incident.description = description;

    if (assignedUnit !== undefined) {
      incident.assignedUnit = assignedUnit || null;
      if (assignedUnit) {
        await PoliceUnit.findByIdAndUpdate(assignedUnit, {
          status: "Responding",
          currentIncident: incident._id,
        });
      }
    }

    await incident.save();
    const populated = await incident.populate([
      { path: "reportedBy", select: "name role" },
      { path: "assignedUnit", select: "unitCode zone" },
    ]);

    getIO(req)?.emit("incident:update", populated);
    res.json(populated);
  } catch (err) {
    next(err);
  }
}

export async function deleteIncident(req, res, next) {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found." });
    getIO(req)?.emit("incident:delete", { id: req.params.id });
    res.json({ message: "Incident deleted." });
  } catch (err) {
    next(err);
  }
}

export async function incidentStats(req, res, next) {
  try {
    const [active, resolvedToday, bySeverity] = await Promise.all([
      Incident.countDocuments({ status: { $ne: "Resolved" } }),
      Incident.countDocuments({
        status: "Resolved",
        resolvedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Incident.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
    ]);

    res.json({ active, resolvedToday, bySeverity });
  } catch (err) {
    next(err);
  }
}
