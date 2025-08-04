# Models Directory

This directory contains Mongoose schemas and models that define the structure of our MongoDB collections.

## Overview

The models layer is responsible for:
- Defining document schemas with validation rules
- Setting up indexes for query optimization
- Defining relationships between collections
- Providing data-level validation

## Models

### User.js
- **Purpose**: Defines user accounts for the platform
- **Roles**: student, instructor, admin
- **Key Fields**: firstName, lastName, email, password, role, isActive
- **Indexes**: email (unique), role

### Course.js
- **Purpose**: Defines courses offered on the platform
- **Key Fields**: title, description, instructor, category, level, price, isActive
- **Indexes**: instructor, category, level, isActive
- **Relationships**: References User (instructor)

### Enrollment.js
- **Purpose**: Tracks student enrollments in courses
- **Key Fields**: student, course, enrollmentDate, status, completionPercentage, finalGrade
- **Indexes**: {student, course} (compound unique), student, course, status
- **Relationships**: References User (student) and Course

### Lesson.js
- **Purpose**: Defines individual lessons within courses
- **Key Fields**: title, description, course, type, order, content, duration, isPublished
- **Indexes**: course, order, isPublished
- **Relationships**: References Course

### Exam.js
- **Purpose**: Defines exams and assessments for courses
- **Key Fields**: title, description, course, type, questions, totalPoints, duration
- **Indexes**: course, type, isPublished
- **Relationships**: References Course

## Schema Design Principles

1. **Validation**: All models include comprehensive validation rules
2. **Timestamps**: All models use Mongoose timestamps (createdAt, updatedAt)
3. **Indexes**: Strategic indexing for common query patterns
4. **Lean Documents**: Using .lean() for read-only operations to improve performance

## Best Practices

1. **Never expose passwords**: Always exclude password field in queries
2. **Use appropriate types**: ObjectId for references, proper data types for fields
3. **Set required fields**: Mark essential fields as required
4. **Add default values**: Provide sensible defaults where appropriate
5. **Index frequently queried fields**: But avoid over-indexing

## Example Usage

```javascript
const User = require('./User');

// Create a new user
const user = new User({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: hashedPassword,
  role: 'student'
});

await user.save();

// Query with index
const instructors = await User.find({ role: 'instructor' }).select('-password');
```

## Relationships

```
Users (1) -----> (N) Courses (as instructor)
Users (1) -----> (N) Enrollments (as student)
Courses (1) -----> (N) Enrollments
Courses (1) -----> (N) Lessons
Courses (1) -----> (N) Exams
```