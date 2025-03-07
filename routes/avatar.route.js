import express from "express";
import {
  uploadAvatar,
  getAvatar,
  updateAvatar,
} from "../controllers/avatar.controller.js";
import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Upload images
router.post("/upload", authMiddleware, upload.array("images", 1), uploadAvatar); // Maksimal 10 gambar

// Get avatar
router.get("/get", authMiddleware, getAvatar);

// Update avatar
router.patch(
  "/update",
  authMiddleware,
  upload.array("images", 1),
  updateAvatar
);

export default router;
