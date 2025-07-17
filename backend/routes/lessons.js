const express = require("express");
const { body, validationResult } = require("express-validator");
const LessonController = require("../controllers/LessonController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Validation middleware for lesson creation
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
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  body("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID"),
  body("type")
    .optional()
    .isIn(["video", "text", "interactive", "quiz"])
    .withMessage("Invalid lesson type"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Invalid video URL"),
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
 * Validation middleware for lesson completion
 */
const validateLessonCompletion = [
  body("timeSpent")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time spent must be a non-negative integer"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string"),
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
 * Validation middleware for lesson reordering
 */
const validateLessonReorder = [
  body("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID"),
  body("lessonOrder")
    .isArray({ min: 1 })
    .withMessage("Lesson order must be a non-empty array"),
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

// Public/Student routes (some may require enrollment check in controller)
router.get("/", LessonController.getLessons); // Query param: course
router.get("/:id", LessonController.getLessonById);
router.get("/:id/progress", protect, LessonController.getLessonProgress);

// Student routes
router.post(
  "/:id/complete",
  protect,
  authorize("student"),
  validateLessonCompletion,
  LessonController.completeLesson
);

// Instructor routes
router.post(
  "/",
  protect,
  authorize("instructor"),
  validateLesson,
  LessonController.createLesson
);

router.put(
  "/:id",
  protect,
  authorize("instructor"),
  validateLesson,
  LessonController.updateLesson
);

router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  LessonController.deleteLesson
);

router.get(
  "/:id/stats",
  protect,
  authorize("instructor"),
  LessonController.getLessonStats
);

router.put(
  "/reorder",
  protect,
  authorize("instructor"),
  validateLessonReorder,
  LessonController.reorderLessons
);

module.exports = router;
