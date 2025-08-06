const express = require("express");
const AnalyticsController = require("../controllers/AnalyticsController");
const { protect } = require("../middleware/auth");

const router = express.Router();
  // -------------------- Admin / Platform Analytics --------------------

/**
 * @route   GET /api/analytics/platform-overview
 * @desc    Get overall platform statistics and overview
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with platform overview data
 */
router.get("/platform-overview", protect, AnalyticsController.getPlatformOverview);

/**
 * @route   GET /api/analytics/instructor-analytics
 * @desc    Get instructor teaching analytics and performance
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with instructor analytics data
 */
router.get("/instructor-analytics", protect, AnalyticsController.getInstructorAnalytics);

/**
 * @route   GET /api/analytics/top-courses
 * @desc    Get top performing courses by enrollment
 * @access  Private (Admin, Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with top courses analytics
 */
router.get("/top-courses", protect, AnalyticsController.getTopPerformingCourses);

/**
 * @route   GET /api/analytics/student-progress
 * @desc    Get student progress analytics across all courses
 * @access  Private (Admin, Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with student progress data
 */
router.get("/student-progress", protect, AnalyticsController.getStudentProgressAnalytics);


/**
 * @route   GET /api/analytics/completion-trends
 * @desc    Get course completion trends over time
 * @access  Private (Admin, Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with completion trends data
 */
router.get("/completion-trends", protect, AnalyticsController.getCourseCompletionTrends);

/**
 * @route   GET /api/analytics/exam-performance
 * @desc    Get exam performance analysis with grade distribution
 * @access  Private (Admin, Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with exam performance metrics
 */
router.get("/exam-performance", protect, AnalyticsController.getExamPerformanceAnalysis);

  // -------------------- Student Analytics --------------------

/**
 * @route   GET /api/analytics/filtered
 * @desc    Get filtered analytics based on criteria
 * @access  Private (Admin, Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @param   {string} [req.query.startDate] - Filter start date (ISO string)
 * @param   {string} [req.query.endDate] - Filter end date (ISO string)
 * @param   {string} [req.query.category] - Course category filter
 * @param   {string} [req.query.level] - Course level filter
 * @param   {string} [req.query.type] - Exam type filter
 * @returns {void} Sends JSON response with filtered analytics data
 */
router.get("/filtered", protect, AnalyticsController.getFilteredAnalytics);

/**
 * @route   GET /api/analytics/instructor/enrollments
 * @desc    Get instructor-specific enrollment data for dashboard
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with instructor enrollments data
 */
router.get("/instructor/enrollments", protect, AnalyticsController.getInstructorEnrollments);

/**
 * @route   GET /api/analytics/instructor/overview
 * @desc    Get instructor dashboard overview statistics
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with dashboard overview
 */
router.get("/instructor/overview", protect, AnalyticsController.getInstructorDashboardOverview);

/**
 * @route   GET /api/analytics/instructor/student-progress
 * @desc    Get instructor's student progress analytics
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with instructor student progress data
 */
router.get("/instructor/student-progress", protect, AnalyticsController.getInstructorStudentProgress);

module.exports = router;
