const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// Validate MongoDB ObjectId
/**
 * Middleware factory to validate that a route parameter is a valid MongoDB ObjectId.
 * @param {string} paramName - Name of the route parameter to validate.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} is required`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};

// Protect routes
/**
 * Middleware to protect routes by verifying JWT token and attaching user to request.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Calls next if authentication succeeds, otherwise sends error response.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Role-based access control
/**
 * Middleware factory to restrict access based on user roles.
 * @param {...string} roles - Permitted user roles.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this resource`,
      });
    }

    next();
  };
};

// Check if user owns resource or is admin
/**
 * Middleware factory to check resource ownership or admin privileges.
 * @param {import('mongoose').Model} Model - Mongoose model of the resource.
 * @param {string} [resourceIdField='id'] - Route parameter name containing resource ID.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
const checkOwnership = (Model, resourceIdField = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // Allow admin access or resource owner
      if (
        req.user.role === "admin" ||
        (resource.user && resource.user.toString() === req.user._id.toString()) ||
        (resource.student && resource.student.toString() === req.user._id.toString()) ||
        (resource.instructor && resource.instructor.toString() === req.user._id.toString())
      ) {
        req.resource = resource;
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this resource",
        });
      }
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  validateObjectId,
};
