import {
  createServicecomplaints,
  getAllServicecomplaints,
} from "../controllers/servicecomplaints.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", upload.array("images", 10), createServicecomplaints);

router.get("/all", getAllServicecomplaints);

export default router;
