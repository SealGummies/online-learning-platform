const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/database");

const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Exam = require("../models/Exam");

const categories = [
    "Programming",
    "Data Science",
    "Web Development",
    "AI/ML",
    "Database",
    "Other",
];
const levels = ["Beginner", "Intermediate", "Advanced"];
const lessonTypes = ["video", "text", "quiz", "assignment"];
const examTypes = ["quiz", "midterm", "final", "assignment"];

const seedDatabase = async () => {
    try {
        await connectDB();
        await User.deleteMany({});
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Lesson.deleteMany({});
        await Exam.deleteMany({});
        console.log("Existing data cleared");

        // Create Users (5 admin, 5 instructor, 10+ students)
        const hashedPassword = await bcrypt.hash("password123", 10);
        const users = [];
        for (let i = 0; i < 5; i++) {
            users.push({
                firstName: `Admin${i + 1}`,
                lastName: "User",
                email: `admin${i + 1}@test.com`,
                password: hashedPassword,
                role: "admin",
                isActive: true,
            });
        }
        for (let i = 0; i < 5; i++) {
            users.push({
                firstName: `Instructor${i + 1}`,
                lastName: "Teach",
                email: `instructor${i + 1}@test.com`,
                password: hashedPassword,
                role: "instructor",
                isActive: true,
            });
        }
        for (let i = 0; i < 20; i++) {
            users.push({
                firstName: `Student${i + 1}`,
                lastName: "Learn",
                email: `student${i + 1}@test.com`,
                password: hashedPassword,
                role: "student",
                isActive: true,
            });
        }
        const createdUsers = await User.insertMany(users);
        const admins = createdUsers.filter(u => u.role === "admin");
        const instructors = createdUsers.filter(u => u.role === "instructor");
        const students = createdUsers.filter(u => u.role === "student");
        console.log(`Created ${createdUsers.length} users`);

        // Create Courses (20)
        const courses = [];
        for (let i = 0; i < 20; i++) {
            courses.push({
                title: `Course ${i + 1}`,
                description: `Description for course ${i + 1}`,
                instructor: instructors[i % instructors.length]._id,
                category: categories[i % categories.length],
                level: levels[i % levels.length],
                price: Math.floor(Math.random() * 400) + 50,
                isActive: true,
            });
        }
        const createdCourses = await Course.insertMany(courses);
        console.log(`Created ${createdCourses.length} courses`);

        // Create Lessons (at least 20, distributed across courses)
        const lessons = [];
        for (let i = 0; i < 40; i++) {
            const course = createdCourses[i % createdCourses.length];
            lessons.push({
                title: `Lesson ${i + 1} for ${course.title}`,
                course: course._id,
                order: (i % 5) + 1,
                type: lessonTypes[i % lessonTypes.length],
                content: `Content for lesson ${i + 1} of course ${course.title}`,
                isPublished: true,
            });
        }
        const createdLessons = await Lesson.insertMany(lessons);
        console.log(`Created ${createdLessons.length} lessons`);

        // Create Exams (at least 20, distributed across courses)
        const exams = [];
        for (let i = 0; i < 25; i++) {
            const course = createdCourses[i % createdCourses.length];
            
            // Create sample questions for each exam
            const questions = [];
            const numQuestions = Math.floor(Math.random() * 3) + 3; // 3-5 questions
            
            for (let j = 0; j < numQuestions; j++) {
                questions.push({
                    text: `Question ${j + 1} for exam ${i + 1}`,
                    options: [
                        `Option A for question ${j + 1}`,
                        `Option B for question ${j + 1}`,
                        `Option C for question ${j + 1}`,
                        `Option D for question ${j + 1}`
                    ],
                    correctAnswer: Math.floor(Math.random() * 4), // Random correct answer
                    points: Math.floor(Math.random() * 3) + 1 // 1-3 points per question
                });
            }
            
            exams.push({
                title: `Exam ${i + 1} for ${course.title}`,
                description: `Description for exam ${i + 1} of course ${course.title}`,
                course: course._id,
                type: examTypes[i % examTypes.length],
                questions: questions,
                duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
                totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
                startDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Random start date
                endDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random end date
                isPublished: Math.random() > 0.3, // 70% published
                isActive: true,
                allowRetake: Math.random() > 0.7, // 30% allow retake
                maxAttempts: Math.floor(Math.random() * 2) + 1, // 1-2 attempts
                instructions: `Instructions for exam ${i + 1}. Please read all questions carefully.`
            });
        }
        const createdExams = await Exam.insertMany(exams);
        console.log(`Created ${createdExams.length} exams`);

        // Create Enrollments (每个学生选3-5门课, 共不少于20条)
        const enrollments = [];
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const numEnroll = Math.floor(Math.random() * 3) + 3; // 3-5 courses
            const courseIndexes = new Set();
            while (courseIndexes.size < numEnroll) {
                courseIndexes.add(Math.floor(Math.random() * createdCourses.length));
            }
            for (const idx of courseIndexes) {
                enrollments.push({
                    student: student._id,
                    course: createdCourses[idx]._id,
                    status: ["enrolled", "in-progress", "completed", "dropped"][Math.floor(Math.random() * 4)],
                    completionPercentage: Math.floor(Math.random() * 101),
                    finalGrade: Math.random() > 0.5 ? Math.floor(Math.random() * 101) : undefined,
                    examsCompleted: [],
                });
            }
        }
        // 至少20条
        while (enrollments.length < 20) {
            enrollments.push({
                student: students[Math.floor(Math.random() * students.length)]._id,
                course: createdCourses[Math.floor(Math.random() * createdCourses.length)]._id,
                status: "enrolled",
                completionPercentage: 0,
                finalGrade: undefined,
                examsCompleted: [],
            });
        }
        const createdEnrollments = await Enrollment.insertMany(enrollments);
        console.log(`Created ${createdEnrollments.length} enrollments`);

        console.log("\n=== LARGE DATABASE SEEDING COMPLETED ===");
        console.log(`Total Users: ${createdUsers.length}`);
        console.log(`Total Courses: ${createdCourses.length}`);
        console.log(`Total Enrollments: ${createdEnrollments.length}`);
        console.log(`Total Lessons: ${createdLessons.length}`);
        console.log(`Total Exams: ${createdExams.length}`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

// Run the seeding
seedDatabase(); 