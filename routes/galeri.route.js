import {
  uploadPhoto,
  getAllData,
  getLatestPhotos,
  deletePhoto,
  getPhotoById,
} from "../controllers/galeri.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/upload", upload.array("images", 10), uploadPhoto);

router.get("/all", getAllData);

router.get("/latest", getLatestPhotos);

router.get("/get/:id", getPhotoById);

router.delete("/delete/:id", deletePhoto);

export default router;
