const ExamService = require("../services/ExamService");

/**
 * Exam Controller - Handles HTTP requests for exam operations (aligned with simplified models)
 */
class ExamController {
  /**
   * Get exams for a course
   * @route GET /api/exams?course=:courseId
   * @access Private
   */
  static async getExams(req, res) {
    try {
      const { course } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;
      const exams = await ExamService.getExams(course, userId, userRole);
      res.json({
        success: true,
        data: exams,
        count: exams.length,
        message: "Exams retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve exams",
      });
    }
  }

  /**
   * Get exam by ID
   * @route GET /api/exams/:id
   * @access Private
   */
  static async getExamById(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;
      const exam = await ExamService.getExamById(examId, userId, userRole);
      res.json({
        success: true,
        data: exam,
        message: "Exam retrieved successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Exam not found",
      });
    }
  }

  /**
   * Create a new exam
   * @route POST /api/exams
   * @access Private/Instructor
   */
  static async createExam(req, res) {
    try {
      const instructorId = req.user.id;
      // Only allow fields in simplified model
      const { title, description, course, type, isActive } = req.body;
      const exam = await ExamService.createExam({ title, description, course, type, isActive }, instructorId);
      res.status(201).json({
        success: true,
        data: exam,
        message: "Exam created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Exam creation failed",
      });
    }
  }

  /**
   * Update an exam
   * @route PUT /api/exams/:id
   * @access Private/Instructor
   */
  static async updateExam(req, res) {
    try {
      const examId = req.params.id;
      const instructorId = req.user.id;
      // Only allow fields in simplified model
      const { title, description, type, isActive } = req.body;
      const updateData = { title, description, type, isActive };
      const exam = await ExamService.updateExam(examId, updateData, instructorId);
      res.json({
        success: true,
        data: exam,
        message: "Exam updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Exam update failed",
      });
    }
  }

  /**
   * Delete an exam
   * @route DELETE /api/exams/:id
   * @access Private/Instructor
   */
  static async deleteExam(req, res) {
    try {
      const examId = req.params.id;
      const instructorId = req.user.id;
      await ExamService.deleteExam(examId, instructorId);
      res.json({
        success: true,
        message: "Exam deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Exam deletion failed",
      });
    }
  }

  /**
   * Get exam statistics (if supported)
   * @route GET /api/exams/:id/stats
   * @access Private/Instructor
   */
  static async getExamStats(req, res) {
    try {
      const examId = req.params.id;
      const instructorId = req.user.id;
      const stats = await ExamService.getExamStats(examId, instructorId);
      res.json({
        success: true,
        data: stats,
        message: "Exam statistics retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve exam statistics",
      });
    }
  }
}

module.exports = ExamController;
