# Online Learning Platform - CS 5200 Practicum 2

## Project Overview

This is an **Online Learning Platform** built for CS 5200 Practicum 2, implementing advanced NoSQL data management with MongoDB. The platform supports instructors creating courses and students enrolling in them, with comprehensive CRUD operations, JWT authentication, and role-based access control.

## Features Implemented

### ✅ Requirement 1: MongoDB Schema Design and Data Population (10 pts)

- **5 distinct collections** with clear relationships:
  - `Users` - Students, instructors, and admins with nested profile data
  - `Courses` - Course information with instructor relationships
  - `Enrollments` - Student-course relationships with progress tracking
  - `Lessons` - Course content with multiple types (video, text, quiz, assignment)
  - `Exams` - Assessments with various question types
- **20+ sample documents** per collection with realistic data
- **Nested JSON data** for complex structures (profiles, settings, content)
- **Proper indexing** for optimized MongoDB queries

### ✅ Requirement 2: CRUD Operations & API Development (20 pts)

- **REST API** built with Node.js and Express
- **Full CRUD operations** for all collections
- **JWT Authentication** with secure token management
- **Role-Based Access Control (RBAC)** with three roles:
  - **Students**: Enroll in courses, track progress, submit exams
  - **Instructors**: Create and manage courses, lessons, and exams
  - **Admins**: Full system access and user management
- **Input validation** and error handling
- **Pagination, search, and filtering** capabilities

## Project Structure

```
online-learning-platform/
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── scripts/            # Database seeding
│   └── server.js           # Main server file
├── frontend/               # React frontend (future)
└── README.md               # Project documentation
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) **OR** MongoDB Atlas (cloud database)
- npm or yarn

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd online-learning-platform
```

2. **Install backend dependencies:**

```bash
cd backend
npm install
```

3. **Set up environment variables:**

```bash
# Copy .env file and update with your settings
cp .env.example .env
```

4. **Choose your database option:**

**Option A: Local MongoDB**

```bash
# Make sure MongoDB is running locally
mongod
```

**Option B: Cloud MongoDB Atlas**

```bash
# Update .env with your Atlas connection string
# See backend/MONGODB_ATLAS_GUIDE.md for detailed instructions
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=Cluster0
```

5. **Test database connection:**

```bash
# Test local MongoDB
npm run test-db

# Test MongoDB Atlas
npm run test-atlas
```

6. **Seed the database with sample data:**

```bash
npm run seed
```

7. **Start the development server:**

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Overview

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Courses

- `GET /api/courses` - Get all courses (with search/filter)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Users

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Enrollments

- `GET /api/enrollments` - Get user enrollments (Student)
- `PUT /api/enrollments/:id/progress` - Update progress
- `PUT /api/enrollments/:id/review` - Add review
- `DELETE /api/enrollments/:id` - Unenroll

### Lessons

- `GET /api/lessons?course=:id` - Get lessons for course
- `POST /api/lessons` - Create lesson (Instructor)
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson
- `POST /api/lessons/:id/complete` - Mark complete (Student)

### Exams

- `GET /api/exams?course=:id` - Get exams for course
- `POST /api/exams` - Create exam (Instructor)
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `POST /api/exams/:id/submit` - Submit exam (Student)

## Sample Data

The database is populated with realistic sample data:

- **1 Admin user** with full system access
- **3 Instructor users** with different specializations
- **20+ Student users** with various enrollment patterns
- **20+ Courses** across different categories (Programming, Data Science, Web Development, etc.)
- **100+ Lessons** with various content types (video, text, quiz, assignment)
- **50+ Exams** with different question types (multiple-choice, true-false, short-answer)
- **Multiple Enrollments** with realistic progress tracking

## Authentication & Authorization

The platform uses JWT tokens for authentication with role-based access control:

### Student Role

- View published courses and lessons
- Enroll in courses and track progress
- Submit exams and receive grades
- Manage own profile and enrollments

### Instructor Role

- All student permissions
- Create and manage own courses
- Create lessons and exams for own courses
- View enrollment statistics for own courses

### Admin Role

- Full system access
- Manage all users, courses, and content
- Access system-wide statistics
- User management capabilities

## Testing the API

You can test the API using tools like Postman or curl:

### 1. Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### 2. Login and get token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get all courses

```bash
curl -X GET http://localhost:5000/api/courses
```

### 4. Get user profile (requires auth token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## MongoDB Schema Highlights

### Advanced Features

- **Nested Documents**: User profiles, course settings, lesson content
- **References**: Instructor-course, student-enrollment relationships
- **Indexing**: Optimized queries for email, role, ratings, dates
- **Validation**: Schema-level validation for data integrity
- **Aggregation**: Statistics calculation for users and courses

### Sample Document Structure

```javascript
// User document example
{
  "_id": ObjectId("..."),
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "role": "instructor",
  "profile": {
    "bio": "Full-stack developer with 10+ years experience",
    "avatar": "https://example.com/avatar.jpg",
    "address": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johnsmith",
      "github": "https://github.com/johnsmith"
    }
  },
  "stats": {
    "coursesCreated": 5,
    "averageRating": 4.8,
    "totalPoints": 2450
  },
  "preferences": {
    "notifications": {
      "email": true,
      "push": true
    },
    "language": "en",
    "timezone": "UTC"
  },
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## Next Steps

This implementation covers the first two requirements of the practicum:

1. ✅ MongoDB Schema Design and Data Population
2. ✅ CRUD Operations & API Development

Future enhancements could include:

- ACID transaction implementation for enrollment conflicts
- Advanced MongoDB aggregation for analytics
- Data replication and sharding strategies
- Frontend React application
- Real-time features with WebSockets

## Documentation

For detailed API documentation, see [`backend/README.md`](backend/README.md).

## Contributors

Built for CS 5200 Practicum 2 - Advanced NoSQL Data Management with MongoDB.

---

**Note**: This project demonstrates advanced MongoDB usage with document-oriented design, comprehensive CRUD operations, and role-based access control suitable for a production learning platform.
