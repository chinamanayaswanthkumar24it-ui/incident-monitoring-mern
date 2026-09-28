import { Router } from "express";
import {
  listHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
} from "../controllers/hospitalController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listHospitals);
router.post("/", protect, authorize("admin"), createHospital);
router.patch("/:id", protect, authorize("hospital", "admin"), updateHospital);
router.delete("/:id", protect, authorize("admin"), deleteHospital);

export default router;
