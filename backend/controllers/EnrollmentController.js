const EnrollmentService = require("../services/EnrollmentService");

/**
 * Enrollment Controller - Handles HTTP requests for enrollment operations (aligned with simplified models)
 */
class EnrollmentController {
  /**
   * Get student's enrollments
   * @route GET /api/enrollments
   * @access Private/Student
   */
  static async getStudentEnrollments(req, res) {
    try {
      const studentId = req.user.id;
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
   * @route GET /api/enrollments/:id
   * @access Private/Student
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
   * Update enrollment progress (completionPercentage, finalGrade, status)
   * @route PUT /api/enrollments/:id/progress
   * @access Private/Student
   */
  static async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const progressData = req.body;
      const studentId = req.user.id;
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
   * Withdraw from course
   * @route POST /api/enrollments/:id/withdraw
   * @access Private/Student
   */
  static async withdrawEnrollment(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
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
   * @route GET /api/enrollments/stats
   * @access Private/Student
   */
  static async getStudentStats(req, res) {
    try {
      const studentId = req.user.id;
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
   * Get instructor's course enrollments
   * @route GET /api/enrollments/instructor
   * @access Private/Instructor
   */
  static async getInstructorEnrollments(req, res) {
    try {
      const instructorId = req.user.id;

      // Use the AnalyticsService method we created
      const AnalyticsService = require("../services/AnalyticsService");
      const enrollments = await AnalyticsService.getInstructorEnrollments(
        instructorId
      );

      res.json({
        success: true,
        data: enrollments,
        message: "Instructor enrollments retrieved successfully",
        total: enrollments.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = EnrollmentController;
