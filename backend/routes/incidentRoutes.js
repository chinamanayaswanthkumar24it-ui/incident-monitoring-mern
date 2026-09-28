import { Router } from "express";
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  incidentStats,
} from "../controllers/incidentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listIncidents);
router.get("/stats/summary", protect, incidentStats);
router.get("/:id", protect, getIncident);
router.post("/", protect, createIncident);
router.patch("/:id", protect, authorize("police", "admin"), updateIncident);
router.delete("/:id", protect, authorize("admin"), deleteIncident);

export default router;
