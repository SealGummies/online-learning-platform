const UserService = require("../services/UserService");

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
        count: result.users.length,
        pagination: result.pagination,
        data: { users: result.users },
      });
    } catch (error) {
      console.error("Get users error:", error);
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
        data: { user },
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
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
      const user = await UserService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Create user error:", error);
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
      const user = await UserService.updateUser(req.params.id, req.body);

      res.json({
        success: true,
        message: "User updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update user error:", error);
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
      console.error("Delete user error:", error);
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
        data: { stats },
      });
    } catch (error) {
      console.error("Get user stats error:", error);
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
        message: "User status updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update user status error:", error);
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
      const enrollments = await UserService.getUserEnrollments(
        req.params.id,
        req.query
      );

      res.json({
        success: true,
        count: enrollments.length,
        data: { enrollments },
      });
    } catch (error) {
      console.error("Get user enrollments error:", error);
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
        count: instructors.length,
        data: { instructors },
      });
    } catch (error) {
      console.error("Get instructors error:", error);
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
        count: students.length,
        data: { students },
      });
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve students",
      });
    }
  }
}

module.exports = UserController;
