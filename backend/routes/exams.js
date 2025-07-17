const express = require("express");
const { body, validationResult } = require("express-validator");
const ExamController = require("../controllers/ExamController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Validation middleware for exam creation
 */
const validateExam = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID"),
  body("questions")
    .isArray({ min: 1 })
    .withMessage("Exam must have at least one question"),
  body("questions.*.text")
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 10 })
    .withMessage("Question text must be at least 10 characters"),
  body("questions.*.type")
    .isIn(["multiple-choice", "true-false", "short-answer"])
    .withMessage("Invalid question type"),
  body("questions.*.points")
    .isFloat({ min: 0.1 })
    .withMessage("Question points must be greater than 0"),
  body("timeLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Time limit must be a positive integer"),
  body("maxAttempts")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max attempts must be a positive integer"),
  body("passingScore")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),
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

/**
 * Validation middleware for exam submission
 */
const validateExamSubmission = [
  body("answers")
    .isArray()
    .withMessage("Answers must be an array"),
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

/**
 * Validation middleware for exam grading
 */
const validateExamGrading = [
  body("grades")
    .isArray()
    .withMessage("Grades must be an array"),
  body("feedback")
    .optional()
    .isString()
    .withMessage("Feedback must be a string"),
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

// Get exams for a course (students and instructors)
router.get("/", protect, ExamController.getExams);

// Get specific exam details
router.get("/:id", protect, ExamController.getExamById);

// Get exam attempts for a specific exam
router.get("/:id/attempts", protect, ExamController.getExamAttempts);

// Instructor routes
router.post(
  "/",
  protect,
  authorize("instructor"),
  validateExam,
  ExamController.createExam
);

router.put(
  "/:id",
  protect,
  authorize("instructor"),
  validateExam,
  ExamController.updateExam
);

router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  ExamController.deleteExam
);

router.get(
  "/:id/stats",
  protect,
  authorize("instructor"),
  ExamController.getExamStats
);

router.post(
  "/:examId/attempts/:attemptId/grade",
  protect,
  authorize("instructor"),
  validateExamGrading,
  ExamController.gradeExam
);

// Student routes
router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  validateExamSubmission,
  ExamController.submitExam
);

module.exports = router;
