import Servicecomplaints from "../models/servicecomplaints.model.js";
import cloudinary from "../config/cloudinary.js";

export const createServicecomplaints = async (req, res) => {
  try {
    const { name, email, phone, msg } = req.body;

    // if (!name || !email || !phone || !msg) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Semua field (name, email, phone, msg) wajib diisi.",
    //   });
    // }

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
