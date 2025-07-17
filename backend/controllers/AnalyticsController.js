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
        data: {
          topPerformingCourses: courses,
          total: courses.length,
        },
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
        data: {
          studentProgress: progressData,
          total: progressData.length,
        },
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
        data: {
          instructorAnalytics: instructorData,
          total: instructorData.length,
        },
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
        data: {
          completionTrends: trendsData,
          total: trendsData.length,
        },
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
        data: {
          examAnalysis: examData,
          total: examData.length,
        },
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
   * Get revenue analytics
   * @route GET /api/analytics/revenue
   * @access Private (Admin)
   */
  static async getRevenueAnalytics(req, res) {
    try {
      const revenueData = await AnalyticsService.getRevenueAnalytics();
      res.status(200).json({
        success: true,
        message: "Revenue analytics retrieved successfully",
        data: {
          revenueAnalytics: revenueData,
          total: revenueData.length,
        },
      });
    } catch (error) {
      console.error("Error in getRevenueAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve revenue analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   * @route GET /api/analytics/dashboard
   * @access Private (Admin)
   */
  static async getAnalyticsDashboard(req, res) {
    try {
      const [topCourses, platformOverview, completionTrends, revenueAnalytics] =
        await Promise.all([
          AnalyticsService.getTopPerformingCourses(),
          AnalyticsService.getPlatformOverview(),
          AnalyticsService.getCourseCompletionTrends(),
          AnalyticsService.getRevenueAnalytics(),
        ]);

      res.status(200).json({
        success: true,
        message: "Analytics dashboard data retrieved successfully",
        data: {
          topCourses: topCourses.slice(0, 5), // Top 5 courses for dashboard
          platformOverview,
          completionTrends: completionTrends.slice(0, 12), // Last 12 months
          revenueAnalytics: revenueAnalytics.slice(0, 12), // Last 12 months
        },
      });
    } catch (error) {
      console.error("Error in getAnalyticsDashboard:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve analytics dashboard data",
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

      // This would require additional filtering logic in the service layer
      // For now, return a basic response indicating the feature is available
      res.status(200).json({
        success: true,
        message: "Filtered analytics endpoint available",
        data: {
          filters: {
            startDate,
            endDate,
            category,
            level,
            type,
          },
          note: "Advanced filtering logic can be implemented based on specific requirements",
        },
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
