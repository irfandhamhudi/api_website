import {
  createServicecomplaints,
  getAllServicecomplaints,
} from "../controllers/servicecomplaints.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  upload.array("images", 10),
  authMiddleware,
  createServicecomplaints
);

router.get("/all", authMiddleware, getAllServicecomplaints);

export default router;
