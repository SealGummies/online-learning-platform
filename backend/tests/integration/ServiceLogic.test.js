require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../../models/User");
const Course = require("../../models/Course");
const Lesson = require("../../models/Lesson");
const Exam = require("../../models/Exam");
const Enrollment = require("../../models/Enrollment");
const UserService = require("../../services/UserService");
const LessonService = require("../../services/LessonService");
const ExamService = require("../../services/ExamService");

describe("Additional Service Logic Tests", () => {
  let testUser;
  let testInstructor;
  let testCourse;
  let testLesson;
  let testExam;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI ||
          "mongodb://localhost:27017/online-learning-test"
      );
    }

    // Create test instructor
    testInstructor = await User.create({
      firstName: "Test",
      lastName: "Instructor",
      email: `instructor-service-${Date.now()}@example.com`,
      password: "hashedpassword123",
      role: "instructor",
      profile: {
        bio: "Experienced instructor",
        specialization: "Programming",
      },
    });

    // Create test student
    testUser = await User.create({
      firstName: "Test",
      lastName: "Student",
      email: `student-service-${Date.now()}@example.com`,
      password: "hashedpassword123",
      role: "student",
      profile: {
        bio: "Eager learner",
      },
    });

    // Create test course
    testCourse = await Course.create({
      title: "Service Test Course",
      description: "Course for service testing",
      instructor: testInstructor._id,
      category: "Programming",
      level: "Beginner",
      price: 99.99,
      currency: "USD",
      settings: { isPublished: true },
      stats: { enrollments: 0 },
      status: "published", // Make sure course is published
    });
  });

  beforeEach(async () => {
    // Create fresh test lesson and exam for each test
    testLesson = await Lesson.create({
      title: "Test Lesson",
      description: "Sample lesson for testing",
      course: testCourse._id,
      instructor: testInstructor._id,
      order: 1,
      type: "video",
      content: {
        videoUrl: "https://example.com/video.mp4",
        videoDuration: 600,
      },
      estimatedTime: 10, // in minutes
      settings: {
        isPublished: true,
        allowComments: true,
      },
    });

    testExam = await Exam.create({
      title: "Test Exam",
      description: "Sample exam for testing",
      course: testCourse._id,
      instructor: testInstructor._id,
      type: "quiz",
      questions: [
        {
          question: "What is JavaScript?",
          type: "multiple-choice",
          options: [
            { text: "Language", isCorrect: true },
            { text: "Framework", isCorrect: false },
            { text: "Library", isCorrect: false },
            { text: "Database", isCorrect: false },
          ],
          points: 10,
        },
        {
          question: "Explain variables",
          type: "short-answer",
          correctAnswer: "Variables store data values",
          points: 5,
        },
      ],
      settings: {
        timeLimit: 60,
        attempts: 3,
        passingScore: 70,
      },
      isPublished: true, // Publish the exam for testing
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testLesson) {
      await Lesson.findByIdAndDelete(testLesson._id);
    }
    if (testExam) {
      await Exam.findByIdAndDelete(testExam._id);
    }
  });

  afterAll(async () => {
    // Clean up test entities
    if (testUser) await User.findByIdAndDelete(testUser._id);
    if (testInstructor) await User.findByIdAndDelete(testInstructor._id);
    if (testCourse) await Course.findByIdAndDelete(testCourse._id);
    await mongoose.connection.close();
  });

  describe("UserService Profile Management", () => {
    test("should update user profile successfully", async () => {
      const profileData = {
        "profile.bio": "Updated bio content",
        "profile.specialization": "Web Development",
      };

      const result = await UserService.updateUser(testUser._id, profileData);

      expect(result._id.toString()).toBe(testUser._id.toString());
      expect(result.profile.bio).toBe("Updated bio content");

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.profile.bio).toBe("Updated bio content");
    });

    test("should get user by ID with populated data", async () => {
      const result = await UserService.getUserById(testUser._id);

      expect(result._id.toString()).toBe(testUser._id.toString());
      expect(result.email).toBe(testUser.email);
      expect(result.role).toBe("student");
    });

    test("should handle invalid user ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(UserService.getUserById(fakeId)).rejects.toThrow(
        "User not found"
      );
    });

    test("should get users by role with filtering", async () => {
      const result = await UserService.getInstructors({});

      expect(Array.isArray(result)).toBe(true);

      // All returned users should be instructors
      result.forEach((user) => {
        expect(user.role).toBe("instructor");
      });
    });
  });

  describe("LessonService Content Management", () => {
    test("should create lesson with proper validation", async () => {
      const lessonData = {
        title: "New Service Lesson",
        description: "Created through service",
        course: testCourse._id,
        instructor: testInstructor._id,
        order: 2,
        type: "text",
        content: {
          textContent:
            "This is text content for the lesson that should be long enough to pass validation because the service requires at least 50 characters",
        },
        estimatedTime: 5, // in minutes
        settings: {
          isPublished: false,
          allowComments: true,
        },
      };

      const result = await LessonService.createLesson(
        lessonData,
        testInstructor._id.toString()
      );

      expect(result.title).toBe(lessonData.title);
      expect(result.type).toBe("text");
      expect(result.settings.isPublished).toBe(false);

      // Cleanup
      await Lesson.findByIdAndDelete(result._id);
    });

    test("should get lessons by course ID", async () => {
      const result = await LessonService.getLessons(
        testCourse._id,
        testInstructor._id.toString(),
        "instructor"
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // All lessons should belong to the test course
      result.forEach((lesson) => {
        expect(lesson.course.toString()).toBe(testCourse._id.toString());
      });
    });

    test("should update lesson content", async () => {
      const updateData = {
        title: "Updated Lesson Title",
        content: {
          videoUrl: "https://example.com/updated-video.mp4",
          videoDuration: 900,
        },
      };

      const result = await LessonService.updateLesson(
        testLesson._id,
        updateData,
        testInstructor._id.toString()
      );

      expect(result.title).toBe(updateData.title);
      expect(result.content.videoDuration).toBe(900);

      // Verify in database
      const updatedLesson = await Lesson.findById(testLesson._id);
      expect(updatedLesson.title).toBe(updateData.title);
    });

    test("should delete lesson and handle dependencies", async () => {
      const result = await LessonService.deleteLesson(
        testLesson._id,
        testInstructor._id.toString()
      );

      expect(result.message).toContain("deleted");

      // Verify deletion
      const deletedLesson = await Lesson.findById(testLesson._id);
      expect(deletedLesson).toBeNull();

      // Reset testLesson to prevent cleanup issues
      testLesson = null;
    });

    test("should handle lesson ordering", async () => {
      // Create multiple lessons
      const lesson2 = await Lesson.create({
        title: "Lesson 2",
        description: "Second lesson",
        course: testCourse._id,
        instructor: testInstructor._id,
        order: 2,
        type: "text",
        content: { textContent: "Content 2" },
        estimatedTime: 5,
      });

      const lesson3 = await Lesson.create({
        title: "Lesson 3",
        description: "Third lesson",
        course: testCourse._id,
        instructor: testInstructor._id,
        order: 3,
        type: "text",
        content: { textContent: "Content 3" },
        estimatedTime: 5,
      });

      // Get lessons and verify ordering
      const result = await LessonService.getLessons(
        testCourse._id,
        testInstructor._id.toString(),
        "instructor"
      );

      const sortedLessons = result.sort((a, b) => a.order - b.order);
      expect(sortedLessons[0].order).toBe(1);
      expect(sortedLessons[1].order).toBe(2);
      expect(sortedLessons[2].order).toBe(3);

      // Cleanup
      await Lesson.findByIdAndDelete(lesson2._id);
      await Lesson.findByIdAndDelete(lesson3._id);
    });
  });

  describe("ExamService Assessment Management", () => {
    test("should create exam with questions validation", async () => {
      const examData = {
        title: "Service Created Exam",
        description: "Exam created through service",
        course: testCourse._id,
        instructor: testInstructor._id,
        type: "quiz",
        questions: [
          {
            question: "What is Node.js and how does it work?",
            type: "multiple-choice",
            options: [
              { text: "Runtime" },
              { text: "Language" },
              { text: "Database" },
              { text: "Framework" },
            ],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "Explain async/await in JavaScript programming",
            type: "essay",
            points: 20,
          },
        ],
        settings: {
          timeLimit: 30,
          attempts: 2,
          passingScore: 75,
        },
      };

      const result = await ExamService.createExam(
        examData,
        testInstructor._id.toString()
      );

      expect(result.title).toBe(examData.title);
      expect(result.questions).toHaveLength(2);
      expect(result.settings.timeLimit).toBe(30);

      // Verify scoring calculation
      const totalPoints = result.questions.reduce(
        (sum, q) => sum + q.points,
        0
      );
      expect(totalPoints).toBe(30);

      // Cleanup
      await Exam.findByIdAndDelete(result._id);
    });

    test("should get exams by course", async () => {
      const result = await ExamService.getExams(
        testCourse._id,
        testInstructor._id.toString(),
        "instructor"
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // All exams should belong to test course
      result.forEach((exam) => {
        expect(exam.course.toString()).toBe(testCourse._id.toString());
      });
    });

    test("should update exam questions and settings", async () => {
      const updateData = {
        title: "Updated Exam Title",
        questions: [
          {
            question: "Updated question?",
            type: "true-false",
            correctAnswer: "true",
            points: 5,
          },
        ],
        settings: {
          timeLimit: 40,
          attempts: 1,
          passingScore: 80,
        },
      };

      const result = await ExamService.updateExam(
        testExam._id,
        updateData,
        testInstructor._id.toString()
      );

      expect(result.title).toBe(updateData.title);
      expect(result.questions).toHaveLength(1);
      expect(result.settings.timeLimit).toBe(40);

      // Verify in database
      const updatedExam = await Exam.findById(testExam._id);
      expect(updatedExam.title).toBe(updateData.title);
    });

    test("should validate exam submission", async () => {
      // First enroll the student in the course
      await Enrollment.create({
        student: testUser._id,
        course: testCourse._id,
        enrollmentDate: new Date(),
        status: "enrolled",
        paymentDetails: {
          amount: 99.99,
          currency: "USD",
          paymentMethod: "free",
        },
      });

      const submissionData = [
        {
          questionIndex: 0,
          answer: "Language", // This should correspond to the correct answer
        },
        {
          questionIndex: 1,
          answer: "Variables store data values",
        },
      ];

      const result = await ExamService.submitExam(
        testExam._id,
        testUser._id,
        submissionData
      );

      expect(result.exam).toBeDefined();
      expect(result.attempt).toBeDefined();
      expect(result.score).toBeDefined();

      // For multiple choice, should be able to auto-grade
      expect(result.score).toBeGreaterThan(0);
    });

    test("should handle exam attempt limits", async () => {
      // Ensure student is enrolled
      await Enrollment.findOneAndUpdate(
        { student: testUser._id, course: testCourse._id },
        {
          student: testUser._id,
          course: testCourse._id,
          status: "enrolled",
          paymentDetails: {
            amount: 99.99,
            currency: "USD",
            paymentMethod: "free",
          },
        },
        { upsert: true }
      );

      // First submission
      const submissionData = [
        { questionIndex: 0, answer: "Framework" }, // Wrong answer
        { questionIndex: 1, answer: "Short answer" },
      ];

      await ExamService.submitExam(testExam._id, testUser._id, submissionData);
      await ExamService.submitExam(testExam._id, testUser._id, submissionData);
      await ExamService.submitExam(testExam._id, testUser._id, submissionData);

      // Fourth attempt should fail (max 3 attempts)
      await expect(
        ExamService.submitExam(testExam._id, testUser._id, submissionData)
      ).rejects.toThrow();
    });

    test("should calculate exam statistics", async () => {
      // Ensure student is enrolled
      await Enrollment.findOneAndUpdate(
        { student: testUser._id, course: testCourse._id },
        {
          student: testUser._id,
          course: testCourse._id,
          status: "enrolled",
          paymentDetails: {
            amount: 99.99,
            currency: "USD",
            paymentMethod: "free",
          },
        },
        { upsert: true }
      );

      // Submit a few exam attempts
      const submissionData = [
        { questionIndex: 0, answer: "Language" },
        { questionIndex: 1, answer: "Test answer" },
      ];

      await ExamService.submitExam(testExam._id, testUser._id, submissionData);

      const result = await ExamService.getExamStats(
        testExam._id,
        testInstructor._id.toString()
      );

      expect(result.totalAttempts).toBeGreaterThan(0);
      expect(result.averageScore).toBeDefined();
      expect(result.passRate).toBeDefined();
    });
  });

  describe("Service Error Handling", () => {
    test("should handle invalid ObjectIds gracefully", async () => {
      const invalidId = "invalid-object-id";

      await expect(UserService.getUserById(invalidId)).rejects.toThrow();

      await expect(
        LessonService.updateLesson(invalidId, {}, testInstructor._id)
      ).rejects.toThrow();

      await expect(
        ExamService.getExamById(invalidId, testInstructor._id, "instructor")
      ).rejects.toThrow();
    });

    test("should validate required fields in service operations", async () => {
      // Try to create lesson without required fields
      const incompleteData = {
        title: "Incomplete Lesson",
        // Missing required fields
      };

      await expect(
        LessonService.createLesson(incompleteData, testInstructor._id)
      ).rejects.toThrow();
    });

    test("should handle authorization in service layer", async () => {
      // Try to update lesson with wrong instructor
      const wrongInstructorId = new mongoose.Types.ObjectId();
      const updateData = {
        title: "Unauthorized Update",
      };

      await expect(
        LessonService.updateLesson(
          testLesson._id,
          updateData,
          wrongInstructorId
        )
      ).rejects.toThrow();
    });
  });

  describe("Service Performance and Optimization", () => {
    test("should efficiently handle bulk operations", async () => {
      const startTime = Date.now();

      // Create multiple lessons efficiently (sequentially to avoid write conflicts)
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await LessonService.createLesson(
          {
            title: `Bulk Lesson ${i}`,
            description: `Lesson ${i} description`,
            course: testCourse._id,
            instructor: testInstructor._id,
            order: i + 10,
            type: "text",
            content: {
              textContent: `Content for lesson ${i} which needs to be at least 50 characters long for validation`,
            },
            estimatedTime: 5,
          },
          testInstructor._id.toString()
        );
        results.push(result);
      }
      const endTime = Date.now();

      // All should succeed
      results.forEach((result) => {
        expect(result._id).toBeDefined();
      });

      // Should complete reasonably quickly
      expect(endTime - startTime).toBeLessThan(5000);

      // Cleanup
      for (const result of results) {
        if (result._id) {
          await Lesson.findByIdAndDelete(result._id);
        }
      }
    });

    test("should use database indexes for efficient queries", async () => {
      const startTime = Date.now();

      // Query that should use indexes
      await LessonService.getLessons(
        testCourse._id,
        testInstructor._id.toString(),
        "instructor"
      );
      await ExamService.getExams(
        testCourse._id,
        testInstructor._id.toString(),
        "instructor"
      );
      await UserService.getInstructors({});

      const endTime = Date.now();

      // Should complete quickly with proper indexing
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
