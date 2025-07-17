# Controllers

HTTP request handlers following MVC architecture pattern.

## Overview

Controllers handle HTTP requests and responses, serving as the bridge between routes and business logic. They follow the **single responsibility principle** - only managing HTTP concerns while delegating business logic to services.

## Files

- `CourseController.js` - Course management HTTP handlers
- `EnrollmentController.js` - Enrollment and progress HTTP handlers
- `index.js` - Controller exports for easy importing

## Architecture Pattern

### Controller Structure

```javascript
const Service = require("../services/Service");

class Controller {
  static async methodName(req, res) {
    try {
      // 1. Extract data from request
      const data = req.body;
      const userId = req.user.id;

      // 2. Delegate to service layer
      const result = await Service.businessMethod(data, userId);

      // 3. Format and send response
      res.status(200).json({
        success: true,
        data: result,
        message: "Operation successful",
      });
    } catch (error) {
      // 4. Handle errors consistently
      const statusCode = this.getStatusCode(error);
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }
}
```

### Key Responsibilities

1. **🔍 Request Processing**: Extract and validate request data
2. **🎮 Flow Control**: Route requests to appropriate services
3. **📤 Response Formatting**: Structure responses consistently
4. **🚨 Error Handling**: Convert service errors to HTTP responses
5. **🔒 Authorization Checks**: Verify user permissions

## Controller Details

### 📚 CourseController (`CourseController.js`)

Handles course-related HTTP operations:

```javascript
// Public endpoints
static async getCourses(req, res)         // GET /api/courses
static async getCourseById(req, res)      // GET /api/courses/:id
static async getCourseStats(req, res)     // GET /api/courses/:id/stats

// Instructor endpoints
static async createCourse(req, res)       // POST /api/courses
static async updateCourse(req, res)       // PUT /api/courses/:id
static async deleteCourse(req, res)       // DELETE /api/courses/:id
static async getInstructorCourses(req, res) // GET /api/courses/instructor/my-courses

// Student endpoints
static async enrollStudent(req, res)      // POST /api/courses/:id/enroll
```

**Features**:

- ✅ Query parameter handling (pagination, filtering, sorting)
- ✅ Role-based response formatting
- ✅ Enrollment status checking
- ✅ Error mapping (404, 403, 409, etc.)

### 📝 EnrollmentController (`EnrollmentController.js`)

Handles enrollment and progress HTTP operations:

```javascript
// Student enrollment management
static async getStudentEnrollments(req, res)  // GET /api/enrollments
static async getEnrollmentById(req, res)      // GET /api/enrollments/:id
static async getStudentStats(req, res)        // GET /api/enrollments/stats
static async getProgressDetails(req, res)     // GET /api/enrollments/:id/progress

// Progress and interaction
static async updateProgress(req, res)         // PUT /api/enrollments/:id/progress
static async submitReview(req, res)           // PUT /api/enrollments/:id/review
static async withdrawEnrollment(req, res)     // POST /api/enrollments/:id/withdraw
```

**Features**:

- ✅ Progress tracking and validation
- ✅ Review submission handling
- ✅ Withdrawal flow management
- ✅ Student statistics aggregation

## Response Patterns

### Success Response

```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response

```javascript
{
  "success": false,
  "error": "Error description"
}
```

### Validation Error Response

```javascript
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

## Error Handling Strategy

### HTTP Status Code Mapping

```javascript
// Common error mappings
'not found' → 404
'Not authorized' → 403
'Already enrolled' → 409
'Course is full' → 409
'already submitted' → 409
// Default → 400
```

### Error Processing

```javascript
static getStatusCode(error) {
  if (error.message.includes('not found')) return 404;
  if (error.message.includes('Not authorized')) return 403;
  if (error.message.includes('Already') || error.message.includes('full')) return 409;
  return 400;
}
```

## Integration with Services

Controllers work seamlessly with the service layer:

```javascript
// Controller calls service
const result = await CourseService.enrollStudent(courseId, userId);

// Service handles business logic and transactions
// Controller formats the response
res.status(201).json({
  success: true,
  data: result.enrollment,
  message: result.message,
});
```

## Middleware Integration

Controllers work with various middleware:

### Authentication

```javascript
// Route level
router.post('/:id/enroll', protect, authorize('student'), CourseController.enrollStudent);

// Controller access
static async enrollStudent(req, res) {
  const userId = req.user.id;  // Set by protect middleware
  const role = req.user.role;  // Available for additional checks
}
```

### Validation

```javascript
// Route level validation
router.post('/', validateCourse, CourseController.createCourse);

// Controller assumes data is valid
static async createCourse(req, res) {
  const courseData = req.body; // Pre-validated by middleware
}
```

## Testing Controllers

Controllers are tested through integration tests:

```javascript
// Test HTTP endpoints
describe("CourseController", () => {
  test("should create course", async () => {
    const response = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${token}`)
      .send(courseData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Best Practices

1. **🎯 Keep Thin**: Only handle HTTP concerns
2. **🔄 Delegate**: Let services handle business logic
3. **📝 Consistent**: Use standard response formats
4. **🚨 Error Mapping**: Convert service errors appropriately
5. **🔒 Security**: Validate authorization at controller level
6. **📊 Logging**: Log important actions and errors
7. **⚡ Performance**: Avoid heavy processing in controllers

## Future Enhancements

- **📊 Metrics**: Add performance monitoring
- **🔄 Caching**: Response caching for read operations
- **📝 Documentation**: OpenAPI/Swagger integration
- **🧪 Testing**: Expanded controller unit tests
