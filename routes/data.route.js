import {
  createData,
  getAllData,
  // getDataByTitle,
  getLatestData,
  getDataByBidang,
  getDataById,
  updateData,
  deleteData,
  getDataBySlug,
} from "../controllers/data.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", upload.array("images", 10), createData);

router.get("/all", getAllData);

router.patch("/edit/:id", upload.array("images", 10), updateData);

router.delete("/delete/:id", deleteData);

router.get("/bidang/:bidang", getDataByBidang);

router.get("/slug/:slug", getDataBySlug);

router.get("/get/:id", getDataById);

router.get("/latest", getLatestData);

export default router;
