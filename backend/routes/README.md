# Routes

API route definitions following simplified MVC architecture.

## Route Files

- `auth.js` - Authentication (register, login, current user)
- `users.js` - User management (CRUD, status, stats)
- `courses.js` - Course management (CRUD, enrollment, stats)
- `enrollments.js` - Enrollment management (CRUD, progress, withdraw, stats)
- `lessons.js` - Lesson management (CRUD, stats)
- `exams.js` - Exam management (CRUD, stats)

## Example Endpoints

### Authentication (`auth.js`)

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user info
```

### Users (`users.js`)

```
GET    /api/users            # List users (admin)
POST   /api/users            # Create user (admin)
GET    /api/users/:id        # Get user details
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user (admin)
PATCH  /api/users/:id/status # Update user status (admin)
GET    /api/users/:id/stats  # Get user statistics
GET    /api/users/:id/enrollments # Get user enrollments
GET    /api/users/instructors # List instructors
GET    /api/users/students    # List students
```

### Courses (`courses.js`)

```
GET    /api/courses          # List all courses
POST   /api/courses          # Create course (instructor)
GET    /api/courses/:id      # Get course details
PUT    /api/courses/:id      # Update course (instructor)
DELETE /api/courses/:id      # Delete course (instructor)
GET    /api/courses/:id/stats # Get course statistics
POST   /api/courses/:id/enroll # Enroll in course (student)
```

### Enrollments (`enrollments.js`)

```
GET    /api/enrollments      # List student enrollments
GET    /api/enrollments/:id  # Get enrollment details
PUT    /api/enrollments/:id/progress # Update progress
POST   /api/enrollments/:id/withdraw # Withdraw from course
GET    /api/enrollments/stats # Get student statistics
```

### Lessons (`lessons.js`)

```
GET    /api/lessons          # List lessons (by course)
GET    /api/lessons/:id      # Get lesson details
POST   /api/lessons          # Create lesson (instructor)
PUT    /api/lessons/:id      # Update lesson (instructor)
DELETE /api/lessons/:id      # Delete lesson (instructor)
GET    /api/lessons/:id/stats # Get lesson statistics
```

### Exams (`exams.js`)

```
GET    /api/exams            # List exams (by course)
GET    /api/exams/:id        # Get exam details
POST   /api/exams            # Create exam (instructor)
PUT    /api/exams/:id        # Update exam (instructor)
DELETE /api/exams/:id        # Delete exam (instructor)
GET    /api/exams/:id/stats  # Get exam statistics
```

## Route Principles

- **Thin Routes**: Only handle HTTP routing, delegate logic to controllers
- **Middleware**: Use for authentication, authorization, validation
- **RESTful**: Standard HTTP methods and resource paths
- **Role-Based Access**: Enforced via middleware (student, instructor, admin)
- **Consistent JSON Responses**: All endpoints return standardized JSON

## Access Control

- **Public**: Registration, login
- **Student**: Enrollments, course access
- **Instructor**: Manage own courses, lessons, exams
- **Admin**: Full user and system management

## Best Practices

1. Keep routes minimal and focused
2. Use middleware for security and validation
3. Follow RESTful conventions
4. Delegate all business logic to controllers/services
5. Standardize error and success responses
