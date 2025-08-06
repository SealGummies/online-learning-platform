// Validation Utilities - Form validation and data processing functions
export class ValidationUtils {
  /**
   * Extract and validate form data
   * @param {string} formId - Form element ID
   * @returns {Object} Validated form data
   */
  static extractFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      throw new Error(`Form with ID ${formId} not found`);
    }

    const formData = new FormData(form);
    const userData = {
      firstName: formData.get("firstName")?.trim() || "",
      lastName: formData.get("lastName")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      role: formData.get("role") || "",
    };

    // Only include password if it's provided
    const password = formData.get("password");
    if (password) {
      userData.password = password;
    }

    return userData;
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} True if valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password
   * @returns {Object} Validation result
   */
  static validatePassword(password) {
    const result = {
      isValid: true,
      errors: [],
    };

    if (password.length < 6) {
      result.isValid = false;
      result.errors.push("Password must be at least 6 characters long");
    }

    return result;
  }

  /**
   * Validate user data
   * @param {Object} userData - User data object
   * @returns {Object} Validation result
   */
  static validateUserData(userData) {
    const result = {
      isValid: true,
      errors: [],
    };

    if (!userData.firstName) {
      result.errors.push("First name is required");
    }

    if (!userData.lastName) {
      result.errors.push("Last name is required");
    }

    if (!userData.email) {
      result.errors.push("Email is required");
    } else if (!this.isValidEmail(userData.email)) {
      result.errors.push("Invalid email format");
    }

    if (!userData.role) {
      result.errors.push("Role is required");
    }

    if (userData.password) {
      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        result.errors.push(...passwordValidation.errors);
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Format user data for display
   * @param {Object} user - User object
   * @returns {Object} Formatted user data
   */
  static formatUserForDisplay(user) {
    return {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role?.toUpperCase() || "UNKNOWN",
      status: user.isActive ? "Active" : "Inactive",
      statusClass: user.isActive ? "active" : "inactive",
      roleClass: user.role,
    };
  }
}
