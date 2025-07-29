const express = require("express");
const { body, validationResult } = require("express-validator");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Get lessons for a course
// @route   GET /api/lessons?course=:courseId
// @access  Public (for published courses)
router.get("/", async (req, res) => {
  try {
    const { course } = req.query;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if course exists and is published
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      !courseDoc.settings.isPublished &&
      (!req.user ||
        (req.user._id.toString() !== courseDoc.instructor.toString() &&
          req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: "Course not available",
      });
    }

    const lessons = await Lesson.find({
      course: course,
      "settings.isPublished": true,
    })
      .sort({ order: 1 })
      .populate("instructor", "firstName lastName");

    res.json({
      success: true,
      data: {
        lessons,
      },
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Public (for published lessons)
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("instructor", "firstName lastName profile")
      .populate("course", "title settings");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Check if lesson is published or user has access
    if (
      !lesson.settings.isPublished &&
      (!req.user ||
        (req.user._id.toString() !== lesson.instructor._id.toString() &&
          req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: "Lesson not available",
      });
    }

    // Increment view count
    await Lesson.findByIdAndUpdate(req.params.id, {
      $inc: { "stats.views": 1 },
    });

    res.json({
      success: true,
      data: {
        lesson,
      },
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Create lesson
// @route   POST /api/lessons
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
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("course").isMongoId().withMessage("Valid course ID is required"),
    body("type")
      .isIn(["video", "text", "quiz", "assignment", "interactive", "live"])
      .withMessage("Invalid lesson type"),
    body("order")
      .isInt({ min: 1 })
      .withMessage("Order must be a positive integer"),
    body("estimatedTime")
      .isInt({ min: 1 })
      .withMessage("Estimated time must be a positive integer"),
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

      const { course } = req.body;

      // Check if course exists and user can create lessons for it
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (
        courseDoc.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create lessons for this course",
        });
      }

      const lessonData = {
        ...req.body,
        instructor: req.user._id,
      };

      const lesson = await Lesson.create(lessonData);

      const populatedLesson = await Lesson.findById(lesson._id)
        .populate("instructor", "firstName lastName profile")
        .populate("course", "title");

      res.status(201).json({
        success: true,
        message: "Lesson created successfully",
        data: {
          lesson: populatedLesson,
        },
      });
    } catch (error) {
      console.error("Create lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during lesson creation",
      });
    }
  }
);

// @desc    Update lesson
// @route   PUT /api/lessons/:id
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
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("type")
      .optional()
      .isIn(["video", "text", "quiz", "assignment", "interactive", "live"])
      .withMessage("Invalid lesson type"),
    body("order")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Order must be a positive integer"),
    body("estimatedTime")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Estimated time must be a positive integer"),
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

      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      // Check if user can update this lesson
      if (
        lesson.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this lesson",
        });
      }

      const updatedLesson = await Lesson.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
        .populate("instructor", "firstName lastName profile")
        .populate("course", "title");

      res.json({
        success: true,
        message: "Lesson updated successfully",
        data: {
          lesson: updatedLesson,
        },
      });
    } catch (error) {
      console.error("Update lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during lesson update",
      });
    }
  }
);

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Instructor/Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Check if user can delete this lesson
    if (
      lesson.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this lesson",
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during lesson deletion",
    });
  }
});

// @desc    Mark lesson as completed
// @route   POST /api/lessons/:id/complete
// @access  Private/Student
router.post(
  "/:id/complete",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      const { timeSpent } = req.body;

      // Update lesson stats
      await Lesson.findByIdAndUpdate(req.params.id, {
        $inc: { "stats.completions": 1 },
        $set: { "stats.averageTimeSpent": timeSpent || lesson.estimatedTime },
      });

      res.json({
        success: true,
        message: "Lesson marked as completed",
        data: {
          lessonId: req.params.id,
          timeSpent: timeSpent || lesson.estimatedTime,
        },
      });
    } catch (error) {
      console.error("Complete lesson error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during lesson completion",
      });
    }
  }
);

module.exports = router;
