const express = require("express");
const { body, validationResult } = require("express-validator");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionManager = require("../utils/transactions");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { "settings.isPublished": true };

    if (req.query.category) query.category = req.query.category;
    if (req.query.level) query.level = req.query.level;
    if (req.query.instructor) query.instructor = req.query.instructor;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { tags: { $in: [new RegExp(req.query.search, "i")] } },
      ];
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Sort options
    let sortOptions = {};
    switch (req.query.sort) {
      case "price-low":
        sortOptions = { price: 1 };
        break;
      case "price-high":
        sortOptions = { price: -1 };
        break;
      case "rating":
        sortOptions = { "stats.averageRating": -1 };
        break;
      case "popular":
        sortOptions = { "stats.enrollments": -1 };
        break;
      case "newest":
        sortOptions = { publishedAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get courses
    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName profile.avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "firstName lastName profile email stats"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course is published or user has access
    if (
      !course.settings.isPublished &&
      (!req.user ||
        (req.user._id.toString() !== course.instructor._id.toString() &&
          req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: "Course not available",
      });
    }

    res.json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Instructor
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters"),
    body("description")
      .trim()
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters"),
    body("category")
      .isIn([
        "Programming",
        "Data Science",
        "Web Development",
        "Mobile Development",
        "AI/ML",
        "Cybersecurity",
        "Cloud Computing",
        "Database",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("level")
      .isIn(["Beginner", "Intermediate", "Advanced"])
      .withMessage("Invalid level"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
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

      const courseData = {
        ...req.body,
        instructor: req.user._id,
      };

      const course = await Course.create(courseData);

      const populatedCourse = await Course.findById(course._id).populate(
        "instructor",
        "firstName lastName profile"
      );

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: {
          course: populatedCourse,
        },
      });
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during course creation",
      });
    }
  }
);

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor/Admin
router.put(
  "/:id",
  protect,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters"),
    body("category")
      .optional()
      .isIn([
        "Programming",
        "Data Science",
        "Web Development",
        "Mobile Development",
        "AI/ML",
        "Cybersecurity",
        "Cloud Computing",
        "Database",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("level")
      .optional()
      .isIn(["Beginner", "Intermediate", "Advanced"])
      .withMessage("Invalid level"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
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

      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check if user can update this course
      if (
        course.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this course",
        });
      }

      const updateData = { ...req.body };
      updateData.lastUpdated = new Date();

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("instructor", "firstName lastName profile");

      res.json({
        success: true,
        message: "Course updated successfully",
        data: {
          course: updatedCourse,
        },
      });
    } catch (error) {
      console.error("Update course error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during course update",
      });
    }
  }
);

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user can delete this course
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    // Check if course has enrollments
    const enrollments = await Enrollment.countDocuments({
      course: req.params.id,
    });
    if (enrollments > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course with active enrollments",
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during course deletion",
    });
  }
});

// @desc    Enroll in course with ACID transaction
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
router.post("/:id/enroll", protect, authorize("student"), async (req, res) => {
  try {
    // Pre-transaction validation
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.settings.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment",
      });
    }

    // Check if already enrolled (outside transaction for performance)
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Execute enrollment with ACID transaction
    const enrollment = await TransactionManager.executeWithTransaction(
      async (session) => {
        // Double-check enrollment within transaction (prevents race conditions)
        const existingInTransaction = await Enrollment.findOne({
          student: req.user._id,
          course: req.params.id,
        }).session(session);

        if (existingInTransaction) {
          throw new Error("Already enrolled in this course");
        }

        // Check course capacity within transaction
        const courseInTransaction = await Course.findById(
          req.params.id
        ).session(session);
        if (
          courseInTransaction.settings.maxStudents &&
          courseInTransaction.stats.enrollments >=
            courseInTransaction.settings.maxStudents
        ) {
          throw new Error("Course has reached maximum capacity");
        }

        // Create enrollment
        const enrollmentData = {
          student: req.user._id,
          course: req.params.id,
          paymentDetails: {
            amount: course.price,
            currency: course.currency,
            paymentMethod: "credit_card", // This would come from payment gateway
            transactionId: `tx_${Date.now()}`,
            paymentDate: new Date(),
          },
        };

        const enrollment = await Enrollment.create([enrollmentData], {
          session,
        });

        // Update course stats atomically
        await Course.findByIdAndUpdate(
          req.params.id,
          { $inc: { "stats.enrollments": 1 } },
          { session }
        );

        return enrollment[0];
      }
    );

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course with transaction protection",
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error("Enroll in course error:", error);

    // Handle specific transaction errors
    const isTransactionError =
      error.message.includes("enrolled") || error.message.includes("capacity");

    res.status(isTransactionError ? 400 : 500).json({
      success: false,
      message: isTransactionError
        ? error.message
        : "Server error during enrollment",
    });
  }
});

// @desc    Get course enrollments (instructor/admin only)
// @route   GET /api/courses/:id/enrollments
// @access  Private/Instructor/Admin
router.get("/:id/enrollments", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user can view enrollments
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view course enrollments",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { course: req.params.id };
    if (req.query.status) query.status = req.query.status;

    const enrollments = await Enrollment.find(query)
      .populate("student", "firstName lastName email profile")
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get course enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
