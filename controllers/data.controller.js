import Data from "../models/data.model.js";
import cloudinary from "../config/cloudinary.js";
import Bidang from "../models/bidang.model.js";
import slugify from "slugify";

// Fungsi untuk membuat data baru
export const createData = async (req, res) => {
  try {
    const { title, description, bidang } = req.body;

    // Validasi field yang diperlukan
    if (!title || !description || !bidang) {
      return res.status(400).json({
        success: false,
        message:
          "Semua field (title, description, date, time, bidang) wajib diisi.",
      });
    }

    // Validasi apakah bidang yang dikirim valid (contoh: cek di database)
    const bidangExists = await Bidang.findById(bidang);
    if (!bidangExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid bidang. Bidang tidak ditemukan.",
      });
    }

    // Upload gambar ke Cloudinary jika ada file yang diunggah
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "kel.tlogosari/datanews",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url; // Simpan URL gambar
        })
      );
    }

    // Generate slug dari title
    let slug = slugify(title, { lower: true, strict: true });
    let counter = 1;
    let uniqueSlug = slug;
    while (await Data.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Buat data baru
    const newData = new Data({
      title,
      slug: uniqueSlug,
      description,
      images: imageUrls, // Array URL gambar
      bidang, // ObjectId dari bidang
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
    // Ambil semua data dari database, termasuk populate bidang
    const data = await Data.find().populate("bidang", "name"); // Populate bidang dengan field "name"
    res
      .status(200)
      .json({ success: true, data, message: "Berhasil mendapatkan data" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mengedit data berdasarkan ID
export const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, bidang } = req.body;

    // Cari data yang akan diupdate
    const existingData = await Data.findById(id);
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan.",
      });
    }

    // Validasi bidang jika ada perubahan
    if (bidang) {
      const bidangExists = await Bidang.findById(bidang);
      if (!bidangExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid bidang. Bidang tidak ditemukan.",
        });
      }
    }

    // Upload gambar baru ke Cloudinary jika ada file yang diunggah
    let imageUrls = existingData.images; // Gunakan gambar yang sudah ada sebagai default
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "kel.tlogosari/datanews",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url; // Simpan URL gambar baru
        })
      );
    }

    // Generate slug baru jika title diupdate
    let slug = existingData.slug; // Gunakan slug yang sudah ada sebagai default
    if (title && title !== existingData.title) {
      slug = slugify(title, { lower: true, strict: true });
      let counter = 1;
      let uniqueSlug = slug;
      while (await Data.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = uniqueSlug;
    }

    // Update data
    const updatedData = await Data.findByIdAndUpdate(
      id,
      {
        title: title || existingData.title,
        description: description || existingData.description,
        images: imageUrls, // Gunakan gambar baru atau yang sudah ada
        bidang: bidang || existingData.bidang,
        slug: slug || existingData.slug,
        createdAt: Date.now(),
      },
      { new: true } // Mengembalikan data yang sudah diupdate
    ).populate("bidang", "name");

    // Kirim respons sukses
    res.status(200).json({
      success: true,
      data: updatedData,
      message: "Berhasil memperbarui data.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk menghapus data berdasarkan ID
export const deleteData = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari data yang akan dihapus
    const existingData = await Data.findById(id);
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan.",
      });
    }

    // Hapus gambar dari Cloudinary jika ada
    if (existingData.images && existingData.images.length > 0) {
      await Promise.all(
        existingData.images.map(async (imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0]; // Ekstrak public_id dari URL
          await cloudinary.uploader.destroy(
            `kel.tlogosari/datanews/${publicId}`
          );
        })
      );
    }

    // Hapus data dari database
    await Data.findByIdAndDelete(id);

    // Kirim respons sukses
    res.status(200).json({
      success: true,
      message: "Berhasil menghapus data.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mendapatkan data berdasarkan bidang
export const getDataByBidang = async (req, res) => {
  try {
    const { bidang } = req.params;

    // Cari bidang di database berdasarkan nama
    const bidangData = await Bidang.findOne({ name: bidang });

    if (!bidangData) {
      return res.status(404).json({
        success: false,
        message: "Bidang not found in database.",
      });
    }

    // Ambil data berdasarkan bidang (ObjectId dari bidang)
    const data = await Data.find({ bidang: bidangData._id }).populate(
      "bidang",
      "name"
    );

    // Kirim respons sukses
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mendapatkan data berdasarkan judul (title) dengan pemisah tanda hubung (-)
export const getDataBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug diperlukan.",
      });
    }

    const data = await Data.findOne({ slug: slug.toLowerCase() }).populate(
      "bidang",
      "name"
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data,
      message: "Berhasil mendapatkan data",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Data.findById(id).populate("bidang", "name");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mendapatkan data terbaru
export const getLatestData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    if (limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit harus lebih besar dari 0.",
      });
    }

    const data = await Data.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("bidang", "name");

    res.status(200).json({
      success: true,
      data,
      message: `Berhasil mendapatkan ${data.length} data terbaru`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
