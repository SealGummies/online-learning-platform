# Online Learning Platform

A comprehensive online learning platform demonstrating advanced MongoDB usage with document-oriented design, CRUD operations, ACID transactions, role-based access control, advanced aggregation, and query optimization. Built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **📚 Course Management**: Create, update, and manage courses with lessons and exams
- **👥 User Management**: Multi-role system (Student, Instructor, Admin)
- **🎓 Enrollment System**: Student enrollment with progress tracking
- **📊 Analytics Dashboard**: Advanced MongoDB aggregation queries
- **🔒 Security**: JWT authentication with role-based access control
- **⚡ Performance**: Optimized queries with strategic indexing

### Technical Highlights
- **🗄️ MongoDB Integration**: Document-oriented design with 5+ collections
- **🔄 ACID Transactions**: Data consistency for critical operations
- **📈 Query Optimization**: 22.4% average performance improvement with indexing
- **🧪 Comprehensive Testing**: 85%+ test coverage with Jest
- **🏗️ MVC Architecture**: Clean separation of concerns

## 📊 Project Status

| Milestone | Description | Status |
|-----------|-------------|--------|
| 1 | MongoDB Schema Design & Data Population | ✅ Completed |
| 2 | CRUD Operations & API Development | ✅ Completed |
| 3 | ACID Transactions in MongoDB | ✅ Completed |
| 4 | Role-Based Access Control (RBAC) & Security | ✅ Completed |
| 5 | Advanced MongoDB Queries & Aggregation | ✅ Completed |
| 6 | Query Optimization & Indexing Strategy | ✅ Completed |
| 7 | Data Replication & Sharding | ⏳ Planned |
| 8 | Interactive Dashboard & Data Visualization | ⏳ Planned |
| 9 | In-class Demo & Presentation | ⏳ Planned |

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
backend/
├── controllers/          # HTTP request handlers
├── services/            # Business logic & ACID transactions
├── routes/              # API route definitions
├── models/              # MongoDB schemas (5 collections)
├── middleware/          # Authentication & validation
├── tests/               # Jest test suite (85%+ coverage)
├── scripts/             # Database seeding & benchmarking
└── utils/               # Development tools
```

### Frontend (HTML/CSS/JavaScript)
```
frontend/
├── pages/               # Main application pages
├── components/          # Reusable UI components
├── js/                  # Frontend logic
├── css/                 # Styling
└── assets/              # Static resources
```

## 🗄️ Database Schema

### Collections
- **Users**: Student, Instructor, Admin accounts
- **Courses**: Course information and settings
- **Enrollments**: Student enrollments and progress tracking
- **Lessons**: Course content structure
- **Exams**: Assessments and submissions

### Key Features
- Document-oriented design with nested JSON data
- ObjectId references for relationships
- Strategic indexing for query optimization
- ACID transactions for data consistency

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Option 1: Automated Setup
```bash
git clone <repository-url>
cd online-learning-platform-1
./setup.sh
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection

# Initialize database
npm run seed

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend
# Start local server
python3 -m http.server 8000
```

### Access URLs
- **Backend API**: `http://localhost:3761/api`
- **Frontend**: `http://localhost:8000`

## 🔐 Authentication

### Sample Users (after seeding)
- **Admin**: `admin@example.com` / `password123`
- **Instructor**: `john.smith@example.com` / `password123`
- **Student**: `alice.johnson@example.com` / `password123`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user profile
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
GET    /api/enrollments      # Get student enrollments
PUT    /api/enrollments/:id/progress # Update progress
POST   /api/enrollments/:id/withdraw # Withdraw from course
```

### Analytics
```
GET    /api/analytics/courses/top-performing
GET    /api/analytics/students/progress
GET    /api/analytics/instructors/dashboard
```

## ⚡ Performance Features

### Query Optimization
- **22.4% average performance improvement** with strategic indexing
- **49% improvement** on analytics queries
- **Indexed fields**: email, role, category, instructor, isActive
- **Text search indexes** for course and user search

### ACID Transactions
- Enrollment operations with rollback on failure
- Progress updates with data consistency
- Exam submissions with atomic operations

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run unit tests
npm run test:unit
```

