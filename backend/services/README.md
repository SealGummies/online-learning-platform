# Services Directory

This directory contains the business logic layer of the application, implementing core functionality and data operations.

## Overview

The services layer is responsible for:
- Implementing business logic and rules
- Handling database transactions
- Coordinating between models
- Providing reusable methods for controllers
- Ensuring data consistency and integrity

## Services

### AuthService.js
- **Purpose**: Handles authentication and authorization logic
- **Key Methods**:
  - `register()` - User registration with validation
  - `login()` - User authentication and token generation
  - `getCurrentUser()` - Retrieve authenticated user details
  - `updateProfile()` - Update user profile information
  - `changePassword()` - Secure password change
  - `forgotPassword()` - Password reset initiation
  - `resetPassword()` - Complete password reset

### UserService.js
- **Purpose**: Manages user-related operations
- **Key Methods**:
  - `createUser()` - Admin user creation with transaction
  - `getUsers()` - Retrieve users with filtering
  - `getUserById()` - Get specific user details
  - `updateUser()` - Update user information
  - `deleteUser()` - Soft delete with validation
  - `getUserStats()` - Get role-specific statistics
  - `getStudentStats()` - Student-specific metrics
  - `getInstructorStats()` - Instructor-specific metrics
  - `getUserDashboard()` - Comprehensive dashboard data

### CourseService.js
- **Purpose**: Handles course management operations
- **Key Methods**:
  - `getCourses()` - List courses with filtering and search
  - `getCourseById()` - Get course with enrollment status
  - `createCourse()` - Create new course
  - `updateCourse()` - Update course with authorization
  - `deleteCourse()` - Delete course with cascade handling
  - `enrollStudent()` - Enroll student with transaction
  - `getCourseStats()` - Course analytics and metrics

### EnrollmentService.js
- **Purpose**: Manages student enrollments and progress
- **Key Methods**:
  - `getStudentEnrollments()` - List student's enrollments
  - `getEnrollmentById()` - Get specific enrollment
  - `updateProgress()` - Update learning progress
  - `submitReview()` - Submit course review
  - `withdrawEnrollment()` - Withdraw from course
  - `getStudentStats()` - Enrollment statistics

### LessonService.js
- **Purpose**: Manages course lessons and content
- **Key Methods**:
  - `getLessons()` - List lessons with access control
  - `getLessonById()` - Get specific lesson
  - `createLesson()` - Create new lesson
  - `updateLesson()` - Update lesson content
  - `deleteLesson()` - Delete lesson with validation
  - `completeLesson()` - Mark lesson as completed
  - `reorderLessons()` - Reorder lessons in course

### ExamService.js
- **Purpose**: Handles exams and assessments
- **Key Methods**:
  - `getExams()` - List exams with access control
  - `getExamById()` - Get specific exam
  - `createExam()` - Create new exam
  - `updateExam()` - Update exam details
  - `deleteExam()` - Delete exam
  - `submitExam()` - Submit exam answers
  - `getExamResults()` - Get exam results

### AnalyticsService.js
- **Purpose**: Provides analytics and reporting
- **Key Methods**:
  - `getTopPerformingCourses()` - Course performance metrics
  - `getStudentProgressAnalytics()` - Student progress analysis
  - `getInstructorAnalytics()` - Instructor performance
  - `getCourseCompletionTrends()` - Completion statistics
  - `getPlatformOverview()` - Platform-wide metrics

### TransactionService.js
- **Purpose**: Manages MongoDB transactions
- **Key Methods**:
  - `executeTransaction()` - Execute multiple operations atomically
  - `executeWithTransaction()` - Single operation with transaction
  - `executeWithRetry()` - Transaction with retry logic
  - `isRetryableError()` - Check if error can be retried

## Design Patterns

### 1. Transaction Pattern
```javascript
return TransactionService.executeWithTransaction(async (session) => {
  // Perform multiple operations
  // All succeed or all fail
});
```

### 2. Error Handling Pattern
```javascript
if (!resource) {
  throw new Error('Resource not found');
}
```

### 3. Authorization Pattern
```javascript
if (course.instructor.toString() !== instructorId) {
  throw new Error('Not authorized to update this course');
}
```

### 4. Validation Pattern
```javascript
if (password.length < 6) {
  throw new Error('Password must be at least 6 characters long');
}
```

## Best Practices

1. **Use Transactions**: For operations that modify multiple documents
2. **Validate Early**: Check permissions and validate input at the start
3. **Throw Descriptive Errors**: Use clear error messages for better debugging
4. **Keep Methods Focused**: Each method should have a single responsibility
5. **Use Lean Queries**: Add `.lean()` for read-only operations
6. **Populate Wisely**: Only populate fields that are needed
7. **Handle Edge Cases**: Always check for null/undefined values

## Example Usage

```javascript
// In a controller
const CourseService = require('../services/CourseService');

try {
  const result = await CourseService.enrollStudent(courseId, userId);
  res.status(201).json({
    success: true,
    data: result.enrollment,
    message: result.message
  });
} catch (error) {
  res.status(400).json({
    success: false,
    message: error.message
  });
}
```

## Testing Services

Services should be tested with:
1. **Unit Tests**: Mock database calls and test business logic
2. **Integration Tests**: Test with actual database operations
3. **Edge Cases**: Test error conditions and boundary values

```javascript
// Example test
describe('CourseService', () => {
  it('should not allow duplicate enrollment', async () => {
    await expect(
      CourseService.enrollStudent(courseId, userId)
    ).rejects.toThrow('Already enrolled in this course');
  });
});
```