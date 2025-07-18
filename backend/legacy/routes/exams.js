const express = require("express");
const { body, validationResult } = require("express-validator");
const Exam = require("../models/Exam");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionManager = require("../utils/transactions");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Get exams for a course
// @route   GET /api/exams?course=:courseId
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { course } = req.query;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if course exists and user has access
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let query = { course: course };

    // Students can only see published exams
    if (req.user.role === "student") {
      query.isPublished = true;
    }

    const exams = await Exam.find(query)
      .sort({ createdAt: -1 })
      .populate("instructor", "firstName lastName");

    // For students, don't send correct answers
    if (req.user.role === "student") {
      exams.forEach((exam) => {
        exam.questions.forEach((question) => {
          if (question.options) {
            question.options.forEach((option) => {
              delete option.isCorrect;
            });
          }
          delete question.correctAnswer;
        });
      });
    }

    res.json({
      success: true,
      data: {
        exams,
      },
    });
  } catch (error) {
    console.error("Get exams error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("instructor", "firstName lastName profile")
      .populate("course", "title settings");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Check if exam is published or user has access
    if (
      !exam.isPublished &&
      (req.user.role === "student" ||
        (req.user._id.toString() !== exam.instructor._id.toString() &&
          req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: "Exam not available",
      });
    }

    // For students, don't send correct answers
    if (req.user.role === "student") {
      exam.questions.forEach((question) => {
        if (question.options) {
          question.options.forEach((option) => {
            delete option.isCorrect;
          });
        }
        delete question.correctAnswer;
      });
    }

    res.json({
      success: true,
      data: {
        exam,
      },
    });
  } catch (error) {
    console.error("Get exam error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Create exam
// @route   POST /api/exams
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
      .isIn(["quiz", "midterm", "final", "assignment", "project"])
      .withMessage("Invalid exam type"),
    body("questions")
      .isArray({ min: 1 })
      .withMessage("At least one question is required"),
    body("questions.*.question")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Question must be at least 5 characters"),
    body("questions.*.type")
      .isIn(["multiple-choice", "true-false", "short-answer", "essay", "code"])
      .withMessage("Invalid question type"),
    body("questions.*.points")
      .isInt({ min: 1 })
      .withMessage("Points must be a positive integer"),
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

      // Check if course exists and user can create exams for it
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
          message: "Not authorized to create exams for this course",
        });
      }

      const examData = {
        ...req.body,
        instructor: req.user._id,
      };

      const exam = await Exam.create(examData);

      const populatedExam = await Exam.findById(exam._id)
        .populate("instructor", "firstName lastName profile")
        .populate("course", "title");

      res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: {
          exam: populatedExam,
        },
      });
    } catch (error) {
      console.error("Create exam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during exam creation",
      });
    }
  }
);

// @desc    Update exam
// @route   PUT /api/exams/:id
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
      .isIn(["quiz", "midterm", "final", "assignment", "project"])
      .withMessage("Invalid exam type"),
    body("questions")
      .optional()
      .isArray({ min: 1 })
      .withMessage("At least one question is required"),
    body("questions.*.question")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Question must be at least 5 characters"),
    body("questions.*.type")
      .optional()
      .isIn(["multiple-choice", "true-false", "short-answer", "essay", "code"])
      .withMessage("Invalid question type"),
    body("questions.*.points")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Points must be a positive integer"),
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

      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      // Check if user can update this exam
      if (
        exam.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this exam",
        });
      }

      const updatedExam = await Exam.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
        .populate("instructor", "firstName lastName profile")
        .populate("course", "title");

      res.json({
        success: true,
        message: "Exam updated successfully",
        data: {
          exam: updatedExam,
        },
      });
    } catch (error) {
      console.error("Update exam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during exam update",
      });
    }
  }
);

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Instructor/Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Check if user can delete this exam
    if (
      exam.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this exam",
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during exam deletion",
    });
  }
});

