#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * This script validates that all required environment variables are properly configured
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Validating Environment Configuration...\n");

// Check if .env file exists
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env file not found!");
  console.log("💡 Run: cp .env.example .env");
  process.exit(1);
}

// Load environment variables
require("dotenv").config();

const requiredVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRE",
];

const optionalVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USERNAME",
  "EMAIL_PASSWORD",
  "MAX_FILE_SIZE",
  "UPLOAD_PATH",
  "REDIS_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RATE_LIMIT_REQUESTS",
  "RATE_LIMIT_WINDOW",
  "CORS_ORIGIN",
  "CORS_CREDENTIALS",
];

let hasErrors = false;

// Check required variables
console.log("📋 Required Variables:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue =
      varName.includes("SECRET") ||
      varName.includes("PASSWORD") ||
      varName.includes("URI")
        ? "*".repeat(Math.min(value.length, 20))
        : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// Check optional variables
console.log("\n📋 Optional Variables:");
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    const displayValue =
      varName.includes("SECRET") ||
      varName.includes("PASSWORD") ||
      varName.includes("KEY")
        ? "*".repeat(Math.min(value.length, 20))
        : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`⚪ ${varName}: Not set (optional)`);
  }
});

// Validate specific configurations
console.log("\n🔍 Configuration Validation:");

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv && !["development", "production", "test"].includes(nodeEnv)) {
  console.log(
    `⚠️  NODE_ENV should be 'development', 'production', or 'test', got: ${nodeEnv}`
  );
}

// Check PORT
const port = process.env.PORT;
if (port && (isNaN(port) || parseInt(port) < 1024 || parseInt(port) > 65535)) {
  console.log(
    `⚠️  PORT should be a number between 1024 and 65535, got: ${port}`
  );
}

// Check MongoDB URI format
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.startsWith("mongodb://")) {
    console.log("✅ MongoDB URI format: Local MongoDB");
  } else if (mongoUri.startsWith("mongodb+srv://")) {
    console.log("✅ MongoDB URI format: MongoDB Atlas");
  } else {
    console.log(
      "⚠️  MongoDB URI should start with mongodb:// or mongodb+srv://"
    );
  }
}

// Check JWT secret strength
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length < 32) {
    console.log(
      "⚠️  JWT_SECRET should be at least 32 characters long for security"
    );
  } else if (
    jwtSecret.includes("change-in-production") ||
    jwtSecret.includes("your-super-secure")
  ) {
    console.log(
      "⚠️  JWT_SECRET appears to be using the default value. Please use a unique secret!"
    );
  } else {
    console.log("✅ JWT_SECRET appears to be properly configured");
  }
}

// Check JWT expiration format
const jwtExpire = process.env.JWT_EXPIRE;
if (jwtExpire) {
  if (!/^\d+[smhd]$/.test(jwtExpire)) {
    console.log(
      '⚠️  JWT_EXPIRE should be in format like "30d", "7d", "24h", "60m"'
    );
  } else {
    console.log("✅ JWT_EXPIRE format is valid");
  }
}

// Final result
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log("❌ Environment configuration has errors!");
  console.log("💡 Please fix the missing required variables and try again.");
  console.log("📖 See ENV_CONFIGURATION.md for detailed instructions.");
  process.exit(1);
} else {
  console.log("✅ Environment configuration looks good!");
  console.log("🚀 You can now run: npm run dev");
}
