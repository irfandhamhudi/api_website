import {
  createData,
  getAllData,
  getDataByTitle,
  getDataByBidang,
  getDataById,
} from "../controllers/data.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", upload.array("images", 10), createData);

router.get("/get/all", getAllData);

router.get("/bidang/:bidang", getDataByBidang);

router.get("/:title", getDataByTitle);

router.get("/get/:id", getDataById);

export default router;
