# Backend API

REST API for the Online Learning Platform built with Node.js, Express, and MongoDB using **MVC Architecture**.

## 🏗️ Architecture

This project follows a **Model-View-Controller (MVC) + Services** pattern:

```
backend/
├── controllers/          # 🎮 HTTP request handlers
├── services/            # 🔧 Business logic & transactions
├── routes/              # 🛣️ API route definitions
├── models/              # 📊 Database schemas
├── middleware/          # 🔒 Authentication & validation
├── tests/               # 🧪 Jest test suite
├── utils/               # 🛠️ Utility functions
└── legacy/              # 📦 Pre-refactor files (archived)
```

## ✨ Features

- **🔒 JWT Authentication** with role-based access control (RBAC)
- **🗄️ MongoDB Integration** with ACID transactions
- **🌐 RESTful API** with comprehensive CRUD operations
- **📊 5 Collections**: Users, Courses, Enrollments, Lessons, Exams
- **👥 3 User Roles**: Student, Instructor, Admin
- **⚡ ACID Transactions** for data consistency
- **🧪 Jest Testing** with 85%+ coverage
- **🏗️ MVC Architecture** for maintainability

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
```

### 3. Choose Database Option

#### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster and get connection string
3. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=AppName
   ```
4. Test connection:
   ```bash
   npm run test-atlas
   ```

#### Option B: Local MongoDB

1. Install and start MongoDB locally
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/online-learning-platform
   ```
3. Test connection:
   ```bash
   npm run test-db
   ```

### 4. Initialize Database

```bash
# Populate with sample data
npm run seed
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run legacy transaction tests
npm run test-transactions
```

### 6. Start Development Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🧪 Testing

The project includes comprehensive Jest-based testing:

```bash
# Available test commands
npm test                    # Run all Jest tests
npm run test:integration    # Integration tests
npm run test:unit          # Unit tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test-transactions  # Legacy transaction tests
```

**Current Test Coverage**: 85%+ on core transaction services

## 🏗️ MVC Architecture Details

### Controllers (`controllers/`)

Handle HTTP requests and responses:

- `CourseController.js` - Course management endpoints
- `EnrollmentController.js` - Student enrollment operations

### Services (`services/`)

Business logic and data operations:

- `TransactionService.js` - ACID transaction management
- `CourseService.js` - Course business logic
- `EnrollmentService.js` - Enrollment business logic

### Routes (`routes/`)

API endpoint definitions:

- `courses.js` - Course-related routes
- `enrollments.js` - Enrollment-related routes
- `auth.js` - Authentication routes
- `users.js` - User management routes

### Models (`models/`)

Database schemas and validation:

- `User.js` - User accounts and roles
- `Course.js` - Course information and settings
- `Enrollment.js` - Student enrollments and progress
- `Lesson.js` - Course content structure
- `Exam.js` - Assessments and submissions

## 🚀 API Usage Examples

### Authentication

```bash
# Register new user
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Course Management

```bash
# Get all courses
GET /api/courses

# Enroll in course (requires authentication)
POST /api/courses/:id/enroll
Authorization: Bearer <token>

# Update progress (requires authentication)
PUT /api/enrollments/:id/progress
Authorization: Bearer <token>
{
  "lessonId": "lesson_id",
  "completed": true,
  "timeSpent": 1800,
  "score": 95
}
```

## 🔧 Environment Variables

Required variables in `.env`:

```env
NODE_ENV=development
PORT=3761
MONGODB_URI=your-database-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=30d
```

## 📊 Available Scripts

```bash
# Development
npm run dev                 # Start development server with auto-reload
npm start                   # Start production server

# Testing
npm test                    # Run Jest test suite
npm run test:integration    # Run integration tests
npm run test:coverage       # Generate coverage report
npm run test-transactions   # Run legacy transaction tests

# Database
npm run seed               # Populate with sample data
npm run test-db            # Test local MongoDB connection
npm run test-atlas         # Test MongoDB Atlas connection

# Utilities
npm run validate-env       # Validate environment configuration
npm run config-db          # Database configuration wizard
```

## 🌐 API Endpoints

