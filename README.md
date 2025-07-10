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

- **Collections**: Users, Courses, Enrollments, Lessons, Exams
- **Authentication**: JWT with role-based access (Student/Instructor/Admin)
- **Features**: CRUD operations, search, pagination, validation

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
# Register user
curl -X POST http://localhost:3761/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","role":"student"}'

# Login
curl -X POST http://localhost:3761/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get courses
curl http://localhost:3761/api/courses
```

## MongoDB Features Demonstrated

- Document-oriented design with nested JSON structures
- Collection relationships using ObjectIds and references
- Indexing strategies for performance optimization
- Schema validation with Mongoose
- Aggregation pipelines for analytics
- Full-text search capabilities

## Development Status

- ✅ MongoDB schema design and data population
- ✅ RESTful API with CRUD operations
- ✅ JWT authentication and authorization
- ✅ Y2K style frontend interface
- ✅ User registration and login flow
- 🚧 Course management interface (coming soon)
- 🚧 ACID transactions (future enhancement)

## Technical Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Authentication**: JWT tokens
- **Styling**: Retro Y2K/Windows 98 theme

## Documentation

- [`backend/README.md`](backend/README.md) - Backend API and deployment
- [`frontend/README.md`](frontend/README.md) - Frontend setup and usage
- [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md) - Environment configuration

## Learning Objectives Met

This project demonstrates advanced NoSQL database management concepts:

1. **Schema Design**: Document-oriented modeling with relationships
2. **Data Operations**: Comprehensive CRUD with MongoDB
3. **Performance**: Indexing and aggregation strategies
4. **Security**: Authentication and role-based access
5. **Architecture**: RESTful API design patterns

---

**CS 5200 Practicum 2** - Advanced NoSQL Data Management with MongoDB
