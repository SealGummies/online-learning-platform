# Services

Business logic layer implementing core application functionality with ACID transaction support.

## Overview

Services contain the business logic and data operations of the application. They handle complex operations, enforce business rules, manage transactions, and coordinate between multiple models. This layer is the **heart of the application** where all critical business decisions are made.

## Files

- `TransactionService.js` - ACID transaction management and utilities
- `CourseService.js` - Course business logic and operations
- `EnrollmentService.js` - Enrollment and progress business logic
- `index.js` - Service exports for easy importing

## Architecture Pattern

### Service Structure

```javascript
const TransactionService = require("./TransactionService");
const Model = require("../models/Model");

class BusinessService {
  static async businessOperation(data, options) {
    // Business logic with transaction safety
    return TransactionService.executeWithTransaction(async (session) => {
      // 1. Validate business rules
      await this.validateBusinessRules(data);

      // 2. Perform atomic operations
      const result = await Model.create(data, { session });

      // 3. Update related models
      await RelatedModel.updateMany({}, updates, { session });

      // 4. Return structured result
      return {
        data: result,
        message: "Operation completed successfully",
      };
    });
  }
}
```

### Key Responsibilities

1. **🧠 Business Logic**: Implement core application rules
2. **🔒 Transaction Management**: Ensure data consistency with ACID properties
3. **✅ Validation**: Enforce business constraints and rules
4. **🔄 Coordination**: Manage operations across multiple models
5. **📊 Aggregation**: Complex data queries and calculations
6. **🚨 Error Handling**: Business-level error management

## Service Details

### ⚡ TransactionService (`TransactionService.js`)

Core transaction management for ACID compliance:

```javascript
// Primary transaction methods
static async executeWithTransaction(operation)     // Single operation
static async executeTransaction(operations)        // Multiple operations
static async executeWithRetry(operation, retries) // Retry on transient errors

// Utility methods
static validateTransactionPrerequisites(options)   // Pre-transaction validation
static isRetryableError(error)                    // Error classification
static getTransactionStats()                      // Performance monitoring
```

**Features**:

- ✅ **Atomicity**: Operations complete fully or not at all
- ✅ **Consistency**: Database maintains valid state
- ✅ **Isolation**: Concurrent operations don't interfere
- ✅ **Durability**: Committed changes persist
- ✅ **Retry Logic**: Automatic handling of transient failures
- ✅ **Error Classification**: Smart error categorization

**Usage Example**:

```javascript
const result = await TransactionService.executeWithTransaction(
  async (session) => {
    const enrollment = await Enrollment.create(data, { session });
    await Course.findByIdAndUpdate(
      courseId,
      { $inc: { enrollmentCount: 1 } },
      { session }
    );
    return enrollment;
  }
);
```

### 📚 CourseService (`CourseService.js`)

Course management business logic:

```javascript
// Course CRUD operations
static async getCourses(options)                  // Paginated course listing
static async getCourseById(courseId, userId)      // Course details with enrollment status
static async createCourse(courseData, instructorId) // Course creation
static async updateCourse(courseId, updateData, instructorId) // Course updates
static async deleteCourse(courseId, instructorId) // Safe course deletion

// Course interactions
static async enrollStudent(courseId, userId)      // Student enrollment with transaction
static async getCourseStats(courseId)            // Course analytics and statistics
```

**Business Rules Enforced**:

- ✅ **Enrollment Limits**: Check course capacity before enrollment
- ✅ **Duplicate Prevention**: Prevent multiple enrollments by same student
- ✅ **Authorization**: Instructor can only modify their own courses
- ✅ **Data Integrity**: Atomic updates to course and enrollment counts
- ✅ **Deletion Safety**: Prevent deletion of courses with active enrollments

**Advanced Features**:

```javascript
// Pagination and filtering
const result = await CourseService.getCourses({
  page: 1,
  limit: 10,
  category: "Programming",
  level: "Beginner",
  search: "javascript",
  sortBy: "rating",
  sortOrder: "desc",
});

// Enrollment with race condition protection
const enrollment = await CourseService.enrollStudent(courseId, userId);
```

### 📝 EnrollmentService (`EnrollmentService.js`)

Enrollment and progress management:

```javascript
// Enrollment management
static async getStudentEnrollments(studentId, options) // Student's enrollments
static async getEnrollmentById(enrollmentId, studentId) // Single enrollment details
static async withdrawEnrollment(enrollmentId, studentId) // Course withdrawal

// Progress tracking
static async updateProgress(enrollmentId, progressData, studentId) // Learning progress
static async submitReview(enrollmentId, reviewData, studentId) // Course reviews

// Analytics
static async getStudentStats(studentId)            // Student learning statistics
```

**Business Rules Enforced**:

- ✅ **Progress Validation**: Ensure valid lesson completion data
- ✅ **Completion Tracking**: Automatic course completion calculation
- ✅ **Review Constraints**: Only allow reviews after course completion
- ✅ **Withdrawal Rules**: Prevent withdrawal from completed courses
- ✅ **Statistics Accuracy**: Real-time stats updates with transactions

**Progress Tracking Example**:

```javascript
const result = await EnrollmentService.updateProgress(
  enrollmentId,
  {
    lessonId: "lesson_123",
    completed: true,
    timeSpent: 1800, // 30 minutes
    score: 95,
  },
  studentId
);

// Automatically updates:
// - Lesson completion status
// - Overall course progress percentage
// - Course completion if 100% reached
// - Course statistics (atomic updates)
```

