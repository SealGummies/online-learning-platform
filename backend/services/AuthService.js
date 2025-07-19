const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const TransactionService = require("./TransactionService");

class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(userData) {
    // Handle both userId string and user object for backward compatibility
    const userId = typeof userData === "string" ? userData : userData._id;
    const email = typeof userData === "object" ? userData.email : null;
    const role = typeof userData === "object" ? userData.role : null;

    const payload = { id: userId };
    if (email) payload.email = email;
    if (role) payload.role = role;

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    });
  }

  /**
   * Register a new user
   */
  static async register(userData) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const {
        firstName,
        lastName,
        email,
        password,
        role = "student",
      } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        isActive: true,
      });

      await user.save({ session });

      // Generate token
      const token = this.generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        user: userResponse,
        token,
      };
    });
  }

  /**
   * Login user
   */
  static async login(email, password) {
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    // Find user and include password for comparison
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const allowedUpdates = [
        "firstName",
        "lastName",
      ];
      // Filter out non-allowed updates
      const filteredData = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      // Validate name fields
      if (filteredData.firstName && filteredData.firstName.trim().length < 2) {
        throw new Error("First name must be at least 2 characters long");
      }
      if (filteredData.lastName && filteredData.lastName.trim().length < 2) {
        throw new Error("Last name must be at least 2 characters long");
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: filteredData },
        {
          new: true,
          runValidators: true,
          session,
        }
      ).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    });
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPasswordOrObj, newPassword) {
    // Handle both parameter formats for backward compatibility
    let currentPassword, newPass;

    if (typeof currentPasswordOrObj === "string" && newPassword) {
      // Test format: changePassword(userId, currentPassword, newPassword)
      currentPassword = currentPasswordOrObj;
      newPass = newPassword;
    } else {
      // Object format: changePassword(userId, { currentPassword, newPassword })
      currentPassword = currentPasswordOrObj.currentPassword;
      newPass = currentPasswordOrObj.newPassword;
    }

    return await TransactionService.executeWithTransaction(async (session) => {
      // Find user with password
      const user = await User.findById(userId)
        .select("+password")
        .session(session);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Validate new password
      if (newPass.length < 6) {
        throw new Error("New password must be at least 6 characters long");
      }

      if (newPass === currentPassword) {
        throw new Error("New password must be different from current password");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPass, salt);

      // Update password
      user.password = hashedPassword;
      await user.save({ session });

      return {
        success: true,
        message: "Password updated successfully",
      };
    });
  }

  /**
   * Forgot password (generate reset token)
   */
  static async forgotPassword(email) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).session(session);

      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          message:
            "If an account with that email exists, reset instructions have been sent",
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set reset token and expiry
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save({ session });

      // TODO: Send email with reset token
      // For now, we'll just log it (in production, integrate with email service)
      console.log("Password reset token:", resetToken);
      console.log(
        "Reset URL: http://localhost:3000/reset-password/" + resetToken
      );

      return { message: "Password reset instructions sent to email" };
    });
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token, newPassword) {
    return await TransactionService.executeWithTransaction(async (session) => {
      // Hash the token to compare with stored hash
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() },
      }).session(session);

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ session });

      return { message: "Password reset successfully" };
    });
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Logout user (invalidate token - for future token blacklisting)
   */
  static async logout(token) {
    // TODO: Implement token blacklisting if needed
    // For JWT, logout is typically handled client-side by removing the token
    return { message: "Logged out successfully" };
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Validate password against hash
   */
  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Register user alias for test compatibility
   */
  static async registerUser(userData) {
    const result = await this.register(userData);
    return {
      success: true,
      user: result.user,
      token: result.token,
    };
  }

  /**
   * Login user alias for test compatibility
   */
  static async loginUser(email, password) {
    const result = await this.login(email, password);
    return {
      success: true,
      user: result.user,
      token: result.token,
    };
  }
}

module.exports = AuthService;
