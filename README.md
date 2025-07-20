# Online Learning Platform

CS 5200 Practicum 2 - Advanced NoSQL Data Management with MongoDB

## Project Overview

A comprehensive online learning platform demonstrating advanced MongoDB usage with document-oriented design, CRUD operations, ACID transactions, role-based access control, advanced aggregation, and query optimization. Built with Node.js, Express, and MongoDB.

## Milestone Progress

| Task | Description                                  | Status                |
| ---- | -------------------------------------------- | --------------------- |
| 1    | MongoDB Schema Design & Data Population      | ✅ Completed (Week 1) |
| 2    | CRUD Operations & API Development            | ✅ Completed (Week 1) |
| 3    | ACID Transactions in MongoDB                 | ✅ Completed (Week 2) |
| 4    | Role-Based Access Control (RBAC) & Security  | ✅ Completed (Week 2) |
| 5    | Advanced MongoDB Queries & Aggregation       | ✅ Completed (Week 2) |
| 6    | Query Optimization & Indexing Strategy       | ✅ Completed (Week 2) |
| 7    | Data Replication & Sharding (Optional Bonus) | ⏳ Planned (Future)   |
| 8    | Interactive Dashboard & Data Visualization   | ⏳ Planned (Future)   |
| 9    | In-class Demo & Presentation                 | ⏳ Planned (Future)   |

---

## Features Implemented & Planned

### 1️⃣ MongoDB Schema Design and Data Population (10 pts)

- Document-based schema for the learning platform
- 5+ distinct collections: Users, Courses, Enrollments, Lessons, Exams
- At least 20 sample documents per collection (see `backend/scripts/seedDatabase.js`)
- Nested JSON data where applicable (e.g., progress, examsCompleted)
- Clear relationships via ObjectId references

### 2️⃣ CRUD Operations & API Development (20 pts)

- RESTful API using Node.js + Express
- Full CRUD for all 5 main collections
- Secure authentication with JWT (see `backend/middleware/auth.js`)
- Input validation and error handling

### 3️⃣ ACID Transactions in MongoDB (20 pts)

- MongoDB ACID transactions for critical operations (enrollment, progress, exam submission)
- Rollback mechanisms for failure handling (see `backend/services/TransactionService.js`)
- (Optional) Performance comparison with MySQL in `performance_comparison_table.md`

### 4️⃣ Role-Based Access Control (RBAC) & Security (20 pts)

- User roles: Student, Instructor, Admin
- Access restrictions enforced at API and DB level
- Unauthorized access prevented using middleware and MongoDB security features

### 5️⃣ Advanced MongoDB Queries & Aggregation (20 pts)

- 5+ complex aggregation queries using $lookup, $group, $sort, $unwind, etc. (see `backend/services/AnalyticsService.js`)
- Example queries: Top performing courses, average grades per course, student progress analytics, instructor analytics, course completion trends
- Each query is documented with purpose, implementation, and sample results

### 6️⃣ Query Optimization & Indexing Strategy (10 pts)

- Benchmarked queries before/after indexing (see `backend/scripts/benchmarkQueries.js`)
- Indexed key fields (see `backend/scripts/createIndexes.js` and models)
- Used Explain Plans to analyze query execution
- Documented performance improvements and indexing strategies in `performance_comparison_table.md`

### 7️⃣ Data Replication & Sharding (Optional Bonus, 5 pts)

- Planned: Set up MongoDB replication (primary-secondary nodes)
- (Optional) Introduce sharding to split data across multiple instances
- Deliverable: Document explaining replication setup & benefits

### 8️⃣ Interactive Dashboard & Data Visualization (30 pts)

- Planned: Build a dashboard/UI to display key metrics
- Use charts/tables for insights (e.g., sales trends, student performance)
- Implement real-time updates (optional bonus)

### 9️⃣ In-class Demo & Presentation (20 pts + Optional Bonus, 2 pts)

- Planned: Live demonstration of the system
- Showcase: MongoDB schema, transactions, role-based access, indexing
- API endpoints and CRUD operations
- Queries, results, and insights
- Dashboard visualizations
- Bonus features (if any)
- Prepare for in-class questions

---

## Project Structure

```
online-learning-platform/
├── backend/                    # Node.js API Server (MVC Architecture)
│   ├── config/                # Database config
│   ├── controllers/           # HTTP request handlers
│   ├── middleware/            # Auth & validation
│   ├── models/                # MongoDB schemas (5 collections)
│   ├── routes/                # API endpoints
│   ├── scripts/               # DB seeding, benchmarking, index mgmt, analytics verify
│   ├── services/              # Business logic, ACID, analytics
│   ├── tests/                 # Jest test suite
│   ├── utils/                 # Dev tools, env validation, db config
│   └── server.js              # Main server file
├── frontend/                   # Web Interface (HTML/CSS/JS)
│   ├── assets/                # Icons, images
│   ├── components/            # Common HTML components
│   ├── css/                   # Styles
│   ├── js/                    # Auth, dashboard, components
│   ├── pages/                 # index, register, dashboard
│   └── README.md              # Frontend usage guide
├── logs/                       # Log files
├── performance_comparison_table.md # Query performance & optimization report
├── setup.sh                    # Project setup script
├── README.md                   # This file
```

---

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
2. **Frontend**: Open `frontend/index.html` in your browser (or use backend static server)
3. **Access Application**:
   - Backend API: `http://localhost:3761/api`
   - Frontend Interface: `http://localhost:3761`

## Documentation

- [`backend/README.md`](backend/README.md) - Backend API and deployment
- [`frontend/README.md`](frontend/README.md) - Frontend setup and usage
- [`performance_comparison_table.md`](performance_comparison_table.md) - Query optimization & indexing
- [`Milestone 1 Documentation.pdf`](Milestone 1 Documentation.pdf)
- [`Milestone 2 Documentation.pdf`](Milestone 2 Documentation.pdf)

---

For detailed task breakdowns, aggregation query examples, and indexing optimization reports, please refer to the corresponding documents and source code comments.
