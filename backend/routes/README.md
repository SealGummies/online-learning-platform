# Routes

API endpoints and business logic.

## Files

- `auth.js` - Authentication (login, register)
- `users.js` - User management
- `courses.js` - Course management
- `enrollments.js` - Enrollment management
- `lessons.js` - Lesson content
- `exams.js` - Exam management

## API Structure

RESTful endpoints:

- `GET /api/{resource}` - List resources
- `GET /api/{resource}/:id` - Get single resource
- `POST /api/{resource}` - Create resource
- `PUT /api/{resource}/:id` - Update resource
- `DELETE /api/{resource}/:id` - Delete resource

## Access Control

- **Public**: Registration, login
- **Student**: View courses, enroll, submit assignments
- **Instructor**: Manage own courses and students
- **Admin**: Full system access
