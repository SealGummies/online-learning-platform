const AnalyticsService = require("../services/AnalyticsService");
const { handleErrorResponse, sendListResponse, sendSuccessResponse } = require("../utils/errorHandler");

class AnalyticsController {
  /**
   * Get top performing courses
   * @route GET /api/analytics/top-courses
   * @access Private (Admin/Instructor)
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
   * Get student progress analytics
   * @route GET /api/analytics/student-progress
   * @access Private (Admin/Instructor)
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
   * Get instructor analytics
   * @route GET /api/analytics/instructor-analytics
   * @access Private (Admin)
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
   * Get course completion trends
   * @route GET /api/analytics/completion-trends
   * @access Private (Admin/Instructor)
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
   * Get exam performance analysis
   * @route GET /api/analytics/exam-performance
   * @access Private (Admin/Instructor)
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
   * Get platform overview statistics
   * @route GET /api/analytics/platform-overview
   * @access Private (Admin)
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
   * Get filtered analytics based on date range and criteria
   * @route GET /api/analytics/filtered
   * @access Private (Admin/Instructor)
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
   * Get instructor-specific enrollment data
   * @route GET /api/analytics/instructor/enrollments
   * @access Private (Instructor)
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
   * Get instructor dashboard overview
   * @route GET /api/analytics/instructor/overview
   * @access Private (Instructor)
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
   * Get instructor's student progress analytics
   * @route GET /api/analytics/instructor/student-progress
   * @access Private (Instructor)
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
