const LessonService = require("../services/LessonService");

class LessonController {
  /**
   * Get lessons for a course
   * @route GET /api/lessons?course=:courseId
   * @access Public (for published courses)
   */
  static async getLessons(req, res) {
    try {
      const { course } = req.query;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const lessons = await LessonService.getLessons(course, userId, userRole);

      res.json({
        success: true,
        count: lessons.length,
        data: { lessons },
      });
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve lessons",
      });
    }
  }

  /**
   * Get lesson by ID
   * @route GET /api/lessons/:id
   * @access Public/Private (depends on course status)
   */
  static async getLessonById(req, res) {
    try {
      const lessonId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const lesson = await LessonService.getLessonById(
        lessonId,
        userId,
        userRole
      );

      res.json({
        success: true,
        data: { lesson },
      });
    } catch (error) {
      console.error("Get lesson by ID error:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Lesson not found",
      });
    }
  }

  /**
   * Create a new lesson
   * @route POST /api/lessons
   * @access Private/Instructor
   */
  static async createLesson(req, res) {
    try {
      const instructorId = req.user.id;
      const lesson = await LessonService.createLesson(req.body, instructorId);

      res.status(201).json({
        success: true,
        message: "Lesson created successfully",
        data: { lesson },
      });
    } catch (error) {
      console.error("Create lesson error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lesson creation failed",
      });
    }
  }

  /**
   * Update a lesson
   * @route PUT /api/lessons/:id
   * @access Private/Instructor
   */
  static async updateLesson(req, res) {
    try {
      const lessonId = req.params.id;
      const instructorId = req.user.id;

      const lesson = await LessonService.updateLesson(
        lessonId,
        req.body,
        instructorId
      );

      res.json({
        success: true,
        message: "Lesson updated successfully",
        data: { lesson },
      });
    } catch (error) {
      console.error("Update lesson error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lesson update failed",
      });
    }
  }

  /**
   * Delete a lesson
   * @route DELETE /api/lessons/:id
   * @access Private/Instructor
   */
  static async deleteLesson(req, res) {
    try {
      const lessonId = req.params.id;
      const instructorId = req.user.id;

      await LessonService.deleteLesson(lessonId, instructorId);

      res.json({
        success: true,
        message: "Lesson deleted successfully",
      });
    } catch (error) {
      console.error("Delete lesson error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lesson deletion failed",
      });
    }
  }

  /**
   * Mark lesson as completed
   * @route POST /api/lessons/:id/complete
   * @access Private/Student
   */
  static async completeLesson(req, res) {
    try {
      const lessonId = req.params.id;
      const studentId = req.user.id;
      const { timeSpent, notes } = req.body;

      const result = await LessonService.completeLesson(lessonId, studentId, {
        timeSpent,
        notes,
      });

      res.json({
        success: true,
        message: "Lesson marked as completed",
        data: { result },
      });
    } catch (error) {
      console.error("Complete lesson error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to mark lesson as completed",
      });
    }
  }

  /**
   * Get lesson progress for a student
   * @route GET /api/lessons/:id/progress
   * @access Private
   */
  static async getLessonProgress(req, res) {
    try {
      const lessonId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const progress = await LessonService.getLessonProgress(
        lessonId,
        userId,
        userRole
      );

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      console.error("Get lesson progress error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve lesson progress",
      });
    }
  }

  /**
   * Get lesson statistics
   * @route GET /api/lessons/:id/stats
   * @access Private/Instructor
   */
  static async getLessonStats(req, res) {
    try {
      const lessonId = req.params.id;
      const instructorId = req.user.id;

      const stats = await LessonService.getLessonStats(lessonId, instructorId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      console.error("Get lesson stats error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve lesson statistics",
      });
    }
  }

  /**
   * Reorder lessons in a course
   * @route PUT /api/lessons/reorder
   * @access Private/Instructor
   */
  static async reorderLessons(req, res) {
    try {
      const instructorId = req.user.id;
      const { courseId, lessonOrder } = req.body;

      await LessonService.reorderLessons(courseId, lessonOrder, instructorId);

      res.json({
        success: true,
        message: "Lessons reordered successfully",
      });
    } catch (error) {
      console.error("Reorder lessons error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reorder lessons",
      });
    }
  }
}

module.exports = LessonController;
