const ExamService = require("../services/ExamService");

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
        count: exams.length,
        data: { exams },
      });
    } catch (error) {
      console.error("Get exams error:", error);
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
        data: { exam },
      });
    } catch (error) {
      console.error("Get exam by ID error:", error);
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
      const exam = await ExamService.createExam(req.body, instructorId);

      res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: { exam },
      });
    } catch (error) {
      console.error("Create exam error:", error);
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

      const exam = await ExamService.updateExam(examId, req.body, instructorId);

      res.json({
        success: true,
        message: "Exam updated successfully",
        data: { exam },
      });
    } catch (error) {
      console.error("Update exam error:", error);
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
      console.error("Delete exam error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Exam deletion failed",
      });
    }
  }

  /**
   * Submit exam attempt
   * @route POST /api/exams/:id/submit
   * @access Private/Student
   */
  static async submitExam(req, res) {
    try {
      const examId = req.params.id;
      const studentId = req.user.id;
      const { answers } = req.body;

      const result = await ExamService.submitExam(examId, studentId, answers);

      res.json({
        success: true,
        message: "Exam submitted successfully",
        data: { result },
      });
    } catch (error) {
      console.error("Submit exam error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Exam submission failed",
      });
    }
  }

  /**
   * Get exam attempts for a student
   * @route GET /api/exams/:id/attempts
   * @access Private
   */
  static async getExamAttempts(req, res) {
    try {
      const examId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const attempts = await ExamService.getExamAttempts(
        examId,
        userId,
        userRole
      );

      res.json({
        success: true,
        count: attempts.length,
        data: { attempts },
      });
    } catch (error) {
      console.error("Get exam attempts error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve exam attempts",
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
        data: { stats },
      });
    } catch (error) {
      console.error("Get exam stats error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve exam statistics",
      });
    }
  }

  /**
   * Grade exam manually (for subjective questions)
   * @route POST /api/exams/:examId/attempts/:attemptId/grade
   * @access Private/Instructor
   */
  static async gradeExam(req, res) {
    try {
      const { examId, attemptId } = req.params;
      const instructorId = req.user.id;
      const { grades, feedback } = req.body;

      const result = await ExamService.gradeExam(
        examId,
        attemptId,
        grades,
        feedback,
        instructorId
      );

      res.json({
        success: true,
        message: "Exam graded successfully",
        data: { result },
      });
    } catch (error) {
      console.error("Grade exam error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Exam grading failed",
      });
    }
  }
}

module.exports = ExamController;