// @desc    Submit exam answers
// @route   POST /api/exams/:id/submit
// @access  Private/Student
router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  [
    body("answers")
      .isArray({ min: 1 })
      .withMessage("At least one answer is required"),
    body("answers.*.questionId")
      .isMongoId()
      .withMessage("Valid question ID is required"),
    body("answers.*.answer").exists().withMessage("Answer is required"),
    body("timeSpent")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Time spent must be a positive integer"),
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

      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      if (!exam.isPublished) {
        return res.status(400).json({
          success: false,
          message: "Exam is not available for submission",
        });
      }

      // Check if exam is within availability window
      const now = new Date();
      if (exam.availability.startDate && now < exam.availability.startDate) {
        return res.status(400).json({
          success: false,
          message: "Exam has not started yet",
        });
      }

      if (exam.availability.endDate && now > exam.availability.endDate) {
        return res.status(400).json({
          success: false,
          message: "Exam submission deadline has passed",
        });
      }

      const { answers, timeSpent } = req.body;

      // Calculate score
      let totalQuestions = exam.questions.length;
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      exam.questions.forEach((question) => {
        totalPoints += question.points;

        const userAnswer = answers.find(
          (a) => a.questionId === question._id.toString()
        );

        if (userAnswer) {
          let isCorrect = false;

          if (question.type === "multiple-choice") {
            const correctOption = question.options.find((opt) => opt.isCorrect);
            if (correctOption && userAnswer.answer === correctOption.text) {
              isCorrect = true;
            }
          } else if (question.type === "true-false") {
            const correctOption = question.options.find((opt) => opt.isCorrect);
            if (correctOption && userAnswer.answer === correctOption.text) {
              isCorrect = true;
            }
          } else if (question.type === "short-answer") {
            // Simple string comparison - in production, you'd have more sophisticated matching
            if (
              userAnswer.answer.toLowerCase().trim() ===
              question.correctAnswer.toLowerCase().trim()
            ) {
              isCorrect = true;
            }
          }

          if (isCorrect) {
            correctAnswers++;
            earnedPoints += question.points;
          }
        }
      });

      const score =
        totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = score >= exam.settings.passingScore;

      // Update exam stats
      await Exam.findByIdAndUpdate(req.params.id, {
        $inc: {
          "stats.attempts": 1,
          "stats.completions": 1,
        },
        $set: {
          "stats.averageScore": score, // In production, calculate proper average
          "stats.highestScore": Math.max(exam.stats.highestScore || 0, score),
          "stats.lowestScore": Math.min(exam.stats.lowestScore || 100, score),
          "stats.averageTimeSpent": timeSpent || exam.settings.timeLimit,
        },
      });

      const result = {
        examId: req.params.id,
        score,
        totalQuestions,
        correctAnswers,
        totalPoints,
        earnedPoints,
        passed,
        timeSpent: timeSpent || exam.settings.timeLimit,
        submittedAt: new Date(),
      };

      // If exam settings allow, show correct answers
      if (exam.settings.showCorrectAnswers) {
        result.correctAnswers = exam.questions.map((question) => ({
          questionId: question._id,
          question: question.question,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        }));
      }

      res.json({
        success: true,
        message: "Exam submitted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Submit exam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during exam submission",
      });
    }
  }
);

