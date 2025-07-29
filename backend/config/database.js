const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Default to local MongoDB if no URI provided
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/online-learning-platform";

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Log connection type
    if (mongoURI.includes("mongodb.net")) {
      console.log("✅ Connected to MongoDB Atlas (Cloud)");
    } else {
      console.log("✅ Connected to Local MongoDB");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
