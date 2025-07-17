const mongoose = require("mongoose");

/**
 * Transaction Manager for MongoDB ACID operations
 * Provides utility functions for handling multi-document transactions
 */
class TransactionManager {
  /**
   * Execute multiple operations within a single transaction
   * @param {Function[]} operations - Array of async functions that accept session parameter
   * @returns {Promise<Array>} Results from all operations
   */
  static async executeTransaction(operations) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const results = [];
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }

      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute a single operation with transaction wrapper
   * @param {Function} operation - Async function that accepts session parameter
   * @returns {Promise} Result from the operation
   */
  static async executeWithTransaction(operation) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const result = await operation(session);

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Create enrollment transaction operation
   * @param {Object} enrollmentData - Enrollment data
   * @param {String} courseId - Course ID
   * @returns {Function} Transaction operation function
   */
  static createEnrollmentOperation(enrollmentData, courseId) {
    return async (session) => {
      const Enrollment = require("../models/Enrollment");
      const Course = require("../models/Course");

      // Create enrollment
      const enrollment = await Enrollment.create([enrollmentData], { session });

      // Update course stats
      await Course.findByIdAndUpdate(
        courseId,
        { $inc: { "stats.enrollments": 1 } },
        { session }
      );

      return enrollment[0];
    };
  }

  /**
   * Create progress update transaction operation
   * @param {String} enrollmentId - Enrollment ID
   * @param {Object} progressData - Progress update data
   * @param {Object} courseRatingUpdate - Course rating update (optional)
   * @returns {Function} Transaction operation function
   */
  static createProgressUpdateOperation(
    enrollmentId,
    progressData,
    courseRatingUpdate = null
  ) {
    return async (session) => {
      const Enrollment = require("../models/Enrollment");
      const Course = require("../models/Course");

      // Update enrollment progress
      const enrollment = await Enrollment.findByIdAndUpdate(
        enrollmentId,
        progressData,
        { new: true, session }
      );

      // Update course rating if provided
      if (courseRatingUpdate) {
        await Course.findByIdAndUpdate(enrollment.course, courseRatingUpdate, {
          session,
        });
      }

      return enrollment;
    };
  }

  /**
   * Create exam submission transaction operation
   * @param {Object} examData - Exam submission data
   * @param {String} enrollmentId - Enrollment ID
   * @param {Object} progressUpdate - Progress update data
   * @returns {Function} Transaction operation function
   */
  static createExamSubmissionOperation(examData, enrollmentId, progressUpdate) {
    return async (session) => {
      const Exam = require("../models/Exam");
      const Enrollment = require("../models/Enrollment");

      // Create exam submission
      const exam = await Exam.create([examData], { session });

      // Update enrollment progress
      const enrollment = await Enrollment.findByIdAndUpdate(
        enrollmentId,
        progressUpdate,
        { new: true, session }
      );

      return { exam: exam[0], enrollment };
    };
  }
}

module.exports = TransactionManager;
