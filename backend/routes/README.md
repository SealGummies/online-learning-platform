# Routes Directory

This directory contains Express route definitions that map HTTP endpoints to controller methods and apply middleware.

## Overview

The routes layer is responsible for:
- Defining API endpoints and HTTP methods
- Applying authentication and authorization middleware
- Validating request data using express-validator
- Routing requests to appropriate controllers
- Organizing endpoints by resource type

## Route Files

### auth.js
- **Base Path**: `/api/auth`
- **Purpose**: Authentication and user session management
- **Public Endpoints**:
  - `POST /register` - User registration
  - `POST /login` - User authentication
  - `POST /forgot-password` - Password reset request
  - `POST /reset-password/:token` - Complete password reset
- **Protected Endpoints**:
  - `GET /me` - Get current user info
  - `PUT /me` - Update user profile
  - `PUT /change-password` - Change password

### users.js
- **Base Path**: `/api/users`
- **Purpose**: User management (admin functions)
- **Protected Endpoints** (Admin only unless specified):
  - `GET /` - List all users
  - `POST /` - Create new user
  - `GET /:id` - Get user by ID
  - `PUT /:id` - Update user
  - `DELETE /:id` - Delete user
  - `PATCH /:id/status` - Toggle user active status
  - `GET /:id/stats` - Get user statistics
  - `GET /:id/enrollments` - Get user's enrollments
  - `GET /instructors` - List all instructors
  - `GET /students` - List all students

### courses.js
- **Base Path**: `/api/courses`
- **Purpose**: Course management
- **Public Endpoints**:
  - `GET /` - List courses with filtering
  - `GET /:id` - Get course details
  - `GET /:id/stats` - Get course statistics
- **Protected Endpoints**:
  - `POST /` - Create course (Instructor)
  - `PUT /:id` - Update course (Instructor - own courses)
  - `DELETE /:id` - Delete course (Instructor - own courses)
  - `POST /:id/enroll` - Enroll in course (Student)
  - `GET /instructor/my-courses` - Get instructor's courses (Instructor)

### enrollments.js
- **Base Path**: `/api/enrollments`
- **Purpose**: Enrollment and progress management
- **Protected Endpoints**:
  - `GET /` - Get student's enrollments (Student)
  - `GET /:id` - Get enrollment details (Student - own)
  - `PUT /:id/progress` - Update progress (Student - own)
  - `POST /:id/withdraw` - Withdraw from course (Student - own)
  - `GET /stats` - Get enrollment statistics (Student)
  - `GET /instructor` - Get course enrollments (Instructor)

### lessons.js
- **Base Path**: `/api/lessons`
- **Purpose**: Lesson content management
- **Query Parameters**: All endpoints require `courseId`
- **Protected Endpoints**:
  - `GET /` - List lessons (access based on enrollment)
  - `GET /:id` - Get lesson details (access based on enrollment)
  - `POST /` - Create lesson (Instructor - own course)
  - `PUT /:id` - Update lesson (Instructor - own course)
  - `DELETE /:id` - Delete lesson (Instructor - own course)
  - `POST /:id/complete` - Mark lesson complete (Student)
  - `GET /:id/stats` - Get lesson statistics (Instructor)

### exams.js
- **Base Path**: `/api/exams`
- **Purpose**: Exam and assessment management
- **Query Parameters**: Most endpoints require `courseId`
- **Protected Endpoints**:
  - `GET /` - List exams (access based on enrollment)
  - `GET /:id` - Get exam details (access based on enrollment)
  - `POST /` - Create exam (Instructor - own course)
  - `PUT /:id` - Update exam (Instructor - own course)
  - `DELETE /:id` - Delete exam (Instructor - own course)
  - `POST /:id/submit` - Submit exam answers (Student)
  - `GET /:id/results` - Get exam results (Student - own)
  - `GET /:id/stats` - Get exam statistics (Instructor)

### analytics.js
- **Base Path**: `/api/analytics`
- **Purpose**: Analytics and reporting endpoints
- **Protected Endpoints** (Role-based access):
  - `GET /top-courses` - Top performing courses
  - `GET /student-progress` - Student progress analytics
  - `GET /instructor-analytics` - Instructor performance
  - `GET /completion-trends` - Course completion trends
  - `GET /exam-performance` - Exam performance analysis
  - `GET /platform-overview` - Platform-wide statistics
  - `GET /instructor/enrollments` - Instructor's enrollment data
  - `GET /instructor/overview` - Instructor dashboard data

## Middleware Usage

### Authentication Middleware
```javascript
const { protect } = require('../middleware/auth');
router.use(protect); // Require authentication for all routes below
```

### Authorization Middleware
```javascript
const { authorize } = require('../middleware/auth');
router.post('/', protect, authorize('instructor'), CourseController.createCourse);
```

### Validation Middleware
```javascript
const { body, validationResult } = require('express-validator');

const validateCourse = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
```

## Route Organization Pattern

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const Controller = require('../controllers/Controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateResource = [...];

// Public routes
router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);

// Protected routes - require authentication
router.use(protect);

// Role-specific routes
router.post('/', authorize('role'), validateResource, Controller.create);
router.put('/:id', authorize('role'), validateResource, Controller.update);
router.delete('/:id', authorize('role'), Controller.delete);

module.exports = router;
```

## Best Practices

1. **Group Routes Logically**: Organize by access level (public, authenticated, role-specific)
2. **Use Middleware Chains**: Apply middleware in the correct order
3. **Validate Early**: Input validation should happen before controller
4. **Keep Routes Thin**: No business logic in route files
5. **RESTful Conventions**: Use appropriate HTTP methods
6. **Clear Path Structure**: Hierarchical and intuitive URL patterns
7. **Document Query Parameters**: Clearly indicate required query params

## Testing Routes

Routes should be tested with integration tests:

```javascript
const request = require('supertest');
const app = require('../server');

describe('POST /api/courses', () => {
  it('should create course with valid data', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        level: 'Beginner',
        price: 49.99
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Course');
  });
  
  it('should return 403 for students', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validCourseData);
      
    expect(response.status).toBe(403);
  });
});
```