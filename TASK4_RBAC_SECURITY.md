# Task 4: Role-Based Access Control (RBAC) & Security

## Overview

Implementation of user roles (Admin, Instructor, Student) with access restrictions enforced in database and MongoDB security features to prevent unauthorized data access.

## Implementation Codes

### RBAC Implementation for Different User Roles

#### Location: `backend/middleware/auth.js`

```javascript
// JWT authentication and role verification middleware
const protect = async (req, res, next) => {
  // JWT token verification
  // Sets req.user with authenticated user data
};

const authorize = (...roles) => {
  // Role-based access control
  // Checks if req.user.role is in allowed roles array
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized`,
      });
    }
    next();
  };
};

const checkOwnership = (Model, resourceIdField = "id") => {
  // Resource ownership verification
  // Allows admin access or resource owner access
};
```

#### Location: `backend/models/User.js`

```javascript
// User role definitions
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },
  // ... other user fields
});
```

#### Location: `backend/routes/*.js`

```javascript
// Route-level access control implementation
router.get("/", protect, authorize("admin"), UserController.getUsers);
router.post(
  "/",
  protect,
  authorize("instructor"),
  CourseController.createCourse
);
router.get(
  "/enrolled",
  protect,
  authorize("student"),
  EnrollmentController.getEnrolledCourses
);
```

## Documentation

### Role Definitions

#### 1. Student Role

- **Permissions**: View courses, enroll in courses, access enrolled content, submit exams, view own progress
- **Database Access**: Read access to own enrollment records, course content for enrolled courses

#### 2. Instructor Role

- **Permissions**: All student permissions + create/manage own courses, create lessons/exams, grade submissions
- **Database Access**: Full CRUD on own courses/lessons/exams, read access to enrolled students' data

#### 3. Admin Role

- **Permissions**: Full system access, user management, course management across all instructors
- **Database Access**: Full CRUD access to all collections

### Permission Rules and Implementation

#### Database-Level Access Restrictions

```javascript
// MongoDB security implementation
// 1. Role-based query filtering in services
if (user.role !== "admin") {
  query.instructor = user._id; // Instructors can only access own courses
}

// 2. Field-level access control
User.findById(id).select("-password"); // Exclude sensitive fields

// 3. Ownership validation
const course = await Course.findById(courseId);
if (
  course.instructor.toString() !== req.user._id.toString() &&
  req.user.role !== "admin"
) {
  throw new Error("Access denied");
}
```

#### Route-Level Implementation

- **Admin Routes**: `/api/users/*` - User management (protected by `authorize("admin")`)
- **Instructor Routes**: `/api/courses`, `/api/lessons`, `/api/exams` creation (protected by `authorize("instructor")`)
- **Student Routes**: `/api/enrollments`, progress tracking (protected by `authorize("student")`)

#### MongoDB Security Features

- Environment-based connection strings
- Password hashing with bcrypt (12 rounds)
- Input validation with express-validator
- JWT token-based authentication
