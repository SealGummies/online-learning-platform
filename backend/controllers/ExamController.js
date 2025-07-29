const ExamService = require("../services/ExamService");

/**
 * Exam Controller - Handles HTTP requests for exam operations
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
      
      let exams;
      if (course) {
        // Get exams for specific course
        exams = await ExamService.getExams(course, userId, userRole);
      } else if (userRole === "student") {
        // Get all exams for student across all enrolled courses
        exams = await ExamService.getAllExamsForStudent(userId);
      } else {
        throw new Error("Course parameter is required for non-student users");
      }
      
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
   * Submit exam answers
   * @route POST /api/exams/:id/submit
   * @access Private/Student
   */
  static async submitExam(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const { answers } = req.body;
      
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          message: "Answers are required"
        });
      }

      const result = await ExamService.submitExam(examId, answers, userId);
      res.json({
        success: true,
        data: result,
        message: "Exam submitted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to submit exam",
      });
    }
  }

  /**
   * Get exam results for a student
   * @route GET /api/exams/:id/results
   * @access Private/Student
   */
  static async getExamResults(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const result = await ExamService.getExamResults(examId, userId);
      res.json({
        success: true,
        data: result,
        message: "Exam results retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve exam results",
      });
    }
  }

  /**
   * Get all exam results for a student
   * @route GET /api/exams/results
   * @access Private/Student
   */
  static async getAllExamResults(req, res) {
    try {
      const userId = req.user.id;
      const results = await ExamService.getAllExamResults(userId);
      res.json({
        success: true,
        data: results,
        count: results.length,
        message: "Exam results retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve exam results",
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
      const examData = req.body;
      const exam = await ExamService.createExam(examData, instructorId);
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
      const updateData = req.body;
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
   * Get exam statistics
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
