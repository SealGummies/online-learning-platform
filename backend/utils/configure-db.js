#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const envPath = path.join(__dirname, ".env");

const configs = {
  local: {
    uri: "mongodb://localhost:27017/online-learning-platform",
    description: "Local MongoDB (requires MongoDB to be installed and running)",
  },
  atlas: {
    uri: "mongodb+srv://<db_username>:<db_password>@cluster0.rl0jvlr.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=Cluster0",
    description: "MongoDB Atlas (cloud database)",
  },
};

function updateEnvFile(newUri) {
  try {
    let envContent = fs.readFileSync(envPath, "utf8");

    // Replace the MONGODB_URI line
    envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${newUri}`);

    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated successfully!");

    // Show the updated URI (masked for security)
    const maskedUri = newUri.replace(/\/\/[^:]+:[^@]+@/, "//*****:*****@");
    console.log(`📝 New MONGODB_URI: ${maskedUri}`);
  } catch (error) {
    console.error("❌ Error updating .env file:", error.message);
  }
}

function showCurrentConfig() {
  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/MONGODB_URI=(.*)/);

    if (match) {
      const currentUri = match[1];
      const maskedUri = currentUri.replace(/\/\/[^:]+:[^@]+@/, "//*****:*****@");
      console.log(`📊 Current MONGODB_URI: ${maskedUri}`);

      if (currentUri.includes("mongodb+srv://")) {
        console.log("🌐 Currently using: MongoDB Atlas (Cloud)");
      } else {
        console.log("🏠 Currently using: Local MongoDB");
      }
    } else {
      console.log("⚠️  No MONGODB_URI found in .env file");
    }
  } catch (error) {
    console.error("❌ Error reading .env file:", error.message);
  }
}

function promptForAtlasCredentials() {
  console.log("\n🔑 Please provide your MongoDB Atlas credentials:");

  rl.question("Username: ", (username) => {
    rl.question("Password: ", (password) => {
      rl.question("Cluster URL (without credentials): ", (clusterUrl) => {
        const fullUri = `mongodb+srv://${username}:${password}@${clusterUrl}/online-learning-platform?retryWrites=true&w=majority&appName=Cluster0`;
        updateEnvFile(fullUri);

        console.log("\n🧪 Test your connection with: npm run test-atlas");
        rl.close();
      });
    });
  });
}

function main() {
  console.log("🔧 MongoDB Configuration Switcher\n");

  showCurrentConfig();

  console.log("\nAvailable configurations:");
  console.log("1. Local MongoDB");
  console.log("2. MongoDB Atlas (Cloud)");
  console.log("3. Exit");

  rl.question("\nSelect configuration (1-3): ", (answer) => {
    switch (answer) {
      case "1":
        updateEnvFile(configs.local.uri);
        console.log("\n🧪 Test your connection with: npm run test-db");
        rl.close();
        break;

      case "2":
        promptForAtlasCredentials();
        break;

      case "3":
        console.log("👋 Goodbye!");
        rl.close();
        break;

      default:
        console.log("❌ Invalid selection");
        rl.close();
    }
  });
}

main();
