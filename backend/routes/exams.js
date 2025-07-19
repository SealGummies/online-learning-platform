const express = require("express");
const { body, validationResult } = require("express-validator");
const ExamController = require("../controllers/ExamController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for exam creation (simplified fields only)
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

module.exports = router;
