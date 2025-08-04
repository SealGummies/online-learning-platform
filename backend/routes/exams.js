const express = require("express");
const { body, validationResult } = require("express-validator");
const ExamController = require("../controllers/ExamController");
const { protect, authorize, validateObjectId } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for exam creation
/**
 * Validation middleware for creating or updating exams.
 * Validates title, description, course ID, type, and questions array.
 * @type {import('express').RequestHandler[]}
 */
const validateExam = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters"),
  body("course").notEmpty().withMessage("Course ID is required").isMongoId().withMessage("Invalid course ID"),
  body("type").isIn(["quiz", "midterm", "final", "assignment"]).withMessage("Invalid exam type"),
  body("questions").isArray({ min: 1 }).withMessage("Exam must have at least one question"),
  body("questions.*.text").notEmpty().withMessage("Question text is required"),
  body("questions.*.options").isArray({ min: 2 }).withMessage("Question must have at least 2 options"),
  body("questions.*.correctAnswer").isInt({ min: 0 }).withMessage("Correct answer must be a valid option index"),
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

// Get exams for a course or all exams for student
/**
 * @route   GET /api/exams
 * @desc    Retrieve exams for a given course or all enrolled exams for a student
 * @access  Private (authenticated student/instructor/admin)
 * @param   {import('express').Request} req
 * @param   {string} [req.query.course] - Course ID to filter exams
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with exam list
 */
router.get("/", protect, ExamController.getExams);

// Get all exam results for student
/**
 * @route   GET /api/exams/results
 * @desc    Retrieve all exam results for the authenticated student
 * @access  Private (Student)
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with exam results array
 */
router.get("/results", protect, authorize("student"), ExamController.getAllExamResults);

// Get specific exam details
/**
 * @route   GET /api/exams/:id
 * @desc    Retrieve exam details by ID
 * @access  Private (authenticated student/instructor/admin)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id - Exam ID
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with exam object
 */
router.get("/:id", protect, validateObjectId("id"), ExamController.getExamById);

// Submit exam answers (student only)
/**
 * @route   POST /api/exams/:id/submit
 * @desc    Submit answers for an exam and compute result
 * @access  Private (Student)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id - Exam ID
 * @param   {Object} req.body - Answers map of question IDs to responses
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with exam result
 */
router.post("/:id/submit", protect, authorize("student"), validateObjectId("id"), ExamController.submitExam);

// Get exam results for a student
/**
 * @route   GET /api/exams/:id/results
 * @desc    Retrieve result for a specific exam for the authenticated student
 * @access  Private (Student)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id - Exam ID
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with exam result object
 */
router.get("/:id/results", protect, authorize("student"), validateObjectId("id"), ExamController.getExamResults);

// Instructor routes
/**
 * @route   POST /api/exams
 * @desc    Create a new exam under instructor's course
 * @access  Private - Instructor
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with created exam object
 */
router.post("/", protect, authorize("instructor"), validateExam, ExamController.createExam);

/**
 * @route   PUT /api/exams/:id
 * @desc    Update an existing exam
 * @access  Private (Instructor)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id - Exam ID
 * @param   {Object} req.body - Updated exam fields
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with updated exam object
 */
router.put("/:id", protect, authorize("instructor"), validateObjectId("id"), validateExam, ExamController.updateExam);

/**
 * @route   DELETE /api/exams/:id
 * @desc    Delete an exam
 * @access  Private (Instructor)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id - Exam ID
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response confirming deletion
 */
router.delete("/:id", protect, authorize("instructor"), validateObjectId("id"), ExamController.deleteExam);

/**
 * @route   GET /api/exams/:id/stats
 * @desc    Retrieve statistics for a specific exam
 * @access  Private (Instructor)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id - Exam ID
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with exam statistics
 */
router.get("/:id/stats", protect, authorize("instructor"), validateObjectId("id"), ExamController.getExamStats);

module.exports = router;
