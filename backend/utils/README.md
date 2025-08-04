# Utils Directory

This directory contains utility functions and helper modules used throughout the application.

## Overview

The utils layer provides:
- Reusable utility functions
- Error handling utilities
- Common helper functions
- Shared constants and configurations
- Cross-cutting concerns

## Utility Files

### errors.js
- **Purpose**: Custom error classes for consistent error handling
- **Exports**:
  - `AppError` - Base error class with status code
  - `ValidationError` - 400 Bad Request errors
  - `NotFoundError` - 404 Not Found errors
  - `UnauthorizedError` - 401 Unauthorized errors
  - `ForbiddenError` - 403 Forbidden errors
  - `ConflictError` - 409 Conflict errors
  - `InternalServerError` - 500 Server errors

### errorHandler.js
- **Purpose**: Centralized error and response handling utilities
- **Exports**:
  - `handleErrorResponse()` - Process and format error responses
  - `catchAsync()` - Wrapper for async route handlers
  - `sendSuccessResponse()` - Standard success response
  - `sendListResponse()` - Response for list/array data
  - `sendCreatedResponse()` - 201 Created response
  - `sendMessageResponse()` - Simple message response

### validate-env.js
- **Purpose**: Environment variable validation
- **Functionality**:
  - Validates required environment variables on startup
  - Provides helpful error messages for missing variables
  - Ensures proper configuration before app starts