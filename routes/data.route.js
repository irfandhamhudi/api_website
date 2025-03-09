import {
  createData,
  getAllData,
  getDataByTitle,
  getDataByBidang,
  getDataById,
  updateData,
  deleteData,
} from "../controllers/data.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", upload.array("images", 10), authMiddleware, createData);

router.get("/all", getAllData);

router.patch(
  "/edit/:id",
  upload.array("images", 10),
  authMiddleware,
  updateData
);

router.delete("/delete/:id", authMiddleware, deleteData);

router.get("/bidang/:bidang", authMiddleware, getDataByBidang);

router.get("/:title", authMiddleware, getDataByTitle);

router.get("/get/:id", authMiddleware, getDataById);

export default router;
