import {
  createBidang,
  getAllBidang,
} from "../controllers/bidang.controller.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createBidang);

router.get("/all", authMiddleware, getAllBidang);
export default router;
