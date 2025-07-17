const express = require("express");
const { body, validationResult } = require("express-validator");
const CourseController = require("../controllers/CourseController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Course validation middleware
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
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
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
router.get("/", CourseController.getCourses);
router.get("/:id", CourseController.getCourseById);
router.get("/:id/stats", CourseController.getCourseStats);

// Protected routes - Students
router.post(
  "/:id/enroll",
  protect,
  authorize("student"),
  CourseController.enrollStudent
);

// Protected routes - Instructors
router.get(
  "/instructor/my-courses",
  protect,
  authorize("instructor"),
  CourseController.getInstructorCourses
);
router.post(
  "/",
  protect,
  authorize("instructor"),
  validateCourse,
  CourseController.createCourse
);
router.put(
  "/:id",
  protect,
  authorize("instructor"),
  validateCourse,
  CourseController.updateCourse
);
router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  CourseController.deleteCourse
);

module.exports = router;
