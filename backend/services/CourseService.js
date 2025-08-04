const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const TransactionService = require("./TransactionService");
const PopulateConfig = require("../config/populateConfig");
const mongoose = require("mongoose");

/**
 * @class CourseService
 * @description Service layer for course-related business logic.
 * Handles all course operations including CRUD, enrollment, and statistics.
 *
 * @requires ../models/Course - Course model
 * @requires ../models/Enrollment - Enrollment model
 * @requires ./TransactionService - Transaction handling service
 * @requires ../config/populateConfig - Population configuration
 * @requires mongoose - MongoDB ODM
 */
class CourseService {
  /**
   * Retrieves all courses with optional filtering and sorting.
   *
   * @static
   * @async
   * @method getCourses
   * @param {Object} [options={}] - Query options for filtering and sorting
   * @param {string} [options.category] - Filter by course category
   * @param {string} [options.level] - Filter by course level (Beginner/Intermediate/Advanced)
   * @param {string} [options.search] - Search term for title and description
   * @param {string} [options.instructor] - Filter by instructor ID
   * @param {string} [options.sortBy="createdAt"] - Field to sort by
   * @param {string} [options.sortOrder="desc"] - Sort order (asc/desc)
   * @returns {Promise<Object>} Object containing courses array and total count
   * @returns {Array<Object>} returns.courses - Array of course documents
   * @returns {number} returns.total - Total count of courses matching the query
   * @throws {Error} If database operation fails
   *
   * @example
   * const result = await CourseService.getCourses({
   *   category: 'Programming',
   *   level: 'Beginner',
   *   sortBy: 'price',
   *   sortOrder: 'asc'
   * });
   */
  static async getCourses(options = {}) {
    const { category, level, search, instructor, sortBy = "createdAt", sortOrder = "desc" } = options;

    const query = {};

    // Build filter query
    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [courses, total] = await Promise.all([
      Course.find(query).sort(sort).populate("instructor", PopulateConfig.helpers.getInstructorFields("public")).lean(),
      Course.countDocuments(query),
    ]);

    return {
      courses,
      total,
    };
  }

  /**
   * Retrieves a single course by its ID with detailed information.
   * If a user ID is provided, includes enrollment status for that user.
   *
   * @static
   * @async
   * @method getCourseById
   * @param {string} courseId - The MongoDB ObjectId of the course
   * @param {string} [userId=null] - Optional user ID to check enrollment status
   * @returns {Promise<Object>} Course object with additional enrollment info if userId provided
   * @returns {boolean} returns.isEnrolled - Whether the user is enrolled (only if userId provided)
   * @returns {number} returns.enrollmentCompletion - User's completion percentage (only if userId provided)
   * @returns {string} returns.enrollmentStatus - User's enrollment status (only if userId provided)
   * @throws {Error} Throws "Course not found" if course doesn't exist
   * @throws {Error} If database operation fails
   *
   * @example
   * // Get course without enrollment info
   * const course = await CourseService.getCourseById('60a1234567890abcdef12345');
   *
   * // Get course with enrollment info for a user
   * const courseWithEnrollment = await CourseService.getCourseById(
   *   '60a1234567890abcdef12345',
   *   '60b9876543210fedcba98765'
   * );
   */
  static async getCourseById(courseId, userId = null) {
    const course = await Course.findById(courseId)
      .populate("instructor", PopulateConfig.helpers.getInstructorFields("student"))
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
      course.enrollmentCompletion = enrollment?.completionPercentage || 0;
      course.enrollmentStatus = enrollment?.status || null;
    }

