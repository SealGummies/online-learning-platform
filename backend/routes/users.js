const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined)
      query.isActive = req.query.isActive === "true";
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Get users
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user can access this profile
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this profile",
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Create user (admin only)
// @route   POST /api/users
// @access  Private/Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  [
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
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password, role, profile } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Hash password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        profile: profile || {},
        emailVerified: true, // Admin created users are auto-verified
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user: userResponse,
        },
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during user creation",
      });
    }
  }
);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
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
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.params.id;

      // Check if user can update this profile
      if (req.user._id.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this profile",
        });
      }

      // Non-admin users cannot change role
      if (req.user.role !== "admin" && req.body.role) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to change user role",
        });
      }

      const {
        firstName,
        lastName,
        email,
        role,
        profile,
        preferences,
        isActive,
      } = req.body;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }
      }

      // Build update object
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (role && req.user.role === "admin") updateData.role = role;
      if (profile) updateData.profile = profile;
      if (preferences) updateData.preferences = preferences;
      if (isActive !== undefined && req.user.role === "admin")
        updateData.isActive = isActive;

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during user update",
      });
    }
  }
);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during user deletion",
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
router.get("/:id/stats", protect, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access these stats
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these statistics",
      });
    }

    const user = await User.findById(userId).select("stats firstName lastName");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get additional stats from related collections
    const Enrollment = require("../models/Enrollment");
    const Course = require("../models/Course");

    let additionalStats = {};

    if (user.role === "student") {
      // Get enrollment stats
      const enrollments = await Enrollment.find({ student: userId });
      const inProgressCourses = enrollments.filter(
        (e) => e.status === "in-progress"
      ).length;
      const completedCourses = enrollments.filter(
        (e) => e.status === "completed"
      ).length;

      additionalStats = {
        totalEnrollments: enrollments.length,
        inProgressCourses,
        completedCourses,
        averageProgress:
          enrollments.length > 0
            ? Math.round(
                enrollments.reduce(
                  (sum, e) => sum + e.progress.completionPercentage,
                  0
                ) / enrollments.length
              )
            : 0,
      };
    } else if (user.role === "instructor") {
      // Get course stats
      const courses = await Course.find({ instructor: userId });
      const totalEnrollments = courses.reduce(
        (sum, course) => sum + course.stats.enrollments,
        0
      );
      const totalRevenue = courses.reduce(
        (sum, course) => sum + course.stats.totalRevenue,
        0
      );

      additionalStats = {
        totalCourses: courses.length,
        totalEnrollments,
        totalRevenue,
        averageRating:
          courses.length > 0
            ? Math.round(
                (courses.reduce(
                  (sum, course) => sum + course.stats.averageRating,
                  0
                ) /
                  courses.length) *
                  10
              ) / 10
            : 0,
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          stats: user.stats,
          ...additionalStats,
        },
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
