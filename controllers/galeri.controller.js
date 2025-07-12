import Photo from "../models/photo.model.js";
import cloudinary from "../config/cloudinary.js";

// Fungsi untuk membuat data baru
export const uploadPhoto = async (req, res) => {
  try {
    const { title } = req.body;

    // Validasi field yang diperlukan
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Semua field (title) wajib diisi.",
      });
    }
    // Upload gambar ke Cloudinary jika ada file yang diunggah
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "web_sekolah/photos",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url;
        })
      );
    }
    // Buat data baru
    const newData = new Photo({
      images: imageUrls,
      title: title,
    });

    // Simpan data ke database
    const savedData = await newData.save();

    // Kirim respons sukses
    res.status(201).json({
      success: true,
      data: savedData,
      message: "Berhasil menambahkan data",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mendapatkan semua data
export const getAllData = async (req, res) => {
  try {
    const data = await Photo.find();
    res
      .status(200)
      .json({ success: true, data, message: "Berhasil mendapatkan data" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mendapatkan data terbaru
export const getLatestPhotos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default limit: 10
    if (limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit harus lebih besar dari 0",
      });
    }
    const data = await Photo.find()
      .sort({ createdAt: -1 }) // Urutkan berdasarkan createdAt, terbaru dulu
      .limit(limit); // Batasi jumlah data
    res.status(200).json({
      success: true,
      data,
      message: `Berhasil mendapatkan ${data.length} foto terbaru`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mendapatkan data berdasarkan ID
export const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Photo.findById(id);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk menghapus foto
export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Foto tidak ditemukan",
      });
    }

    // Hapus gambar dari Cloudinary
    if (photo.images && photo.images.length > 0) {
      await Promise.all(
        photo.images.map(async (imageUrl) => {
          // Ekstrak public_id dari URL Cloudinary
          const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0]; // Misal: web_sekolah/photos/nama_file
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        })
      );
    }

    // Hapus dokumen dari database
    await Photo.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Foto berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat menghapus foto",
    });
  }
};
