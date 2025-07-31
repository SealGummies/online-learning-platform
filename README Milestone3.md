
# README - Online Learning Platform

## Setup and Installation Guide  
**Technical Documentation**  
**Version:** 1.0  
**Date:** July 2025  
**Technology Stack:** Node.js, Express.js, MongoDB

---

## Executive Summary  
The Online Learning Platform is a comprehensive educational management system built with modern web technologies. This platform demonstrates advanced MongoDB usage patterns including document-oriented design, ACID transactions, role-based access control, and query optimization techniques. The system serves as both a functional learning platform and a showcase of database engineering best practices.

---

## Quick Start Guide  
### Minimum Viable Setup (5 Minutes)
```bash
# 1. Clone and enter directory
git clone <repository-url> && cd online-learning-platform

# 2. Install dependencies
cd backend && npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your MongoDB connection

# 4. Initialize database
npm run seed

# 5. Start development server
npm run dev

# 6. Access the platform
# Backend API: http://localhost:3761/api
# Login with: admin1@test.com / password123
```

---

## Framework-Specific Setup Instructions

### Node.js and Express.js Backend Setup
1. **Install Node.js:**
   - Using Node Version Manager (recommended):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
   nvm install 16
   nvm use 16
   ```
   - Or download from nodejs.org  
   - Verify installation:
   ```bash
   node --version
   npm --version
   ```

2. **Express.js Framework Configuration:**
```bash
cd backend
npm install
```

### Backend Structure (Updated)
```
backend/
├── analytics/
│   ├── controllers/
│   │   ├── instructorAnalytics.js
│   │   ├── platformOverview.js
│   │   ├── studentAnalytics.js
│   │   └── topCourses.js
│   └── services/
│       ├── instructorAnalyticsService.js
│       ├── platformOverviewService.js
│       ├── studentAnalyticsService.js
│       └── topCoursesService.js
├── auth/
│   ├── controllers/
│   │   └── authController.js
│   └── services/
│       └── authService.js
├── config/
│   └── database.js
├── controllers/
│   ├── CourseController.js
│   ├── EnrollmentController.js
│   ├── ExamController.js
│   ├── LessonController.js
│   └── UserController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Course.js
│   ├── Enrollment.js
│   ├── Exam.js
│   ├── Lesson.js
│   └── User.js
├── routes/
│   ├── analytics.js
│   ├── auth.js
│   ├── courses.js
│   ├── enrollments.js
│   ├── exams.js
│   ├── lessons.js
│   └── users.js
├── scripts/
│   ├── benchmarkQueries.js
│   ├── createIndexes.js
│   ├── seedDatabase.js
│   └── verifyAnalytics.js
├── services/
│   ├── CourseService.js
│   ├── EnrollmentService.js
│   ├── ExamService.js
│   ├── LessonService.js
│   ├── TransactionService.js
│   └── UserService.js
├── tests/
│   ├── integration/
│   ├── unit/
│   └── setup.js
├── utils/
└── server.js
```

MongoDB Database Setup
Option A: Local MongoDB Installation
Windows:
# Download MongoDB Community Server from mongodb.com
# Install and start service
net start MongoDB

# Verify installation
mongod --version

macOS:
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify installation
mongod --version

Linux (Ubuntu):
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

Option B: MongoDB Atlas (Cloud)
# 1. Create account at mongodb.com/atlas
# 2. Create new cluster (free tier available)
# 3. Create database user
# 4. Whitelist IP address (0.0.0.0/0 for development)
# 5. Get connection string:
# mongodb+srv://username:password@cluster.mongodb.net/online-learning-platform

Project Overview
Core Capabilities
The platform provides a complete learning management solution with multi-role user support, course management, enrollment tracking, and analytics capabilities. The system architecture emphasizes performance optimization and data consistency through strategic use of MongoDB's advanced features.
Key Features:
Multi-role user management system supporting Students, Instructors, and Administrators
Comprehensive course creation and management tools
Real-time enrollment and progress tracking
Advanced analytics dashboard with aggregation-based reporting
Security-first approach with JWT authentication and role-based access control
Performance-optimized queries with strategic indexing
Technical Architecture
The application follows a modern MVC + Services architecture pattern with clear separation between presentation, business logic, and data persistence layers. The backend implements RESTful API principles using Node.js and Express.js.
Backend Structure:
Controllers: Handle HTTP request processing and response formatting
Services: Contain business logic and coordinate database transactions
Models: Define MongoDB schemas and data validation rules
Middleware: Implements authentication, authorization, and request validation
Routes: Define API endpoints and their handlers
Tests: Comprehensive test suite ensures code quality and reliability
Database Design
Schema Architecture
The platform utilizes a document-oriented database design optimized for MongoDB's strengths. The schema consists of five primary collections designed to minimize data redundancy while maintaining query performance.
Core Collections:
Users Collection: Stores account information for all platform users
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (student|instructor|admin),
  isActive: Boolean,
  lastLogin: Date
}

Courses Collection: Contains comprehensive course information
{
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  category: String,
  level: String (Beginner|Intermediate|Advanced),
  price: Number,
  isActive: Boolean
}

Enrollments Collection: Tracks student course registrations and progress
{
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  enrollmentDate: Date,
  status: String (enrolled|in-progress|completed|dropped),
  completionPercentage: Number (0-100),
  finalGrade: Number (0-100),
  examsCompleted: [{
    exam: ObjectId (ref: Exam),
    score: Number
  }]
}

Lessons Collection: Stores individual lesson content
{
  title: String,
  course: ObjectId (ref: Course),
  order: Number,
  type: String (video|text|quiz|assignment),
  content: String,
  isPublished: Boolean
}

Exams Collection: Manages assessment data
{
  title: String,
  description: String,
  course: ObjectId (ref: Course),
  type: String (quiz|midterm|final|assignment),
  isActive: Boolean
}

Implementation Details
Authentication and Authorization
The platform implements a comprehensive security model based on JSON Web Tokens (JWT) for stateless authentication. User passwords undergo secure hashing using bcrypt with configurable salt rounds. Role-based access control ensures users can only access resources appropriate to their permission level.
Access Control Matrix:
Students: Can enroll in courses, track progress, and update their enrollment status
Instructors: Can create and manage their courses, view student progress, and manage course content
Administrators: Have full system access including user management and platform analytics
Transaction Management
Critical operations utilize MongoDB's ACID transaction capabilities to ensure data consistency. The system implements transaction boundaries around enrollment processes, progress updates, and course management operations.
Transaction Implementation: See services/TransactionService.js for complete transaction management.
Performance Optimization
The platform achieves performance improvements through strategic indexing and query optimization implemented in scripts/createIndexes.js.
Indexing Strategy:
// Essential indexes (from scripts/createIndexes.js)
users: { email: 1 (unique), role: 1, isActive: 1 }
courses: { instructor: 1, category: 1, level: 1, isActive: 1 }
enrollments: { student: 1, course: 1 (unique), status: 1 }
lessons: { course: 1, order: 1 }
exams: { course: 1 }

Testing and Quality Assurance
The platform maintains comprehensive test coverage through Jest-based testing:
# Available test commands
npm test                    # Run all tests
npm run test:integration    # Integration tests
npm run test:unit          # Unit tests
npm run test:coverage      # Coverage report

Installation Process
Prerequisites
Before beginning the installation process, ensure your system meets the following requirements:
Node.js: Version 14.0.0 or higher
MongoDB: Local installation (version 4.4+) or MongoDB Atlas account
npm: Version 6.0.0 or higher (included with Node.js)
Git: For repository cloning
Option 1: Automated Setup (Recommended)
# Clone the repository
git clone <repository-url>
cd online-learning-platform

# Install backend dependencies
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run seed

# Start development server
npm run dev

Option 2: Step-by-Step Manual Setup
Step 1: Backend Configuration
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Create environment configuration file
cp .env.example .env

Edit the .env file with your specific configuration:
NODE_ENV=development
PORT=3761
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters
JWT_EXPIRE=30d

Step 2: Database Setup
For local MongoDB installation:
# Test database connection
npm run test-db

# Initialize database with sample data
npm run seed

# Create performance indexes
node scripts/createIndexes.js

For MongoDB Atlas (cloud):
# Update MONGODB_URI in .env file with Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online-learning-platform

# Test Atlas connection
npm run test-atlas

# Initialize database with sample data
npm run seed

Step 3: Backend Service Startup
# Start development server with hot reload
npm run dev

# Or start production server
npm start

The backend API will be available at http://localhost:3761/api
Sample Data and Test Accounts
After running the seed script (npm run seed), the following test accounts are available:
Administrator Accounts:
Email: admin1@test.com to admin5@test.com
Password: password123
Role: Admin (full system access)
Instructor Accounts:
Email: instructor1@test.com to instructor5@test.com
Password: password123
Role: Instructor (course management)
Student Accounts:
Email: student1@test.com to student20@test.com
Password: password123
Role: Student (course enrollment)
Development Scripts and Commands
The platform includes several npm scripts to streamline development workflow:
Development Commands:
npm run dev              # Start backend with automatic restart on file changes
npm start                # Start production server
npm run seed             # Populate database with sample data

Testing Commands:
npm test                 # Run all tests with coverage report
npm run test:unit        # Run only unit tests
npm run test:integration # Run only integration tests
npm run test:coverage    # Generate detailed coverage report
npm run test:watch       # Run tests in watch mode

Database Management Commands:
npm run test-db          # Test local MongoDB connection
npm run test-atlas       # Test MongoDB Atlas connection
npm run config-db        # Interactive database configuration wizard

Utility Commands:
npm run validate-env     # Validate environment configuration
npm audit                # Check for security vulnerabilities
npm run test-legacy      # Run legacy transaction tests

API Documentation
Available API Endpoints
Authentication Endpoints:
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user profile
PUT  /api/auth/me          # Update user profile
PUT  /api/auth/change-password  # Change password

Course Management:
GET    /api/courses                     # List all courses (public)
POST   /api/courses                     # Create course (instructor only)
GET    /api/courses/:id                 # Get course details
PUT    /api/courses/:id                 # Update course (instructor only)
DELETE /api/courses/:id                 # Delete course (instructor only)
GET    /api/courses/:id/stats          # Get course statistics
POST   /api/courses/:id/enroll         # Enroll in course (student only)
GET    /api/courses/instructor/my-courses  # Get instructor's courses

Enrollment Management:
GET  /api/enrollments           # Get student enrollments
GET  /api/enrollments/stats     # Get student statistics
GET  /api/enrollments/:id       # Get enrollment details
PUT  /api/enrollments/:id/progress  # Update learning progress
POST /api/enrollments/:id/withdraw  # Withdraw from course

Analytics Endpoints:
GET /api/analytics/top-courses          # Top performing courses
GET /api/analytics/student-progress     # Student progress analytics
GET /api/analytics/instructor-analytics # Instructor analytics
GET /api/analytics/platform-overview    # Platform statistics
GET /api/analytics/filtered            # Filtered analytics

User Management (Admin only):
GET    /api/users           # List users
GET    /api/users/:id       # Get user details
PUT    /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user

Troubleshooting Common Setup Issues
Issue 1: MongoDB Connection Failures
# Verify MongoDB is running
# Windows: sc query MongoDB
# macOS/Linux: ps aux | grep mongod

# Test connection manually
npm run test-db

# Check connection string format
npm run validate-env

Issue 2: Port Already in Use
# Find process using port 3761
# Windows: netstat -ano | findstr 3761
# macOS/Linux: lsof -i :3761

# Kill process or change PORT in .env file
PORT=3762

Issue 3: JWT Authentication Errors
# Ensure JWT_SECRET is set and sufficiently complex (32+ characters)
JWT_SECRET=your-very-secure-secret-key-at-least-32-characters

# Verify token expiration format
JWT_EXPIRE=30d

Issue 4: Environment Configuration
# Validate all environment variables
npm run validate-env

# Use configuration wizard
npm run config-db

IDE and Development Environment Setup
Recommended IDE Extensions:
Visual Studio Code:
JavaScript ES6 code snippets
MongoDB for VS Code
REST Client
Jest extension for testing
Environment Configuration for Development:
// Create .vscode/settings.json for VS Code
{
  "javascript.preferences.quoteStyle": "single",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}

Performance Monitoring
Available Performance Tools:
# Benchmark database queries
node scripts/benchmarkQueries.js

# Verify analytics functionality
node scripts/verifyAnalytics.js

# Create database indexes for optimization
node scripts/createIndexes.js

Performance Metrics:
The platform includes comprehensive performance monitoring through the scripts/benchmarkQueries.js tool, which tests query performance across all major operations.
Security Considerations
Data Protection
Password hashing using bcryptjs with salt rounds
JWT token-based authentication
Input validation using express-validator
Role-based access control (RBAC)
Security Best Practices
Environment variable protection for sensitive data
CORS configuration for cross-origin requests
Request validation and sanitization
Secure HTTP headers implementation
Monitoring and Analytics
Business Analytics
The platform provides comprehensive analytics through the services/AnalyticsService.js:
Course enrollment and completion trend analysis
Student progress tracking and performance metrics
Instructor effectiveness and course quality indicators
Platform usage statistics and user engagement patterns
Available Analytics Endpoints:
Top performing courses analysis
Student progress analytics
Instructor performance metrics
Platform overview statistics
Future Development
Planned Enhancements
Real-time notifications using WebSockets
Advanced data visualization improvements
Mobile application development
Enhanced collaboration features
Scalability Considerations
The platform architecture supports horizontal scaling through:
Stateless application design
MongoDB sharding capabilities
Load balancing strategies
Caching implementation
Support and Maintenance
Diagnostic Tools
# Comprehensive environment validation
npm run validate-env

# Database connection testing
npm run test-db          # Local MongoDB
npm run test-atlas       # MongoDB Atlas

# Service verification
npm run test-legacy      # Legacy transaction tests

Maintenance Procedures
Regular security updates through npm audit
Database optimization using performance scripts
Test suite execution for regression prevention
Environment configuration validation
Document Control
This document serves as the comprehensive technical documentation for the Online Learning Platform. For technical support or additional information, please refer to the included troubleshooting guides and API documentation.
Version: 1.0
Last Updated: July 2025
Technology Stack: Node.js 16+, Express.js 4.x, MongoDB 5.0+

