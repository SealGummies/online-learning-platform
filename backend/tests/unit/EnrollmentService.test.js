const mongoose = require("mongoose");
const EnrollmentService = require("../../services/EnrollmentService");
const CourseService = require("../../services/CourseService");
const User = require("../../models/User");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");

describe("EnrollmentService Unit Tests", () => {
    let testStudent, testCourse, testEnrollment;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/online-learning-test");
        }
        testStudent = await User.create({
            firstName: "Student",
            lastName: "Test",
            email: `student-enroll-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        });
        const instructor = await User.create({
            firstName: "Instructor",
            lastName: "Test",
            email: `instructor-enroll-${Date.now()}@example.com`,
            password: "testpassword",
            role: "instructor",
        });
        testCourse = await Course.create({
            title: "Enrollment Test Course",
            description: "Course for enrollment unit test",
            instructor: instructor._id,
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        });
    });

    afterEach(async () => {
        if (testEnrollment) {
            await Enrollment.findByIdAndDelete(testEnrollment._id);
            testEnrollment = null;
        }
    });

    afterAll(async () => {
        if (testStudent) await User.findByIdAndDelete(testStudent._id);
        if (testCourse) await Course.findByIdAndDelete(testCourse._id);
        await mongoose.connection.close();
    });

    test("should enroll student and get enrollments", async () => {
        // 通过 CourseService 报名
        const result = await CourseService.enrollStudent(testCourse._id, testStudent._id);
        testEnrollment = result.enrollment;
        const enrollments = await EnrollmentService.getStudentEnrollments(testStudent._id);
        expect(Array.isArray(enrollments)).toBe(true);
        expect(enrollments.length).toBeGreaterThan(0);
        expect(enrollments[0].student.toString()).toBe(testStudent._id.toString());
    });

    test("should get enrollment by id", async () => {
        const result = await CourseService.enrollStudent(testCourse._id, testStudent._id);
        testEnrollment = result.enrollment;
        const found = await EnrollmentService.getEnrollmentById(testEnrollment._id, testStudent._id.toString());
        expect(found._id.toString()).toBe(testEnrollment._id.toString());
    });

    test("should update progress", async () => {
        const result = await CourseService.enrollStudent(testCourse._id, testStudent._id);
        testEnrollment = result.enrollment;
        const updated = await EnrollmentService.updateProgress(testEnrollment._id, { completionPercentage: 100, status: "completed" }, testStudent._id.toString());
        expect(updated.enrollment.completionPercentage).toBe(100);
        expect(updated.enrollment.status).toBe("completed");
    });

    test("should withdraw enrollment", async () => {
        const result = await CourseService.enrollStudent(testCourse._id, testStudent._id);
        testEnrollment = result.enrollment;
        const withdrawn = await EnrollmentService.withdrawEnrollment(testEnrollment._id, testStudent._id.toString());
        expect(withdrawn.enrollment.status).toBe("dropped");
    });

    test("should get student stats", async () => {
        const result = await CourseService.enrollStudent(testCourse._id, testStudent._id);
        testEnrollment = result.enrollment;
        const stats = await EnrollmentService.getStudentStats(testStudent._id);
        expect(stats.total).toBeGreaterThanOrEqual(1);
        expect(stats.enrolled + stats.completed + stats["in-progress"] + stats.dropped).toBe(stats.total);
    });
}); 