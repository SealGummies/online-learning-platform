const AuthService = require("../services/AuthService");
const {
  handleErrorResponse,
  sendSuccessResponse,
  sendCreatedResponse,
  sendMessageResponse,
} = require("../utils/errorHandler");

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
      const result = await AuthService.register({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      return sendCreatedResponse(
        res,
        {
          user: result.user,
          token: result.token,
        },
        "User registered successfully"
      );
    } catch (error) {
      console.error("Register error:", error);
      handleErrorResponse(error, res, "Registration failed");
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
      return sendSuccessResponse(
        res,
        {
          user: result.user,
          token: result.token,
        },
        "Login successful"
      );
    } catch (error) {
      console.error("Login error:", error);
      handleErrorResponse(error, res, "Invalid credentials");
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
      return sendSuccessResponse(res, { user }, "User information retrieved successfully");
    } catch (error) {
      console.error("Get me error:", error);
      handleErrorResponse(error, res, "Failed to retrieve user");
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
      const user = await AuthService.updateProfile(req.user.id, {
        firstName,
        lastName,
      });
      return sendSuccessResponse(res, { user }, "Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      handleErrorResponse(error, res, "Profile update failed");
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
      return sendMessageResponse(res, "Password changed successfully");
    } catch (error) {
      console.error("Change password error:", error);
      handleErrorResponse(error, res, "Password change failed");
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
      return sendMessageResponse(res, "Password reset instructions sent to email");
    } catch (error) {
      console.error("Forgot password error:", error);
      handleErrorResponse(error, res, "Failed to send reset instructions");
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
      return sendMessageResponse(res, "Password reset successfully");
    } catch (error) {
      console.error("Reset password error:", error);
      handleErrorResponse(error, res, "Password reset failed");
    }
  }
}

module.exports = AuthController;
