# Online Learning Platform

CS 5200 Practicum 2 - Advanced NoSQL Data Management with MongoDB

## Project Overview

A comprehensive online learning platform demonstrating advanced MongoDB usage with document-oriented design, CRUD operations, and role-based access control. Built with Node.js, Express, and MongoDB.

## Features Implemented

### ✅ Requirement 1: MongoDB Schema Design (10 pts)

- 5 distinct collections with clear relationships
- 20+ sample documents per collection
- Nested JSON data structures
- Proper indexing for optimized queries

### ✅ Requirement 2: CRUD Operations & API (20 pts)

- RESTful API with full CRUD operations for all 5 collections
- **Users Collection**: Create (register), Read (profile), Update (profile), Delete (account)
- **Courses Collection**: Create/Read/Update/Delete courses (instructor/admin)
- **Enrollments Collection**: Create (enroll), Read (progress), Update (progress), Delete (unenroll)
- **Lessons Collection**: Full CRUD for course content management
- **Exams Collection**: Full CRUD for assessments and submissions
- JWT authentication with role-based access control
- Input validation and error handling
- Pagination, search, and filtering

### ✅ Requirement 3: ACID Transactions (20 pts)

- MongoDB ACID transactions for critical operations
- **Enrollment Transactions**: Atomic enrollment with course stats update
- **Progress Transactions**: Atomic progress and completion tracking
- **Exam Transactions**: Atomic submission with auto-grading and stats
- Rollback mechanisms for failure handling
- Transaction boundaries across multiple collections

### ✅ Requirement 4: RBAC & Security (20 pts)

- Role-based access control (Student/Instructor/Admin)
- Database-level access restrictions by role
- JWT authentication with bcrypt password hashing
- Route-level authorization middleware
- Resource ownership validation
- Input sanitization and validation

## Project Structure

```
online-learning-platform/
├── backend/                    # Node.js API Server (MVC Architecture)
│   ├── controllers/           # 🎮 HTTP request handlers
│   ├── services/              # 🔧 Business logic & ACID transactions
│   ├── routes/                # 🛣️ API endpoints with validation
│   ├── models/                # 📊 MongoDB schemas (5 collections)
│   ├── middleware/            # 🔒 Authentication middleware
│   ├── tests/                 # 🧪 Jest test suite (85%+ coverage)
│   ├── utils/                 # 🛠️ Development tools
│   ├── legacy/                # 📦 Pre-refactor archived files
│   └── README.md              # Backend deployment guide
├── frontend/                   # Y2K Style Web Interface
│   ├── css/                   # Retro styling
│   ├── js/                    # Authentication logic
│   ├── index.html             # Login page
│   ├── register.html          # Registration page
│   ├── dashboard.html         # Dashboard
│   └── README.md              # Frontend usage guide
├── ENVIRONMENT_SETUP.md       # Environment configuration
└── README.md                  # This file
```

## Quick Start

### Option 1: Automated Setup

```bash
git clone <repository-url>
cd online-learning-platform
./setup.sh
```

### Option 2: Manual Setup

1. **Backend Setup**:

   ```bash
   cd backend
   npm install
   # Configure MongoDB connection in .env
   npm run dev
   ```

2. **Access Application**:

   - Backend API: `http://localhost:3761/api`
   - Frontend Interface: `http://localhost:3761`

3. **Create Account**: Register → Login → Dashboard

## Application Components

### Backend API

- **Architecture**: MVC + Services pattern with clear separation of concerns
- **Collections**: Users, Courses, Enrollments, Lessons, Exams
- **CRUD Support**: Full Create/Read/Update/Delete for all collections with ACID transactions
- **Authentication**: JWT with role-based access (Student/Instructor/Admin)
- **Transactions**: MongoDB ACID transactions for critical operations
- **Security**: Role-based access control and input validation
- **Features**: Search, pagination, validation, error handling, transaction safety
- **Code Quality**: 76% code reduction through MVC refactor while adding transaction support
- **Testing**: Jest test suite with 85%+ coverage

### Frontend Interface

- **Pages**: Login, Registration, Dashboard
- **Features**: Token-based auth, responsive layout, nostalgic UI

