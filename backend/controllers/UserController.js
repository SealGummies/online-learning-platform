const UserService = require("../services/UserService");

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
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
        count: result.users.length,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve users",
      });
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
      res.json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "User not found",
      });
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
      res.status(201).json({
        success: true,
        data: user,
        message: "User created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "User creation failed",
      });
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
      res.json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "User update failed",
      });
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
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "User deletion failed",
      });
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
      res.json({
        success: true,
        data: stats,
        message: "User statistics retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve user statistics",
      });
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
      res.json({
        success: true,
        data: user,
        message: "User status updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Status update failed",
      });
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
      res.json({
        success: true,
        data: enrollments,
        count: enrollments.length,
        message: "User enrollments retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve user enrollments",
      });
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
      res.json({
        success: true,
        data: instructors,
        count: instructors.length,
        message: "Instructors retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve instructors",
      });
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
      res.json({
        success: true,
        data: students,
        count: students.length,
        message: "Students retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve students",
      });
    }
  }
}

module.exports = UserController;
