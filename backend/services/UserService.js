const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const TransactionService = require("./TransactionService");
const PasswordConfig = require("../config/passwordConfig");
const PopulateConfig = require("../config/populateConfig");

/**
 * @class UserService
 * @description Service layer for user-related business logic.
 * Handles user CRUD operations, authentication, statistics, and role-based queries.
 * 
 * @requires bcryptjs - Password hashing library
 * @requires ../models/User - User model
 * @requires ../models/Enrollment - Enrollment model
 * @requires ../models/Course - Course model
 * @requires ./TransactionService - Transaction handling service
 * @requires ../config/passwordConfig - Password configuration
 * @requires ../config/populateConfig - Population configuration
 */
class UserService {
  /**
   * Creates a new user with proper validation and password hashing.
   * This is an admin-level function that uses database transactions.
   * 
   * @static
   * @async
   * @method createUser
   * @param {Object} userData - User information for creation
   * @param {string} userData.firstName - User's first name (min 2 characters)
   * @param {string} userData.lastName - User's last name (min 2 characters)
   * @param {string} userData.email - User's email address (must be unique)
   * @param {string} userData.password - User's password (min 6 characters)
   * @param {string} userData.role - User role (student/instructor/admin)
   * @returns {Promise<Object>} Created user object without password field
   * @throws {Error} "User already exists with this email" - If email is already registered
   * @throws {Error} "Password must be at least 6 characters long" - If password is too short
   * @throws {Error} If transaction fails or validation errors occur
   * 
   * @example
   * const newUser = await UserService.createUser({
   *   firstName: "John",
   *   lastName: "Doe",
   *   email: "john.doe@example.com",
   *   password: "securePassword123",
   *   role: "student"
   * });
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

      // Hash password using centralized configuration
      const hashedPassword = await PasswordConfig.hashPassword(password);

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

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    });
  }

  /**
   * Retrieves all users with optional filtering and search capabilities.
   * 
   * @static
   * @async
   * @method getUsers
   * @param {Object} queryParams - Query parameters for filtering
   * @param {string} [queryParams.role] - Filter by user role (student/instructor/admin)
   * @param {string} [queryParams.isActive] - Filter by active status ("true"/"false")
   * @param {string} [queryParams.search] - Search term for firstName, lastName, or email
   * @returns {Promise<Object>} Object containing users array and total count
   * @returns {Array<Object>} returns.users - Array of user documents (without passwords)
   * @returns {number} returns.total - Total count of users matching the query
   * @throws {Error} If database operation fails
   * 
   * @example
   * // Get all active students
   * const result = await UserService.getUsers({
   *   role: "student",
   *   isActive: "true"
   * });
   * 
   * // Search for users by name or email
   * const searchResult = await UserService.getUsers({
   *   search: "john"
   * });
   */
  static async getUsers(queryParams) {
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

    // Get users without pagination
    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    // Get total count
    const total = await User.countDocuments(query);

    return {
      users,
      total,
    };
  }

  /**
   * Retrieves a single user by their ID.
   * 
   * @static
   * @async
   * @method getUserById
   * @param {string} userId - The MongoDB ObjectId of the user
   * @returns {Promise<Object>} User document without password field
   * @throws {Error} "User not found" - If user with given ID doesn't exist
   * @throws {Error} If database operation fails
   * 
   * @example
   * try {
   *   const user = await UserService.getUserById('60a1234567890abcdef12345');
   *   console.log(user.email);
   * } catch (error) {
   *   console.error('User not found');
   * }
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * Updates user information with validation and restrictions.
   * Only allows updating specific fields to maintain data integrity.
   * 
   * @static
   * @async
   * @method updateUser
   * @param {string} userId - The MongoDB ObjectId of the user to update
   * @param {Object} updateData - Fields to update
   * @param {string} [updateData.firstName] - New first name (min 2 characters)
   * @param {string} [updateData.lastName] - New last name (min 2 characters)
   * @param {string} [updateData.role] - New role (student/instructor/admin)
   * @param {boolean} [updateData.isActive] - New active status
   * @returns {Promise<Object>} Updated user document without password
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} "First name must be at least 2 characters long" - If firstName too short
   * @throws {Error} "Last name must be at least 2 characters long" - If lastName too short
   * @throws {Error} "Invalid role specified" - If role is not valid
   * @throws {Error} If transaction fails or validation errors occur
   * 
   * @example
   * const updatedUser = await UserService.updateUser(
   *   '60a1234567890abcdef12345',
   *   {
   *     firstName: "Jane",
   *     role: "instructor"
   *   }
   * );
   */
  static async updateUser(userId, updateData) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const allowedUpdates = ["firstName", "lastName", "role", "isActive"];

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

