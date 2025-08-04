# Tests Directory

This directory contains all test files for the Online Learning Platform backend application.

## Overview

The tests are organized into:

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test API endpoints and database operations
- **Setup Files**: Configuration for the test environment

## Test Structure

```
tests/
├── setup.js                  # Test environment setup
├── test-connection.js        # Connection and environment tests
├── test-atlas.js             # MongoDB Atlas connection tests
├── test-server.js            # Server startup and healthcheck tests
├── integration/              # Integration tests for API endpoints and business logic
│   ├── AnalyticsQueries.test.js
│   ├── APIEndpoints.test.js
│   ├── BusinessLogic.test.js
│   ├── ServiceLogic.test.js
│   └── Transactions.test.js
└── unit/                     # Unit tests for services and utilities
    ├── AuthService.test.js
    ├── CourseService.test.js
    ├── EnrollmentService.test.js
    ├── PasswordConfig.test.js
    └── UserService.test.js
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```