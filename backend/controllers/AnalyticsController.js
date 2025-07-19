const AnalyticsService = require("../services/AnalyticsService");

class AnalyticsController {
  /**
   * Get top performing courses
   * @route GET /api/analytics/top-courses
   * @access Private (Admin/Instructor)
   */
  static async getTopPerformingCourses(req, res) {
    try {
      const courses = await AnalyticsService.getTopPerformingCourses();
      res.status(200).json({
        success: true,
        message: "Top performing courses retrieved successfully",
        data: courses,
        total: courses.length,
      });
    } catch (error) {
      console.error("Error in getTopPerformingCourses:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve top performing courses",
        error: error.message,
      });
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
      res.status(200).json({
        success: true,
        message: "Student progress analytics retrieved successfully",
        data: progressData,
        total: progressData.length,
      });
    } catch (error) {
      console.error("Error in getStudentProgressAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve student progress analytics",
        error: error.message,
      });
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
      res.status(200).json({
        success: true,
        message: "Instructor analytics retrieved successfully",
        data: instructorData,
        total: instructorData.length,
      });
    } catch (error) {
      console.error("Error in getInstructorAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor analytics",
        error: error.message,
      });
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
      res.status(200).json({
        success: true,
        message: "Course completion trends retrieved successfully",
        data: trendsData,
        total: trendsData.length,
      });
    } catch (error) {
      console.error("Error in getCourseCompletionTrends:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve course completion trends",
        error: error.message,
      });
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
      res.status(200).json({
        success: true,
        message: "Exam performance analysis retrieved successfully",
        data: examData,
        total: examData.length,
      });
    } catch (error) {
      console.error("Error in getExamPerformanceAnalysis:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve exam performance analysis",
        error: error.message,
      });
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
      res.status(200).json({
        success: true,
        message: "Platform overview retrieved successfully",
        data: overviewData,
      });
    } catch (error) {
      console.error("Error in getPlatformOverview:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve platform overview",
        error: error.message,
      });
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
      const result = await AnalyticsService.getFilteredAnalytics({ startDate, endDate, category, level, type });
      res.status(200).json({
        success: true,
        message: "Filtered analytics retrieved successfully",
        data: result,
        total: result.length,
      });
    } catch (error) {
      console.error("Error in getFilteredAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve filtered analytics",
        error: error.message,
      });
    }
  }
}

module.exports = AnalyticsController;
