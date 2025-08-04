const CourseService = require("../services/CourseService");
const {
  handleErrorResponse,
  sendListResponse,
  sendSuccessResponse,
  sendCreatedResponse,
} = require("../utils/errorHandler");

/**
 * Course Controller - Handles HTTP requests for course operations (aligned with simplified models)
 */
class CourseController {
  /**
   * Get all courses with filtering
   * @route GET /api/courses
   * @access Public
   */
  static async getCourses(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        category: req.query.category,
        level: req.query.level,
        search: req.query.search,
        instructor: req.query.instructor,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      };
      const result = await CourseService.getCourses(options);
      return sendListResponse(res, result.courses, "Courses retrieved successfully", 200, result.total);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve courses");
    }
  }

  /**
   * Get course by ID
   * @route GET /api/courses/:id
   * @access Public
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
