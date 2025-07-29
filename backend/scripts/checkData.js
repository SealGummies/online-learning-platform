const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Exam = require("../models/Exam");
require("dotenv").config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check users
    const users = await User.find({});
    console.log(`\nTotal users: ${users.length}`);
    
    const students = await User.find({ role: "student" });
    console.log(`Students: ${students.length}`);
    
    const firstStudent = students[0];
    console.log(`\nFirst student: ${firstStudent.email} (${firstStudent._id})`);

    // Check courses
    const courses = await Course.find({});
    console.log(`\nTotal courses: ${courses.length}`);
    
    const firstCourse = courses[0];
    console.log(`First course: ${firstCourse.title} (${firstCourse._id})`);

    // Check enrollments
    const enrollments = await Enrollment.find({ student: firstStudent._id });
    console.log(`\nEnrollments for ${firstStudent.email}: ${enrollments.length}`);
    
    if (enrollments.length > 0) {
      console.log("Enrolled courses:");
      for (const enrollment of enrollments) {
        const course = await Course.findById(enrollment.course);
        console.log(`  - ${course.title} (${course._id}) - Status: ${enrollment.status}`);
      }
    }

    // Check exams for the first course
    const exams = await Exam.find({ course: firstCourse._id });
    console.log(`\nExams for course "${firstCourse.title}": ${exams.length}`);
    
    if (exams.length > 0) {
      console.log("Exams:");
      for (const exam of exams) {
        console.log(`  - ${exam.title} (${exam._id}) - Type: ${exam.type} - Published: ${exam.isPublished}`);
        console.log(`    Questions: ${exam.questions.length}, Points: ${exam.totalPoints}`);
      }
    }

    // Check if student is enrolled in first course
    const studentEnrollment = await Enrollment.findOne({
      student: firstStudent._id,
      course: firstCourse._id
    });
    
    if (studentEnrollment) {
      console.log(`\n✅ Student is enrolled in first course`);
      console.log(`   Status: ${studentEnrollment.status}`);
      console.log(`   Completion: ${studentEnrollment.completionPercentage}%`);
    } else {
      console.log(`\n❌ Student is NOT enrolled in first course`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkData(); 