      // Validate role
      if (filteredData.role && !["student", "instructor", "admin"].includes(filteredData.role)) {
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
   * Performs a soft delete on a user by deactivating their account.
   * Prevents deletion if user has active enrollments or courses.
   * 
   * @static
   * @async
   * @method deleteUser
   * @param {string} userId - The MongoDB ObjectId of the user to delete
   * @returns {Promise<Object>} Success message object
   * @returns {string} returns.message - "User deleted successfully"
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} "Cannot delete user with active enrollments" - If student has active enrollments
   * @throws {Error} "Cannot delete instructor with active courses" - If instructor has active courses
   * @throws {Error} If transaction fails
   * 
   * @example
   * try {
   *   const result = await UserService.deleteUser('60a1234567890abcdef12345');
   *   console.log(result.message); // "User deleted successfully"
   * } catch (error) {
   *   console.error('Cannot delete user:', error.message);
   * }
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
        throw new Error("Cannot delete user with active enrollments. Please complete or withdraw from courses first.");
      }

      // Check if user is an instructor with active courses
      if (user.role === "instructor") {
        const activeCourses = await Course.countDocuments({
          instructor: userId,
          isActive: true,
        }).session(session);

        if (activeCourses > 0) {
          throw new Error("Cannot delete instructor with active courses. Please archive courses first.");
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
   * Retrieves comprehensive statistics for a student user.
   * Uses MongoDB aggregation for efficient calculation.
   * 
   * @static
   * @async
   * @method getStudentStats
   * @param {string} userId - The MongoDB ObjectId of the student
   * @returns {Promise<Object>} Student statistics object
   * @returns {number} returns.totalEnrollments - Total number of course enrollments
   * @returns {number} returns.inProgressCourses - Number of courses currently in progress
   * @returns {number} returns.completedCourses - Number of completed courses
   * @returns {number} returns.averageCompletion - Average completion percentage across all courses
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} "User is not a student" - If user is not a student role
   * @throws {Error} If database operation fails
   * 
   * @example
   * const stats = await UserService.getStudentStats('60a1234567890abcdef12345');
   * console.log(`Completed ${stats.completedCourses} out of ${stats.totalEnrollments} courses`);
   */
  static async getStudentStats(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "student") {
      throw new Error("User is not a student");
    }

    // Get enrollment statistics (use aggregation for performance)
    const statsAgg = await Enrollment.aggregate([
      { $match: { student: user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgCompletion: { $avg: "$completionPercentage" },
        },
      },
    ]);

    let totalEnrollments = 0,
      completedCourses = 0,
      inProgressCourses = 0,
      avgCompletion = 0;
    statsAgg.forEach((s) => {
      totalEnrollments += s.count;
      if (s._id === "completed") completedCourses = s.count;
      if (s._id === "in-progress" || s._id === "enrolled") inProgressCourses += s.count;
      avgCompletion += (s.avgCompletion || 0) * s.count;
    });
    avgCompletion = totalEnrollments > 0 ? Math.round(avgCompletion / totalEnrollments) : 0;

    return {
      totalEnrollments,
      inProgressCourses,
      completedCourses,
      averageCompletion: avgCompletion,
    };
  }

  /**
   * Retrieves comprehensive statistics for an instructor user.
   * 
   * @static
   * @async
   * @method getInstructorStats
   * @param {string} userId - The MongoDB ObjectId of the instructor
   * @returns {Promise<Object>} Instructor statistics object
   * @returns {number} returns.totalCourses - Total number of courses created
   * @returns {number} returns.activeCourses - Number of currently active courses
   * @returns {number} returns.totalStudents - Total number of enrolled students across all courses
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} "User is not an instructor" - If user is not an instructor role
   * @throws {Error} If database operation fails
   * 
   * @example
   * const stats = await UserService.getInstructorStats('60a1234567890abcdef12345');
   * console.log(`Teaching ${stats.activeCourses} active courses with ${stats.totalStudents} students`);
   */
  static async getInstructorStats(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "instructor") {
      throw new Error("User is not an instructor");
    }

    // Get course statistics
    const courses = await Course.find({ instructor: userId });
    const activeCourses = courses.filter((c) => c.isActive).length;
    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courses.map((c) => c._id) },
    });

    return {
      totalCourses: courses.length,
      activeCourses,
      totalStudents: totalEnrollments,
    };
  }

  /**
   * Retrieves statistics for any user type, delegating to role-specific methods.
   * 
   * @static
   * @async
   * @method getUserStats
   * @param {string} userId - The MongoDB ObjectId of the user
   * @returns {Promise<Object>} User statistics object
   * @returns {Object} returns.general - General user information (joinDate, lastLogin, isActive)
   * @returns {Object} [returns.student] - Student-specific stats (if user is student)
   * @returns {Object} [returns.instructor] - Instructor-specific stats (if user is instructor)
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} If database operation fails
   * 
   * @example
   * const stats = await UserService.getUserStats('60a1234567890abcdef12345');
   * if (stats.student) {
   *   console.log('Student stats:', stats.student);
   * } else if (stats.instructor) {
   *   console.log('Instructor stats:', stats.instructor);
   * }
   */
  static async getUserStats(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    const stats = {
      general: {
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      },
    };

    if (user.role === "student") {
      stats.student = await this.getStudentStats(userId);
    } else if (user.role === "instructor") {
      stats.instructor = await this.getInstructorStats(userId);
    }

    return stats;
  }

  /**
   * Updates a user's active status (activate or deactivate account).
   * 
   * @static
   * @async
   * @method updateUserStatus
   * @param {string} userId - The MongoDB ObjectId of the user
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated user document without password
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} If transaction fails
   * 
   * @example
   * // Deactivate a user
   * const user = await UserService.updateUserStatus('60a1234567890abcdef12345', false);
   * 
   * // Reactivate a user
   * const activeUser = await UserService.updateUserStatus('60a1234567890abcdef12345', true);
   */
  static async updateUserStatus(userId, isActive) {
    return await TransactionService.executeWithTransaction(async (session) => {
      const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true, session }).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    });
  }

  /**
   * Retrieves all enrollments for a specific user with optional status filtering.
   * 
   * @static
   * @async
   * @method getUserEnrollments
   * @param {string} userId - The MongoDB ObjectId of the user
   * @param {Object} queryParams - Query parameters for filtering
   * @param {string} [queryParams.status] - Filter by enrollment status
   * @returns {Promise<Array<Object>>} Array of enrollment documents with populated course info
   * @throws {Error} If database operation fails
   * 
   * @example
   * // Get all enrollments
   * const enrollments = await UserService.getUserEnrollments('60a1234567890abcdef12345', {});
   * 
   * // Get only completed enrollments
   * const completed = await UserService.getUserEnrollments('60a1234567890abcdef12345', {
   *   status: 'completed'
   * });
   */
  static async getUserEnrollments(userId, queryParams) {
    const query = { student: userId };

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    const enrollments = await Enrollment.find(query)
      .populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor")
      .sort({ enrollmentDate: -1 });

    return enrollments;
  }

  /**
   * Retrieves all users with instructor role, with optional filtering.
   * 
   * @static
   * @async
   * @method getInstructors
   * @param {Object} queryParams - Query parameters for filtering
   * @param {string} [queryParams.isActive] - Filter by active status ("true"/"false")
   * @param {string} [queryParams.search] - Search term for names or email
   * @returns {Promise<Array<Object>>} Array of instructor documents without passwords
   * @throws {Error} If database operation fails
   * 
   * @example
   * // Get all active instructors
   * const activeInstructors = await UserService.getInstructors({ isActive: "true" });
   * 
   * // Search for instructors
   * const results = await UserService.getInstructors({ search: "smith" });
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

    const instructors = await User.find(query).select("-password").sort({ createdAt: -1 });

    return instructors;
  }

  /**
   * Retrieves all users with student role, with optional filtering.
   * 
   * @static
   * @async
   * @method getStudents
   * @param {Object} queryParams - Query parameters for filtering
   * @param {string} [queryParams.isActive] - Filter by active status ("true"/"false")
   * @param {string} [queryParams.search] - Search term for names or email
   * @returns {Promise<Array<Object>>} Array of student documents without passwords
   * @throws {Error} If database operation fails
   * 
   * @example
   * // Get all students
   * const allStudents = await UserService.getStudents({});
   * 
   * // Get inactive students
   * const inactiveStudents = await UserService.getStudents({ isActive: "false" });
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

    const students = await User.find(query).select("-password").sort({ createdAt: -1 });

    return students;
  }

  /**
   * Retrieves comprehensive dashboard data for a user including stats and recent activity.
   * 
   * @static
   * @async
   * @method getUserDashboard
   * @param {string} userId - The MongoDB ObjectId of the user
   * @returns {Promise<Object>} Dashboard data object
   * @returns {Object} returns.user - User document without password
   * @returns {Object} returns.stats - User statistics based on role
   * @returns {Array<Object>} [returns.recentEnrollments] - Recent enrollments (students only)
   * @returns {Array<Object>} [returns.recentCourses] - Recent courses (instructors only)
   * @throws {Error} "User not found" - If user doesn't exist
   * @throws {Error} If database operation fails
   * 
   * @example
   * const dashboard = await UserService.getUserDashboard('60a1234567890abcdef12345');
   * console.log('User:', dashboard.user.email);
   * console.log('Stats:', dashboard.stats);
   * if (dashboard.recentEnrollments) {
   *   console.log('Recent enrollments:', dashboard.recentEnrollments.length);
   * }
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
        .populate("course", PopulateConfig.helpers.getCourseFields("basic") + " instructor")
        .sort({ enrollmentDate: -1 })
        .limit(5);
    } else if (user.role === "instructor") {
      // Get recent courses
      dashboard.recentCourses = await Course.find({ instructor: userId }).sort({ createdAt: -1 }).limit(5);
    }

    return dashboard;
  }
}

module.exports = UserService;