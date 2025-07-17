const express = require("express");
const AnalyticsController = require("../controllers/AnalyticsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/analytics/top-courses
 * @desc    Get top performing courses by enrollment and grades
 * @access  Private (Admin/Instructor)
 */
router.get(
  "/top-courses",
  protect,
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
  AnalyticsController.getPlatformOverview
);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue analytics and financial performance
 * @access  Private (Admin)
 */
router.get("/revenue", protect, AnalyticsController.getRevenueAnalytics);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get comprehensive analytics dashboard data
 * @access  Private (Admin)
 */
router.get("/dashboard", protect, AnalyticsController.getAnalyticsDashboard);

/**
 * @route   GET /api/analytics/filtered
 * @desc    Get filtered analytics based on criteria
 * @access  Private (Admin/Instructor)
 * @query   startDate, endDate, category, level, type
 */
router.get("/filtered", protect, AnalyticsController.getFilteredAnalytics);

module.exports = router;
