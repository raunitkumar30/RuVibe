const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const musicRoutes = require("./routes/music.routes");
const playlistRoutes = require("./routes/playlist.routes");

const app = express();

// 1. Security Headers (Configured to allow external audio & image streams)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Dynamic CORS (Supports local dev + production domain from .env)
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 4. Rate Limiters
// Stricter limiter on auth to stop password brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// General API limiter for search, charts, streaming
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down.",
  },
});

// 5. Routes with respective limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/music", apiLimiter, musicRoutes);
app.use("/api/playlists", apiLimiter, playlistRoutes);

// 6. Handle Undefined 404 Routes
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// 7. Global Centralized Error Handler (Prevents server crashes)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error occurred",
    ...(process.env.NODE_ENV !== "production" && { error: err.stack }),
  });
});

module.exports = app;