const CourseService = require("../services/CourseService");

/**
 * Course Controller - Handles HTTP requests for course operations
 */
class CourseController {
  /**
   * Get all courses with filtering and pagination
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

      res.json({
        success: true,
        data: result.courses,
        pagination: result.pagination,
        message: "Courses retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // Optional for enrollment status

      const course = await CourseService.getCourseById(id, userId);

      res.json({
        success: true,
        data: course,
        message: "Course retrieved successfully",
      });
    } catch (error) {
      const statusCode = error.message === "Course not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create new course
   */
  static async createCourse(req, res) {
    try {
      const instructorId = req.user.id;
      const courseData = req.body;

      // Validate instructor role
      if (req.user.role !== "instructor") {
        return res.status(403).json({
          success: false,
          error: "Only instructors can create courses",
        });
      }

      const course = await CourseService.createCourse(courseData, instructorId);

      res.status(201).json({
        success: true,
        data: course,
        message: "Course created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update course
   */
  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const instructorId = req.user.id;

      const course = await CourseService.updateCourse(
        id,
        updateData,
        instructorId
      );

      res.json({
        success: true,
        data: course,
        message: "Course updated successfully",
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
   * Delete course
   */
  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const instructorId = req.user.id;

      const result = await CourseService.deleteCourse(id, instructorId);

      res.json({
        success: true,
        data: result,
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
   * Enroll student in course
   */
  static async enrollStudent(req, res) {
    try {
      const { id } = req.params; // course ID
      const userId = req.user.id;

      // Validate student role
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          error: "Only students can enroll in courses",
        });
      }

      const result = await CourseService.enrollStudent(id, userId);

      res.status(201).json({
        success: true,
        data: result.enrollment,
        message: result.message,
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("full")
        ? 409
        : error.message.includes("Already enrolled")
        ? 409
        : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get course statistics
   */
  static async getCourseStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await CourseService.getCourseStats(id);

      res.json({
        success: true,
        data: stats,
        message: "Course statistics retrieved successfully",
      });
    } catch (error) {
      const statusCode = error.message === "Course not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get courses by instructor
   */
  static async getInstructorCourses(req, res) {
    try {
      const instructorId = req.user.id;

      // Validate instructor role
      if (req.user.role !== "instructor") {
        return res.status(403).json({
          success: false,
          error: "Only instructors can view their courses",
        });
      }

      const options = {
        ...req.query,
        instructor: instructorId,
      };

      const result = await CourseService.getCourses(options);

      res.json({
        success: true,
        data: result.courses,
        pagination: result.pagination,
        message: "Instructor courses retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = CourseController;
