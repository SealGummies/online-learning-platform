const express = require("express");
const { body, validationResult } = require("express-validator");
const UserController = require("../controllers/UserController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for user creation
/**
 * Validation middleware for creating a new user.
 * Validates firstName, lastName, email, password, and role fields.
 * @type {import('express').RequestHandler[]}
 */
const validateCreateUser = [
  body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
  body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["student", "instructor", "admin"]).withMessage("Invalid role"),
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

// Validation middleware for user update
/**
 * Validation middleware for updating user profile.
 * Validates optional firstName, lastName, email, role, and isActive fields.
 * @type {import('express').RequestHandler[]}
 */
const validateUpdateUser = [
  body("firstName").optional().trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
  body("lastName").optional().trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("role").optional().isIn(["student", "instructor", "admin"]).withMessage("Invalid role"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
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

// Validation middleware for user status update
/**
 * Validation middleware for updating user active status.
 * Validates the isActive boolean field.
 * @type {import('express').RequestHandler[]}
 */
const validateStatusUpdate = [
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
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

// Public routes for getting instructors/students lists
/**
 * @route   GET /api/users/instructors
 * @desc    Retrieve list of instructors
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with instructors array
 */
router.get("/instructors", UserController.getInstructors);
/**
 * @route   GET /api/users/students
 * @desc    Retrieve list of students
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with students array
 */
router.get("/students", UserController.getStudents);

// Admin-only routes
/**
 * @route   GET /api/users
 * @desc    Retrieve all users
 * @access  Private - Admin
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with users array and total count
 */
router.get("/", protect, authorize("admin"), UserController.getUsers);
/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private (Admin)
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with created user
 */
router.post("/", protect, authorize("admin"), validateCreateUser, UserController.createUser);

// Routes accessible by admin or user themselves
/**
 * @route   GET /api/users/:id
 * @desc    Retrieve user by ID
 * @access  Private - Admin or Owner
 * @param   {import('express').Request} req
 * @param   {string} req.params.id
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with user object
 */
router.get("/:id", protect, UserController.getUserById);
/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (Admin or Owner)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with updated user
 */
router.put("/:id", protect, validateUpdateUser, UserController.updateUser);
/**
 * @route   GET /api/users/:id/stats
 * @desc    Retrieve user statistics
 * @access  Private (Admin or Owner)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with user statistics
 */
router.get("/:id/stats", protect, UserController.getUserStats);
/**
 * @route   GET /api/users/:id/enrollments
 * @desc    Retrieve user enrollments
 * @access  Private (Admin or Owner)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with enrollments array
 */
router.get("/:id/enrollments", protect, UserController.getUserEnrollments);

// Admin-only management routes
/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response confirming deletion
 */
router.delete("/:id", protect, authorize("admin"), UserController.deleteUser);
/**
 * @route   PATCH /api/users/:id/status
 * @desc    Update user active status
 * @access  Private (Admin)
 * @param   {import('express').Request} req
 * @param   {string} req.params.id
 * @param   {import('express').Response} res
 * @returns {void} Sends JSON response with updated user status
 */
router.patch("/:id/status", protect, authorize("admin"), validateStatusUpdate, UserController.updateUserStatus);

module.exports = router;
