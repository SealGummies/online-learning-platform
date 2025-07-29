const mongoose = require("mongoose");
const CourseService = require("../../services/CourseService");
const User = require("../../models/User");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");

describe("CourseService Unit Tests", () => {
    let testInstructor, testStudent, testCourse, testEnrollment;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/online-learning-test");
        }
        testInstructor = await User.create({
            firstName: "Instructor",
            lastName: "Test",
            email: `instructor-${Date.now()}@example.com`,
            password: "testpassword",
            role: "instructor",
        });
        testStudent = await User.create({
            firstName: "Student",
            lastName: "Test",
            email: `student-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        });
    });

    afterEach(async () => {
        if (testEnrollment) {
            await Enrollment.findByIdAndDelete(testEnrollment._id);
            testEnrollment = null;
        }
        if (testCourse) {
            await Course.findByIdAndDelete(testCourse._id);
            testCourse = null;
        }
    });

    afterAll(async () => {
        if (testInstructor) await User.findByIdAndDelete(testInstructor._id);
        if (testStudent) await User.findByIdAndDelete(testStudent._id);
        await mongoose.connection.close();
    });

    test("should create a new course", async () => {
        const courseData = {
            title: "Test Course",
            description: "Course for unit test",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        testCourse = course;
        expect(course.title).toBe(courseData.title);
        expect(course.instructor.firstName).toBe("Instructor");
    });

    test("should get course by id", async () => {
        const courseData = {
            title: "Test Course 2",
            description: "Course for unit test 2",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        testCourse = course;
        const found = await CourseService.getCourseById(course._id);
        expect(found.title).toBe(courseData.title);
    });

    test("should enroll student in course", async () => {
        const courseData = {
            title: "Enroll Course",
            description: "Course for enrollment",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        testCourse = course;
        const result = await CourseService.enrollStudent(course._id, testStudent._id);
        testEnrollment = result.enrollment;
        expect(result.enrollment.student._id.toString()).toBe(testStudent._id.toString());
        expect(result.enrollment.course._id.toString()).toBe(course._id.toString());
    });

    test("should not enroll student twice", async () => {
        const courseData = {
            title: "Enroll Course 2",
            description: "Course for enrollment 2",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        testCourse = course;
        await CourseService.enrollStudent(course._id, testStudent._id);
        await expect(CourseService.enrollStudent(course._id, testStudent._id)).rejects.toThrow();
    });

    test("should update course", async () => {
        const courseData = {
            title: "Update Course",
            description: "Course for update",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        testCourse = course;
        const updated = await CourseService.updateCourse(course._id, { title: "Updated Title" }, testInstructor._id.toString());
        expect(updated.title).toBe("Updated Title");
    });

    test("should delete course", async () => {
        const courseData = {
            title: "Delete Course",
            description: "Course for delete",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        const result = await CourseService.deleteCourse(course._id, testInstructor._id.toString());
        expect(result.message).toMatch(/deleted/i);
        const deleted = await Course.findById(course._id);
        expect(deleted).toBeNull();
    });

    test("should get course stats", async () => {
        const courseData = {
            title: "Stats Course",
            description: "Course for stats",
            category: "Programming",
            level: "Beginner",
            price: 99.99,
        };
        const course = await CourseService.createCourse(courseData, testInstructor._id);
        testCourse = course;
        const stats = await CourseService.getCourseStats(course._id);
        expect(stats.course.title).toBe(courseData.title);
        expect(stats.totalEnrollments).toBeDefined();
    });
}); 