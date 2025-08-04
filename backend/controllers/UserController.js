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
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for filtering users
   * @param {Object} res - Express response object
   * @returns {void} Sends a list response with user data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the user to retrieve
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with user data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.firstName - First name of the user
   * @param {string} req.body.lastName - Last name of the user
   * @param {string} req.body.email - Email address of the user
   * @param {string} req.body.password - Password for the user
   * @param {string} req.body.role - Role of the user (e.g., admin, instructor, student)
   * @param {boolean} req.body.isActive - Whether the user is active
   * @param {Object} res - Express response object
   * @returns {void} Sends a created response with user data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the user to update
   * @param {Object} req.body - Request body
   * @param {string} [req.body.firstName] - Updated first name of the user
   * @param {string} [req.body.lastName] - Updated last name of the user
   * @param {string} [req.body.role] - Updated role of the user
   * @param {boolean} [req.body.isActive] - Updated active status of the user
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with updated user data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the user to delete
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the user to retrieve statistics for
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with user statistics data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the user to update status for
   * @param {Object} req.body - Request body
   * @param {boolean} req.body.isActive - Updated active status of the user
   * @param {Object} res - Express response object
   * @returns {void} Sends a success response with updated user status or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - ID of the user to retrieve enrollments for
   * @param {Object} req.query - Query parameters for filtering enrollments
   * @param {Object} res - Express response object
   * @returns {void} Sends a list response with user enrollments or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for filtering instructors
   * @param {Object} res - Express response object
   * @returns {void} Sends a list response with instructor data or an error response
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
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for filtering students
   * @param {Object} res - Express response object
   * @returns {void} Sends a list response with student data or an error response
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
