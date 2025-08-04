const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionService = require("./TransactionService");
const PopulateConfig = require("../config/populateConfig");

class ExamService {
  /**
   * Retrieve exams for a specific course based on user role.
   * @param {string} courseId - ID of the course to fetch exams for.
   * @param {string} userId - ID of the requesting user.
   * @param {string} userRole - Role of the requesting user (student, instructor, admin).
   * @returns {Promise<Array<Object>>} List of exam documents.
   * @throws {Error} If courseId missing, course not found, access denied, or other errors.
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
    // Check user role and permissions
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: { $in: ["enrolled", "in-progress", "completed"] },
      });
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view exams");
      }
      // Only return published exams
      return await Exam.find({
        course: courseId,
        isPublished: true,
        isActive: true,
      }).populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor");
    } else if (userRole === "instructor") {
      if (course.instructor.toString() !== userId) {
        throw new Error("Access denied. You can only view exams for your own courses.");
      }
      return await Exam.find({ course: courseId }).populate(
        "course",
        PopulateConfig.helpers.getCourseFields("basic") + " instructor"
      );
    } else if (userRole === "admin") {
      return await Exam.find({ course: courseId }).populate(
        "course",
        PopulateConfig.helpers.getCourseFields("basic") + " instructor"
      );
    }
    throw new Error("Access denied");
  }

  /**
   * Retrieve all published exams for a student across enrolled courses.
   * @param {string} userId - ID of the student user.
   * @returns {Promise<Array<Object>>} List of published exam documents.
   */
  static async getAllExamsForStudent(userId) {
    // Get all enrollments for the student
    const enrollments = await Enrollment.find({
      student: userId,
      status: { $in: ["enrolled", "in-progress", "completed"] },
    }).populate("course", PopulateConfig.helpers.getCourseFields("basic"));

    const courseIds = enrollments.map((enrollment) => enrollment.course._id);

    // Get all published exams for enrolled courses
    return await Exam.find({
      course: { $in: courseIds },
      isPublished: true,
      isActive: true,
    }).populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor");
  }

