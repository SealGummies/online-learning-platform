const AuthService = require("../services/AuthService");

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  static async register(req, res) {
    try {
      // Only allow firstName, lastName, email, password, role
      const { firstName, lastName, email, password, role } = req.body;
      const result = await AuthService.register({ firstName, lastName, email, password, role });
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  }

  /**
   * Get current user info
   * @route GET /api/auth/me
   * @access Private
   */
  static async getMe(req, res) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Get me error:", error);
      res.status(404).json({
        success: false,
        message: error.message || "User not found",
      });
    }
  }

  /**
   * Update user info (only firstName, lastName)
   * @route PUT /api/auth/me
   * @access Private
   */
  static async updateProfile(req, res) {
    try {
      // Only allow firstName, lastName
      const { firstName, lastName } = req.body;
      const user = await AuthService.updateProfile(req.user.id, { firstName, lastName });
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Profile update failed",
      });
    }
  }

  /**
   * Change password
   * @route PUT /api/auth/change-password
   * @access Private
   */
  static async changePassword(req, res) {
    try {
      await AuthService.changePassword(req.user.id, req.body);
      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Password change failed",
      });
    }
  }

  /**
   * Forgot password
   * @route POST /api/auth/forgot-password
   * @access Public
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      res.json({
        success: true,
        message: "Password reset instructions sent to email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send reset instructions",
      });
    }
  }

  /**
   * Reset password
   * @route POST /api/auth/reset-password/:token
   * @access Public
   */
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      await AuthService.resetPassword(token, password);
      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Password reset failed",
      });
    }
  }
}

module.exports = AuthController;
