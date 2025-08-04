# Online Learning Platform

A comprehensive online learning platform built with Node.js, Express, and MongoDB, demonstrating advanced database operations, ACID transactions, role-based access control, and query optimization.

## Features

- Course management with lessons and exams
- Multi-role user system (Student, Instructor, Admin)
- Student enrollment with progress tracking
- Analytics dashboard with MongoDB aggregation
- JWT authentication and role-based access control
- Query optimization with strategic indexing
- ACID transactions for data consistency
- Comprehensive test coverage with Jest

## Project Structure

```
online-learning-platform/
├── backend/              # Node.js + Express + MongoDB backend
│   ├── config/          # Database and environment configuration
│   ├── controllers/     # Request handlers and business logic
│   ├── middleware/      # Authentication and validation middleware
│   ├── models/          # Mongoose data models
│   ├── routes/          # API route definitions
│   ├── scripts/         # Database management scripts
│   ├── services/        # Business logic services
│   ├── tests/           # Unit and integration tests
│   ├── utils/           # Utility functions and error handlers
│   └── server.js        # Main application entry point
├── frontend/            # Static web frontend
│   ├── assets/          # Images, icons, and static resources
│   ├── components/      # Reusable HTML components
│   ├── css/             # Stylesheets
│   ├── js/              # Frontend JavaScript logic
│   ├── pages/           # Application pages
│   └── index.html       # Main application page
├── documents/           # Project documentation and reports
└── setup.sh             # Automated setup script
```

## Database Design

### Collections

- **Users**: Student, Instructor, and Admin accounts
- **Courses**: Course information and settings
- **Enrollments**: Student enrollment and progress tracking
- **Lessons**: Course content structure
- **Exams**: Assessments and submissions

### Key Features

- Document-oriented design with nested JSON
- ObjectId references for relationships
- Strategic indexing for performance optimization
- ACID transactions for data consistency

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or Atlas cloud)
- npm package manager

### Quick Setup

```bash
git clone <repository-url>
cd online-learning-platform
./setup.sh
```

### Manual Setup

```bash
# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Initialize database with sample data
npm run seed

# Start development server
npm start
```

### Development URLs

- Backend API: http://localhost:3761/api
- Frontend: Open `frontend/index.html` in browser

## Default User Accounts

After running the database seeding script, you can log in with these sample accounts:

- **Admin**: admin@example.com / password123
- **Instructor**: john.smith@example.com / password123
- **Student**: alice.johnson@example.com / password123

## API Reference

### Authentication Endpoints

```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user profile
```

### Course Management

```
GET    /api/courses          # List all courses
POST   /api/courses          # Create course (instructor only)
GET    /api/courses/:id      # Get course details
PUT    /api/courses/:id      # Update course
DELETE /api/courses/:id      # Delete course
POST   /api/courses/:id/enroll # Enroll in course
```

### Enrollment Management

```
GET  /api/enrollments                    # Get student enrollments
PUT  /api/enrollments/:id/progress       # Update progress
POST /api/enrollments/:id/withdraw       # Withdraw from course
```

### Analytics

```
GET /api/analytics/courses/top-performing
GET /api/analytics/students/progress
GET /api/analytics/instructors/dashboard
```

## Performance Optimization

### Query Performance Results

Strategic indexing has improved query performance significantly:

| Query Type              | Performance Improvement |
| ----------------------- | ----------------------- |
| Analytics Queries       | 49.0%                   |
| Instructor Dashboard    | 36.3%                   |
| Text Search             | 33.8%                   |
| Course Search           | 24.3%                   |
| **Average Improvement** | **22.4%**               |

### Indexing Strategy

- Essential indexes on email, role, category, instructor, isActive fields
- Text search indexes for course and user search functionality
- Compound indexes for multi-field query optimization
- Regular query performance monitoring

### ACID Transactions

- Enrollment operations with automatic rollback on failure
- Progress updates with data consistency guarantees
- Exam submissions with atomic operations

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run unit tests only
npm run test:unit
```

Test coverage: 85%+ on core services and business logic.

## Analytics Features

The platform includes advanced MongoDB aggregation queries for comprehensive analytics:

- Top performing courses by enrollment and completion rates
- Student progress tracking with time-based analytics
- Instructor performance metrics and course statistics
- Course completion trends and learning patterns
- Revenue analytics and financial reporting

### Sample Analytics Query

```javascript
// Top performing courses by enrollment count
db.courses.aggregate([
  {
    $lookup: {
      from: "enrollments",
      localField: "_id",
      foreignField: "course",
    },
  },
  {
    $group: {
      _id: "$_id",
      enrollmentCount: { $sum: 1 },
    },
  },
  { $sort: { enrollmentCount: -1 } },
]);
```

## Security

- JWT token-based authentication
- Role-based access control (Student, Instructor, Admin)
- Input validation with Express-validator
- Secure password hashing with bcryptjs
- CORS protection for cross-origin requests

## Documentation

- [Backend API Documentation](backend/README.md)
- [Frontend Setup Guide](frontend/README.md)
- [Query Optimization Report](performance_comparison_table.md)
- [Milestone 1 Documentation](documents/Milestone%201%20Documentation.pdf)
- [Milestone 2 Documentation](documents/Milestone%202%20Documentation.pdf)
- [Milestone 3 Documentation](documents/Milestone%203%20Documentation.pdf)
