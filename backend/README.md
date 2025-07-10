# Online Learning Platform - Backend API

This is the backend API for the Online Learning Platform, built with Node.js, Express, and MongoDB. It implements comprehensive CRUD operations, JWT authentication, and role-based access control (RBAC).

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Testing](#testing)

## Features

### ✅ Requirement 1: MongoDB Schema Design and Data Population

- **5 distinct collections** with clear relationships:
  - `Users` - Students, instructors, and admins
  - `Courses` - Course information and settings
  - `Enrollments` - Student course enrollments with progress tracking
  - `Lessons` - Course lessons with various content types
  - `Exams` - Quizzes, midterms, finals, and assignments
- **20+ sample documents** per collection with realistic data
- **Nested JSON data** for complex structures (user profiles, course settings, lesson content)
- **Proper indexing** for optimized queries
- **Relationships** between collections using MongoDB ObjectIds

### ✅ Requirement 2: CRUD Operations & API Development

- **REST API** built with Express.js
- **Full CRUD operations** for all collections
- **JWT Authentication** with secure token management
- **Role-Based Access Control (RBAC)** with three roles:
  - **Students**: Enroll in courses, track progress, submit exams
  - **Instructors**: Create and manage courses, lessons, and exams
  - **Admins**: Full system access and user management
- **Input validation** using express-validator
- **Error handling** with consistent response format
- **Pagination** for large data sets
- **Search and filtering** capabilities

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication & authorization
├── models/
│   ├── User.js              # User schema
│   ├── Course.js            # Course schema
│   ├── Enrollment.js        # Enrollment schema
│   ├── Lesson.js            # Lesson schema
│   └── Exam.js              # Exam schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── courses.js           # Course management routes
│   ├── enrollments.js       # Enrollment routes
│   ├── lessons.js           # Lesson management routes
│   └── exams.js             # Exam management routes
├── scripts/
│   └── seedDatabase.js      # Database seeding script
├── .env                     # Environment variables
├── package.json             # Dependencies
└── server.js               # Main server file
```

## Database Schema

### Users Collection

- Personal information (name, email, profile)
- Role-based access (student, instructor, admin)
- Nested profile data (bio, address, social links)
- User preferences and statistics
- Authentication fields (password, tokens)

### Courses Collection

- Course metadata (title, description, category, level)
- Instructor relationship
- Pricing and duration information
- Course settings (published, discussions, certificates)
- Performance statistics
- Nested syllabus and resources

### Enrollments Collection

- Student-course relationships
- Payment details and transaction history
- Progress tracking with completion percentages
- Nested lesson and exam completion data
- Reviews and ratings

### Lessons Collection

- Course relationship and ordering
- Multiple content types (video, text, quiz, assignment)
- Nested content data for each type
- Prerequisites and learning objectives
- Performance analytics

### Exams Collection

- Course relationship and exam metadata
- Question arrays with multiple types
- Nested exam settings and availability
- Performance statistics
- Grading and feedback systems

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd online-learning-platform/backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
# Copy .env file and update with your settings
cp .env.example .env
```

4. **Start MongoDB:**

```bash
# Make sure MongoDB is running locally or update MONGODB_URI in .env
mongod
```

5. **Seed the database:**

```bash
npm run seed
```

6. **Start the server:**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Login User

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

#### Change Password

```http
PUT /api/auth/password
Authorization: Bearer <token>
```

### Course Endpoints

#### Get All Courses

```http
GET /api/courses
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `level`: Filter by level
- `search`: Search in title/description
- `sort`: Sort by (price-low, price-high, rating, popular, newest)

#### Get Course by ID

```http
GET /api/courses/:id
```

#### Create Course (Instructor/Admin)

```http
POST /api/courses
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript from scratch",
  "category": "Programming",
  "level": "Beginner",
  "price": 99.99,
  "tags": ["javascript", "programming", "web"],
  "requirements": ["Basic computer skills"],
  "learningObjectives": ["Understand JS basics", "Build simple applications"]
}
```

#### Update Course

```http
PUT /api/courses/:id
Authorization: Bearer <token>
```

#### Delete Course

```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

