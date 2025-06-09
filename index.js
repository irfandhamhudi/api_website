import dotenv from "dotenv";
dotenv.config(); // Load environment variables at the start

import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
// Import routes
import userRoutes from "./routes/auth.route.js";
import avatarRoutes from "./routes/avatar.route.js";
import dataRoutes from "./routes/data.route.js";
import bidangRoutes from "./routes/bidang.route.js";
import sliderRoutes from "./routes/slider.route.js";
import servicecomplaintRoutes from "./routes/servicecomplaint.route.js";

const startServer = async () => {
  try {
    // Log MONGODB_URI to debug
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    await connectDB();

    const app = express();
    app.use(cookieParser());

    // Middleware for parsing JSON body
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const allowedOrigins = [
      "http://localhost:5173",
      "http://192.168.1.5:3001",
      "http://localhost:3001",
      "https://rebranding-web-kel-tlogosari-wetan-lyart.vercel.app",
      "https://rebranding-web-kel-tlogosari-wetan.vercel.app",
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

    // Routes
    app.use("/api/v1/user", userRoutes);
    app.use("/api/v1/avatar", avatarRoutes);
    app.use("/api/v1/data", dataRoutes);
    app.use("/api/v1/bidang", bidangRoutes);
    app.use("/api/v1/slider", sliderRoutes);
    app.use("/api/v1/servicecomplaint", servicecomplaintRoutes);

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on port ${PORT}, host 0.0.0.0`)
    );

    // Handle SIGTERM for graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("HTTP server closed.");
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