    return course;
  }

  /**
   * Enrolls a student in a course using a database transaction.
   * Ensures data consistency by checking course availability and preventing duplicate enrollments.
   *
   * @static
   * @async
   * @method enrollStudent
   * @param {string} courseId - The MongoDB ObjectId of the course
   * @param {string} userId - The MongoDB ObjectId of the student user
   * @returns {Promise<Object>} Object containing enrollment details and success message
   * @returns {Object} returns.enrollment - The created enrollment document
   * @returns {string} returns.message - Success message
   * @throws {Error} "Course not found or inactive" - If course doesn't exist or is inactive
   * @throws {Error} "Already enrolled in this course" - If student is already enrolled
   * @throws {Error} If transaction fails or database operation fails
   *
   * @example
   * try {
   *   const result = await CourseService.enrollStudent(
   *     '60a1234567890abcdef12345',
   *     '60b9876543210fedcba98765'
   *   );
   *   console.log(result.message); // "Successfully enrolled in course"
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  static async enrollStudent(courseId, userId) {
    return TransactionService.executeWithTransaction(async (session) => {
      // Check if course exists and is active
      const course = await Course.findById(courseId).session(session);
      if (!course || !course.isActive) {
        throw new Error("Course not found or inactive");
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
      });
      await enrollment.save({ session });
      await enrollment.populate([
        { path: "course", select: PopulateConfig.helpers.getCourseFields("basic") },
        { path: "student", select: PopulateConfig.helpers.getUserFields("student", "detailed") },
      ]);
      return {
        enrollment: enrollment.toObject(),
        message: "Successfully enrolled in course",
      };
    });
  }

  /**
   * Creates a new course with the specified instructor.
   *
   * @static
   * @async
   * @method createCourse
   * @param {Object} courseData - The course information
   * @param {string} courseData.title - Course title (required)
   * @param {string} courseData.description - Course description (required)
   * @param {string} courseData.category - Course category (required)
   * @param {string} courseData.level - Course level (Beginner/Intermediate/Advanced)
   * @param {number} courseData.price - Course price (must be >= 0)
   * @param {boolean} [courseData.isActive=true] - Whether the course is active
   * @param {string} instructorId - The MongoDB ObjectId of the instructor
   * @returns {Promise<Object>} The created course document as a plain object
   * @throws {Error} If validation fails or database operation fails
   *
   * @example
   * const newCourse = await CourseService.createCourse({
   *   title: "Introduction to JavaScript",
   *   description: "Learn the basics of JavaScript programming",
   *   category: "Programming",
   *   level: "Beginner",
   *   price: 49.99
   * }, '60b9876543210fedcba98765');
   */
  static async createCourse(courseData, instructorId) {
    const course = new Course({
      ...courseData,
      instructor: instructorId,
    });
    await course.save();
    await course.populate("instructor", PopulateConfig.helpers.getInstructorFields("student"));
    return course.toObject();
  }

  /**
   * Updates an existing course. Only the course instructor can update their own course.
   *
   * @static
   * @async
   * @method updateCourse
   * @param {string} courseId - The MongoDB ObjectId of the course to update
   * @param {Object} updateData - The fields to update
   * @param {string} [updateData.title] - New course title
   * @param {string} [updateData.description] - New course description
   * @param {string} [updateData.category] - New course category
   * @param {string} [updateData.level] - New course level
   * @param {number} [updateData.price] - New course price
   * @param {boolean} [updateData.isActive] - New active status
   * @param {string} instructorId - The MongoDB ObjectId of the instructor (for authorization)
   * @returns {Promise<Object>} The updated course document as a plain object
   * @throws {Error} "Course not found" - If course doesn't exist
   * @throws {Error} "Not authorized to update this course" - If instructor doesn't own the course
   * @throws {Error} If validation fails or database operation fails
   *
   * @example
   * const updatedCourse = await CourseService.updateCourse(
   *   '60a1234567890abcdef12345',
   *   { price: 59.99, isActive: false },
   *   '60b9876543210fedcba98765'
   * );
   */
  static async updateCourse(courseId, updateData, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.instructor.toString() !== instructorId) {
      throw new Error("Not authorized to update this course");
    }

    // Prevent updating instructor directly
    delete updateData.instructor;
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("instructor", PopulateConfig.helpers.getInstructorFields("student"));
    return updatedCourse.toObject();
  }

  /**
   * Deletes a course and its associated enrollments using a database transaction.
   * Only courses without active enrollments can be deleted.
   *
   * @static
   * @async
   * @method deleteCourse
   * @param {string} courseId - The MongoDB ObjectId of the course to delete
   * @param {string} instructorId - The MongoDB ObjectId of the instructor (for authorization)
   * @returns {Promise<Object>} Object containing success message and deleted course ID
   * @returns {string} returns.message - Success message
   * @returns {string} returns.courseId - ID of the deleted course
   * @throws {Error} "Course not found" - If course doesn't exist
   * @throws {Error} "Not authorized to delete this course" - If instructor doesn't own the course
   * @throws {Error} "Cannot delete course with active enrollments" - If course has active students
   * @throws {Error} If transaction fails or database operation fails
   *
   * @example
   * try {
   *   const result = await CourseService.deleteCourse(
   *     '60a1234567890abcdef12345',
   *     '60b9876543210fedcba98765'
   *   );
   *   console.log(result.message); // "Course deleted successfully"
   * } catch (error) {
   *   console.error(error.message);
   * }
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

      // Check if there are active enrollments
      const activeEnrollments = await Enrollment.countDocuments({
        course: courseId,
        status: { $in: ["enrolled", "in-progress"] },
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
   * Retrieves comprehensive statistics for a course including enrollment data.
   * Uses MongoDB aggregation pipeline for efficient calculation.
   *
   * @static
   * @async
   * @method getCourseStats
   * @param {string} courseId - The MongoDB ObjectId of the course
   * @returns {Promise<Object>} Course statistics object
   * @returns {Object} returns.course - Basic course information (id, title)
   * @returns {Object} returns.enrollments - Enrollment statistics grouped by status
   * @returns {number} returns.totalEnrollments - Total number of enrollments
   * @throws {Error} "Course not found" - If course doesn't exist
   * @throws {Error} If database operation fails
   *
   * @example
   * const stats = await CourseService.getCourseStats('60a1234567890abcdef12345');
   * // Returns:
   * // {
   * //   course: { id: '60a1234...', title: 'JavaScript Basics' },
   * //   enrollments: {
   * //     enrolled: { count: 10, averageCompletion: 0 },
   * //     'in-progress': { count: 25, averageCompletion: 45 },
   * //     completed: { count: 15, averageCompletion: 100 }
   * //   },
   * //   totalEnrollments: 50
   * // }
   */
  static async getCourseStats(courseId) {
    const [course, enrollmentStats] = await Promise.all([
      Course.findById(courseId).lean(),
      Enrollment.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgCompletion: { $avg: "$completionPercentage" },
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
      },
      enrollments: enrollmentStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averageCompletion: Math.round(stat.avgCompletion || 0),
        };
        return acc;
      }, {}),
      totalEnrollments: enrollmentStats.reduce((sum, stat) => sum + stat.count, 0),
    };
    return stats;
  }
}

module.exports = CourseService;
