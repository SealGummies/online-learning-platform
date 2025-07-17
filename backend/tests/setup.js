require("dotenv").config();
const mongoose = require("mongoose");

/**
 * Test setup configuration for Jest
 */

// Set test timeout to 30 seconds for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    const testDbUri =
      process.env.MONGODB_TEST_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/online-learning-test";

    await mongoose.connect(testDbUri);
  }
});

// Global test cleanup
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = {};
