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
      const result = await AnalyticsService.getFilteredAnalytics({
        startDate,
        endDate,
        category,
        level,
        type,
      });
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

  /**
   * Get instructor-specific enrollment data
   * @route GET /api/analytics/instructor/enrollments
   * @access Private (Instructor)
   */
  static async getInstructorEnrollments(req, res) {
    try {
      const instructorId = req.user.id;
      const enrollments = await AnalyticsService.getInstructorEnrollments(
        instructorId
      );
      res.status(200).json({
        success: true,
        message: "Instructor enrollments retrieved successfully",
        data: enrollments,
        total: enrollments.length,
      });
    } catch (error) {
      console.error("Error in getInstructorEnrollments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor enrollments",
        error: error.message,
      });
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
      const overview = await AnalyticsService.getInstructorDashboardOverview(
        instructorId
      );
      res.status(200).json({
        success: true,
        message: "Instructor dashboard overview retrieved successfully",
        data: overview,
      });
    } catch (error) {
      console.error("Error in getInstructorDashboardOverview:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor dashboard overview",
        error: error.message,
      });
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
      const progressData = await AnalyticsService.getInstructorStudentProgress(
        instructorId
      );
      res.status(200).json({
        success: true,
        message: "Instructor student progress retrieved successfully",
        data: progressData,
        total: progressData.length,
      });
    } catch (error) {
      console.error("Error in getInstructorStudentProgress:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor student progress",
        error: error.message,
      });
    }
  }

  /**
   * Get admin dashboard overview with comprehensive platform statistics
   * @route GET /api/analytics/admin/overview
   * @access Private (Admin)
   */
  static async getAdminDashboardOverview(req, res) {
    try {
      const overviewData = await AnalyticsService.getAdminDashboardOverview();
      res.status(200).json({
        success: true,
        message: "Admin dashboard overview retrieved successfully",
        data: overviewData,
      });
    } catch (error) {
      console.error("Error in getAdminDashboardOverview:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve admin dashboard overview",
        error: error.message,
      });
    }
  }

  /**
   * Get user analytics for charts and demographics
   * @route GET /api/analytics/admin/users
   * @access Private (Admin)
   */
  static async getUserAnalytics(req, res) {
    try {
      const userAnalytics = await AnalyticsService.getUserAnalytics();
      res.status(200).json({
        success: true,
        message: "User analytics retrieved successfully",
        data: userAnalytics,
      });
    } catch (error) {
      console.error("Error in getUserAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get course analytics for admin dashboard
   * @route GET /api/analytics/admin/courses
   * @access Private (Admin)
   */
  static async getCourseAnalytics(req, res) {
    try {
      const courseAnalytics = await AnalyticsService.getCourseAnalytics();
      res.status(200).json({
        success: true,
        message: "Course analytics retrieved successfully",
        data: courseAnalytics,
      });
    } catch (error) {
      console.error("Error in getCourseAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve course analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get financial analytics for admin dashboard
   * @route GET /api/analytics/admin/financial
   * @access Private (Admin)
   */
  static async getFinancialAnalytics(req, res) {
    try {
      const financialAnalytics = await AnalyticsService.getFinancialAnalytics();
      res.status(200).json({
        success: true,
        message: "Financial analytics retrieved successfully",
        data: financialAnalytics,
      });
    } catch (error) {
      console.error("Error in getFinancialAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve financial analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get instructor performance analytics for admin dashboard
   * @route GET /api/analytics/admin/instructor-performance
   * @access Private (Admin)
   */
  static async getInstructorPerformanceAnalytics(req, res) {
    try {
      const performanceData =
        await AnalyticsService.getInstructorPerformanceAnalytics();
      res.status(200).json({
        success: true,
        message: "Instructor performance analytics retrieved successfully",
        data: performanceData,
        total: performanceData.length,
      });
    } catch (error) {
      console.error("Error in getInstructorPerformanceAnalytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor performance analytics",
        error: error.message,
      });
    }
  }
}

module.exports = AnalyticsController;
