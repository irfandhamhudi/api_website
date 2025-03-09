import User from "../models/user.models.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/send.email.js";
import jwt from "jsonwebtoken";

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Email Validation
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email Already Exists." });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
    });

    // Kirim email ke pengguna
    const subject = "Email Verification";
    const message = otp;
    await sendEmail(email, subject, message, username);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to get the OTP.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to register user." });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  const user = await User.findOne({ otp });

  if (user && user.otp === otp) {
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Remove password field from the response
    const userData = user.toObject();
    delete userData.password; // Delete password from the response

    res.status(200).json({
      success: true,
      data: userData,
      message: "OTP verified successfully",
    });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ success: false, message: "Account is already verified" });
  }

  // Generate OTP baru
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP baru ke user
  user.otp = otp;
  await user.save();

  // Kirim OTP baru ke email
  try {
    // Kirim OTP baru ke email pengguna
    const subject = "Email Verification";
    const message = otp;
    await sendEmail(user.email, subject, message, user.username);
    res
      .status(200)
      .json({ success: true, message: "New OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send new OTP" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Cek apakah email terdaftar
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Periksa apakah pengguna sudah diverifikasi
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "User not verified" });
    }

    // Buat JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Simpan token di cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 5, //5 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Me (User Info from Middleware)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve user data" });
  }
};

// Logout
export const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Hapus cookie
    });

    res.status(200).json({
      success: true,
      message: "Logout telah berhasil",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
