# Middleware Directory

This directory contains Express middleware functions that process requests before they reach the controllers.

## Overview

The middleware layer is responsible for:
- Authentication and authorization
- Request validation
- Error handling
- Logging and monitoring
- Security enhancements
- Request/response transformations

## Middleware Files

### auth.js
- **Purpose**: Authentication and authorization middleware
- **Exports**:
  - `protect` - Verifies JWT token and attaches user to request
  - `authorize(...roles)` - Restricts access based on user roles
  - `checkOwnership(Model, field)` - Verifies resource ownership
  - `validateObjectId(paramName)` - Validates MongoDB ObjectId format

### Usage Examples

#### Authentication (protect)
```javascript
// Protect all routes after this middleware
router.use(protect);

// Protect specific route
router.get('/profile', protect, UserController.getProfile);
```

#### Authorization (authorize)
```javascript
// Single role
router.post('/courses', protect, authorize('instructor'), CourseController.create);

// Multiple roles
router.get('/reports', protect, authorize('admin', 'instructor'), ReportController.get);
```

#### Ownership Verification
```javascript
// Check if user owns the resource
router.put(
  '/enrollments/:id', 
  protect, 
  checkOwnership(Enrollment, 'id'),
  EnrollmentController.update
);
```

#### ObjectId Validation
```javascript
// Validate MongoDB ObjectId in route params
router.get(
  '/courses/:id',
  validateObjectId('id'),
  CourseController.getById
);
```

## Middleware Flow

```
Request → 
  validateObjectId (if needed) →
  protect (authentication) →
  authorize (role check) →
  checkOwnership (if needed) →
  Controller
```

## Error Handling

The middleware handles various error scenarios:

1. **No Token**: Returns 401 "Not authorized, no token"
2. **Invalid Token**: Returns 401 "Not authorized, token failed"
3. **Expired Token**: Returns 401 "Token expired"
4. **User Not Found**: Returns 401 "User not found"
5. **Insufficient Role**: Returns 403 "User role X is not authorized"
6. **Invalid ObjectId**: Returns 400 "Invalid ID format"
7. **Resource Not Found**: Returns 404 "Resource not found"
8. **Not Owner**: Returns 403 "Not authorized to access this resource"

## Best Practices

1. **Order Matters**: Apply middleware in the correct sequence
2. **Error Messages**: Provide clear, actionable error messages
3. **Security**: Never expose sensitive information in errors
4. **Performance**: Keep middleware lightweight and fast
5. **Reusability**: Create generic middleware that can be reused

## Adding New Middleware

When creating new middleware:

```javascript
const newMiddleware = async (req, res, next) => {
  try {
    // Perform middleware logic
    // Modify req object if needed
    // Call next() to continue
    next();
  } catch (error) {
    // Handle errors appropriately
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

## Testing Middleware

```javascript
describe('auth middleware', () => {
  it('should attach user to request with valid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };
    const res = {};
    const next = jest.fn();
    
    await protect(req, res, next);
    
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
  
  it('should return 401 with invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    await protect(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

## Future Middleware Suggestions

1. **Rate Limiting**: Prevent API abuse
2. **Request Logging**: Log all API requests
3. **CORS Configuration**: Handle cross-origin requests
4. **Compression**: Compress responses
5. **Security Headers**: Add helmet for security headers
6. **Request Sanitization**: Clean input data
7. **API Versioning**: Handle different API versions
8. **Caching**: Implement response caching