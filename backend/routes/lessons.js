const express = require("express");
const { body, validationResult } = require("express-validator");
const LessonController = require("../controllers/LessonController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for lesson creation (simplified fields only)
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
router.get("/", LessonController.getLessons); // Query param: course
router.get("/:id", LessonController.getLessonById);

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

module.exports = router;
