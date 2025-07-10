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

- RESTful API with full CRUD operations
- JWT authentication with role-based access control
- Input validation and error handling
- Pagination, search, and filtering

## Project Structure

```
online-learning-platform/
├── backend/                    # Node.js API Server
│   ├── config/                # Database configuration
│   ├── middleware/            # Authentication middleware
│   ├── models/                # MongoDB schemas (5 collections)
│   ├── routes/                # API endpoints
│   ├── scripts/               # Database seeding
│   ├── utils/                 # Development tools
│   └── README.md              # 👈 Backend deployment guide
├── ENVIRONMENT_SETUP.md       # Environment configuration
└── README.md                  # 👈 This file
```

## Quick Start

### Option 1: Automated Setup

```bash
git clone <repository-url>
cd online-learning-platform
./setup.sh
```

### Option 2: Manual Setup

1. **Clone and navigate**:

   ```bash
   git clone <repository-url>
   cd online-learning-platform/backend
   ```

2. **Follow backend setup**:
   📖 See [`backend/README.md`](backend/README.md) for detailed deployment instructions

3. **For environment configuration**:
   📖 See [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md) for advanced configuration

## Database Collections

The platform uses 5 MongoDB collections:

- **Users** - Students, instructors, admins with profile data
- **Courses** - Course information with instructor relationships
- **Enrollments** - Student-course relationships with progress tracking
- **Lessons** - Course content (video, text, quiz, assignment types)
- **Exams** - Assessments with various question types

## User Roles & Permissions

- **Student**: Enroll in courses, track progress, submit exams
- **Instructor**: Create/manage courses, lessons, and exams
- **Admin**: Full system access and user management

## API Overview

The REST API provides endpoints for:

- **Authentication**: Register, login, profile management
- **Courses**: CRUD operations with search and filtering
- **Enrollments**: Student course management
- **Lessons**: Course content management
- **Exams**: Assessment creation and submission
- **Users**: User management (admin)

## Getting Started

1. **Deploy Backend**: Follow [`backend/README.md`](backend/README.md)
2. **Test API**: Server runs at `http://localhost:3761`
3. **Sample Data**: Includes realistic test data for development
4. **Authentication**: JWT tokens with role-based access

## Sample API Usage

```bash
# Get all courses
curl http://localhost:3761/api/courses

# Register user
curl -X POST http://localhost:3761/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","role":"student"}'

# Login and get token
curl -X POST http://localhost:3761/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## MongoDB Features Demonstrated

- **Document-oriented design** with nested JSON structures
- **Collection relationships** using ObjectIds and references
- **Indexing strategies** for performance optimization
- **Schema validation** with Mongoose
- **Aggregation pipelines** for statistics and analytics
- **Full-text search** capabilities

## Development Status

- ✅ MongoDB schema design and data population
- ✅ RESTful API with CRUD operations
- ✅ JWT authentication and authorization
- ✅ Role-based access control
- ✅ Comprehensive sample data
- 🚧 Frontend interface (future enhancement)
- 🚧 ACID transactions (future enhancement)

## Technical Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (local or Atlas cloud)
- **Authentication**: JWT tokens
- **Validation**: Mongoose schemas, express-validator
- **Development**: Nodemon, sample data seeding

## Documentation

- [`backend/README.md`](backend/README.md) - Backend deployment and API usage
- [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md) - Environment configuration
- Backend route folders contain individual README files for each module

## Learning Objectives Met

This project demonstrates advanced NoSQL database management concepts:

1. **Schema Design**: Document-oriented modeling with relationships
2. **Data Operations**: Comprehensive CRUD with MongoDB
3. **Performance**: Indexing and aggregation strategies
4. **Security**: Authentication and role-based access
5. **Architecture**: RESTful API design patterns

---

**CS 5200 Practicum 2** - Advanced NoSQL Data Management with MongoDB
