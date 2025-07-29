# Controllers

> All controllers in this directory are fully aligned with the simplified models and service layer. Only core HTTP endpoints are retained, and all request/response fields are consistent with the new models.

## Principles

- Controllers only handle HTTP request/response logic and delegate all business logic to the service layer.
- All request parameters and response fields strictly match the simplified models (see ../models/README.md).
- No legacy, redundant, or unsupported fields or endpoints remain.
- All comments and documentation are in English.

## Main Controllers

- `UserController.js`: Admin user management (CRUD, status, statistics, enrollments, role-based queries)
- `CourseController.js`: Course CRUD, instructor and student course operations, enrollment
- `EnrollmentController.js`: Student enrollment management, progress update, withdrawal, statistics
- `LessonController.js`: Lesson CRUD, completion, progress, statistics, reordering
- `ExamController.js`: Exam CRUD and statistics (no question/attempt/answer logic)
- `AuthController.js`: User registration, login, password management, profile update
- `AnalyticsController.js`: Platform and user analytics, all based on new model fields

## Response Patterns

- All endpoints return JSON with `{ success, data, message, ... }` structure
- Error handling and status codes follow best practices

## Example Endpoint

```json
{
  "success": true,
  "data": {
    /* resource or list */
  },
  "message": "Operation completed successfully"
}
```

For details on each controller's endpoints, see the corresponding JS file. All logic is now fully consistent with the simplified models and service layer.
