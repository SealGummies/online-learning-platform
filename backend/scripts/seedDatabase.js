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

// Database questions for database-related courses
const databaseQuestions = [
    {
        text: "What is the primary key in a database table?",
        options: [
            "A column that contains unique values for each row",
            "A column that can contain duplicate values",
            "A column that is always the first column",
            "A column that stores only text data"
        ],
        correctAnswer: 0,
        points: 2
    },
    {
        text: "Which SQL command is used to retrieve data from a database?",
        options: [
            "INSERT",
            "SELECT",
            "UPDATE",
            "DELETE"
        ],
        correctAnswer: 1,
        points: 1
    },
    {
        text: "What is normalization in database design?",
        options: [
            "A process to make databases faster",
            "A process to organize data to reduce redundancy",
            "A process to encrypt database data",
            "A process to backup database data"
        ],
        correctAnswer: 1,
        points: 3
    },
    {
        text: "Which of the following is NOT a valid SQL data type?",
        options: [
            "VARCHAR",
            "INTEGER",
            "BOOLEAN",
            "STRING"
        ],
        correctAnswer: 3,
        points: 2
    },
    {
        text: "What does ACID stand for in database transactions?",
        options: [
            "Atomicity, Consistency, Isolation, Durability",
            "Access, Control, Integrity, Data",
            "Authentication, Confidentiality, Integrity, Data",
            "Application, Connection, Interface, Database"
        ],
        correctAnswer: 0,
        points: 3
    },
    {
        text: "Which SQL clause is used to filter results?",
        options: [
            "SELECT",
            "FROM",
            "WHERE",
            "ORDER BY"
        ],
        correctAnswer: 2,
        points: 1
    },
    {
        text: "What is a foreign key?",
        options: [
            "A key that is always unique",
            "A key that references a primary key in another table",
            "A key that is used for encryption",
            "A key that is automatically generated"
        ],
        correctAnswer: 1,
        points: 2
    },
    {
        text: "Which database model is most commonly used today?",
        options: [
            "Hierarchical",
            "Network",
            "Relational",
            "Object-oriented"
        ],
        correctAnswer: 2,
        points: 2
    },
    {
        text: "What is the purpose of an INDEX in a database?",
        options: [
            "To store backup data",
            "To improve query performance",
            "To encrypt sensitive data",
            "To validate data integrity"
        ],
        correctAnswer: 1,
        points: 2
    },
    {
        text: "Which SQL command is used to add new data to a table?",
        options: [
            "SELECT",
            "INSERT",
            "UPDATE",
            "CREATE"
        ],
        correctAnswer: 1,
        points: 1
    },
    {
        text: "What is a database transaction?",
        options: [
            "A backup of the database",
            "A logical unit of work that must be completed entirely or not at all",
            "A connection to the database",
            "A query that returns data"
        ],
        correctAnswer: 1,
        points: 3
    },
    {
        text: "Which of the following is a valid SQL aggregate function?",
        options: [
            "COUNT",
            "FIND",
            "LOCATE",
            "SEARCH"
        ],
        correctAnswer: 0,
        points: 1
    },
    {
        text: "What is the difference between DELETE and TRUNCATE?",
        options: [
            "DELETE removes all rows, TRUNCATE removes specific rows",
            "DELETE can be rolled back, TRUNCATE cannot be rolled back",
            "DELETE is faster than TRUNCATE",
            "There is no difference"
        ],
        correctAnswer: 1,
        points: 3
    },
    {
        text: "Which SQL keyword is used to sort results?",
        options: [
            "SORT",
            "ORDER BY",
            "ARRANGE",
            "ORGANIZE"
        ],
        correctAnswer: 1,
        points: 1
    },
    {
        text: "What is a database view?",
        options: [
            "A physical copy of a table",
            "A virtual table based on a SQL query",
            "A backup of the database",
            "A connection to the database"
        ],
        correctAnswer: 1,
        points: 2
    }
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
            
            // Check if this is a database course
            const isDatabaseCourse = course.category === "Database";
            
            if (isDatabaseCourse) {
                // Use database-specific questions
                const shuffledQuestions = [...databaseQuestions].sort(() => Math.random() - 0.5);
                for (let j = 0; j < numQuestions && j < shuffledQuestions.length; j++) {
                    questions.push(shuffledQuestions[j]);
                }
            } else {
                // Use generic questions for other courses
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