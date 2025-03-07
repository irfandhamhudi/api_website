import {
  createBidang,
  getAllBidang,
} from "../controllers/bidang.controller.js";
import express from "express";

const router = express.Router();

router.post("/create", createBidang);

router.get("/all", getAllBidang);
export default router;
