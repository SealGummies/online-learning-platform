const mongoose = require("mongoose");
const UserService = require("../../services/UserService");
const User = require("../../models/User");

describe("UserService Unit Tests", () => {
    let testUser;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/online-learning-test");
        }
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

    test("should create a new user", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        const user = await UserService.createUser(userData);
        testUser = user;
        expect(user.email).toBe(userData.email);
        expect(user.firstName).toBe(userData.firstName);
        expect(user.role).toBe(userData.role);
        expect(user.password).toBeUndefined();
    });

    test("should not create user with duplicate email", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-dup-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        await UserService.createUser(userData);
        await expect(UserService.createUser(userData)).rejects.toThrow();
        await User.findOneAndDelete({ email: userData.email });
    });

    test("should get user by id", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-get-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        const user = await UserService.createUser(userData);
        testUser = user;
        const found = await UserService.getUserById(user._id);
        expect(found.email).toBe(userData.email);
    });

    test("should update user", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-update-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        const user = await UserService.createUser(userData);
        testUser = user;
        const updated = await UserService.updateUser(user._id, { firstName: "Updated" });
        expect(updated.firstName).toBe("Updated");
    });

    test("should delete user", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-delete-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        const user = await UserService.createUser(userData);
        const result = await UserService.deleteUser(user._id);
        expect(result.message).toMatch(/deleted/i);
        // 检查用户已被软删除
        const deleted = await User.findById(user._id);
        expect(deleted.isActive).toBe(false);
    });

    test("should update user status", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-status-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        const user = await UserService.createUser(userData);
        testUser = user;
        const updated = await UserService.updateUserStatus(user._id, false);
        expect(updated.isActive).toBe(false);
    });

    test("should get user stats", async () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: `user-stats-${Date.now()}@example.com`,
            password: "testpassword",
            role: "student",
        };
        const user = await UserService.createUser(userData);
        testUser = user;
        const stats = await UserService.getUserStats(user._id);
        expect(stats.general).toBeDefined();
        expect(stats.general.isActive).toBe(true);
    });
}); 