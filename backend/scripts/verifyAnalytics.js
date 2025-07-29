const mongoose = require("mongoose");
const AnalyticsService = require("../services/AnalyticsService");
require("dotenv").config();

// Connect to test database
async function connectDB() {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/online-learning-test"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

// Test all analytics functions
async function testAnalytics() {
  try {
    console.log("Testing Analytics Service...\n");

    // Test 1: Top Performing Courses
    console.log("1. Testing Top Performing Courses:");
    try {
      const topCourses = await AnalyticsService.getTopPerformingCourses();
      console.log(
        `✅ Success: Found ${topCourses.length} top performing courses`
      );
      if (topCourses.length > 0) {
        console.log(`   Sample: ${topCourses[0].title || "No title"}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 2: Student Progress Analytics
    console.log("\n2. Testing Student Progress Analytics:");
    try {
      const studentProgress =
        await AnalyticsService.getStudentProgressAnalytics();
      console.log(
        `✅ Success: Found ${studentProgress.length} student progress records`
      );
      if (studentProgress.length > 0) {
        console.log(
          `   Sample: ${studentProgress[0].studentName || "No name"} - ${studentProgress[0].courseName || "No course"
          }`
        );
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 3: Instructor Analytics
    console.log("\n3. Testing Instructor Analytics:");
    try {
      const instructorAnalytics =
        await AnalyticsService.getInstructorAnalytics();
      console.log(
        `✅ Success: Found ${instructorAnalytics.length} instructor records`
      );
      if (instructorAnalytics.length > 0) {
        console.log(
          `   Sample: ${instructorAnalytics[0].instructorName || "No name"} - ${instructorAnalytics[0].totalCourses || 0
          } courses`
        );
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 4: Course Completion Trends
    console.log("\n4. Testing Course Completion Trends:");
    try {
      const completionTrends =
        await AnalyticsService.getCourseCompletionTrends();
      console.log(
        `✅ Success: Found ${completionTrends.length} completion trend records`
      );
      if (completionTrends.length > 0) {
        console.log(
          `   Sample: ${completionTrends[0]._id?.course || "No course"} - ${completionTrends[0].completions || 0
          } completions`
        );
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 5: Exam Performance Analysis
    console.log("\n5. Testing Exam Performance Analysis:");
    try {
      const examPerformance =
        await AnalyticsService.getExamPerformanceAnalysis();
      console.log(
        `✅ Success: Found ${examPerformance.length} exam performance records`
      );
      if (examPerformance.length > 0) {
        console.log(
          `   Sample: ${examPerformance[0].examTitle || "No title"
          } - Avg Grade: ${examPerformance[0].averageGrade || 0}%`
        );
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 6: Platform Overview
    console.log("\n6. Testing Platform Overview:");
    try {
      const platformOverview = await AnalyticsService.getPlatformOverview();
      console.log(
        `✅ Success: Platform has ${platformOverview.users?.total || 0
        } users, ${platformOverview.courses?.total || 0} courses`
      );
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 7: Filtered Analytics
    console.log("\n7. Testing Filtered Analytics:");
    try {
      const filteredAnalytics = await AnalyticsService.getFilteredAnalytics({
        category: "Programming",
        level: "Beginner"
      });
      console.log(
        `✅ Success: Found ${filteredAnalytics.length} filtered records`
      );
      if (filteredAnalytics.length > 0) {
        console.log(
          `   Sample: ${filteredAnalytics[0]._id?.course || "No course"} - ${filteredAnalytics[0].totalEnrollments || 0
          } enrollments`
        );
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log("\n✅ Analytics testing completed!");
  } catch (error) {
    console.error("Error in testing:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Run the test
if (require.main === module) {
  connectDB().then(() => {
    testAnalytics();
  });
}

module.exports = { testAnalytics };
