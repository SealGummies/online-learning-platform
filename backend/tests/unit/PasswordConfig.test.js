require("dotenv").config();
const PasswordConfig = require("../../config/passwordConfig");

describe("PasswordConfig Unit Tests", () => {
  beforeAll(() => {
    // Set a low salt rounds for testing to speed up tests
    process.env.BCRYPT_SALT_ROUNDS = "1";
  });

  afterAll(() => {
    // Reset to default
    delete process.env.BCRYPT_SALT_ROUNDS;
  });

  describe("getSaltRounds", () => {
    test("should return salt rounds from environment variable", () => {
      process.env.BCRYPT_SALT_ROUNDS = "10";
      expect(PasswordConfig.getSaltRounds()).toBe(10);
    });

    test("should return default salt rounds when env var not set", () => {
      delete process.env.BCRYPT_SALT_ROUNDS;
      expect(PasswordConfig.getSaltRounds()).toBe(12);
    });

    test("should handle invalid environment variable", () => {
      process.env.BCRYPT_SALT_ROUNDS = "invalid";
      expect(PasswordConfig.getSaltRounds()).toBe(12); // Should fall back to default
    });
  });

  describe("hashPassword", () => {
    test("should hash password correctly", async () => {
      const password = "testpassword123";
      const hashedPassword = await PasswordConfig.hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[ab]\$\d+\$.{53}$/); // bcrypt format
    });

    test("should generate different hashes for same password", async () => {
      const password = "testpassword123";
      const hash1 = await PasswordConfig.hashPassword(password);
      const hash2 = await PasswordConfig.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    test("should work with empty string", async () => {
      const hashedPassword = await PasswordConfig.hashPassword("");
      expect(hashedPassword).toBeTruthy();
      expect(typeof hashedPassword).toBe("string");
    });
  });

  describe("comparePassword", () => {
    test("should return true for correct password", async () => {
      const password = "testpassword123";
      const hashedPassword = await PasswordConfig.hashPassword(password);
      const isValid = await PasswordConfig.comparePassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    test("should return false for incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hashedPassword = await PasswordConfig.hashPassword(password);
      const isValid = await PasswordConfig.comparePassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    test("should handle empty password", async () => {
      const hashedPassword = await PasswordConfig.hashPassword("");
      const isValid = await PasswordConfig.comparePassword("", hashedPassword);

      expect(isValid).toBe(true);
    });
  });

  describe("validatePasswordStrength", () => {
    test("should validate minimum length by default", () => {
      const shortPassword = "123";
      const longPassword = "123456";

      const shortResult = PasswordConfig.validatePasswordStrength(shortPassword);
      const longResult = PasswordConfig.validatePasswordStrength(longPassword);

      expect(shortResult.isValid).toBe(false);
      expect(shortResult.errors).toContain("Password must be at least 6 characters long");
      expect(longResult.isValid).toBe(true);
      expect(longResult.errors).toHaveLength(0);
    });

    test("should validate custom minimum length", () => {
      const password = "12345";
      const result = PasswordConfig.validatePasswordStrength(password, { minLength: 8 });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters long");
    });

    test("should validate uppercase requirement", () => {
      const lowercasePassword = "password123";
      const mixedPassword = "Password123";

      const lowercaseResult = PasswordConfig.validatePasswordStrength(lowercasePassword, { requireUppercase: true });
      const mixedResult = PasswordConfig.validatePasswordStrength(mixedPassword, { requireUppercase: true });

      expect(lowercaseResult.isValid).toBe(false);
      expect(lowercaseResult.errors).toContain("Password must contain at least one uppercase letter");
      expect(mixedResult.isValid).toBe(true);
    });

    test("should validate lowercase requirement", () => {
      const uppercasePassword = "PASSWORD123";
      const mixedPassword = "Password123";

      const uppercaseResult = PasswordConfig.validatePasswordStrength(uppercasePassword, { requireLowercase: true });
      const mixedResult = PasswordConfig.validatePasswordStrength(mixedPassword, { requireLowercase: true });

      expect(uppercaseResult.isValid).toBe(false);
      expect(uppercaseResult.errors).toContain("Password must contain at least one lowercase letter");
      expect(mixedResult.isValid).toBe(true);
    });

    test("should validate numbers requirement", () => {
      const letterPassword = "Password";
      const mixedPassword = "Password123";

      const letterResult = PasswordConfig.validatePasswordStrength(letterPassword, { requireNumbers: true });
      const mixedResult = PasswordConfig.validatePasswordStrength(mixedPassword, { requireNumbers: true });

      expect(letterResult.isValid).toBe(false);
      expect(letterResult.errors).toContain("Password must contain at least one number");
      expect(mixedResult.isValid).toBe(true);
    });

    test("should validate special characters requirement", () => {
      const simplePassword = "Password123";
      const complexPassword = "Password123!";

      const simpleResult = PasswordConfig.validatePasswordStrength(simplePassword, { requireSpecialChars: true });
      const complexResult = PasswordConfig.validatePasswordStrength(complexPassword, { requireSpecialChars: true });

      expect(simpleResult.isValid).toBe(false);
      expect(simpleResult.errors).toContain("Password must contain at least one special character");
      expect(complexResult.isValid).toBe(true);
    });

    test("should validate all requirements together", () => {
      const weakPassword = "weak";
      const strongPassword = "StrongPass123!";

      const options = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      };

      const weakResult = PasswordConfig.validatePasswordStrength(weakPassword, options);
      const strongResult = PasswordConfig.validatePasswordStrength(strongPassword, options);

      expect(weakResult.isValid).toBe(false);
      expect(weakResult.errors.length).toBeGreaterThan(1);
      expect(strongResult.isValid).toBe(true);
      expect(strongResult.errors).toHaveLength(0);
    });
  });

  describe("generateSecurePassword", () => {
    test("should generate password with default length", () => {
      const password = PasswordConfig.generateSecurePassword();
      expect(password).toBeTruthy();
      expect(password.length).toBe(12);
    });

    test("should generate password with custom length", () => {
      const password = PasswordConfig.generateSecurePassword(16);
      expect(password.length).toBe(16);
    });

    test("should include uppercase letters by default", () => {
      const password = PasswordConfig.generateSecurePassword(50); // Longer for better chance
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    test("should include lowercase letters by default", () => {
      const password = PasswordConfig.generateSecurePassword(50);
      expect(/[a-z]/.test(password)).toBe(true);
    });

    test("should include numbers by default", () => {
      const password = PasswordConfig.generateSecurePassword(50);
      expect(/\d/.test(password)).toBe(true);
    });

    test("should include special characters by default", () => {
      const password = PasswordConfig.generateSecurePassword(50);
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
    });

    test("should respect character type options", () => {
      const password = PasswordConfig.generateSecurePassword(20, {
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSpecialChars: false,
      });

      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(false);
      expect(/\d/.test(password)).toBe(false);
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(false);
    });

    test("should generate different passwords each time", () => {
      const password1 = PasswordConfig.generateSecurePassword();
      const password2 = PasswordConfig.generateSecurePassword();

      expect(password1).not.toBe(password2);
    });
  });

  describe("integration with actual usage", () => {
    test("should work with realistic password scenarios", async () => {
      const userPassword = "MySecurePassword123!";

      // Test validation
      const validation = PasswordConfig.validatePasswordStrength(userPassword, {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      });

      expect(validation.isValid).toBe(true);

      // Test hashing and comparison
      const hashedPassword = await PasswordConfig.hashPassword(userPassword);
      const isValid = await PasswordConfig.comparePassword(userPassword, hashedPassword);
      const isInvalid = await PasswordConfig.comparePassword("wrongpassword", hashedPassword);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    test("should generate secure passwords that pass validation", async () => {
      const generatedPassword = PasswordConfig.generateSecurePassword(12, {
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSpecialChars: true,
      });

      const validation = PasswordConfig.validatePasswordStrength(generatedPassword, {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      });

      expect(validation.isValid).toBe(true);

      // Should be able to hash and verify
      const hashedPassword = await PasswordConfig.hashPassword(generatedPassword);
      const isValid = await PasswordConfig.comparePassword(generatedPassword, hashedPassword);

      expect(isValid).toBe(true);
    });
  });
});