**Test Coverage**: 85%+ on core services

## 📊 Analytics & Reporting

### Advanced MongoDB Aggregation Queries
- Top performing courses by enrollment and completion rates
- Student progress analytics with time-based tracking
- Instructor performance metrics
- Course completion trends and patterns
- Revenue analytics and financial reporting

### Sample Analytics Queries
```javascript
// Top performing courses
db.courses.aggregate([
  { $lookup: { from: "enrollments", localField: "_id", foreignField: "course" } },
  { $group: { _id: "$_id", enrollmentCount: { $sum: 1 } } },
  { $sort: { enrollmentCount: -1 } }
])
```

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev                 # Start with auto-reload
npm start                   # Production server

# Database
npm run seed               # Populate with sample data
npm run test-db            # Test database connection

# Testing
npm test                   # Run test suite
npm run test:coverage      # Generate coverage report

# Utilities
npm run validate-env       # Validate configuration
npm run config-db          # Database configuration
```

### Environment Variables
```env
NODE_ENV=development
PORT=3761
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d
```

## 📁 Project Structure

```
online-learning-platform-1/
├── backend/                    # Node.js API Server
│   ├── controllers/           # HTTP request handlers
│   ├── services/              # Business logic & transactions
│   ├── routes/                # API endpoints
│   ├── models/                # MongoDB schemas
│   ├── middleware/            # Auth & validation
│   ├── tests/                 # Jest test suite
│   ├── scripts/               # Database utilities
│   └── utils/                 # Development tools
├── frontend/                   # Web Interface
│   ├── pages/                 # Application pages
│   ├── components/            # Reusable components
│   ├── js/                    # Frontend logic
│   └── css/                   # Styling
├── performance_comparison_table.md # Query optimization report
└── setup.sh                    # Automated setup script
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Student, Instructor, Admin roles
- **Input Validation**: Express-validator for request validation
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configurable cross-origin resource sharing

## 🚀 Performance Highlights

### Query Optimization Results
| Query Type | Performance Improvement |
|------------|----------------------|
| Analytics Queries | 49.0% |
| Instructor Dashboard | 36.3% |
| Text Search | 33.8% |
| Course Search | 24.3% |
| **Average Improvement** | **22.4%** |

### Indexing Strategy
- **Essential Indexes**: email, role, category, instructor, isActive
- **Text Indexes**: Course and user search functionality
- **Compound Indexes**: Multi-field query optimization
- **Performance Monitoring**: Regular query analysis

## 📚 Documentation

- [`backend/README.md`](backend/README.md) - Backend API documentation
- [`frontend/README.md`](frontend/README.md) - Frontend setup guide
- [`performance_comparison_table.md`](performance_comparison_table.md) - Query optimization report
- [`Milestone 1 Documentation.pdf`](Milestone%201%20Documentation.pdf) - Milestone 1 details
- [`Milestone 2 Documentation.pdf`](Milestone%202%20Documentation.pdf) - Milestone 2 details

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   npm run test-db          # Test local MongoDB
   npm run test-atlas       # Test Atlas connection
   npm run validate-env     # Validate environment
   ```

2. **Port Conflicts**
   - Change `PORT` in `.env` file
   - Ensure no other services using port 3761

3. **JWT Errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration settings

### Development Tips
- Use `npm run dev` for auto-reload during development
- Run `npm test` before commits
- Check test coverage with `npm run test:coverage`
- Use `npm run seed` to reset database with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:
1. Check existing documentation
2. Review test files for usage examples
3. Check environment configuration
4. Run validation scripts

---

**Built with ❤️ using Node.js, Express, and MongoDB**
