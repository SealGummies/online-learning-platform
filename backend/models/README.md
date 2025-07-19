# Simplified Models

Streamlined Mongoose schemas optimized for student projects and learning purposes.

## Philosophy

These models remove enterprise-level complexity while maintaining core functionality for:

- User management and authentication
- Course creation and enrollment
- Progress tracking and assessments
- Basic analytics and reporting

## Files

- `User.js` - Minimal user authentication (no profile, no stats)
- `Course.js` - Essential course information (no stats, no redundant fields)
- `Enrollment.js` - Student-course relationships with exam tracking
- `Lesson.js` - Basic lesson content (unified content field)
- `Exam.js` - Minimal exam records (no questions, no complex settings)

## Key Simplifications

### ✂️ Removed Complexity

- **All statistics fields** (calculated via aggregation queries instead)
- **Payment processing** and financial transactions
- **User profiles** (bio, avatar, social links, preferences)
- **Advanced multimedia** features (multiple video qualities, subtitles)
- **Complex content structures** (unified into single content field)
- **Exam questions and answers** (simplified to exam records only)
- **Enterprise settings** (lockdown browser, proctoring, notifications)
- **Resource management** systems and file attachments
- **Advanced progress tracking** (detailed lesson/exam completion arrays)
- **Certificate systems** and achievement tracking

### ✅ Retained Features

- **Core CRUD operations** and basic Mongoose functionality
- **User roles and authentication** (student, instructor, admin)
- **Essential relationships** between entities with proper foreign keys
- **MongoDB indexing** for performance optimization
- **Basic progress tracking** (completion percentage, final grades)
- **Exam score recording** via Enrollment.examsCompleted
- **Data normalization** (no redundant statistics)

## Database Schema

```
User (student/instructor/admin)
├── firstName, lastName, email, password
├── role, isActive, lastLogin
└── timestamps (createdAt, updatedAt)

Course
├── title, description, instructor → User
├── category, level, price, isActive
└── timestamps

Enrollment (Many-to-Many: User ↔ Course)
├── student → User, course → Course
├── status, enrollmentDate, completionPercentage
├── finalGrade, examsCompleted[] → Exam
└── timestamps

Lesson (One-to-Many: Course → Lessons)
├── title, course → Course, order
├── type, content, isPublished
└── timestamps

Exam (One-to-Many: Course → Exams)
├── title, description, course → Course
├── type, isActive
└── timestamps
```

## Usage

```javascript
// Import simplified models
const User = require("./simplified/User");
const Course = require("./simplified/Course");
const Enrollment = require("./simplified/Enrollment");

// Use exactly like regular Mongoose models
const user = await User.findById(userId);
const courses = await Course.find({ instructor: instructorId });
```

## Statistics via Aggregation

Since we removed redundant statistics fields, calculate them using aggregation:

```javascript
// Get course enrollment count
const courseStats = await Course.aggregate([
  { $match: { _id: courseId } },
  {
    $lookup: {
      from: "enrollments",
      localField: "_id",
      foreignField: "course",
      as: "enrollments",
    },
  },
  {
    $addFields: {
      enrollmentCount: { $size: "$enrollments" },
      completionCount: {
        $size: {
          $filter: {
            input: "$enrollments",
            cond: { $eq: ["$$this.status", "completed"] },
          },
        },
      },
    },
  },
]);

// Get user's course progress
const userProgress = await User.aggregate([
  { $match: { _id: userId } },
  {
    $lookup: {
      from: "enrollments",
      localField: "_id",
      foreignField: "student",
      as: "enrollments",
    },
  },
  {
    $addFields: {
      coursesEnrolled: { $size: "$enrollments" },
      coursesCompleted: {
        $size: {
          $filter: {
            input: "$enrollments",
            cond: { $eq: ["$$this.status", "completed"] },
          },
        },
      },
    },
  },
]);
```

## Benefits for Learning

1. **Pure Database Focus**: No business logic complexity, focus on MongoDB concepts
2. **Normalized Data**: Avoids redundancy, demonstrates proper database design
3. **Aggregation Practice**: Statistics require aggregation queries for hands-on learning
4. **Clear Relationships**: Simple foreign key relationships (1:N, M:N)
5. **Index Optimization**: Essential indexes only, easier to understand performance impact
6. **Minimal Fields**: Easier to create test data and understand schema structure

## Schema Validation

All models include:

- ✅ **Required field validation**
- ✅ **Enum constraints** for categorical data
- ✅ **Unique indexes** where appropriate
- ✅ **Foreign key references** with proper ObjectId types
- ✅ **Essential indexes** for query performance
- ✅ **Timestamps** for audit trails
