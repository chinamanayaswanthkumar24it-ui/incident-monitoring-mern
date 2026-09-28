import { Router } from "express";
import { getStats, listUsers, updateUser, deleteUser, systemHealth } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/health", systemHealth);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
