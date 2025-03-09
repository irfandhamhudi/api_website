import {
  uploadSlider,
  getAllSlider,
  editSlider,
  getSliderById,
  deleteSlider,
} from "../controllers/slider.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Upload slider
router.post(
  "/create",
  upload.array("images", 10),
  authMiddleware,
  uploadSlider
);

// Get all slider
router.get("/all", authMiddleware, getAllSlider);

// Get slider by ID
router.get("/get/:id", authMiddleware, getSliderById);

// Edit slider
router.patch(
  "/edit/:id",
  upload.array("images", 10),
  authMiddleware,
  editSlider
);

// Delete slider
router.delete("/delete/:id", authMiddleware, deleteSlider);

export default router;
