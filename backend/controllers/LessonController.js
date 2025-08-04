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
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.course - ID of the course to retrieve lessons for
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} [req.user.id] - ID of the authenticated user
   * @param {string} [req.user.role] - Role of the authenticated user
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with the list of lessons or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the lesson to retrieve
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} [req.user.id] - ID of the authenticated user
   * @param {string} [req.user.role] - Role of the authenticated user
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with the lesson data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.title - Title of the lesson
   * @param {string} req.body.course - ID of the course the lesson belongs to
   * @param {number} req.body.order - Order of the lesson in the course
   * @param {string} req.body.type - Type of the lesson (e.g., video, quiz)
   * @param {string} req.body.content - Content of the lesson
   * @param {boolean} req.body.isPublished - Whether the lesson is published
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated instructor
   * @param {Object} res - Express response object
   * @returns {void} Sends a created response with the lesson data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the lesson to update
   * @param {Object} req.body - Request body
   * @param {string} [req.body.title] - Updated title of the lesson
   * @param {number} [req.body.order] - Updated order of the lesson in the course
   * @param {string} [req.body.type] - Updated type of the lesson (e.g., video, quiz)
   * @param {string} [req.body.content] - Updated content of the lesson
   * @param {boolean} [req.body.isPublished] - Updated publication status of the lesson
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated instructor
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with the updated lesson data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the lesson to delete
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated instructor
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the lesson to mark as completed
   * @param {Object} req.body - Request body
   * @param {number} req.body.completionPercentage - Percentage of lesson completion
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated student
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with the completion result or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the lesson to retrieve progress for
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated user
   * @param {string} req.user.role - Role of the authenticated user
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with the lesson progress data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the lesson to retrieve statistics for
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated instructor
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with the lesson statistics data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.courseId - ID of the course to reorder lessons for
   * @param {Array<string>} req.body.lessonOrder - Array of lesson IDs in the desired order
   * @param {Object} req.user - User object from authentication middleware
   * @param {string} req.user.id - ID of the authenticated instructor
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response or an error response
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
