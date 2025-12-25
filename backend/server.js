require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - allow all origins for now
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5500",
    "https://sponzobd.vercel.app",
    "https://sponzobd-towhid146.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static frontend files
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// SPA fallback: route unmatched paths to index.html for frontend routing
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, "../frontend", req.path);
  // If the file doesn't exist and it's not an API route, serve index.html
  if (!filePath.startsWith(path.join(__dirname, "../frontend"))) {
    return res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
