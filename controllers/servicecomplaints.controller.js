import Servicecomplaints from "../models/servicecomplaints.model.js";
import cloudinary from "../config/cloudinary.js";

export const createServicecomplaints = async (req, res) => {
  try {
    const { name, email, phone, msg } = req.body;

    if (!name || !email || !phone || !msg) {
      return res.status(400).json({
        success: false,
        message: "Semua field (name, email, phone, msg) wajib diisi.",
      });
    }

    // Upload gambar ke Cloudinary jika ada file yang diunggah
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "kel.tlogosari/sevice",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url; // Simpan URL gambar
        })
      );
    }

    const servicecomplaints = new Servicecomplaints({
      name,
      email,
      phone,
      msg,
      images: imageUrls,
    });

    await servicecomplaints.save();

    res.status(201).json({
      success: true,
      data: servicecomplaints,
      message: "Berhasil mengirim pengaduan",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengirim pengaduan" });
  }
};

export const getAllServicecomplaints = async (req, res) => {
  try {
    const servicecomplaints = await Servicecomplaints.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: servicecomplaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteServicecomplaints = async (req, res) => {
  try {
    const { id } = req.params;
    await Servicecomplaints.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Pengaduan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
