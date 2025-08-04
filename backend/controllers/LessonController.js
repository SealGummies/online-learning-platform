const LessonService = require("../services/LessonService");
const {
  handleErrorResponse,
  sendSuccessResponse,
  sendListResponse,
  sendCreatedResponse,
  sendMessageResponse,
} = require("../utils/errorHandler");

/**
 * Lesson Controller - Handles HTTP requests for lesson operations (aligned with simplified models)
 */
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
      sendListResponse(res, lessons, "Lessons retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve lessons");
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
      const lesson = await LessonService.getLessonById(lessonId, userId, userRole);
      sendSuccessResponse(res, lesson, "Lesson retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve lesson");
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
      // Only allow fields in simplified model
      const { title, course, order, type, content, isPublished } = req.body;
      const lesson = await LessonService.createLesson(
        { title, course, order, type, content, isPublished },
        instructorId
      );
      sendCreatedResponse(res, lesson, "Lesson created successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to create lesson");
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
      // Only allow fields in simplified model
      const { title, order, type, content, isPublished } = req.body;
      const updateData = { title, order, type, content, isPublished };
      const lesson = await LessonService.updateLesson(lessonId, updateData, instructorId);
      sendSuccessResponse(res, lesson, "Lesson updated successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to update lesson");
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
      sendMessageResponse(res, "Lesson deleted successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to delete lesson");
    }
  }

  /**
   * Complete a lesson (increase completionPercentage)
   * @route POST /api/lessons/:id/complete
   * @access Private/Student
   */
  static async completeLesson(req, res) {
    try {
      const lessonId = req.params.id;
      const studentId = req.user.id;
      const { completionPercentage } = req.body;
      const result = await LessonService.completeLesson(lessonId, studentId, { completionPercentage });
      sendSuccessResponse(res, result, "Lesson marked as completed");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to complete lesson");
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
      const progress = await LessonService.getLessonProgress(lessonId, userId, userRole);
      sendSuccessResponse(res, progress, "Lesson progress retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve lesson progress");
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
      sendSuccessResponse(res, stats, "Lesson statistics retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve lesson statistics");
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
      sendMessageResponse(res, "Lessons reordered successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to reorder lessons");
    }
  }
}

module.exports = LessonController;
