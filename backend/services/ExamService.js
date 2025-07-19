const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionService = require("./TransactionService");

class ExamService {
  /**
   * Get exams for a course
   */
  static async getExams(courseId, userId, userRole) {
    if (!courseId) {
      throw new Error("Course ID is required");
    }
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    // 权限判断
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: { $in: ["enrolled", "in-progress"] },
      });
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view exams");
      }
      // 只返回激活考试
      return await Exam.find({ course: courseId, isActive: true });
    } else if (userRole === "instructor") {
      if (course.instructor.toString() !== userId) {
        throw new Error("Access denied. You can only view exams for your own courses.");
      }
      return await Exam.find({ course: courseId });
    } else if (userRole === "admin") {
      return await Exam.find({ course: courseId });
    }
    throw new Error("Access denied");
  }

  /**
   * Get exam by ID
   */
  static async getExamById(examId, userId, userRole) {
    const exam = await Exam.findById(examId).populate("course", "title instructor");
    if (!exam) {
      throw new Error("Exam not found");
    }
    // 权限判断
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: exam.course._id,
        status: { $in: ["enrolled", "in-progress"] },
      });
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view this exam");
      }
      if (!exam.isActive) {
        throw new Error("This exam is not yet available");
      }
      return exam;
    } else if (userRole === "instructor") {
      if (exam.course.instructor.toString() !== userId) {
        throw new Error("Access denied. You can only view exams for your own courses.");
      }
      return exam;
    } else if (userRole === "admin") {
      return exam;
    }
    throw new Error("Access denied");
  }

  /**
   * Create a new exam
   */
  static async createExam(examData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      // Verify that the instructor owns the course
      const course = await Course.findById(examData.course).session(session);
      if (!course) {
        throw new Error("Course not found");
      }
      if (course.instructor.toString() !== instructorId) {
        throw new Error("You can only create exams for your own courses");
      }
      // Validate exam data
      if (!examData.title || examData.title.length < 5) {
        throw new Error("Exam title must be at least 5 characters long");
      }
      if (!examData.description || examData.description.length < 10) {
        throw new Error("Exam description must be at least 10 characters long");
      }
      if (!examData.type || !["quiz", "midterm", "final", "assignment"].includes(examData.type)) {
        throw new Error("Invalid exam type");
      }
      // Create exam
      const exam = new Exam({
        title: examData.title,
        description: examData.description,
        course: course._id,
        type: examData.type,
        isActive: true,
      });
      await exam.save({ session });
      return exam;
    });
  }

  /**
   * Update an exam
   */
  static async updateExam(examId, updateData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId).populate("course").session(session);
      if (!exam) {
        throw new Error("Exam not found");
      }
      if (exam.course.instructor.toString() !== instructorId) {
        throw new Error("You can only update your own exams");
      }
      if (updateData.title && updateData.title.length < 5) {
        throw new Error("Exam title must be at least 5 characters long");
      }
      if (updateData.description && updateData.description.length < 10) {
        throw new Error("Exam description must be at least 10 characters long");
      }
      if (updateData.type && !["quiz", "midterm", "final", "assignment"].includes(updateData.type)) {
        throw new Error("Invalid exam type");
      }
      Object.assign(exam, updateData);
      await exam.save({ session });
      return exam;
    });
  }

  /**
   * Delete an exam
   */
  static async deleteExam(examId, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId).populate("course").session(session);
      if (!exam) {
        throw new Error("Exam not found");
      }
      if (exam.course.instructor.toString() !== instructorId) {
        throw new Error("You can only delete your own exams");
      }
      await Exam.findByIdAndDelete(examId).session(session);
      return { message: "Exam deleted successfully" };
    });
  }
}

module.exports = ExamService;
