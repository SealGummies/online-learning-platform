const ExamService = require("../services/ExamService");
const {
  handleErrorResponse,
  sendSuccessResponse,
  sendListResponse,
  sendCreatedResponse,
  sendMessageResponse,
} = require("../utils/errorHandler");

/**
 * Controller for handling exam-related operations.
 * Provides methods for retrieving, creating, updating, and managing exams.
 *
 * @module ExamController
 */

class ExamController {
  /**
   * Get exams for a course or for a student.
   * Retrieves a list of exams for a specific course or all exams for a student across enrolled courses.
   *
   * @static
   * @async
   * @function getExams
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Query parameters.
   * @param {string} [req.query.course] - Course ID to filter exams.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - User ID.
   * @param {string} req.user.role - User role (student, instructor, admin).
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a list of exams in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getExams(req, res) {
    try {
      const { course } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      let exams;
      if (course) {
        // Get exams for specific course
        exams = await ExamService.getExams(course, userId, userRole);
      } else if (userRole === "student") {
        // Get all exams for student across all enrolled courses
        exams = await ExamService.getAllExamsForStudent(userId);
      } else {
        throw new Error("Course parameter is required for non-student users");
      }

      return sendListResponse(res, exams, "Exams retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve exams");
    }
  }

  /**
   * Get exam by ID.
   * Retrieves a single exam by its ID for the authenticated user.
   *
   * @static
   * @async
   * @function getExamById
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Exam ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - User ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the exam details in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getExamById(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;
      const exam = await ExamService.getExamById(examId, userId, userRole);
      return sendSuccessResponse(res, exam, "Exam retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve exam");
    }
  }

  /**
   * Submit exam answers.
   * Submits a student's answers for an exam and calculates the result.
   *
   * @static
   * @async
   * @function submitExam
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Exam ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} req.body - Request body containing the answers.
   * @param {Object} req.body.answers - Student's answers.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the exam submission result in the response.
   * @throws {Error} If submission fails.
   */
  static async submitExam(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const { answers } = req.body;

      if (!answers || typeof answers !== "object") {
        const { AppError } = require("../utils/errors");
        throw new AppError("Answers are required", 400);
      }

      const result = await ExamService.submitExam(examId, answers, userId);
      return sendSuccessResponse(res, result, "Exam submitted successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to submit exam");
    }
  }

  /**
   * Get exam results for a student.
   * Retrieves the results of a specific exam for the authenticated student.
   *
   * @static
   * @async
   * @function getExamResults
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Exam ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the exam results in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getExamResults(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const result = await ExamService.getExamResults(examId, userId);
      return sendSuccessResponse(res, result, "Exam results retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve exam results");
    }
  }

  /**
   * Get all exam results for a student.
   * Retrieves all exam results for the authenticated student.
   *
   * @static
   * @async
   * @function getAllExamResults
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a list of all exam results in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getAllExamResults(req, res) {
    try {
      const userId = req.user.id;
      const results = await ExamService.getAllExamResults(userId);
      return sendListResponse(res, results, "Exam results retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve all exam results");
    }
  }

  /**
   * Create a new exam.
   * Creates a new exam for a course.
   *
   * @static
   * @async
   * @function createExam
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Instructor ID.
   * @param {Object} req.body - Request body containing exam data.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the created exam in the response.
   * @throws {Error} If creation fails.
   */
  static async createExam(req, res) {
    try {
      const instructorId = req.user.id;
      const examData = req.body;
      const exam = await ExamService.createExam(examData, instructorId);
      return sendCreatedResponse(res, exam, "Exam created successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to create exam");
    }
  }

  /**
   * Update an exam.
   * Updates an existing exam.
   *
   * @static
   * @async
   * @function updateExam
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Exam ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Instructor ID.
   * @param {Object} req.body - Request body containing update data.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the updated exam in the response.
   * @throws {Error} If update fails.
   */
  static async updateExam(req, res) {
    try {
      const examId = req.params.id;
      const instructorId = req.user.id;
      const updateData = req.body;
      const exam = await ExamService.updateExam(examId, updateData, instructorId);
      return sendSuccessResponse(res, exam, "Exam updated successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to update exam");
    }
  }

  /**
   * Delete an exam.
   * Deletes an existing exam.
   *
   * @static
   * @async
   * @function deleteExam
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Exam ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Instructor ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a success message in the response.
   * @throws {Error} If deletion fails.
   */
  static async deleteExam(req, res) {
    try {
      const examId = req.params.id;
      const instructorId = req.user.id;
      await ExamService.deleteExam(examId, instructorId);
      return sendMessageResponse(res, "Exam deleted successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to delete exam");
    }
  }

  /**
   * Get exam statistics.
   * Retrieves statistics for a specific exam, such as average score, completion rate, etc.
   *
   * @static
   * @async
   * @function getExamStats
   * @memberof ExamController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Exam ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Instructor ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the exam statistics in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getExamStats(req, res) {
    try {
      const examId = req.params.id;
      const instructorId = req.user.id;
      const stats = await ExamService.getExamStats(examId, instructorId);
      return sendSuccessResponse(res, stats, "Exam statistics retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve exam statistics");
    }
  }
}

module.exports = ExamController;
