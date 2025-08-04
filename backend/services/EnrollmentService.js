const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const TransactionService = require("./TransactionService");
const PopulateConfig = require("../config/populateConfig");
const mongoose = require("mongoose");

/**
 * Enrollment Service - Business logic for enrollment operations
 */
class EnrollmentService {
  /**
   * Get student enrollments with course details
   * @param {string} studentId - Student user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Student enrollments
   */
  static async getStudentEnrollments(studentId, options = {}) {
    const { status, sortBy = "enrollmentDate", sortOrder = "desc" } = options;

    const query = { student: studentId };
    if (status) query.status = status;

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const enrollments = await Enrollment.find(query)
      .sort(sort)
      .populate({
        path: "course",
        select: PopulateConfig.helpers.getCourseFields("detailed"),
        populate: {
          path: "instructor",
          select: PopulateConfig.helpers.getInstructorFields("student"),
        },
      })
      .lean();

    return enrollments;
  }

  /**
   * Get enrollment by ID with full details
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} studentId - Student ID (for authorization)
   * @returns {Promise<Object>} Enrollment details
   */
  static async getEnrollmentById(enrollmentId, studentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: PopulateConfig.helpers.getInstructorFields("student"),
        },
      })
      .populate("student", PopulateConfig.helpers.getUserFields("student", "detailed"))
      .lean();

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Handle both populated and non-populated student field
    const studentIdToCheck = enrollment.student._id || enrollment.student;
    if (studentIdToCheck.toString() !== studentId) {
      throw new Error("Not authorized to view this enrollment");
    }

    return enrollment;
  }

  /**
   * Update student progress with transaction safety
   * @param {string} enrollmentId - Enrollment ID
   * @param {Object} progressData - Progress update data
   * @param {string} studentId - Student ID (for authorization)
   * @returns {Promise<Object>} Updated enrollment
   */
  static async updateProgress(enrollmentId, progressData, studentId) {
    return TransactionService.executeWithTransaction(async (session) => {
      const enrollment = await Enrollment.findById(enrollmentId).session(session);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }
      if (enrollment.student.toString() !== studentId) {
        throw new Error("Not authorized to update this enrollment");
      }
      // Only update completionPercentage and finalGrade
      const { completionPercentage, finalGrade, status } = progressData;
      if (typeof completionPercentage === "number") {
        enrollment.completionPercentage = Math.max(0, Math.min(100, completionPercentage));
      }
      if (typeof finalGrade === "number") {
        enrollment.finalGrade = Math.max(0, Math.min(100, finalGrade));
      }
      if (status && ["enrolled", "in-progress", "completed", "dropped"].includes(status)) {
        enrollment.status = status;
      }
      // Auto-complete if 100% completed
      if (enrollment.completionPercentage === 100 && enrollment.status !== "completed") {
        enrollment.status = "completed";
      }
      await enrollment.save({ session });
      await enrollment.populate("course", PopulateConfig.helpers.getCourseFields("basic"));
      return {
        enrollment: enrollment.toObject(),
        message: "Progress updated successfully",
      };
    });
  }

  /**
   * Submit course review with transaction safety
   * @param {string} enrollmentId - Enrollment ID
   * @param {Object} reviewData - Review data
   * @param {string} studentId - Student ID (for authorization)
   * @returns {Promise<Object>} Updated enrollment with review
   */
  static async submitReview(enrollmentId, reviewData, studentId) {
    return TransactionService.executeWithTransaction(async (session) => {
      const enrollment = await Enrollment.findById(enrollmentId).session(session);

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      if (enrollment.student.toString() !== studentId) {
        throw new Error("Not authorized to review this enrollment");
      }

      if (enrollment.status !== "completed") {
        throw new Error("Can only review completed courses");
      }

      if (enrollment.review) {
        throw new Error("Review already submitted");
      }

      const { rating, comment } = reviewData;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Add review to enrollment
      enrollment.review = {
        rating,
        comment: comment || "",
        submittedAt: new Date(),
      };

      await enrollment.save({ session });

      // Update course rating statistics
      const course = await Course.findById(enrollment.course).session(session);
      const allReviews = await Enrollment.find({
        course: enrollment.course,
        "review.rating": { $exists: true },
      }).session(session);

      const totalReviews = allReviews.length;
      const avgRating = allReviews.reduce((sum, enr) => sum + enr.review.rating, 0) / totalReviews;

      await Course.findByIdAndUpdate(
        enrollment.course,
        {
          "rating.average": Math.round(avgRating * 10) / 10,
          "rating.count": totalReviews,
        },
        { session }
      );

      // Populate for response
      await enrollment.populate("course", PopulateConfig.helpers.getCourseFields("basic") + " rating");

      return {
        enrollment: enrollment.toObject(),
        message: "Review submitted successfully",
      };
    });
  }

  /**
   * Withdraw from course
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} studentId - Student ID (for authorization)
   * @returns {Promise<Object>} Withdrawal result
   */
  static async withdrawEnrollment(enrollmentId, studentId) {
    return TransactionService.executeWithTransaction(async (session) => {
      const enrollment = await Enrollment.findById(enrollmentId).session(session);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }
      if (enrollment.student.toString() !== studentId) {
        throw new Error("Not authorized to withdraw from this enrollment");
      }
      if (enrollment.status === "completed") {
        throw new Error("Cannot withdraw from completed course");
      }
      if (enrollment.status === "dropped") {
        throw new Error("Already withdrawn from this course");
      }
      // Only update status
      enrollment.status = "dropped";
      await enrollment.save({ session });
      return {
        enrollment: enrollment.toObject(),
        message: "Successfully withdrawn from course",
      };
    });
  }

  /**
   * Get enrollment statistics for a student
   * @param {string} studentId - Student user ID
   * @returns {Promise<Object>} Enrollment statistics
   */
  static async getStudentStats(studentId) {
    const stats = await Enrollment.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgCompletion: { $avg: "$completionPercentage" },
        },
      },
    ]);
    const result = {
      total: 0,
      enrolled: 0,
      "in-progress": 0,
      completed: 0,
      dropped: 0,
      averageCompletion: 0,
    };
    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
      result.averageCompletion += (stat.avgCompletion || 0) * stat.count;
    });
    result.averageCompletion = result.total > 0 ? Math.round(result.averageCompletion / result.total) : 0;
    return result;
  }
}

module.exports = EnrollmentService;
