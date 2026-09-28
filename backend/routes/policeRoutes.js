import { Router } from "express";
import { listUnits, createUnit, updateUnit, deleteUnit } from "../controllers/policeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/units", protect, listUnits);
router.post("/units", protect, authorize("admin"), createUnit);
router.patch("/units/:id", protect, authorize("police", "admin"), updateUnit);
router.delete("/units/:id", protect, authorize("admin"), deleteUnit);

export default router;