  /**
   * Get a specific exam by ID with access control.
   * @param {string} examId - ID of the exam to retrieve.
   * @param {string} userId - ID of the requesting user.
   * @param {string} userRole - Role of the requesting user (student, instructor, admin).
   * @returns {Promise<Object>} Exam document.
   * @throws {Error} If exam not found, not enrolled, not published, or access denied.
   */
  static async getExamById(examId, userId, userRole) {
    const exam = await Exam.findById(examId).populate(
      "course",
      PopulateConfig.helpers.getCourseFields("basic") + " instructor"
    );
    if (!exam) {
      throw new Error("Exam not found");
    }
    // Check user role and permissions
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: exam.course._id,
        status: { $in: ["enrolled", "in-progress", "completed"] },
      });
      if (!enrollment) {
        throw new Error("You must be enrolled in this course to view this exam");
      }
      if (!exam.isPublished) {
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
   * Submit answers for an exam and calculate results.
   * @param {string} examId - ID of the exam being submitted.
   * @param {Object} answers - Key-value map of question IDs to student answers.
   * @param {string} userId - ID of the student submitting the exam.
   * @returns {Promise<Object>} Exam result object including score, percentage, and question results.
   * @throws {Error} If exam not found, not enrolled, not published, or time constraints violated.
   */
  static async submitExam(examId, answers, userId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course", PopulateConfig.helpers.getCourseFields("basic"))
        .session(session);
      if (!exam) {
        throw new Error("Exam not found");
      }

      // Check if student is enrolled
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: exam.course._id,
        status: { $in: ["enrolled", "in-progress", "completed"] },
      }).session(session);

      if (!enrollment) {
        throw new Error("You must be enrolled in this course to take this exam");
      }

      if (!exam.isPublished) {
        throw new Error("This exam is not yet available");
      }

      // Check time constraints
      const now = new Date();
      if (exam.startDate && now < exam.startDate) {
        throw new Error("This exam has not started yet");
      }
      if (exam.endDate && now > exam.endDate) {
        throw new Error("This exam has expired");
      }

      // Calculate score
      let score = 0;
      const questionResults = [];

      exam.questions.forEach((question, index) => {
        const studentAnswer = answers[question._id];
        const isCorrect = studentAnswer === question.correctAnswer;

        if (isCorrect) {
          score += question.points;
        }

        questionResults.push({
          questionId: question._id,
          text: question.text,
          correctAnswer: question.correctAnswer,
          yourAnswer: studentAnswer,
          correct: isCorrect,
          points: question.points,
        });
      });

      const percentage = Math.round((score / exam.totalPoints) * 100);

      // Create exam result (you might want to create an ExamResult model)
      const result = {
        exam: examId,
        student: userId,
        course: exam.course._id,
        score: score,
        totalPoints: exam.totalPoints,
        percentage: percentage,
        answers: answers,
        questionResults: questionResults,
        submittedAt: now,
        timeTaken: 0, // You can calculate this if you track start time
      };

      // For now, we'll return the result directly
      // In a real implementation, you'd save this to a database
      return result;
    });
  }

  /**
   * Get exam results for a specific student.
   * @param {string} examId - ID of the exam.
   * @param {string} userId - ID of the student.
   * @returns {Promise<Object>} Exam result object or mock data.
   * @throws {Error} If exam not found or student not enrolled.
   */
  static async getExamResults(examId, userId) {
    const exam = await Exam.findById(examId).populate("course", PopulateConfig.helpers.getCourseFields("basic"));
    if (!exam) {
      throw new Error("Exam not found");
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: exam.course._id,
      status: { $in: ["enrolled", "in-progress"] },
    });

    if (!enrollment) {
      throw new Error("You must be enrolled in this course to view results");
    }

    // For now, return a mock result
    // In a real implementation, you'd fetch from ExamResult collection
    return {
      exam: exam,
      score: 0,
      totalPoints: exam.totalPoints,
      percentage: 0,
      submittedAt: new Date(),
      timeTaken: "N/A",
    };
  }

  /**
   * Retrieve all exam results for a student across courses.
   * @param {string} userId - ID of the student.
   * @returns {Promise<Array<Object>>} List of exam result objects (mock implementation).
   */
  static async getAllExamResults(userId) {
    // Get all enrollments for the student
    const enrollments = await Enrollment.find({
      student: userId,
      status: { $in: ["enrolled", "in-progress"] },
    }).populate("course", PopulateConfig.helpers.getCourseFields("basic"));

    const courseIds = enrollments.map((enrollment) => enrollment.course._id);

    // Get all exams for enrolled courses
    const exams = await Exam.find({
      course: { $in: courseIds },
      isPublished: true,
    }).populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor");

    // For now, return mock results
    // In a real implementation, you'd fetch from ExamResult collection
    return exams.map((exam) => ({
      exam: exam,
      score: 0,
      totalPoints: exam.totalPoints,
      percentage: 0,
      submittedAt: new Date(),
      timeTaken: "N/A",
    }));
  }

  /**
   * Create a new exam under an instructor's course.
   * @param {Object} examData - Exam details including title, description, type, questions, and schedule.
   * @param {string} instructorId - ID of the instructor creating the exam.
   * @returns {Promise<Object>} Created exam document.
   * @throws {Error} If validation fails or instructor unauthorized.
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
      if (!examData.questions || examData.questions.length === 0) {
        throw new Error("Exam must have at least one question");
      }

      // Create exam
      const exam = new Exam({
        title: examData.title,
        description: examData.description,
        course: course._id,
        type: examData.type,
        questions: examData.questions,
        duration: examData.duration || 60,
        startDate: examData.startDate || null,
        endDate: examData.endDate || null,
        isPublished: examData.isPublished || false,
        isActive: examData.isActive !== false,
        allowRetake: examData.allowRetake || false,
        maxAttempts: examData.maxAttempts || 1,
        instructions: examData.instructions || "",
      });

      await exam.save({ session });
      return exam;
    });
  }

  /**
   * Update an existing exam's details.
   * @param {string} examId - ID of the exam to update.
   * @param {Object} updateData - Fields to update on the exam.
   * @param {string} instructorId - ID of the instructor updating the exam.
   * @returns {Promise<Object>} Updated exam document.
   * @throws {Error} If exam not found, validation fails, or unauthorized.
   */
  static async updateExam(examId, updateData, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor")
        .session(session);
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
   * Delete an exam owned by an instructor.
   * @param {string} examId - ID of the exam to delete.
   * @param {string} instructorId - ID of the instructor requesting deletion.
   * @returns {Promise<Object>} Message confirming deletion.
   * @throws {Error} If exam not found or unauthorized.
   */
  static async deleteExam(examId, instructorId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const exam = await Exam.findById(examId)
        .populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor")
        .session(session);
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

  /**
   * Get basic exam statistics for an instructor.
   * @param {string} examId - ID of the exam to analyze.
   * @param {string} instructorId - ID of the instructor requesting stats.
   * @returns {Promise<Object>} Statistics including total students, average, highest, and lowest scores.
   * @throws {Error} If exam not found or unauthorized.
   */
  static async getExamStats(examId, instructorId) {
    const exam = await Exam.findById(examId).populate(
      "course",
      PopulateConfig.helpers.getCourseFields("basic") + " instructor"
    );
    if (!exam) {
      throw new Error("Exam not found");
    }
    if (exam.course.instructor.toString() !== instructorId) {
      throw new Error("You can only view statistics for your own exams");
    }

    // For now, return basic stats
    // In a real implementation, you'd calculate from ExamResult collection
    return {
      examId: examId,
      totalStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      completionRate: 0,
    };
  }
}

module.exports = ExamService;