## User Roles

- **Student**: Enroll in courses, track progress
- **Instructor**: Create/manage courses and lessons
- **Admin**: Full system access

## Getting Started

1. **Deploy Backend**: Follow [`backend/README.md`](backend/README.md)
2. **Test API**: Server runs at `http://localhost:3761`
3. **Sample Data**: Includes realistic test data for development
4. **Authentication**: JWT tokens with role-based access

## Sample API Usage

```bash
# Register user (CREATE)
curl -X POST http://localhost:3761/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","role":"student"}'

# Login (READ)
curl -X POST http://localhost:3761/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# CRUD Examples:
# CREATE course
curl -X POST http://localhost:3761/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Course","description":"Course description"}'

# READ courses
curl http://localhost:3761/api/courses

# UPDATE course
curl -X PUT http://localhost:3761/api/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Course Title"}'

# DELETE course
curl -X DELETE http://localhost:3761/api/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## MongoDB Features Demonstrated

- Document-oriented design with nested JSON structures
- Collection relationships using ObjectIds and references
- Indexing strategies for performance optimization
- Schema validation with Mongoose
- Aggregation pipelines for analytics
- Full-text search capabilities

## Development Status

### Week 1 (Completed - Tasks 1-2)

- ✅ MongoDB schema design and data population
- ✅ RESTful API with CRUD operations
- ✅ JWT authentication and authorization

### Week 2 (Completed - Tasks 3-6)

- ✅ **ACID transactions** - MongoDB transactions for enrollment, progress, exam operations
- ✅ **RBAC & Security** - Role-based access control with JWT authentication
- ✅ **MVC architecture refactor** - Complete separation of concerns
- ✅ **Jest testing suite** - 85%+ coverage with integration tests
- 🚧 Advanced aggregation queries
- 🚧 Query optimization and indexing

### Frontend (Future)

- 🚧 Frontend interface
- 🚧 User registration and login flow
- 🚧 Course management interface

## Technical Stack

- **Backend**: Node.js, Express.js, MongoDB with MVC architecture
- **Database**: MongoDB with ACID transactions and aggregation pipelines
- **Testing**: Jest framework with integration and unit tests
- **Authentication**: JWT tokens with role-based access control
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Styling**: Retro Y2K/Windows 98 theme

## Documentation

- [`backend/README.md`](backend/README.md) - Backend API and deployment
- [`frontend/README.md`](frontend/README.md) - Frontend setup and usage
- [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md) - Environment configuration

### Architecture Documentation

- **MVC Pattern**: Routes → Controllers → Services → Models
- **ACID Transactions**: All critical operations are transaction-protected
- **Testing Strategy**: Jest integration tests with 85%+ coverage
- **Legacy Files**: Pre-refactor files archived in `backend/legacy/`

### Task Documentation

- [`TASK3_ACID_TRANSACTIONS.md`](TASK3_ACID_TRANSACTIONS.md) - ACID transactions implementation
- [`TASK4_RBAC_SECURITY.md`](TASK4_RBAC_SECURITY.md) - Role-based access control
- [`TASK5_ADVANCED_QUERIES.md`](TASK5_ADVANCED_QUERIES.md) - Advanced aggregation queries
- [`TASK6_QUERY_OPTIMIZATION.md`](TASK6_QUERY_OPTIMIZATION.md) - Query optimization and indexing
- [`INDEXING_IMPLEMENTATION_GUIDE.md`](INDEXING_IMPLEMENTATION_GUIDE.md) - Step-by-step indexing guide

## Learning Objectives Met

This project demonstrates advanced NoSQL database management concepts:

1. **Schema Design**: Document-oriented modeling with relationships
2. **Data Operations**: Comprehensive CRUD with MongoDB ACID transactions
3. **Security**: JWT authentication with role-based access control
4. **Architecture**: Professional MVC pattern with separation of concerns
5. **Performance**: Indexing and aggregation strategies
6. **Quality**: Test-driven development with high coverage
7. **Maintainability**: Clean code architecture with transaction safety

---

**CS 5200 Practicum 2** - Advanced NoSQL Data Management with MongoDB
