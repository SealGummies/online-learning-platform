const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/database");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");
const lessonRoutes = require("./routes/lessons");
const examRoutes = require("./routes/exams");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exams", examRoutes);

// Serve frontend for any non-API routes
app.get("*", (req, res) => {
  // If it's an API route that doesn't exist, return 404 JSON
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }
  // Otherwise, serve the frontend index.html
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 3761;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
