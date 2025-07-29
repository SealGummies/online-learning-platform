# Services

> All service layer files in this directory have been fully refactored based on the simplified models (see models/README.md). All redundant fields, complex business logic, and unrelated statistics have been removed. All aggregation, statistics, and field references are strictly consistent with the models.

## Simplification Principles

- Only business logic consistent with the models is retained
- All statistics and analytics are implemented using aggregation pipelines
- No more profile, progress, stats, paymentDetails, review, or other redundant fields
- All populate, aggregation, and filter fields are kept in sync with the models
- Only core CRUD, progress, enrollment, and exam basic features are retained

## Main Service Files

- `UserService.js`: User registration, login, info management, statistics
- `CourseService.js`: Course management, enrollment, course statistics
- `EnrollmentService.js`: Enrollment management, progress, grades
- `LessonService.js`: Course content management, progress update
- `ExamService.js`: Exam basic info management (no question bank/answering/grading)
- `AuthService.js`: Authentication, registration, login, password management
- `AnalyticsService.js`: Platform aggregation/statistics/analytics (only new model fields)
- `TransactionService.js`: Transaction wrapper

## Adaptation Notes

- All service method inputs/outputs, aggregation, and populate fields are strictly consistent with the models
- All statistics, progress, grades, etc. are implemented via aggregation pipelines, with no redundant storage
- For detailed refactor logs, see `../logs/services_update.log`

If you need to extend business logic, please refer to the models structure first to maintain data consistency and simplicity.
