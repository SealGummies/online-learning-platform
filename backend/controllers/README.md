# Controllers Directory

This directory contains the controller layer that handles HTTP requests and responses, acting as the interface between routes and services.

## Overview

The controllers layer is responsible for:
- Handling HTTP requests and responses
- Extracting and validating request data
- Calling appropriate service methods
- Formatting and sending responses
- Managing HTTP status codes
- Handling errors appropriately

## Controllers

### AuthController.js
- **Purpose**: Handles authentication-related HTTP requests
- **Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user
  - `PUT /api/auth/me` - Update profile
  - `PUT /api/auth/change-password` - Change password
  - `POST /api/auth/forgot-password` - Request password reset
  - `POST /api/auth/reset-password/:token` - Reset password

### UserController.js
- **Purpose**: Manages user-related HTTP requests
- **Endpoints**:
  - `GET /api/users` - List all users (admin)
  - `POST /api/users` - Create user (admin)
  - `GET /api/users/:id` - Get user by ID
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - `GET /api/users/:id/stats` - Get user statistics
  - `PATCH /api/users/:id/status` - Update user status
  - `GET /api/users/:id/enrollments` - Get user enrollments
  - `GET /api/users/instructors` - List instructors
  - `GET /api/users/students` - List students

### CourseController.js
- **Purpose**: Handles course-related HTTP requests
- **Endpoints**:
  - `GET /api/courses` - List courses with filtering
  - `POST /api/courses` - Create course (instructor)
  - `GET /api/courses/:id` - Get course details
  - `PUT /api/courses/:id` - Update course
  - `DELETE /api/courses/:id` - Delete course
  - `POST /api/courses/:id/enroll` - Enroll in course
  - `GET /api/courses/:id/stats` - Get course statistics
  - `GET /api/courses/instructor/my-courses` - Get instructor's courses

### EnrollmentController.js
- **Purpose**: Manages enrollment-related HTTP requests
- **Endpoints**:
  - `GET /api/enrollments` - Get student enrollments
  - `GET /api/enrollments/:id` - Get enrollment details
  - `PUT /api/enrollments/:id/progress` - Update progress
  - `POST /api/enrollments/:id/withdraw` - Withdraw from course
  - `GET /api/enrollments/stats` - Get enrollment statistics
  - `GET /api/enrollments/instructor` - Get instructor's enrollments

### LessonController.js
- **Purpose**: Handles lesson-related HTTP requests
- **Endpoints**:
  - `GET /api/lessons` - List lessons by course
  - `GET /api/lessons/:id` - Get lesson details
  - `POST /api/lessons` - Create lesson (instructor)
  - `PUT /api/lessons/:id` - Update lesson
  - `DELETE /api/lessons/:id` - Delete lesson
  - `POST /api/lessons/:id/complete` - Mark lesson complete
  - `GET /api/lessons/:id/stats` - Get lesson statistics

### ExamController.js
- **Purpose**: Manages exam-related HTTP requests
- **Endpoints**:
  - `GET /api/exams` - List exams by course
  - `GET /api/exams/:id` - Get exam details
  - `POST /api/exams` - Create exam (instructor)
  - `PUT /api/exams/:id` - Update exam
  - `DELETE /api/exams/:id` - Delete exam
  - `POST /api/exams/:id/submit` - Submit exam
  - `GET /api/exams/:id/results` - Get exam results

### AnalyticsController.js
- **Purpose**: Handles analytics and reporting requests
- **Endpoints**:
  - `GET /api/analytics/top-courses` - Top performing courses
  - `GET /api/analytics/student-progress` - Student progress analytics
  - `GET /api/analytics/instructor-analytics` - Instructor analytics
  - `GET /api/analytics/completion-trends` - Completion trends
  - `GET /api/analytics/exam-performance` - Exam performance
  - `GET /api/analytics/platform-overview` - Platform statistics

## Response Format

All controllers use standardized response formats via utility functions:

### Success Responses
```javascript
// Standard success
sendSuccessResponse(res, data, message, statusCode);

// List response with count
sendListResponse(res, data, message, statusCode, total);

// Created resource
sendCreatedResponse(res, data, message);

// Message only
sendMessageResponse(res, message, statusCode);
```

### Error Responses
```javascript
// Handled by handleErrorResponse utility
handleErrorResponse(error, res, defaultMessage);
```

## Controller Pattern

```javascript
class SomeController {
  static async someMethod(req, res) {
    try {
      // 1. Extract request data
      const { param1, param2 } = req.body;
      const { id } = req.params;
      const userId = req.user.id;
      
      // 2. Call service method
      const result = await SomeService.someMethod(id, param1, param2, userId);
      
      // 3. Send success response
      return sendSuccessResponse(res, result, "Operation successful");
      
    } catch (error) {
      // 4. Handle errors
      handleErrorResponse(error, res, "Operation failed");
    }
  }
}
```

## Best Practices

1. **Keep Controllers Thin**: Business logic belongs in services
2. **Use Error Handler**: Always use the centralized error handler
3. **Validate Early**: Input validation should happen in routes/middleware
4. **Extract Request Data**: Clearly extract all needed data at the start
5. **Consistent Responses**: Use the standard response utilities
6. **No Direct DB Access**: Controllers should only call service methods
7. **Clear Method Names**: Method names should match their HTTP purpose

## Testing Controllers

Controllers should be tested with:
1. **Unit Tests**: Mock service calls and test request/response handling
2. **Integration Tests**: Test full request flow with actual services
3. **Error Cases**: Test various error scenarios

```javascript
// Example controller test
describe('CourseController', () => {
  it('should return 201 when course is created', async () => {
    const mockCourse = { id: '123', title: 'Test Course' };
    CourseService.createCourse = jest.fn().mockResolvedValue(mockCourse);
    
    const req = {
      body: { title: 'Test Course' },
      user: { id: 'instructor123' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await CourseController.createCourse(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Course created successfully',
      data: mockCourse
    });
  });
});
```