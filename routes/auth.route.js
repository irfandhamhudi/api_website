// Routes
import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getMe,
  logoutUser,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

// Register User
router.post("/register", registerUser);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Resend OTP
router.post("/resend-otp", resendOtp);

// Login User
router.post("/login", loginUser);

// Get Me
router.get("/me", authMiddleware, getMe);

// Logout User
router.post("/logout", authMiddleware, logoutUser);
export default router;
