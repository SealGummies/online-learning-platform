const express = require("express");
const { body, validationResult } = require("express-validator");
const UserController = require("../controllers/UserController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Validation middleware for user creation
 */
const validateCreateUser = [
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["student", "instructor", "admin"])
    .withMessage("Invalid role"),
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
 * Validation middleware for user update
 */
const validateUpdateUser = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Invalid role"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
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
 * Validation middleware for user status update
 */
const validateStatusUpdate = [
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be a boolean"),
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

// Public routes for getting instructors/students lists (if needed)
router.get("/instructors", UserController.getInstructors);
router.get("/students", UserController.getStudents);

// Admin-only routes
router.get("/", protect, authorize("admin"), UserController.getUsers);
router.post("/", protect, authorize("admin"), validateCreateUser, UserController.createUser);

// Routes accessible by admin or user themselves
router.get("/:id", protect, UserController.getUserById);
router.put("/:id", protect, validateUpdateUser, UserController.updateUser);
router.get("/:id/stats", protect, UserController.getUserStats);
router.get("/:id/enrollments", protect, UserController.getUserEnrollments);

// Admin-only management routes
router.delete("/:id", protect, authorize("admin"), UserController.deleteUser);
router.patch("/:id/status", protect, authorize("admin"), validateStatusUpdate, UserController.updateUserStatus);

module.exports = router;