#### Enroll in Course (Student)

```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

#### Get Course Enrollments (Instructor/Admin)

```http
GET /api/courses/:id/enrollments
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get All Users (Admin)

```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Create User (Admin)

```http
POST /api/users
Authorization: Bearer <token>
```

#### Update User

```http
PUT /api/users/:id
Authorization: Bearer <token>
```

#### Delete User (Admin)

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

#### Get User Statistics

```http
GET /api/users/:id/stats
Authorization: Bearer <token>
```

### Enrollment Endpoints

#### Get User Enrollments (Student)

```http
GET /api/enrollments
Authorization: Bearer <token>
```

#### Get Enrollment by ID

```http
GET /api/enrollments/:id
Authorization: Bearer <token>
```

#### Update Enrollment Progress

```http
PUT /api/enrollments/:id/progress
Authorization: Bearer <token>
```

#### Add Review

```http
PUT /api/enrollments/:id/review
Authorization: Bearer <token>
```

#### Unenroll from Course

```http
DELETE /api/enrollments/:id
Authorization: Bearer <token>
```

### Lesson Endpoints

#### Get Lessons for Course

```http
GET /api/lessons?course=:courseId
```

#### Get Lesson by ID

```http
GET /api/lessons/:id
```

#### Create Lesson (Instructor)

```http
POST /api/lessons
Authorization: Bearer <token>
```

#### Update Lesson

```http
PUT /api/lessons/:id
Authorization: Bearer <token>
```

#### Delete Lesson

```http
DELETE /api/lessons/:id
Authorization: Bearer <token>
```

#### Mark Lesson Complete (Student)

```http
POST /api/lessons/:id/complete
Authorization: Bearer <token>
```

### Exam Endpoints

#### Get Exams for Course

```http
GET /api/exams?course=:courseId
Authorization: Bearer <token>
```

#### Get Exam by ID

```http
GET /api/exams/:id
Authorization: Bearer <token>
```

#### Create Exam (Instructor)

```http
POST /api/exams
Authorization: Bearer <token>
```

#### Update Exam

```http
PUT /api/exams/:id
Authorization: Bearer <token>
```

#### Delete Exam

```http
DELETE /api/exams/:id
Authorization: Bearer <token>
```

#### Submit Exam (Student)

```http
POST /api/exams/:id/submit
Authorization: Bearer <token>
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 30 days by default (configurable in environment variables).

## Role-Based Access Control

### Student Role

- View published courses and lessons
- Enroll in courses
- Track progress and submit exams
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

## Testing

You can test the API using tools like Postman or curl. Here are some example requests:

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

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get courses

```bash
curl -X GET http://localhost:5000/api/courses
```

### 4. Get user profile (requires auth token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=30d
```

## Database Population

The database is populated with realistic sample data:

- **1 Admin user** with full system access
- **3 Instructor users** with different specializations
- **20+ Student users** with various enrollment patterns
- **20+ Courses** across different categories and levels
- **100+ Lessons** with various content types
- **50+ Exams** with different question types
- **Multiple Enrollments** with realistic progress tracking

Use the seed script to populate the database:

```bash
npm run seed
```

## Key Features Implemented

1. **Document-Oriented Design**: Utilizes MongoDB's document structure with nested objects
2. **Comprehensive Relationships**: Proper linking between users, courses, enrollments, lessons, and exams
3. **Advanced Querying**: Search, filtering, sorting, and pagination
4. **Security**: JWT authentication, password hashing, input validation
5. **Role-Based Access**: Three distinct user roles with appropriate permissions
6. **Progress Tracking**: Detailed enrollment progress with completion percentages
7. **Performance Analytics**: Statistics for courses, lessons, and exams
8. **Flexible Content**: Support for multiple lesson and exam types

This implementation provides a solid foundation for a production-ready online learning platform with all the required features for the practicum.
