const express = require("express");
const { body, validationResult } = require("express-validator");
const LessonController = require("../controllers/LessonController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for lesson creation (simplified fields only)
/**
 * Validation middleware for lesson payloads
 * Validates title, content, and course ID fields
 * @type {import('express').RequestHandler[]}
 */
const validateLesson = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 5, max: 5000 })
    .withMessage("Content must be between 5 and 5000 characters"),
  body("course").notEmpty().withMessage("Course ID is required").isMongoId().withMessage("Invalid course ID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

// Public routes
/**
 * @route   GET /api/lessons
 * @desc    Retrieve list of lessons for a course
 * @access  Public (published lessons)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with array of lessons
 */
router.get("/", LessonController.getLessons);

/**
 * @route   GET /api/lessons/:id
 * @desc    Retrieve a single lesson by ID
 * @access  Public/Private (based on course status)
 * @param   {import('express').Request} req - Express request object
 * @param   {string} req.params.id - Lesson ID
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with lesson object
 */
router.get("/:id", LessonController.getLessonById);

// Instructor routes
/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with created lesson
 */
router.post("/", protect, authorize("instructor"), validateLesson, LessonController.createLesson);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update an existing lesson
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {string} req.params.id - Lesson ID
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with updated lesson
 */
router.put("/:id", protect, authorize("instructor"), validateLesson, LessonController.updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete a lesson
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {string} req.params.id - Lesson ID
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response confirming deletion
 */
router.delete("/:id", protect, authorize("instructor"), LessonController.deleteLesson);

/**
 * @route   GET /api/lessons/:id/stats
 * @desc    Retrieve statistics for a lesson
 * @access  Private (Instructor)
 * @param   {import('express').Request} req - Express request object
 * @param   {string} req.params.id - Lesson ID
 * @param   {import('express').Response} res - Express response object
 * @returns {void} Sends JSON response with lesson stats
 */
router.get("/:id/stats", protect, authorize("instructor"), LessonController.getLessonStats);

module.exports = router;
