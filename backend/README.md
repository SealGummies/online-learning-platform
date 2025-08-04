# Backend API

REST API for the Online Learning Platform built with Node.js, Express, and MongoDB using **MVC Architecture**.

## Available Scripts

```bash
# Development
npm run dev              # Start development server with auto-reload
npm start               # Start production server

# Testing
npm test                # Run Jest test suite
npm run test:coverage   # Generate coverage report
npm run test:integration # Run integration tests
npm run test:unit       # Run unit tests

# Database
npm run seed            # Populate with sample data
npm run config-db       # Database configuration wizard
```

##  Sample Data

After running `npm run seed`, you can login with:

- **Admin**: `admin1@example.com` / `password123`
- **Instructor**: `instructor1@example.com` / `password123`
- **Student**: `student1@example.com` / `password123`.

##  Project Structure

```
backend/
├── config/              # Database and environment configuration
├── controllers/         # HTTP request handlers (MVC Controllers)
├── middleware/          # Authentication and validation middleware
├── models/              # MongoDB schemas (MVC Models)
├── routes/              # API route definitions
├── scripts/             # Database utilities and seeding
├── services/            # Business logic and transactions
├── tests/               # Jest test suite
├── utils/               # Utility functions and error handling
└── server.js            # Main application entry point
```

##  Key Features

- ** JWT Authentication** with role-based access control
- ** MongoDB Integration** with ACID transactions
- ** RESTful API** with comprehensive CRUD operations
- ** 5 Collections**: Users, Courses, Enrollments, Lessons, Exams
- ** 3 User Roles**: Student, Instructor, Admin
- ** Jest Testing** with comprehensive coverage

## Quick Start

### 1. Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### 2. Installation

```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

### 3. Database Setup

```bash
# Configure database connection
npm run config-db

# Seed sample data
npm run seed
```

### 4. Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Environment Configuration

Required variables in `.env`:

```env
NODE_ENV=development
PORT=3761
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d
```

## API Endpoints

### Authentication

```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user profile
PUT  /api/auth/me          # Update profile
PUT  /api/auth/change-password # Change password
```

### Courses

```
GET    /api/courses        # List courses
POST   /api/courses        # Create course (instructor)
GET    /api/courses/:id    # Get course details
PUT    /api/courses/:id    # Update course (instructor)
DELETE /api/courses/:id    # Delete course (instructor)
POST   /api/courses/:id/enroll # Enroll in course (student)
```

### Enrollments

```
GET  /api/enrollments      # Get student enrollments
PUT  /api/enrollments/:id/progress # Update progress
POST /api/enrollments/:id/withdraw # Withdraw from course
```

### Users (Admin)

```
GET    /api/users          # List all users
POST   /api/users          # Create user
GET    /api/users/:id      # Get user details
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
```

## � Documentation

For detailed information, see the individual README files:

- [`/config/README.md`](./config/README.md) - Database configuration
- [`/controllers/README.md`](./controllers/README.md) - Controller documentation
- [`/models/README.md`](./models/README.md) - Database schemas
- [`/routes/README.md`](./routes/README.md) - API routes
- [`/services/README.md`](./services/README.md) - Business logic
- [`/tests/README.md`](./tests/README.md) - Testing guide
- [`/utils/README.md`](./utils/README.md) - Utility functions
