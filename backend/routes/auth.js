const express = require("express");
const { body, validationResult } = require("express-validator");
const AuthController = require("../controllers/AuthController");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * Validation middleware for user registration
 * Validates firstName, lastName, email, password, and optional role
 * @type {import('express').RequestHandler[]}
 */
const validateRegister = [
  body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
  body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["student", "instructor", "admin"]).withMessage("Invalid role"),
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
 * Validation middleware for user login
 * Validates email and password presence
 * @type {import('express').RequestHandler[]}
 */
const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").exists().withMessage("Password is required"),
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
 * Validation middleware for updating user profile (firstName, lastName)
 * @type {import('express').RequestHandler[]}
 */
const validateProfile = [
  body("firstName").optional().trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
  body("lastName").optional().trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
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
 * Validation middleware for changing user password
 * Validates currentPassword and newPassword
 * @type {import('express').RequestHandler[]}
 */
const validatePasswordChange = [
  body("currentPassword").exists().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
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
 * Validation middleware for forgot password
 * Validates email format
 * @type {import('express').RequestHandler[]}
 */
const validateForgotPassword = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
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
 * Validation middleware for resetting password
 * Validates new password length
 * @type {import('express').RequestHandler[]}
 */
const validatePasswordReset = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
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
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void}
 */
router.post("/register", validateRegister, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void}
 */
router.post("/login", validateLogin, AuthController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset instructions
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void}
 */
router.post("/forgot-password", validateForgotPassword, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using reset token
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {string} req.params.token
 * @returns {void}
 */
router.post("/reset-password/:token", validatePasswordReset, AuthController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve current user profile
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void}
 */
router.get("/me", protect, AuthController.getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void}
 */
router.put("/me", protect, validateProfile, AuthController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change current user password
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @returns {void}
 */
router.put("/change-password", protect, validatePasswordChange, AuthController.changePassword);

module.exports = router;
