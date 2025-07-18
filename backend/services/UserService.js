const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const TransactionService = require("./TransactionService");

class UserService {
  /**
   * Create a new user (admin function)
   */
  static async createUser(userData) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const { firstName, lastName, email, password, role } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
        throw new Error("User already exists with this email");
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
        profile: {
          bio: "",
          profilePicture: "",
          socialLinks: {},
          preferences: {
            emailNotifications: true,
            pushNotifications: true,
            language: "en",
          },
        },
      });

      await user.save({ session });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    });
  }

  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (queryParams.role) query.role = queryParams.role;
    if (queryParams.isActive !== undefined) {
      query.isActive = queryParams.isActive === "true";
    }
    if (queryParams.search) {
      query.$or = [
        { firstName: { $regex: queryParams.search, $options: "i" } },
        { lastName: { $regex: queryParams.search, $options: "i" } },
        { email: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * Update user (admin function)
   */
  static async updateUser(userId, updateData) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const allowedUpdates = [
        "firstName",
        "lastName",
        "role",
        "isActive",
        "profile.bio",
        "profile.profilePicture",
        "profile.socialLinks",
        "profile.preferences",
      ];

      // Filter out non-allowed updates
      const filteredData = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key) || key.startsWith("profile.")) {
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

      // Validate role
      if (
        filteredData.role &&
        !["student", "instructor", "admin"].includes(filteredData.role)
      ) {
        throw new Error("Invalid role specified");
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
   * Delete user (soft delete - deactivate)
   */
  static async deleteUser(userId) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user has active enrollments
      const activeEnrollments = await Enrollment.countDocuments({
        student: userId,
        status: "active",
      }).session(session);

      if (activeEnrollments > 0) {
        throw new Error(
          "Cannot delete user with active enrollments. Please complete or withdraw from courses first."
        );
      }

      // Check if user is an instructor with active courses
      if (user.role === "instructor") {
        const activeCourses = await Course.countDocuments({
          instructor: userId,
          status: "published",
        }).session(session);

        if (activeCourses > 0) {
          throw new Error(
            "Cannot delete instructor with active courses. Please archive courses first."
          );
        }
      }

      // Soft delete by deactivating
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`; // Prevent email conflicts
      await user.save({ session });

      return { message: "User deleted successfully" };
    });
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    const stats = {};

    if (user.role === "student") {
      // Get enrollment statistics
      const enrollments = await Enrollment.find({ student: userId });
      const completedCourses = enrollments.filter(
        (e) => e.status === "completed"
      ).length;
      const activeCourses = enrollments.filter(
        (e) => e.status === "active"
      ).length;
      const averageProgress =
        enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) /
            enrollments.length
          : 0;

      stats.student = {
        totalEnrollments: enrollments.length,
        activeCourses,
        completedCourses,
        averageProgress: Math.round(averageProgress),
      };
    } else if (user.role === "instructor") {
      // Get course statistics
      const courses = await Course.find({ instructor: userId });
      const publishedCourses = courses.filter(
        (c) => c.status === "published"
      ).length;
      const totalEnrollments = await Enrollment.countDocuments({
        course: { $in: courses.map((c) => c._id) },
      });

      stats.instructor = {
        totalCourses: courses.length,
        publishedCourses,
        totalStudents: totalEnrollments,
      };
    }

    stats.general = {
      joinDate: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
    };

    return stats;
  }

  /**
   * Update user status (activate/deactivate)
   */
  static async updateUserStatus(userId, isActive) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, session }
      ).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    });
  }

  /**
   * Get user enrollments
   */
  static async getUserEnrollments(userId, queryParams) {
    const query = { student: userId };

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    const enrollments = await Enrollment.find(query)
      .populate("course", "title description instructor category level")
      .sort({ enrolledAt: -1 });

    return enrollments;
  }

  /**
   * Get all instructors
   */
  static async getInstructors(queryParams) {
    const query = { role: "instructor" };

    if (queryParams.isActive !== undefined) {
      query.isActive = queryParams.isActive === "true";
    }

    if (queryParams.search) {
      query.$or = [
        { firstName: { $regex: queryParams.search, $options: "i" } },
        { lastName: { $regex: queryParams.search, $options: "i" } },
        { email: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    const instructors = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return instructors;
  }

  /**
   * Get all students
   */
  static async getStudents(queryParams) {
    const query = { role: "student" };

    if (queryParams.isActive !== undefined) {
      query.isActive = queryParams.isActive === "true";
    }

    if (queryParams.search) {
      query.$or = [
        { firstName: { $regex: queryParams.search, $options: "i" } },
        { lastName: { $regex: queryParams.search, $options: "i" } },
        { email: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return students;
  }

  /**
   * Get user dashboard data
   */
  static async getUserDashboard(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    const dashboard = {
      user,
      stats: await this.getUserStats(userId),
    };

    if (user.role === "student") {
      // Get recent enrollments
      dashboard.recentEnrollments = await Enrollment.find({ student: userId })
        .populate("course", "title description instructor category level")
        .sort({ enrolledAt: -1 })
        .limit(5);
    } else if (user.role === "instructor") {
      // Get recent courses
      dashboard.recentCourses = await Course.find({ instructor: userId })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    return dashboard;
  }
}

module.exports = UserService;
