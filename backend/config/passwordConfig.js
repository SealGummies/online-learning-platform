/**
 * Password Configuration and Utilities
 * Centralized password hashing configuration for consistency across the application.
 *
 * @module passwordConfig
 */

const bcrypt = require("bcryptjs");

/**
 * Class representing password-related utilities.
 */
class PasswordConfig {
  /**
   * Get salt rounds from environment variable or default.
   *
   * @static
   * @function getSaltRounds
   * @returns {number} Salt rounds for bcrypt.
   */
  static getSaltRounds() {
    return parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  }

  /**
   * Hash a password using the configured salt rounds.
   *
   * @static
   * @async
   * @function hashPassword
   * @param {string} password - Plain text password.
   * @returns {Promise<string>} Hashed password.
   */
  static async hashPassword(password) {
    const saltRounds = this.getSaltRounds();
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain text password with a hashed password.
   *
   * @static
   * @async
   * @function comparePassword
   * @param {string} password - Plain text password.
   * @param {string} hashedPassword - Hashed password.
   * @returns {Promise<boolean>} True if passwords match.
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength.
   *
   * @static
   * @function validatePasswordStrength
   * @param {string} password - Password to validate.
   * @param {Object} options - Validation options.
   * @param {number} [options.minLength=6] - Minimum length of the password.
   * @param {boolean} [options.requireUppercase=false] - Require at least one uppercase letter.
   * @param {boolean} [options.requireLowercase=false] - Require at least one lowercase letter.
   * @param {boolean} [options.requireNumbers=false] - Require at least one number.
   * @param {boolean} [options.requireSpecialChars=false] - Require at least one special character.
   * @returns {Object} Validation result.
   * @returns {boolean} ValidationResult.isValid - True if the password meets all criteria.
   * @returns {string[]} ValidationResult.errors - List of validation errors.
   */
  static validatePasswordStrength(password, options = {}) {
    const {
      minLength = 6,
      requireUppercase = false,
      requireLowercase = false,
      requireNumbers = false,
      requireSpecialChars = false,
    } = options;

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a secure random password.
   *
   * @static
   * @function generateSecurePassword
   * @param {number} [length=12] - Password length.
   * @param {Object} options - Generation options.
   * @param {boolean} [options.includeUppercase=true] - Include uppercase letters.
   * @param {boolean} [options.includeLowercase=true] - Include lowercase letters.
   * @param {boolean} [options.includeNumbers=true] - Include numbers.
   * @param {boolean} [options.includeSpecialChars=true] - Include special characters.
   * @returns {string} Generated password.
   */
  static generateSecurePassword(length = 12, options = {}) {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSpecialChars = true,
    } = options;

    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSpecialChars) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}

module.exports = PasswordConfig;
