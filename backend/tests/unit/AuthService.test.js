require("dotenv").config();
const mongoose = require("mongoose");
const AuthService = require("../../services/AuthService");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PasswordConfig = require("../../config/passwordConfig");

describe("AuthService Unit Tests", () => {
  let testUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/online-learning-test");
    }
  });

  beforeEach(async () => {
    // Clean up any existing test users
    await User.deleteMany({ email: /test.*@example\.com/ });
  });

  afterEach(async () => {
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
      testUser = null;
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("registerUser", () => {
    test("should register a new user successfully", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test.register@example.com",
        password: "testpassword123",
        role: "student",
      };

      const result = await AuthService.registerUser(userData);
      testUser = result.user;

      expect(result.success).toBe(true);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.role).toBe(userData.role);
      expect(result.token).toBeDefined();
      expect(result.user.password).toBeUndefined(); // Should not return password
    });

    test("should throw error for duplicate email", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test.duplicate@example.com",
        password: "testpassword123",
        role: "student",
      };

      // Create first user
      await AuthService.registerUser(userData);

      // Try to create duplicate
      await expect(AuthService.registerUser(userData)).rejects.toThrow("Email already registered");

      // Cleanup
      await User.findOneAndDelete({ email: userData.email });
    });

    test("should hash password correctly", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test.password@example.com",
        password: "testpassword123",
        role: "student",
      };

      const result = await AuthService.registerUser(userData);
      testUser = result.user;

      const dbUser = await User.findById(result.user._id);
      expect(dbUser.password).not.toBe(userData.password);
      expect(await PasswordConfig.comparePassword(userData.password, dbUser.password)).toBe(true);
    });
  });

  describe("loginUser", () => {
    beforeEach(async () => {
      // Create test user for login tests
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test.login@example.com",
        password: "testpassword123",
        role: "student",
      };
      const result = await AuthService.registerUser(userData);
      testUser = result.user;
    });

    test("should login with valid credentials", async () => {
      const result = await AuthService.loginUser("test.login@example.com", "testpassword123");

      expect(result.success).toBe(true);
      expect(result.user.email).toBe("test.login@example.com");
      expect(result.token).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    test("should throw error for invalid email", async () => {
      await expect(AuthService.loginUser("nonexistent@example.com", "testpassword123")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    test("should throw error for invalid password", async () => {
      await expect(AuthService.loginUser("test.login@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    test("should throw error for inactive user", async () => {
      // Deactivate user
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      await expect(AuthService.loginUser("test.login@example.com", "testpassword123")).rejects.toThrow(
        "Account is deactivated"
      );
    });
  });

  describe("changePassword", () => {
    beforeEach(async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test.password.change@example.com",
        password: "oldpassword123",
        role: "student",
      };
      const result = await AuthService.registerUser(userData);
      testUser = result.user;
    });

    test("should change password successfully", async () => {
      const result = await AuthService.changePassword(testUser._id, "oldpassword123", "newpassword123");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Password updated successfully");

      // Verify new password works
      const loginResult = await AuthService.loginUser(testUser.email, "newpassword123");
      expect(loginResult.success).toBe(true);
    });

    test("should throw error for incorrect current password", async () => {
      await expect(AuthService.changePassword(testUser._id, "wrongpassword", "newpassword123")).rejects.toThrow(
        "Current password is incorrect"
      );
    });

    test("should throw error for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(AuthService.changePassword(fakeId, "oldpassword123", "newpassword123")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("generateToken", () => {
    test("should generate valid JWT token", () => {
      const userData = {
        _id: new mongoose.Types.ObjectId(),
        email: "test@example.com",
        role: "student",
      };

      const token = AuthService.generateToken(userData);
      expect(token).toBeDefined();

      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userData._id.toString());
      expect(decoded.email).toBe(userData.email);
      expect(decoded.role).toBe(userData.role);
    });
  });

  describe("hashPassword", () => {
    test("should hash password correctly", async () => {
      const password = "testpassword123";
      const hashedPassword = await AuthService.hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[ab]\$\d+\$.{53}$/); // bcrypt format
      expect(await PasswordConfig.comparePassword(password, hashedPassword)).toBe(true);
    });

    test("should generate different hashes for same password", async () => {
      const password = "testpassword123";
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(await PasswordConfig.comparePassword(password, hash1)).toBe(true);
      expect(await PasswordConfig.comparePassword(password, hash2)).toBe(true);
    });
  });

  describe("validatePassword", () => {
    test("should validate correct password", async () => {
      const password = "testpassword123";
      const hashedPassword = await AuthService.hashPassword(password);

      const isValid = await AuthService.validatePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      const password = "testpassword123";
      const hashedPassword = await AuthService.hashPassword(password);

      const isValid = await AuthService.validatePassword("wrongpassword", hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});
