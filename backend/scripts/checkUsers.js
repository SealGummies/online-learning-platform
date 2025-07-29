const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({});
    console.log(`\nTotal users: ${users.length}`);
    
    // Show first 5 users
    console.log("\nFirst 5 users:");
    users.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
    });

    // Check for alice.johnson@example.com
    const alice = await User.findOne({ email: "alice.johnson@example.com" });
    if (alice) {
      console.log("\n✅ Found alice.johnson@example.com:");
      console.log(`   Name: ${alice.firstName} ${alice.lastName}`);
      console.log(`   Role: ${alice.role}`);
      console.log(`   Password hash: ${alice.password.substring(0, 20)}...`);
    } else {
      console.log("\n❌ alice.johnson@example.com not found");
    }

    // Check for any student users
    const students = await User.find({ role: "student" });
    console.log(`\nTotal students: ${students.length}`);
    
    if (students.length > 0) {
      console.log("First student:");
      const firstStudent = students[0];
      console.log(`   Email: ${firstStudent.email}`);
      console.log(`   Name: ${firstStudent.firstName} ${firstStudent.lastName}`);
      console.log(`   Password: password123`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkUsers(); 