const AnalyticsService = require("../services/AnalyticsService");
const { handleErrorResponse, sendListResponse, sendSuccessResponse } = require("../utils/errorHandler");

/**
 * Controller for handling analytics-related operations.
 * Provides methods to retrieve analytics data for courses, students, and instructors.
 *
 * @module AnalyticsController
 */

class AnalyticsController {
  /**
   * Get top performing courses.
   * Retrieves a list of courses with the highest performance metrics.
   *
   * @static
   * @async
   * @function getTopPerformingCourses
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a list of top performing courses in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getTopPerformingCourses(req, res) {
    try {
      const courses = await AnalyticsService.getTopPerformingCourses();
      return sendListResponse(res, courses, "Top performing courses retrieved successfully");
    } catch (error) {
      console.error("Error in getTopPerformingCourses:", error);
      handleErrorResponse(error, res, "Failed to retrieve top performing courses");
    }
  }

  /**
   * Get student progress analytics.
   * Retrieves analytics data related to student progress.
   *
   * @static
   * @async
   * @function getStudentProgressAnalytics
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends student progress analytics data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getStudentProgressAnalytics(req, res) {
    try {
      const progressData = await AnalyticsService.getStudentProgressAnalytics();
      return sendListResponse(res, progressData, "Student progress analytics retrieved successfully");
    } catch (error) {
      console.error("Error in getStudentProgressAnalytics:", error);
      handleErrorResponse(error, res, "Failed to retrieve student progress analytics");
    }
  }

  /**
   * Get instructor analytics.
   * Retrieves analytics data related to instructors.
   *
   * @static
   * @async
   * @function getInstructorAnalytics
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends instructor analytics data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getInstructorAnalytics(req, res) {
    try {
      const instructorData = await AnalyticsService.getInstructorAnalytics();
      return sendListResponse(res, instructorData, "Instructor analytics retrieved successfully");
    } catch (error) {
      console.error("Error in getInstructorAnalytics:", error);
      handleErrorResponse(error, res, "Failed to retrieve instructor analytics");
    }
  }

  /**
   * Get course completion trends.
   * Retrieves analytics data related to course completion trends.
   *
   * @static
   * @async
   * @function getCourseCompletionTrends
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends course completion trends data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getCourseCompletionTrends(req, res) {
    try {
      const trendsData = await AnalyticsService.getCourseCompletionTrends();
      return sendListResponse(res, trendsData, "Course completion trends retrieved successfully");
    } catch (error) {
      console.error("Error in getCourseCompletionTrends:", error);
      handleErrorResponse(error, res, "Failed to retrieve course completion trends");
    }
  }

  /**
   * Get exam performance analysis.
   * Retrieves analytics data related to exam performance.
   *
   * @static
   * @async
   * @function getExamPerformanceAnalysis
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends exam performance analysis data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getExamPerformanceAnalysis(req, res) {
    try {
      const examData = await AnalyticsService.getExamPerformanceAnalysis();
      return sendListResponse(res, examData, "Exam performance analysis retrieved successfully");
    } catch (error) {
      console.error("Error in getExamPerformanceAnalysis:", error);
      handleErrorResponse(error, res, "Failed to retrieve exam performance analysis");
    }
  }

  /**
   * Get platform overview statistics.
   * Retrieves overall statistics and analytics for the platform.
   *
   * @static
   * @async
   * @function getPlatformOverview
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends platform overview statistics in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getPlatformOverview(req, res) {
    try {
      const overviewData = await AnalyticsService.getPlatformOverview();
      return sendSuccessResponse(res, overviewData, "Platform overview retrieved successfully");
    } catch (error) {
      console.error("Error in getPlatformOverview:", error);
      handleErrorResponse(error, res, "Failed to retrieve platform overview");
    }
  }

  /**
   * Get filtered analytics based on date range and criteria.
   * Retrieves analytics data filtered by the specified date range and other criteria.
   *
   * @static
   * @async
   * @function getFilteredAnalytics
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends filtered analytics data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getFilteredAnalytics(req, res) {
    try {
      const { startDate, endDate, category, level, type } = req.query;
      const result = await AnalyticsService.getFilteredAnalytics({
        startDate,
        endDate,
        category,
        level,
        type,
      });
      return sendListResponse(res, result, "Filtered analytics retrieved successfully");
    } catch (error) {
      console.error("Error in getFilteredAnalytics:", error);
      handleErrorResponse(error, res, "Failed to retrieve filtered analytics");
    }
  }

  /**
   * Get instructor-specific enrollment data.
   * Retrieves enrollment data for courses taught by the authenticated instructor.
   *
   * @static
   * @async
   * @function getInstructorEnrollments
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends instructor-specific enrollment data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getInstructorEnrollments(req, res) {
    try {
      const instructorId = req.user.id;
      const enrollments = await AnalyticsService.getInstructorEnrollments(instructorId);
      return sendListResponse(res, enrollments, "Instructor enrollments retrieved successfully");
    } catch (error) {
      console.error("Error in getInstructorEnrollments:", error);
      handleErrorResponse(error, res, "Failed to retrieve instructor enrollments");
    }
  }

  /**
   * Get instructor dashboard overview.
   * Retrieves overview statistics and analytics for the instructor's dashboard.
   *
   * @static
   * @async
   * @function getInstructorDashboardOverview
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends instructor dashboard overview data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getInstructorDashboardOverview(req, res) {
    try {
      const instructorId = req.user.id;
      const overview = await AnalyticsService.getInstructorDashboardOverview(instructorId);
      return sendSuccessResponse(res, overview, "Instructor dashboard overview retrieved successfully");
    } catch (error) {
      console.error("Error in getInstructorDashboardOverview:", error);
      handleErrorResponse(error, res, "Failed to retrieve instructor dashboard overview");
    }
  }

  /**
   * Get instructor's student progress analytics.
   * Retrieves student progress analytics data for the instructor's students.
   *
   * @static
   * @async
   * @function getInstructorStudentProgress
   * @memberof AnalyticsController
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends instructor's student progress analytics data in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getInstructorStudentProgress(req, res) {
    try {
      const instructorId = req.user.id;
      const progressData = await AnalyticsService.getInstructorStudentProgress(instructorId);
      return sendListResponse(res, progressData, "Instructor student progress retrieved successfully");
    } catch (error) {
      console.error("Error in getInstructorStudentProgress:", error);
      handleErrorResponse(error, res, "Failed to retrieve instructor student progress");
    }
  }
}

module.exports = AnalyticsController;
