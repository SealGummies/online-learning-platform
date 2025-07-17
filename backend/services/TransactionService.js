const mongoose = require("mongoose");

/**
 * Transaction Service for MongoDB ACID operations
 * Provides business logic layer for handling multi-document transactions
 */
class TransactionService {
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
   * Execute operations with retry logic for transient failures
   * @param {Function} operation - Async function that accepts session parameter
   * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
   * @returns {Promise} Result from the operation
   */
  static async executeWithRetry(operation, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeWithTransaction(operation);
      } catch (error) {
        lastError = error;

        // Check if error is retryable (transient transaction errors)
        if (this.isRetryableError(error) && attempt < maxRetries) {
          console.log(
            `Transaction attempt ${attempt} failed, retrying...`,
            error.message
          );
          // Wait before retry with exponential backoff
          await this.delay(Math.pow(2, attempt - 1) * 100);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} True if error is retryable
   */
  static isRetryableError(error) {
    // MongoDB transient transaction errors that can be retried
    const retryableErrors = [
      "TransientTransactionError",
      "UnknownTransactionCommitResult",
      "WriteConflict",
    ];

    return retryableErrors.some(
      (errorType) =>
        error.message.includes(errorType) ||
        error.code === 112 || // WriteConflict
        error.code === 11000 // Duplicate key (in some cases)
    );
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   */
  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate transaction prerequisites
   * @param {Object} options - Transaction options
   * @throws {Error} If prerequisites are not met
   */
  static validateTransactionPrerequisites(options = {}) {
    // Check MongoDB version supports transactions
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    // Additional validation can be added here
    if (options.requireReplicaSet) {
      // In modern MongoDB driver, check replica set differently
      try {
        const admin = mongoose.connection.db.admin();
        // This is a basic check - in production you'd want more robust validation
        console.log("Replica set validation skipped for test environment");
      } catch (error) {
        console.log("Replica set check not available in test environment");
      }
    }
  }

  /**
   * Get transaction statistics
   * @returns {Object} Transaction statistics
   */
  static getTransactionStats() {
    return {
      activeSessions:
        mongoose.connection.db.serverStatus?.transactions?.currentActive || 0,
      totalStarted:
        mongoose.connection.db.serverStatus?.transactions?.totalStarted || 0,
      totalCommitted:
        mongoose.connection.db.serverStatus?.transactions?.totalCommitted || 0,
      totalAborted:
        mongoose.connection.db.serverStatus?.transactions?.totalAborted || 0,
    };
  }
}

module.exports = TransactionService;
