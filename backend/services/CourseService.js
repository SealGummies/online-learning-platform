const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionService = require("./TransactionService");
const mongoose = require("mongoose");

/**
 * Course Service - Business logic for course operations
 */
class CourseService {
  /**
   * Get all courses with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Courses with pagination info
   */
  static async getCourses(options = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      instructor,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = {};

    // Build filter query
    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("instructor", "name email")
        .lean(),
      Course.countDocuments(query),
    ]);

    return {
      courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get course by ID with detailed information
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID (optional, for enrollment status)
   * @returns {Promise<Object>} Course with additional info
   */
  static async getCourseById(courseId, userId = null) {
    const course = await Course.findById(courseId)
      .populate("instructor", "name email profile.bio")
      .lean();

    if (!course) {
      throw new Error("Course not found");
    }

    // Add enrollment status if user provided
    if (userId) {
      const enrollment = await Enrollment.findOne({
        course: courseId,
        student: userId,
      }).lean();

      course.isEnrolled = !!enrollment;
      course.enrollmentProgress = enrollment?.progress || 0;
      course.enrollmentStatus = enrollment?.status || null;
    }

    return course;
  }

  /**
   * Enroll student in course with transaction safety
   * @param {string} courseId - Course ID
   * @param {string} userId - Student user ID
   * @returns {Promise<Object>} Enrollment result
   */
  static async enrollStudent(courseId, userId) {
    return TransactionService.executeWithTransaction(async (session) => {
      // Check if course exists and has capacity
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new Error("Course not found");
      }

      // Check if course is published
      if (!course.settings.isPublished) {
        throw new Error("Course is not available for enrollment");
      }

      if (
        course.maxStudents &&
        course.stats.enrollments >= course.maxStudents
      ) {
        throw new Error("Course is full");
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        course: courseId,
        student: userId,
      }).session(session);

      if (existingEnrollment) {
        throw new Error("Already enrolled in this course");
      }

      // Create enrollment
      const enrollment = new Enrollment({
        course: courseId,
        student: userId,
        enrollmentDate: new Date(),
        status: "enrolled",
        progress: 0,
        paymentDetails: {
          amount: course.price,
          currency: course.currency || "USD",
          paymentMethod: "credit_card",
          transactionId: `tx_${Date.now()}_${userId}`,
          paymentDate: new Date(),
        },
      });

      await enrollment.save({ session });

      // Update course enrollment count
      await Course.findByIdAndUpdate(
        courseId,
        { $inc: { "stats.enrollments": 1 } },
        { session }
      );

      // Populate enrollment details for response
      await enrollment.populate([
        { path: "course", select: "title category level" },
        { path: "student", select: "name email" },
      ]);

      return {
        enrollment: enrollment.toObject(),
        message: "Successfully enrolled in course",
      };
    });
  }

  /**
   * Create new course
   * @param {Object} courseData - Course data
   * @param {string} instructorId - Instructor user ID
   * @returns {Promise<Object>} Created course
   */
  static async createCourse(courseData, instructorId) {
    const course = new Course({
      ...courseData,
      instructor: instructorId,
      enrollmentCount: 0,
      createdAt: new Date(),
    });

    await course.save();
    await course.populate("instructor", "name email");

    return course.toObject();
  }

  /**
   * Update course information
   * @param {string} courseId - Course ID
   * @param {Object} updateData - Data to update
   * @param {string} instructorId - Instructor ID (for authorization)
   * @returns {Promise<Object>} Updated course
   */
  static async updateCourse(courseId, updateData, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.instructor.toString() !== instructorId) {
      throw new Error("Not authorized to update this course");
    }

    // Prevent updating enrollment count directly
    delete updateData.enrollmentCount;
    delete updateData.instructor;

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("instructor", "name email");

    return updatedCourse.toObject();
  }

  /**
   * Delete course (only if no enrollments)
   * @param {string} courseId - Course ID
   * @param {string} instructorId - Instructor ID (for authorization)
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteCourse(courseId, instructorId) {
    return TransactionService.executeWithTransaction(async (session) => {
      const course = await Course.findById(courseId).session(session);

      if (!course) {
        throw new Error("Course not found");
      }

      if (course.instructor.toString() !== instructorId) {
        throw new Error("Not authorized to delete this course");
      }

      // Check for active enrollments
      const activeEnrollments = await Enrollment.countDocuments({
        course: courseId,
        status: "active",
      }).session(session);

      if (activeEnrollments > 0) {
        throw new Error("Cannot delete course with active enrollments");
      }

      // Delete course and any completed enrollments
      await Enrollment.deleteMany({
        course: courseId,
      }).session(session);

      await Course.findByIdAndDelete(courseId).session(session);

      return {
        message: "Course deleted successfully",
        courseId,
      };
    });
  }

  /**
   * Get course statistics
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Course statistics
   */
  static async getCourseStats(courseId) {
    const [course, enrollmentStats] = await Promise.all([
      Course.findById(courseId).lean(),
      Enrollment.aggregate([
        { $match: { course: mongoose.Types.ObjectId(courseId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgProgress: { $avg: "$progress" },
          },
        },
      ]),
    ]);

    if (!course) {
      throw new Error("Course not found");
    }

    const stats = {
      course: {
        id: course._id,
        title: course.title,
        enrollmentCount: course.enrollmentCount,
      },
      enrollments: enrollmentStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averageProgress: Math.round(stat.avgProgress || 0),
        };
        return acc;
      }, {}),
      totalEnrollments: enrollmentStats.reduce(
        (sum, stat) => sum + stat.count,
        0
      ),
    };

    return stats;
  }
}

module.exports = CourseService;
