const express = require("express");
const { body, validationResult } = require("express-validator");
const EnrollmentController = require("../controllers/EnrollmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Progress validation middleware (only simplified model fields)
const validateProgress = [
  body("completionPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Completion percentage must be between 0 and 100"),
  body("finalGrade")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Final grade must be between 0 and 100"),
  body("status")
    .optional()
    .isIn(["enrolled", "in-progress", "completed", "dropped"])
    .withMessage("Invalid status value"),
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

// All routes require authentication
router.use(protect);

// Instructor-specific enrollment routes (must come before other routes to avoid pattern conflicts)
router.get(
  "/instructor",
  authorize("instructor"),
  EnrollmentController.getInstructorEnrollments
);

// Student-specific routes
router.get(
  "/",
  authorize("student"),
  EnrollmentController.getStudentEnrollments
);
router.get(
  "/stats",
  authorize("student"),
  EnrollmentController.getStudentStats
);

// Progress management (student only)
router.put(
  "/:id/progress",
  authorize("student"),
  validateProgress,
  EnrollmentController.updateProgress
);
router.post(
  "/:id/withdraw",
  authorize("student"),
  EnrollmentController.withdrawEnrollment
);

// Individual enrollment by ID (must come last to avoid conflicts)
router.get(
  "/:id",
  authorize("student"),
  EnrollmentController.getEnrollmentById
);

module.exports = router;
