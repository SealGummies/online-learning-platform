const EnrollmentService = require("../services/EnrollmentService");
const { handleErrorResponse, sendSuccessResponse, sendListResponse } = require("../utils/errorHandler");

/**
 * Controller for handling enrollment-related operations.
 * Provides methods for retrieving, updating, and managing student enrollments.
 *
 * @module EnrollmentController
 */

/**
 * Enrollment Controller - Handles HTTP requests for enrollment operations (aligned with simplified models)
 */
class EnrollmentController {
  /**
   * Get student's enrollments.
   * Retrieves a list of enrollments for the authenticated student, optionally filtered and sorted.
   *
   * @static
   * @async
   * @function getStudentEnrollments
   * @memberof EnrollmentController
   * @param {Object} req - Express request object.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} req.query - Query parameters for filtering and sorting.
   * @param {string} [req.query.status] - Filter by enrollment status.
   * @param {string} [req.query.sortBy="enrollmentDate"] - Field to sort by.
   * @param {string} [req.query.sortOrder="desc"] - Sort order (asc/desc).
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a list of enrollments in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getStudentEnrollments(req, res) {
    try {
      const studentId = req.user.id;
      const options = {
        status: req.query.status,
        sortBy: req.query.sortBy || "enrollmentDate",
        sortOrder: req.query.sortOrder || "desc",
      };
      const enrollments = await EnrollmentService.getStudentEnrollments(studentId, options);
      return sendListResponse(res, enrollments, "Enrollments retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve enrollments");
    }
  }

  /**
   * Get enrollment by ID.
   * Retrieves a single enrollment by its ID for the authenticated student.
   *
   * @static
   * @async
   * @function getEnrollmentById
   * @memberof EnrollmentController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Enrollment ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the enrollment details in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getEnrollmentById(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
      const enrollment = await EnrollmentService.getEnrollmentById(id, studentId);
      return sendSuccessResponse(res, enrollment, "Enrollment retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve enrollment");
    }
  }

  /**
   * Update enrollment progress (completionPercentage, finalGrade, status).
   * Updates the progress of a student's enrollment.
   *
   * @static
   * @async
   * @function updateProgress
   * @memberof EnrollmentController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Enrollment ID.
   * @param {Object} req.body - Request body containing progress updates.
   * @param {number} [req.body.completionPercentage] - Updated completion percentage.
   * @param {string} [req.body.finalGrade] - Updated final grade.
   * @param {string} [req.body.status] - Updated enrollment status.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the updated enrollment in the response.
   * @throws {Error} If update fails.
   */
  static async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const progressData = req.body;
      const studentId = req.user.id;
      const result = await EnrollmentService.updateProgress(id, progressData, studentId);
      return sendSuccessResponse(res, result.enrollment, result.message);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to update enrollment progress");
    }
  }

  /**
   * Withdraw from course.
   * Allows a student to withdraw from an enrolled course.
   *
   * @static
   * @async
   * @function withdrawEnrollment
   * @memberof EnrollmentController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Enrollment ID.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the updated enrollment and a success message in the response.
   * @throws {Error} If withdrawal fails.
   */
  static async withdrawEnrollment(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
      const result = await EnrollmentService.withdrawEnrollment(id, studentId);
      return sendSuccessResponse(res, result.enrollment, result.message);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to withdraw from enrollment");
    }
  }

  /**
   * Get student statistics.
   * Retrieves statistics for the authenticated student, such as total enrollments, completed courses, etc.
   *
   * @static
   * @async
   * @function getStudentStats
   * @memberof EnrollmentController
   * @param {Object} req - Express request object.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Student ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the student statistics in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getStudentStats(req, res) {
    try {
      const studentId = req.user.id;
      const stats = await EnrollmentService.getStudentStats(studentId);
      return sendSuccessResponse(res, stats, "Student statistics retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve student statistics");
    }
  }

  /**
   * Get instructor's course enrollments.
   * Retrieves a list of enrollments for courses taught by the authenticated instructor.
   *
   * @static
   * @async
   * @function getInstructorEnrollments
   * @memberof EnrollmentController
   * @param {Object} req - Express request object.
   * @param {Object} req.user - Authenticated user object.
   * @param {string} req.user.id - Instructor ID.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a list of enrollments in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getInstructorEnrollments(req, res) {
    try {
      const instructorId = req.user.id;

      // Use the AnalyticsService method we created
      const AnalyticsService = require("../services/AnalyticsService");
      const enrollments = await AnalyticsService.getInstructorEnrollments(instructorId);

      return sendListResponse(res, enrollments, "Instructor enrollments retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve instructor enrollments");
    }
  }
}

module.exports = EnrollmentController;