### 🔐 Authentication Routes

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user profile
```

### 📚 Course Management

```
GET    /api/courses          # List all courses (public)
POST   /api/courses          # Create course (instructor only)
GET    /api/courses/:id      # Get course details
PUT    /api/courses/:id      # Update course (instructor only)
DELETE /api/courses/:id      # Delete course (instructor only)
GET    /api/courses/:id/stats # Get course statistics
POST   /api/courses/:id/enroll # Enroll in course (student only)
```

### 📝 Enrollment Management

```
GET    /api/enrollments      # Get student enrollments
GET    /api/enrollments/:id  # Get enrollment details
PUT    /api/enrollments/:id/progress # Update learning progress
PUT    /api/enrollments/:id/review   # Submit course review
POST   /api/enrollments/:id/withdraw # Withdraw from course
GET    /api/enrollments/stats        # Get student statistics
```

### 👥 User Management

```
GET    /api/users           # List users (admin only)
GET    /api/users/:id       # Get user details (admin only)
PUT    /api/users/:id       # Update user (admin only)
DELETE /api/users/:id       # Delete user (admin only)
```

## 📁 Project Structure

```
backend/
├── controllers/         # 🎮 HTTP request handlers
│   ├── CourseController.js
│   └── EnrollmentController.js
├── services/           # 🔧 Business logic & transactions
│   ├── TransactionService.js
│   ├── CourseService.js
│   └── EnrollmentService.js
├── routes/             # 🛣️ API route definitions
│   ├── courses.js
│   ├── enrollments.js
│   ├── auth.js
│   ├── users.js
│   ├── lessons.js
│   └── exams.js
├── models/             # 📊 Database schemas
│   ├── User.js
│   ├── Course.js
│   ├── Enrollment.js
│   ├── Lesson.js
│   └── Exam.js
├── middleware/         # 🔒 Authentication & validation
│   └── auth.js
├── tests/              # 🧪 Test suite
│   ├── integration/
│   ├── unit/
│   └── setup.js
├── utils/              # 🛠️ Utility functions
├── legacy/             # 📦 Archived pre-refactor files
├── config/             # ⚙️ Database configuration
└── scripts/            # 🛠️ Database seeding scripts
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Student, Instructor, Admin roles
- **Input Validation**: Express-validator for request validation
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configurable cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## ⚡ Performance Features

- **ACID Transactions**: Data consistency and integrity
- **Connection Pooling**: Efficient database connection management
- **Validation Middleware**: Early request validation
- **Error Handling**: Comprehensive error management
- **Logging**: Structured application logging

## 📚 Documentation

- [`MVC_ARCHITECTURE.md`](./MVC_ARCHITECTURE.md) - Detailed architecture documentation
- [`MVC_REFACTOR_SUMMARY.md`](./MVC_REFACTOR_SUMMARY.md) - Refactoring summary and benefits
- [`TASK3_ACID_TRANSACTIONS.md`](../TASK3_ACID_TRANSACTIONS.md) - ACID transaction implementation
- [`legacy/README.md`](./legacy/README.md) - Legacy files documentation

## 🚀 Development Workflow

1. **Setup**: Follow Quick Start guide
2. **Development**: Use `npm run dev` for auto-reload
3. **Testing**: Run `npm test` before commits
4. **Database**: Use `npm run seed` for test data
5. **Validation**: Run `npm run validate-env` for config check

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Test local MongoDB
npm run test-db

# Test Atlas connection
npm run test-atlas

# Validate environment
npm run validate-env
```

### Test Failures

```bash
# Run specific test types
npm run test:integration
npm run test:unit

# Check coverage
npm run test:coverage
```

### Legacy Migration

Check `legacy/` folder for pre-refactor implementations and comparison.

## 📞 Support

For issues and questions:

1. Check existing documentation in `/docs` folder
2. Review test files for usage examples
3. Examine legacy implementations for reference
4. Check environment configuration

---

## 📊 Project Status

✅ **Completed Features**:

- MVC Architecture Implementation
- ACID Transaction Management
- JWT Authentication & RBAC
- Comprehensive Test Suite (85%+ coverage)
- API Documentation

🔄 **In Progress**:

- Advanced Query Implementation (Task 5)
- Query Optimization & Indexing (Task 6)
- Extended Test Coverage

🎯 **Future Enhancements**:

- Real-time notifications
- File upload management
- Advanced analytics
- Performance monitoring
  ├── routes/ # API endpoints
  ├── scripts/ # Database seeding
  ├── utils/ # Development tools
  └── server.js # Main server file

```

## Sample Users

After running `npm run seed`, you can login with:

- **Admin**: `admin@example.com` / `password123`
- **Instructor**: `john.smith@example.com` / `password123`
- **Student**: `alice.johnson@example.com` / `password123`

## Troubleshooting

### Database Connection Issues

1. **Local MongoDB**: Ensure MongoDB is running (`mongod`)
2. **MongoDB Atlas**: Check connection string and IP whitelist
3. **Validation**: Run `npm run validate-env`

### Common Problems

- **Port in use**: Change `PORT` in `.env`
- **JWT errors**: Ensure `JWT_SECRET` is set
- **Connection timeout**: Check network and credentials

For detailed configuration help, see project documentation.
```
