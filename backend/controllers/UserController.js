const UserService = require("../services/UserService");
const {
  handleErrorResponse,
  sendSuccessResponse,
  sendListResponse,
  sendCreatedResponse,
  sendMessageResponse,
} = require("../utils/errorHandler");

/**
 * User Controller - Handles HTTP requests for user operations (aligned with simplified models)
 */
class UserController {
  /**
   * Get all users (admin only)
   * @route GET /api/users
   * @access Private/Admin
   */
  static async getUsers(req, res) {
    try {
      const result = await UserService.getUsers(req.query);
      sendListResponse(res, result.users, "Users retrieved successfully", 200, result.total);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve users");
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   * @access Private/Admin
   */
  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      sendSuccessResponse(res, user, "User retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve user");
    }
  }

  /**
   * Create new user (admin only)
   * @route POST /api/users
   * @access Private/Admin
   */
  static async createUser(req, res) {
    try {
      // Only allow fields in simplified model
      const { firstName, lastName, email, password, role, isActive } = req.body;
      const user = await UserService.createUser({ firstName, lastName, email, password, role, isActive });
      sendCreatedResponse(res, user, "User created successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to create user");
    }
  }

  /**
   * Update user
   * @route PUT /api/users/:id
   * @access Private/Admin
   */
  static async updateUser(req, res) {
    try {
      // Only allow fields in simplified model
      const { firstName, lastName, role, isActive } = req.body;
      const user = await UserService.updateUser(req.params.id, { firstName, lastName, role, isActive });
      sendSuccessResponse(res, user, "User updated successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to update user");
    }
  }

  /**
   * Delete user
   * @route DELETE /api/users/:id
   * @access Private/Admin
   */
  static async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      sendMessageResponse(res, "User deleted successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to delete user");
    }
  }

  /**
   * Get user statistics
   * @route GET /api/users/:id/stats
   * @access Private
   */
  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats(req.params.id);
      sendSuccessResponse(res, stats, "User statistics retrieved successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve user statistics");
    }
  }

  /**
   * Update user status
   * @route PATCH /api/users/:id/status
   * @access Private/Admin
   */
  static async updateUserStatus(req, res) {
    try {
      const { isActive } = req.body;
      const user = await UserService.updateUserStatus(req.params.id, isActive);
      sendSuccessResponse(res, user, "User status updated successfully");
    } catch (error) {
      handleErrorResponse(error, res, "Failed to update user status");
    }
  }

  /**
   * Get user enrollments
   * @route GET /api/users/:id/enrollments
   * @access Private
   */
  static async getUserEnrollments(req, res) {
    try {
      const enrollments = await UserService.getUserEnrollments(req.params.id, req.query);
      sendListResponse(res, enrollments, "User enrollments retrieved successfully", 200, enrollments.length);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve user enrollments");
    }
  }

  /**
   * Get instructors
   * @route GET /api/users/instructors
   * @access Private/Admin
   */
  static async getInstructors(req, res) {
    try {
      const instructors = await UserService.getInstructors(req.query);
      sendListResponse(res, instructors, "Instructors retrieved successfully", 200, instructors.length);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve instructors");
    }
  }

  /**
   * Get students
   * @route GET /api/users/students
   * @access Private/Admin
   */
  static async getStudents(req, res) {
    try {
      const students = await UserService.getStudents(req.query);
      sendListResponse(res, students, "Students retrieved successfully", 200, students.length);
    } catch (error) {
      handleErrorResponse(error, res, "Failed to retrieve students");
    }
  }
}

module.exports = UserController;