// @desc    Submit exam answers with ACID transaction
// @route   POST /api/exams/:id/submit
// @access  Private/Student
router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  [
    body("answers")
      .isArray({ min: 1 })
      .withMessage("At least one answer is required"),
    body("answers.*.questionId")
      .isMongoId()
      .withMessage("Valid question ID is required"),
    body("answers.*.answer").notEmpty().withMessage("Answer is required"),
    body("timeSpent")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Time spent must be a non-negative integer"),
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
      const exam = await Exam.findById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      if (!exam.isPublished) {
        return res.status(400).json({
          success: false,
          message: "Exam is not available for submission",
        });
      }

      // Check if student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: exam.course,
        status: { $in: ["active", "in-progress"] },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to take the exam",
        });
      }

      // Check if exam already submitted
      const existingSubmission = await Exam.findOne({
        _id: req.params.id,
        "submissions.student": req.user._id,
      });

      if (existingSubmission) {
        return res.status(400).json({
          success: false,
          message: "Exam already submitted",
        });
      }

      const { answers, timeSpent = 0 } = req.body;

      // Execute exam submission with ACID transaction
      const result = await TransactionManager.executeWithTransaction(
        async (session) => {
          // Calculate grade
          let correctAnswers = 0;
          const totalQuestions = exam.questions.length;
          const submissionAnswers = [];

          exam.questions.forEach((question, index) => {
            const studentAnswer = answers.find(
              (a) => a.questionId === question._id.toString()
            );

            if (studentAnswer) {
              let isCorrect = false;

              // Check answer based on question type
              switch (question.type) {
                case "multiple-choice":
                  const correctOption = question.options.find(
                    (opt) => opt.isCorrect
                  );
                  isCorrect =
                    correctOption &&
                    correctOption._id.toString() === studentAnswer.answer;
                  break;
                case "true-false":
                  isCorrect = question.correctAnswer === studentAnswer.answer;
                  break;
                case "short-answer":
                  // Simple text comparison - in production, use more sophisticated matching
                  isCorrect =
                    question.correctAnswer?.toLowerCase().trim() ===
                    studentAnswer.answer.toLowerCase().trim();
                  break;
                default:
                  // For essay and code questions, manual grading required
                  isCorrect = false;
              }

              if (isCorrect) correctAnswers++;

              submissionAnswers.push({
                questionId: question._id,
                answer: studentAnswer.answer,
                isCorrect,
                points: isCorrect ? question.points : 0,
              });
            }
          });

          const grade =
            totalQuestions > 0
              ? Math.round((correctAnswers / totalQuestions) * 100)
              : 0;

          // Create exam submission
          const submission = {
            student: req.user._id,
            answers: submissionAnswers,
            submittedAt: new Date(),
            timeSpent,
            grade,
            totalQuestions,
            correctAnswers,
            status: "submitted",
          };

          // Update exam with submission
          const updatedExam = await Exam.findByIdAndUpdate(
            req.params.id,
            { $push: { submissions: submission } },
            { new: true, session }
          );

          // Update enrollment progress
          const examProgress = {
            exam: req.params.id,
            score: grade,
            totalQuestions,
            correctAnswers,
            completedAt: new Date(),
            timeSpent,
          };

          // Check if exam already completed in enrollment
          const examExists = enrollment.progress.examsCompleted.some(
            (e) => e.exam.toString() === req.params.id
          );

          let progressUpdate = {
            $set: { "progress.lastActivityDate": new Date() },
          };

          if (!examExists) {
            progressUpdate.$push = { "progress.examsCompleted": examProgress };
            progressUpdate.$inc = { "progress.totalTimeSpent": timeSpent };
          }

          // Recalculate completion percentage
          const totalExamsCompleted =
            enrollment.progress.examsCompleted.length + (examExists ? 0 : 1);
          const totalLessonsCompleted =
            enrollment.progress.lessonsCompleted.length;
          const estimatedTotalContent = Math.max(
            totalExamsCompleted + totalLessonsCompleted,
            1
          );
          const completionPercentage = Math.min(
            Math.round(
              ((totalExamsCompleted + totalLessonsCompleted) /
                estimatedTotalContent) *
                100
            ),
            100
          );

          progressUpdate.$set["progress.completionPercentage"] =
            completionPercentage;

          // Update status if completed
          if (completionPercentage >= 100) {
            progressUpdate.$set.status = "completed";
          } else if (completionPercentage > 0) {
            progressUpdate.$set.status = "in-progress";
          }

          // Update enrollment atomically
          const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            enrollment._id,
            progressUpdate,
            { new: true, session }
          );

          // Update course stats
          await Course.findByIdAndUpdate(
            exam.course,
            { $inc: { "stats.examSubmissions": 1 } },
            { session }
          );

          return {
            exam: updatedExam,
            enrollment: updatedEnrollment,
            submission: submission,
          };
        }
      );

      res.status(201).json({
        success: true,
        message: "Exam submitted successfully with transaction protection",
        data: {
          submission: result.submission,
          grade: result.submission.grade,
          correctAnswers: result.submission.correctAnswers,
          totalQuestions: result.submission.totalQuestions,
        },
      });
    } catch (error) {
      console.error("Submit exam error:", error);

      // Handle specific transaction errors
      const isValidationError =
        error.message.includes("required") ||
        error.message.includes("submitted") ||
        error.message.includes("enrolled");

      res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: isValidationError
          ? error.message
          : "Server error during exam submission",
      });
    }
  }
);

module.exports = router;
