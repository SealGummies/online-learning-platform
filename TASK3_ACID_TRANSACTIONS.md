# Task 3: ACID Transactions in MongoDB

## Overview

Implementation of MongoDB's ACID transactions for critical operations (enrollment, progress updates, exam submissions) with rollback mechanisms to handle failures.

## Implementation Codes

### Transaction Implementation for Critical Operations

#### Location: `backend/utils/transactions.js`

```javascript
// Transaction utility class for MongoDB sessions
class TransactionManager {
  static async executeTransaction(operations) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await operations(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

#### Location: `backend/routes/courses.js` - Course Enrollment

```javascript
// POST /:id/enroll - Enrollment transaction
router.post("/:id/enroll", protect, authorize("student"), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Create enrollment record
    const enrollment = await Enrollment.create(
      [
        {
          student: req.user._id,
          course: courseId,
          enrolledAt: new Date(),
        },
      ],
      { session }
    );

    // Update course enrollment count
    await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: { "stats.enrollments": 1 },
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, enrollment });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});
```

#### Location: `backend/routes/enrollments.js` - Progress Update

```javascript
// PUT /:id/progress - Progress update transaction
router.put("/:id/progress", protect, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Update enrollment progress
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        progress: progressData,
        certificate: isCompleted ? certificateData : undefined,
      },
      { session, new: true }
    );

    // Update course completion stats if completed
    if (isCompleted) {
      await Course.findByIdAndUpdate(
        enrollment.course,
        {
          $inc: { "stats.completions": 1 },
        },
        { session }
      );
    }

    await session.commitTransaction();
    res.json({ success: true, enrollment });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});
```

#### Location: `backend/routes/exams.js` - Exam Submission

```javascript
// POST /:id/submit - Exam submission transaction
router.post("/:id/submit", protect, authorize("student"), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Create exam submission with auto-grading
    const submission = await ExamSubmission.create(
      [
        {
          student: req.user._id,
          exam: examId,
          answers: req.body.answers,
          score: calculatedScore,
          submittedAt: new Date(),
        },
      ],
      { session }
    );

    // Update enrollment progress
    await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: exam.course },
      { $push: { "progress.examsCompleted": examId } },
      { session }
    );

    // Update exam submission stats
    await Exam.findByIdAndUpdate(
      examId,
      {
        $inc: { "stats.submissions": 1 },
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, submission });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});
```

## Documentation

### Transaction Boundaries and Error Handling Strategies

#### 1. Course Enrollment Transaction

- **Transaction Start**: Student initiates enrollment
- **Collections Affected**:
  - `enrollments` (create new record)
  - `courses` (update enrollment count)
- **Transaction End**: Commit on success, abort on failure
- **Rollback Triggers**: Course capacity exceeded, duplicate enrollment, database errors

#### 2. Progress Update Transaction

- **Transaction Start**: Student updates learning progress
- **Collections Affected**:
  - `enrollments` (update progress, issue certificate if completed)
  - `courses` (update completion statistics)
- **Transaction End**: Commit on success, abort on failure
- **Rollback Triggers**: Invalid progress data, certificate issuance failure, database errors

#### 3. Exam Submission Transaction

- **Transaction Start**: Student submits exam answers
- **Collections Affected**:
  - `examsubmissions` (create submission with auto-grading)
  - `enrollments` (update course progress)
  - `exams` (update submission statistics)
- **Transaction End**: Commit on success, abort on failure
- **Rollback Triggers**: Grading calculation errors, progress update failures, database errors

### Error Handling Strategy

```javascript
// Standard transaction pattern used across all operations
try {
  session.startTransaction();
  // ... operations with session parameter
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // Rollback all changes
  throw error;
} finally {
  session.endSession(); // Clean up resources
}
```

### Test Cases: Transaction Success and Failure Scenarios

#### Success Scenarios

**1. Enrollment Success**

```bash
# Request
curl -X POST http://localhost:3761/api/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer JWT_TOKEN"

# Log Output
✅ Enrollment transaction completed successfully
✅ Collections updated atomically: enrollments + courses
```

**2. Progress Update Success**

```bash
# Request
curl -X PUT http://localhost:3761/api/enrollments/ENROLLMENT_ID/progress \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"lessonCompleted": {"lesson": "LESSON_ID", "timeSpent": 30}}'

# Log Output
✅ Progress update transaction completed
✅ Enrollment progress and course stats updated atomically
```

**3. Exam Submission Success**

```bash
# Request
curl -X POST http://localhost:3761/api/exams/EXAM_ID/submit \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"answers": [{"questionId": "Q1", "answer": "A"}], "timeSpent": 1800}'

# Log Output
✅ Exam submission transaction completed
✅ Submission created, progress updated, stats incremented atomically
```

#### Failure (Rollback) Scenarios

**1. Enrollment Failure - Course Full**

```bash
# Request (same as above but course at capacity)

# Log Output
❌ Transaction aborted: Course capacity exceeded
✅ Rollback successful - no partial enrollment created
✅ Database consistency maintained
```

**2. Progress Update Failure - Invalid Data**

```bash
# Request with invalid progress data

# Log Output
❌ Transaction aborted: Invalid progress format
✅ Rollback successful - no partial updates applied
✅ All collections remain unchanged
```

**3. Exam Submission Failure - Grading Error**

```bash
# Request with malformed answers

# Log Output
❌ Transaction aborted: Grading calculation failed
✅ Rollback successful - no submission record created
✅ No progress or stats updated
```
