const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const TransactionService = require("./TransactionService");
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
        select: "title description category level instructor duration",
        populate: {
          path: "instructor",
          select: "name email",
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
          select: "name email profile.bio",
        },
      })
      .populate("student", "firstName lastName email")
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
      const enrollment = await Enrollment.findById(enrollmentId).session(
        session
      );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      if (enrollment.student.toString() !== studentId) {
        throw new Error("Not authorized to update this enrollment");
      }

      const {
        lessonId,
        completed = false,
        timeSpent = 0,
        score = null,
      } = progressData;

      // Update lesson progress
      const lessonIndex = enrollment.lessonsCompleted.findIndex(
        (lesson) => lesson.lessonId.toString() === lessonId
      );

      if (lessonIndex >= 0) {
        // Update existing lesson progress
        enrollment.lessonsCompleted[lessonIndex] = {
          ...enrollment.lessonsCompleted[lessonIndex],
          completed,
          completedAt: completed
            ? new Date()
            : enrollment.lessonsCompleted[lessonIndex].completedAt,
          timeSpent:
            enrollment.lessonsCompleted[lessonIndex].timeSpent + timeSpent,
          score:
            score !== null
              ? score
              : enrollment.lessonsCompleted[lessonIndex].score,
        };
      } else if (completed) {
        // Add new completed lesson
        enrollment.lessonsCompleted.push({
          lessonId,
          completed: true,
          completedAt: new Date(),
          timeSpent,
          score,
        });
      }

      // Recalculate overall progress
      const course = await Course.findById(enrollment.course).session(session);
      const totalLessons = course.lessons?.length || 1;
      const completedLessons = enrollment.lessonsCompleted.filter(
        (l) => l.completed
      ).length;

      enrollment.progress = Math.round((completedLessons / totalLessons) * 100);

      // Update completion status
      if (enrollment.progress >= 100 && enrollment.status !== "completed") {
        enrollment.status = "completed";
        enrollment.completionDate = new Date();
      }

      await enrollment.save({ session });

      // Update course completion statistics
      if (enrollment.status === "completed") {
        await Course.findByIdAndUpdate(
          enrollment.course,
          { $inc: { completionCount: 1 } },
          { session }
        );
      }

      // Populate for response
      await enrollment.populate("course", "title category level");

      return {
        enrollment: enrollment.toObject(),
        message: completed
          ? "Lesson completed successfully"
          : "Progress updated successfully",
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
      const enrollment = await Enrollment.findById(enrollmentId).session(
        session
      );

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
      const avgRating =
        allReviews.reduce((sum, enr) => sum + enr.review.rating, 0) /
        totalReviews;

      await Course.findByIdAndUpdate(
        enrollment.course,
        {
          "rating.average": Math.round(avgRating * 10) / 10,
          "rating.count": totalReviews,
        },
        { session }
      );

      // Populate for response
      await enrollment.populate("course", "title rating");

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
      const enrollment = await Enrollment.findById(enrollmentId).session(
        session
      );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      if (enrollment.student.toString() !== studentId) {
        throw new Error("Not authorized to withdraw from this enrollment");
      }

      if (enrollment.status === "completed") {
        throw new Error("Cannot withdraw from completed course");
      }

      if (enrollment.status === "withdrawn") {
        throw new Error("Already withdrawn from this course");
      }

      // Update enrollment status
      enrollment.status = "withdrawn";
      enrollment.withdrawalDate = new Date();
      await enrollment.save({ session });

      // Update course enrollment count
      await Course.findByIdAndUpdate(
        enrollment.course,
        { $inc: { enrollmentCount: -1 } },
        { session }
      );

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
          avgProgress: { $avg: "$progress" },
          totalTimeSpent: {
            $sum: {
              $reduce: {
                input: "$lessonsCompleted",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.timeSpent"] },
              },
            },
          },
        },
      },
    ]);

    const result = {
      total: 0,
      active: 0,
      completed: 0,
      withdrawn: 0,
      averageProgress: 0,
      totalTimeSpent: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
      result.averageProgress += stat.avgProgress * stat.count;
      result.totalTimeSpent += stat.totalTimeSpent;
    });

    result.averageProgress =
      result.total > 0 ? Math.round(result.averageProgress / result.total) : 0;

    return result;
  }
}

module.exports = EnrollmentService;
