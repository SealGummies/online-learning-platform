const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/database");

// Import models
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Exam = require("../models/Exam");

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Lesson.deleteMany({});
    await Exam.deleteMany({});

    console.log("Existing data cleared");

    // Create Users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Admin User
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@learningplatform.com",
      password: hashedPassword,
      role: "admin",
      profile: {
        bio: "Platform Administrator",
        phone: "+1-555-0001",
      },
      emailVerified: true,
    });

    // Create Instructors
    const instructors = await User.insertMany([
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@learningplatform.com",
        password: hashedPassword,
        role: "instructor",
        profile: {
          bio: "Full-stack developer with 10+ years experience",
          phone: "+1-555-0002",
          address: {
            city: "San Francisco",
            state: "CA",
            country: "USA",
          },
          socialLinks: {
            linkedin: "https://linkedin.com/in/johnsmith",
            github: "https://github.com/johnsmith",
          },
        },
        stats: {
          coursesCreated: 5,
          averageRating: 4.8,
        },
        emailVerified: true,
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@learningplatform.com",
        password: hashedPassword,
        role: "instructor",
        profile: {
          bio: "Data Scientist and ML Engineer",
          phone: "+1-555-0003",
          address: {
            city: "New York",
            state: "NY",
            country: "USA",
          },
          socialLinks: {
            linkedin: "https://linkedin.com/in/sarahjohnson",
            github: "https://github.com/sarahjohnson",
          },
        },
        stats: {
          coursesCreated: 3,
          averageRating: 4.9,
        },
        emailVerified: true,
      },
      {
        firstName: "Mike",
        lastName: "Chen",
        email: "mike.chen@learningplatform.com",
        password: hashedPassword,
        role: "instructor",
        profile: {
          bio: "Cybersecurity Expert and Ethical Hacker",
          phone: "+1-555-0004",
          address: {
            city: "Austin",
            state: "TX",
            country: "USA",
          },
          socialLinks: {
            linkedin: "https://linkedin.com/in/mikechen",
            github: "https://github.com/mikechen",
          },
        },
        stats: {
          coursesCreated: 2,
          averageRating: 4.7,
        },
        emailVerified: true,
      },
    ]);

    // Create Students
    const students = await User.insertMany([
      {
        firstName: "Alice",
        lastName: "Brown",
        email: "alice.brown@email.com",
        password: hashedPassword,
        role: "student",
        profile: {
          bio: "Computer Science student",
          dateOfBirth: new Date("1998-05-15"),
          phone: "+1-555-0005",
        },
        stats: {
          coursesEnrolled: 3,
          coursesCompleted: 1,
          totalPoints: 2450,
        },
        emailVerified: true,
      },
      {
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob.wilson@email.com",
        password: hashedPassword,
        role: "student",
        profile: {
          bio: "Web developer looking to expand skills",
          dateOfBirth: new Date("1995-08-22"),
          phone: "+1-555-0006",
        },
        stats: {
          coursesEnrolled: 2,
          coursesCompleted: 2,
          totalPoints: 3200,
        },
        emailVerified: true,
      },
      {
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@email.com",
        password: hashedPassword,
        role: "student",
        profile: {
          bio: "Data analyst transitioning to data science",
          dateOfBirth: new Date("1992-12-10"),
          phone: "+1-555-0007",
        },
        stats: {
          coursesEnrolled: 4,
          coursesCompleted: 1,
          totalPoints: 1800,
        },
        emailVerified: true,
      },
      {
        firstName: "David",
        lastName: "Garcia",
        email: "david.garcia@email.com",
        password: hashedPassword,
        role: "student",
        profile: {
          bio: "IT professional seeking cybersecurity skills",
          dateOfBirth: new Date("1990-03-18"),
          phone: "+1-555-0008",
        },
        stats: {
          coursesEnrolled: 1,
          coursesCompleted: 0,
          totalPoints: 450,
        },
        emailVerified: true,
      },
    ]);

    // Add more students (to reach 20+ per collection)
    const moreStudents = [];
    for (let i = 9; i <= 25; i++) {
      moreStudents.push({
        firstName: `Student${i}`,
        lastName: `LastName${i}`,
        email: `student${i}@email.com`,
        password: hashedPassword,
        role: "student",
        profile: {
          bio: `Student ${i} profile`,
          dateOfBirth: new Date(1990 + (i % 10), (i % 12) + 1, (i % 28) + 1),
          phone: `+1-555-${1000 + i}`,
        },
        stats: {
          coursesEnrolled: Math.floor(Math.random() * 5) + 1,
          coursesCompleted: Math.floor(Math.random() * 3),
          totalPoints: Math.floor(Math.random() * 5000) + 100,
        },
        emailVerified: true,
      });
    }
    const additionalStudents = await User.insertMany(moreStudents);
    const allStudents = [...students, ...additionalStudents];

    console.log(`Created ${allStudents.length + instructors.length + 1} users`);

    // Create Courses
    const courses = await Course.insertMany([
      {
        title: "Full-Stack JavaScript Development",
        description:
          "Complete guide to building modern web applications with JavaScript, React, Node.js, and MongoDB",
        instructor: instructors[0]._id,
        category: "Web Development",
        level: "Intermediate",
        price: 299.99,
        thumbnail: "https://example.com/thumbnails/fullstack-js.jpg",
        duration: { hours: 40, minutes: 30 },
        tags: ["JavaScript", "React", "Node.js", "MongoDB", "Full-Stack"],
        requirements: ["Basic JavaScript knowledge", "HTML/CSS fundamentals"],
        learningObjectives: [
          "Build full-stack web applications",
          "Master React development",
          "Create RESTful APIs with Node.js",
          "Work with MongoDB databases",
        ],
        settings: {
          isPublished: true,
          allowDiscussions: true,
          allowReviews: true,
          certificate: true,
        },
        stats: {
          enrollments: 156,
          completions: 89,
          averageRating: 4.7,
          totalReviews: 143,
          totalRevenue: 46789.44,
        },
        publishedAt: new Date("2024-01-15"),
      },
      {
        title: "Data Science with Python",
        description:
          "Learn data analysis, visualization, and machine learning with Python",
        instructor: instructors[1]._id,
        category: "Data Science",
        level: "Beginner",
        price: 249.99,
        thumbnail: "https://example.com/thumbnails/data-science-python.jpg",
        duration: { hours: 35, minutes: 45 },
        tags: ["Python", "Data Science", "Machine Learning", "Pandas", "NumPy"],
        requirements: [
          "Basic programming knowledge",
          "High school mathematics",
        ],
        learningObjectives: [
          "Analyze data with Python",
          "Create data visualizations",
          "Build machine learning models",
          "Work with real datasets",
        ],
        settings: {
          isPublished: true,
          allowDiscussions: true,
          allowReviews: true,
          certificate: true,
        },
        stats: {
          enrollments: 234,
          completions: 167,
          averageRating: 4.8,
          totalReviews: 198,
          totalRevenue: 58497.66,
        },
        publishedAt: new Date("2024-02-01"),
      },
      {
        title: "Cybersecurity Fundamentals",
        description:
          "Introduction to cybersecurity concepts, ethical hacking, and security best practices",
        instructor: instructors[2]._id,
        category: "Cybersecurity",
        level: "Beginner",
        price: 199.99,
        thumbnail: "https://example.com/thumbnails/cybersecurity.jpg",
        duration: { hours: 25, minutes: 15 },
        tags: [
          "Cybersecurity",
          "Ethical Hacking",
          "Network Security",
          "Security",
        ],
        requirements: ["Basic computer knowledge", "Understanding of networks"],
        learningObjectives: [
          "Understand cybersecurity principles",
          "Learn ethical hacking techniques",
          "Implement security best practices",
          "Identify security vulnerabilities",
        ],
        settings: {
          isPublished: true,
          allowDiscussions: true,
          allowReviews: true,
          certificate: true,
        },
        stats: {
          enrollments: 89,
          completions: 45,
          averageRating: 4.6,
          totalReviews: 67,
          totalRevenue: 17799.11,
        },
        publishedAt: new Date("2024-03-10"),
      },
      {
        title: "Advanced React Development",
        description:
          "Master advanced React patterns, hooks, and modern development techniques",
        instructor: instructors[0]._id,
        category: "Web Development",
        level: "Advanced",
        price: 349.99,
        thumbnail: "https://example.com/thumbnails/advanced-react.jpg",
        duration: { hours: 30, minutes: 20 },
        tags: ["React", "JavaScript", "Redux", "Hooks", "Advanced"],
        requirements: [
          "Solid React basics",
          "JavaScript ES6+",
          "State management experience",
        ],
        learningObjectives: [
          "Master React hooks",
          "Implement advanced patterns",
          "Optimize React applications",
          "Build scalable architectures",
        ],
        settings: {
          isPublished: true,
          allowDiscussions: true,
          allowReviews: true,
          certificate: true,
        },
        stats: {
          enrollments: 78,
          completions: 34,
          averageRating: 4.9,
          totalReviews: 52,
          totalRevenue: 27299.22,
        },
        publishedAt: new Date("2024-04-05"),
      },
      {
        title: "Machine Learning Foundations",
        description:
          "Build your first machine learning models with practical examples",
        instructor: instructors[1]._id,
        category: "AI/ML",
        level: "Intermediate",
        price: 279.99,
        thumbnail: "https://example.com/thumbnails/ml-foundations.jpg",
        duration: { hours: 45, minutes: 0 },
        tags: [
          "Machine Learning",
          "AI",
          "Python",
          "TensorFlow",
          "Scikit-learn",
        ],
        requirements: [
          "Python programming",
          "Statistics basics",
          "Linear algebra",
        ],
        learningObjectives: [
          "Understand ML algorithms",
          "Build predictive models",
          "Evaluate model performance",
          "Deploy ML solutions",
        ],
        settings: {
          isPublished: true,
          allowDiscussions: true,
          allowReviews: true,
          certificate: true,
        },
        stats: {
          enrollments: 145,
          completions: 78,
          averageRating: 4.7,
          totalReviews: 112,
          totalRevenue: 40598.55,
        },
        publishedAt: new Date("2024-02-20"),
      },
    ]);

    // Add more courses to reach 20+
    const moreCourses = [];
    const categories = [
      "Programming",
      "Data Science",
      "Web Development",
      "Mobile Development",
      "AI/ML",
      "Cybersecurity",
      "Cloud Computing",
      "Database",
    ];
    const levels = ["Beginner", "Intermediate", "Advanced"];

    for (let i = 6; i <= 25; i++) {
      moreCourses.push({
        title: `Course ${i}: ${categories[i % categories.length]} Essentials`,
        description: `Comprehensive course covering ${
          categories[i % categories.length]
        } fundamentals and advanced concepts`,
        instructor: instructors[i % instructors.length]._id,
        category: categories[i % categories.length],
        level: levels[i % levels.length],
        price: Math.floor(Math.random() * 300) + 99.99,
        thumbnail: `https://example.com/thumbnails/course${i}.jpg`,
        duration: {
          hours: Math.floor(Math.random() * 40) + 20,
          minutes: Math.floor(Math.random() * 60),
        },
        tags: [categories[i % categories.length], "Programming", "Technology"],
        requirements: ["Basic computer knowledge"],
        learningObjectives: [
          `Master ${categories[i % categories.length]} concepts`,
          "Build practical projects",
          "Gain industry-ready skills",
        ],
        settings: {
          isPublished: true,
          allowDiscussions: true,
          allowReviews: true,
          certificate: true,
        },
        stats: {
          enrollments: Math.floor(Math.random() * 200) + 20,
          completions: Math.floor(Math.random() * 100) + 10,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          totalReviews: Math.floor(Math.random() * 150) + 20,
          totalRevenue: Math.floor(Math.random() * 50000) + 5000,
        },
        publishedAt: new Date(
          2024,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
      });
    }
    const additionalCourses = await Course.insertMany(moreCourses);
    const allCourses = [...courses, ...additionalCourses];

    console.log(`Created ${allCourses.length} courses`);

    // Create Enrollments
    const enrollments = [];

    // Create specific enrollments for first few students
    enrollments.push(
      {
        student: allStudents[0]._id,
        course: allCourses[0]._id,
        status: "in-progress",
        paymentDetails: {
          amount: 299.99,
          currency: "USD",
          paymentMethod: "credit_card",
          transactionId: "tx_001",
          paymentDate: new Date("2024-06-01"),
        },
        progress: {
          lessonsCompleted: [],
          totalTimeSpent: 120,
          completionPercentage: 45,
          lastActivityDate: new Date(),
        },
      },
      {
        student: allStudents[0]._id,
        course: allCourses[1]._id,
        status: "completed",
        paymentDetails: {
          amount: 249.99,
          currency: "USD",
          paymentMethod: "paypal",
          transactionId: "tx_002",
          paymentDate: new Date("2024-05-15"),
        },
        progress: {
          lessonsCompleted: [],
          totalTimeSpent: 210,
          completionPercentage: 100,
          lastActivityDate: new Date("2024-06-20"),
        },
        certificate: {
          issued: true,
          issuedAt: new Date("2024-06-20"),
          certificateId: "CERT_001",
        },
        rating: 5,
        review: {
          comment: "Excellent course! Very comprehensive and well-structured.",
          reviewDate: new Date("2024-06-21"),
          helpful: 12,
        },
      }
    );

    // Generate random enrollments for all students
    for (let i = 0; i < allStudents.length; i++) {
      const numEnrollments = Math.floor(Math.random() * 4) + 1;
      const enrolledCourses = new Set();

      for (let j = 0; j < numEnrollments; j++) {
        let randomCourse;
        do {
          randomCourse =
            allCourses[Math.floor(Math.random() * allCourses.length)];
        } while (enrolledCourses.has(randomCourse._id.toString()));

        enrolledCourses.add(randomCourse._id.toString());

        const statuses = ["enrolled", "in-progress", "completed"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        enrollments.push({
          student: allStudents[i]._id,
          course: randomCourse._id,
          status: status,
          paymentDetails: {
            amount: randomCourse.price,
            currency: "USD",
            paymentMethod: ["credit_card", "paypal", "bank_transfer"][
              Math.floor(Math.random() * 3)
            ],
            transactionId: `tx_${Date.now()}_${i}_${j}`,
            paymentDate: new Date(
              Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
            ),
          },
          progress: {
            lessonsCompleted: [],
            totalTimeSpent: Math.floor(Math.random() * 300) + 30,
            completionPercentage:
              status === "completed"
                ? 100
                : Math.floor(Math.random() * 80) + 10,
            lastActivityDate: new Date(
              Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
            ),
          },
          ...(status === "completed" &&
            Math.random() > 0.3 && {
              certificate: {
                issued: true,
                issuedAt: new Date(),
                certificateId: `CERT_${Date.now()}_${i}_${j}`,
              },
              rating: Math.floor(Math.random() * 2) + 4,
              review: {
                comment: "Great course with practical examples!",
                reviewDate: new Date(),
                helpful: Math.floor(Math.random() * 20),
              },
            }),
        });
      }
    }

    const createdEnrollments = await Enrollment.insertMany(enrollments);
    console.log(`Created ${createdEnrollments.length} enrollments`);

    // Create Lessons
    const lessons = [];

    // Create lessons for each course
    for (
      let courseIndex = 0;
      courseIndex < Math.min(allCourses.length, 10);
      courseIndex++
    ) {
      const course = allCourses[courseIndex];
      const numLessons = Math.floor(Math.random() * 8) + 5; // 5-12 lessons per course

      for (let lessonIndex = 1; lessonIndex <= numLessons; lessonIndex++) {
        const lessonTypes = [
          "video",
          "text",
          "quiz",
          "assignment",
          "interactive",
        ];
        const lessonType =
          lessonTypes[Math.floor(Math.random() * lessonTypes.length)];

        lessons.push({
          title: `Lesson ${lessonIndex}: ${
            course.title.split(" ")[0]
          } Fundamentals`,
          description: `In this lesson, you'll learn the core concepts of ${
            course.title.split(" ")[0]
          }`,
          course: course._id,
          instructor: course.instructor,
          order: lessonIndex,
          type: lessonType,
          content: {
            ...(lessonType === "video" && {
              videoUrl: `https://example.com/videos/course${courseIndex}_lesson${lessonIndex}.mp4`,
              videoDuration: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
              videoQuality: [
                {
                  resolution: "720p",
                  url: `https://example.com/videos/720p/course${courseIndex}_lesson${lessonIndex}.mp4`,
                  fileSize: 150000000,
                },
                {
                  resolution: "1080p",
                  url: `https://example.com/videos/1080p/course${courseIndex}_lesson${lessonIndex}.mp4`,
                  fileSize: 300000000,
                },
              ],
              subtitles: [
                {
                  language: "en",
                  url: `https://example.com/subtitles/en/course${courseIndex}_lesson${lessonIndex}.vtt`,
                },
              ],
            }),
            ...(lessonType === "text" && {
              textContent: `This is the detailed text content for lesson ${lessonIndex} of ${course.title}. It covers important concepts and provides step-by-step guidance.`,
            }),
            ...(lessonType === "assignment" && {
              assignmentInstructions: `Complete the assignment for lesson ${lessonIndex}. Apply the concepts you've learned.`,
              assignmentDeadline: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ),
            }),
          },
          resources: [
            {
              title: "Lesson Notes",
              type: "pdf",
              url: `https://example.com/resources/lesson${lessonIndex}_notes.pdf`,
              description: "Comprehensive notes for this lesson",
            },
            {
              title: "Additional Reading",
              type: "link",
              url: `https://example.com/reading/lesson${lessonIndex}`,
              description: "External resources for further learning",
            },
          ],
          learningObjectives: [
            `Understand ${course.title.split(" ")[0]} basics`,
            "Apply concepts in practical scenarios",
            "Build foundational knowledge",
          ],
          keyPoints: ["Key concept 1", "Key concept 2", "Key concept 3"],
          difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
          estimatedTime: Math.floor(Math.random() * 60) + 30,
          settings: {
            isPublished: true,
            allowComments: true,
            allowDownloads: true,
            trackProgress: true,
          },
          stats: {
            views: Math.floor(Math.random() * 500) + 50,
            completions: Math.floor(Math.random() * 300) + 30,
            averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
            totalComments: Math.floor(Math.random() * 50) + 5,
            averageTimeSpent: Math.floor(Math.random() * 45) + 15,
          },
          publishedAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    // Add more lessons to reach 20+
    const additionalLessons = [];
    for (let i = lessons.length; i < 150; i++) {
      const randomCourse =
        allCourses[Math.floor(Math.random() * Math.min(allCourses.length, 10))];
      additionalLessons.push({
        title: `Additional Lesson ${i}: Advanced Topics`,
        description: `Advanced lesson covering specialized topics in ${randomCourse.title}`,
        course: randomCourse._id,
        instructor: randomCourse.instructor,
        order: (i % 10) + 1,
        type: ["video", "text", "quiz"][Math.floor(Math.random() * 3)],
        content: {
          videoUrl: `https://example.com/videos/lesson${i}.mp4`,
          videoDuration: Math.floor(Math.random() * 1800) + 600,
        },
        resources: [
          {
            title: "Resource",
            type: "pdf",
            url: `https://example.com/resources/lesson${i}.pdf`,
            description: "Lesson resource",
          },
        ],
        learningObjectives: ["Learn advanced concepts"],
        estimatedTime: Math.floor(Math.random() * 60) + 30,
        settings: {
          isPublished: true,
          allowComments: true,
          allowDownloads: true,
          trackProgress: true,
        },
        stats: {
          views: Math.floor(Math.random() * 200) + 20,
          completions: Math.floor(Math.random() * 150) + 15,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          totalComments: Math.floor(Math.random() * 20) + 2,
          averageTimeSpent: Math.floor(Math.random() * 30) + 10,
        },
        publishedAt: new Date(),
      });
    }

    const allLessons = [...lessons, ...additionalLessons];
    const createdLessons = await Lesson.insertMany(allLessons);
    console.log(`Created ${createdLessons.length} lessons`);

    // Create Exams
    const exams = [];

    // Create exams for each course
    for (
      let courseIndex = 0;
      courseIndex < Math.min(allCourses.length, 10);
      courseIndex++
    ) {
      const course = allCourses[courseIndex];
      const numExams = Math.floor(Math.random() * 3) + 2; // 2-4 exams per course

      for (let examIndex = 1; examIndex <= numExams; examIndex++) {
        const examTypes = ["quiz", "midterm", "final", "assignment"];
        const examType =
          examTypes[Math.floor(Math.random() * examTypes.length)];

        // Generate questions
        const questions = [];
        const numQuestions = Math.floor(Math.random() * 10) + 5; // 5-14 questions

        for (let qIndex = 1; qIndex <= numQuestions; qIndex++) {
          const questionTypes = [
            "multiple-choice",
            "true-false",
            "short-answer",
          ];
          const questionType =
            questionTypes[Math.floor(Math.random() * questionTypes.length)];

          const question = {
            question: `Question ${qIndex}: What is the key concept in ${
              course.title.split(" ")[0]
            }?`,
            type: questionType,
            points: Math.floor(Math.random() * 3) + 1,
            difficulty: ["Easy", "Medium", "Hard"][
              Math.floor(Math.random() * 3)
            ],
            explanation: `This question tests understanding of ${
              course.title.split(" ")[0]
            } fundamentals.`,
          };

          if (questionType === "multiple-choice") {
            question.options = [
              { text: "Option A", isCorrect: true },
              { text: "Option B", isCorrect: false },
              { text: "Option C", isCorrect: false },
              { text: "Option D", isCorrect: false },
            ];
          } else if (questionType === "true-false") {
            question.options = [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ];
          } else {
            question.correctAnswer = `Sample answer for question ${qIndex}`;
          }

          questions.push(question);
        }

        exams.push({
          title: `${
            examType.charAt(0).toUpperCase() + examType.slice(1)
          } Exam ${examIndex}`,
          description: `${examType} examination for ${course.title}`,
          course: course._id,
          instructor: course.instructor,
          type: examType,
          questions: questions,
          settings: {
            timeLimit: Math.floor(Math.random() * 90) + 30, // 30-120 minutes
            attempts: Math.floor(Math.random() * 2) + 1,
            passingScore: Math.floor(Math.random() * 20) + 60, // 60-80%
            showCorrectAnswers: true,
            showScoreImmediately: true,
            randomizeQuestions: Math.random() > 0.5,
            randomizeOptions: Math.random() > 0.5,
            allowReview: true,
          },
          availability: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          weight: Math.floor(Math.random() * 20) + 10, // 10-30% of course grade
          instructions: `Please read all questions carefully and select the best answer. You have ${
            Math.floor(Math.random() * 90) + 30
          } minutes to complete this exam.`,
          stats: {
            attempts: Math.floor(Math.random() * 100) + 20,
            completions: Math.floor(Math.random() * 80) + 15,
            averageScore: Math.round((Math.random() * 30 + 60) * 10) / 10,
            highestScore: Math.round((Math.random() * 20 + 80) * 10) / 10,
            lowestScore: Math.round((Math.random() * 40 + 30) * 10) / 10,
            averageTimeSpent: Math.floor(Math.random() * 60) + 30,
            passRate: Math.round((Math.random() * 40 + 60) * 10) / 10,
          },
          isPublished: true,
          publishedAt: new Date(
            Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    // Add more exams to reach 20+
    const additionalExams = [];
    for (let i = exams.length; i < 50; i++) {
      const randomCourse =
        allCourses[Math.floor(Math.random() * Math.min(allCourses.length, 10))];
      additionalExams.push({
        title: `Additional Quiz ${i}`,
        description: `Practice quiz for ${randomCourse.title}`,
        course: randomCourse._id,
        instructor: randomCourse.instructor,
        type: "quiz",
        questions: [
          {
            question: `Sample question ${i}`,
            type: "multiple-choice",
            options: [
              { text: "Option A", isCorrect: true },
              { text: "Option B", isCorrect: false },
            ],
            points: 1,
            difficulty: "Easy",
            explanation: "Sample explanation",
          },
        ],
        settings: {
          timeLimit: 30,
          attempts: 3,
          passingScore: 70,
          showCorrectAnswers: true,
          showScoreImmediately: true,
        },
        availability: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        weight: 5,
        instructions: "Complete this practice quiz.",
        stats: {
          attempts: Math.floor(Math.random() * 50) + 10,
          completions: Math.floor(Math.random() * 40) + 8,
          averageScore: Math.round((Math.random() * 30 + 60) * 10) / 10,
          passRate: Math.round((Math.random() * 40 + 60) * 10) / 10,
        },
        isPublished: true,
        publishedAt: new Date(),
      });
    }

    const allExams = [...exams, ...additionalExams];
    const createdExams = await Exam.insertMany(allExams);
    console.log(`Created ${createdExams.length} exams`);

    console.log("\n=== DATABASE SEEDING COMPLETED ===");
    console.log(`Total Users: ${allStudents.length + instructors.length + 1}`);
    console.log(`Total Courses: ${allCourses.length}`);
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
