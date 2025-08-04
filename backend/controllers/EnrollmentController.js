const EnrollmentService = require("../services/EnrollmentService");
const { handleErrorResponse, sendSuccessResponse, sendListResponse } = require("../utils/errorHandler");

/**
 * Enrollment Controller - Handles HTTP requests for enrollment operations (aligned with simplified models)
 */
class EnrollmentController {
  /**
   * Get student's enrollments
   * @route GET /api/enrollments
   * @access Private/Student
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
   * Get enrollment by ID
   * @route GET /api/enrollments/:id
   * @access Private/Student
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
   * Update enrollment progress (completionPercentage, finalGrade, status)
   * @route PUT /api/enrollments/:id/progress
   * @access Private/Student
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
   * Withdraw from course
   * @route POST /api/enrollments/:id/withdraw
   * @access Private/Student
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
   * Get student statistics
   * @route GET /api/enrollments/stats
   * @access Private/Student
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
   * Get instructor's course enrollments
   * @route GET /api/enrollments/instructor
   * @access Private/Instructor
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
