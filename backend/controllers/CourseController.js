const CourseService = require("../services/CourseService");
const {
  handleErrorResponse,
  sendListResponse,
  sendSuccessResponse,
  sendCreatedResponse,
} = require("../utils/errorHandler");

/**
 * Controller for handling course-related operations.
 * Provides methods for retrieving, creating, updating, and deleting courses.
 *
 * @module CourseController
 */

/**
 * Course Controller - Handles HTTP requests for course operations (aligned with simplified models)
 */
class CourseController {
  /**
   * Get all courses with filtering.
   * Retrieves a paginated list of courses, optionally filtered by category, level, search, instructor, and sorted.
   *
   * @static
   * @async
   * @function getCourses
   * @memberof CourseController
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Query parameters for filtering and pagination.
   * @param {string} [req.query.category] - Filter by course category.
   * @param {string} [req.query.level] - Filter by course level.
   * @param {string} [req.query.search] - Search term for course title/description.
   * @param {string} [req.query.instructor] - Filter by instructor ID.
   * @param {string} [req.query.sortBy="createdAt"] - Field to sort by.
   * @param {string} [req.query.sortOrder="desc"] - Sort order (asc/desc).
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a list of courses and total count in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getCourses(req, res) {
    try {
      const options = {
        category: req.query.category,
        level: req.query.level,
        search: req.query.search,
        instructor: req.query.instructor,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      };
      const result = await CourseService.getCourses(options);
      return sendListResponse(res, result.courses, "Courses retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve courses");
    }
  }

  /**
   * Get course by ID.
   * Retrieves a single course by its ID, optionally including user context.
   *
   * @static
   * @async
   * @function getCourseById
   * @memberof CourseController
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - Course ID.
   * @param {Object} req.user - Authenticated user object (optional).
   * @param {string} [req.user.id] - User ID (optional).
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends the course details in the response.
   * @throws {Error} If retrieval fails.
   */
  static async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const course = await CourseService.getCourseById(id, userId);
      return sendSuccessResponse(res, course, "Course retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve course");
    }
  }

  /**
   * Create new course
   * @route POST /api/courses
   * @access Private/Instructor
   */
  static async createCourse(req, res) {
    try {
      const instructorId = req.user.id;
      // Only allow fields in simplified model
      const { title, description, category, level, price } = req.body;
      const course = await CourseService.createCourse({ title, description, category, level, price }, instructorId);
      return sendCreatedResponse(res, course, "Course created successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to create course");
    }
  }

  /**
   * Update course
   * @route PUT /api/courses/:id
   * @access Private/Instructor
   */
  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      // Only allow fields in simplified model
      const { title, description, category, level, price, isActive } = req.body;
      const instructorId = req.user.id;
      const updateData = {
        title,
        description,
        category,
        level,
        price,
        isActive,
      };
      const course = await CourseService.updateCourse(id, updateData, instructorId);
      return sendSuccessResponse(res, course, "Course updated successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to update course");
    }
  }

  /**
   * Delete course
   * @route DELETE /api/courses/:id
   * @access Private/Instructor
   */
  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const instructorId = req.user.id;
      const result = await CourseService.deleteCourse(id, instructorId);
      return sendSuccessResponse(res, result, "Course deleted successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to delete course");
    }
  }

  /**
   * Enroll student in course
   * @route POST /api/courses/:id/enroll
   * @access Private/Student
   */
  static async enrollStudent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await CourseService.enrollStudent(id, userId);
      return sendCreatedResponse(res, result.enrollment, "Enrolled in course successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to enroll in course");
    }
  }

  /**
   * Get course statistics
   * @route GET /api/courses/:id/stats
   * @access Public
   */
  static async getCourseStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await CourseService.getCourseStats(id);
      return sendSuccessResponse(res, stats, "Course statistics retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve course statistics");
    }
  }

  /**
   * Get courses by instructor
   * @route GET /api/courses/instructor/my-courses
   * @access Private/Instructor
   */
  static async getInstructorCourses(req, res) {
    try {
      const instructorId = req.user.id;
      const options = {
        ...req.query,
        instructor: instructorId,
      };
      const result = await CourseService.getCourses(options);
      return sendListResponse(res, result.courses, "Instructor courses retrieved successfully", 200, result.total);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve instructor courses");
    }
  }
}

module.exports = CourseController;