## Transaction Integration

All services use TransactionService for data consistency:

### Single Operation

```javascript
static async createCourse(courseData, instructorId) {
  return TransactionService.executeWithTransaction(async (session) => {
    const course = await Course.create({
      ...courseData,
      instructor: instructorId,
      enrollmentCount: 0
    }, { session });

    return course;
  });
}
```

### Multiple Operations

```javascript
static async enrollStudent(courseId, userId) {
  return TransactionService.executeWithTransaction(async (session) => {
    // Check course capacity
    const course = await Course.findById(courseId).session(session);
    if (course.enrollmentCount >= course.maxStudents) {
      throw new Error('Course is full');
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      course: courseId,
      student: userId,
      enrollmentDate: new Date()
    }, { session });

    // Update course count
    await Course.findByIdAndUpdate(
      courseId,
      { $inc: { enrollmentCount: 1 } },
      { session }
    );

    return enrollment;
  });
}
```

## Error Handling

Services implement comprehensive error handling:

### Business Rule Violations

```javascript
// Course capacity check
if (course.enrollmentCount >= course.maxStudents) {
  throw new Error("Course is full");
}

// Duplicate enrollment prevention
if (existingEnrollment) {
  throw new Error("Already enrolled in this course");
}

// Authorization validation
if (course.instructor.toString() !== instructorId) {
  throw new Error("Not authorized to update this course");
}
```

### Transaction Error Handling

```javascript
try {
  return await TransactionService.executeWithTransaction(operation);
} catch (error) {
  if (TransactionService.isRetryableError(error)) {
    // Automatic retry for transient errors
    return await TransactionService.executeWithRetry(operation);
  }
  throw error; // Non-retryable errors bubble up
}
```

## Data Validation

Services perform business-level validation:

### Input Validation

```javascript
static validateEnrollmentData(data) {
  if (!data.course || !data.student) {
    throw new Error('Course and student are required');
  }

  if (data.score !== null && (data.score < 0 || data.score > 100)) {
    throw new Error('Score must be between 0 and 100');
  }
}
```

### Business Rule Validation

```javascript
static async validateCourseCreation(courseData, instructorId) {
  // Check instructor permissions
  const instructor = await User.findById(instructorId);
  if (instructor.role !== 'instructor') {
    throw new Error('Only instructors can create courses');
  }

  // Validate course data
  if (courseData.maxStudents < 1) {
    throw new Error('Course must allow at least 1 student');
  }
}
```

## Performance Considerations

### Query Optimization

```javascript
// Efficient pagination with projections
static async getCourses(options) {
  const courses = await Course.find(query)
    .select('title description instructor category level price rating')
    .populate('instructor', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean for read-only operations
}
```

### Aggregation Pipelines

```javascript
// Complex statistics with aggregation
static async getCourseStats(courseId) {
  const stats = await Enrollment.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);

  return stats;
}
```

## Testing Services

Services are thoroughly tested:

### Unit Tests

```javascript
describe("CourseService", () => {
  test("should create course with valid data", async () => {
    const result = await CourseService.createCourse(
      validCourseData,
      instructorId
    );
    expect(result.title).toBe(validCourseData.title);
    expect(result.instructor).toBe(instructorId);
  });

  test("should throw error for invalid instructor", async () => {
    await expect(
      CourseService.createCourse(courseData, invalidInstructorId)
    ).rejects.toThrow("Not authorized");
  });
});
```

### Integration Tests

```javascript
describe("Enrollment Transactions", () => {
  test("should handle concurrent enrollments correctly", async () => {
    const promises = Array(5)
      .fill()
      .map(() => CourseService.enrollStudent(courseId, uniqueUserId));

    const results = await Promise.allSettled(promises);
    // Verify only valid enrollments succeeded
  });
});
```

## Best Practices

1. **🔒 Always Use Transactions**: For operations affecting multiple documents
2. **✅ Validate Early**: Check business rules before database operations
3. **🚨 Handle Errors Gracefully**: Provide meaningful error messages
4. **📊 Return Structured Data**: Consistent response formats
5. **⚡ Optimize Queries**: Use projections, indexes, and lean queries
6. **🧪 Test Thoroughly**: Unit tests for logic, integration tests for transactions
7. **📝 Document Complex Logic**: Clear comments for business rules

## Monitoring and Metrics

Services support monitoring through:

```javascript
// Transaction statistics
const stats = TransactionService.getTransactionStats();

// Performance logging
console.time("enrollment-operation");
const result = await EnrollmentService.updateProgress(data);
console.timeEnd("enrollment-operation");

// Error tracking
if (error.isBusinessError) {
  logger.warn("Business rule violation", { error, context });
} else {
  logger.error("System error", { error, stack: error.stack });
}
```

## Future Enhancements

- **📊 Advanced Analytics**: More sophisticated reporting and insights
- **🔄 Caching Layer**: Redis integration for frequently accessed data
- **📡 Event System**: Pub/sub for loose coupling between services
- **🤖 AI Integration**: Intelligent recommendations and analytics
- **📈 Performance Monitoring**: Detailed metrics and alerting
- **🔧 Configuration**: External configuration for business rules
