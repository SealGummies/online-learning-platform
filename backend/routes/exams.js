const express = require("express");
const { body, validationResult } = require("express-validator");
const ExamController = require("../controllers/ExamController");
const { protect, authorize, validateObjectId } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for exam creation
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
  body("type")
    .isIn(["quiz", "midterm", "final", "assignment"])
    .withMessage("Invalid exam type"),
  body("questions")
    .isArray({ min: 1 })
    .withMessage("Exam must have at least one question"),
  body("questions.*.text")
    .notEmpty()
    .withMessage("Question text is required"),
  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Question must have at least 2 options"),
  body("questions.*.correctAnswer")
    .isInt({ min: 0 })
    .withMessage("Correct answer must be a valid option index"),
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
router.get("/", protect, ExamController.getExams);

// Get all exam results for student
router.get("/results", protect, authorize("student"), ExamController.getAllExamResults);

// Get specific exam details
router.get("/:id", protect, validateObjectId("id"), ExamController.getExamById);

// Submit exam answers (student only)
router.post("/:id/submit", protect, authorize("student"), validateObjectId("id"), ExamController.submitExam);

// Get exam results for a student
router.get("/:id/results", protect, authorize("student"), validateObjectId("id"), ExamController.getExamResults);

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
  validateObjectId("id"),
  validateExam,
  ExamController.updateExam
);

router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  validateObjectId("id"),
  ExamController.deleteExam
);

router.get(
  "/:id/stats",
  protect,
  authorize("instructor"),
  validateObjectId("id"),
  ExamController.getExamStats
);

module.exports = router;
