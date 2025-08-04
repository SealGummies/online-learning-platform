const express = require("express");
const { body, validationResult } = require("express-validator");
const CourseController = require("../controllers/CourseController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Course validation middleware (only simplified model fields)
/**
 * Validation middleware for course payloads
 * Validates title, description, category, level, price, and isActive fields
 * @type {import('express').RequestHandler[]}
 */
const validateCourse = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("category").notEmpty().withMessage("Category is required"),
  body("level")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean value"),
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

// Public routes
/**
 * @route   GET /api/courses
 * @desc    Retrieve list of courses
 * @access  Public
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with array of courses
 */
router.get("/", CourseController.getCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Retrieve a specific course by ID
 * @access  Public
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with course data
 */
router.get("/:id", CourseController.getCourseById);

/**
 * @route   GET /api/courses/:id/stats
 * @desc    Retrieve statistics for a specific course
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with course statistics
 */
router.get("/:id/stats", protect, authorize("instructor"), CourseController.getCourseStats);

// Protected routes - Students
/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll the authenticated student in a course
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response confirming enrollment
 */
router.post("/:id/enroll", protect, authorize("student"), CourseController.enrollStudent);

// Protected routes - Instructors
/**
 * @route   GET /api/courses/instructor/my-courses
 * @desc    Retrieve courses created by the authenticated instructor
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with instructor's courses
 */
router.get("/instructor/my-courses", protect, authorize("instructor"), CourseController.getInstructorCourses);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with created course
 */
router.post("/", protect, authorize("instructor"), validateCourse, CourseController.createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update an existing course
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with updated course
 */
router.put("/:id", protect, authorize("instructor"), validateCourse, CourseController.updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response confirming deletion
 */
router.delete("/:id", protect, authorize("instructor"), CourseController.deleteCourse);

module.exports = router;
