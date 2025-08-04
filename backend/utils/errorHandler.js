const { AppError } = require("./errors");

/**
 * Centralized error response handler for controllers
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {String} defaultMessage - Default error message if none provided
 */
const handleErrorResponse = (error, res, defaultMessage = "Operation failed") => {
  // If it's our custom AppError, use its statusCode
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }

  // Handle MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    return res.status(409).json({
      success: false,
      message,
    });
  }

  // Handle MongoDB validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((val) => val.message);
    const message = errors.join(". ");
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (error.name === "CastError") {
    const message = "Invalid resource ID format";
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error response
  console.error("Unhandled error:", error);
  return res.status(500).json({
    success: false,
    message: error.message || defaultMessage,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

/**
 * Async wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standardized success response handler
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata (pagination, counts, etc.)
 */
const sendSuccessResponse = (res, data, message = "Operation successful", statusCode = 200, meta = {}) => {
  const response = {
    success: true,
    message,
    data,
    ...meta,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send formatted list response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {Number} total - Total count of items
 */
const sendListResponse = (res, data, message = "Data retrieved successfully", statusCode = 200, total = null) => {
  const response = {
    success: true,
    message,
    data,
    total: total !== null ? total : Array.isArray(data) ? data.length : 0,
  };

  return res.status(statusCode).json(response);
};

/**
 * Standardized success response for created resources
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Success message
 */
const sendCreatedResponse = (res, data, message = "Resource created successfully") => {
  return sendSuccessResponse(res, data, message, 201);
};

/**
 * Standardized success response for operations without data
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendMessageResponse = (res, message = "Operation successful", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
  });
};

module.exports = {
  handleErrorResponse,
  catchAsync,
  sendSuccessResponse,
  sendListResponse,
  sendCreatedResponse,
  sendMessageResponse,
};
