const express = require("express");
const { body, validationResult } = require("express-validator");
const EnrollmentController = require("../controllers/EnrollmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Progress validation middleware (only simplified model fields)
/**
 * Validation middleware for enrollment progress updates
 * Validates optional completionPercentage, finalGrade, and status fields
 * @type {import('express').RequestHandler[]}
 */
const validateProgress = [
  body("completionPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Completion percentage must be between 0 and 100"),
  body("finalGrade").optional().isFloat({ min: 0, max: 100 }).withMessage("Final grade must be between 0 and 100"),
  body("status")
    .optional()
    .isIn(["enrolled", "in-progress", "completed", "dropped"])
    .withMessage("Invalid status value"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/enrollments/instructor
 * @desc    Get all enrollments for courses owned by instructor
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with instructor enrollments
 */
router.get("/instructor", authorize("instructor"), EnrollmentController.getInstructorEnrollments);

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments for authenticated student
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with student enrollments
 */
router.get("/", authorize("student"), EnrollmentController.getStudentEnrollments);

/**
 * @route   GET /api/enrollments/stats
 * @desc    Get enrollment statistics for authenticated student
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with student enrollment stats
 */
router.get("/stats", authorize("student"), EnrollmentController.getStudentStats);

/**
 * @route   PUT /api/enrollments/:id/progress
 * @desc    Update progress for a specific enrollment
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @param   {string} req.params.id - Enrollment ID
 * @param   {import('express').RequestBody} req.body - Progress data (completionPercentage, finalGrade, status)
 * @returns {void} Sends JSON response with updated enrollment progress
 */
router.put("/:id/progress", authorize("student"), validateProgress, EnrollmentController.updateProgress);

/**
 * @route   POST /api/enrollments/:id/withdraw
 * @desc    Withdraw from a specific enrollment
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @param   {string} req.params.id - Enrollment ID
 * @returns {void} Sends JSON response confirming withdrawal
 */
router.post("/:id/withdraw", authorize("student"), EnrollmentController.withdrawEnrollment);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get details of a specific enrollment
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @param   {string} req.params.id - Enrollment ID
 * @returns {void} Sends JSON response with enrollment details
 */
router.get("/:id", authorize("student"), EnrollmentController.getEnrollmentById);

module.exports = router;
