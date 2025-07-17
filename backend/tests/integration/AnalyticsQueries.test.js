jest.setTimeout(30000);
const mongoose = require("mongoose");
const AnalyticsService = require("../../services/AnalyticsService");
const User = require("../../models/User");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Exam = require("../../models/Exam");

describe("AnalyticsService advanced aggregation queries integration test", () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(
                process.env.MONGODB_URI || "mongodb://localhost:27017/online-learning-test"
            );
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("1. getTopPerformingCourses returns top courses aggregation result", async () => {
        const result = await AnalyticsService.getTopPerformingCourses();
        console.log("Top Performing Courses:", JSON.stringify(result, null, 2));
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("title");
            expect(result[0]).toHaveProperty("enrollmentCount");
            expect(result[0]).toHaveProperty("averageGrade");
        }
    });

    test("2. getStudentProgressAnalytics returns student progress aggregation result", async () => {
        const result = await AnalyticsService.getStudentProgressAnalytics();
        console.log("Student Progress Analytics:", JSON.stringify(result, null, 2));
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("studentName");
            expect(result[0]).toHaveProperty("courseName");
            expect(result[0]).toHaveProperty("progress");
        }
    });

    test("3. getInstructorAnalytics returns instructor analytics aggregation result", async () => {
        const result = await AnalyticsService.getInstructorAnalytics();
        console.log("Instructor Analytics:", JSON.stringify(result, null, 2));
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("instructorName");
            expect(result[0]).toHaveProperty("totalCourses");
            expect(result[0]).toHaveProperty("totalEnrollments");
        }
    });

    test("4. getCourseCompletionTrends returns course completion trends aggregation result", async () => {
        const result = await AnalyticsService.getCourseCompletionTrends();
        console.log("Course Completion Trends:", JSON.stringify(result, null, 2));
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("_id");
            expect(result[0]).toHaveProperty("completions");
            expect(result[0]).toHaveProperty("averageCompletionTime");
        }
    });

    test("5. getExamPerformanceAnalysis returns exam performance analysis aggregation result", async () => {
        const result = await AnalyticsService.getExamPerformanceAnalysis();
        console.log("Exam Performance Analysis:", JSON.stringify(result, null, 2));
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("courseName");
            expect(result[0]).toHaveProperty("examTitle");
            expect(result[0]).toHaveProperty("gradeDistribution");
        }
    });
}); 