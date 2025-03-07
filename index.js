import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";

// Import routes
import userRoutes from "./routes/auth.route.js";
import avatarRoutes from "./routes/avatar.route.js";
import dataRoutes from "./routes/data.route.js";
import bidangRoutes from "./routes/bidang.route.js";
import sliderRoutes from "./routes/slider.route.js";

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());

// Middleware untuk parsing body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "https://rebranding-web-kel-tlogosari-wetan-klien.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Route for users
app.use("/api/v1/user", userRoutes);

// Route for avatars
app.use("/api/v1/avatar", avatarRoutes);

// Route for data
app.use("/api/v1/data", dataRoutes);

// Route for bidang
app.use("/api/v1/bidang", bidangRoutes);

// Route for slider
app.use("/api/v1/slider", sliderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
