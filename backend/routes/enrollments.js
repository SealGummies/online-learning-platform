const express = require("express");
const { body, validationResult } = require("express-validator");
const EnrollmentController = require("../controllers/EnrollmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Progress validation middleware
 */
const validateProgress = [
  body("lessonId").notEmpty().withMessage("Lesson ID is required"),
  body("completed").isBoolean().withMessage("Completed must be a boolean"),
  body("timeSpent")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time spent must be a positive integer"),
  body("score")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
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

/**
 * Review validation middleware
 */
const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Comment must be less than 500 characters"),
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

// All routes require authentication and student role
router.use(protect);
router.use(authorize("student"));

// Student enrollment routes
router.get("/", EnrollmentController.getStudentEnrollments);
router.get("/stats", EnrollmentController.getStudentStats);
router.get("/:id", EnrollmentController.getEnrollmentById);
router.get("/:id/progress", EnrollmentController.getProgressDetails);

// Progress and review management
router.put(
  "/:id/progress",
  validateProgress,
  EnrollmentController.updateProgress
);
router.put("/:id/review", validateReview, EnrollmentController.submitReview);
router.post("/:id/withdraw", EnrollmentController.withdrawEnrollment);

module.exports = router;
