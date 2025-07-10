const mongoose = require("mongoose");
const connectDB = require("./config/database");

// Simple test to verify database connection
const testConnection = async () => {
  try {
    await connectDB();
    console.log("✅ Database connection successful!");

    // Test if we can create a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      testDate: { type: Date, default: Date.now },
    });

    const TestModel = mongoose.model("Test", testSchema);

    const testDoc = new TestModel({ name: "Connection Test" });
    await testDoc.save();

    console.log("✅ Document creation successful!");

    // Clean up
    await TestModel.deleteMany({});
    await mongoose.connection.db.dropCollection("tests");

    console.log("✅ All tests passed!");
    console.log("\nYour setup is ready. You can now:");
    console.log('1. Run "npm run seed" to populate the database');
    console.log('2. Run "npm run dev" to start the development server');

    process.exit(0);
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    console.log("\nPlease ensure MongoDB is running on your system.");
    console.log("You can start MongoDB with: mongod");
    process.exit(1);
  }
};

testConnection();
