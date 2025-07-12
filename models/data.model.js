import mongoose from "mongoose";
import Bidang from "./bidang.model.js";

const dataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  bidang: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bidang",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Data = mongoose.model("Data", dataSchema);

export default Data;
