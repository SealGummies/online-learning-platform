const express = require("express");
const AnalyticsController = require("../controllers/AnalyticsController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/analytics/top-courses
 * @desc    Get top performing courses by enrollment
 * @access  Private (Admin/Instructor)
 */
router.get(
  "/top-courses",
  protect,
  authorize("admin", "instructor"),
  AnalyticsController.getTopPerformingCourses
);

/**
 * @route   GET /api/analytics/student-progress
 * @desc    Get student progress analytics across all courses
 * @access  Private (Admin/Instructor)
 */
router.get(
  "/student-progress",
  protect,
  authorize("admin", "instructor"),
  AnalyticsController.getStudentProgressAnalytics
);

/**
 * @route   GET /api/analytics/instructor-analytics
 * @desc    Get instructor teaching analytics and performance
 * @access  Private (Admin)
 */
router.get(
  "/instructor-analytics",
  protect,
  authorize("admin"),
  AnalyticsController.getInstructorAnalytics
);

/**
 * @route   GET /api/analytics/completion-trends
 * @desc    Get course completion trends over time
 * @access  Private (Admin/Instructor)
 */
router.get(
  "/completion-trends",
  protect,
  authorize("admin", "instructor"),
  AnalyticsController.getCourseCompletionTrends
);

/**
 * @route   GET /api/analytics/exam-performance
 * @desc    Get exam performance analysis with grade distribution
 * @access  Private (Admin/Instructor)
 */
router.get(
  "/exam-performance",
  protect,
  authorize("admin", "instructor"),
  AnalyticsController.getExamPerformanceAnalysis
);

/**
 * @route   GET /api/analytics/platform-overview
 * @desc    Get overall platform statistics and overview
 * @access  Private (Admin)
 */
router.get(
  "/platform-overview",
  protect,
  authorize("admin"),
  AnalyticsController.getPlatformOverview
);

/**
 * @route   GET /api/analytics/filtered
 * @desc    Get filtered analytics based on criteria
 * @access  Private (Admin/Instructor)
 * @query   startDate, endDate, category, level, type
 */
router.get(
  "/filtered",
  protect,
  authorize("admin", "instructor"),
  AnalyticsController.getFilteredAnalytics
);

/**
 * @route   GET /api/analytics/instructor/enrollments
 * @desc    Get instructor-specific enrollment data for dashboard
 * @access  Private (Instructor)
 */
router.get(
  "/instructor/enrollments",
  protect,
  authorize("instructor"),
  AnalyticsController.getInstructorEnrollments
);

/**
 * @route   GET /api/analytics/instructor/overview
 * @desc    Get instructor dashboard overview statistics
 * @access  Private (Instructor)
 */
router.get(
  "/instructor/overview",
  protect,
  authorize("instructor"),
  AnalyticsController.getInstructorDashboardOverview
);

/**
 * @route   GET /api/analytics/instructor/student-progress
 * @desc    Get instructor's student progress analytics
 * @access  Private (Instructor)
 */
router.get(
  "/instructor/student-progress",
  protect,
  authorize("instructor"),
  AnalyticsController.getInstructorStudentProgress
);

/**
 * @route   GET /api/analytics/admin/overview
 * @desc    Get comprehensive admin dashboard overview
 * @access  Private (Admin)
 */
router.get(
  "/admin/overview",
  protect,
  authorize("admin"),
  AnalyticsController.getAdminDashboardOverview
);

/**
 * @route   GET /api/analytics/admin/users
 * @desc    Get user analytics for admin dashboard
 * @access  Private (Admin)
 */
router.get(
  "/admin/users",
  protect,
  authorize("admin"),
  AnalyticsController.getUserAnalytics
);

/**
 * @route   GET /api/analytics/admin/courses
 * @desc    Get course analytics for admin dashboard
 * @access  Private (Admin)
 */
router.get(
  "/admin/courses",
  protect,
  authorize("admin"),
  AnalyticsController.getCourseAnalytics
);

/**
 * @route   GET /api/analytics/admin/financial
 * @desc    Get financial analytics for admin dashboard
 * @access  Private (Admin)
 */
router.get(
  "/admin/financial",
  protect,
  authorize("admin"),
  AnalyticsController.getFinancialAnalytics
);

/**
 * @route   GET /api/analytics/admin/instructor-performance
 * @desc    Get instructor performance analytics for admin dashboard
 * @access  Private (Admin)
 */
router.get(
  "/admin/instructor-performance",
  protect,
  authorize("admin"),
  AnalyticsController.getInstructorPerformanceAnalytics
);

module.exports = router;
