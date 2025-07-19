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

// All routes require authentication and student role
router.use(protect);
router.use(authorize("student"));

// Student enrollment routes
router.get("/", EnrollmentController.getStudentEnrollments);
router.get("/stats", EnrollmentController.getStudentStats);
router.get("/:id", EnrollmentController.getEnrollmentById);

// Progress management
router.put(
  "/:id/progress",
  validateProgress,
  EnrollmentController.updateProgress
);
router.post("/:id/withdraw", EnrollmentController.withdrawEnrollment);

module.exports = router;
