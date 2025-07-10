const express = require("express");
const cors = require("cors");

// Simple test server to verify Express setup
const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Learning Platform API is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      courses: "/api/courses",
      users: "/api/users",
      enrollments: "/api/enrollments",
      lessons: "/api/lessons",
      exams: "/api/exams",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`✅ Visit http://localhost:${PORT} to see the API response`);
  console.log(`✅ Visit http://localhost:${PORT}/health for health check`);
  console.log("\nTo run the full application:");
  console.log("1. Make sure MongoDB is running: mongod");
  console.log("2. Run the seed script: npm run seed");
  console.log("3. Start the full server: npm run dev");
});

module.exports = app;
