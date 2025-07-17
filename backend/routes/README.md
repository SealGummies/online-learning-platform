# Routes

API route definitions following MVC architecture pattern.

## Current Routes (MVC Architecture)

### Files

- `auth.js` - Authentication routes (login, register, profile)
- `users.js` - User management (admin operations)
- `courses.js` - Course management (CRUD, enrollment)
- `enrollments.js` - Enrollment management (progress, reviews)
- `lessons.js` - Lesson content management
- `exams.js` - Exam management and submissions

### 🔐 Authentication Routes (`auth.js`)

```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user profile
```

### 📚 Course Routes (`courses.js`)

```
GET    /api/courses          # List all courses (public)
POST   /api/courses          # Create course (instructor only)
GET    /api/courses/:id      # Get course details
PUT    /api/courses/:id      # Update course (instructor only)
DELETE /api/courses/:id      # Delete course (instructor only)
GET    /api/courses/:id/stats # Get course statistics
POST   /api/courses/:id/enroll # Enroll in course (student only)
```

### 📝 Enrollment Routes (`enrollments.js`)

```
GET    /api/enrollments      # Get student enrollments
GET    /api/enrollments/:id  # Get enrollment details
PUT    /api/enrollments/:id/progress # Update learning progress
PUT    /api/enrollments/:id/review   # Submit course review
GET    /api/enrollments/stats        # Get student statistics
```

## 🏗️ MVC Architecture Pattern

Each route file follows clean MVC principles:

### Route Structure

```javascript
const express = require("express");
const Controller = require("../controllers/Controller");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Thin routes - delegate to controllers
router.get("/", Controller.getAll);
router.post("/", protect, authorize("role"), Controller.create);

module.exports = router;
```

### Key Features

- **🎯 Single Responsibility**: Routes only handle HTTP routing
- **🎮 Controller Delegation**: Business logic in controllers/services
- **🔒 Middleware Integration**: Authentication and validation
- **📝 Input Validation**: Express-validator middleware
- **🛡️ Role-Based Access**: Fine-grained permissions

## 🔒 Authentication & Authorization

```javascript
protect                              # Requires valid JWT token
authorize('student')                 # Single role requirement
authorize(['admin', 'instructor'])   # Multiple roles allowed
```

## 📦 Legacy Files

Legacy route implementations have been moved to `../legacy/routes/`:

- Contains old monolithic routes with embedded business logic
- Preserved for reference and comparison
- No longer used in the application

## 🎯 Best Practices

1. **Keep Routes Thin**: Delegate to controllers
2. **Use Middleware**: Authentication, validation, logging
3. **RESTful Conventions**: Standard HTTP methods and paths
4. **Error Handling**: Controllers manage all error responses
5. **Consistent Responses**: Standardized JSON response format

- `PUT /api/{resource}/:id` - Update resource
- `DELETE /api/{resource}/:id` - Delete resource

## Access Control

- **Public**: Registration, login
- **Student**: View courses, enroll, submit assignments
- **Instructor**: Manage own courses and students
- **Admin**: Full system access
