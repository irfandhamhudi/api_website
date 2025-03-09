import mongoose from "mongoose";

const servicecomplaintsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  images: [{ type: String, required: true }],
  msg: { type: String, required: true },
});

const Servicecomplaints = mongoose.model(
  "Servicecomplaints",
  servicecomplaintsSchema
);

export default Servicecomplaints;
