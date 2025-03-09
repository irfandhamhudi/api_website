import {
  createServicecomplaints,
  getAllServicecomplaints,
  deleteServicecomplaints,
} from "../controllers/servicecomplaints.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", upload.array("images", 10), createServicecomplaints);

router.get("/all", getAllServicecomplaints);

router.delete("/delete/:id", deleteServicecomplaints);

export default router;
