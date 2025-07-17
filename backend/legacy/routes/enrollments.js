const express = require("express");
const { body, validationResult } = require("express-validator");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const TransactionManager = require("../utils/transactions");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Get user's enrollments
// @route   GET /api/enrollments
// @access  Private/Student
router.get("/", protect, authorize("student"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { student: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const enrollments = await Enrollment.find(query)
      .populate("course", "title description thumbnail instructor stats")
      .populate("course.instructor", "firstName lastName")
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
    console.error("Get enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "firstName lastName email")
      .populate("course", "title description instructor");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check if user can access this enrollment
    if (
      enrollment.student._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this enrollment",
      });
    }

    res.json({
      success: true,
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error("Get enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Update enrollment progress with ACID transaction
// @route   PUT /api/enrollments/:id/progress
// @access  Private/Student
router.put("/:id/progress", protect, authorize("student"), async (req, res) => {
  try {
    // Pre-transaction validation
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this enrollment",
      });
    }

    const { lessonCompleted, examCompleted, timeSpent } = req.body;

    // Execute progress update with transaction
    const updatedEnrollment = await TransactionManager.executeWithTransaction(
      async (session) => {
        // Get enrollment within transaction
        const enrollmentInTransaction = await Enrollment.findById(
          req.params.id
        ).session(session);

        if (!enrollmentInTransaction) {
          throw new Error("Enrollment not found");
        }

        let needsCourseStatsUpdate = false;
        let courseRatingUpdate = null;

        if (lessonCompleted) {
          // Add lesson completion
          const lessonExists =
            enrollmentInTransaction.progress.lessonsCompleted.some(
              (lesson) => lesson.lesson.toString() === lessonCompleted.lesson
            );

          if (!lessonExists) {
            enrollmentInTransaction.progress.lessonsCompleted.push({
              lesson: lessonCompleted.lesson,
              completedAt: new Date(),
              timeSpent: lessonCompleted.timeSpent || 0,
            });
          }
        }

        if (examCompleted) {
          // Add exam completion
          const examExists =
            enrollmentInTransaction.progress.examsCompleted.some(
              (exam) => exam.exam.toString() === examCompleted.exam
            );

          if (!examExists) {
            enrollmentInTransaction.progress.examsCompleted.push({
              exam: examCompleted.exam,
              score: examCompleted.score,
              totalQuestions: examCompleted.totalQuestions,
              correctAnswers: examCompleted.correctAnswers,
              completedAt: new Date(),
              timeSpent: examCompleted.timeSpent || 0,
            });
          }
        }

        if (timeSpent) {
          enrollmentInTransaction.progress.totalTimeSpent += timeSpent;
        }

        enrollmentInTransaction.progress.lastActivityDate = new Date();

        // Update completion percentage based on lessons and exams completed
        const totalLessons =
          enrollmentInTransaction.progress.lessonsCompleted.length;
        const totalExams =
          enrollmentInTransaction.progress.examsCompleted.length;
        const estimatedTotalContent = Math.max(totalLessons + totalExams, 1);
        enrollmentInTransaction.progress.completionPercentage = Math.min(
          Math.round(
            ((totalLessons + totalExams) / estimatedTotalContent) * 100
          ),
          100
        );

        // Update status based on completion
        const wasCompleted = enrollmentInTransaction.status === "completed";
        if (enrollmentInTransaction.progress.completionPercentage >= 100) {
          enrollmentInTransaction.status = "completed";
          needsCourseStatsUpdate = !wasCompleted; // Only update if newly completed

          // Issue certificate if course offers one
          const course = await Course.findById(
            enrollmentInTransaction.course
          ).session(session);
          if (
            course &&
            course.settings.certificate &&
            !enrollmentInTransaction.certificate?.issued
          ) {
            enrollmentInTransaction.certificate = {
              issued: true,
              issuedAt: new Date(),
              certificateId: `CERT_${Date.now()}_${
                enrollmentInTransaction._id
              }`,
              certificateUrl: `https://example.com/certificates/${enrollmentInTransaction._id}`,
            };
          }
        } else if (enrollmentInTransaction.progress.completionPercentage > 0) {
          enrollmentInTransaction.status = "in-progress";
        }

        // Save enrollment changes
        await enrollmentInTransaction.save({ session });

        // Update course completion stats if needed
        if (needsCourseStatsUpdate) {
          await Course.findByIdAndUpdate(
            enrollmentInTransaction.course,
            { $inc: { "stats.completions": 1 } },
            { session }
          );
        }

        return enrollmentInTransaction;
      }
    );

    res.json({
      success: true,
      message: "Progress updated successfully with transaction protection",
      data: {
        enrollment: updatedEnrollment,
      },
    });
  } catch (error) {
    console.error("Update enrollment progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during progress update",
    });
  }
});

// @desc    Add review to enrollment with ACID transaction
// @route   PUT /api/enrollments/:id/review
// @access  Private/Student
router.put(
  "/:id/review",
  protect,
  authorize("student"),
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Comment must be at least 10 characters"),
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

      // Pre-transaction validation
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found",
        });
      }

      // Check if user owns this enrollment
      if (enrollment.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to review this enrollment",
        });
      }

      // Check if course is completed
      if (enrollment.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Can only review completed courses",
        });
      }

      const { rating, comment } = req.body;

      // Execute review update with transaction
      const updatedEnrollment = await TransactionManager.executeWithTransaction(
        async (session) => {
          // Update enrollment with rating and review
          const enrollmentInTransaction = await Enrollment.findByIdAndUpdate(
            req.params.id,
            {
              rating: rating,
              review: {
                comment: comment || "",
                reviewDate: new Date(),
                helpful: 0,
              },
            },
            { new: true, session }
          );

          // Recalculate course average rating within transaction
          const allRatings = await Enrollment.find({
            course: enrollmentInTransaction.course,
            rating: { $exists: true },
          })
            .select("rating")
            .session(session);

          const totalRatings = allRatings.length;
          const sumRatings = allRatings.reduce((sum, e) => sum + e.rating, 0);
          const averageRating =
            totalRatings > 0
              ? Math.round((sumRatings / totalRatings) * 10) / 10
              : 0;

          // Update course rating stats atomically
          await Course.findByIdAndUpdate(
            enrollmentInTransaction.course,
            {
              "stats.averageRating": averageRating,
              "stats.totalReviews": totalRatings,
            },
            { session }
          );

          return enrollmentInTransaction;
        }
      );

      res.json({
        success: true,
        message: "Review added successfully with transaction protection",
        data: {
          enrollment: updatedEnrollment,
        },
      });
    } catch (error) {
      console.error("Add review error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during review submission",
      });
    }
  }
);

// @desc    Unenroll from course
// @route   DELETE /api/enrollments/:id
// @access  Private/Student
router.delete("/:id", protect, authorize("student"), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unenroll from this course",
      });
    }

    // Check if course is already completed
    if (enrollment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot unenroll from completed course",
      });
    }

    // Update enrollment status instead of deleting
    enrollment.status = "dropped";
    await enrollment.save();

    // Update course stats
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { "stats.enrollments": -1 },
    });

    res.json({
      success: true,
      message: "Successfully unenrolled from course",
    });
  } catch (error) {
    console.error("Unenroll error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during unenrollment",
    });
  }
});

module.exports = router;
