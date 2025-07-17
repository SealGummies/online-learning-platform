const EnrollmentService = require("../services/EnrollmentService");

/**
 * Enrollment Controller - Handles HTTP requests for enrollment operations
 */
class EnrollmentController {
  /**
   * Get student's enrollments
   */
  static async getStudentEnrollments(req, res) {
    try {
      const studentId = req.user.id;

      // Validate student role
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          error: "Only students can view enrollments",
        });
      }

      const options = {
        status: req.query.status,
        sortBy: req.query.sortBy || "enrollmentDate",
        sortOrder: req.query.sortOrder || "desc",
      };

      const enrollments = await EnrollmentService.getStudentEnrollments(
        studentId,
        options
      );

      res.json({
        success: true,
        data: enrollments,
        message: "Enrollments retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get enrollment by ID
   */
  static async getEnrollmentById(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      const enrollment = await EnrollmentService.getEnrollmentById(
        id,
        studentId
      );

      res.json({
        success: true,
        data: enrollment,
        message: "Enrollment retrieved successfully",
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Not authorized")
        ? 403
        : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const progressData = req.body;
      const studentId = req.user.id;

      // Validate student role
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          error: "Only students can update progress",
        });
      }

      const result = await EnrollmentService.updateProgress(
        id,
        progressData,
        studentId
      );

      res.json({
        success: true,
        data: result.enrollment,
        message: result.message,
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Not authorized")
        ? 403
        : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Submit course review
   */
  static async submitReview(req, res) {
    try {
      const { id } = req.params;
      const reviewData = req.body;
      const studentId = req.user.id;

      // Validate student role
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          error: "Only students can submit reviews",
        });
      }

      const result = await EnrollmentService.submitReview(
        id,
        reviewData,
        studentId
      );

      res.json({
        success: true,
        data: result.enrollment,
        message: result.message,
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Not authorized")
        ? 403
        : error.message.includes("already submitted")
        ? 409
        : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Withdraw from course
   */
  static async withdrawEnrollment(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      // Validate student role
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          error: "Only students can withdraw from courses",
        });
      }

      const result = await EnrollmentService.withdrawEnrollment(id, studentId);

      res.json({
        success: true,
        data: result.enrollment,
        message: result.message,
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Not authorized")
        ? 403
        : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get student statistics
   */
  static async getStudentStats(req, res) {
    try {
      const studentId = req.user.id;

      // Validate student role
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          error: "Only students can view their statistics",
        });
      }

      const stats = await EnrollmentService.getStudentStats(studentId);

      res.json({
        success: true,
        data: stats,
        message: "Student statistics retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get enrollment progress details
   */
  static async getProgressDetails(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      const enrollment = await EnrollmentService.getEnrollmentById(
        id,
        studentId
      );

      // Extract progress details
      const progressDetails = {
        enrollmentId: enrollment._id,
        courseTitle: enrollment.course.title,
        overallProgress: enrollment.progress,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        completionDate: enrollment.completionDate,
        lessonsCompleted: enrollment.lessonsCompleted,
        totalLessons: enrollment.course.lessons?.length || 0,
        timeSpent: enrollment.lessonsCompleted.reduce(
          (total, lesson) => total + (lesson.timeSpent || 0),
          0
        ),
        averageScore:
          enrollment.lessonsCompleted.length > 0
            ? enrollment.lessonsCompleted
                .filter((lesson) => lesson.score !== null)
                .reduce(
                  (sum, lesson, _, arr) => sum + lesson.score / arr.length,
                  0
                )
            : null,
      };

      res.json({
        success: true,
        data: progressDetails,
        message: "Progress details retrieved successfully",
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Not authorized")
        ? 403
        : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = EnrollmentController;
